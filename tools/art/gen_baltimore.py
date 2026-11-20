#!/usr/bin/env python3
"""Draw the Baltimore 2098 set (hub #6) as text pixel maps: assets/src/baltimore.txt. Then: build.py baltimore.

The port, the refinery, the rowhouse streets and the skyline, for the Baltimore district maps
(src/content/maps/districts.js). A harbor city that kept working: rust, faded paint, weeds, patched and still in use.
Frames mix sizes, so build.py packs each size as its own band; WorldScene and decor.js stand every piece on the
bottom edge of its tile, centred on its footprint, at its authored size (docs/art/DIRECTION.md, "Sheets").

Names are bm.<thing>. The pieces:
  architecture (no contact shadow): bm.row_* rowhouse fronts (16x32 bays; a door column is bm.row_upper_* over a
  bm.row_door_* floor piece that sits in the doorway recess), bm.wall_ref_* refinery wall, bm.wall_hall_* the
  Callers' cannery hall, bm.wall_ca_* the port authority, bm.mural, bm.sky_* skyline strips for the top row of an
  outdoor map, bm.sign_* the refinery's rooftop letters (lit, and _off; the S flickers through bm.sign_S#1),
  bm.quay_*, bm.pier*, bm.rail_* (floor pieces).
  free-standing: bm.crane (+ a bm.crane_bogie under each leg), bm.box_* containers, bm.boxes_* stacks of two,
  bm.bollard*, bm.flatcar*, bm.rail_stop, bm.silo, bm.smokestack, bm.pew*, bm.book_stand, bm.ledger_ca,
  bm.sign_switch, bm.banner_pork.

Palette rules (DIRECTION.md): no balloon orange anywhere; signal red only on Continuity's own things, which carry
"_ca" in their names. The refinery's sign is soft red (soft1 tubes on a bone core, soft0 halo). The refinery's name
on the sign is our own: SHOAL.
"""
import json
import random
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PAL = [k for k in json.loads((REPO / "tools/art/palette.json").read_text()) if not k.startswith("_")]
LETTERS = "0123abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP"   # same letters as gen_props.py
L = dict(zip(PAL, LETTERS))
assert len(PAL) <= len(LETTERS)


