#!/usr/bin/env python3
"""Convert the sealed Markdown scene scripts (docs/sealed/script/*.md) into game dialogue data.

Output: src/content/dialogue/act1/<scene>.js, each exporting a ROT13-encoded JSON string so the
game's source doesn't spoil the story either (decoded at runtime by src/engine/dialogue.js).

Parsed (best effort; the drafts use slightly different conventions):
  ### node: <id>                         node start
  #### if <cond> / else / otherwise / always / end    conditional blocks
  **NAME:** text   /  INSPECT: text      lines
  > reveal: act1.quest.clue            flag set when the preceding line is fully shown
  > do: <staging>                       a staging cue: the next line gets "cue": "<node>.<n>", and the
                                        cutscene engine plays src/content/stage/<scene>.js cues[that key]
                                        while the line is on screen (Michael, D-022)
  *set x[=v]* / *give item [n]* / *standing faction +n*   effects
  *Set `a`, `b = 2`. If the timeout fired ..., set `c`.*    each backticked flag; a "timeout" sentence (or
                                         "`c` true or false") sets it only when the choice was the timed one
  *Trigger: ... Set `x = 2`.*            the Set sentence inside a trigger note applies on entering the node
  #### if A / its line / #### if B / its line  (each line right under its if, no blank line): a run of one-line
                                         alternatives; the lines after the run play for everyone
  Next: -> id   (anywhere on a line)    jump
  Choices:  - [cond] "text" -> id         choices
Everything else (stage directions, notes) is skipped.

Usage: python3 tools/dialogue/convert.py
"""
import codecs, json, re, sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "docs" / "sealed" / "script"
OUT = REPO / "src" / "content" / "dialogue" / "act1"

NODE = re.compile(r"^###\s+node:\s*`?([\w.\-]+)`?")
BLOCK = re.compile(r"^(####|#####)\s+(if|else|otherwise|always|end|then)\b[,:]?\s*(.*)$", re.I)
LINE = re.compile(r"^\*\*([A-Z][A-Z0-9 .'\-]*?)(?:\s*\([^)]*\))?:\*\*\s*(.+)$")
INSPECT = re.compile(r"^\**INSPECT:?\**:?\s*(.+)$")
EFFECT = re.compile(r"^\*\s*(sets?|gives?|standing|pay)\s+([^*]+)\*\s*$", re.I)   # "*Set x*" and "*Sets x.*" both apply
REVEAL = re.compile(r"^>\s*reveal:\s*(act\d+\.[\w.\-]+)\s*$")
GOTO = re.compile(r"Next:\**\s*->\s*`?([\w.\-]+)`?")
BAREJUMP = re.compile(r"^->\s*`?([\w.\-]+)`?\s*$")
CONDJUMP = re.compile(r"^-\s+((?:\[[^\]]*\]\s*)+)->\s*`?([\w.\-]+)`?\s*$")
CHOICE = re.compile(r"^-\s+((?:\[[^\]]*\]\s*)*)(.+?)\s*->\s*`?([\w.\-]+)`?\s*$")
COND = re.compile(r"\[([^\]]*)\]")


def rot13(s): return codecs.encode(s, "rot_13")


SCOPE_FILE = re.compile(r"^Scope:\s*(all|nearby|self)\s*$", re.I)
SCOPE_NODE = re.compile(r"^\*(Scope|Decider):\s*([a-z ]+?)\.?\*$", re.I)
MODE_FILE = re.compile(r"^Mode:\s*(story|free)\s*$", re.I)        # whole scene: the world waits (story) or keeps going (free)
MODE_NODE = re.compile(r"^\*Mode:\s*(story|free)\.?\*$", re.I)     # one node, overrides the scene (Trevor #528)

TICK = re.compile(r"`([^`]+)`")


