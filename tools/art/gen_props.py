#!/usr/bin/env python3
"""Draw props, NPCs and enemies as text pixel maps (assets/src/{props,enemies,warden}.txt).

Each sprite is drawn with a few rectangle/pixel calls in palette color names, then outlined
automatically in the darkest night color, so everything shares one look. Run, then run build.py.
Frame names for props are the map object ids (for example obj.printer_3). A second animation
frame is the same name with "#1" appended.
"""
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PAL = [k for k in json.loads((REPO / "tools/art/palette.json").read_text()) if not k.startswith("_")]
LETTERS = "0123abcdefghijklmnopqrstuvwxyzABCDEF"
L = dict(zip(PAL, LETTERS))
assert len(PAL) <= len(LETTERS)


class C:
    def __init__(self, w=16, h=24):
        self.w, self.h = w, h
        self.g = [["."] * w for _ in range(h)]

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.g[y][x] = L[c] if c else "."
        return self

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

    def outline(self, c="night0"):
        src = [row[:] for row in self.g]
        for y in range(self.h):
            for x in range(self.w):
                if src[y][x] != ".":
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < self.w and 0 <= ny < self.h and src[ny][nx] != ".":
                        self.g[y][x] = L[c]
                        break
        return self

    def rows(self):
        return ["".join(r) for r in self.g]


def bench(c):
    return c.rect(1, 18, 14, 5, "warm1").h_(1, 18, 14, "warm3").v_(1, 19, 4, "warm0").v_(14, 19, 4, "warm0")


def statue(turn=0, raw=False):
    """A white plaster bust of John Pork on a plinth: pig's head, human shoulders, a jacket collar."""
    c = C()
    c.rect(4, 17, 8, 6, "concrete2").h_(3, 17, 10, "concrete3").h_(3, 22, 10, "concrete1").h_(6, 19, 4, "warm4")  # plinth, plaque
    c.rect(2, 14, 12, 3, "bone").v_(13, 14, 3, "concrete3").h_(3, 16, 10, "concrete3")       # shoulders
    c.pts("steel", (7, 14), (8, 14), (7, 15)).pts("concrete3", (5, 14), (10, 14))            # collar, lapels
    c.rect(6, 12, 4, 2, "bone").h_(6, 12, 4, "concrete3")                                    # neck under the jaw
    c.rect(3, 3, 10, 9, "bone").v_(12, 5, 7, "concrete3")                                    # head, shaded side
    c.pts("bone", (2, 1), (3, 1), (2, 2), (3, 2), (4, 2), (2, 3), (13, 1), (12, 1), (13, 2), (12, 2), (11, 2), (13, 3))  # ears
    c.pts("steel", (3, 2), (12, 2))
    t = turn
    c.pts("night2", (5 + t, 5), (10 + t, 5))                                                 # eyes
    c.h_(5 + t, 7, 6, "concrete3").v_(4 + t, 8, 3, "steel").v_(11 + t, 8, 3, "steel").h_(5 + t, 11, 6, "steel")  # snout rim
    c.pts("night2", (6 + t, 9), (9 + t, 9))                                                  # nostrils
    if raw:                                                                                  # the newest: clay still showing
        c.pts("warm3", (4, 4), (9, 3), (3, 15), (11, 15)).pts("steel", (7, 4), (6, 15))
    return c.outline()


def printer(warm=False):
    c = C()
    c.rect(2, 6, 12, 17, "night3").h_(2, 6, 12, "steel")
    c.rect(4, 8, 8, 9, "warm0" if warm else "night1")
    c.h_(3, 9, 10, "steel").px(7, 10, "balloon1" if warm else "bone")
    c.h_(4, 16, 8, "steel")
    c.rect(6, 13, 3, 3, "pork1" if warm else "screen1")
    c.rect(4, 19, 4, 2, "warm4" if warm else "screen2").pts("bone", (10, 19), (12, 19))
    return c.outline()


def scope(f):
    c = bench(C())
    c.rect(3, 9, 10, 9, "concrete2").h_(3, 9, 10, "concrete3")
    c.rect(4, 10, 6, 5, "screen0")
    tr = [(4, 13), (5, 12), (6, 10), (7, 14), (8, 12), (9, 12)] if f == 0 else [(4, 12), (5, 12), (6, 13), (7, 12), (8, 10), (9, 14)]
    c.pts("screen2", *tr).pts("bone", (11, 11), (11, 13)).px(11, 15, "signal")
    return c.outline()


