#!/usr/bin/env python3
"""Flag lines in the script that match the banned patterns in docs/lore/WRITING.md.

It reads the sealed scenes (docs/sealed/script/*.md), decodes them in memory, and prints counts per
scene. With --show it also prints the offending lines, which are spoilers: don't paste that output
anywhere public. It checks spoken lines only (**NAME:** ...), not stage directions.

A flag is a prompt to look, not a verdict: some hits are fine in context. The rules come from
docs/org/CHECKLISTS.md (section A): scene checks are opening-pronoun (the first line leans on a pronoun) and
unread-flag (a flag the scene sets that nothing reads: if a choice sets it, the choice changes nothing).

Usage: python3 tools/writing/lint.py            counts only (safe to share)
       python3 tools/writing/lint.py --show the_call
"""
import codecs
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "docs" / "sealed" / "script"
LINE = re.compile(r"^\*\*([A-Z][A-Z .'\-]*?)(?:\s*\([^)]*\))?:\*\*\s*(.+)$")

RULES = {
    "not-x-its-y": re.compile(r"\b(?:isn't|aren't|wasn't|not|never)\b[^.?!]{0,60}[.,;:]\s*(?:it's|it is|it was|they're|that's|he's|she's|i'm|you're|we're)\b", re.I),
    "not-because": re.compile(r"\bnot because\b", re.I),
    "triplet": re.compile(r"\b\w+, \w+,? and \w+\b"),
    "named-feeling": re.compile(r"\bI(?:'m| am| feel| felt)\s+(?:so |really |just )?(?:scared|afraid|sad|lonely|happy|angry|sorry for|worried|ashamed|grateful)\b", re.I),
    "grand-noun": re.compile(r"\b(?:weight|echo(?:es)?|silence|void|tapestry|testament|liminal|something shifted)\b", re.I),
    "aphorism": re.compile(r"^(?:Sometimes|Everyone|Everything|Nothing|People|Life|The truth is|In the end)\b[^?]*\.$"),
    "long-line": re.compile(r"^(?:\S+\s+){20,}\S+"),   # Trevor: keep dialogue brief; flag anything over 20 words
    # "It doesn't do this. It never did." A denial followed by a short reinforcing echo (Trevor flagged it).
    "denial-echo": re.compile(r"\b(?:doesn't|don't|didn't|isn't|wasn't|won't|can't|never|no longer)\b[^.?!]{0,60}[.!]\s+(?:(?:It|He|She|They|That|This|You|We|I)\s+)?(?:never|didn't|doesn't|wasn't|isn't|won't|hasn't|hadn't|still doesn't|still isn't)\b[^.?!]{0,30}[.!]", re.I),
    # The broader cadence: a statement, then a short sentence that turns it with a negation.
    "negation-turn": re.compile(r"[.!]\s+(?:It|He|She|They|That|This|Nobody|No one|Nothing)(?:'s| is| was| has| had)?\s+(?:just\s+|still\s+|simply\s+)?(?:not|never|no|doesn't|didn't|isn't|wasn't|won't|hasn't)\b[^.?!]{0,40}[.!]", re.I),
    # Trevor: always "code rot" / "code rotter" in player-facing text, never bare "rot" or "rotter".
    "bare-rot": re.compile(r"(?<![\w.-])(?<!code )(?<!CODE )(?:rot|rotters?)\b(?![.\w-])", re.I),
    # Trevor: always "John Pork", never just "Pork".
    "bare-pork": re.compile(r"(?<!John )(?<!JOHN )(?<![\w.-])(?:Pork|PORK)\b(?![\w-])"),
    # Mamet: "any time any character is saying to another 'as you know'" (docs/research/dialogue-craft.md).
    "as-you-know": re.compile(r"\b(?:as you know|like I said|as I (?:said|told you)|as we both know)\b", re.I),
    "never-did": re.compile(r"\b(?:It|He|She|They|That)\s+never\s+(?:did|has|had|was|will|does)\.", re.I),
    # Trevor, 2026-11-23: "dont call him Sahur, call him Tung Tung Tung Sahur."
    "bare-sahur": re.compile(r"(?<!\bTung Tung Tung )(?<![\w.-])Sahur\b(?![\w-])", re.I),
}
# Checked on the raw spoken text, before italic asides are stripped (docs/org/CHECKLISTS.md A7, from Michael's
# workshop): a pause is a line break or a `> do:` cue, never a stage direction inside the line.
RAW_RULES = {
    "stage-direction": re.compile(r"\((?:a )?(?:beat|pause|sighs?|laughs?|quietly|softly|whispers?|shrugs?|grins?|smiles?|beat\.)[^)]*\)", re.I),
}
SET_NOTE = re.compile(r"^\*\s*sets?\s+(.*)$", re.I)
TRIGGER_SET = re.compile(r"^\*\s*Trigger:.*?\bSet\s+(`.*)$", re.I)
FLAG_NAME = re.compile(r"[\w.-]+")
QUOTED_FLAG = re.compile(r"`\s*([\w.-]+)\s*(?:=[^`]*)?`")
COND = re.compile(r"(?:^####\s+if\s+(.*)$)|\[([^\]]*)\]")
NODE = re.compile(r"^###\s+node:")
SCENE_NOTE = re.compile(r"^\*\s*(?:(?:mode|scope|decider|trigger)\s*:|sets?\s+|gives?\s+|pay\s+\$|standing\s+\w+\s+\+)", re.I)
NARR = re.compile(r"^\*([^*].*?)\*\s*$")


