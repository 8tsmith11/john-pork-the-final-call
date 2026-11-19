#!/usr/bin/env python3
"""Item icons for the inventory grid and hotbar: 16x16, palette-only, auto-outlined like the props.

Writes assets/sprites/icons.png + icons.json (a Phaser atlas; frame name = item id).
Items without a hand-drawn icon get a generic one by slot. Run: python3 tools/art/gen_icons.py
"""
import json
from pathlib import Path
from PIL import Image

REPO = Path(__file__).resolve().parents[2]
PALJ = {k: v for k, v in json.loads((REPO / "tools/art/palette.json").read_text()).items() if not k.startswith("_")}
RGB = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in PALJ.items()}


class I:
    def __init__(self):
        self.g = [[None] * 16 for _ in range(16)]

    def px(self, x, y, c):
        if 0 <= x < 16 and 0 <= y < 16: self.g[y][x] = c
        return self

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w): self.px(xx, yy, c)
        return self

    def pts(self, c, *ps):
        for x, y in ps: self.px(x, y, c)
        return self

    def line(self, x0, y0, x1, y1, c):
        n = max(abs(x1 - x0), abs(y1 - y0)) or 1
        for i in range(n + 1): self.px(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n), c)
        return self

    def disc(self, cx, cy, r, c):
        for y in range(16):
            for x in range(16):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.5: self.px(x, y, c)
        return self

    def outline(self, c="night0"):
        src = [r[:] for r in self.g]
        for y in range(16):
            for x in range(16):
                if src[y][x] is None and any(0 <= x + dx < 16 and 0 <= y + dy < 16 and src[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    self.g[y][x] = c
        return self


def bat():
    return I().line(3, 13, 11, 5, "warm2").line(4, 13, 12, 5, "warm3").line(9, 4, 13, 3, "warm3").rect(11, 3, 3, 3, "warm3").pts("warm1", (3, 13), (4, 12)).pts("warm4", (12, 3))

def pry_bar():
    # Hex steel, with a hooked upper end and a flat split toe; distinct from the straight rebar.
    return (I().line(3, 12, 10, 5, "steel").line(4, 13, 11, 6, "concrete2")
            .line(10, 6, 12, 4, "steel").line(12, 4, 12, 3, "steel")
            .line(12, 3, 11, 2, "steel").line(11, 2, 9, 2, "steel").px(8, 3, "steel")
            .pts("concrete2", (13, 3), (13, 4), (12, 5), (3, 14))
            .pts("bone", (9, 2), (10, 2), (6, 9), (7, 8), (2, 13)).px(3, 13, "night2"))

def launcher():
    return I().rect(2, 6, 11, 4, "steel").rect(2, 6, 11, 1, "concrete3").rect(12, 7, 3, 2, "concrete2").rect(4, 10, 3, 4, "concrete1").rect(8, 10, 2, 2, "concrete1").pts("screen2", (9, 7), (10, 7)).pts("rot0", (3, 8))

def vest():
    return I().rect(3, 3, 10, 11, "concrete2").rect(6, 3, 4, 3, None).pts("concrete3", *[(x, y) for y in range(6, 14, 2) for x in range(4 if y % 4 else 5, 13, 2)]).rect(7, 6, 2, 8, "concrete1")

def sniffer():
    return I().rect(4, 5, 7, 9, "concrete1").rect(5, 6, 5, 3, "screen1").pts("screen2", (6, 7), (8, 7)).line(10, 5, 13, 1, "steel").pts("balloon1", (13, 1)).rect(5, 10, 2, 2, "signal").rect(8, 10, 2, 2, "yerba1")

def charm():
    return I().line(5, 1, 8, 6, "warm2").line(11, 1, 8, 6, "warm2").disc(8, 10, 4, "warm3").disc(8, 10, 3, "bone").line(8, 10, 8, 7, "night2").line(8, 10, 10, 11, "night2")

def pin():
    return I().disc(8, 8, 5, "bone").pts("pork1", (6, 8), (7, 8), (8, 8), (9, 8), (10, 8), (6, 9), (10, 9), (7, 10), (8, 10), (9, 10)).pts("night2", (6, 6), (10, 6), (7, 9), (9, 9)).pts("bone", (3, 3), (13, 3))

def mate():
    return I().rect(5, 3, 6, 11, "yerba0").rect(5, 3, 6, 2, "steel").rect(6, 2, 4, 1, "concrete3").rect(6, 7, 4, 4, "yerba1").pts("bone", (7, 8), (8, 9))

def scrap():
    return I().line(2, 12, 7, 7, "steel").line(3, 12, 8, 7, "concrete3").rect(8, 9, 5, 2, "concrete2").disc(11, 5, 2, "steel").pts("night2", (11, 5)).pts("warm2", (4, 13), (12, 10))

def wire():
    i = I()
    for k, (x, y) in enumerate([(3, 9), (4, 6), (6, 4), (9, 4), (11, 6), (12, 9), (11, 12), (8, 13), (5, 12), (5, 9), (7, 7), (9, 8)]):
        i.disc(x, y, 1, "warm3" if k % 2 else "warm2")
    return i.pts("warm4", (6, 4), (11, 6))

def plastic():
    i = I().rect(3, 6, 10, 8, "concrete3").rect(3, 6, 10, 1, "bone").rect(5, 4, 6, 2, "concrete3")
    return i.pts("tub1", (5, 9), (8, 10), (10, 8), (6, 12)).pts("soft1", (9, 12), (7, 8)).pts("yerba1", (11, 11))

def cloth():
    return I().rect(2, 5, 12, 8, "soft0").rect(2, 5, 12, 2, "soft1").line(2, 9, 13, 9, "soft1").pts("bone", (4, 11), (8, 11), (12, 11)).rect(10, 12, 3, 2, "soft0")

def circuit():
    i = I().rect(2, 3, 12, 10, "yerba0").rect(5, 6, 4, 4, "night2").pts("concrete3", (5, 5), (7, 5), (5, 10), (7, 10), (4, 7), (9, 7))
    return i.line(9, 8, 13, 8, "warm3").line(11, 4, 11, 8, "warm3").pts("rot1", (12, 11)).pts("night1", (3, 12), (4, 11))

def cell():
    return I().rect(5, 3, 6, 11, "tub0").rect(5, 3, 6, 2, "steel").rect(7, 2, 2, 1, "concrete3").rect(6, 7, 4, 3, "rot1").pts("night2", (7, 8), (8, 8)).pts("tub1", (5, 5), (5, 6))

def gel():
    return I().disc(8, 9, 5, "rot0").disc(7, 8, 3, "pork0").pts("rot1", (6, 6), (10, 11)).pts("pork2", (6, 7)).pts("rot0", (12, 4), (3, 13))

def glass():
    return I().line(3, 12, 8, 3, "screen1").line(4, 12, 9, 3, "screen2").line(8, 3, 12, 11, "screen1").line(3, 12, 12, 11, "screen0").pts("bone", (7, 6))

def scooter():
    return I().line(4, 3, 4, 12, "steel").rect(2, 3, 5, 1, "concrete3").rect(4, 11, 9, 2, "concrete2").disc(4, 13, 2, "night2").disc(12, 13, 2, "night2").pts("signal", (12, 11)).pts("screen2", (5, 3))

def hicap():
    return I().rect(2, 6, 12, 5, "tub0").rect(2, 6, 12, 1, "tub1").rect(4, 8, 6, 2, "rot1").pts("signal", (12, 8)).pts("steel", (1, 8), (14, 8))

def bar():
    return I().line(2, 11, 12, 4, "warm1").line(3, 12, 13, 5, "warm2").line(4, 12, 13, 6, "warm2").line(5, 9, 9, 7, "warm4").pts("signal", (11, 6))

def chips():
    return I().rect(4, 3, 8, 11, "signal").rect(4, 3, 8, 1, "warm4").rect(4, 13, 8, 1, "warm4").disc(8, 8, 2, "warm3").pts("bone", (6, 11), (9, 11))

def fish(body, fin):
    return I().disc(7, 8, 3, body).rect(4, 7, 6, 3, body).line(10, 8, 13, 5, fin).line(10, 8, 13, 11, fin).line(13, 5, 13, 11, fin).pts("night0", (5, 7)).pts("bone", (6, 9), (8, 9))

def phone():
    return I().rect(5, 2, 6, 12, "night2").rect(6, 3, 4, 8, "screen1").line(6, 3, 9, 7, "screen2").pts("signal", (8, 12))

def coin():
    return I().disc(8, 8, 5, "warm3").disc(8, 8, 4, "warm4").line(6, 6, 6, 10, "warm2").line(10, 6, 10, 10, "warm2")

def figure():
    return I().disc(8, 5, 3, "pork1").pts("night0", (7, 4), (9, 4)).pts("pork0", (7, 6), (8, 6), (9, 6)).rect(6, 8, 5, 5, "night3").rect(6, 13, 2, 2, "night2").rect(9, 13, 2, 2, "night2")

# D-014 items (BagelMeister): instruments, gifts, the new armor/gear slots, backpacks, uniques.
def guitar(body, edge, center):
    return I().disc(5, 11, 3, edge).disc(5, 11, 2, body).disc(8, 8, 2, edge).disc(8, 8, 1, body).px(5, 11, center).line(9, 7, 13, 2, "warm1").rect(12, 1, 3, 2, "warm0").line(9, 8, 13, 3, "bone")

def boot(top, toe, sole="night2"):
    return I().rect(5, 3, 4, 8, top).rect(5, 10, 8, 3, top).rect(10, 10, 3, 3, toe).rect(5, 13, 8, 1, sole)

def pack(body, flap):
    return I().rect(4, 4, 8, 10, body).rect(4, 4, 8, 3, flap).rect(6, 9, 4, 3, flap).pts("night2", (7, 7), (8, 7))

def glove(c, cuff, tip=None):
    g = I().rect(4, 7, 7, 6, c).rect(4, 13, 7, 2, cuff)
    for x in (4, 6, 8, 10): g.rect(x, 3 if x in (6, 8) else 4, 1, 4, c)
    g.rect(11, 8, 2, 3, c)
    if tip: g.pts(tip, (4, 4), (6, 3), (8, 3), (10, 4), (12, 8))
    return g

def sock(c, stripe, heel):
    return I().rect(6, 2, 4, 9, c).rect(6, 10, 7, 4, c).rect(11, 11, 2, 3, heel).rect(6, 3, 4, 1, stripe).rect(6, 5, 4, 1, stripe)

D014 = {
    "item.guitar_electric": lambda: guitar("warm3", "warm1", "warm4").pts("steel", (6, 12), (4, 10)),
    "item.guitar_acoustic": lambda: guitar("warm2", "warm1", "night0"),
    "item.flowers": lambda: I().line(6, 6, 7, 13, "yerba1").line(9, 6, 8, 13, "yerba1").line(11, 7, 9, 13, "yerba0").disc(6, 5, 2, "signal").disc(9, 4, 2, "pork1").disc(11, 6, 2, "balloon1").rect(5, 11, 6, 4, "bone").pts("concrete3", (6, 12), (9, 13)),
    "item.chocolates": lambda: I().disc(6, 7, 3, "signal").disc(10, 7, 3, "signal").line(3, 8, 8, 13, "signal").line(13, 8, 8, 13, "signal").rect(5, 8, 7, 3, "signal").rect(7, 9, 3, 3, "signal").line(8, 4, 8, 12, "bone").line(4, 8, 12, 8, "bone"),
    "item.bike_helmet": lambda: I().disc(8, 10, 6, "tub1").rect(1, 11, 15, 5, None).rect(2, 10, 12, 1, "tub0").rect(11, 9, 4, 2, "night3").pts("night2", (5, 7), (8, 5), (11, 7)).pts("bone", (4, 8), (5, 6)),
    "item.hardhat": lambda: I().disc(8, 9, 5, "warm4").rect(2, 10, 13, 5, None).rect(2, 9, 12, 2, "warm3").line(8, 4, 8, 8, "warm3"),
    "item.work_pants": lambda: I().rect(4, 2, 8, 3, "warm2").rect(4, 5, 3, 10, "warm2").rect(9, 5, 3, 10, "warm2").rect(4, 9, 3, 2, "warm1").rect(9, 9, 3, 2, "warm1").rect(4, 2, 8, 1, "warm1"),
    "item.steel_toes": lambda: boot("warm1", "steel"),
    "item.sneakers": lambda: boot("bone", "bone", "tub1").line(5, 11, 9, 11, "tub0").pts("signal", (6, 5), (7, 7)),
    "item.welding_goggles": lambda: I().rect(1, 7, 14, 2, "night3").disc(5, 8, 3, "steel").disc(11, 8, 3, "steel").disc(5, 8, 2, "screen0").disc(11, 8, 2, "screen0").pts("screen2", (4, 7), (10, 7)),
    "item.rain_parka": lambda: I().disc(8, 4, 3, "warm4").rect(3, 6, 10, 9, "warm4").rect(6, 4, 4, 3, "night2").line(8, 7, 8, 14, "warm3").rect(2, 7, 2, 6, "warm3").rect(12, 7, 2, 6, "warm3"),
    "item.work_gloves": lambda: glove("warm3", "warm1"),
    "item.wool_socks": lambda: sock("soft1", "bone", "soft0"),
    "item.pack_coolant": lambda: pack("concrete2", "concrete1").line(3, 5, 3, 13, "screen1").line(12, 5, 12, 13, "screen2").pts("screen2", (8, 10)),
    "item.pack_drone": lambda: pack("night3", "night2").rect(5, 1, 6, 2, "steel").pts("steel", (4, 1), (11, 1)).px(8, 2, "signal"),
    "item.pack_capacitor": lambda: pack("concrete1", "night3").rect(5, 8, 6, 5, "rot1").line(9, 8, 7, 11, "night0").line(7, 11, 9, 11, "night0").line(9, 11, 7, 13, "night0"),
    "item.keycard": lambda: I().rect(4, 4, 8, 10, "bone").rect(5, 6, 3, 3, "skin2").rect(9, 6, 2, 1, "night3").rect(9, 8, 2, 1, "night3").rect(5, 11, 6, 1, "screen1").line(8, 1, 8, 4, "signal"),
    "item.hard_candy": lambda: I().disc(8, 8, 3, "warm3").pts("warm4", (7, 7)).line(2, 8, 4, 6, "warm4").line(2, 8, 4, 10, "warm4").line(14, 8, 12, 6, "warm4").line(14, 8, 12, 10, "warm4"),
    "item.lighter": lambda: I().rect(6, 5, 4, 9, "screen1").rect(6, 3, 4, 2, "steel").pts("balloon1", (8, 1), (8, 2)).px(7, 2, "warm4"),
    "item.lottery_ticket": lambda: I().rect(3, 4, 10, 8, "bone").rect(5, 6, 6, 4, "concrete3").pts("signal", (4, 5), (11, 10)).pts("warm3", (6, 7), (8, 8), (10, 7)),
    "item.caffeine": lambda: I().rect(5, 3, 6, 11, "night3").rect(5, 3, 6, 1, "steel").rect(5, 13, 6, 1, "steel").rect(6, 6, 4, 4, "warm1").pts("bone", (7, 7), (8, 8)).px(9, 4, "steel"),
    "item.sleep_potion": lambda: I().disc(8, 10, 4, "tub1").disc(8, 10, 2, "screen2").rect(7, 3, 2, 4, "bone").rect(6, 2, 4, 1, "warm1").pts("bone", (6, 9)),
    # Manuel's uniques
    "item.arg_shirt": lambda: I().rect(3, 3, 10, 11, "bone").rect(1, 3, 3, 4, "bone").rect(12, 3, 3, 4, "bone").rect(4, 3, 2, 11, "tub1").rect(8, 3, 2, 11, "tub1").rect(12, 3, 1, 11, "tub1").rect(6, 3, 4, 1, "night2").pts("night2", (7, 4), (8, 4)),
    "item.hasbulla_tee": lambda: I().rect(2, 2, 12, 13, "bone").rect(0, 2, 3, 5, "bone").rect(13, 2, 3, 5, "bone").rect(6, 2, 4, 1, "concrete3").disc(8, 7, 1, "night2").rect(7, 8, 3, 3, "night2").pts("concrete3", (3, 14), (12, 14)),
    "item.smart_pacifier": lambda: I().disc(8, 9, 5, "tub1").disc(8, 9, 3, "tub0").rect(6, 3, 4, 3, "bone").disc(8, 3, 2, "bone").disc(8, 14, 2, "bone").rect(8, 13, 1, 1, None).px(11, 7, "signal").px(5, 11, "screen2"),
    "item.mate_holster": lambda: I().rect(3, 3, 2, 11, "warm1").rect(11, 3, 2, 11, "warm1").disc(8, 10, 3, "warm2").rect(6, 6, 5, 2, "warm1").line(9, 3, 9, 8, "steel").rect(3, 5, 2, 7, "steel"),
    # Trevor's uniques
    "item.stage_jacket": lambda: I().rect(3, 3, 10, 11, "tub0").rect(3, 3, 10, 1, "tub1").rect(7, 3, 2, 11, "night3").pts("signal", (5, 6)).pts("rot1", (10, 9)).pts("bone", (5, 11), (11, 6)).rect(1, 5, 2, 6, "tub0").rect(13, 5, 2, 6, "tub0"),
    "item.callus_gloves": lambda: glove("warm1", "warm0", "skin2"),
    "item.tank_goggles": lambda: I().disc(5, 8, 3, "screen1").disc(11, 8, 3, "screen1").pts("screen2", (4, 7), (10, 7)).line(8, 8, 8, 8, "steel").rect(1, 8, 2, 1, "night3").rect(14, 8, 2, 1, "night3"),
    "item.spinner_pack": lambda: I().rect(3, 6, 10, 7, "concrete1").rect(3, 6, 10, 1, "concrete3").disc(8, 9, 3, "steel").line(4, 9, 12, 9, "bone").pts("signal", (11, 7)).rect(4, 3, 1, 3, "night3").rect(11, 3, 1, 3, "night3"),
    # Michael's uniques
    "item.winged_boots": lambda: boot("bone", "bone", "balloon0").pts("bone", (3, 4), (2, 5), (3, 6), (2, 7), (4, 5), (4, 6)).pts("balloon1", (13, 13), (14, 12), (12, 14)).rect(5, 8, 4, 1, "warm4"),
    "item.cowboy_hat": lambda: I().rect(1, 10, 14, 2, "warm4").rect(4, 5, 8, 6, "warm4").rect(4, 9, 8, 1, "warm1").pts("warm3", (7, 5), (8, 5), (6, 6), (9, 6)).pts("warm3", (1, 10), (14, 10)),
    "item.smoky_socks": lambda: sock("concrete3", "concrete2", "concrete2").pts("yerba0", (6, 8), (7, 7), (8, 8), (9, 7)).pts("bone", (7, 6)),
    "item.signal_gloves": lambda: glove("night3", "night2", "screen2").pts("screen1", (6, 9), (7, 10), (8, 9)),
}

ICONS = {
    "item.wooden_bat": bat, "item.fab_launcher": launcher, "item.mesh_vest": vest, "item.sniffer": sniffer,
    "item.charm_1901": charm, "item.pork_pin": pin, "item.mate_flask": mate,
    "item.mat_scrap": scrap, "item.mat_wire": wire, "item.mat_plastic": plastic, "item.mat_cloth": cloth,
    "item.mat_circuit": circuit, "item.mat_cell": cell, "item.mat_gel": gel, "item.mat_glass": glass,
    "item.scooter": scooter, "item.scooter_hicap": hicap, "item.energy_bar": bar, "item.crab_chips": chips,
    "item.fish_perch": lambda: fish("concrete3", "steel"), "item.fish_bluegill": lambda: fish("tub1", "yerba1"),
    "item.fish_catfish": lambda: fish("warm1", "warm2"), "item.fish_striper": lambda: fish("bone", "night3"),
    "item.fish_glitch": lambda: fish("rot0", "rot1"), "item.fish_loopfin": lambda: fish("screen1", "screen2"),
    "item.fish_lantern": lambda: fish("yerba0", "rot1").pts("screen2", (6, 8), (8, 8)),
    "item.lake_bust": lambda: I().rect(5, 10, 6, 4, "concrete3").disc(8, 6, 4, "bone").pts("night2", (6, 5), (10, 5)).rect(6, 7, 5, 2, "concrete3").pts("bone", (4, 2), (12, 2)),
    "item.ozzie_lure": lambda: I().line(8, 1, 8, 4, "steel").disc(8, 8, 3, "signal").rect(5, 8, 7, 3, "bone").line(8, 11, 6, 14, "steel").line(8, 11, 10, 14, "steel"),
    "item.pipe_wrench": lambda: I().line(4, 13, 10, 7, "steel").line(5, 13, 11, 7, "concrete3").rect(9, 3, 4, 3, "steel").rect(12, 5, 2, 3, "steel").pts("night2", (11, 6)),
    "item.box_cutter": lambda: I().line(3, 12, 9, 6, "tub1").line(4, 12, 10, 6, "tub0").line(10, 5, 13, 3, "bone").pts("steel", (11, 4)),
    "item.rebar": lambda: I().line(2, 14, 13, 3, "warm1").line(3, 14, 14, 3, "warm2").pts("steel", (13, 2), (14, 2), (14, 3)).pts("warm0", (5, 11), (8, 8), (11, 5)),
    "item.busted_guitar": lambda: I().disc(5, 11, 3, "signal").disc(7, 9, 2, "signal").line(8, 8, 13, 2, "warm2").rect(12, 1, 3, 2, "warm1").pts("bone", (5, 11), (6, 10)).line(9, 8, 13, 3, "bone"),
    "item.nail_gun": lambda: I().rect(3, 5, 9, 4, "warm3").rect(11, 6, 3, 2, "steel").rect(5, 9, 3, 4, "night3").pts("night2", (4, 6), (6, 6)).pts("steel", (14, 7)),
    "item.scattergun": lambda: I().rect(2, 6, 12, 3, "night3").rect(2, 6, 12, 1, "concrete2").rect(4, 9, 3, 4, "warm1").pts("rot0", (12, 7), (13, 7), (10, 5)),
    # The blue pill: one diamond tablet in a foil blister.
    "item.blue_pill": lambda: I().rect(3, 4, 10, 9, "steel").rect(4, 5, 8, 7, "bone").pts("screen1", (8, 6), (7, 7), (8, 7), (9, 7), (6, 8), (7, 8), (8, 8), (9, 8), (10, 8), (7, 9), (8, 9), (9, 9), (8, 10)).pts("screen2", (8, 7), (7, 8)).pts("concrete3", (4, 5), (11, 11)),
    "item.relic_phone": phone, "item.relic_coin": coin, "item.relic_figure": figure,
    **D014,
    # Michael's brown rain parka: his exact color (Michael, 2026-11-18).
    "item.brown_parka": lambda: I().disc(8, 4, 3, "parka").rect(3, 6, 10, 9, "parka").rect(6, 4, 4, 3, "night2").line(8, 7, 8, 14, "warm1").rect(2, 7, 2, 6, "warm2").rect(12, 7, 2, 6, "warm2"),
    "generic": lambda: I().rect(4, 4, 8, 8, "concrete2").rect(4, 4, 8, 1, "concrete3").pts("night2", (7, 7), (8, 7), (7, 8), (8, 8)),
    # Append new frames so existing atlas coordinates stay stable.
    "item.pry_bar": pry_bar,
}


def main():
    names = list(ICONS)
    cols = 8
    rows = (len(names) + cols - 1) // cols
    img = Image.new("RGBA", (cols * 16, rows * 16), (0, 0, 0, 0))
    frames = {}
    for n, name in enumerate(names):
        ic = ICONS[name]().outline()
        ox, oy = (n % cols) * 16, (n // cols) * 16
        for y in range(16):
            for x in range(16):
                c = ic.g[y][x]
                if c: img.putpixel((ox + x, oy + y), RGB[c] + (255,))
        frames[name] = {"frame": {"x": ox, "y": oy, "w": 16, "h": 16}, "rotated": False, "trimmed": False,
                        "spriteSourceSize": {"x": 0, "y": 0, "w": 16, "h": 16}, "sourceSize": {"w": 16, "h": 16}}
    out = REPO / "assets/sprites"
    img.save(out / "icons.png")
    (out / "icons.json").write_text(json.dumps({"frames": frames, "meta": {"image": "icons.png", "size": {"w": img.width, "h": img.height}, "scale": "1"}}, indent=1))
    print(f"{len(names)} icons -> assets/sprites/icons.png")


if __name__ == "__main__":
    main()