class C:
    """A canvas of palette colour names (None is transparent)."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        self.g = [[None] * w for _ in range(h)]

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            assert c is None or c in L, c
            self.g[y][x] = c
        return self

    def get(self, x, y):
        return self.g[y][x] if 0 <= x < self.w and 0 <= y < self.h else None

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.px(xx, yy, c)
        return self

    def h_(self, x, y, w, c):
        return self.rect(x, y, w, 1, c)

    def v_(self, x, y, h, c):
        return self.rect(x, y, 1, h, c)

    def pts(self, c, *pts):
        for x, y in pts:
            self.px(x, y, c)
        return self

    def line(self, x0, y0, x1, y1, c, only_empty=False):
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            if not only_empty or self.get(x0, y0) is None:
                self.px(x0, y0, c)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy; x0 += sx
            if e2 <= dx:
                err += dx; y0 += sy
        return self

    def ell(self, cx, cy, rx, ry, c, ring=False):
        for y in range(self.h):
            for x in range(self.w):
                d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2
                if (d <= 1 and not ring) or (ring and 0.55 <= d <= 1):
                    self.px(x, y, c)
        return self

    def outline(self, c="night0", skip_bottom=False):
        src = [row[:] for row in self.g]
        for y in range(self.h):
            for x in range(self.w):
                if src[y][x] is not None:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    if skip_bottom and dy == -1:
                        continue
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < self.w and 0 <= ny < self.h and src[ny][nx] is not None:
                        self.g[y][x] = c
                        break
        return self

    def where(self, c):
        return [(x, y) for y in range(self.h) for x in range(self.w) if self.g[y][x] == c]

    def recolor(self, frm, to, x0=0, y0=0, x1=None, y1=None):
        for y in range(y0, self.h if y1 is None else y1):
            for x in range(x0, self.w if x1 is None else x1):
                if self.g[y][x] == frm:
                    self.g[y][x] = to
        return self

    def blit(self, o, ox, oy):
        for y in range(o.h):
            for x in range(o.w):
                if o.g[y][x] is not None:
                    self.px(ox + x, oy + y, o.g[y][x])
        return self

    def crop(self, x, y, w, h):
        o = C(w, h)
        for yy in range(h):
            for xx in range(w):
                o.g[yy][xx] = self.get(x + xx, y + yy)
        return o

    def copy(self):
        return self.crop(0, 0, self.w, self.h)

    def rows(self):
        return ["".join(L[c] if c else "." for c in r) for r in self.g]


FRAMES = {}   # name -> C, in drawing order (build.py bands consecutive frames of one size)


def F(name, c):
    assert name not in FRAMES, name
    FRAMES[name] = c


def chance(r, p):
    return r.random() < p


# ---------------------------------------------------------------------------------------------- shared textures
def brick(c, x0, y0, w, h, seed, oy=0, joint="warm0", tones=("soft0", "soft0", "warm1", "soft0", "warm1", "warm2")):
    """Baltimore red brick, running bond: 7x2 bricks, 1px joints, courses of 3 rows. The pattern keys on the
    canvas position plus `oy`, so pieces cut from one tall wall (a door column) line up."""
    r = random.Random(seed)
    tone = {}
    for y in range(y0, y0 + h):
        Y = y + oy
        course = Y // 3
        off = 4 if course % 2 else 0
        for x in range(x0, x0 + w):
            if Y % 3 == 2 or (x + off) % 8 == 7:
                c.px(x, y, joint)
                continue
            key = ((x + off) // 8, course)
            if key not in tone:
                tone[key] = r.choice(tones)
            col = tone[key]
            if Y % 3 == 0 and (x + off) % 8 == 0:
                col = {"soft0": "soft1", "warm1": "warm2", "warm0": "warm1", "warm2": "warm3"}[col] if chance(r, 0.4) else col   # a lit corner
            c.px(x, y, col)
    return c


def formstone(c, x0, y0, w, h, seed, oy=0):
    """Formstone: poured fake stone over the old brick. Grey-green 'stones' with thin dark joints, a little too
    regular (every course the same height, the same three widths over and over)."""
    r = random.Random(seed)
    widths = (5, 4, 6)
    for y in range(y0, y0 + h):
        Y = y + oy
        course = Y // 4
        if Y % 4 == 3:
            c.h_(x0, y, w, "night2")
            continue
        x, k = x0 - (course * 3) % 7, course
        while x < x0 + w:
            sw = widths[k % 3]
            for xx in range(x, x + sw):
                if x0 <= xx < x0 + w:
                    col = "concrete2"
                    if Y % 4 == 0 and xx == x + 1:
                        col = "concrete3"
                    c.px(xx, y, col)
            if x + sw - 1 >= x0:
                c.px(x + sw - 1, y, "night2")
            x += sw
            k += 1
    for _ in range(w * h // 40):   # pits and stains: it was never as clean as the brochure
        c.px(r.randrange(x0, x0 + w), r.randrange(y0, y0 + h), r.choice(("concrete1", "concrete3", "concrete1")))
    return c


def corrugated(c, x0, y0, w, h, lit="concrete3", mid="concrete2", dark="concrete1"):
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            c.px(x, y, (lit, mid, mid, dark)[x % 4])
    return c


def streaks(c, r, x0, y0, w, n, cols=("warm1", "warm2"), lmin=2, lmax=7, over=None):
    """Rust running down from a ledge."""
    for _ in range(n):
        x, ln, col = r.randrange(x0, x0 + w), r.randint(lmin, lmax), r.choice(cols)
        for y in range(y0, y0 + ln):
            if over is None or c.get(x, y) in over:
                if y == y0 + ln - 1 and chance(r, 0.5):
                    continue
                c.px(x, y, col)
    return c


def weeds(c, r, xs, ybot):
    for x in xs:
        hgt = r.randint(1, 3)
        for k in range(hgt):
            c.px(x + (k % 2 if chance(r, 0.4) else 0), ybot - k, "yerba1" if k == hgt - 1 else "yerba0")
    return c


# ---------------------------------------------------------------------------------------------- rowhouses
# One rowhouse bay is 16x32 and covers a two-row wall block: cornice on the roofline, an upstairs window, a
# downstairs window, the marble water table at the foot. A door column is drawn as the same 16x32 and cut in two:
# the top half (bm.row_upper*) stands on the wall tile, the bottom half (bm.row_door*) is a floor piece in the
# doorway recess, so whoever climbs the steps is drawn in front of the door.
CORNICES = {"grey": ("concrete3", "concrete2"), "brown": ("warm3", "warm2"), "steel": ("bone", "steel")}


def cornice(c, kind="grey"):
    lit, body = CORNICES[kind]
    c.h_(0, 0, c.w, "night0").h_(0, 1, c.w, lit).h_(0, 2, c.w, body).h_(0, 3, c.w, "night1")
    for x in range(1, c.w, 5):
        c.px(x, 2, "night2").px(x, 3, "night2")   # brackets under the cornice


def window(c, x0, y0, kind, r):
    """Lintel at y0, glass y0+1..y0+7 (8x7), sill at y0+8 with its shadow under it."""
    c.h_(x0 - 1, y0, 10, "bone").px(x0 - 1, y0, "concrete3")
    c.rect(x0, y0 + 1, 8, 7, "concrete3")                                     # painted sash
    gx, gy = x0 + 1, y0 + 2
    if kind == "glass":
        c.rect(gx, gy, 6, 5, "night1").h_(gx, gy + 2, 6, "concrete3")
        c.pts("night3", (gx + 4, gy), (gx + 3, gy + 1)).px(gx + 1, gy + 3, "screen0")
    elif kind == "lit":
        c.rect(gx, gy, 6, 5, "warm4").h_(gx, gy + 2, 6, "concrete3")
        c.rect(gx, gy + 3, 2, 2, "warm3").rect(gx + 4, gy + 3, 2, 2, "warm3").pts("warm3", (gx, gy), (gx + 5, gy))   # curtains
    elif kind == "screen":
        # A painted screen: a cottage by a lake. The street sees the lake; the room behind sees out.
        c.rect(gx, gy, 6, 5, "screen1")
        c.pts("bone", (gx + 4, gy))                                              # a cloud
        c.pts("concrete2", (gx, gy + 1), (gx + 1, gy + 1), (gx + 5, gy + 1))    # far hills
        c.pts("soft0", (gx + 2, gy + 1), (gx + 3, gy + 1), (gx + 1, gy + 2), (gx + 4, gy + 2))   # the red roof
        c.pts("bone", (gx + 2, gy + 2), (gx + 3, gy + 2)).px(gx + 3, gy + 2, "warm1")         # white walls, a door
        c.pts("concrete2", (gx, gy + 2), (gx + 5, gy + 2))
        c.h_(gx, gy + 3, 6, "screen0").px(gx + 2, gy + 3, "screen2")             # the lake
        c.h_(gx, gy + 4, 6, "screen0").px(gx + 4, gy + 4, "screen1")
        c.h_(x0, y0 + 1, 8, "warm2").v_(x0, y0 + 1, 7, "warm2").v_(x0 + 7, y0 + 1, 7, "warm2")   # the screen's frame
    elif kind == "board":
        c.rect(x0, y0 + 1, 8, 7, "warm2")
        for yy in (y0 + 3, y0 + 6):
            c.h_(x0, yy, 8, "warm1")
        c.pts("warm3", (x0 + 1, y0 + 1), (x0 + 5, y0 + 2), (x0 + 2, y0 + 4), (x0 + 6, y0 + 5))
        c.pts("night1", (x0 + 1, y0 + 2), (x0 + 6, y0 + 2), (x0 + 1, y0 + 5), (x0 + 6, y0 + 5))   # nails
        c.px(x0 + 7, y0 + 7, "night1").px(x0 + 4, y0 + 7, "warm3")
    c.h_(x0 - 1, y0 + 8, 10, "bone").px(x0 + 8, y0 + 8, "concrete3")
    for x in range(x0, x0 + 8):
        if c.get(x, y0 + 9) not in (None,):
            c.px(x, y0 + 9, "night2")                                          # the sill's shadow
    return c


def water_table(c, x0=0, w=16):
    c.h_(x0, 28, w, "bone").h_(x0, 29, w, "concrete3").h_(x0, 30, w, "concrete2").h_(x0, 31, w, "night1")
    for x in range(x0 + 3, x0 + w, 6):
        c.px(x, 29, "concrete2")                                                # joints in the marble


def face(c, kind, seed):
    if kind == "brick":
        brick(c, 0, 4, 16, 24, seed)
    else:
        formstone(c, 0, 4, 16, 24, seed)


def bay(kind="brick", up="glass", down="glass", cor="grey", seed=0):
    r = random.Random(f"bay{kind}{up}{down}{seed}")
    c = C(16, 32)
    face(c, kind, f"face{kind}{seed}")
    cornice(c, cor)
    window(c, 4, 6, up, r)
    window(c, 4, 18, down, r)
    water_table(c)
    if kind == "brick":
        streaks(c, r, 1, 4, 14, 2, cols=("night2", "warm0"), lmin=2, lmax=5)      # soot under the cornice
    return c


def door_column(kind="brick", door="warm1", cor="grey", style="plain", seed=0):
    r = random.Random(f"door{kind}{door}{style}{seed}")
    c = C(16, 32)
    face(c, kind, f"face{kind}{seed}")
    cornice(c, cor)
    window(c, 4, 6, {"lit": "lit", "board": "board"}.get(style, "glass"), r)
    # the doorway: marble lintel, a transom, the door, two marble steps out of the recess
    c.h_(2, 18, 12, "bone").px(2, 18, "concrete3")
    c.v_(3, 19, 9, "concrete3").v_(12, 19, 9, "concrete3")                      # painted frame
    c.rect(4, 19, 8, 2, "night1").pts("screen0", (5, 19), (9, 20))              # transom
    if style == "lit":
        c.rect(4, 19, 8, 2, "warm4").pts("warm3", (7, 19), (8, 19))
    dark = {"warm1": "warm0", "screen0": "night2", "night3": "night2", "concrete1": "concrete0"}[door]
    c.rect(4, 21, 8, 7, door)
    c.rect(5, 22, 2, 2, dark).rect(9, 22, 2, 2, dark).rect(5, 25, 2, 2, dark).rect(9, 25, 2, 2, dark)   # panels
    c.px(10, 24, "warm4")                                                       # knob
    water_table(c)
    # steps: two treads, the lower one wider, risers in shadow
    c.h_(4, 28, 8, "bone").h_(4, 29, 8, "concrete3").h_(3, 30, 10, "bone").h_(3, 31, 10, "concrete2")
    c.px(3, 29, "night2").px(12, 29, "night2").px(2, 31, "night1").px(13, 31, "night1")
    if style == "scrubbed":                                                     # scrubbed this morning
        c.pts("screen1", (6, 30), (7, 30), (9, 28)).px(8, 30, "screen2")      # still wet
        c.rect(13, 27, 3, 4, "steel").h_(13, 27, 3, "concrete3").px(14, 27, "screen1").px(15, 30, "concrete1")   # the bucket
        c.pts("warm3", (12, 26), (13, 26)).px(11, 25, "warm3")                 # the brush, propped
    elif style == "board":                                                      # a boarded door: plywood, screwed on
        c.rect(3, 19, 10, 9, "warm2").h_(3, 22, 10, "warm1").h_(3, 25, 10, "warm1")
        c.pts("night1", (4, 20), (11, 20), (4, 26), (11, 26)).pts("warm3", (5, 21), (8, 24), (10, 21))
        c.h_(4, 28, 8, "concrete3").h_(3, 30, 10, "concrete3").pts("concrete2", (5, 28), (9, 30), (6, 30))   # unscrubbed
        weeds(c, r, (3, 12), 31)
    return c


def mural():
    """The Pork mural on a blank end wall: two storeys of him in his plaid, the snout repainted every spring. He's
    smiling with his mouth closed (see the bmore_mural side quest: that's what's wrong)."""
    r = random.Random("mural")
    c = C(48, 32)
    brick(c, 0, 4, 48, 24, "mural-wall")
    cornice(c, "brown")
    water_table(c, 0, 48)
    # the painted ground: harbor sky, faded, bleeding at the edges into the brick
    for y in range(5, 28):
        for x in range(3, 45):
            edge = min(x - 3, 44 - x, y - 5, 27 - y)
            if edge == 0 and chance(r, 0.45):
                continue
            c.px(x, y, "screen1" if y < 20 else "screen0")
    for x in range(4, 44, 3):
        c.px(x + (1 if x % 2 else 0), 19, "screen2")                             # the harbor line
    # shoulders: red plaid over a grey tee
    for y in range(21, 28):
        for x in range(12, 36):
            if (y == 21 and (x < 15 or x > 32)):
                continue
            plaid = "soft1" if (x // 2 + y // 2) % 2 else "soft0"
            if x % 4 == 1 or y % 4 == 3:
                plaid = "night2" if (x % 4 == 1 and y % 4 == 3) else "soft0"
            c.px(x, y, plaid)
    c.rect(21, 21, 6, 7, "concrete2").pts("concrete3", (22, 21), (25, 21))       # the tee
    # the head: a pink dome, dark ears hanging down, the snout, eyes, a closed smile
    c.ell(24, 13.5, 8.5, 7.5, "pork1")
    for x, y in ((19, 8), (20, 7), (22, 6), (23, 6)):
        c.px(x, y, "pork2")                                                     # the dome catching the light
    for y in range(9, 19):
        c.px(31 - (0 if y < 15 else 1), y, "pork0")
    for x, y in ((16, 8), (15, 9), (16, 9), (14, 10), (15, 10), (14, 11), (15, 11), (14, 12), (15, 12), (14, 13), (14, 14)):
        c.px(x, y, "night2").px(48 - x, y, "night2")                            # ears, hanging down
    c.pts("night3", (16, 8), (32, 8), (15, 9), (33, 9))
    c.rect(21, 13, 6, 4, "pork2").h_(22, 12, 4, "pork2").h_(22, 17, 4, "pork0")  # snout
    c.pts("pork0", (22, 14), (25, 14))                                          # nostrils
    c.pts("night0", (20, 11), (28, 11)).pts("bone", (20, 10), (28, 10))         # eyes
    c.h_(22, 19, 4, "pork0").pts("pork0", (21, 18), (26, 18))                   # mouth shut, smiling anyway
    c.rect(20, 20, 8, 1, "pork1")                                               # chin
    # drips and offerings: candle stubs and a folded note at the foot
    for x in (13, 30, 34):
        c.v_(x, 28 - 1, 1, "screen0")
    c.pts("pork0", (19, 21), (19, 22), (29, 21))
    for x in (8, 11, 37):
        c.v_(x, 26, 2, "bone").px(x, 25, "warm4")
    c.pts("bone", (40, 27), (41, 27), (41, 26))
    return c


# ---------------------------------------------------------------------------------------------- containers
SCHEMES = {
    "rust":    dict(top="warm2", mid="warm1", rib="warm0", lit="warm2", base="warm0", streak=("warm2", "warm3"), mark="concrete3"),
    "teal":    dict(top="screen1", mid="screen0", rib="night2", lit="screen1", base="night2", streak=("warm1", "warm2"), mark="concrete3"),
    "mustard": dict(top="warm4", mid="warm3", rib="warm2", lit="warm4", base="warm2", streak=("warm1", "warm2"), mark="warm1"),
    "grey":    dict(top="concrete3", mid="concrete2", rib="concrete1", lit="concrete3", base="concrete1", streak=("warm1", "warm2"), mark="bone"),
    "ca":      dict(top="bone", mid="bone", rib="concrete3", lit="bone", base="concrete3", streak=("warm2", "concrete3"), mark="steel"),
}


def box(c, x0, y0, scheme, seed, top=True, w=30, fh=20, th=6):
    """One shipping container seen from its long side, front face at y0..y0+fh-1, top face above it."""
    s, r = SCHEMES[scheme], random.Random(seed)
    if top:
        c.rect(x0, y0 - th, w, th, s["top"])
        for x in range(x0 + 7, x0 + w - 3, 8):
            c.v_(x, y0 - th, th, s["mid"])                                      # roof panel seams
        for cx in (x0, x0 + w - 2):
            c.h_(cx, y0 - th, 2, "night2").h_(cx, y0 - 1, 2, "night2")            # corner castings
        sx_ = r.randint(x0 + 4, x0 + w - 12)
        c.h_(sx_, y0 - th + 2, 6, s["mid"]).h_(sx_ + 2, y0 - th + 3, 5, s["mid"]).px(sx_ + 3, y0 - th + 2, s["streak"][0])   # rainwater stain on the roof
    for y in range(y0, y0 + fh):
        for x in range(x0, x0 + w):
            c.px(x, y, (s["mid"], s["mid"], s["rib"], s["mid"])[(x - x0) % 4])  # corrugation
    c.h_(x0, y0, w, s["lit"]).h_(x0, y0 + fh - 1, w, s["base"]).h_(x0, y0 + fh - 2, w, s["rib"])
    for cx in (x0, x0 + 1, x0 + w - 2, x0 + w - 1):
        c.v_(cx, y0, fh, s["rib"])
    c.v_(x0, y0, fh, s["lit"])
    if scheme == "ca":                                                         # Continuity's livery: a red band, a ring
        c.h_(x0 + 2, y0 + 12, w - 4, "signal").h_(x0 + 2, y0 + 13, w - 4, "signal")
        c.ell(x0 + 7, y0 + 6.5, 3, 3, "steel", ring=True)
        for x in range(x0 + 14, x0 + 26):
            if chance(r, 0.5):
                c.px(x, y0 + 4, "steel")
    else:                                                                      # a stencilled number, half worn off
        x = x0 + 4
        for n in (4, 3, 2, 3, 3):
            for k in range(n):
                if chance(r, 0.65):
                    c.px(x + k, y0 + 3, s["mark"])
                if chance(r, 0.35):
                    c.px(x + k, y0 + 4, s["mark"])
            x += n + 1
        lx, ly = x0 + w - 9, y0 + 8                                             # a faded owner's mark: a wave
        for k, (dx, dy) in enumerate(((0, 2), (1, 1), (2, 1), (3, 2), (4, 2), (5, 1), (6, 1))):
            if chance(r, 0.7):
                c.px(lx + dx, ly + dy, s["mark"])
    if fh >= 16 and chance(r, 0.7):                                            # a welded patch
        px_, py_ = r.randint(x0 + 3, x0 + w - 10), r.randint(y0 + 6, y0 + fh - 8)
        c.rect(px_, py_, 6, 4, s["lit"] if scheme != "ca" else "concrete3")
        c.pts("steel", (px_, py_), (px_ + 5, py_), (px_, py_ + 3), (px_ + 5, py_ + 3))
    streaks(c, r, x0 + 2, y0 + 1, w - 4, 4, cols=s["streak"], lmin=2, lmax=8)
    c.rect(x0 + w - 6, y0 + fh - 5, 4, 3, s["streak"][0])                      # rust eating a corner
    c.px(x0 + w - 5, y0 + fh - 6, s["streak"][0])
    return c


def single(scheme, seed, w=46):
    """A forty-footer (three tiles long) or, with w=30, a twenty-footer (two)."""
    c = C(w + 2, 32)
    box(c, 1, 11, scheme, seed, w=w)
    c.outline()
    weeds(c, random.Random(seed + "w"), (2, w - 1), 31)
    return c


def double(lower, upper, seed, shift=0):
    c = C(48, 48)
    box(c, 1, 27, lower, seed + "a", top=False, w=46)
    box(c, 1 + shift, 7, upper, seed + "b", w=46)
    c.outline()
    return c


# ---------------------------------------------------------------------------------------------- harbor
def bollard(rope=None):
    c = C(16, 16)
    c.rect(3, 13, 10, 2, "night2").h_(3, 13, 10, "night3")                      # base plate, bolted to the quay
    c.rect(5, 7, 6, 6, "night3").v_(10, 7, 6, "night2").v_(5, 7, 6, "steel")    # body
    c.h_(5, 9, 6, "warm4").pts("night2", (7, 9), (10, 9))                       # the yellow band, chipped
    c.rect(4, 5, 8, 2, "night3").h_(4, 5, 8, "steel").px(11, 6, "night2")       # the cap
    c.pts("warm1", (6, 10), (6, 11), (9, 11)).px(9, 12, "warm2")                # rust
    c.pts("night1", (4, 14), (11, 14))
    c.outline()
    if rope:                                                                    # a hawser, two turns and away
        c.h_(4, 8, 8, "warm3").h_(4, 11, 8, "warm3").pts("warm2", (5, 8), (8, 8), (6, 11), (9, 11))
        c.pts("warm1", (4, 9), (11, 9), (4, 12))
        if rope == "e":
            for x, y in ((12, 9), (13, 9), (14, 10), (15, 10)):
                c.px(x, y, "warm3").px(x, y + 1, "warm1")
        else:
            for x, y in ((9, 12), (9, 13), (10, 14), (10, 15)):
                c.px(x, y, "warm3").px(x + 1, y, "warm1")
    return c


def quay_e():
    """Land tile on an east-facing quay: concrete apron, the coping, a worn safety line, tyres over the edge."""
    r = random.Random("quay_e")
    c = C(16, 16).rect(0, 0, 16, 16, "concrete1")
    for _ in range(14):
        c.px(r.randrange(12), r.randrange(16), r.choice(("concrete0", "concrete2")))
    c.h_(0, 7, 12, "concrete0")                                                 # an expansion joint
    for y in range(0, 16, 3):
        if y % 6 == 0:
            c.v_(10, y, 2, "warm4")                                             # the edge line, mostly gone
    c.v_(11, 0, 16, "night2").v_(12, 0, 16, "concrete3").v_(13, 0, 16, "concrete2").v_(14, 0, 16, "concrete2").v_(15, 0, 16, "night1")
    c.rect(13, 3, 3, 5, "night1").pts("night0", (14, 4), (14, 5), (14, 6)).px(13, 3, "night2")   # a tyre fender
    c.rect(13, 11, 3, 4, "night1").pts("night0", (14, 12), (14, 13))
    c.pts("steel", (12, 2), (12, 10))                                           # chains
    c.pts("yerba0", (11, 14), (10, 15)).px(11, 15, "yerba1")
    return c


def quay_s():
    """Water tile under a south-facing quay: the quay wall, weed at the waterline, a tyre on a chain, the water."""
    c = C(16, 16)
    c.h_(0, 0, 16, "bone").h_(0, 1, 16, "concrete3")
    c.rect(0, 2, 16, 8, "concrete1")
    for x in (2, 7, 12):
        c.v_(x, 2, 8, "concrete0")                                              # streaks down the wall
    c.pts("warm1", (9, 3), (9, 4), (9, 5), (4, 3), (4, 4))
    c.h_(0, 9, 16, "yerba0").pts("yerba1", (1, 9), (6, 9), (13, 9)).pts("yerba0", (3, 10), (10, 10))
    c.ell(8, 6, 3, 2.6, "night1", ring=True).pts("night0", (8, 6)).pts("steel", (8, 2), (8, 3))
    c.rect(0, 10, 16, 6, "screen0").pts("night2", *[(x, 10) for x in range(0, 16, 2)])
    c.h_(2, 12, 4, "screen1").h_(9, 13, 5, "screen1").pts("screen2", (4, 12), (11, 13))
    return c


def pier(end=False):
    """A timber pier deck running east, planks across it, a steel plate bolted over a hole."""
    r = random.Random(f"pier{end}")
    c = C(16, 16)
    c.h_(0, 0, 16, "warm3").h_(0, 1, 16, "warm1")
    for x in range(16):
        col = ("warm2", "warm2", "warm1", "warm0")[x % 4]
        c.v_(x, 2, 10, col)
    for x in range(0, 16, 4):
        if chance(r, 0.6):
            c.px(x + 1, r.randint(3, 10), "warm3")                              # nail heads, wear
    if not end:
        c.rect(8, 4, 4, 4, "steel").pts("concrete1", (8, 4), (11, 4), (8, 7), (11, 7)).px(9, 5, "concrete3")   # the patch
        c.rect(1, 9, 2, 2, "screen0")                                           # a plank gone: water below
    c.h_(0, 12, 16, "warm1").h_(0, 13, 16, "warm0").h_(0, 14, 16, "night1").h_(0, 15, 16, "screen0")
    for x in (2, 9):
        c.rect(x, 14, 2, 2, "warm0")                                            # piling tops under the edge
    if end:
        c.v_(13, 0, 14, "warm1").v_(14, 0, 14, "warm0").v_(15, 0, 14, "night1")   # end beam
        c.rect(12, 1, 3, 3, "warm1").h_(12, 1, 3, "warm3").px(13, 2, "warm0")    # mooring post
        for y in range(5, 12, 2):
            c.h_(13, y, 2, "steel")                                             # a ladder down
    return c


def crane_bogie():
    c = C(16, 16)
    c.rect(2, 7, 12, 5, "concrete1").h_(2, 7, 12, "steel").v_(13, 8, 4, "night2")
    for x in range(3, 13, 3):
        c.px(x, 9, "warm4").px(x + 1, 10, "night0")                             # hazard stripes, faded
    c.rect(6, 0, 4, 7, "bone").v_(9, 0, 7, "concrete3")                         # the leg's foot
    c.pts("warm2", (7, 2), (7, 3), (6, 5))
    for x in (4, 11):
        c.ell(x + 0.5, 13, 2.2, 2.2, "night1").px(x, 13, "steel")
    c.h_(0, 15, 16, "steel")
    c.outline()
    c.h_(0, 15, 16, "steel")
    return c


def crane():
    """A ship-to-shore crane, side on, boom out over the water to the east. Continuity's livery (bone and steel),
    rust where the paint lifted, a box hanging from the spreader: it picked one up and is thinking about it."""
    W, H, cx = 152, 96, 76
    r = random.Random("crane")
    c = C(W, H)
    lL, lW = cx - 26, cx + 22                                                   # leg x (4 wide each)
    for lx in (lL, lW):
        c.rect(lx, 26, 4, 60, "bone").v_(lx + 3, 26, 60, "concrete3").v_(lx, 26, 60, "concrete3")
        c.v_(lx + 1, 26, 60, "bone")
        for y in range(30, 84, 9):
            c.h_(lx, y, 4, "concrete3")                                         # bolted joints
    c.rect(cx - 30, 40, 60, 5, "bone").h_(cx - 30, 44, 60, "concrete3").h_(cx - 30, 40, 60, "concrete3")   # portal beam
    c.h_(cx - 30, 41, 60, "bone")
    c.rect(cx - 30, 34, 60, 2, "concrete3")                                     # upper tie
    # the girder: boom and backreach, a truss with lacing
    gx0, gx1, gy = cx - 60, cx + 70, 22
    c.h_(gx0, gy, gx1 - gx0, "bone").h_(gx0, gy + 5, gx1 - gx0, "concrete3")
    c.h_(gx0, gy + 1, gx1 - gx0, "concrete3")
    for x in range(gx0, gx1, 4):
        c.line(x, gy + 1, x + 2, gy + 4, "steel").line(x + 2, gy + 4, x + 4, gy + 1, "steel")
    for x in range(gx0, gx1, 3):
        c.px(x, gy - 1, "steel")                                                # handrail
    c.rect(gx1 - 4, gy + 1, 4, 3, "concrete3")
    # the A-frame and its stays
    ax, ay = cx - 6, 2
    c.line(cx - 24, gy, ax, ay, "bone").line(cx - 23, gy, ax + 1, ay, "concrete3")
    c.line(cx + 20, gy, ax + 2, ay, "bone").line(cx + 21, gy, ax + 3, ay, "concrete3")
    c.rect(ax - 1, ay - 1, 5, 3, "bone").h_(ax - 1, ay + 1, 5, "concrete3")
    # machinery house on the backreach
    mx0, mx1 = cx - 58, cx - 36
    c.rect(mx0, 12, mx1 - mx0, 10, "concrete3").h_(mx0, 12, mx1 - mx0, "bone").h_(mx0, 21, mx1 - mx0, "concrete2")
    for x in range(mx0 + 3, mx1, 5):
        c.v_(x, 13, 8, "concrete2")
    c.h_(mx0 + 2, 15, mx1 - mx0 - 4, "screen0").pts("screen1", (mx0 + 4, 15), (mx0 + 12, 15))
    c.pts("concrete1", (mx0 + 3, 18), (mx0 + 4, 18), (mx0 + 6, 18), (mx0 + 7, 18))   # a faded number
    # trolley, cab, cables, spreader, and the box
    tx = cx + 38
    c.rect(tx, gy + 6, 12, 3, "steel").h_(tx, gy + 6, 12, "concrete3")
    c.rect(tx + 1, gy + 9, 8, 6, "bone").v_(tx + 8, gy + 9, 6, "concrete3").rect(tx + 2, gy + 10, 5, 2, "screen1")
    c.px(tx + 3, gy + 10, "screen2")
    sy = 58
    c.rect(tx - 10, sy, 32, 2, "warm4").pts("night1", *[(x, sy + 1) for x in range(tx - 8, tx + 22, 5)])
    box(c, tx - 10, sy + 6, "teal", "crane-box", w=32, fh=13, th=4)
    # rust and grime on the white
    for lx in (lL, lW):
        streaks(c, r, lx, 45, 4, 2, cols=("warm2",), lmin=3, lmax=8, over=("bone", "concrete3"))
    streaks(c, r, cx - 30, 45, 60, 6, cols=("warm2", "concrete2"), lmin=1, lmax=3, over=None)
    streaks(c, r, gx0, gy + 6, gx1 - gx0, 7, cols=("warm2",), lmin=1, lmax=2)
    c.outline()
    # cables and stays go on after the outline: thin lines, no ink
    c.line(ax + 2, ay + 1, cx + 62, gy - 1, "steel", only_empty=True)
    c.line(ax + 2, ay + 1, cx + 36, gy - 1, "steel", only_empty=True)
    c.line(ax, ay + 1, gx0 + 2, gy - 1, "steel", only_empty=True)
    for x in (tx + 1, tx + 9):
        c.line(x, gy + 15, x, sy - 1, "night2", only_empty=True)
    for x in (tx - 9, tx + 20):
        c.line(x, sy + 2, x + (2 if x < tx else -2), sy + 1 + 4, "night2", only_empty=True)
    c.pts("warm4", (gx1 - 1, gy - 1), (cx - 20, gy + 7), (cx + 15, gy + 7))      # lamps (amber: the balloon owns orange)
    c.px(mx0 + 1, 11, "warm4")
    return c


# ---------------------------------------------------------------------------------------------- rail
def rail_h(more_weeds=False):
    r = random.Random(f"rail{more_weeds}")
    c = C(16, 16).rect(0, 0, 16, 16, "night2")
    for _ in range(40):
        c.px(r.randrange(16), r.randrange(16), r.choice(("concrete0", "concrete1", "night3", "concrete1")))
    for x in range(1, 16, 4):
        if more_weeds and x == 9:
            continue                                                            # a sleeper gone
        c.rect(x, 3, 2, 10, "warm1").px(x, 3, "warm2").px(x + 1, 12, "warm0")
    for y in (5, 10):
        c.h_(0, y - 1, 16, "bone").h_(0, y, 16, "steel").h_(0, y + 1, 16, "night1")
        c.pts("warm2", (r.randrange(16), y), (r.randrange(16), y))
    weeds(c, r, (3, 12) + ((7, 8, 14) if more_weeds else ()), 15 if more_weeds else 14)
    if more_weeds:
        weeds(c, r, (1, 10), 8)
    return c


def rail_stop():
    c = C(16, 24)
    c.rect(2, 20, 12, 3, "concrete1").pts("concrete2", (3, 20), (8, 21), (12, 20))   # a heap of ballast
    c.v_(3, 10, 11, "warm1").v_(12, 10, 11, "warm1").line(3, 20, 7, 12, "warm1").line(12, 20, 8, 12, "warm1")
    c.rect(1, 10, 14, 4, "warm4")
    for x in range(1, 15, 3):
        c.px(x, 11, "night1").px(x + 1, 12, "night1")                           # stripes
    c.h_(1, 13, 14, "warm2").pts("warm1", (5, 10), (11, 11), (13, 12))          # faded, rusting through
    c.rect(4, 11, 2, 2, "night2").rect(10, 11, 2, 2, "night2")                  # buffers
    c.outline()
    weeds(c, random.Random("stop"), (1, 6, 14), 23)
    return c


def flatcar(cargo):
    c = C(48, 40)
    c.rect(2, 28, 44, 3, "warm1").h_(2, 28, 44, "warm2").h_(2, 31, 44, "night2")
    for x in range(4, 44, 6):
        c.px(x, 29, "warm0")                                                    # stake pockets
    for tx in (5, 31):
        c.rect(tx, 32, 12, 3, "night2").h_(tx, 32, 12, "concrete1")
        for wx in (tx + 2, tx + 8):
            c.ell(wx + 1, 36, 2.6, 2.6, "night1").px(wx + 1, 36, "steel")
    c.rect(0, 29, 2, 2, "steel").rect(46, 29, 2, 2, "steel")                     # couplers
    streaks(c, random.Random("fc"), 3, 29, 42, 4, cols=("warm2",), lmin=1, lmax=2)
    if cargo == "box":
        box(c, 8, 8, "rust", "flatcar-box", w=32)
    else:                                                                       # chained-down scrap and a tarp
        c.rect(6, 22, 14, 6, "concrete2").h_(6, 22, 14, "concrete3").pts("concrete1", (9, 24), (15, 25), (12, 23))
        c.ell(30, 25, 8, 3.5, "night2").ell(30, 24, 6, 2.5, "night3").pts("steel", (27, 23), (31, 22), (33, 24))   # a cable drum
        c.v_(5, 22, 6, "steel").v_(21, 22, 6, "steel")
        c.pts("yerba1", (40, 27), (41, 26), (24, 27)).pts("yerba0", (41, 27), (25, 27))
    c.outline()
    return c


# ---------------------------------------------------------------------------------------------- the refinery
def wall_ref(kind="plain"):
    """The refinery's wall: corrugated cladding over an old brick base, a steam main and a sugar line running the
    length of it (same height on every piece so the run joins up)."""
    r = random.Random(f"ref{kind}")
    c = C(16, 32)
    c.h_(0, 0, 16, "night0").h_(0, 1, 16, "concrete3").h_(0, 2, 16, "concrete1")
    corrugated(c, 0, 3, 16, 17)
    streaks(c, r, 0, 3, 16, 4, cols=("warm1", "warm2"), lmin=2, lmax=9)
    c.h_(0, 20, 16, "night1")
    brick(c, 0, 21, 16, 8, f"refbrick{kind}", tones=("warm1", "warm1", "soft0", "warm0"))
    c.h_(0, 29, 16, "concrete2").h_(0, 30, 16, "concrete1").h_(0, 31, 16, "night1")
    if kind == "vent":
        c.rect(3, 4, 10, 6, "night1")
        for y in range(5, 10, 2):
            c.h_(3, y, 10, "concrete1")
        c.pts("night2", (5, 3), (8, 3), (6, 2), (9, 2))                         # soot above it
    if kind == "door":                                                          # a roll-up door, half rusted shut
        c.rect(2, 9, 12, 20, "concrete2")
        for y in range(10, 29, 2):
            c.h_(2, y, 12, "concrete1")
        c.v_(1, 9, 20, "warm4").v_(14, 9, 20, "warm4")
        for y in range(10, 29, 3):
            c.px(1, y, "night1").px(14, y + 1, "night1")
        c.rect(2, 26, 12, 3, "warm1").pts("warm2", (4, 26), (9, 27), (12, 26))
        c.pts("bone", (7, 12), (8, 12), (8, 13), (7, 14), (8, 14))             # a stencilled bay number
    # the steam main (steel, lagged and banded) and the sugar line under it
    c.h_(0, 11, 16, "bone").h_(0, 12, 16, "steel").h_(0, 13, 16, "steel").h_(0, 14, 16, "concrete1")
    c.v_(7, 11, 4, "night3").v_(8, 11, 4, "concrete3")                          # a flange
    c.px(3, 15, "night2").px(12, 15, "night2")                                  # brackets
    c.h_(0, 17, 16, "warm3").h_(0, 18, 16, "warm1")
    c.pts("warm2", (2, 17), (10, 18), (13, 17))
    if kind == "valve":
        c.rect(10, 15, 2, 14, "steel").v_(11, 15, 14, "concrete1")
        c.ell(11, 22, 2.6, 2.6, "warm3", ring=True).px(11, 22, "night1")        # the wheel
        c.rect(3, 23, 3, 3, "bone").pts("concrete3", (3, 23), (5, 23), (3, 25), (5, 25)).px(4, 24, "night0").px(5, 24, "night0")   # a gauge
        c.v_(4, 26, 3, "steel")
    if kind == "door":
        c.rect(2, 11, 12, 4, "concrete2").rect(2, 17, 12, 2, "concrete2")
        for y in (12, 14, 18):
            c.h_(2, y, 12, "concrete1")                                         # pipes dip behind the door frame
        c.v_(2, 11, 8, "steel").v_(13, 11, 8, "steel")
    return c


def smokestack():
    r = random.Random("stack")
    c = C(16, 64)
    for y in range(4, 56):
        t = (y - 4) / 51
        half = 4 + round(t * 2)                                                 # 8 wide at the top, 12 at the foot
        x0, x1 = 8 - half, 8 + half
        for x in range(x0, x1):
            Y = y
            col = "warm0" if (Y % 3 == 2 or (x + (2 if (Y // 3) % 2 else 0)) % 4 == 3) else ("soft0" if (x * 7 + Y) % 5 else "warm1")
            if x == x0:
                col = "warm2"
            if x >= x1 - 2:
                col = "warm0" if col != "night2" else col
            c.px(x, y, col)
    for y in (13, 25, 37, 49):
        t = (y - 4) / 51
        half = 4 + round(t * 2)
        c.h_(8 - half - 1, y, 2 * half + 2, "steel").h_(8 - half, y + 1, 2 * half, "night2")
        c.pts("warm2", (8 - half + 2, y + 2), (8 - half + 2, y + 3), (8 + half - 3, y + 2))
    for y in range(7, 55, 2):
        t = (y - 4) / 51
        c.px(8 + 4 + round(t * 2) - 2, y, "steel")                              # the ladder
    c.rect(3, 2, 10, 3, "night1").h_(3, 4, 10, "concrete1").pts("night0", (5, 2), (9, 2), (11, 3))   # soot crown
    c.rect(1, 56, 14, 8, "concrete2").h_(1, 56, 14, "concrete3").v_(14, 57, 7, "concrete1").h_(1, 63, 14, "concrete1")
    c.pts("concrete1", (4, 59), (10, 61))
    c.outline()
    c.pts("concrete3", (7, 0), (8, 1), (6, 1), (9, 0))                          # a breath of steam: it still runs
    weeds(c, r, (0, 2, 13, 15), 63)
    return c


def silo():
    r = random.Random("silo")
    c = C(32, 48)
    for y in range(10, 45):
        for x in range(3, 29):
            col = "concrete2"
            if x < 6:
                col = "concrete3"
            elif x > 25:
                col = "night3"
            elif x > 21:
                col = "concrete1"
            if (y - 10) % 7 == 6:
                col = "concrete1" if col != "night3" else col                    # pour lines
            c.px(x, y, col)
    c.ell(16, 10, 13, 4, "concrete3").ell(16, 10, 11, 3, "concrete2")           # the roof, seen from above
    c.line(5, 9, 15, 3, "concrete3").line(27, 9, 17, 3, "concrete1")
    c.rect(14, 2, 4, 3, "steel").h_(14, 2, 4, "bone")                           # hatch
    for x in range(4, 29, 3):
        c.px(x, 7 + (1 if 9 < x < 23 else 0) - (1 if 12 < x < 20 else 0), "steel")   # a railing round the top
    for y in range(44, 46):
        for x in range(4, 28):
            c.px(x, y, "concrete1")
    c.h_(5, 46, 22, "night2")
    for y in range(14, 44, 3):
        c.h_(22, y, 3, "steel")                                                 # ladder cage
    c.v_(21, 13, 31, "steel").v_(25, 13, 31, "steel")
    for x in range(8, 20):
        if chance(r, 0.55):
            c.px(x, 19, "bone")                                                 # a faded band
        if chance(r, 0.35):
            c.px(x, 20, "bone")
    streaks(c, r, 6, 14, 15, 5, cols=("bone", "warm4"), lmin=1, lmax=4)         # sugar crust down from the roof
    streaks(c, r, 4, 26, 22, 4, cols=("warm1",), lmin=2, lmax=6)
    c.outline()
    weeds(c, r, (3, 27), 47)
    return c


# The rooftop sign. Each letter is neon tube on a raceway: lit = soft-red tube, bone-hot core, soft0 halo.
GLYPHS = {
    "S": [[(21, 4), (18, 1), (5, 1), (2, 4), (2, 10), (5, 13), (18, 13), (21, 16), (21, 22), (18, 25), (5, 25), (2, 22)]],
    "H": [[(2, 0), (2, 26)], [(21, 0), (21, 26)], [(2, 13), (21, 13)]],
    "O": [[(5, 0), (18, 0), (21, 3), (21, 23), (18, 26), (5, 26), (2, 23), (2, 3), (5, 0)]],
    "A": [[(2, 26), (10, 1), (13, 1), (21, 26)], [(5, 18), (18, 18)]],
    "L": [[(3, 0), (3, 25), (21, 25)]],
}


def letter(ch, state="lit"):
    c = C(32, 32)
    ox, oy = 4, 3
    c.rect(3, 14, 26, 3, "night3" if state != "off" else "concrete1").h_(3, 14, 26, "steel")   # the raceway
    c.rect(8, 28, 2, 4, "steel").rect(22, 28, 2, 4, "steel")                    # brackets down to the wall
    core = set()
    for path in GLYPHS[ch]:
        for (x0, y0), (x1, y1) in zip(path, path[1:]):
            tmp = C(32, 32).line(x0 + ox, y0 + oy, x1 + ox, y1 + oy, "bone")
            core.update(tmp.where("bone"))
    tube = {(x + dx, y + dy) for x, y in core for dx in (-1, 0, 1) for dy in (-1, 0, 1)}
    dead = set()
    if state == "sputter":                                                      # half the S out
        dead = {(x, y) for x, y in tube if y > 16}
    for (x, y) in tube:
        lit = state == "lit" or (state == "sputter" and (x, y) not in dead)
        c.px(x, y, "soft1" if lit else "night3")
    for (x, y) in core:
        lit = state == "lit" or (state == "sputter" and (x, y) not in dead)
        c.px(x, y, "bone" if lit else "concrete1")
    if state == "lit" or state == "sputter":
        for (x, y) in list(tube):
            if state == "sputter" and (x, y) in dead:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if c.get(x + dx, y + dy) in (None, "night3", "steel") and (x + dx, y + dy) not in tube:
                    c.px(x + dx, y + dy, "soft0")
    if state != "lit":
        c.outline()
    return c


def sign_switch():
    c = C(16, 24)
    c.rect(7, 0, 2, 8, "steel").v_(8, 0, 8, "concrete1")                        # conduit up to the sign
    c.rect(3, 8, 10, 12, "concrete2").h_(3, 8, 10, "concrete3").v_(12, 9, 11, "concrete1")
    c.rect(4, 10, 2, 7, "night1").rect(5, 10, 1, 2, "steel")                    # the slot
    c.rect(5, 5, 2, 6, "steel").px(5, 4, "concrete3").px(6, 4, "concrete3")     # the lever, up
    for y in (6, 8, 9):
        c.h_(4, y, 4, "bone")                                                   # taped, again and again
    c.px(7, 7, "warm4").px(4, 7, "warm4")
    c.rect(7, 12, 5, 5, "bone").pts("night2", (8, 13), (9, 13), (10, 13), (8, 15), (9, 15))   # the note
    c.px(11, 12, "warm3")
    c.pts("warm4", (9, 18), (8, 19), (10, 19)).px(9, 19, "night1")              # a warning triangle
    c.rect(4, 20, 2, 3, "night2").rect(10, 20, 2, 3, "night2")
    c.outline()
    return c


# ---------------------------------------------------------------------------------------------- the Callers' hall
def wall_hall(kind="window"):
    """The old cannery floor the Callers took over: brick, tall arched windows, a wainscot of boards."""
    r = random.Random(f"hall{kind}")
    c = C(16, 32)
    brick(c, 0, 0, 16, 27, f"hall{kind}", tones=("soft0", "warm1", "warm1", "soft0", "warm0"))
    c.h_(0, 0, 16, "night0").h_(0, 1, 16, "night1")
    if kind == "window":
        c.rect(4, 6, 8, 19, "night1")
        c.h_(5, 4, 6, "concrete3").pts("concrete3", (4, 5), (11, 5)).h_(5, 5, 6, "night1")   # the arch
        c.v_(3, 6, 19, "concrete3").v_(12, 6, 19, "concrete3")
        c.v_(7, 5, 20, "concrete2").v_(8, 5, 20, "night2")
        for y in (11, 17, 22):
            c.h_(4, y, 8, "concrete2")
        c.rect(9, 12, 3, 5, "warm2").pts("warm1", (10, 13), (10, 15))          # a pane replaced with plywood
        c.pts("screen1", (5, 7), (6, 8)).px(10, 7, "night3").px(5, 19, "screen0")
        c.h_(3, 25, 10, "concrete3").h_(3, 26, 10, "night2")
    else:                                                                       # an iron column, a lamp on a hook
        c.rect(6, 2, 4, 25, "steel").v_(9, 2, 25, "concrete1").v_(6, 2, 25, "concrete3")
        c.rect(5, 2, 6, 2, "steel").h_(5, 3, 6, "concrete1")
        c.h_(10, 9, 3, "night2").v_(12, 9, 2, "night2")
        c.rect(11, 11, 3, 4, "warm4").px(12, 12, "bone").h_(11, 15, 3, "night2").px(12, 10, "night1")
        c.pts("warm3", (10, 12), (14, 13))
    c.rect(0, 27, 16, 5, "warm1")
    for x in range(0, 16, 4):
        c.v_(x, 27, 5, "warm0")
    c.h_(0, 27, 16, "warm2").h_(0, 31, 16, "night1")
    return c


def banner_pork():
    """A Callers' banner, hand painted on sailcloth. Here they got his smile right."""
    c = C(32, 32)
    c.h_(2, 0, 28, "warm1").pts("warm2", (2, 0), (29, 0))                       # the rod
    c.rect(5, 1, 22, 16, "bone").v_(26, 1, 16, "concrete3").h_(5, 16, 22, "concrete3")
    for x in range(5, 27, 2):
        c.px(x, 17, "bone")                                                     # a ragged hem
    c.ell(16, 7.5, 5.5, 5, "pork1")
    c.pts("night2", (11, 4), (10, 5), (11, 5), (10, 6), (10, 7), (9, 8), (20, 4), (20, 5), (21, 5), (21, 6), (21, 7), (22, 8))   # ears
    c.rect(14, 7, 4, 3, "pork2").pts("pork0", (14, 8), (17, 8))                 # snout
    c.pts("night1", (13, 5), (19, 5))
    c.h_(12, 11, 8, "night1").pts("night1", (11, 10), (20, 10))                 # the long smile
    for x0, w in ((7, 6), (14, 4), (19, 6)):
        c.h_(x0, 14, w, "warm1")                                                # hand lettering
    c.pts("warm1", (8, 15), (12, 15), (17, 15), (22, 15))
    c.rect(22, 2, 3, 3, "warm3").pts("warm2", (22, 2), (24, 4))                 # a patch
    c.outline()
    c.pts("warm1", (6, 0), (25, 0))
    return c


