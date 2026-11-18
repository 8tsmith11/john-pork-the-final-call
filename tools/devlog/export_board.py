#!/usr/bin/env python3
"""Dump the team hub board (messages + tasks) to docs/devlog/board.md.

Run on the machine that hosts the team hub (it reads tools/teamhub/teamhub_state.json).
Usage: python3 tools/devlog/export_board.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

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
        cell = lambda v: str(v or "").replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {t['id']} | {cell(t['title'])} | {t['status']} | {cell(t['owner'])} | {cell(t['note'])} |\n")
    lines.append("\n## Messages\n")
    for m in data.get("messages", []):
        lines.append(f"\n---\n\n**#{m['id']} {m['author']}**  ·  {m['at']}\n\n{m['text']}\n")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("".join(lines))
    print(OUT.relative_to(REPO))


if __name__ == "__main__":
    main()
