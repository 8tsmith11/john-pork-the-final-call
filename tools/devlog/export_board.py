#!/usr/bin/env python3
"""Dump the team hub board (messages + tasks) to docs/devlog/board.md.

Run on the machine that hosts the team hub (it reads tools/teamhub/teamhub_state.json).
Usage: python3 tools/devlog/export_board.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
import codecs

SEALED_HEADER = ("<!-- SEALED SPOILERS (ROT13 Caesar cipher): chat logs are full of plot twists.\n"
                 "     To read on purpose: python3 tools/spoilers/seal.py open {path} -->\n")


TAG = "[SEALED]"


def once(text):
    """Sealed text on the board is ROT13 already. Decode it here so the file-wide ROT13 leaves it encoded once
    (ROT13 twice is plaintext, which is how sealed posts leaked into this file; hub #134, PR #178).
    A post that starts with the tag is sealed whole. Anywhere else, an aside runs from its tag to the end of its line,
    whether the tag opens a later paragraph or sits mid-sentence after some plain text."""
    text = str(text or "")
    if text.startswith(TAG):
        return TAG + codecs.encode(text[len(TAG):], "rot_13")
    return re.sub(re.escape(TAG) + r"([^\n]*)", lambda m: TAG + codecs.encode(m.group(1), "rot_13"), text)


def seal_output(path, text):
    """Write a devlog file sealed with ROT13 (docs/sealed/README.md)."""
    path.write_text(SEALED_HEADER.format(path=path.relative_to(REPO).as_posix()) + codecs.encode(text, 'rot_13'))

REPO = Path(__file__).resolve().parents[2]
STATE = REPO / "tools" / "teamhub" / "teamhub_state.json"
OUT = REPO / "docs" / "devlog" / "board.md"


def main() -> None:
    if not STATE.exists():
        sys.exit(f"No board state at {STATE} (run this on the hub host).")
    data = json.loads(STATE.read_text())
    lines = ["# Team hub board log\n",
             "_Agent discussion from the team hub, oldest first. Regenerate with "
             "`python3 tools/devlog/export_board.py` on the hub host._\n",
             "\n## Tasks\n",
             "\n| # | Task | Status | Owner | Note |\n|---|---|---|---|---|\n"]
    for t in data.get("tasks", []):
        cell = lambda v: once(v).replace("|", "\\|").replace("\n", " ")   # notes can carry sealed asides too
        lines.append(f"| {t['id']} | {cell(t['title'])} | {t['status']} | {cell(t['owner'])} | {cell(t['note'])} |\n")
    lines.append("\n## Messages\n")
    for m in data.get("messages", []):
        lines.append(f"\n---\n\n**#{m['id']} {m['author']}**  ·  {m['at']}\n\n{once(m['text'])}\n")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    seal_output(OUT, "".join(lines))
    print(OUT.relative_to(REPO))


if __name__ == "__main__":
    main()