def pew(part):
    """A pew made from a market stall: planks for a back, crates for legs, the stall's posts at the ends."""
    c = C(16, 24)
    c.rect(0, 11, 16, 3, "warm2").h_(0, 11, 16, "warm3").rect(0, 15, 16, 2, "warm2").h_(0, 14, 16, "warm0")
    c.h_(0, 17, 16, "warm0").h_(0, 18, 16, "warm1")
    for x in (2, 13):
        c.rect(x, 19, 2, 4, "warm0")
    c.pts("warm1", (5, 12), (11, 15), (8, 12))
    if part == "l":
        c.rect(0, 2, 2, 21, "warm1").v_(0, 2, 21, "warm2").h_(0, 2, 6, "concrete3").h_(0, 3, 6, "bone").pts("concrete3", (1, 4), (3, 4), (5, 4))
    if part == "r":
        c.rect(14, 2, 2, 21, "warm1").v_(14, 2, 21, "warm2").h_(10, 2, 6, "concrete3").h_(10, 3, 6, "bone").pts("concrete3", (10, 4), (12, 4), (14, 4))
    c.outline()
    if part != "l":
        for y in range(c.h):
            if c.get(0, y) == "night0" and c.get(1, y) not in (None, "night0"):
                c.px(0, y, c.get(1, y))
    if part != "r":
        for y in range(c.h):
            if c.get(15, y) == "night0" and c.get(14, y) not in (None, "night0"):
                c.px(15, y, c.get(14, y))
    return c


