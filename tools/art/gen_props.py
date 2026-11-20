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
LETTERS = "0123abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP"   # one letter per palette colour; room for 48
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
c = C().rect(0, 10, 16, 5, "warm3").h_(0, 10, 16, "warm4").rect(0, 15, 16, 2, "warm1").h_(0, 17, 16, "warm0")   # lit top, front edge, underside
c.rect(1, 17, 2, 6, "warm0").rect(13, 17, 2, 6, "warm0").v_(14, 17, 6, "night2")                                  # legs, far leg in shade
c.rect(4, 11, 4, 2, "bone").h_(4, 13, 4, "concrete3").px(10, 12, "pork1").px(11, 12, "bone")                       # a plate, a mug
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
c = C().rect(2, 2, 12, 21, "warm1").v_(8, 3, 19, "warm0").h_(2, 2, 12, "warm3").pts("warm4", (7, 12), (9, 12))
c.rect(9, 3, 4, 19, "night1").pts("yerba1", (10, 6), (11, 7)).pts("bone", (10, 10)).px(11, 20, "balloon0")        # one door ajar, a scrap of orange
P("obj.manuel_closet", c.outline())
c = C().rect(5, 9, 6, 9, "steel").h_(5, 9, 6, "bone").rect(7, 12, 2, 3, "night0").pts("warm4", (6, 16), (9, 10))
c.pts("concrete3", (4, 11), (3, 12), (11, 14), (12, 15)).pts("warm2", (4, 17), (5, 18), (10, 18))                  # pry marks, splinters
P("obj.front_lock", c.outline())
# ---- ASTER lobby and sixth floor ----
c = C().rect(1, 4, 14, 19, "night1")
for i, y in enumerate(range(6, 22, 3)):
    c.h_(2 + i, y, 12 - i, "concrete2").h_(2 + i, y + 1, 12 - i, "concrete0")
c.v_(2, 3, 18, "steel").h_(2, 3, 11, "steel")
P("obj.stairs", c.outline())
c = C().rect(2, 6, 12, 17, "bone").rect(2, 6, 12, 3, "concrete3").pts("signal", (4, 7)).pts("screen2", (6, 7), (8, 7))
c.rect(4, 11, 8, 8, "steel").rect(5, 12, 6, 6, "screen0").pts("screen1", (6, 13), (7, 14), (9, 15)).h_(2, 22, 12, "concrete2")
P("obj.washer", c.outline())
c = C().rect(1, 4, 14, 11, "warm1").rect(2, 5, 12, 9, "warm2").rect(3, 6, 4, 3, "bone").rect(8, 6, 5, 2, "warm4").rect(4, 10, 3, 3, "bone").rect(9, 9, 3, 4, "screen2")
c.pts("signal", (4, 6), (9, 6), (5, 10))
P("obj.board", c.outline())
c = C().rect(5, 17, 6, 6, "warm1").h_(5, 17, 6, "warm3").rect(7, 9, 2, 8, "yerba0")
c.pts("yerba1", (4, 8), (5, 7), (6, 6), (9, 6), (10, 7), (11, 8), (3, 11), (4, 12), (12, 11), (11, 12), (6, 10), (9, 10), (7, 5), (8, 4))
c.pts("yerba0", (5, 9), (10, 9), (6, 12), (9, 12))
P("obj.plant", c.outline())
c = C().rect(0, 14, 16, 3, "warm2").h_(0, 14, 16, "warm3").rect(0, 9, 16, 5, "warm1").h_(0, 9, 16, "warm2").rect(1, 17, 2, 6, "warm0").rect(13, 17, 2, 6, "warm0").v_(5, 10, 4, "warm0").v_(10, 10, 4, "warm0")
P("obj.bench", c.outline())
c = C().rect(2, 2, 12, 21, "night3").rect(3, 3, 7, 13, "screen0")
for y in (4, 7, 10, 13):
    c.pts("soft1", (4, y)).pts("warm4", (6, y)).pts("yerba1", (8, y)).h_(3, y + 2, 7, "night2")
c.rect(11, 4, 2, 6, "steel").px(11, 5, "signal").rect(3, 18, 10, 3, "night1").h_(2, 22, 12, "night2")
P("obj.vending", c.outline())
c = C().rect(2, 3, 12, 14, "night1").rect(3, 4, 10, 12, "night0")
for y in range(5, 15, 2):
    c.pts("bone", *[(x, y) for x in range(4, 12) if (x * 7 + y * 3) % 5 != 0])
c.h_(2, 2, 12, "warm4")
P("obj.directory", c.outline())
c = C().rect(5, 5, 6, 4, "night2").rect(7, 9, 2, 2, "steel").px(6, 7, "signal").rect(9, 6, 3, 2, "night0").px(11, 7, "screen2").h_(4, 4, 8, "steel")
P("obj.lobby_camera", c.outline())
c = C().rect(0, 12, 16, 11, "warm1").h_(0, 12, 16, "warm3").rect(1, 15, 14, 7, "warm0").rect(3, 10, 6, 2, "bone").pts("night0", (4, 10), (6, 11)).rect(11, 9, 2, 3, "warm4")
P("obj.security_desk", c.outline())
P("npc.doorman", person("night3", "night2", "bone", "steel", lace="screen2", hunch=False))
c = C().rect(4, 6, 8, 12, "steel").rect(5, 8, 6, 5, "night0").h_(5, 7, 6, "bone").rect(6, 14, 4, 2, "concrete1").px(11, 10, "warm4")
P("obj.chute", c.outline())
c = C().rect(6, 8, 4, 11, "signal").rect(7, 5, 2, 3, "steel").pts("night0", (9, 6), (10, 7), (11, 8)).rect(6, 12, 4, 2, "bone").h_(5, 19, 6, "night2")
P("obj.extinguisher", c.outline())
c = C().rect(2, 3, 12, 14, "steel").rect(3, 4, 10, 12, "night1").v_(8, 4, 12, "steel").h_(3, 10, 10, "steel")
c.pts("warm4", (5, 13), (6, 13), (10, 12), (11, 12), (12, 13)).pts("signal", (5, 7)).pts("bone", (10, 6))
P("obj.window_6f", c.outline())
c = C().rect(2, 14, 12, 8, "warm2").h_(2, 14, 12, "warm3").v_(2, 15, 7, "warm1").pts("bone", (5, 13), (6, 12)).pts("pork1", (9, 13)).pts("night1", (11, 13), (12, 13)).pts("tub1", (4, 13))
P("obj.lost_found", c.outline())
c = C().rect(0, 2, 16, 21, "steel").rect(1, 3, 6, 19, "night2").rect(9, 3, 6, 19, "night2").pts("screen0", (2, 5), (3, 6), (10, 5), (11, 6)).rect(7, 11, 2, 3, "warm4")
P("obj.street_doors", c.outline())
# The lobby's street doors are two tiles wide (the walk-on exit spans both; John Pork's QA saw a dark gap on the
# right): one half-door, glass leaf, push bar, pull handle at the centre seam. The right half is this one flipped.
c = C().rect(0, 2, 16, 21, "steel").rect(1, 3, 14, 19, "night2").pts("screen0", (2, 5), (3, 6), (4, 7), (2, 9)).h_(1, 12, 14, "steel")
c.rect(11, 9, 2, 5, "warm4").rect(1, 18, 14, 4, "night1")
P("obj.lobby_door_l", c.outline())
# ---- College Park, outdoors ----
c = C().rect(3, 15, 10, 5, "warm2").rect(2, 20, 12, 2, "warm1").rect(5, 11, 6, 4, "warm2").rect(11, 12, 3, 3, "warm3").px(13, 13, "warm4").px(12, 12, "night0")
c.pts("warm1", (4, 16), (6, 17), (8, 16), (10, 17), (7, 13)).rect(3, 21, 2, 2, "warm1").rect(11, 21, 2, 2, "warm1").rect(1, 22, 14, 1, "concrete2")
P("obj.testudo", c.outline())
c = C().rect(1, 7, 14, 4, "concrete1").h_(1, 7, 14, "concrete2").h_(1, 10, 14, "night1")                   # lid, seen from above
c.rect(1, 11, 14, 11, "yerba0").v_(13, 11, 11, "night2").v_(14, 11, 11, "night2").h_(1, 15, 12, "night2")          # front, shaded side
c.h_(1, 11, 12, "yerba1").pts("bone", (4, 13), (5, 13), (9, 18)).rect(2, 22, 2, 1, "night0").rect(11, 22, 2, 1, "night0")
P("obj.dumpster", c.outline())
c = C().rect(4, 3, 8, 14, "tub0").rect(5, 4, 6, 5, "night1").rect(6, 10, 4, 4, "steel").pts("bone", (6, 10), (8, 11), (7, 12)).rect(10, 9, 1, 5, "night0").rect(7, 17, 2, 6, "steel")
P("obj.payphone", c.outline())
c = C()
for x0, col in ((1, "tub1"), (6, "soft1"), (11, "yerba1")):
    c.v_(x0 + 2, 9, 9, "steel").h_(x0, 18, 4, col).rect(x0, 19, 1, 2, "night0").rect(x0 + 3, 19, 1, 2, "night0").h_(x0 + 1, 9, 3, "night2")
c.h_(0, 21, 16, "concrete3")
P("obj.scooters", c.outline())
c = C().rect(1, 12, 14, 6, "warm1").h_(1, 12, 14, "warm3").rect(2, 8, 4, 4, "bone").rect(7, 9, 3, 3, "warm4").rect(11, 8, 3, 4, "bone").pts("signal", (3, 9), (12, 10))
c.rect(2, 18, 3, 4, "night0").rect(11, 18, 3, 4, "night0").v_(15, 6, 12, "warm0").rect(9, 4, 7, 2, "soft1")
P("obj.cart", c.outline())
c = C().v_(8, 2, 6, "steel").rect(6, 8, 5, 6, "warm4").rect(7, 9, 3, 4, "bone").pts("steel", (6, 8), (10, 8), (6, 13), (10, 13), (8, 8), (8, 13)).h_(6, 14, 5, "steel")
P("obj.worklamp", c.outline())
c = C().v_(7, 4, 19, "steel").v_(8, 4, 19, "concrete1").rect(4, 1, 8, 3, "night2").rect(5, 3, 6, 1, "warm4").h_(5, 22, 6, "concrete2")
P("obj.streetlamp", c.outline())
c = C().rect(1, 6, 14, 7, "night1").rect(2, 7, 12, 5, "night0").pts("soft1", (3, 8), (4, 8), (5, 8), (3, 9), (3, 10), (4, 10), (5, 10)).pts("screen2", (7, 8), (7, 9), (7, 10), (8, 10), (9, 10))
c.pts("warm4", (11, 8), (12, 8), (11, 9), (11, 10), (12, 10), (12, 9))
P("obj.neon", c.outline())
c = C().rect(0, 9, 16, 2, "steel").rect(1, 11, 1, 12, "steel").rect(14, 11, 1, 12, "steel").rect(2, 11, 12, 8, "night2").pts("screen0", (4, 13), (5, 14), (9, 13)).rect(3, 19, 10, 2, "warm1")
P("obj.shelter", c.outline())
c = C().rect(2, 13, 12, 3, "concrete3").h_(2, 13, 12, "bone").rect(3, 14, 10, 1, "warm0").rect(2, 16, 12, 6, "concrete2").v_(12, 16, 6, "concrete1").v_(13, 16, 6, "concrete1").h_(2, 21, 12, "concrete1").pts("yerba1", (4, 13), (5, 12), (6, 13), (8, 12), (9, 13), (10, 11), (11, 13), (7, 11)).pts("yerba0", (5, 14), (7, 14), (9, 14), (11, 14), (6, 12))
P("obj.planter", c.outline())
c = C().rect(2, 8, 12, 14, "night3").rect(3, 9, 10, 6, "screen0").pts("screen2", (4, 10), (5, 11), (8, 10), (10, 12)).h_(2, 7, 12, "soft1").rect(3, 16, 10, 1, "warm4").rect(4, 18, 8, 3, "night1")
P("obj.kiosk", c.outline())
# ---- Room 631: the rest of the furniture ----
c = C().rect(1, 4, 14, 11, "steel").rect(2, 5, 12, 9, "bone").pts("tub1", (3, 6), (4, 6), (5, 7), (6, 7), (7, 6)).pts("signal", (9, 9), (10, 10), (11, 9)).pts("night0", (3, 11), (4, 11), (5, 11), (7, 12), (8, 12)).rect(5, 15, 6, 1, "concrete2")
P("obj.whiteboard", c.outline())
c = bench(C()).rect(5, 10, 6, 8, "night2").rect(6, 13, 4, 4, "bone").h_(6, 13, 4, "warm1").px(11, 12, "signal").pts("bone", (8, 7), (9, 5))
P("obj.coffee", c.outline())
def tv(f):
    c = C().rect(1, 6, 14, 10, "night2").rect(2, 7, 12, 8, "screen0").rect(4, 16, 8, 2, "night1").rect(2, 18, 12, 4, "warm1").h_(2, 18, 12, "warm3")
    c.rect(3, 8, 4, 4, "bone" if f == 0 else "steel").h_(8, 9 + f, 5, "screen2").h_(8, 11 + f, 4, "screen1").h_(2, 14, 12, "signal" if f == 0 else "soft1")
    return c.outline()