def tank(f):
    c = C()
    c.rect(2, 18, 12, 5, "warm0").h_(2, 18, 12, "warm2")
    c.rect(2, 8, 12, 10, "screen0").h_(3, 9, 10, "screen1").h_(3, 17, 10, "warm3")
    c.pts("yerba1", (4, 16), (4, 15), (4, 14)).pts("yerba0", (12, 16), (12, 15))
    sh = [(5, 13), (9, 15), (11, 12)] if f == 0 else [(6, 13), (8, 15), (11, 13)]
    c.pts("soft1", *sh[:2]).pts("balloon1", sh[2])
    c.h_(2, 7, 12, "steel")
    return c.outline()


def bed(blanket):
    c = C()
    c.rect(1, 5, 14, 18, "warm1").rect(2, 6, 12, 16, "bone")
    c.rect(4, 7, 8, 4, "concrete3").h_(4, 7, 8, "bone")
    c.rect(2, 13, 12, 9, blanket + "1").h_(2, 13, 12, blanket + "0").v_(13, 14, 8, blanket + "0")
    return c.outline()


def door(wood="warm1", dark="warm0", occupied=False, num=True):
    c = C()
    c.rect(3, 2, 10, 21, wood).rect(5, 4, 6, 7, dark).rect(5, 13, 6, 8, dark).px(11, 13, "warm4")
    if num:
        c.pts("bone", (7, 3), (8, 3))
    if occupied:
        c.rect(10, 11, 2, 1, "signal")
    return c.outline()


def person(coat, coat_d, skin, hair, lace=None, look_up=False, hunch=True):
    c = C()
    top = 5 if hunch else 3
    c.rect(5, top, 6, 6, skin).rect(5, top, 6, 2, hair).v_(5, top, 4, hair)
    ey = top + (2 if look_up else 3)
    c.pts("night0", (7, ey), (9, ey))
    if look_up:
        c.pts("bone", (7, ey - 0), (9, ey - 0)).pts("night0", (8, ey), (10, ey))
    c.rect(4, top + 6, 8, 9, coat).v_(11, top + 6, 9, coat_d).v_(4, top + 7, 6, coat_d)
    c.rect(5, top + 15, 2, 23 - (top + 15), "night2").rect(9, top + 15, 2, 23 - (top + 15), "night2")
    c.h_(4, 22, 3, "warm0").h_(9, 22, 3, "warm0")
    if lace:
        c.px(10, top + 2, lace)
    return c.outline()


PROPS = {}


def P(name, c):
    PROPS[name] = c.rows()


P("obj.statue_1", statue())
P("obj.statue_2", statue(turn=1))
P("obj.statue_3", statue(raw=True))
c = C().rect(1, 16, 14, 7, "warm1").h_(1, 15, 14, "warm3")
c.rect(5, 10, 4, 5, "warm2").h_(5, 10, 4, "steel").pts("steel", (9, 9), (10, 8), (10, 7))
c.rect(11, 10, 3, 5, "steel").px(10, 11, "steel").pts("bone", (12, 7), (13, 5))
P("obj.mate", c.outline())
c = C().rect(3, 3, 10, 20, "bone").rect(11, 3, 2, 20, "concrete3").h_(3, 10, 10, "concrete2")
c.rect(4, 6, 1, 3, "steel").rect(4, 12, 1, 4, "steel").pts("pork1", (8, 6)).pts("warm4", (9, 14), (7, 16))
P("obj.fridge", c.outline())
c = C().rect(0, 13, 16, 3, "warm2").h_(0, 13, 16, "warm3").rect(1, 16, 2, 7, "warm0").rect(13, 16, 2, 7, "warm0")
c.rect(4, 12, 4, 1, "bone").px(10, 12, "pork1").px(11, 12, "bone")
P("obj.table", c.outline())
c = C().rect(2, 12, 12, 11, "steel").rect(2, 11, 12, 2, "night2").pts("signal", (4, 11), (11, 11)).px(8, 11, "concrete1")
c.pts("night1", (4, 15), (7, 15), (10, 15)).rect(4, 17, 8, 4, "night1").h_(4, 17, 8, "concrete3")
P("obj.stove", c.outline())
P("obj.printer_1", printer())
P("obj.printer_2", printer())
P("obj.printer_3", printer(warm=True))
P("obj.oscilloscope", scope(0))
P("obj.oscilloscope#1", scope(1))
c = bench(C()).rect(5, 16, 7, 2, "night2").rect(9, 8, 2, 8, "steel").rect(6, 7, 3, 5, "night3")
c.pts("steel", (6, 6), (7, 6)).h_(5, 13, 5, "steel").px(6, 13, "balloon0")
P("obj.microscope", c.outline())
c = C().rect(3, 19, 10, 4, "steel").rect(4, 8, 8, 11, "screen0").v_(5, 9, 9, "screen1").rect(3, 7, 10, 2, "steel")
c.rect(7, 3, 3, 3, "bone").px(8, 4, "signal").px(8, 6, "steel")
P("obj.degasser", c.outline())
c = bench(C()).rect(3, 13, 5, 5, "tub0").h_(3, 13, 5, "tub1").px(5, 15, "bone")
c.pts("steel", (9, 16), (10, 15), (11, 14)).px(12, 13, "warm4").h_(9, 17, 5, "yerba0").pts("concrete3", (12, 11), (13, 9))
P("obj.solder", c.outline())
c = C().rect(4, 9, 8, 14, "bone").v_(11, 9, 14, "concrete3")
for y in (11, 13, 15):
    c.h_(5, y, 6, "concrete2")
