#!/usr/bin/env python3
"""Pack text pixel maps (assets/src/*.txt) into PNG sheets + Phaser JSON-hash atlases.

Source format:
  # comment
  @size 16 24                 frame width and height
  @map H=warm1 S=skin2 ...    one letter per palette color name; '.' is always transparent
  @frame idle_down_0          starts a frame; the next <height> lines are its rows

Every color must come from tools/art/palette.json. Output: assets/sprites/<name>.png and
assets/sprites/<name>.json, frames laid out left to right, wrapping at 8 per row.

Usage: python3 tools/art/build.py            (all sources)
       python3 tools/art/build.py manuel     (one)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "assets" / "src"
OUT = REPO / "assets" / "sprites"
PER_ROW = 8


def load_palette() -> dict[str, tuple[int, int, int, int]]:
    raw = json.loads((REPO / "tools" / "art" / "palette.json").read_text())
    pal = {}
    for name, hexv in raw.items():
        if name.startswith("_"):
            continue
        h = hexv.lstrip("#")
        pal[name] = (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)
    return pal


def parse(path: Path, pal: dict) -> tuple[int, int, list[tuple[str, list[str]]], dict]:
    w = h = 0
    letters: dict[str, tuple[int, int, int, int]] = {".": (0, 0, 0, 0)}
    frames: list[tuple[str, list[str]]] = []
    lines = path.read_text().splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        i += 1
        if not line or line.startswith("#"):
            continue
        if line.startswith("@size"):
            _, a, b = line.split()
            w, h = int(a), int(b)
        elif line.startswith("@map"):
            for pair in line.split()[1:]:
                letter, name = pair.split("=")
                if name not in pal:
                    sys.exit(f"{path.name}: '{name}' is not in palette.json")
                letters[letter] = pal[name]
        elif line.startswith("@frame"):
            name = line.split()[1]
            rows = lines[i:i + h]
            i += h
            if len(rows) != h or any(len(r) != w for r in rows):
                sys.exit(f"{path.name}: frame {name} is not {w}x{h}")
            frames.append((name, rows))
        else:
            sys.exit(f"{path.name}: unexpected line: {line!r}")
    return w, h, frames, letters


def build(path: Path, pal: dict) -> None:
    w, h, frames, letters = parse(path, pal)
    cols = min(PER_ROW, len(frames))
    rows_n = (len(frames) + PER_ROW - 1) // PER_ROW
    sheet = Image.new("RGBA", (cols * w, rows_n * h), (0, 0, 0, 0))
    atlas = {"frames": {}, "meta": {"image": f"{path.stem}.png", "format": "RGBA8888",
                                    "size": {"w": cols * w, "h": rows_n * h}, "scale": "1"}}
    for n, (name, rows) in enumerate(frames):
        ox, oy = (n % PER_ROW) * w, (n // PER_ROW) * h
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch not in letters:
                    sys.exit(f"{path.name}: frame {name} uses unmapped letter {ch!r}")
                sheet.putpixel((ox + x, oy + y), letters[ch])
        atlas["frames"][name] = {
            "frame": {"x": ox, "y": oy, "w": w, "h": h}, "rotated": False, "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": w, "h": h}, "sourceSize": {"w": w, "h": h}}
    OUT.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT / f"{path.stem}.png")
    (OUT / f"{path.stem}.json").write_text(json.dumps(atlas, indent=1) + "\n")
    print(f"{path.stem}: {len(frames)} frames -> assets/sprites/{path.stem}.png")


def main() -> None:
    pal = load_palette()
    want = sys.argv[1:]
    paths = [SRC / f"{n}.txt" for n in want] if want else sorted(SRC.glob("*.txt"))
    for p in paths:
        build(p, pal)


if __name__ == "__main__":
    main()