def book_stand():
    """The Callers' book on a stall post: a thousand entries, slips of paper sticking out of it."""
    c = C(16, 24)
    c.rect(7, 15, 2, 7, "warm1").v_(8, 15, 7, "warm0").rect(4, 22, 8, 2, "warm0")
    c.rect(2, 11, 12, 4, "warm2").h_(2, 11, 12, "warm3")                        # the slanted top
    c.rect(2, 8, 12, 4, "bone").h_(3, 7, 4, "bone").h_(9, 7, 4, "bone").v_(7, 8, 4, "concrete3")   # pages bowing
    c.pts("concrete3", (3, 9), (4, 9), (5, 9), (3, 11), (4, 11), (9, 8), (10, 8), (11, 8), (12, 8), (9, 10), (10, 10), (12, 10))   # handwriting
    c.h_(2, 12, 12, "warm4")                                                    # the page block, thick
    c.pts("bone", (5, 6), (11, 5), (11, 6))                                     # slips stuck in
    c.v_(9, 12, 4, "warm4")                                                     # a ribbon
    c.outline()
    c.v_(1, 19, 3, "bone").px(1, 18, "warm4")                                   # a candle stub
    return c


# ---------------------------------------------------------------------------------------------- the port authority
def wall_ca(kind="panel"):
    """Continuity's office: bone panels and steel, clean enough to read your reflection in."""
    c = C(16, 32)
    c.rect(0, 0, 16, 32, "bone")
    c.h_(0, 0, 16, "night1").h_(0, 1, 16, "concrete3")
    c.v_(0, 2, 26, "concrete3").v_(8, 2, 26, "concrete3").h_(0, 16, 16, "concrete3")
    c.h_(0, 28, 16, "steel").h_(0, 29, 16, "steel").h_(0, 30, 16, "concrete1").h_(0, 31, 16, "night1")
    if kind == "panel":
        c.px(12, 20, "screen2").px(12, 21, "screen0")                           # a status light
    if kind in ("window", "crane"):
        c.rect(0, 2, 16, 26, "steel")
        for y in range(4, 26):
            col = "night2" if y < 13 else "night3" if y < 17 else "night0" if y < 19 else "screen0"
            c.h_(1, y, 14, col)
        c.pts("warm4", (3, 17), (9, 18), (13, 17)).pts("screen2", (6, 18), (11, 17))   # the far shore's lights
        c.h_(2, 21, 3, "screen1").h_(9, 23, 4, "screen1").px(10, 21, "screen1").px(4, 24, "screen1")   # reflections
        c.h_(1, 11, 14, "steel").v_(15, 2, 26, "concrete1")
        c.pts("night3", (3, 5), (4, 6), (11, 13), (12, 14))                     # glare on the glass
        if kind == "crane":                                                     # a crane across the water
            c.v_(4, 10, 8, "night0").v_(8, 10, 8, "night0").h_(1, 10, 14, "night0").h_(4, 13, 5, "night0")
            c.line(5, 10, 6, 6, "night0").line(8, 10, 7, 6, "night0").line(7, 6, 14, 9, "night1").px(14, 10, "warm4")
        c.h_(0, 26, 16, "steel").h_(0, 27, 16, "concrete3")
    if kind == "flag":                                                          # Continuity's banner
        c.rect(3, 3, 10, 21, "bone").v_(3, 3, 21, "steel").v_(12, 3, 21, "steel").h_(3, 3, 10, "steel")
        c.h_(2, 2, 12, "concrete1")
        c.ell(8, 10, 3, 3, "steel", ring=True)
        c.h_(4, 16, 8, "signal").h_(4, 17, 8, "signal")
        for x in range(4, 12, 2):
            c.px(x, 24, "steel")
        c.v_(13, 4, 20, "concrete3")
    return c