def code_text():
    """Every JS source except the generated dialogue data: where a flag set by a choice can be read."""
    out = []
    for p in (REPO / "src").rglob("*.js"):
        if "content/dialogue" in str(p):
            continue
        out.append(p.read_text(errors="ignore"))
    return "\n".join(out)


def flag_names(text):
    return {match.rstrip(".") for match in FLAG_NAME.findall(text)}


def assigned_flags(line):
    note = SET_NOTE.match(line) or TRIGGER_SET.match(line)
    if not note:
        return []
    body = note.group(1)
    if body.startswith("`"):
        return QUOTED_FLAG.findall(body)
    flag = FLAG_NAME.match(body)
    return [flag.group(0).rstrip(".")] if flag else []


def scene_checks(text, code, all_conds):
    """Scene-level checks: the opening names someone (A2), and every flag a scene sets is read somewhere (a choice that sets one nothing reads changes nothing) (A6)."""
    hits = {}
    started = False
    for raw in text.splitlines():
        s = raw.strip()
        if NODE.match(s):
            started = True
            continue
        if not started or not s or s.startswith((">", "#")) or SCENE_NOTE.match(s):
            continue
        m, n = LINE.match(s), NARR.match(s)
        first = (m.group(2) if m else n.group(1) if n else "").strip()
        if first:
            if re.match(r"^(?:He|She|They|His|Her|Their)\b", first):
                hits.setdefault("opening-pronoun", []).append(("", first))
            break
    for raw in text.splitlines():
        for flag in assigned_flags(raw.strip()):
            parts = flag.split(".")
            # The evaluator also looks up dotted flag suffixes in dialogue conditions.
            aliases = (".".join(parts[i:]) for i in range(len(parts)))
            if flag not in code and not any(name in all_conds for name in aliases):
                hits.setdefault("unread-flag", []).append(("", flag))
    return hits


def scenes():
    for p in sorted(SRC.glob("*.md")):
        if p.name == "README.md":
            continue
        text = codecs.decode(p.read_text(), "rot13")
        yield p.stem.split("-", 1)[1].replace("-", "_"), text


def main():
    show = "--show" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    total = 0
    code = flag_names(code_text())
    every = list(scenes())
    all_conds = "\n".join(c for _, t in every for m in COND.finditer(t) for c in m.groups() if c) + "\n".join(
        l for _, t in every for l in t.splitlines() if l.strip().startswith("####"))
    condition_names = flag_names(all_conds)
    for name, text in every:
        if only and name not in only:
            continue
        hits, lines = scene_checks(text, code, condition_names), 0
        for raw in text.splitlines():
            m = LINE.match(raw.strip())
            if not m:
                continue
            lines += 1
            who, said = m.group(1), re.sub(r"\*\([^)]*\)\*", "", m.group(2)).strip()
            for rule, rx in RAW_RULES.items():
                if rx.search(m.group(2)):
                    hits.setdefault(rule, []).append((who, m.group(2)))
            for rule, rx in RULES.items():
                if rx.search(said):
                    hits.setdefault(rule, []).append((who, said))
        n = sum(len(v) for v in hits.values())
        total += n
        print(f"{name:18} {lines:4} lines  {n:3} flags  " + "  ".join(f"{k}:{len(v)}" for k, v in sorted(hits.items())))
        if show:
            for rule, items in sorted(hits.items()):
                for who, said in items:
                    print(f"    [{rule}] {who}: {said}")
    print(f"total flags: {total}")


if __name__ == "__main__":
    main()
