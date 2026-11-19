#!/usr/bin/env python3
"""Convert the sealed Markdown scene scripts (docs/sealed/script/*.md) into game dialogue data.

Output: src/content/dialogue/act1/<scene>.js, each exporting a ROT13-encoded JSON string so the
game's source doesn't spoil the story either (decoded at runtime by src/engine/dialogue.js).

Parsed (best effort; the drafts use slightly different conventions):
  ### node: <id>                         node start
  #### if <cond> / else / otherwise / always / end    conditional blocks
  **NAME:** text   /  INSPECT: text      lines
  *set x[=v]* / *give item [n]* / *standing faction +n*   effects
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
LINE = re.compile(r"^\*\*([A-Z][A-Z .'\-]*?)(?:\s*\([^)]*\))?:\*\*\s*(.+)$")
INSPECT = re.compile(r"^\**INSPECT:?\**:?\s*(.+)$")
EFFECT = re.compile(r"^\*\s*(sets?|gives?|standing|pay)\s+([^*]+)\*\s*$", re.I)   # "*Set x*" and "*Sets x.*" both apply
GOTO = re.compile(r"Next:\**\s*->\s*`?([\w.\-]+)`?")
BAREJUMP = re.compile(r"^->\s*`?([\w.\-]+)`?\s*$")
CONDJUMP = re.compile(r"^-\s+((?:\[[^\]]*\]\s*)+)->\s*`?([\w.\-]+)`?\s*$")
CHOICE = re.compile(r"^-\s+((?:\[[^\]]*\]\s*)*)(.+?)\s*->\s*`?([\w.\-]+)`?\s*$")
COND = re.compile(r"\[([^\]]*)\]")


def rot13(s): return codecs.encode(s, "rot_13")


SCOPE_FILE = re.compile(r"^Scope:\s*(all|nearby|self)\s*$", re.I)
SCOPE_NODE = re.compile(r"^\*(Scope|Decider):\s*([a-z ]+?)\.?\*$", re.I)

def parse(text):
    nodes, order, node, cond, in_choices = {}, [], None, None, False
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
    for raw in joined:
        line = raw.strip()
        fs = SCOPE_FILE.match(line)
        if fs and node is None: meta['scope'] = fs.group(1).lower(); continue
        ns = SCOPE_NODE.match(line)
        if ns and node is not None: node[ns.group(1).lower()] = ns.group(2).strip().lower(); continue
        m = NODE.match(line)
        if m:
            node = {"lines": [], "choices": [], "go": None, "effects": []}
            nodes[m.group(1)] = node; order.append(m.group(1)); cond = None; in_choices = False
            outer, chain, inner_if = None, [], None
            continue
        if node is None or not line:
            continue
        if line.startswith("## ") or line.startswith("# "):
            node = None; continue
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
            node["effects"].append({"op": "set", "arg": ms.group(1).strip(), "if": cond}); continue
        e = EFFECT.match(line)
        if e:
            node["effects"].append({"op": e.group(1).lower().rstrip("s") if e.group(1).lower() != "standing" else "standing", "arg": e.group(2).strip().strip("`"), "if": cond}); continue
        m = LINE.match(line)
        if m:
            node["lines"].append({"who": " ".join(w.capitalize() for w in m.group(1).split()), "text": m.group(2).strip(), "if": cond})   # not .title(): it gives "Manuel'S Phone"; in_choices = False; continue
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