def ledger_ca():
    """The port ledger: a steel desk, a printout as thick as a brick, the next page still coming out."""
    c = C(16, 24)
    c.rect(3, 12, 10, 10, "concrete3").h_(3, 12, 10, "bone").v_(12, 13, 9, "concrete1")
    c.h_(3, 16, 10, "steel").px(11, 14, "screen2").h_(4, 19, 4, "signal")
    c.rect(4, 7, 8, 5, "bone").h_(4, 7, 8, "bone")
    for y in (8, 9, 10, 11):
        c.h_(4, y, 8, "concrete3" if y % 2 else "bone")                         # the edge of the stack
    c.pts("steel", (5, 9), (8, 9), (6, 11))
    c.rect(2, 11, 2, 11, "bone").pts("steel", (2, 13), (2, 16), (2, 19))       # tractor feed down the side
    c.rect(1, 21, 4, 2, "bone").px(5, 22, "bone")
    c.rect(4, 22, 2, 2, "night2").rect(10, 22, 2, 2, "night2")
    c.outline()
    return c


# ---------------------------------------------------------------------------------------------- skyline
def sky_base(seed):
    c = C(144, 16)
    for y in range(16):
        c.h_(0, y, 144, "night1" if y < 3 else "night2" if y < 7 else "night3")
    r = random.Random(seed)
    for _ in range(10):
        c.px(r.randrange(144), r.randrange(5), "night3")                        # the few stars the haze lets through
    return c, r


