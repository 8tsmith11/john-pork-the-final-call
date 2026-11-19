#!/usr/bin/env python3
"""Flag lines in the script that match the banned patterns in docs/lore/WRITING.md.

It reads the sealed scenes (docs/sealed/script/*.md), decodes them in memory, and prints counts per
scene. With --show it also prints the offending lines, which are spoilers: don't paste that output
anywhere public. It checks spoken lines only (**NAME:** ...), not stage directions.

A flag is a prompt to look, not a verdict: some hits are fine in context.

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
    "never-did": re.compile(r"\b(?:It|He|She|They|That)\s+never\s+(?:did|has|had|was|will|does)\.", re.I),
}


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
    for name, text in scenes():
        if only and name not in only:
            continue
        hits, lines = {}, 0
        for raw in text.splitlines():
            m = LINE.match(raw.strip())
            if not m:
                continue
            lines += 1
            who, said = m.group(1), re.sub(r"\*\([^)]*\)\*", "", m.group(2)).strip()
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