def set_effects(body, cond):
    """Effects from a writer's Set note. Plain sentences set their backticked flags; a sentence about the
    timeout (or "`x` true or false") sets x on a timed-out choice and clears it on a pressed one
    (the dialogue runtime records which: flag dlg.timedOut)."""
    out = []
    both = lambda x, y: " && ".join(c for c in (x, y) if c) or None
    for sent in re.split(r"(?<=[.!?])\s+", body.strip().strip("*")):
        flags = TICK.findall(sent)
        if not flags:
            continue
        pairs = re.findall(r"`([^`]+)`\s+true or false", sent, re.I)   # just the flag that's "true or false"
        timed = re.search(r"\btimeout\b", sent, re.I)
        if pairs and not timed:
            for f in flags:
                name = f.split("=")[0].strip()
                if f in pairs:
                    out.append({"op": "set", "arg": name, "if": both(cond, "flag dlg.timedOut")})
                    out.append({"op": "set", "arg": f"{name} = off", "if": both(cond, "not flag dlg.timedOut")})
                else:
                    out.append({"op": "set", "arg": f.strip(), "if": cond})
        elif timed:
            for f in flags:
                name = f.split("=")[0].strip()
                out.append({"op": "set", "arg": name, "if": both(cond, "flag dlg.timedOut")})
                out.append({"op": "set", "arg": f"{name} = off", "if": both(cond, "not flag dlg.timedOut")})
        elif re.match(r"^\s*(?:\w+:.*?)?\bsets?\b", sent, re.I) or re.match(r"^\s*sets?\b", sent, re.I):
            for f in flags:
                out.append({"op": "set", "arg": f.strip(), "if": cond})
    return out