def parapet(c):
    c.h_(0, 13, 144, "concrete1").h_(0, 14, 144, "night2").h_(0, 15, 144, "night0")
    for x in range(5, 144, 12):
        c.px(x, 13, "concrete2")


def lit_windows(c, r, x0, x1, ytop, ybot, p=0.07, cols=("warm4", "warm4", "screen1")):
    for y in range(ytop + 1, ybot, 2):
        for x in range(x0 + 1, x1 - 1, 2):
            if chance(r, p):
                c.px(x, y, r.choice(cols))


def tower(c, r, x, w, top, col="night0", base=13, lights=0.07):
    c.rect(x, top, w, base - top, col)
    lit_windows(c, r, x, x + w, top, base, lights)


def sky_cranes():
    """Across the water: the container terminal, four cranes, and the refinery with its letters lit."""
    c, r = sky_base("sky-cranes")
    c.rect(0, 11, 144, 2, "screen0")
    for x in range(0, 144, 5):
        c.px(x + r.randrange(3), 11, "night2")
    for x0, w, hgt in ((2, 14, 3), (18, 10, 2), (30, 16, 4), (60, 12, 3), (74, 18, 2)):
        tower(c, r, x0, w, 11 - hgt, "night1", base=11, lights=0.0)
        for x in range(x0, x0 + w, 3):
            c.px(x, 11 - hgt, r.choice(("night3", "night2")))                    # boxes in rows
    for x in (8, 34, 52, 80):                                                   # cranes, small and far
        c.v_(x, 4, 7, "night0").v_(x + 5, 4, 7, "night0").h_(x - 4, 4, 17, "night0").h_(x, 6, 6, "night0")
        c.line(x + 1, 4, x + 2, 1, "night0").line(x + 4, 4, x + 3, 1, "night0").px(x + 12, 4, "warm4")
    tower(c, r, 104, 22, 7, "night0", base=11, lights=0.05)                     # the refinery
    for x in (107, 112):
        c.rect(x, 4, 4, 3, "night0").h_(x, 4, 4, "night1")                      # silos
    c.rect(116, 2, 9, 2, "night1")
    for x in range(116, 125):
        if (x - 116) % 2 == 0:
            c.px(x, 2, "soft1").px(x, 3, "soft1")                               # five letters, too far to read
        else:
            c.px(x, 2, "soft0")
    for x in range(115, 126, 3):
        c.px(x, 12, "soft0")                                                    # in the water
    tower(c, r, 128, 16, 9, "night1", base=11, lights=0.06)
    parapet(c)
    return c


