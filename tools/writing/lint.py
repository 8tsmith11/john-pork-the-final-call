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
    "long-line": re.compile(r"^(?:\S+\s+){34,}\S+"),
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
