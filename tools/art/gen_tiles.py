#!/usr/bin/env python3
"""Draw the 16x16 floor and wall tiles (assets/src/tiles.txt), four variants per map character.

Frame names match the engine's texture keys: tile_<charCode>_<variant>. Run, then build.py tiles.
Everything is drawn from the palette with a seeded generator, so re-running gives the same tiles.
"""
import json
import random
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PAL = [k for k in json.loads((REPO / "tools/art/palette.json").read_text()) if not k.startswith("_")]
LETTERS = "0123abcdefghijklmnopqrstuvwxyzABCDEF"
L = dict(zip(PAL, LETTERS))
N = 16


def blank(c):
    return [[c] * N for _ in range(N)]


def put(g, x, y, c):
    if 0 <= x < N and 0 <= y < N:
        g[y][x] = c


def speck(g, r, colors, n):
    for _ in range(n):
        put(g, r.randrange(N), r.randrange(N), r.choice(colors))


def wall(r, v):
    g = blank("night2")
    for y in range(N):                       # brick courses, 4px tall, staggered
        for x in range(N):
            course = y // 4
            if y % 4 == 3 or (x + (4 if course % 2 else 0)) % 8 == 7:
                g[y][x] = "night1"
    for x in range(N):                       # lit top edge
        g[0][x] = "night3"
    speck(g, r, ["night3"], 3)
    if v == 2:
        put(g, 5, 9, "concrete0"); put(g, 6, 9, "concrete0"); put(g, 6, 10, "concrete0")   # chipped brick
    if v == 3:
        for y in range(5, 12):
            put(g, 11, y, "night1")                                                          # hairline crack
    return g


def wood(r, v):
    g = blank("warm1")
    for y in range(N):
        board = y // 4
        for x in range(N):
            if y % 4 == 3:
                g[y][x] = "warm0"
            elif (x + board * 5 + v * 3) % 16 == 0:
                g[y][x] = "warm0"
    for _ in range(7):                       # grain
        x, y = r.randrange(N - 3), r.choice([0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14])
        for i in range(r.randint(2, 4)):
            if g[y][min(N - 1, x + i)] == "warm1":
                put(g, x + i, y, "warm2")
    if v == 1:
        put(g, 9, 5, "warm0"); put(g, 10, 5, "warm0")                                        # a knot
    return g