c.px(9, 19, "screen2").h_(4, 22, 8, "concrete3")
P("obj.dehumidifier", c.outline())
c = C().rect(2, 2, 12, 21, "concrete1").rect(4, 4, 8, 12, "night2").pts("steel", (5, 5), (6, 6), (7, 7)).rect(11, 17, 2, 2, "warm4")
P("obj.window_latch", c.outline())
c = C().rect(3, 15, 10, 6, "warm2").rect(3, 13, 10, 3, "warm3").h_(4, 13, 8, "warm4").rect(4, 21, 1, 2, "warm0").rect(11, 21, 1, 2, "warm0")
P("obj.ottoman", c.outline())   # no ribbon: the balloon was kept inside (Manuel's closet)
P("obj.bed", bed("tub"))
P("obj.bed_michael", bed("soft"))
P("obj.bed_manuel", bed("yerba"))
P("obj.shrimp_tank", tank(0))
P("obj.shrimp_tank#1", tank(1))
c = C().rect(5, 14, 6, 8, "warm2").rect(6, 12, 4, 2, "warm2").v_(10, 15, 6, "warm1").pts("night0", (7, 17), (8, 17))
c.rect(7, 4, 2, 9, "warm0").rect(6, 2, 4, 2, "warm1").v_(8, 5, 14, "bone").h_(6, 20, 4, "warm0")
P("obj.guitar", c.outline())
c = C().rect(1, 4, 14, 19, "warm0").h_(1, 10, 14, "warm2").h_(1, 16, 14, "warm2").h_(1, 22, 14, "warm2")
c.rect(3, 6, 2, 4, "tub1").rect(6, 7, 2, 3, "bone").rect(9, 6, 2, 4, "yerba1").rect(12, 7, 2, 3, "soft1")
c.rect(3, 12, 2, 4, "warm4").rect(6, 12, 3, 4, "tub0").rect(10, 13, 2, 3, "bone").rect(4, 18, 5, 4, "tub1").h_(4, 20, 5, "bone").rect(11, 19, 2, 3, "steel")
P("obj.supplements", c.outline())
def mirror():
    c = C().rect(4, 3, 8, 11, "steel").rect(5, 4, 6, 9, "night3").pts("bone", (6, 5), (7, 6)).pts("screen1", (9, 10), (9, 11))
    return c.rect(3, 16, 10, 4, "bone").rect(5, 17, 6, 2, "concrete3").px(8, 15, "steel").rect(7, 20, 2, 3, "concrete3").outline()
P("obj.trevor_mirror", mirror())
P("obj.mm_mirror", mirror())
P("obj.door", door())
P("obj.door_631", door())
P("obj.bathroom", door("concrete2", "concrete1", occupied=True, num=False))
c = C().rect(1, 6, 14, 12, None).pts("pork1", (2, 9), (3, 8), (4, 9), (5, 10), (6, 9), (7, 8), (8, 9)).pts("rot0", (9, 13), (10, 12), (11, 13), (12, 14), (13, 13))
c.pts("bone", (3, 14), (4, 15), (5, 14), (6, 15), (7, 14)).pts("signal", (10, 8), (11, 7), (12, 8))
PROPS["obj.graffiti"] = c.rows()
def monitor(f):
    c = C().rect(2, 6, 12, 10, "night3").rect(3, 7, 10, 8, "screen0").rect(7, 16, 2, 3, "steel").h_(5, 19, 6, "steel")
    n = [(4, 8), (6, 11), (9, 9), (11, 13)] if f == 0 else [(5, 12), (8, 8), (10, 11), (4, 14)]
    return c.pts("rot0", *n[:2]).pts("rot1", *n[2:]).h_(3, 10 + f * 2, 10, "screen1").outline()