def sky_downtown():
    """Downtown: a stepped deco crown lit amber, a clock tower, the five-sided tower, plain glass between."""
    c, r = sky_base("sky-downtown")
    x = 0
    for w, top in ((9, 8), (6, 5), (11, 7), (5, 9)):
        tower(c, r, x, w, top, "night1")
        x += w
    tower(c, r, 31, 8, 3, "night0")                                             # the deco tower
    c.rect(32, 2, 6, 1, "night0").rect(33, 1, 4, 1, "night0").rect(34, 0, 2, 1, "night0")
    c.pts("warm4", (34, 0), (35, 0), (33, 1), (36, 1)).px(34, 2, "warm3")
    tower(c, r, 39, 12, 6, "night1")
    tower(c, r, 51, 7, 4, "night0")
    tower(c, r, 60, 4, 4, "night0", lights=0)                                   # the clock tower
    c.pts("night0", (61, 2), (62, 2), (61, 3), (62, 3), (61, 1)).px(61, 5, "bone").px(62, 5, "bone")
    tower(c, r, 64, 10, 7, "night1")
    tower(c, r, 74, 14, 2, "night0")                                            # the five-sided tower: a slab, cut
    c.line(74, 2, 77, 0, "night0").h_(77, 0, 8, "night0").line(84, 0, 87, 2, "night0").rect(76, 1, 10, 1, "night0")
    c.px(80, 3, "screen2")
    for w, top in ((8, 6), (12, 4), (6, 8), (10, 5), (9, 7), (7, 9)):
        tower(c, r, x if x > 88 else 89, w, top, r.choice(("night0", "night1")))
        x = (x if x > 88 else 89) + w
    for xx in (55, 97, 120):
        c.px(xx, (r.randint(1, 3)), "soft1")                                    # aircraft lights on the masts
    parapet(c)
    return c