def asphalt(r, v):
    g = blank("concrete0")
    speck(g, r, ["concrete1", "night2"], 22)
    speck(g, r, ["concrete2"], 3)
    if v == 3:
        for i, x in enumerate(range(3, 12)):
            put(g, x, 8 + (i // 3), "night1")                                                # a crack
    if v == 2:
        for y in range(N):
            put(g, 7, y, "concrete2") if y % 8 < 5 else None                                 # worn lane paint
    return g


def tunnel(r, v):
    g = blank("night2")
    speck(g, r, ["concrete0"], 26)
    speck(g, r, ["night1"], 10)
    for x in range(N):
        g[15][x] = "night1"
    for y in range(N):
        g[y][15] = "night1"
    if v == 1:
        for y in range(3, 11):
            put(g, 6, y, "screen0")                                                          # a drip stain
        put(g, 5, 10, "screen0"); put(g, 7, 10, "screen0")
    if v == 3:
        put(g, 10, 4, "rot0")                                                                # one rotted pixel
    return g


def track(r, v):
    g = blank("concrete0")
    speck(g, r, ["concrete1", "night2", "concrete2"], 34)
    for y in (2, 3, 4, 10, 11, 12):          # sleepers
        for x in range(N):
            g[y][x] = "warm0" if y in (4, 12) else "warm1"
    for y in range(N):                       # rails
        for x, c in ((3, "steel"), (4, "concrete3"), (11, "steel"), (12, "concrete3")):
            g[y][x] = c
    if v == 2:
        put(g, 3, 7, "warm2"); put(g, 11, 13, "warm2")                                       # rust
    return g


def grass(r, v):
    g = blank("yerba0")
    speck(g, r, ["yerba1"], 20)
    speck(g, r, ["night2", "concrete0"], 8)
    for _ in range(4):
        x, y = r.randrange(N), r.randrange(1, N)
        put(g, x, y, "yerba1"); put(g, x, y - 1, "yerba1")
    if v == 3:
        put(g, 8, 8, "warm4")                                                                # a weed in flower
    return g


def kitchen(r, v):
    g = blank("concrete1")
    for y in range(N):
        for x in range(N):
            if (x // 8 + y // 8) % 2:
                g[y][x] = "concrete0"
            if x % 8 == 7 or y % 8 == 7:
                g[y][x] = "night2"
    for cx, cy in ((0, 0), (8, 8)):
        put(g, cx, cy, "concrete2")
    if v in (1, 3):
        put(g, 3 + v, 11, "night2"); put(g, 4 + v, 11, "night2")                             # scuff
    return g


def epoxy(r, v):
    g = blank("concrete0")
    speck(g, r, ["concrete1"], 9)
    speck(g, r, ["night2"], 4)
    for x in range(N):
        g[15][x] = "night2"
    if v == 2:
        put(g, 11, 4, "concrete2"); put(g, 12, 4, "concrete2"); put(g, 12, 5, "concrete2")   # a scuff
    if v == 3:
        put(g, 6, 7, "screen0"); put(g, 7, 7, "screen0"); put(g, 7, 8, "screen0")           # coolant spot
    return g


def bath(r, v):
    g = blank("concrete2")
    for y in range(N):
        for x in range(N):
            if x % 4 == 3 or y % 4 == 3:
                g[y][x] = "concrete1"
    for _ in range(3):
        put(g, r.randrange(4) * 4, r.randrange(4) * 4, "concrete3")
    if v == 3:
        put(g, 9, 9, "concrete0"); put(g, 10, 10, "concrete0")                               # a cracked tile
    return g


def balcony(r, v):
    g = blank("concrete1")
    speck(g, r, ["concrete0", "concrete2"], 12)
    for i in range(N):
        g[7][i] = "night2"; g[i][7] = "night2"
    if v == 1:
        for x, y in ((10, 11), (11, 11), (12, 11), (11, 12), (12, 12)):
            put(g, x, y, "screen0")                                                          # a puddle
    return g


def rail(r, v):
    g = blank("night1")
    for x in range(N):
        g[2][x] = "steel"; g[3][x] = "concrete3"; g[14][x] = "steel"
    for x in range(1, N, 4):
        for y in range(4, 14):
            g[y][x] = "steel"
    for y in range(5, 13):                   # night glass between the bars
        for x in range(N):
            if g[y][x] == "night1":
                g[y][x] = "night2"
    put(g, 6 + v, 6, "screen0"); put(g, 7 + v, 7, "screen0")                                 # a reflection
    return g


def pillar(r, v):
    g = blank("concrete1")
    for y in range(N):
        for x in (2, 3):
            g[y][x] = "concrete3"
        for x in (12, 13):
            g[y][x] = "concrete0"
        g[y][0] = "night1"; g[y][15] = "night1"
    for x in range(1, 15):
        g[0][x] = "concrete2"; g[15][x] = "night2"
    if v == 2:
        put(g, 7, 8, "rot1")                                                                 # a sticker, or rot
    return g


def water(r, v):
    g = blank("screen0")
    speck(g, r, ["night2"], 8)
    for _ in range(4):
        x, y = r.randrange(N - 5), r.randrange(N)
        for i in range(r.randint(3, 5)):
            put(g, x + i, y, "screen1")
    put(g, 4 + v * 2, 5 + v, "screen2")
    return g


PAINT = {"#": wall, ".": wood, ",": asphalt, ":": tunnel, "t": track, "g": grass, "k": kitchen,
         "e": epoxy, "w": bath, "b": balcony, "=": rail, "|": pillar, "~": water}

out = ["# tiles: generated by tools/art/gen_tiles.py. Frame = engine texture key tile_<charCode>_<variant>.",
       "@size 16 16", "@map " + " ".join(f"{L[k]}={k}" for k in PAL)]
for ch, fn in PAINT.items():
    for v in range(4):
        g = fn(random.Random(f"{ch}-{v}"), v)
        out.append(f"@frame tile_{ord(ch)}_{v}")
        out.extend("".join(L[c] for c in row) for row in g)
(REPO / "assets/src/tiles.txt").write_text("\n".join(out) + "\n")
print(f"tiles: {len(PAINT) * 4} frames")
