#!/usr/bin/env python3
"""Export a Claude Code session transcript to readable Markdown for docs/devlog/.

Keeps only what the humans typed and what Claude said back (no tool calls, tool
output, thinking, or system context). Redacts the TEAMHUB_TOKEN value if it is set.

Usage:
  python3 tools/devlog/export_session.py                 # newest session for this repo
  python3 tools/devlog/export_session.py <session.jsonl> # a specific one
Writes docs/devlog/<date>-<name>-<session-id-prefix>.md and prints the path.
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
import codecs

SEALED_HEADER = ("<!-- SEALED SPOILERS (ROT47 cipher): chat logs are full of plot twists.\n"
                 "     To read on purpose: python3 tools/spoilers/seal.py open {path} -->\n")


def _rot47(text):
    return "".join(chr(33 + (ord(c) - 33 + 47) % 94) if 33 <= ord(c) <= 126 else c for c in text)


def seal_output(path, text):
    """Write a devlog file sealed with ROT47 (docs/sealed/README.md). Not ROT13: transcripts quote
    sealed ROT13 text, and ROT13 on top of it would turn that text back into plaintext."""
    path.write_text(SEALED_HEADER.format(path=path.relative_to(REPO).as_posix()) + _rot47(text))

REPO = Path(__file__).resolve().parents[2]
OUT_DIR = REPO / "docs" / "devlog"


def _project_dir() -> Path:
    slug = re.sub(r"[^A-Za-z0-9]", "-", str(REPO))
    return Path.home() / ".claude" / "projects" / slug


def _teammate_name() -> str:
    local = REPO / "CLAUDE.local.md"
    if local.exists():
        m = re.search(r"teamhub name is:\s*(\S+)", local.read_text(), re.I)
        if m:
            return m.group(1).lower()
    return "unknown"


def _clean(text: str) -> str:
    text = re.sub(r"<system-reminder>.*?</system-reminder>", "", text, flags=re.S)
    text = re.sub(r"<local-command-caveat>.*?</local-command-caveat>", "", text, flags=re.S)
    text = re.sub(r"</?pasted_content[^>]*>", "", text)
    text = re.sub(r"<command-(name|message|args)>(.*?)</command-\1>", r"\2", text, flags=re.S)
    text = re.sub(r"</?local-command-stdout>", "", text)
    token = os.environ.get("TEAMHUB_TOKEN")
    if token:
        text = text.replace(token, "<TEAMHUB_TOKEN>")
    text = re.sub(r"[\w.+-]+@[\w-]+\.[\w.]+", "<email>", text)
    return text.strip()


def export(path: Path) -> Path:
    turns: list[tuple[str, str, str]] = []
    for line in path.read_text().splitlines():
        d = json.loads(line)
        if d.get("isMeta") or d.get("isSidechain"):
            continue
        msg = d.get("message") or {}
        content = msg.get("content")
        if d.get("type") == "user" and isinstance(content, str):
            text = _clean(content)
            if text:
                turns.append(("Human", text, d.get("timestamp", "")))
        elif d.get("type") == "assistant" and isinstance(content, list):
            text = _clean("\n\n".join(b["text"] for b in content if b.get("type") == "text"))
            if text:
                if turns and turns[-1][0] == "Claude":
                    turns[-1] = ("Claude", turns[-1][1] + "\n\n" + text, turns[-1][2])
                else:
                    turns.append(("Claude", text, d.get("timestamp", "")))

    first_ts = next((t for _, _, t in turns if t), "")
    date = first_ts[:10] or datetime.now().strftime("%Y-%m-%d")
    name = _teammate_name()
    out = OUT_DIR / f"{date}-{name}-{path.stem[:8]}.md"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    parts = [f"# Session log: {name}, {date}\n",
             f"_Exported from Claude Code session `{path.stem[:8]}`. Human messages and Claude's replies only._\n"]
    for who, text, ts in turns:
        parts.append(f"\n---\n\n### {who}{f'  ·  {ts[11:16]} UTC' if ts else ''}\n\n{text}\n")
    seal_output(out, "".join(parts))
    return out


def main() -> None:
    if len(sys.argv) > 1:
        path = Path(sys.argv[1])
    else:
        sessions = sorted(_project_dir().glob("*.jsonl"), key=lambda p: p.stat().st_mtime)
        if not sessions:
            sys.exit(f"No sessions found in {_project_dir()}")
        path = sessions[-1]
    print(export(path).relative_to(REPO))


if __name__ == "__main__":
    main()