P("obj.lobby_monitor", monitor(0))
P("obj.lobby_monitor#1", monitor(1))
c = C().rect(4, 5, 8, 8, "bone").pts(None, (4, 5), (11, 5), (4, 12), (11, 12)).pts("night0", (8, 6), (8, 7), (8, 8), (9, 9)).pts("rot0", (6, 10))
P("obj.clock_6f", c.outline())
c = C().rect(1, 2, 14, 21, "steel").v_(8, 3, 20, "night2").v_(7, 3, 20, "concrete3").h_(1, 2, 14, "bone").rect(13, 10, 1, 2, "warm4").pts("screen2", (7, 1), (8, 1))
P("obj.elevator", c.outline())
P("obj.aster_door", door("concrete2", "night2", num=True))
def billboard(f):
    c = C().rect(0, 2, 16, 13, "bone").rect(1, 3, 14, 11, "night2").rect(3, 15, 2, 8, "steel").rect(11, 15, 2, 8, "steel")
    for y, w in ((5, 10), (7, 12), (9, 8), (11, 11)):
        c.h_(2, y, w, "screen2" if y != 9 else "warm4")
    n = [(12, 5), (3, 11), (9, 9)] if f == 0 else [(6, 7), (13, 11), (2, 5)]
    return c.pts("rot0", *n[:2]).pts("rot1", n[2]).outline()
P("obj.billboard", billboard(0))
P("obj.billboard#1", billboard(1))
c = C().rect(7, 10, 2, 13, "steel").rect(2, 3, 12, 7, "night3").h_(3, 5, 10, "bone").h_(3, 7, 7, "rot0").px(12, 7, "bone")
P("obj.purple_sign", c.outline())
c = C().rect(2, 12, 12, 10, "night0")
for x in range(3, 14, 2):
    c.v_(x, 12, 10, "steel")
c.h_(2, 12, 12, "concrete3").h_(2, 21, 12, "concrete1").px(8, 17, "balloon0")
PROPS["obj.grate"] = c.rows()
c = C().v_(4, 0, 24, "steel").v_(11, 0, 24, "steel")
for y in range(2, 24, 4):
    c.h_(4, y, 8, "concrete3")
P("obj.tunnel_up", c.outline())
c = C().rect(1, 4, 14, 19, "night1").rect(3, 6, 10, 17, "night0").pts("warm4", (7, 10), (8, 10)).pts("signal", (5, 5), (10, 5)).h_(3, 22, 10, "concrete1")
P("obj.tunnel_on", c.outline())
P("npc.rotter_1", person("concrete2", "concrete1", "skin1", "night2", lace="rot0"))
P("npc.rotter_2", person("warm1", "warm0", "skin2", "concrete3", lace="rot1"))
P("npc.rotter_3", person("concrete1", "concrete0", "skin2", "warm0", lace="rot0", look_up=True))
c = C().rect(0, 2, 16, 21, "night2").rect(1, 3, 14, 9, "concrete1")
for y in range(4, 12, 2):
    c.h_(1, y, 14, "concrete0")
c.rect(1, 13, 14, 2, "warm1").rect(4, 8, 6, 5, "night0").rect(5, 9, 3, 2, "screen2").px(9, 10, "skin1").rect(2, 16, 12, 6, "night1").pts("warm4", (3, 14)).pts("rot0", (6, 9))
P("npc.halvard", c.outline())