P("obj.tv", tv(0))
P("obj.tv#1", tv(1))
c = C().rect(0, 9, 16, 6, "tub0").rect(0, 9, 16, 2, "tub1").rect(0, 12, 2, 8, "tub0").rect(14, 12, 2, 8, "tub0").rect(2, 14, 12, 5, "tub1").v_(8, 14, 5, "tub0").h_(2, 19, 12, "night2").pts("warm4", (5, 15)).rect(1, 20, 2, 2, "warm0").rect(13, 20, 2, 2, "warm0")
P("obj.couch", c.outline())
c = C().rect(2, 12, 12, 2, "warm2").rect(2, 17, 12, 2, "warm2").v_(2, 10, 12, "warm0").v_(13, 10, 12, "warm0")
c.rect(3, 10, 3, 2, "soft1").rect(7, 10, 3, 2, "night3").rect(10, 11, 3, 1, "bone").rect(4, 15, 4, 2, "yerba0").rect(9, 15, 3, 2, "warm4")
P("obj.shoes", c.outline())
c = C().rect(3, 4, 10, 13, "bone").pts("night0", *[(x, y) for y in (6, 8, 10, 12, 14) for x in range(5, 11) if (x + y) % 4]).pts("signal", (4, 6), (4, 10)).px(8, 3, "signal")
P("obj.house_rules", c.outline())
c = C().rect(1, 6, 14, 17, "steel")
for i, y in enumerate((7, 11, 15, 19)):
    for j, x in enumerate((2, 6, 10)):
        c.rect(x, y, 3, 3, ("tub1", "soft1", "yerba1", "warm4")[(i + j) % 4]).h_(x, y + 2, 3, "night2")
P("obj.parts_bins", c.outline())
c = C().rect(1, 3, 14, 12, "warm1").rect(2, 4, 12, 10, "yerba0").pts("bone", (3, 6), (4, 6), (5, 6), (6, 6), (3, 8), (4, 8), (5, 8), (3, 10), (4, 10), (9, 6), (10, 7), (11, 6), (9, 10), (10, 10)).pts("signal", (12, 12))
P("obj.lab_board", c.outline())
c = C().rect(0, 12, 16, 3, "warm2").h_(0, 12, 16, "warm3").rect(1, 15, 2, 8, "warm0").rect(13, 15, 2, 8, "warm0").h_(1, 19, 14, "warm1").rect(3, 9, 4, 3, "steel").rect(9, 10, 5, 2, "yerba0").pts("warm4", (10, 10), (12, 10)).rect(4, 20, 6, 3, "night2")
P("obj.workbench", c.outline())
c = C().rect(2, 13, 12, 9, "concrete2").h_(2, 13, 12, "concrete3").pts("screen1", (4, 11), (5, 12), (6, 10)).pts("pork1", (8, 11), (9, 12), (9, 10)).pts("bone", (11, 12), (12, 11), (7, 12)).pts("warm4", (10, 9))
P("obj.failed_prints", c.outline())
c = C().rect(3, 12, 10, 5, "night2").h_(3, 12, 10, "steel").pts("screen2", (5, 14), (7, 14), (9, 14)).px(11, 14, "rot1").v_(4, 5, 7, "steel").v_(11, 6, 6, "steel").rect(2, 17, 12, 5, "warm1")
P("obj.router", c.outline())
c = C().rect(4, 20, 8, 3, "steel").rect(7, 5, 2, 15, "concrete2").rect(4, 3, 9, 5, "yerba0").rect(9, 8, 2, 5, "steel").px(10, 13, "bone").rect(3, 15, 9, 2, "steel").rect(12, 4, 2, 2, "signal")
P("obj.drill_press", c.outline())
c = bench(C()).rect(3, 7, 9, 9, "night2").rect(4, 8, 7, 6, "screen0").pts("screen2", (5, 9), (6, 9), (7, 9), (5, 11), (6, 11), (8, 12)).rect(6, 16, 3, 2, "steel").rect(12, 12, 3, 6, "night1").px(13, 13, "screen2")
P("obj.trevor_pc", c.outline())
c = C().rect(1, 17, 3, 5, "night2").rect(12, 17, 3, 5, "night2").h_(4, 19, 8, "steel").rect(2, 12, 2, 4, "night2").rect(9, 13, 2, 3, "night2").h_(4, 13, 5, "steel").h_(0, 22, 16, "concrete1")
P("obj.dumbbells", c.outline())
def shower():
    c = C().rect(1, 2, 14, 21, "concrete3").rect(2, 3, 12, 19, "screen0").v_(8, 3, 19, "steel").pts("screen1", (4, 6), (5, 9), (4, 13), (10, 7), (11, 11), (10, 15)).rect(11, 3, 2, 2, "steel").h_(2, 21, 12, "concrete2")
    return c.outline()
