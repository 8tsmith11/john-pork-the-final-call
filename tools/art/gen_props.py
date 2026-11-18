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

# ---- wide wall pieces (32x16, hung on a wall tile and the one to its right) ----
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
write("big", 32, 40, BIG)
write("principals", 24, 32, PRINCIPALS)
write("enemies", 16, 16, ENEMIES)
write("warden", 32, 40, WARDEN)
