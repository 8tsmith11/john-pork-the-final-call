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
LETTERS = "0123abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP"   # one letter per palette colour; room for 48
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
        for x, y in ((4, 5), (5, 5), (5, 6), (10, 11), (11, 11)):
            put(g, x, y, "night1")                                                           # a patched pothole
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


def carpet(r, v):
    g = blank("soft0")
    for y in range(N):
        for x in range(N):
            if (x + y) % 8 == 0 or (x - y) % 8 == 0:
                g[y][x] = "night3"                                   # a worn diamond pattern
    speck(g, r, ["night2"], 6)
    if v == 2:
        for x, y in ((5, 9), (6, 9), (6, 10), (7, 10)):
            put(g, x, y, "night2")                                   # an old stain
    if v == 3:
        for x in range(3, 12):
            put(g, x, 12, "soft1")                                   # a track worn pale by feet
    return g


def stone(r, v):
    g = blank("concrete2")
    speck(g, r, ["concrete3"], 10)
    speck(g, r, ["concrete1"], 8)
    for i in range(N):
        g[15][i] = "concrete1"; g[i][15] = "concrete1"
    g[0][0] = "concrete3"
    if v == 1:
        for i in range(4, 11):
            put(g, i, 4 + i // 3, "concrete3")                       # a vein in the stone
    if v == 3:
        put(g, 8, 8, "concrete0"); put(g, 9, 9, "concrete0")         # a chip
    return g


def pavers(r, v):
    g = blank("concrete1")
    for y in range(N):
        for x in range(N):
            if y % 8 == 7 or (x + (4 if (y // 8) % 2 else 0)) % 8 == 7:
                g[y][x] = "concrete0"
    speck(g, r, ["concrete2"], 6)
    if v == 2:
        put(g, 3, 3, "yerba0"); put(g, 4, 3, "yerba0")               # a weed in the joint
    if v == 3:
        for x, y in ((9, 10), (10, 10), (10, 11), (11, 11)):
            put(g, x, y, "screen0")                                  # a puddle holding the light
    return g


def sidewalk(r, v):
    g = blank("concrete2")
    speck(g, r, ["concrete3", "concrete1"], 9)
    for i in range(N):
        g[i][15] = "concrete1"
    if v % 2:
        for i in range(N):
            g[15][i] = "concrete1"
    if v == 3:
        for i in range(4, 10):
            put(g, i, 3 + i // 2, "concrete0")                       # a crack
    return g


def tree(r, v):
    g = blank("yerba0")
    speck(g, r, ["night2"], 10)
    for y in range(1, 13):
        for x in range(1, 15):
            if (x - 7.5) ** 2 + (y - 6.5) ** 2 < 40 + v:
                g[y][x] = "yerba0" if (x + y) % 3 else "yerba1"
    for y in range(1, 13):
        for x in range(1, 15):
            d = (x - 7.5) ** 2 + (y - 6.5) ** 2
            if 30 + v <= d < 40 + v:
                g[y][x] = "night2"
    for x, y in ((5, 4), (6, 3), (9, 5), (4, 7)):
        put(g, x + (v % 2), y, "yerba1")
    for y in (13, 14):
        put(g, 7, y, "warm0"); put(g, 8, y, "warm1")
    return g


def rug(r, v):
    g = blank("soft0")
    for y in range(N):
        for x in range(N):
            if (x % 8 in (0, 7)) or (y % 8 in (0, 7)):
                g[y][x] = "warm1"
            elif (x % 8 in (3, 4)) and (y % 8 in (3, 4)):
                g[y][x] = "warm4"
            elif (x + y) % 4 == 0:
                g[y][x] = "soft1"
    if v == 3:
        put(g, 5, 10, "warm0"); put(g, 6, 10, "warm0")               # a burn from a soldering iron
    return g


PAINT = {"#": wall, ".": wood, ",": asphalt, ":": tunnel, "t": track, "g": grass, "k": kitchen,
         "e": epoxy, "w": bath, "b": balcony, "=": rail, "|": pillar, "~": water, "c": carpet, "m": stone, "p": pavers, "s": sidewalk, "T": tree, "u": rug,
         "h": lambda r, v: [list(col) for col in zip(*track(r, v))]}   # track running east-west

out = ["# tiles: generated by tools/art/gen_tiles.py. Frame = engine texture key tile_<charCode>_<variant>.",
       "@size 16 16", "@map " + " ".join(f"{L[k]}={k}" for k in PAL)]
for ch, fn in PAINT.items():
    for v in range(4):
        g = fn(random.Random(f"{ch}-{v}"), v)
        out.append(f"@frame tile_{ord(ch)}_{v}")
        out.extend("".join(L[c] for c in row) for row in g)

# Connected walls (Trevor #340/#341, depth pass task 13): frames tile_35_m<mask>, mask = same-tile
# neighbours N=1 E=2 S=4 W=8. Three-quarter view: a wall with more wall below it is the dark TOP
# (seen from above); a wall with floor below it is the lit FRONT FACE, brick with a baseboard.
# Exposed edges of the top get a thin lit rim (north/west, toward the light) or a dark rim.
def wall_mask(m):
    N_, E_, S_, W_ = m & 1, m & 2, m & 4, m & 8
    r = random.Random(f"wallmask-{m}")
    if S_:                                    # top of the wall, seen from above
        g = blank("night1")
        speck(g, r, ["night0"], 6)
        if not N_:
            for x in range(N): g[0][x] = "night3"; g[1][x] = "night2"
        if not W_:
            for y in range(N): g[y][0] = "night3"
        if not E_:
            for y in range(N): g[y][N - 1] = "night0"
        return g
    g = blank("night3")                       # the front face, lit from the top left
    top = 0 if N_ else 4
    if not N_:                                # a one-tile-thick wall: show a sliver of top first
        for y in range(4):
            for x in range(N): g[y][x] = "night1"
        for x in range(N): g[0][x] = "night3"
    for y in range(top, N):
        course = (y - top) // 3
        for x in range(N):
            if (y - top) % 3 == 2 or (x + (4 if course % 2 else 0)) % 8 == 7:
                g[y][x] = "night2"
    for x in range(N): g[top][x] = "concrete1"            # where the top meets the face
    for x in range(N): g[N - 2][x] = "night1"; g[N - 1][x] = "night0"   # baseboard and contact
    if not W_:
        for y in range(top, N - 2): g[y][0] = "concrete0"
    if not E_:
        for y in range(top, N - 2): g[y][N - 1] = "night1"
    speck(g, r, ["concrete0"], 2)
    return g

for m in range(16):
    out.append(f"@frame tile_35_m{m}")
    out.extend("".join(L[c] for c in row) for row in wall_mask(m))


# Connected rugs (task 13): frames tile_117_m<mask>. The body is the same diamond weave as the loose
# rug tile; edges that border something else get a fringe (a dark binding, a lit thread, then the
# floor showing under the tassels), so a run of rug tiles reads as one rug with a border all round.
def rug_mask(m):
    N_, E_, S_, W_ = m & 1, m & 2, m & 4, m & 8
    g = blank("soft0")
    for y in range(N):
        for x in range(N):
            if (x % 8 in (0, 7)) or (y % 8 in (0, 7)): g[y][x] = "warm1"
            elif (x % 8 in (3, 4)) and (y % 8 in (3, 4)): g[y][x] = "warm4"
            elif (x + y) % 4 == 0: g[y][x] = "soft1"
    def edge(cells):
        for i, (x, y) in enumerate(cells):
            put(g, x, y, "warm0")
    if not N_:
        for x in range(N): g[0][x] = "warm0"; g[1][x] = "warm3"
    if not S_:
        for x in range(N): g[N - 1][x] = "night1"; g[N - 2][x] = "warm0"
        for x in range(1, N, 3): g[N - 1][x] = "warm3"                 # tassels on the near edge
    if not W_:
        for y in range(N): g[y][0] = "warm0"; g[y][1] = "warm3"
    if not E_:
        for y in range(N): g[y][N - 1] = "night1"; g[y][N - 2] = "warm0"
    return g

for m in range(16):
    out.append(f"@frame tile_117_m{m}")
    out.extend("".join(L[c] for c in row) for row in rug_mask(m))


# Connected grass (task 13): tile_103_m<mask>. Where grass meets anything else, the edge is uneven
# (a ragged band of bare soil with tufts along it), so lawns stop reading as cut squares. Opaque on
# purpose: the map renders tiles onto a blank canvas, so a transparent edge would show black.
def grass_mask(m):
    N_, E_, S_, W_ = m & 1, m & 2, m & 4, m & 8
    r = random.Random(f"grassmask-{m}")
    g = grass(random.Random(f"g-body-{m}"), 0)
    bump = [r.choice([0, 0, 1, 1, 2]) for _ in range(N)]
    if not N_:
        for x in range(N):
            for y in range(bump[x]): g[y][x] = "warm0"
            g[bump[x]][x] = "yerba1"
    if not S_:
        for x in range(N):
            d = bump[(x + 5) % N]
            for y in range(N - d, N): g[y][x] = "warm0"
            g[N - 1 - d][x] = "night2"; g[max(0, N - 2 - d)][x] = "yerba1"
    if not W_:
        for y in range(N):
            d = bump[(y + 3) % N]
            for x in range(d): g[y][x] = "warm0"
            g[y][d] = "yerba1"
    if not E_:
        for y in range(N):
            d = bump[(y + 9) % N]
            for x in range(N - d, N): g[y][x] = "warm0"
            g[y][N - 1 - d] = "night2"
    return g

# Connected water (task 13): tile_126_m<mask>. A pale foam line and a darker shelf where water meets
# the bank, on every side that isn't more water.
def water_mask(m):
    N_, E_, S_, W_ = m & 1, m & 2, m & 4, m & 8
    g = water(random.Random(f"w-body-{m}"), m % 4)
    if not N_:
        for x in range(N): g[0][x] = "bone"; g[1][x] = "screen1"; g[2][x] = "night2"
    if not S_:
        for x in range(N): g[N - 1][x] = "screen1"; g[N - 2][x] = "screen2"
    if not W_:
        for y in range(N): g[y][0] = "bone"; g[y][1] = "screen1"
    if not E_:
        for y in range(N): g[y][N - 1] = "screen2"; g[y][N - 2] = "screen1"
    return g

# Kerbs and gutters (task 13): sidewalk (s) and asphalt (,) get edge frames tile_<code>_m<mask> for
# every mask except 15. Fully surrounded tiles keep the hashed variants, so big areas don't repeat.
# Sidewalk: a raised kerb on every side that isn't more sidewalk, lit lip on N/W, drop shadow on S/E.
def sidewalk_mask(m):
    N_, E_, S_, W_ = m & 1, m & 2, m & 4, m & 8
    g = sidewalk(random.Random(f"s-body-{m}"), m % 3)
    if not N_:
        for x in range(N): g[0][x] = "bone"; g[1][x] = "concrete3"
    if not W_:
        for y in range(N): g[y][0] = "bone"; g[y][1] = "concrete3"
    if not S_:
        for x in range(N): g[N - 2][x] = "concrete3"; g[N - 1][x] = "night1"
    if not E_:
        for y in range(N): g[y][N - 2] = "concrete3"; g[y][N - 1] = "night1"
    return g

# Asphalt: a darker gutter band along every side that isn't more road, where water and grit collect.
def asphalt_mask(m):
    N_, E_, S_, W_ = m & 1, m & 2, m & 4, m & 8
    r = random.Random(f"a-body-{m}")
    g = asphalt(r, m % 2)
    if not N_:
        for x in range(N): g[0][x] = "night1"; g[1][x] = r.choice(["night1", "night2", "concrete0"])
    if not S_:
        for x in range(N): g[N - 1][x] = "night1"; g[N - 2][x] = r.choice(["night2", "concrete0"])
    if not W_:
        for y in range(N): g[y][0] = "night1"; g[y][1] = r.choice(["night1", "night2", "concrete0"])
    if not E_:
        for y in range(N): g[y][N - 1] = "night1"; g[y][N - 2] = r.choice(["night2", "concrete0"])
    return g

for code, fn in ((115, sidewalk_mask), (44, asphalt_mask)):
    for m in range(15):
        out.append(f"@frame tile_{code}_m{m}")
        out.extend("".join(L[c] for c in row) for row in fn(m))
for code, fn in ((103, grass_mask), (126, water_mask)):
    for m in range(16):
        out.append(f"@frame tile_{code}_m{m}")
        out.extend("".join(L[c] if c != "warm0" else "." for c in row) for row in fn(m))
(REPO / "assets/src/tiles.txt").write_text("\n".join(out) + "\n")
print(f"tiles: {len(PAINT) * 4} frames")
