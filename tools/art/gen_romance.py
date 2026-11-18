#!/usr/bin/env python3
"""Draw the romance NPCs (D-014) as text pixel maps: assets/src/romance.txt.

Same look as tools/art/gen_props.py (palette names, auto outline in night0). Frames are named by
NPC id; "#1" is the second idle frame. Run this, then `python3 tools/art/build.py romance`.
"""
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PAL = [k for k in json.loads((REPO / "tools/art/palette.json").read_text()) if not k.startswith("_")]
LETTERS = "0123abcdefghijklmnopqrstuvwxyzABCDEF"
L = dict(zip(PAL, LETTERS))


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


def woman(*, skin, hair, hair_d, top, top_d, skirt, skirt_d, legs="skin1", shoes="night2",
          long_hair=True, blush=None, accent=None, glasses=False, bun=False, bangs=False, mono_eyes=False, frame=0):
    """A standing woman, facing the camera. frame 1 = blink + a little sway of the hair."""
    c = C()
    head_y = 3
    # hair behind the head (long hair falls to the shoulders or past them)
    if long_hair:
        c.rect(4, head_y, 8, 2, hair).rect(4, head_y + 2, 1, 8 + frame, hair_d).rect(11, head_y + 2, 1, 8 - frame, hair_d)
    if bun:
        c.rect(6, head_y - 2, 4, 2, hair)
    # face
    c.rect(5, head_y + 1, 6, 6, skin).rect(5, head_y, 6, 2, hair).px(5, head_y + 2, hair).px(10, head_y + 2, hair)
    if bangs:                                        # straight-cut fringe down to the brows
        c.rect(5, head_y + 2, 6, 1, hair)
    ey = head_y + 4
    if frame == 1:
        c.pts("skin0", (6, ey), (9, ey))            # blink
        if mono_eyes:
            c.pts("skin0", (7, ey), (8, ey))
    elif mono_eyes:                                  # narrow almond eyes: a 2-px dark line each
        c.pts("night0", (6, ey), (9, ey)).pts("night1", (6, ey - 1), (9, ey - 1))   # dark eye + lid line
    else:
        c.pts("night0", (6, ey), (9, ey))
    if glasses:
        c.pts("steel", (5, ey), (7, ey), (8, ey), (10, ey))
    if blush:
        c.pts(blush, (5, ey + 1), (10, ey + 1))
    c.pts("soft0", (7, ey + 2), (8, ey + 2))       # mouth
    if accent:
        c.px(10, head_y, accent).px(11, head_y + 1, accent)   # a flower / clip in the hair
    # neck, top, skirt
    c.rect(7, head_y + 7, 2, 1, skin)
    c.rect(4, head_y + 8, 8, 5, top).rect(11, head_y + 8, 1, 5, top_d).rect(4, head_y + 9, 1, 3, top_d)
    c.rect(3, head_y + 13, 10, 4, skirt).rect(12, head_y + 13, 1, 4, skirt_d).rect(3, head_y + 16, 10, 1, skirt_d)
    # arms
    c.rect(3, head_y + 9, 1, 4, skin).rect(12, head_y + 9, 1, 4, skin)
    # legs and shoes
    c.rect(5, head_y + 17, 2, 3, legs).rect(9, head_y + 17, 2, 3, legs)
    c.rect(5, 23, 2, 1, shoes).rect(9, 23, 2, 1, shoes)
    return c.outline()


FRAMES = {}


def F(name, **kw):
    FRAMES[name] = woman(**kw, frame=0).rows()
    FRAMES[f"{name}#1"] = woman(**kw, frame=1).rows()


# Manuelita, Michael's girlfriend: "the prettiest girl in all the land". East Asian: long straight
# black hair with a blunt fringe, almond eyes, fair skin; an orange flower, a red dress, a little blush.
F("npc.manuelita", skin="skin3", hair="night1", hair_d="night0", top="signal", top_d="soft0",
  skirt="signal", skirt_d="soft0", legs="skin3", shoes="night1", blush="pork2", accent="balloon1",
  bangs=True, mono_eyes=True)
# Brooke, Trevor's date: honey ponytail, denim jacket, a white skirt.
F("npc.brooke", skin="skin3", hair="warm4", hair_d="warm3", top="tub1", top_d="tub0",
  skirt="bone", skirt_d="concrete3", legs="skin3", shoes="warm1", blush="pork2")
# Trevor's mom: grey bob in a bun, reading glasses, a cardigan.
F("npc.trevor_mom", skin="skin3", hair="concrete3", hair_d="concrete2", top="soft1", top_d="soft0",
  skirt="warm2", skirt_d="warm1", legs="skin2", shoes="warm0", long_hair=False, bun=True, glasses=True)
# Inés, Manuel's date: dark curls, a yerba-green top, jeans.
F("npc.ines", skin="skin1", hair="warm0", hair_d="night1", top="yerba1", top_d="yerba0",
  skirt="tub0", skirt_d="night3", legs="tub0", shoes="night2", blush="soft1", accent="bone")


def armorer(frame=0):
    """Ottoline Brack, master armorer: grey braid, welding goggles pushed up, leather apron, big arms."""
    c = C()
    c.rect(5, 3, 6, 6, "skin1").rect(5, 2, 6, 2, "concrete3").rect(11, 4, 1, 7, "concrete2")      # face, hair, braid
    c.rect(5, 3, 6, 1, "steel").pts("screen1", (6, 3), (9, 3))                                  # goggles on the forehead
    c.pts("night0", (6, 6), (9, 6)).pts("soft0", (7, 8), (8, 8))
    if frame:
        c.pts("skin0", (6, 6), (9, 6))
    c.rect(7, 9, 2, 1, "skin1")
    c.rect(3, 10, 10, 8, "concrete1").rect(5, 11, 6, 9, "warm1").rect(5, 11, 6, 1, "warm2")      # shirt, leather apron
    c.rect(2, 11, 2, 6, "skin1").rect(12, 11, 2, 6, "skin1")                                      # forearms
    c.rect(12, 16 - frame, 2, 3, "steel")                                                         # hammer
    c.rect(5, 20, 2, 3, "night2").rect(9, 20, 2, 3, "night2").rect(4, 23, 3, 1, "warm0").rect(9, 23, 3, 1, "warm0")
    return c.outline()


FRAMES["npc.armorer"] = armorer(0).rows()
FRAMES["npc.armorer#1"] = armorer(1).rows()

out = ["# romance: generated by tools/art/gen_romance.py. Do not hand-edit; change the generator.",
       "@size 16 24", "@map " + " ".join(f"{L[k]}={k}" for k in PAL)]
for n, rows in FRAMES.items():
    out.append(f"@frame {n}")
    out.extend(rows)
(REPO / "assets" / "src" / "romance.txt").write_text("\n".join(out) + "\n")
print(f"romance: {len(FRAMES)} frames")