P("obj.trevor_shower", shower())
P("obj.mm_shower", shower())
c = bench(C()).rect(3, 9, 6, 7, "night2").rect(4, 10, 4, 4, "bone").rect(10, 11, 4, 5, "warm2").pts("soft1", (11, 12), (12, 13)).rect(10, 16, 4, 1, "warm4").pts("night0", (5, 11), (6, 12))
P("obj.michael_desk", c.outline())
c = bench(C()).rect(4, 11, 5, 6, "warm3").pts("warm2", (5, 12), (6, 14), (7, 12)).rect(10, 13, 3, 4, "warm2").h_(10, 13, 3, "steel").pts("steel", (2, 15), (3, 14), (13, 10), (13, 11)).rect(5, 8, 3, 3, "warm3")
P("obj.manuel_table", c.outline())
c = C().rect(1, 4, 14, 3, "warm1").rect(1, 13, 14, 3, "warm1").rect(3, 1, 3, 3, "warm2").px(6, 0, "steel").rect(8, 2, 3, 2, "yerba1").rect(12, 1, 2, 3, "steel").rect(2, 9, 4, 4, "yerba0").rect(8, 10, 3, 3, "warm2").rect(12, 9, 2, 4, "bone")
P("obj.mate_shelf", c.outline())
c = C().rect(3, 11, 10, 11, "warm2").h_(3, 11, 10, "warm3").pts("warm1", *[(x, y) for x in range(4, 13, 2) for y in range(13, 22, 2)]).rect(4, 8, 5, 3, "soft1").rect(8, 9, 4, 2, "tub1")
P("obj.hamper", c.outline())
c = C()
for x0, hgt in ((1, 8), (6, 11), (11, 7)):
    c.rect(x0, 18, 4, 5, "warm1").h_(x0, 18, 4, "warm3").rect(x0 + 1, 18 - hgt, 2, hgt, "yerba0").pts("yerba1", (x0, 17 - hgt // 2), (x0 + 3, 16 - hgt // 2), (x0 + 1, 17 - hgt), (x0 + 2, 16 - hgt))
c.pts("soft1", (7, 6), (12, 10))
P("obj.balcony_plants", c.outline())
c = C().rect(7, 10, 2, 12, "steel").rect(3, 5, 10, 4, "night2").rect(12, 6, 3, 2, "steel").px(2, 6, "screen2").rect(5, 22, 6, 1, "steel").pts("steel", (5, 20), (10, 20))
P("obj.balcony_view", c.outline())
# ---- Room 631, second pass: the things that make it lived in ----
c = C().rect(4, 13, 8, 2, "warm2").h_(4, 13, 8, "warm3").rect(4, 7, 8, 6, "warm1").rect(5, 8, 6, 4, "warm0").rect(4, 15, 2, 7, "warm0").rect(10, 15, 2, 7, "warm0")
P("obj.chair", c.outline())
c = C().rect(3, 14, 10, 8, "warm1").h_(3, 14, 10, "warm3").rect(5, 17, 6, 2, "warm0").px(8, 18, "warm4").rect(7, 9, 2, 5, "steel").rect(5, 5, 6, 4, "warm4").h_(5, 5, 6, "bone")
P("obj.nightstand", c.outline())
c = C().rect(2, 2, 12, 16, "night1").rect(3, 3, 10, 9, "soft0").pts("warm4", (6, 5), (7, 4), (8, 5), (9, 6), (7, 7), (8, 8)).pts("bone", (5, 9), (10, 9)).h_(4, 14, 8, "bone").h_(5, 16, 6, "signal")
P("obj.poster_band", c.outline())
c = C()
for x0, y0, col in ((2, 3, "screen1"), (7, 2, "soft1"), (11, 4, "warm4"), (3, 9, "bone"), (8, 8, "balloon1"), (12, 10, "yerba1")):
    c.rect(x0, y0, 4, 5, "bone").rect(x0 + 1, y0 + 1, 2, 2, col)
c.pts("signal", (4, 2), (9, 1), (13, 3))
P("obj.photo_wall", c.outline())
c = C().rect(2, 4, 3, 10, "screen2").rect(5, 5, 3, 8, "bone").rect(8, 6, 3, 6, "screen2").rect(11, 7, 2, 4, "bone").px(6, 8, "warm4").px(7, 9, "warm4").v_(1, 3, 13, "warm0")
P("obj.pennant", c.outline())
c = C().rect(2, 14, 12, 8, "signal").h_(2, 14, 12, "soft1").rect(6, 12, 4, 2, "steel").rect(4, 17, 8, 1, "night0").pts("steel", (7, 18))
P("obj.toolbox", c.outline())
c = C().rect(1, 8, 14, 4, "warm3").h_(1, 8, 14, "warm4").h_(1, 10, 14, "warm2")                                 # top face, lit
c.rect(1, 12, 14, 10, "warm2").v_(12, 12, 10, "warm1").v_(13, 12, 10, "warm1").v_(14, 12, 10, "warm0")             # front, shaded side
c.h_(1, 12, 14, "warm1").h_(1, 17, 12, "warm1").v_(7, 12, 10, "warm1").pts("night0", (3, 14), (4, 14), (5, 14), (10, 20), (11, 20))
c.rect(3, 5, 6, 3, "warm1").h_(3, 5, 6, "warm2")                                                                   # a smaller box on top
P("obj.crate", c.outline())
c = C().pts("night0", *[(x, 18 + (x // 3) % 2) for x in range(0, 16)]).pts("signal", *[(x, 20 - (x // 4) % 2) for x in range(2, 14)]).pts("screen1", (3, 21), (4, 22), (5, 21), (9, 22), (10, 21))
PROPS["obj.cables"] = c.rows()
c = C().rect(1, 2, 14, 21, "warm0").h_(1, 8, 14, "warm2").h_(1, 15, 14, "warm2").h_(1, 22, 14, "warm2")
for y0, cols in ((3, ("soft1", "tub1", "bone", "yerba1", "warm4", "night3")), (10, ("tub0", "bone", "soft0", "warm3", "screen1", "bone")), (17, ("yerba0", "warm4", "night3", "soft1", "bone", "tub1"))):
    for i, col in enumerate(cols):
        c.rect(2 + i * 2, y0, 2, 5, col).px(2 + i * 2, y0, "night0")
c.rect(10, 16, 4, 1, "pork1")
P("obj.bookshelf", c.outline())
# ---- the ring-one cast (each drawn as themselves) ----
P("npc.kess", person("yerba0", "night2", "skin1", "concrete3", hunch=False))            # the super: work jacket, grey hair
P("npc.pell", person("warm2", "warm1", "skin2", "bone"))                                # the retired engineer: cardigan, white hair
P("npc.409", person("concrete1", "concrete0", "skin2", "night2", lace="rot0", look_up=False))
P("npc.seun", person("tub1", "tub0", "bone", "night1", lace="screen2", hunch=False))    # a care-worker shell in scrubs
P("npc.dez", person("night3", "night2", "skin1", "warm0"))                              # the night courier, half asleep
P("npc.pruitt", person("bone", "concrete3", "skin3", "warm1", hunch=False))             # the supervisor: white abatement coat
def okafor():                                                                           # the grandmother: headwrap, shawl, cane
    c = C().rect(5, 6, 6, 6, "skin0").rect(4, 3, 8, 4, "screen1").h_(4, 3, 8, "screen2").px(11, 5, "screen0")
    c.pts("night0", (7, 9), (9, 9)).h_(7, 11, 2, "warm0")
    c.rect(3, 12, 10, 4, "warm3").h_(3, 12, 10, "warm4").rect(4, 16, 8, 6, "warm1").v_(11, 13, 9, "warm0")
    c.v_(13, 12, 11, "warm0").px(13, 11, "warm2").h_(5, 22, 2, "night1").h_(9, 22, 2, "night1")
    return c.outline()
P("npc.okafor", okafor())
c = C().rect(4, 5, 8, 8, "bone").pts(None, (4, 5), (11, 5), (4, 12), (11, 12)).pts("night0", (8, 6), (8, 7), (8, 8), (9, 9))
c.rect(12, 6, 4, 8, "bone").pts("night0", (13, 8), (14, 10)).rect(5, 7, 5, 4, "night1").pts("warm4", (6, 8), (8, 9))    # the face swung open on its hinge
P("obj.clock_6f#open", c.outline())
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
# Easter egg (docs/SECRETS.md): the anthem singer at the campus gate. Broad build, bowl cut, glasses,
# a stuffed squirrel under one arm, the other hand on his chest.
c = C()
c.rect(5, 3, 6, 6, "skin1").rect(4, 2, 8, 3, "night1").v_(4, 4, 3, "night1").v_(11, 4, 3, "night1")
c.h_(6, 6, 4, "bone").pts("night0", (7, 6), (9, 6)).px(8, 8, "warm0")
c.rect(2, 9, 12, 10, "screen1").v_(13, 10, 9, "screen0").v_(2, 10, 9, "screen0").h_(3, 18, 10, "screen0")
c.rect(6, 12, 3, 2, "skin1")
c.rect(11, 12, 4, 4, "warm2").rect(12, 10, 2, 2, "warm2").px(12, 11, "night0").v_(15, 9, 5, "warm3").px(14, 9, "warm3").rect(12, 13, 2, 2, "bone")
c.rect(4, 19, 3, 4, "night2").rect(9, 19, 3, 4, "night2").h_(3, 22, 4, "warm0").h_(9, 22, 4, "warm0")
P("npc.anthem", c.outline())
# Tobin, the night abatement tech at the storm grate: white coat with the hood down, sitting on a cooler.
c = C()
c.rect(5, 5, 6, 6, "skin2").rect(5, 5, 6, 2, "night2").v_(5, 5, 3, "night2").pts("night0", (7, 8), (9, 8))
c.rect(3, 11, 10, 2, "concrete3").rect(4, 12, 8, 6, "bone").v_(11, 12, 6, "concrete3").v_(4, 13, 5, "concrete3")
c.rect(6, 14, 4, 2, "screen2").rect(5, 18, 6, 2, "night2")
c.rect(3, 19, 10, 4, "screen1").h_(3, 19, 10, "bone").v_(12, 20, 3, "screen0").px(8, 21, "bone")
c.h_(4, 23, 2, "warm0").h_(10, 23, 2, "warm0")
P("npc.tobin", c.outline())
# Ozzie, the old fisherman on the south pier: bucket hat, waxed jacket, a rod over his shoulder.
c = person("yerba0", "night2", "skin2", "bone")
c.rect(4, 4, 8, 2, "warm2").h_(3, 6, 10, "warm1")
c.v_(13, 1, 18, "warm3").px(14, 1, "bone").px(14, 2, "bone").px(13, 12, "steel")
P("npc.ozzie", c.outline())
# Zipline anchor: a bolted steel post with a cable running up and off.
c = C()
c.rect(7, 5, 2, 18, "steel").v_(8, 5, 18, "concrete2").h_(5, 22, 6, "concrete2").h_(5, 23, 6, "concrete1")
c.rect(5, 5, 6, 2, "warm4").pts("night0", (6, 6), (9, 6)).rect(6, 3, 4, 2, "steel")
c.pts("bone", (10, 3), (11, 2), (12, 2), (13, 1), (14, 1), (15, 0))
P("obj.zip_anchor", c.outline())
# An old phone lying face up on the floor, screen lit, one pale dot on it.
c = C()
c.rect(5, 15, 6, 8, "night2").rect(6, 16, 4, 6, "screen0").rect(6, 16, 4, 2, "screen1").pts("bone", (8, 19), (7, 20), (8, 20)).px(9, 17, "screen2").pts("concrete3", (6, 21), (9, 16))
P("obj.old_phone", c.outline())
# Stacked cardboard moving boxes (task 20).
c = C()
c.rect(2, 13, 12, 10, "warm2").h_(2, 13, 12, "warm3").v_(13, 14, 9, "warm1").h_(4, 17, 6, "bone").v_(8, 13, 10, "warm1")
c.rect(3, 6, 9, 7, "warm2").h_(3, 6, 9, "warm3").v_(11, 7, 6, "warm1").h_(5, 9, 4, "bone")
c.rect(6, 1, 7, 5, "warm1").h_(6, 1, 7, "warm3").v_(12, 2, 4, "warm0").px(9, 3, "bone")
P("obj.boxes", c.outline())
P("npc.rotter_1", person("concrete2", "concrete1", "skin1", "night2", lace="rot0"))
P("npc.rotter_2", person("warm1", "warm0", "skin2", "concrete3", lace="rot1"))
P("npc.rotter_3", person("concrete1", "concrete0", "skin2", "warm0", lace="rot0", look_up=True))
c = C().rect(0, 2, 16, 21, "night2").rect(1, 3, 14, 9, "concrete1")
for y in range(4, 12, 2):
    c.h_(1, y, 14, "concrete0")
c.rect(1, 13, 14, 2, "warm1").rect(4, 8, 6, 5, "night0").rect(5, 9, 3, 2, "screen2").px(9, 10, "skin1").rect(2, 16, 12, 6, "night1").pts("warm4", (3, 14)).pts("rot0", (6, 9))
P("npc.halvard", c.outline())



# ---- big pieces (32x40): the John Pork busts, centred on their tile ----
# Likeness notes: bald egg-shaped head with a wide jaw, ears that hang DOWN the sides of the head,
# small human eyes under brows, a round snout, a wide closed smile, an open plaid shirt over a tee.
BIG = {}
HEAD_SPANS = {2: (12, 19), 3: (10, 21), 4: (9, 22), 20: (9, 22), 21: (10, 21), 22: (12, 19)}


def bust(turn=0, raw=False):
    """Plaster bust with painted details: dark ears, pink snout, red plaid collar over a grey tee."""
    c = C(32, 40)
    c.rect(6, 32, 20, 8, "concrete2").h_(5, 32, 22, "concrete3").h_(5, 39, 22, "concrete1").rect(12, 35, 8, 2, "warm4")
    for y, (a, b) in {26: (8, 23), 27: (6, 25), 28: (4, 27), 29: (4, 27), 30: (4, 27), 31: (4, 27)}.items():   # shoulders: plaid shirt
        c.h_(a, y, b - a + 1, "soft1")
        c.pts("soft0", *[(x, y) for x in range(a, b + 1) if (x % 4 == 1) or (y % 3 == 0)])
    c.rect(13, 26, 6, 6, "steel").h_(13, 26, 6, "concrete3")                                                      # grey tee
    c.pts("soft0", (12, 26), (12, 27), (12, 28), (13, 29), (13, 30), (19, 26), (19, 27), (19, 28), (18, 29), (18, 30))  # open collar
    c.rect(12, 23, 8, 3, "bone").h_(12, 23, 8, "concrete3").v_(19, 24, 2, "concrete3")                            # thick neck
    for y in range(2, 23):                                                                                       # wide dome of a head
        a, b = HEAD_SPANS.get(y, (8, 23))
        c.h_(a, y, b - a + 1, "bone").h_(b - 1, y, 2, "concrete3")
    c.h_(11, 21, 10, "concrete3")                                                                                 # under the chin
    for x0, inner in ((5, 7), (24, 24)):                                                                          # ears: dark flaps, high on the skull, hanging out and down
        c.rect(x0, 6, 3, 6, "steel").rect(x0 + (1 if x0 == 5 else 0), 12, 2, 1, "steel").px(x0 + (2 if x0 == 5 else 0), 5, "steel")
        c.v_(inner, 7, 4, "concrete1")
    t = turn
    c.rect(11 + t, 9, 2, 2, "night2").rect(19 + t, 9, 2, 2, "night2")                                           # small eyes, set wide
    c.h_(13 + t, 11, 6, "pork2").rect(12 + t, 12, 8, 4, "pork2").h_(13 + t, 16, 6, "pork1")                       # the snout
    c.pts("pork1", (12 + t, 15), (19 + t, 15), (19 + t, 12), (19 + t, 13), (19 + t, 14))
    c.rect(14 + t, 13, 1, 2, "pork0").rect(17 + t, 13, 1, 2, "pork0")                                             # nostrils
    c.h_(11 + t, 18, 10, "steel").pts("steel", (10 + t, 17), (21 + t, 17), (9 + t, 16), (22 + t, 16))             # the long smile
    if raw:                                                                                                       # the newest: paint unfinished, clay showing
        c.rect(12, 12, 8, 4, "bone").h_(13, 11, 6, "bone").h_(13, 16, 6, "concrete3").rect(14, 13, 1, 2, "steel").rect(17, 13, 1, 2, "steel")
        c.pts("warm3", (10, 5), (11, 5), (21, 8), (9, 15), (6, 30), (7, 30)).pts("steel", (15, 6), (16, 7))
    return c.outline()


BIG["obj.statue_1"] = bust().rows()
BIG["obj.statue_2"] = bust(turn=2).rows()
BIG["obj.statue_3"] = bust(raw=True).rows()
# Turned toward the flag (the busts puzzle swaps these in)
BIG["obj.statue_1#flag"] = bust(turn=3).rows()
BIG["obj.statue_2#flag"] = bust(turn=3).rows()
BIG["obj.statue_3#flag"] = bust(turn=3, raw=True).rows()

# ---- wide wall pieces (32x16, hung on a wall tile and the one to its right) ----
# The triple bunk (task 20): three mattresses on wooden posts with a ladder up the right side.
c = C(32, 40)
c.rect(3, 3, 2, 36, "warm1").rect(27, 3, 2, 36, "warm1").v_(4, 3, 36, "warm0").v_(28, 3, 36, "warm0")
for y0, blanket, dark in ((6, "tub1", "tub0"), (17, "soft1", "soft0"), (28, "yerba0", "night2")):
    c.rect(5, y0 + 5, 22, 2, "warm2").h_(5, y0 + 6, 22, "warm0")                    # the bed rail
    c.rect(5, y0, 22, 5, blanket).h_(5, y0 + 4, 22, dark).rect(5, y0, 5, 3, "bone").h_(5, y0 + 2, 5, "concrete3")   # blanket, pillow
c.pts("warm4", (14, 7), (16, 8), (19, 7))                                             # top: guitar picks on the blanket
c.pts("screen2", (20, 18), (21, 18)).px(20, 19, "screen1")                            # middle: a phone left glowing
c.rect(21, 29, 2, 3, "warm2").px(22, 28, "steel")                                     # bottom: the mate gourd
c.v_(23, 5, 33, "warm2").v_(26, 5, 33, "warm2")
for y in (9, 14, 20, 25, 31, 36): c.h_(23, y, 4, "warm3")                             # ladder rungs
c.h_(3, 39, 26, "night2")
BIG["obj.bunk"] = c.outline().rows()

WIDE = {}
# The flag: the photograph, printed on cloth. Overcast sky, grey sea on the left, dark cliffs on the
# right, and him in the middle: pale head, ears out and down at the top corners, snout, long smile,
# red plaid open over a grey tee.
c = C(32, 16).h_(0, 0, 32, "warm0").rect(1, 1, 30, 13, "bone")
c.rect(1, 1, 30, 2, "concrete3")                                                        # heavy sky
c.rect(1, 7, 10, 7, "steel").pts("concrete3", (2, 8), (5, 9), (3, 11), (8, 10), (6, 12)).h_(1, 7, 10, "concrete3")   # the sea
c.rect(21, 4, 10, 10, "yerba0").pts("night2", (22, 6), (24, 8), (27, 7), (29, 10), (23, 11), (26, 12), (28, 5))       # the cliffs
c.h_(22, 4, 9, "concrete1").pts("yerba1", (25, 5), (29, 6), (30, 9))
c.rect(7, 11, 18, 3, "soft1").pts("soft0", *[(x, y) for x in range(7, 25) for y in (11, 12, 13) if (x % 3 == 0) or (y == 12 and x % 2)])
c.rect(14, 11, 5, 3, "concrete3").h_(14, 11, 5, "concrete2")                                # grey tee
for y, (a, b2) in {2: (13, 18), 3: (12, 19), 4: (11, 20), 5: (11, 20), 6: (11, 20), 7: (11, 20), 8: (11, 20), 9: (12, 19), 10: (13, 18)}.items():
    c.h_(a, y, b2 - a + 1, "pork2").px(b2, y, "pork1")                                   # the head
c.rect(9, 3, 2, 4, "skin1").px(10, 2, "skin1").rect(21, 3, 2, 4, "skin1").px(21, 2, "skin1").pts("skin0", (10, 4), (10, 5), (21, 4), (21, 5))  # ears
c.pts("night0", (13, 5), (18, 5)).pts("pork1", (13, 4), (18, 4))                        # eyes under faint brows
c.rect(14, 6, 4, 2, "pork1").pts("pork0", (14, 7), (17, 7)).pts("pork2", (15, 6), (16, 6))   # snout
c.h_(13, 9, 6, "pork0").pts("pork0", (12, 8), (19, 8))                                   # the long smile
c.v_(6, 3, 4, "concrete3").v_(26, 4, 9, "concrete0")                                      # two soft folds in the cloth
c.pts("warm0", *[(x, 14) for x in range(1, 31, 2)])
WIDE["obj.pork_flag"] = c.outline().rows()
# The Argentine flag (task 20): sky blue, white, sky blue, with the sun in the middle band.
c = C(32, 16)
c.rect(2, 2, 28, 4, "screen2").rect(2, 6, 28, 4, "bone").rect(2, 10, 28, 4, "screen2")
c.h_(2, 5, 28, "screen1").h_(2, 13, 28, "screen1").h_(2, 9, 28, "concrete3")
c.rect(15, 7, 2, 2, "warm4").pts("warm3", (14, 7), (17, 8), (15, 6), (16, 9))
c.pts("warm0", (2, 1), (29, 1))
WIDE["obj.arg_flag"] = c.outline().rows()


# ---- the principal machines (24x32, standing, facing the camera) ----
PRINCIPALS = {}


def sahur(f):
    """Grown timber over brass clockwork: a gaunt night-watchman with a bat carried like a staff."""
    c = C(24, 32)
    b = f                                                                    # the bat taps on frame 1
    c.rect(17, 3 + b, 3, 6, "warm3").v_(18, 9 + b, 19, "warm3").v_(19, 4 + b, 4, "warm4")   # the bat
    c.rect(8, 1, 8, 9, "warm2").h_(8, 1, 8, "warm3").v_(15, 2, 8, "warm1")                 # head: a section of trunk
    c.pts("warm1", (10, 6), (10, 7), (10, 8), (13, 2), (13, 3))                             # grain
    c.rect(9, 4, 2, 2, "bone").rect(13, 4, 2, 2, "bone").pts("night0", (10, 5), (13, 5))    # wide eyes
    c.h_(11, 8, 2, "night0")
    c.rect(11, 10, 2, 1, "warm1")
    c.rect(9, 11, 6, 10, "warm1").v_(14, 11, 10, "warm0").v_(10, 13, 7, "warm0")            # narrow trunk of a body
    c.rect(11, 13, 2, 2, "night1").px(11 + f, 13, "warm4")                                  # the clockwork, turning
    c.pts("warm4", (8, 11), (15, 11), (10, 25), (13, 25))                                   # brass at the joints
    c.v_(7, 12, 10, "warm2").px(7, 22, "warm3").v_(16, 12, 7, "warm2").px(17, 18 + b, "warm2")
    c.v_(10, 21, 9, "warm2").v_(13, 21, 9, "warm2").h_(9, 30, 3, "warm0").h_(12, 30, 3, "warm0")
    return c.outline()


def pork(f):
    """John Pork in his grown body: bald head, hanging ears, long coat over plaid, a bad knee."""
    c = C(24, 32)
    c.rect(5, 10, 14, 3, "night3").rect(6, 13, 12, 12, "night3").v_(17, 11, 14, "night2")   # the long coat
    c.rect(4, 12, 2, 9, "night3").rect(18, 12, 2, 9, "night2").h_(4, 21, 2, "skin3").h_(18, 21, 2, "skin2")
    c.rect(10, 10, 4, 10, "soft1").pts("soft0", *[(x, y) for x in (10, 13) for y in range(11, 20, 2)])   # plaid shirt, open
    c.rect(11, 10, 2, 6, "steel")                                                           # grey tee
    c.v_(9, 10, 14, "night2").v_(14, 10, 14, "night2")                                      # lapels
    c.rect(8, 2, 8, 7, "skin3").h_(9, 1, 6, "skin3").v_(15, 3, 6, "skin2")                  # bald egg of a head
    c.v_(7, 3, 4, "skin1").v_(16, 3, 4, "skin1")                                            # ears hang down
    c.pts("night0", (10, 4), (13, 4)).rect(10, 5, 4, 3, "pork2").pts("pork0", (11, 6), (12, 6))
    c.h_(10, 8, 4, "skin1").pts("concrete3", (14, 8), (15, 7))                              # the smile; a grey patch at the jaw
    c.rect(11, 9, 2, 1, "skin2")
    c.rect(8, 25, 3, 5, "night1").rect(13, 25, 3, 3, "night1").rect(14, 28, 3, 2, "night1")  # the knee that doesn't bend right
    c.h_(7, 30, 4, "warm0").h_(14, 30, 4, "warm0")
    if f:
        c.pts("bone", (18, 6), (19, 5))                                                     # breath, fogging
    return c.outline()


for f in (0, 1):
    PRINCIPALS[f"sahur_{f}"] = sahur(f).rows()
    PRINCIPALS[f"pork_{f}"] = pork(f).rows()

c = C(32, 16).rect(0, 1, 32, 14, "warm2").h_(0, 1, 32, "warm4").h_(0, 14, 32, "warm0")
for x in range(1, 31, 5):
    for y in (3, 9):
        c.rect(x, y, 4, 4, "warm3").px(x + 3, y + 2, "night0").h_(x, y, 4, "warm4")
c.pts("bone", (7, 10), (22, 4), (27, 10))
WIDE["obj.mailboxes"] = c.outline().rows()

c = C(32, 16).rect(2, 4, 28, 9, "bone").rect(22, 6, 8, 7, "bone").rect(23, 6, 6, 3, "night1").h_(2, 4, 28, "concrete3").rect(2, 12, 28, 1, "concrete2")
c.rect(5, 12, 4, 3, "night0").rect(22, 12, 4, 3, "night0").v_(12, 0, 4, "steel").h_(10, 0, 5, "steel").px(12, 1, "signal").pts("screen2", (30, 10)).pts("signal", (2, 10))
WIDE["obj.van"] = c.outline().rows()
c = C(32, 16).rect(3, 7, 26, 6, "tub0").rect(8, 3, 14, 5, "tub0").rect(9, 4, 5, 3, "night1").rect(16, 4, 5, 3, "night1").h_(3, 7, 26, "tub1")
c.rect(6, 12, 4, 3, "night0").rect(22, 12, 4, 3, "night0").pts("warm4", (28, 9)).pts("signal", (3, 9)).pts("rot0", (11, 5), (18, 5))
WIDE["obj.car"] = c.outline().rows()

c = C(32, 16).pts("night1", *[(x, 3 + (2 if 6 < x % 16 < 10 else 1 if 3 < x % 16 < 13 else 0)) for x in range(32)])
for i, x in enumerate(range(2, 31, 4)):
    yy = 5 + (2 if 6 < x % 16 < 10 else 1 if 3 < x % 16 < 13 else 0)
    c.rect(x, yy, 2, 2, ("warm4", "soft1", "screen2", "yerba1")[i % 4])
WIDE["obj.string_lights"] = c.rows()


# ---- doors that sit inside their wall tile (16x16; '<id>#open' is the open state) ----
DOORS = {}
c = C(16, 16).rect(1, 0, 14, 16, "warm0").rect(2, 1, 12, 15, "warm1").rect(4, 3, 8, 4, "warm0").rect(4, 9, 8, 5, "warm0").px(12, 8, "warm4").h_(1, 0, 14, "warm2").h_(2, 15, 12, "night2")
DOORS["door.wall"] = c.rows()
c = C(16, 16).rect(1, 0, 14, 16, "warm0").rect(2, 1, 12, 15, "night0").rect(2, 1, 3, 15, "warm1").v_(4, 1, 15, "warm2").h_(1, 0, 14, "warm2").h_(5, 15, 9, "night2").pts("night1", (7, 13), (9, 12), (11, 13))
DOORS["door.wall#open"] = c.rows()
c = C(16, 16).rect(5, 0, 6, 2, "warm0").rect(5, 14, 6, 2, "warm0").rect(6, 2, 4, 12, "warm1").v_(6, 2, 12, "warm2").px(10, 8, "warm4").px(5, 8, "warm4")
DOORS["door.side"] = c.outline().rows()
c = C(16, 16).rect(5, 0, 6, 2, "warm0").rect(5, 14, 6, 2, "warm0").rect(6, 2, 10, 3, "warm1").h_(6, 2, 10, "warm2").px(14, 5, "warm4")
DOORS["door.side#open"] = c.outline().rows()
c = C(16, 16).rect(0, 0, 16, 16, "steel").rect(2, 2, 5, 12, "night2").rect(9, 2, 5, 12, "night2").pts("screen0", (3, 4), (4, 5), (10, 4), (11, 5), (12, 6)).rect(7, 0, 2, 16, "concrete3").px(9, 9, "warm4").h_(0, 15, 16, "concrete1")
DOORS["door.balcony"] = c.rows()
c = C(16, 16).rect(0, 0, 8, 16, "steel").rect(2, 2, 4, 12, "night2").pts("screen0", (3, 4), (4, 5)).rect(7, 0, 1, 16, "concrete3").h_(0, 0, 16, "steel").h_(8, 15, 8, "concrete1").v_(15, 0, 16, "steel")
DOORS["door.balcony#open"] = c.rows()

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
# A code-rot-taken person (task #33 put a lot of them in the tunnels): an ordinary body, hunched, with the
# lace glowing rot magenta at the temple; frame 1 has one row of the body shoved a pixel sideways, the
# "frame out of place" from DIRECTION.md.
def rot_taken(f):
    c = C(16, 16).rect(6, 2, 5, 5, "skin1").h_(6, 2, 5, "night2").v_(6, 2, 3, "night2")      # head, hair
    c.pts("night0", (7, 4), (9, 4)).px(10, 3, "rot0").px(11, 3, "rot0")                     # eyes, the lace glow
    sh = 1 if f else 0
    c.rect(5 + sh, 7, 6, 2, "concrete1").rect(5, 9, 6, 3, "concrete1").v_(10, 7, 5, "concrete0")   # torso (one row glitched)
    c.pts("skin1", (4, 9), (4, 10), (11, 10), (12, 11))                                     # arms hanging forward
    c.rect(6, 12, 2, 3, "night2").rect(9, 12 + f, 2, 3 - f, "night2")                         # legs, one dragging
    c.pts("rot0", (8, 8 + f), (5, 11)).px(11, 2, "rot1")                                    # rot showing through
    return c.outline()
for f in (0, 1):
    ENEMIES[f"enemy.rot_taken_{f}"] = rot_taken(f).rows()

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
# The Switchman (task #34, Act 1's mid boss in the switchyard): code rot that grew out of the old signal
# gear. A lamp-head with one lens lit, a lever for an arm, a body of relay cabinet, legs of rail and sleeper.
def switchman(f):
    c = C(32, 40)
    c.rect(11, 2, 10, 10, "night1").h_(11, 2, 10, "concrete2").rect(13, 4, 6, 6, "night0")                # lamp head, hood
    c.rect(14, 5, 4, 4, "signal" if f == 0 else "yerba1").px(14, 5, "bone")                              # the lens, red/green
    c.rect(9, 12, 14, 16, "concrete1").v_(22, 12, 16, "concrete0").h_(9, 12, 14, "concrete2")             # relay cabinet body
    for y in (15, 19, 23): c.h_(11, y, 9, "night2").pts("warm4", (12, y + 1), (18, y + 1))                # relay rows, amber lamps
    c.rect(23, 13, 2, 12 - f * 2, "steel").rect(22, 24 - f * 2, 5, 3, "bone")                              # the lever arm, thrown
    c.rect(5, 14, 4, 3, "steel").rect(4, 17, 3, 7, "steel")                                              # the other arm
    c.rect(10, 28, 4, 10, "steel").rect(18, 28, 4, 10, "steel").h_(7, 37, 18, "warm1").h_(7, 38, 18, "warm0")   # rails, sleeper
    c.pts("rot0", (12, 21), (20, 17), (10, 30)).pts("rot1", (21, 26), (13, 33))                         # rot showing through
    return c.outline()
for f in (0, 1):
    WARDEN[f"switchman_{f}"] = switchman(f).rows()


def write(name, w, h, frames):
    out = [f"# {name}: generated by tools/art/gen_props.py. Do not hand-edit; change the generator.",
           f"@size {w} {h}", "@map " + " ".join(f"{L[k]}={k}" for k in PAL)]
    for n, rows in frames.items():
        out.append(f"@frame {n}")
        out.extend(rows)
    (REPO / "assets" / "src" / f"{name}.txt").write_text("\n".join(out) + "\n")
    print(f"{name}: {len(frames)} frames")


# Append new props so existing frames keep their atlas positions.
# A low four-wheel wedge bot, with scuffed forks and a taped-off power switch.
c = C().rect(2, 11, 3, 4, "night1").rect(11, 11, 3, 4, "night1")
c.rect(2, 17, 3, 4, "night1").rect(11, 17, 3, 4, "night1")
c.pts("concrete1", (2, 12), (13, 12), (2, 18), (13, 18))
c.rect(4, 10, 8, 10, "steel").h_(4, 10, 8, "bone").v_(11, 11, 8, "concrete2")
c.rect(6, 12, 4, 5, "night3").h_(6, 12, 4, "concrete3")
c.rect(6, 13, 4, 2, "bone").pts("night1", (7, 13), (8, 14)).px(10, 16, "signal")
c.h_(4, 18, 8, "concrete3").h_(3, 19, 10, "steel").h_(2, 20, 12, "bone")
c.h_(2, 21, 12, "concrete2").h_(2, 22, 3, "steel").h_(11, 22, 3, "steel")
c.pts("night1", (4, 20), (10, 19)).pts("concrete1", (3, 22), (12, 22))
P("obj.battlebot", c.outline())


# The same bot once the fab quest has rebuilt it (side.bot): powered, tape gone, forks up, a lit
# sensor eye. Two frames: the wheel highlights swap, so it reads as rolling. Used by the ally in fights.
def bot_live(f):
    c = C()
    hi = [(2, 12), (13, 12), (2, 18), (13, 18)] if f == 0 else [(2, 14), (13, 14), (2, 20), (13, 20)]
    for x, y in ((2, 11), (11, 11), (2, 17), (11, 17)):
        c.rect(x, y, 3, 4, "night1")
    c.pts("concrete2", *hi)
    c.rect(4, 10, 8, 10, "steel").h_(4, 10, 8, "bone").v_(11, 11, 8, "concrete2")
    c.rect(6, 12, 4, 4, "night0").h_(6, 12, 4, "concrete3")
    c.rect(7, 13, 2, 2, "screen1").px(7, 13, "screen2")                  # the sensor eye, lit
    c.px(10, 17, "yerba1").px(5, 17, "tub1")                              # power on, Trevor's blue stripe
    c.h_(4, 18, 8, "concrete3")
    c.v_(3, 6 + f, 5, "steel").v_(12, 6 + f, 5, "steel")                  # forks raised, bobbing
    c.h_(2, 6 + f, 2, "bone").h_(12, 6 + f, 2, "bone")
    c.h_(3, 19, 10, "steel").h_(2, 20, 12, "bone").h_(2, 21, 12, "concrete2")
    c.h_(2, 22, 3, "steel").h_(11, 22, 3, "steel")
    return c.outline()
P("bot.live", bot_live(0))
P("bot.live#1", bot_live(1))


# Manuel's Decoy Bust (R): a Pork bust thrown in a hurry, still wet clay, no plinth, slumped a little.
# Frame 2 is the same bust cracked, for when it has soaked most of its hits.
def decoy(cracked=False):
    c = C()
    c.rect(4, 21, 8, 2, "warm0")                                                              # wet base, slip pooling
    c.rect(3, 17, 10, 4, "warm2").v_(12, 17, 4, "warm1").h_(4, 17, 8, "warm3")                 # shoulders
    c.rect(6, 15, 4, 2, "warm2")                                                              # neck
    c.rect(4, 8, 8, 7, "warm2").v_(11, 9, 6, "warm1").h_(5, 8, 6, "warm3")                     # head, shaded side
    c.pts("warm2", (3, 7), (4, 7), (3, 8), (12, 7), (11, 7), (12, 8))                          # ears
    c.pts("night1", (6, 10), (9, 10))                                                         # thumb-pressed eyes
    c.rect(6, 12, 4, 2, "pork1").pts("pork0", (6, 13), (9, 13)).pts("night1", (7, 12), (8, 12))  # snout: the one pink bit
    c.pts("warm4", (5, 9), (4, 18), (8, 18))                                                  # wet shine
    c.pts("warm3", (2, 22), (13, 22))                                                         # thumbprints in the slip
    if cracked:
        c.pts("night1", (8, 8), (8, 9), (9, 10), (9, 11), (10, 11), (5, 17), (6, 18), (6, 19), (11, 16), (10, 17))
    return c.outline()
P("decoy.bust", decoy())
P("decoy.bust#crack", decoy(True))


# Foreground canopies (depth pass, task 13): drawn over every tree tile, at the tree's base depth, so anyone
# walking behind a tree is partly hidden by its leaves. Since the natural pass the tile under a tree is plain
# ground with a soft shadow, so the frame carries its own trunk (Trevor: "trees are floating"). Two shapes.
def canopy(v):
    c = C()
    tx = 7 if v == 0 else 8                                                                    # trunk column
    for y in range(11, 22):
        c.px(tx, y, "warm1").px(tx + 1, y, "warm0")                                            # lit left, shaded right
    c.pts("warm0", (tx - 1, 21), (tx + 2, 21)).pts("warm2", (tx, 15), (tx, 18))                 # root flare, bark marks
    clumps = [(5, 7, 4.6), (10.5, 6, 4.4), (8, 3.5, 4), (7.5, 11.5, 5)] if v == 0 else [(4.5, 9, 4.2), (10, 8, 5), (6.5, 4, 4.2), (11, 3.5, 3.4), (8, 13, 4.2)]
    def inside(x, y): return any((x - a) ** 2 + (y - b) ** 2 < rr * rr for a, b, rr in clumps)
    for y in range(0, 19):
        for x in range(0, 16):
            if not inside(x, y): continue
            lit = any((x - a + 1.6) ** 2 + (y - b + 1.6) ** 2 < (rr - 2.2) ** 2 for a, b, rr in clumps)      # top-left of each clump
            dark = not inside(x + 1, y + 1) or not inside(x, y + 2)                                          # lower-right rims
            c.px(x, y, "night2" if dark else ("yerba1" if lit else "yerba0"))
    return c.outline()
P("fg.canopy", canopy(0))
P("fg.canopy#1", canopy(1))


# NPC variety (Manuel: "more variability in looks"): the plaza regulars who used to borrow a rotter sprite.
def mina():                     # busker: a wide-brimmed hat, a long coat, a little wooden instrument
    c = C().rect(5, 6, 6, 6, "skin2").rect(3, 4, 10, 2, "night3").rect(5, 2, 6, 2, "night3").h_(5, 5, 6, "warm1")
    c.pts("night0", (7, 9), (9, 9)).px(8, 11, "pork0")
    c.rect(4, 12, 8, 10, "concrete1").v_(11, 12, 10, "concrete0").h_(4, 12, 8, "concrete2")
    c.rect(2, 14, 5, 4, "warm2").h_(2, 14, 5, "warm3").v_(6, 13, 6, "warm0").px(4, 16, "night1")     # the instrument
    c.h_(5, 22, 2, "night1").h_(9, 22, 2, "night1")
    return c.outline()
def ray():                      # the scooter mechanic: wide, grey overalls, a rag in the back pocket, a wrench
    c = C().rect(4, 5, 8, 6, "skin1").h_(4, 5, 8, "night1").pts("night0", (6, 8), (9, 8)).h_(6, 10, 4, "warm0")
    c.rect(2, 11, 12, 10, "concrete2").v_(13, 11, 10, "concrete1").rect(5, 11, 6, 3, "skin1").h_(5, 13, 6, "concrete2")
    c.pts("concrete3", (4, 12), (11, 12)).rect(12, 16, 2, 3, "signal")                                   # straps, the rag
    c.v_(1, 15, 6, "steel").px(1, 14, "steel").px(0, 14, "steel")                                        # the wrench
    c.rect(3, 21, 4, 2, "night1").rect(9, 21, 4, 2, "night1")
    return c.outline()
def cal():                      # the campus candidate: a suit, a too-bright tie, a big smile, a clipboard
    c = C().rect(5, 4, 6, 6, "skin3").rect(5, 3, 6, 2, "warm3").pts("night0", (7, 6), (9, 6)).h_(6, 8, 4, "bone")
    c.rect(4, 10, 8, 10, "night3").v_(11, 10, 10, "night2").rect(7, 10, 2, 7, "bone").v_(8, 11, 5, "warm4")
    c.rect(10, 13, 4, 5, "bone").h_(10, 13, 4, "steel").pts("night2", (11, 15), (12, 16))                 # the clipboard
    c.rect(5, 20, 2, 2, "night1").rect(9, 20, 2, 2, "night1").h_(4, 22, 3, "night0").h_(9, 22, 3, "night0")
    return c.outline()
P("npc.mina", mina())
P("npc.ray", ray())
P("npc.cal", cal())


# Task #33, the gate puzzles in the tunnel: a breaker on the gate panel (lever down / up) and a signal
# lamp on a wall bracket (red / amber / green; amber is the yellow-amber, never the balloon's orange).
def breaker(up):
    c = C().rect(3, 6, 10, 15, "concrete1").h_(3, 6, 10, "concrete2").v_(12, 7, 14, "night2")
    c.rect(5, 8, 6, 2, "warm4").h_(5, 9, 6, "warm3")                                   # the yellow do-not-touch band
    c.rect(6, 12, 4, 6, "night1")                                                       # the slot
    if up: c.rect(7, 11, 2, 4, "steel").rect(6, 10, 4, 2, "bone")                         # lever thrown up
    else:  c.rect(7, 15, 2, 4, "steel").rect(6, 18, 4, 2, "bone")                         # lever down
    c.px(11, 19, "yerba1" if up else "signal")                                          # the little status light
    return c.outline()
def siglamp(col):
    lit = {"red": ("signal", "soft1"), "amber": ("warm4", "bone"), "green": ("yerba1", "bone")}[col]
    c = C().v_(8, 13, 9, "steel").h_(5, 21, 7, "concrete1")                               # bracket and plate
    c.rect(4, 4, 8, 9, "night1").h_(4, 4, 8, "concrete1")                                # the housing
    c.rect(6, 6, 4, 4, lit[0]).px(6, 6, lit[1])                                          # the lens, lit
    c.h_(5, 3, 6, "night2")                                                              # the hood
    return c.outline()
P("obj.breaker_dn", breaker(False))
P("obj.breaker_up", breaker(True))
P("obj.siglamp_red", siglamp("red"))
P("obj.siglamp_amber", siglamp("amber"))
P("obj.siglamp_green", siglamp("green"))

# The quarantine cordon at the edge of College Park (Trevor #536, task #37). Continuity troopers wear
# slate armour with one red stripe; the visor is the cyan of a live screen. Barriers are red and white
# (never the balloon's orange); the notice sign is the amber of warnings.
def trooper(view):
    c = C()
    if view == "back":
        c.rect(5, 2, 6, 6, "night2").h_(5, 2, 6, "night3").h_(5, 7, 6, "night1")              # helmet from behind
        c.rect(4, 8, 8, 8, "concrete1").v_(11, 8, 8, "night2").rect(5, 9, 6, 5, "night3")     # armour, a pack
        c.rect(4, 8, 2, 2, "signal")                                                           # stripe on the shoulder
        c.v_(12, 6, 9, "night1")                                                               # rifle barrel over the shoulder
    elif view == "side":
        c.rect(5, 2, 6, 6, "night2").h_(5, 2, 6, "night3").rect(9, 4, 2, 2, "screen2")        # helmet, visor at the front
        c.rect(5, 8, 6, 8, "concrete1").v_(5, 8, 8, "night2").rect(6, 8, 2, 2, "signal")      # armour, stripe
        c.h_(6, 11, 8, "night1").px(13, 10, "steel").px(7, 12, "steel")                       # rifle held forward
    else:
        c.rect(5, 2, 6, 6, "night2").h_(5, 2, 6, "night3").h_(6, 4, 4, "screen2").h_(6, 5, 4, "screen1")   # helmet, lit visor
        c.rect(4, 8, 8, 8, "concrete1").v_(11, 8, 8, "night2").h_(4, 8, 8, "concrete2")      # armour
        c.rect(4, 8, 2, 3, "signal")                                                            # the red shoulder stripe
        c.pts("night1", (4, 14), (5, 13), (6, 13), (7, 12), (8, 12), (9, 11), (10, 11), (11, 10)).px(12, 9, "steel")   # rifle across the chest
        c.px(8, 9, "screen1")                                                                   # a chest light
    c.rect(5, 16, 2, 6, "night2").rect(9, 16, 2, 6, "night2").h_(4, 22, 3, "night0").h_(9, 22, 3, "night0")
    return c.outline()
def barrier():                  # a jersey block, red and white
    c = C().rect(1, 13, 14, 9, "bone").h_(1, 13, 14, "steel").rect(2, 14, 3, 7, "signal").rect(8, 14, 3, 7, "signal")
    c.h_(1, 21, 14, "concrete2").h_(3, 22, 10, "concrete1")
    return c.outline()
def cordon_booth():             # a white booth with a slot for papers and a screen
    c = C().rect(1, 3, 14, 19, "bone").v_(14, 3, 19, "concrete3").h_(1, 2, 14, "signal").h_(1, 3, 14, "soft0")
    c.rect(3, 6, 10, 6, "screen0").rect(4, 7, 8, 4, "screen1").rect(5, 8, 4, 2, "concrete3").px(10, 8, "screen2")   # screen: one grey square, a timer
    c.h_(3, 14, 6, "night1").h_(1, 21, 14, "concrete2")                                          # the slot, the kerb
    return c.outline()
def floodlight():               # a mast with a lamp head
    c = C().v_(7, 4, 18, "steel").v_(8, 4, 18, "concrete2").h_(5, 21, 6, "concrete1").h_(6, 20, 4, "concrete2")
    c.rect(3, 1, 10, 3, "night2").h_(4, 3, 8, "bone").h_(5, 2, 6, "warm4")                       # the lamp head, lit
    return c.outline()
def cordon_sign():              # CONTINUITY CONTAINMENT ZONE on an amber board
    c = C().v_(4, 13, 9, "steel").v_(11, 13, 9, "steel").rect(1, 6, 14, 8, "warm4").h_(1, 6, 14, "bone")
    c.h_(3, 8, 10, "night1").h_(3, 10, 7, "night1").h_(3, 12, 9, "signal")                       # the lines, a red one
    c.pts("night2", (12, 10), (13, 11))                                                         # the marker scrawl
    return c.outline()
P("npc.trooper", trooper("front"))
P("npc.trooper_back", trooper("back"))
P("npc.trooper_side", trooper("side"))
P("obj.barrier", barrier())
P("obj.cordon_booth", cordon_booth())
P("obj.floodlight", floodlight())
P("obj.cordon_sign", cordon_sign())

# Landscape pass (Manuel: "the plaza is a huge concrete block with some random small concrete structure").
# Street furniture for `scenery` (non-interactive, src/content/maps/*.js) and floor decals stamped into the
# baked map (src/game/render/decor.js). No orange anywhere: that is the balloon's (D-004).
def ell(c, cx, cy, rx, ry, col, ring=False):
    for y in range(c.h):
        for x in range(c.w):
            d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2
            if (d <= 1 and not ring) or (ring and 0.62 <= d <= 1):
                c.px(x, y, col)
    return c


def fountain():
    """Broken (Manuel: "slightly post-apocalyptic: the fountain shouldn't work"): no jet, stagnant green water with
    scum and leaves, a cracked rim with a chunk missing, the top bowl snapped off and lying in the pool."""
    c = C(32, 40)
    ell(c, 16, 31, 15.5, 8, "concrete1")                                      # the basin's outer wall
    ell(c, 16, 30, 15.5, 7.5, "concrete2")
    ell(c, 16, 30, 13, 5.5, "yerba0")                                         # the pool, gone green
    ell(c, 16, 30.5, 11, 4.2, "yerba0")
    for x, y in ((9, 29), (10, 29), (20, 31), (21, 31), (13, 33), (23, 28), (7, 31)): c.px(x, y, "yerba1")   # scum
    c.pts("warm2", (12, 31), (19, 28), (24, 31)); c.pts("warm1", (8, 30), (17, 33))                         # leaves
    for x in range(2, 30):
        if c.g[24][x] != ".": c.px(x, 24, "concrete3")                        # the rim
    c.rect(25, 24, 3, 3, "night1").pts("concrete1", (25, 27), (27, 27))       # a chunk out of the rim
    c.pts("night1", (6, 25), (7, 26), (7, 27), (8, 28), (12, 36), (13, 37))   # cracks
    c.rect(14, 17, 4, 13, "concrete2").v_(14, 17, 13, "concrete3").v_(17, 17, 13, "concrete1")   # the column, snapped
    c.pts("concrete3", (14, 16), (16, 16)).px(15, 15, "concrete2")            # jagged top
    ell(c, 21, 33, 3.2, 1.3, "concrete2"); c.h_(19, 32, 4, "concrete3")       # the top bowl, lying in the water
    c.px(9, 27, "steel"); c.px(10, 27, "concrete3")                           # a can
    c.pts("yerba1", (14, 29), (17, 29), (13, 28))                              # weeds round the column's foot
    return c.outline()


BIG["obj.fountain"] = fountain().rows()

def bin_(recycle=False):
    body, dark = ("tub1", "tub0") if recycle else ("steel", "concrete1")
    c = C().rect(4, 12, 8, 10, body).v_(11, 12, 10, dark).h_(3, 11, 10, "night2").h_(4, 10, 8, "night3")
    c.v_(6, 13, 8, dark).v_(9, 13, 8, dark)
    if recycle: c.pts("bone", (7, 15), (8, 15), (6, 16), (9, 16), (7, 17), (8, 17))
    else: c.pts("bone", (5, 10), (6, 9)).px(10, 10, "warm2")                   # a cup and a bag corner
    return c.outline()
def bikerack():
    c = C().v_(2, 12, 10, "steel").v_(13, 12, 10, "steel").h_(2, 12, 12, "concrete3")       # the hoop
    ell(c, 5, 18, 3.6, 3.6, "night0", ring=True); ell(c, 11, 18, 3.6, 3.6, "night0", ring=True)   # wheels
    c.pts("bone", (5, 18), (11, 18))                                                         # hubs
    c.pts("tub1", (5, 17), (6, 16), (7, 15), (8, 15), (9, 15), (10, 16), (11, 17), (7, 16), (8, 17), (9, 18), (6, 17))   # the frame
    c.h_(6, 14, 3, "night0").pts("bone", (10, 14), (11, 14))                                 # saddle, bars
    return c.outline()
def bollard():
    c = C().rect(6, 15, 4, 7, "concrete2").v_(9, 15, 7, "concrete1").h_(6, 14, 4, "concrete3").h_(6, 17, 4, "bone")
    return c.outline()
def hydrant():
    c = C().rect(5, 14, 6, 8, "signal").v_(10, 14, 8, "soft0").rect(6, 12, 4, 2, "signal").px(7, 11, "soft1").px(8, 11, "signal")
    c.rect(3, 16, 2, 2, "soft0").rect(11, 16, 2, 2, "soft0").h_(4, 21, 8, "night2").px(6, 13, "soft1")
    return c.outline()
def newsbox():
    c = C().rect(1, 12, 6, 10, "tub1").v_(6, 12, 10, "tub0").rect(2, 14, 4, 3, "screen0").h_(2, 15, 4, "bone")
    c.rect(8, 13, 6, 9, "warm4").v_(13, 13, 9, "warm3").rect(9, 15, 4, 3, "night2").h_(9, 16, 4, "bone")
    c.h_(1, 11, 6, "tub0").h_(8, 12, 6, "warm3")
    return c.outline()
def mailbox():
    c = C().rect(4, 11, 8, 8, "tub0").h_(5, 10, 6, "tub0").h_(5, 10, 6, "tub1").v_(11, 11, 8, "night3")
    c.h_(5, 13, 6, "bone").rect(5, 19, 1, 3, "night1").rect(10, 19, 1, 3, "night1").px(7, 15, "signal")
    return c.outline()
def meter():
    c = C().v_(7, 12, 10, "steel").v_(8, 12, 10, "concrete1").rect(5, 6, 6, 6, "night2").rect(6, 7, 4, 2, "screen1").px(7, 10, "warm4")
    return c.outline()
def busstop():
    c = C().v_(7, 6, 16, "steel").rect(3, 1, 10, 6, "screen0").h_(3, 1, 10, "screen1").rect(5, 3, 5, 2, "bone").pts("night1", (5, 5), (9, 5))
    c.h_(5, 21, 6, "concrete2")
    return c.outline()
def trafficlight(lit):
    c = C().v_(7, 11, 11, "night2").rect(5, 1, 6, 11, "night1").h_(5, 1, 6, "night3")
    for i, col in enumerate(("signal", "warm4", "yerba1")):
        c.rect(7, 2 + i * 3, 2, 2, col if i == lit else "night2")
    c.h_(5, 21, 6, "concrete2")
    return c.outline()
def cone():
    c = C().h_(4, 21, 8, "night2").rect(6, 13, 4, 8, "signal").rect(5, 18, 6, 3, "signal").h_(5, 16, 6, "bone").px(7, 12, "signal").px(8, 12, "soft1")
    return c.outline()
def flowerpot():
    c = C().rect(4, 16, 8, 6, "warm2").h_(3, 15, 10, "warm3").v_(11, 16, 6, "warm1")
    c.rect(4, 11, 8, 4, "yerba0").pts("yerba1", (5, 11), (8, 10), (10, 12)).pts("pork1", (5, 12), (9, 11)).pts("bone", (7, 12), (10, 13)).px(6, 10, "tub1")
    return c.outline()
def aframe():
    c = C().rect(4, 10, 8, 11, "night2").h_(4, 10, 8, "night3").pts("warm1", (4, 21), (11, 21))
    c.h_(5, 12, 5, "bone").h_(5, 14, 6, "bone").h_(5, 16, 4, "bone").h_(6, 18, 3, "pork1")
    return c.outline()
def utilitybox():
    c = C().rect(3, 11, 10, 11, "concrete2").v_(12, 11, 11, "concrete1").h_(3, 11, 10, "concrete3")
    c.rect(5, 14, 3, 3, "pork1").px(6, 15, "bone").pts("night1", (9, 13), (10, 13), (9, 19), (10, 19)).h_(4, 17, 6, "rot0")
    return c.outline()
def adtotem(f):
    c = C().rect(3, 1, 10, 21, "night1").h_(3, 1, 10, "night3")
    scr = ("pork0", "pork1", "pork2") if f == 0 else ("screen0", "screen1", "screen2")
    c.rect(4, 3, 8, 16, scr[0]).rect(5, 5, 6, 7, scr[1]).pts(scr[2], (6, 6), (7, 6), (8, 7))
    c.h_(5, 14, 6, "bone").h_(5, 16, 4, "bone").h_(4, 21, 8, "concrete1")
    return c.outline()
def cafe_table():
    c = C().rect(1, 15, 3, 6, "night2").rect(12, 15, 3, 6, "night2")                      # two chairs
    ell(c, 8, 15, 4.5, 2, "bone"); c.h_(5, 14, 6, "concrete3")
    c.v_(7, 17, 4, "steel").h_(5, 21, 6, "steel").px(9, 14, "warm2")                      # a cup left behind
    return c.outline()
def shoppingcart():
    c = C().rect(3, 13, 10, 6, "steel")
    for x in range(4, 13, 2): c.v_(x, 14, 4, "concrete1")
    c.h_(3, 13, 10, "concrete3").v_(13, 11, 3, "steel").pts("night1", (4, 21), (11, 21)).h_(4, 19, 8, "concrete1").px(7, 15, "bone")
    return c.outline()
def tires():
    c = C()
    for y in (19, 16, 13):
        ell(c, 8, y + 1.5, 6, 2.2, "night1"); c.h_(4, y, 8, "night2"); c.h_(6, y + 1, 4, "night0")
    return c.outline()
def charger(f):
    c = C().rect(5, 8, 6, 14, "concrete1").v_(10, 8, 14, "night3").h_(5, 8, 6, "concrete2")
    c.rect(6, 10, 4, 3, "screen1" if f else "screen0").px(7, 11, "screen2").pts("yerba1" if f else "night2", (7, 15))
    c.pts("night1", (11, 14), (12, 15), (12, 17), (13, 19), (13, 21))                     # the cable
    return c.outline()

for name, c in (("obj.bin", bin_()), ("obj.recycle", bin_(True)), ("obj.bikerack", bikerack()), ("obj.bollard", bollard()),
                ("obj.hydrant", hydrant()), ("obj.newsbox", newsbox()), ("obj.mailbox", mailbox()), ("obj.meter", meter()),
                ("obj.busstop", busstop()), ("obj.trafficlight", trafficlight(0)), ("obj.trafficlight#1", trafficlight(2)),
                ("obj.cone", cone()), ("obj.flowerpot", flowerpot()), ("obj.aframe", aframe()), ("obj.utilitybox", utilitybox()),
                ("obj.adtotem", adtotem(0)), ("obj.adtotem#1", adtotem(1)), ("obj.cafe_table", cafe_table()),
                ("obj.shoppingcart", shoppingcart()), ("obj.tires", tires()), ("obj.charger", charger(0)), ("obj.charger#1", charger(1))):
    P(name, c)


def mars_rover():
    """The UMD rover team's flight spare in the robotics lab (hub #30): lab-clean, nothing like Trevor's battlebot.
    Six wheels on rocker-bogies (three a side, the far three peeking over), a white body with a gold-foil panel,
    a solar deck on top and a mast with a two-eyed camera head."""
    c = C()
    for x in (2, 7, 12):                                                                     # the far-side wheels
        c.rect(x, 16, 3, 3, "concrete1").px(x + 1, 17, "night2")
    c.v_(11, 4, 5, "steel").v_(12, 4, 5, "concrete1")                                         # the mast
    c.rect(9, 1, 5, 3, "concrete3").h_(9, 1, 5, "bone").pts("screen2", (10, 2), (12, 2))     # camera head, two eyes
    c.rect(1, 8, 14, 2, "screen0").h_(1, 10, 14, "steel")                                    # solar deck, cell seams
    c.pts("night2", (4, 8), (4, 9), (8, 8), (8, 9), (12, 8), (12, 9)).pts("screen1", (2, 8), (6, 8), (13, 8))
    c.rect(9, 8, 3, 2, "night1").px(10, 9, "warm3")                                          # one cell cannibalized, a wire
    c.rect(4, 11, 8, 4, "bone").v_(11, 11, 4, "concrete3").h_(4, 14, 8, "concrete3")         # body
    c.rect(5, 12, 3, 2, "warm4").px(7, 13, "warm3").px(10, 12, "screen2")                     # gold foil, status light
    c.pts("steel", (4, 15), (3, 16), (11, 15), (12, 16), (7, 15), (8, 15), (7, 16), (8, 16))   # rocker-bogie
    for x in (1, 6, 11):                                                                     # the near wheels, rounded
        c.rect(x, 18, 4, 5, "steel").rect(x + 1, 19, 2, 3, "night2").px(x + 1, 20, "concrete2")
        c.pts(None, (x, 18), (x + 3, 18), (x, 22), (x + 3, 22))
    return c.outline()


P("obj.mars_rover", mars_rover())

# Floor decals: 16x16, flat on the ground, no outline. Stamped into the baked map under everything.
DECALS = {}
def D(name, c): DECALS[name] = c.rows()
def dc(): return C(16, 16)
D("dec.puddle_0", ell(ell(dc(), 8, 9, 6, 3, "screen0"), 7, 9, 4, 1.8, "screen1").pts("screen2", (5, 8), (6, 8), (10, 10)))
D("dec.puddle_1", ell(ell(dc(), 7, 8, 4, 2.5, "screen0"), 12, 12, 2.5, 1.5, "screen0").pts("screen1", (6, 8), (7, 7), (12, 12)))
D("dec.manhole", ell(ell(ell(dc(), 8, 8, 6, 6, "night1"), 8, 8, 5, 5, "concrete1"), 8, 8, 5, 5, "night2", ring=True).h_(5, 8, 7, "night1").v_(8, 5, 7, "night1").pts("concrete3", (6, 6), (10, 6)))
D("dec.drain", dc().rect(3, 1, 10, 5, "night1").pts("concrete2", (4, 2), (6, 2), (8, 2), (10, 2), (4, 4), (6, 4), (8, 4), (10, 4)).h_(3, 6, 10, "concrete1"))
D("dec.crack_0", dc().pts("night1", (2, 3), (3, 4), (4, 4), (5, 5), (6, 6), (6, 7), (7, 8), (9, 8), (10, 9), (11, 11), (12, 12), (8, 9), (8, 10)))
D("dec.crack_1", dc().pts("night1", (13, 2), (12, 3), (11, 3), (10, 4), (9, 6), (9, 7), (8, 8), (7, 10), (5, 11), (4, 12), (10, 7), (11, 8)))
D("dec.leaves_0", dc().pts("warm2", (3, 4), (4, 4), (11, 9)).pts("warm3", (12, 9), (6, 12)).pts("yerba1", (9, 3), (2, 11)).pts("warm1", (7, 12), (13, 6)))
D("dec.leaves_1", dc().pts("warm3", (4, 7), (5, 7), (10, 12)).pts("warm2", (9, 4), (12, 5), (3, 13)).pts("yerba0", (6, 3), (13, 13)))
D("dec.litter_0", dc().rect(6, 8, 3, 2, "bone").px(9, 8, "concrete3").px(5, 9, "warm2").pts("night2", (6, 10), (8, 10)))          # a crushed cup
D("dec.litter_1", dc().rect(4, 6, 6, 5, "bone").h_(5, 7, 4, "night2").h_(5, 9, 3, "pork1").px(9, 10, "concrete3"))                # a soggy flyer
D("dec.gum", dc().pts("night2", (3, 3), (9, 5), (12, 11), (5, 12), (7, 8)))
D("dec.oil", ell(ell(dc(), 8, 8, 5, 3, "night1"), 7, 8, 2.5, 1.2, "night2").pts("tub0", (6, 7)).pts("pork0", (9, 9)))
D("dec.weeds", dc().pts("yerba1", (2, 14), (3, 13), (4, 14), (12, 2), (13, 1), (13, 3)).pts("yerba0", (3, 14), (12, 3), (7, 9), (8, 8)))
D("dec.chalk", dc().h_(2, 2, 12, "bone").h_(2, 8, 12, "bone").h_(2, 14, 12, "bone").v_(2, 2, 13, "bone").v_(13, 2, 13, "bone").v_(8, 8, 7, "bone").pts("bone", (5, 4), (5, 5), (10, 11), (11, 10)))   # hopscotch
D("dec.chalk_pig", ell(dc(), 8, 8, 6, 5, "pork1", ring=True).pts("pork1", (3, 3), (4, 2), (12, 2), (13, 3), (6, 7), (10, 7), (7, 10), (9, 10), (8, 10)))   # somebody drew him
D("dec.bay_v", dc().v_(0, 0, 16, "bone").pts("concrete3", (0, 5), (0, 11)))
D("dec.bay_h", dc().h_(0, 15, 16, "bone").pts("concrete3", (4, 15), (12, 15)))
D("dec.arrow_n", dc().v_(7, 5, 10, "bone").v_(8, 5, 10, "bone").h_(5, 6, 6, "bone").h_(6, 5, 4, "bone").pts("bone", (7, 3), (8, 3), (6, 4), (9, 4)))
D("dec.arrow_s", dc().v_(7, 1, 10, "bone").v_(8, 1, 10, "bone").h_(5, 9, 6, "bone").h_(6, 10, 4, "bone").pts("bone", (7, 12), (8, 12), (6, 11), (9, 11)))
D("dec.tactile", dc().rect(0, 0, 16, 4, "warm3").pts("warm4", *[(x, y) for x in range(1, 16, 3) for y in (1, 2)]))   # the bumpy strip at a kerb cut
D("dec.hatch", dc().pts("warm4", *[(x, y) for x in range(16) for y in range(16) if (x + y) % 6 == 0]))
D("dec.stain", ell(dc(), 8, 9, 6, 4, "night2").pts("night1", (6, 9), (9, 8)))
D("dec.flowers", dc().pts("pork1", (3, 4), (11, 9), (6, 12)).pts("bone", (8, 3), (13, 13), (2, 10)).pts("warm4", (5, 7), (12, 4)).pts("tub1", (9, 12)).pts("yerba1", (3, 5), (11, 10), (8, 4), (6, 13), (12, 5)))   # wildflowers in the grass
# Roofs seen from above (dark night1 tops): what sits on a city roof at night.
D("roof.ac", dc().rect(2, 3, 12, 10, "concrete1").h_(2, 3, 12, "concrete2").v_(13, 4, 9, "night2").h_(2, 13, 12, "night0")
  .rect(4, 5, 6, 6, "night2").pts("steel", (5, 6), (8, 6), (6, 7), (7, 8), (5, 9), (8, 9)).pts("concrete3", (11, 5), (11, 7), (11, 9)))
D("roof.vent", dc().rect(6, 6, 4, 4, "steel").h_(5, 5, 6, "concrete3").h_(6, 10, 4, "night0").px(7, 7, "night1").px(8, 8, "night1"))
D("roof.skylight", dc().rect(3, 4, 10, 8, "concrete2").rect(4, 5, 8, 6, "screen0").pts("screen1", (5, 6), (6, 6), (5, 7)).h_(3, 12, 10, "night0").v_(8, 5, 6, "concrete2"))
D("roof.skylight_lit", dc().rect(3, 4, 10, 8, "concrete2").rect(4, 5, 8, 6, "warm4").pts("bone", (5, 6), (6, 6), (5, 7)).h_(3, 12, 10, "night0").v_(8, 5, 6, "concrete2"))
D("roof.solar", dc().rect(1, 2, 14, 11, "tub0").pts("night2", *[(x, y) for x in range(1, 15) for y in range(2, 13) if x % 5 == 0 or y % 4 == 1]).h_(1, 13, 14, "night0").pts("tub1", (2, 3), (3, 3), (7, 7)))
D("roof.tank", ell(ell(dc(), 8, 8, 6, 6, "warm1"), 8, 8, 4.5, 4.5, "warm2", ring=True).pts("warm3", (6, 4), (5, 5)).h_(4, 14, 9, "night0"))
D("roof.hatch", dc().rect(5, 5, 6, 6, "concrete1").h_(5, 5, 6, "concrete2").h_(5, 11, 6, "night0").px(10, 8, "steel"))
D("roof.pipe", dc().h_(0, 7, 16, "steel").h_(0, 8, 16, "concrete1").h_(0, 9, 16, "night0").v_(10, 4, 3, "steel"))
D("roof.antenna", dc().v_(8, 2, 12, "steel").h_(5, 4, 7, "steel").h_(6, 7, 5, "steel").px(8, 1, "signal").h_(6, 14, 5, "night0"))
D("roof.garden", dc().rect(2, 2, 12, 12, "warm1").rect(3, 3, 10, 10, "warm0").pts("yerba1", (4, 4), (6, 5), (9, 4), (11, 6), (5, 9), (8, 10), (11, 11)).pts("yerba0", (5, 4), (7, 7), (10, 8), (4, 11)).pts("pork1", (9, 9)))
# Wear (post-apocalyptic, Manuel): potholes, patch repairs, a long branching crack, rubble, a trash bag.
D("dec.pothole", ell(ell(ell(dc(), 8, 8, 5.5, 3.6, "concrete1"), 8, 8.4, 4.4, 2.7, "night1"), 8.5, 9, 2.5, 1.3, "screen0").pts("concrete0", (4, 6), (12, 10)).pts("screen1", (8, 9)))
D("dec.patch", dc().rect(3, 4, 10, 7, "night2").h_(3, 4, 10, "concrete0").v_(12, 4, 7, "concrete0").pts("night1", (5, 6), (9, 8), (7, 9)))
D("dec.crack_2", dc().pts("night1", (0, 9), (1, 9), (2, 8), (3, 8), (4, 9), (5, 9), (6, 10), (7, 10), (8, 9), (9, 8), (10, 8), (11, 7), (12, 7), (13, 8), (14, 8), (15, 7),
  (6, 11), (6, 12), (5, 13), (11, 6), (12, 5), (12, 4)).pts("yerba1", (7, 11), (12, 6)))
D("dec.rubble", dc().rect(4, 9, 3, 2, "concrete2").rect(9, 7, 2, 2, "concrete3").rect(7, 11, 2, 1, "concrete1").pts("concrete3", (5, 9), (12, 11), (3, 12)).pts("night1", (4, 11), (9, 9)))
D("dec.trash", dc().rect(5, 6, 6, 6, "night2").h_(6, 5, 4, "night3").px(8, 4, "night3").pts("night1", (6, 11), (10, 9)).pts("bone", (11, 11), (12, 11)).px(3, 12, "steel"))
# Shores and decay (natural pass): reeds at the waterline, lily pads, rust, a drip stain, roots through a floor.
D("dec.reeds", dc().v_(3, 6, 9, "yerba1").v_(5, 4, 11, "yerba0").v_(8, 7, 8, "yerba1").v_(11, 5, 10, "yerba0").v_(13, 8, 7, "yerba1").pts("warm2", (5, 3), (11, 4)).pts("warm1", (5, 2), (11, 3)))
D("dec.lily", ell(ell(dc(), 5, 6, 2.6, 1.8, "yerba0"), 11, 11, 2.2, 1.5, "yerba0").pts("yerba1", (4, 5), (5, 5), (10, 10), (11, 10)).pts("pork1", (6, 6)).pts("night2", (5, 7), (11, 12)))
D("dec.rust", ell(dc(), 8, 9, 5, 3.5, "warm1").pts("warm2", (6, 8), (9, 9), (7, 10)).pts("night2", (11, 10), (4, 9)))
D("dec.drip", ell(ell(dc(), 8, 8, 4.5, 2.6, "screen0"), 8, 8, 3, 1.6, "night1", ring=True).pts("screen1", (7, 8), (9, 7)))
D("dec.roots", dc().pts("warm1", (0, 4), (1, 4), (2, 5), (3, 5), (4, 6), (5, 6), (6, 7), (6, 8), (7, 9), (8, 9), (15, 11), (14, 11), (13, 12), (12, 12), (11, 13)).pts("warm0", (3, 6), (7, 10), (12, 13)).pts("yerba0", (8, 8), (13, 11)))
D("dec.grate_tree", ell(ell(dc(), 8, 8, 7.5, 7.5, "night1", ring=True), 8, 8, 5.5, 5.5, "night2", ring=True).pts("steel", (8, 1), (1, 8), (14, 8), (8, 14)))

write("props", 16, 24, PROPS)
write("wide", 32, 16, WIDE)
write("big", 32, 40, BIG)
write("decals", 16, 16, DECALS)
write("principals", 24, 32, PRINCIPALS)
write("doors", 16, 16, DOORS)
write("enemies", 16, 16, ENEMIES)
write("warden", 32, 40, WARDEN)