# ---- wide wall pieces (32x16, hung on a wall tile and the one to its right) ----
WIDE = {}
c = C(32, 16).h_(0, 0, 32, "warm0").rect(1, 1, 30, 13, "pork1").h_(1, 1, 30, "pork2").h_(1, 13, 30, "pork0")
c.rect(11, 9, 10, 5, "night1").pts("bone", (15, 9), (16, 9), (15, 10)).pts("night3", (13, 9), (18, 9))            # jacket, collar
c.rect(12, 2, 8, 7, "pork2").pts("pork2", (11, 2), (11, 1), (12, 1), (20, 2), (20, 1), (19, 1)).pts("pork0", (12, 2), (19, 2))  # head, ears
c.rect(14, 5, 4, 3, "bone").pts("pork0", (15, 6), (16, 6)).pts("night0", (13, 4), (18, 4)).h_(14, 8, 4, "pork0")     # snout, eyes
for x0 in (3, 24):                                                                                                # a ringing phone each side
    c.rect(x0, 4, 4, 6, "night1").rect(x0 + 1, 5, 2, 3, "screen2").px(x0 + 1, 8, "bone")
    c.pts("bone", (x0 - 1, 3), (x0 + 4, 3), (x0 - 1, 10), (x0 + 4, 10))
c.pts("pork0", *[(x, 14) for x in range(1, 31, 2)])
WIDE["obj.pork_flag"] = c.outline().rows()

# ---- enemies (16x16) ----
ENEMIES = {}
def rotling(f):
    c = C(16, 16).rect(4, 5 + f, 8, 6, "steel").h_(4, 5 + f, 8, "bone").rect(6, 7 + f, 3, 2, "night0").px(7, 7 + f, "rot1")
    c.pts("rot1", (3, 4 + f), (12, 4 + f), (10, 9 + f), (8, 7 + f)).h_(5, 10 + f, 6, "rot1")
    legs = [(4, 12), (7, 13), (11, 12)] if f == 0 else [(5, 13), (8, 12), (10, 13)]
    return c.pts("concrete1", *legs, *[(x, y + 1) for x, y in legs]).outline()
def spitter(f):
    c = C(16, 16).rect(5, 8, 6, 6, "night3").rect(4 - f, 3, 8 + 2 * f, 6, "rot0").h_(5, 3, 6, "pork2").pts("rot1", (6, 5), (9, 6))
    return c.rect(7, 9, 2, 2, "night0").px(7 + f, 9, "rot1").pts("night2", (5, 14), (10, 14)).outline()
for f in (0, 1):
    ENEMIES[f"enemy.rotling_{f}"] = rotling(f).rows()
    ENEMIES[f"enemy.spitter_{f}"] = spitter(f).rows()

# ---- the Rot Warden (32x40, pale so the engine can tint it with the seeded color) ----
WARDEN = {}
def warden(f):
    c = C(32, 40)
    c.rect(9, 12, 14, 20, "bone").rect(21, 12, 2, 20, "concrete3").rect(9, 12, 2, 20, "steel")       # robe
    c.rect(6, 30, 20, 8, "bone").rect(22, 30, 4, 8, "concrete3")                                        # skirt
    for x in range(7, 26, 3):
        c.v_(x, 34 + (f if x % 2 else 0), 5, "steel")
    c.rect(11, 3 + f, 10, 9, "bone").rect(13, 6 + f, 6, 3, "night0").pts("rot1", (14, 7 + f), (17, 7 + f)) # head, visor
    c.rect(10, 1 + f, 12, 2, "steel").pts("steel", (10, 0 + f), (15, 0 + f), (21, 0 + f))                  # crown
    c.rect(4, 14, 5, 3, "bone").rect(23, 14, 5, 3, "bone").rect(3, 17 - f, 3, 9, "steel").rect(26, 17 + f, 3, 9, "steel")
    c.rect(14, 16, 4, 6, "night0").pts("rot0", (15, 17), (16, 19), (15, 20))                               # rotted core
    c.pts("rot0", (8, 25), (24, 31), (12, 35)).pts("rot1", (23, 22), (7, 33))
    return c.outline()
for f in (0, 1):
    WARDEN[f"warden_{f}"] = warden(f).rows()


def write(name, w, h, frames):
    out = [f"# {name}: generated by tools/art/gen_props.py. Do not hand-edit; change the generator.",
           f"@size {w} {h}", "@map " + " ".join(f"{L[k]}={k}" for k in PAL)]
    for n, rows in frames.items():
        out.append(f"@frame {n}")
        out.extend(rows)
    (REPO / "assets" / "src" / f"{name}.txt").write_text("\n".join(out) + "\n")
    print(f"{name}: {len(frames)} frames")


write("props", 16, 24, PROPS)
write("wide", 32, 16, WIDE)
write("enemies", 16, 16, ENEMIES)
write("warden", 32, 40, WARDEN)