def sky_stacks():
    """Rooftops, the old power plant's four stacks, a shot tower, a water tank on legs."""
    c, r = sky_base("sky-stacks")
    for x in range(0, 144, 6):                                                  # rowhouse roofs, chimneys
        top = 10 + r.randint(0, 1)
        c.rect(x, top, 6, 13 - top, "night1")
        if chance(r, 0.4):
            c.rect(x + 2, top - 2, 1, 2, "night1")
    lit_windows(c, r, 0, 144, 10, 13, 0.05)
    c.rect(20, 7, 34, 6, "night0")                                              # the power plant
    for x in (24, 32, 40, 48):
        c.rect(x, 1, 2, 6, "night0").px(x, 1, "night1")
    lit_windows(c, r, 20, 54, 7, 13, 0.1)
    for y in range(2, 13):
        w = 2 if y < 6 else 3
        c.h_(78 - w // 2, y, w, "night0")                                       # the shot tower
    c.px(78, 1, "night0").px(78, 7, "warm4")
    c.rect(100, 3, 7, 4, "night0").h_(100, 3, 7, "night1")                      # a water tank
    for x in (100, 103, 106):
        c.v_(x, 7, 6, "night0")
    c.line(100, 7, 106, 12, "night0").line(106, 7, 100, 12, "night0")
    tower(c, r, 116, 9, 6, "night0")
    tower(c, r, 128, 12, 8, "night1")
    parapet(c)
    return c


# ---------------------------------------------------------------------------------------------- draw everything
# 16x16
F("bm.bollard", bollard())
F("bm.bollard_rope", bollard("e"))
F("bm.bollard_rope_s", bollard("s"))
F("bm.crane_bogie", crane_bogie())
F("bm.quay_e", quay_e())
F("bm.quay_s", quay_s())
F("bm.pier", pier())
F("bm.pier_end", pier(end=True))
F("bm.rail_h", rail_h())
F("bm.rail_h_weeds", rail_h(True))
_cols = {
    "bm.row_door": door_column("brick", "warm1", seed=1),
    "bm.row_door_teal": door_column("brick", "screen0", cor="brown", style="lit", seed=2),
    "bm.row_door_scrubbed": door_column("brick", "night3", seed=3, style="scrubbed"),
    "bm.row_door_dark": door_column("brick", "night3", seed=7),
    "bm.row_door_board": door_column("brick", "warm1", cor="brown", seed=4, style="board"),
    "bm.row_door_form": door_column("form", "concrete1", cor="steel", seed=5),
    "bm.row_door_form_scrubbed": door_column("form", "warm1", cor="steel", seed=6, style="scrubbed"),
}
F("bm.row_upper", _cols["bm.row_door"].crop(0, 0, 16, 16))
F("bm.row_upper_lit", _cols["bm.row_door_teal"].crop(0, 0, 16, 16))
F("bm.row_upper_form", _cols["bm.row_door_form"].crop(0, 0, 16, 16))
F("bm.row_upper_board", _cols["bm.row_door_board"].crop(0, 0, 16, 16))
for _n, _c in _cols.items():
    F(_n, _c.crop(0, 16, 16, 16))
# 16x24
F("bm.book_stand", book_stand())
F("bm.ledger_ca", ledger_ca())
F("bm.sign_switch", sign_switch())
F("bm.pew_l", pew("l"))
F("bm.pew", pew("m"))
F("bm.pew_r", pew("r"))
F("bm.rail_stop", rail_stop())
# 16x32
F("bm.row_brick", bay("brick", "glass", "glass", seed=1))
F("bm.row_brick_lit", bay("brick", "lit", "glass", cor="brown", seed=2))
F("bm.row_brick_screen", bay("brick", "glass", "screen", seed=3))
F("bm.row_brick_board", bay("brick", "board", "board", cor="brown", seed=4))
F("bm.row_form", bay("form", "glass", "glass", cor="steel", seed=5))
F("bm.row_form_lit", bay("form", "lit", "screen", cor="steel", seed=6))
F("bm.wall_ref", wall_ref())
F("bm.wall_ref_valve", wall_ref("valve"))
F("bm.wall_ref_vent", wall_ref("vent"))
F("bm.wall_ref_door", wall_ref("door"))
F("bm.wall_hall", wall_hall())
F("bm.wall_hall_lamp", wall_hall("lamp"))
F("bm.wall_ca", wall_ca())
F("bm.wall_ca_window", wall_ca("window"))
F("bm.wall_ca_window_crane", wall_ca("crane"))
F("bm.wall_ca_flag", wall_ca("flag"))
# 32x32
for _s in ("rust", "grey"):
    F(f"bm.box20_{_s}", single(_s, f"box20-{_s}", w=30))
F("bm.banner_pork", banner_pork())
for _ch in "SHOAL":
    F(f"bm.sign_{_ch}", letter(_ch))
F("bm.sign_S#1", letter("S", "sputter"))
for _ch in "SHOAL":
    F(f"bm.sign_{_ch}_off", letter(_ch, "off"))
# 48x32, 48x48
for _s in ("rust", "teal", "mustard", "grey", "ca"):
    F(f"bm.box_{_s}", single(_s, f"box-{_s}"))
F("bm.boxes_rust_teal", double("rust", "teal", "s1"))
F("bm.boxes_grey_mustard", double("grey", "mustard", "s2", shift=-1))
F("bm.boxes_teal_grey", double("teal", "grey", "s3"))
F("bm.boxes_ca", double("ca", "ca", "s4"))
F("bm.mural", mural())
# 32x48
F("bm.silo", silo())
# 48x40
F("bm.flatcar", flatcar("scrap"))
F("bm.flatcar_box", flatcar("box"))
# 16x64
F("bm.smokestack", smokestack())
# 144x16
F("bm.sky_cranes", sky_cranes())
F("bm.sky_downtown", sky_downtown())
F("bm.sky_stacks", sky_stacks())
# the crane
F("bm.crane", crane())


def write():
    out = ["# baltimore: generated by tools/art/gen_baltimore.py. Do not hand-edit; change the generator.",
           "@map " + " ".join(f"{L[k]}={k}" for k in PAL)]
    size = None
    for name, c in FRAMES.items():
        if (c.w, c.h) != size:
            size = (c.w, c.h)
            out.append(f"@size {c.w} {c.h}")
        out.append(f"@frame {name}")
        out.extend(c.rows())
    (REPO / "assets" / "src" / "baltimore.txt").write_text("\n".join(out) + "\n")
    print(f"baltimore: {len(FRAMES)} frames")


if __name__ == "__main__":
    write()
