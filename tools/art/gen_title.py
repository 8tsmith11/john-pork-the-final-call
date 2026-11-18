#!/usr/bin/env python3
"""Paint the title background: College Park at night, looking north from ASTER's roof.

480x270, palette only, deterministic. Output: assets/sprites/title_bg.png. The moving things
(rain, the lights on the horizon, the antenna's red lamp) are added live in TitleScene.
"""
import json
import random
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[2]
PAL = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in json.loads((REPO / "tools/art/palette.json").read_text()).items() if not k.startswith("_")}
W, H = 480, 270
r = random.Random("title-north")
im = Image.new("RGB", (W, H), PAL["night0"])
px = im.load()


def rect(x, y, w, h, c):
    for j in range(max(0, y), min(H, y + h)):
        for i in range(max(0, x), min(W, x + w)):
            px[i, j] = PAL[c]


def dither(y0, y1, a, b):
    """Blend colour a into b down a band with an ordered dither."""
    for y in range(y0, y1):
        t = (y - y0) / max(1, y1 - y0)
        for x in range(W):
            thr = ((x * 3 + y * 5) % 8) / 8
            px[x, y] = PAL[b] if t > thr else PAL[a]


# Sky: black at the top, bruised toward the horizon where the Corridor's light leaks up.
dither(0, 46, "night0", "night1")
dither(46, 92, "night1", "night2")
dither(92, 112, "night2", "night3")
for _ in range(26):                                   # the few stars the haze lets through
    px[r.randrange(W), r.randrange(0, 60)] = PAL["night3"]

# The far skyline: low blocks against the glow, a window lit here and there.
x = 0
while x < W:
    w, h = r.randint(7, 22), r.randint(5, 26)
    rect(x, 112 - h, w, h, "night1")
    for _ in range(r.randint(0, 3)):
        px[min(W - 1, x + r.randrange(w)), 112 - 1 - r.randrange(h)] = PAL[r.choice(["warm3", "screen0", "warm2"])]
    x += w + r.randint(0, 3)
# Dishes on a hill to the north-east, pointed at nothing.
for cx in (392, 412, 437):
    rect(cx, 100, 2, 6, "night1"); rect(cx - 4, 96, 10, 2, "night1"); rect(cx - 3, 98, 8, 2, "night1")

# The middle distance: darker blocks, more windows, the town.
rect(0, 112, W, 64, "night0")
x = 0
while x < W:
    w, h = r.randint(14, 40), r.randint(10, 46)
    top = 176 - h
    rect(x, top, w, h, "night1")
    rect(x, top, w, 1, "night2")
    for wy in range(top + 3, 174, 4):
        for wx in range(x + 2, x + w - 2, 4):
            if r.random() < 0.16:
                rect(wx, wy, 2, 2, r.choice(["warm3", "warm4", "screen0", "warm2", "warm3"]))
    x += w + r.randint(1, 5)

# Route 1 running north to the vanishing point, picked out by its streetlamps.
vx, vy = 258, 112
for side in (-1, 1):
    for i in range(22):
        t = (i / 21) ** 1.8
        y = int(vy + t * (176 - vy))
        xx = int(vx + side * (2 + t * 46))
        if 0 <= xx < W:
            px[xx, y] = PAL["balloon1"]
            if t > 0.35:
                px[xx, y + 1] = PAL["warm2"]
for i in range(60):                                    # the road itself, a little lighter than the dark
    t = i / 59
    y = int(vy + t * (176 - vy))
    half = int(1 + t * 40)
    for xx in range(vx - half, vx + half):
        if 0 <= xx < W and px[xx, y] == PAL["night1"] or px[xx, y] == PAL["night0"]:
            px[xx, y] = PAL["night2"] if (xx + y) % 2 else px[xx, y]

# The metro plaza, lower left: a pool of sodium light and the station's lit mouth.
for y in range(150, 176):
    for xx in range(60, 150):
        d = ((xx - 104) / 46) ** 2 + ((y - 166) / 14) ** 2
        if d < 1 and ((xx * 5 + y * 3) % 7) / 7 > d:
            px[xx, y] = PAL["warm1"] if d > 0.45 else PAL["warm2"]
rect(92, 150, 26, 9, "night2"); rect(100, 154, 10, 5, "warm4"); rect(92, 150, 26, 1, "steel")
# A billboard on Route 1 with one corner rotted.
rect(318, 138, 30, 14, "night2"); rect(319, 139, 28, 12, "screen0"); rect(322, 142, 18, 1, "screen2"); rect(322, 145, 22, 1, "screen1")
rect(341, 147, 5, 3, "rot0"); rect(330, 152, 2, 24, "night2")

# The roof we are standing on.
rect(0, 176, W, 94, "concrete0")
for _ in range(900):
    xx, yy = r.randrange(W), r.randrange(180, H)
    px[xx, yy] = PAL[r.choice(["night2", "concrete1", "night2"])]
rect(0, 176, W, 2, "concrete2"); rect(0, 178, W, 3, "concrete1"); rect(0, 181, W, 1, "night2")   # the parapet
for xx in range(0, W, 48):
    rect(xx, 176, 1, 5, "night2")
# Antenna, with a cable running down toward the metro garage.
rect(30, 96, 2, 80, "steel"); rect(24, 110, 14, 1, "steel"); rect(26, 124, 10, 1, "steel"); rect(22, 176, 18, 4, "concrete2")
for i in range(70):
    xx, yy = 32 + i, 112 + int(i * 0.9)
    if yy < 176:
        px[xx, yy] = PAL["night3"]
# Roof furniture: a vent, an air handler, a folding chair somebody carried up.
rect(400, 162, 44, 18, "concrete1"); rect(400, 162, 44, 2, "concrete3"); rect(406, 168, 14, 8, "night2"); rect(426, 168, 12, 8, "night2")
rect(150, 168, 10, 12, "concrete2"); rect(148, 166, 14, 3, "concrete3")
rect(352, 170, 1, 10, "steel"); rect(360, 170, 1, 10, "steel"); rect(352, 170, 9, 1, "warm2"); rect(352, 164, 1, 6, "steel")
# Darken the bottom so menu text reads.
for y in range(214, H):
    for xx in range(W):
        if (xx + y) % 2 == 0 or y > 240:
            px[xx, y] = PAL["night1"] if y <= 240 or (xx + y) % 2 else PAL["night0"]

out = REPO / "assets" / "sprites" / "title_bg.png"
im.save(out)
print("wrote", out.relative_to(REPO))