def parse(text):
    nodes, order, node, cond, in_choices = {}, [], None, None, False
    node_id, cue_n, cue_pending = None, 0, None   # > do: cues, numbered per node
    last_caption = None
    meta = {}
    outer, chain, inner_if = None, [], None     # #### block state; ##### blocks nest inside it
    # Stage directions are often hard-wrapped over several lines: *Pork opens his hand. / The balloon
    # rises...*. Join each such paragraph into one line so it is not silently dropped.
    joined, buf = [], None
    for raw in text.splitlines():
        t = raw.strip()
        if buf is not None:
            if not t: joined.append(buf); joined.append(""); buf = None; continue   # never closed: leave as is
            buf += " " + t
            if t.endswith("*") and not t.endswith("**"): joined.append(buf); buf = None
            continue
        if t.startswith("*") and not t.startswith("**") and not (t.endswith("*") and len(t) > 1) and not t.startswith("* "):
            buf = t; continue
        joined.append(raw)
    if buf is not None: joined.append(buf)
    # Spoken lines wrap too: **NAME:** text... / ...rest. Glue plain continuation lines onto the line
    # above, or the box shows the line cut mid-sentence.
    glued = []
    for raw in joined:
        t = raw.strip()
        if (t and glued and LINE.match(glued[-1].strip())
                and not re.match(r"^(\*|-|#|>|<!--|\||Choices|Next:|INSPECT)", t, re.I)):
            glued[-1] = glued[-1].rstrip() + " " + t; continue
        glued.append(raw)
    joined = glued
    tight = None     # a one-line #### if (its line right under it): the state to restore after that one line
    one_run = None   # the state before a run of one-line alternatives
    for idx, raw in enumerate(joined):
        line = raw.strip()
        if tight is not None and tight["done"] and line and not line.startswith(">"):
            cond, outer, chain, inner_if = tight["cond"], tight["outer"], list(tight["chain"]), tight["inner_if"]; tight = None
            if not BLOCK.match(line): one_run = None   # the run of alternatives is over: lines for everyone
        fs = SCOPE_FILE.match(line)
        if fs and node is None: meta['scope'] = fs.group(1).lower(); continue
        fm = MODE_FILE.match(line)
        if fm and node is None: meta['mode'] = fm.group(1).lower(); continue
        nm = MODE_NODE.match(line)
        if nm:
            if node is not None: node['mode'] = nm.group(1).lower()
            else: meta['mode'] = nm.group(1).lower()
            continue
        ns = SCOPE_NODE.match(line)
        if ns and node is not None: node[ns.group(1).lower()] = ns.group(2).strip().lower(); continue
        m = NODE.match(line)
        if m:
            node = {"lines": [], "choices": [], "go": None, "effects": []}
            nodes[m.group(1)] = node; order.append(m.group(1)); cond = None; in_choices = False
            node_id, cue_n, cue_pending = m.group(1), 0, None
            outer, chain, inner_if = None, [], None
            tight = one_run = None
            continue
        if node is None or not line:
            continue
        if line.startswith("## ") or line.startswith("# "):
            node = None; continue
        reveal = REVEAL.match(line)
        if reveal and node["lines"] and not in_choices:
            node["lines"][-1].setdefault("reveal", []).append(reveal.group(1))
            continue
        if re.match(r"^>\s*do:", line):
            if cue_pending is None: cue_pending = f"{node_id}.{cue_n}"; cue_n += 1
            continue
        es = re.match(r"^>\s*es:\s*(.+)$", line)
        if es:
            txt = es.group(1).strip().strip('"').strip()
            if not in_choices and last_caption and last_caption[0] is node and last_caption[2] == len(node["lines"]) and last_caption[2] - last_caption[1] > 1:
                # a long caption was split into box-sized pieces: split the Spanish the same way
                k = last_caption[2] - last_caption[1]
                sents = re.split(r"(?<=[.!?:])\s+", txt); per = max(1, -(-len(sents) // k))
                chunks = [" ".join(sents[i:i + per]) for i in range(0, len(sents), per)]
                chunks = (chunks + [""] * k)[:k]
                if len(sents) > k * per: chunks[-1] = " ".join(sents[(k - 1) * per:])
                for i, c in enumerate(chunks): node["lines"][last_caption[1] + i]["es"] = c or "…"
                continue
            target = (node["choices"][-1] if in_choices and node["choices"] else (node["lines"][-1] if node["lines"] else None))
            if target is not None: target["es"] = txt
            continue
        b = BLOCK.match(line)
        if b:
            nested, kind, rest = len(b.group(1)) == 5, b.group(2).lower(), b.group(3).strip()
            nxt = joined[idx + 1].strip() if idx + 1 < len(joined) else ""
            if kind != "if" or nested:
                one_run = None
            elif nxt and LINE.match(nxt):
                # A run of one-line alternatives: "#### if A" / its line / "#### if B" / its line, then lines for
                # everyone. Each sibling governs only the line right under it when the next thing after that line
                # is another sibling, or when it follows one-liner siblings. A lone "#### if" keeps block rules.
                after = next((joined[j].strip() for j in range(idx + 2, len(joined)) if joined[j].strip() and not joined[j].strip().startswith(">")), "")
                sib = BLOCK.match(after)
                key = lambda c: re.sub(r"^(?:not\s+|!)?(?:flag\s+)?", "", (c or "").strip(), flags=re.I).split()[0].split("=")[0].split(">")[0].split("<")[0] if c and c.strip() else ""
                same = sib and len(sib.group(1)) == 4 and sib.group(2).lower() in ("else", "otherwise") or (sib and len(sib.group(1)) == 4 and sib.group(2).lower() == "if" and key(sib.group(3)) == key(rest))
                if one_run is not None and key(rest) != one_run["key"]: one_run = None   # a new question: not part of the run
                if same or one_run is not None:
                    if one_run is None: one_run = {"cond": cond, "outer": outer, "chain": list(chain), "inner_if": inner_if, "key": key(rest)}
                    tight = {**{k: v for k, v in one_run.items() if k != "key"}, "done": False}
                    chain.append(rest or None)
                    cond = " && ".join(c for c in (one_run["outer"], rest or None) if c) or None
                    in_choices = False
                    continue
            else:
                one_run = None
            both = lambda x, y: " && ".join(c for c in (x, y) if c) or None
            if nested:
                # ##### if / else / end inside a #### block: combined with the enclosing condition.
                if kind == "if": inner_if = rest or None; cond = both(outer, inner_if)
                elif kind in ("else", "otherwise"): cond = both(outer, f"not ({inner_if})" if inner_if else None)
                else: inner_if = None; cond = outer
            else:
                inner_if = None
                # "else" closes the whole run of sibling ifs before it (if A / if B / else = neither).
                if kind == "if": outer = rest or None; chain.append(outer)
                elif kind in ("else", "otherwise"): outer = " && ".join(f"not ({c})" for c in chain if c) or None; chain = []
                else: outer = None; chain = []
                cond = outer
            in_choices = False
            continue
        if line.lower().startswith("choices"):
            # A choice list closes any open "#### if speaker=..." block: the drafts write per-speaker
            # reactions, then one shared list. (Per-choice conditions go in [brackets].)
            in_choices = True; cond = None; outer, chain, inner_if = None, [], None; continue
        # Jumps without the "Next:" label, as the scenes mostly write them:
        #   -> node_id                      (unconditional; honours an enclosing #### if block)
        #   - [cond] -> node_id             (one of a list of conditional jumps; [else] is the fallback)
        cj = CONDJUMP.match(line)
        if cj:
            conds = [x.strip() for x in COND.findall(cj.group(1)) if x.strip()]
            if cond: conds.append(cond)
            conds = [c for c in conds if c.lower() not in ("else", "otherwise", "always")]
            if conds: node.setdefault("gos", []).append({"if": " && ".join(conds), "go": cj.group(2)})
            else: node["go"] = node["go"] or cj.group(2)
            continue
        g = BAREJUMP.match(line) or GOTO.search(line)
        if g and not line.startswith("- "):
            if cond and node["go"] is None: node.setdefault("gos", []).append({"if": cond, "go": g.group(1)})
            else: node["go"] = node["go"] or g.group(1)
            continue
        if in_choices and line.startswith("- "):
            c = CHOICE.match(line)
            if c:
                conds = [x.strip() for x in COND.findall(c.group(1)) if x.strip()]
                if cond: conds.append(cond)
                text_ = c.group(2).strip().strip('"').strip()
                # `[timeout Ns] *(stage note)*` is the "nobody acts" path: offered as "Let it ring.", and the
                # dialogue box counts N seconds down and picks it if nobody chooses.
                timeout = None
                for x in conds:
                    mt = re.match(r"timeout\s*(\d+)", x, re.I)
                    if mt: timeout = int(mt.group(1))
                if any(x.lower().startswith("timeout") for x in conds):
                    conds = [x for x in conds if not x.lower().startswith("timeout")]
                    text_ = "Let it ring."
                ch = {"text": text_, "go": c.group(3), "if": " && ".join(conds) or None}
                if timeout: ch["timeout"] = timeout   # the dialogue box counts down and picks this itself
                node["choices"].append(ch)
            continue
        # A long italic note that STARTS with "Sets `a`, `b = 2`." and runs on over several lines:
        # apply the backticked flags, skip the prose.
        ms = re.match(r"^\*\s*sets?\s+((?:`[^`]+`(?:,\s*(?:and\s+)?)?)+)", line, re.I)
        if ms and not line.rstrip().endswith("*"):
            node["effects"].extend(set_effects(line, cond)); continue
        if re.match(r"^\*\s*sets?\s+`", line, re.I):
            node["effects"].extend(set_effects(line, cond)); continue
        if re.match(r"^\*\s*Trigger:", line) and re.search(r"\bSet\s+`", line):
            node["effects"].extend(set_effects(re.sub(r"^.*?(?=\bSet\s+`)", "", line.strip("*")), cond)); continue
        e = EFFECT.match(line)
        if e:
            node["effects"].append({"op": e.group(1).lower().rstrip("s") if e.group(1).lower() != "standing" else "standing", "arg": e.group(2).strip().strip("`"), "if": cond}); continue
        m = LINE.match(line)
        if m:
            node["lines"].append({"who": " ".join(w.capitalize() for w in m.group(1).split()), "text": m.group(2).strip(), "if": cond})   # not .title(): it gives "Manuel'S Phone"
            if cue_pending: node["lines"][-1]["cue"] = cue_pending; cue_pending = None
            if tight is not None: tight["done"] = True
            continue
        m = INSPECT.match(line)
        if m and line.upper().lstrip("*").startswith("INSPECT"):
            node["lines"].append({"who": None, "text": m.group(1).strip(), "if": cond}); continue
        # Stage directions (*His breath.*) become narration captions, never spoken. Writer notes
        # (*Trigger: ...*, *Returning ...*, anything with backticks or a jump) are skipped.
        sd = re.match(r"^\*([^*].*?)\*$", line)
        if sd and re.match(r"^TEXT:\s*", sd.group(1).strip()):
            # *TEXT: ...* is a text message: shown as one, and kept in the phone's message list.
            node["lines"].append({"who": "Text: John Pork", "text": re.sub(r"^TEXT:\s*", "", sd.group(1).strip()), "if": cond, "sms": True}); continue
        if sd:
            body = sd.group(1).strip()
            # Conservative: anything that smells like a writer note stays out (see tools/writing/captions.py).
            NOTEY = r"\b(player|players|flag|seed|variant|node|scene|branch|beat|choice|trigger|speaker|party|engine|cutscene|camera pans|we see|fade|cut to|TODO|TBD|optional|if the|unless|otherwise|act ?[123]|lead [abc]|stage \d|npc)\b|\[|\]|=|\{|\}"
            if not re.match(r"^(Trigger|Returning|Note|After|If |When the|Sets|Reads|Conditions|Effect)", body) and "`" not in body and "->" not in body and len(body) < 700 and not re.search(NOTEY, body, re.I):
                start_len = len(node["lines"])
                piece = ""
                for sent in re.split(r"(?<=[.!?:])\s+", body):
                    if piece and len(piece) + len(sent) > 210:
                        node["lines"].append({"who": None, "text": piece, "if": cond, "narr": True}); piece = sent
                    else: piece = (piece + " " + sent).strip()
                if piece: node["lines"].append({"who": None, "text": piece, "if": cond, "narr": True})
                last_caption = (node, start_len, len(node["lines"]))
            continue
    for n in nodes.values():
        n["effects"] = n["effects"] or None
        if not n.get("gos"): n.pop("gos", None)
    parse.meta = meta
    return order, nodes


def barks(text):
    """Bark tables (| id | speaker | trigger | line |, sometimes with a module column): kept as data, so the game
    can play the ones whose trigger it understands ("<node>, Ns in") and none are silently dropped."""
    out, cols = [], None
    for raw in text.splitlines():
        t = raw.strip()
        if not t.startswith("|"):
            cols = None if not t else cols
            continue
        cells = [c.strip() for c in t.strip("|").split("|")]
        if cells and cells[0] == "id":
            cols = [c.lower() for c in cells]; continue
        if not cols or set(cells) <= {"", "---"} or all(re.match(r"^:?-+:?$", c) for c in cells if c):
            continue
        row = dict(zip(cols, cells))
        if not {"id", "speaker", "trigger", "line"} <= row.keys():
            continue
        b = {"id": row["id"].strip("`"), "who": row["speaker"], "trigger": row["trigger"].replace("`", ""), "text": row["line"].strip().strip('"').strip()}
        if row.get("module"): b["module"] = row["module"]
        out.append(b)
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for f in sorted(SRC.glob("[0-9]*.md")):
        body = f.read_text()
        if body.startswith("<!-- SEALED"):
            body = body.split("-->\n", 1)[1]
        order, nodes = parse(rot13(body))
        meta = parse.meta
        scene = f.stem.split("-", 1)[1].replace("-", "_")
        data = {"scene": scene, "start": order[0] if order else None, "order": order, "nodes": nodes, **meta}
        bk = barks(rot13(body))
        if bk: data["barks"] = bk
        payload = rot13(json.dumps(data, ensure_ascii=False))
        (OUT / f"{scene}.js").write_text(
            "// GENERATED by tools/dialogue/convert.py from docs/sealed/script. Do not edit by hand.\n"
            "// ROT13-encoded so the source doesn't spoil the story; decoded by src/engine/dialogue.js.\n"
            f"export default {json.dumps(payload, ensure_ascii=False)};\n")
        lines = sum(len(n["lines"]) for n in nodes.values()); total += len(nodes)
        dead = sorted({c["go"] for n in nodes.values() for c in n["choices"] if c["go"] not in nodes and c["go"] != "END"} |
                      {n["go"] for n in nodes.values() if n["go"] and n["go"] not in nodes})
        print(f"{scene:22s} nodes={len(nodes):3d} lines={lines:4d} dangling={len(dead)}")
    print(f"total nodes: {total}")


if __name__ == "__main__":
    main()
