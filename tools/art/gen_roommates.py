#!/usr/bin/env python3
"""Write the roommates' text pixel maps (assets/src/<name>.txt) from shared body templates.

The three share a body and differ in head, height and colors. Edit the templates here and re-run,
or hand-edit the generated .txt for one-off frames (then stop regenerating that character).
Left-facing frames are not authored: the engine flips right-facing ones (D-004).
"""
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BLANK = "." * 16

# Letters: o outline, H/h hair, S/s skin, E eye, T/t top, P pants, B boots.
HEADS = {
    "manuel": {  # curly, the widest head
        "down": [BLANK,
                 ".....oo.oo.o....",
                 "...ooHHoHHoHo...",
                 "..oHHHHHHHHHHo..",
                 "..oHhHHhHHhHHo..",
                 "..oHHHHHHHHHhHo.",
                 "..oHHSSSSSSHHo..",
                 "..ohSSESSESShHo.",
                 "...oSSSSSSSSo...",
                 "....osSSSSso....",
                 ".....oossoo....."],
        "up":   [BLANK,
                 ".....oo.oo.o....",
                 "...ooHHoHHoHo...",
                 "..oHHHHHHHHHHo..",
                 "..oHhHHhHHhHHo..",
                 "..oHHHHHHHHHhHo.",
                 "..oHHhHHHHhHHo..",
                 "..ohHHHhHHHHhHo.",
                 "...oHHHHhHHHo...",
                 "....ohHHHHho....",
                 ".....oossoo....."],
        "right": [BLANK,
                  ".....oo.oo.o....",
                  "...ooHHoHHoHo...",
                  "..oHHHHHHHHHHo..",
                  "..oHhHHhHHhHHo..",
                  "..oHHHHHHHHHSo..",
                  "..oHHhHHSSSSSo..",
                  "..ohHHHSSSESSo..",
                  "...oHHhSSSSSo...",
                  "....ohsSSSSo....",
                  "......oosso....."],
    },
    "trevor": {  # straight, medium length, down past the ears
        "down": [BLANK,
                 BLANK,
                 ".....oooooo.....",
                 "....oHHHHHHo....",
                 "...oHHHHHHHHo...",
                 "...oHHHhHHHHo...",
                 "...oHHSSSSHHo...",
                 "...oHSESSESHo...",
                 "...oHSSSSSSHo...",
                 "...ohsSSSSsho...",
                 "....ooossooo...."],
        "up":   [BLANK,
                 BLANK,
                 ".....oooooo.....",
                 "....oHHHHHHo....",
                 "...oHHHHHHHHo...",
                 "...oHHHhHHHHo...",
                 "...oHHHHHHHHo...",
                 "...oHHhHHHhHo...",
                 "...oHHHHHHHHo...",
                 "...ohHHHHHHho...",
                 "....ooossooo...."],
        "right": [BLANK,
                  BLANK,
                  ".....oooooo.....",
                  "....oHHHHHHo....",
                  "...oHHHHHHHHo...",
                  "...oHHHhHHHHo...",
                  "...oHHHHSSSSo...",
                  "...oHHHSSSESo...",
                  "...oHHHSSSSSo...",
                  "...ohHHsSSSo....",
                  "....oooosso....."],
    },
    "michael": {  # short and dark
        "down": [BLANK,
                 BLANK,
                 ".....oooooo.....",
                 "....oHHHHHHo....",
                 "...oHHhHHHHHo...",
                 "...oHSSSSSSHo...",
                 "...oSSSSSSSSo...",
                 "...oSSESSESSo...",
                 "...oSSSSSSSSo...",
                 "....osSSSSso....",
                 ".....oossoo....."],
        "up":   [BLANK,
                 BLANK,
                 ".....oooooo.....",
                 "....oHHHHHHo....",
                 "...oHHhHHHHHo...",
                 "...oHHHHHHHHo...",
                 "...oHHHHhHHHo...",
                 "...oHhHHHHHHo...",
                 "...oSSSSSSSSo...",
                 "....osSSSSso....",
                 ".....oossoo....."],
        "right": [BLANK,
                  BLANK,
                  ".....oooooo.....",
                  "....oHHHHHHo....",
                  "...oHHhHHHHHo...",
                  "...oHHHHSSSSo...",
                  "...oHHSSSSSSo...",
                  "...oHSSSSESSo...",
                  "...oSSSSSSSSo...",
                  "....osSSSSSo....",
                  "......oosso....."],
    },
}

TORSO = {  # rows 11-16; wide shoulders
    "down": ["...ooTTTTTToo...",
             "..oTTTTTTTTTTo..",
             "..oSoTTTTTToSo..",
             "..oSoTTTTTToSo..",
             "..oSotTTTTtoSo..",
             "...ootTTTTtoo..."],
    "up":   ["...ooTTTTTToo...",
             "..oTTTTTTTTTTo..",
             "..oSoTTTTTToSo..",
             "..oSoTtTTtToSo..",
             "..oSotTTTTtoSo..",
             "...ootTTTTtoo..."],
    "right": [".....oTTTTo.....",
              "....oTTTTTTo....",
              "....oTTSSTTo....",
              "....oTTSSTTo....",
              "....otTSSTto....",
              ".....otTTto....."],
}

LEGS = {  # rows 17-23 (7 rows)
    "down": {
        "stand": ["....oPPPPPPo....",
                  "....oPPPPPPo....",
                  "....oPPooPPo....",
                  "....oPPooPPo....",
                  "....oPPooPPo....",
                  "....oBBooBBo....",
                  ".....oo..oo....."],
        "stepa": ["....oPPPPPPo....",
                  "....oPPPPPPo....",
                  "....oPPooPPo....",
                  "....oPPooPPo....",
                  "....oPPooBBo....",
                  "....oBBo.oo.....",
                  ".....oo........."],
        "stepb": ["....oPPPPPPo....",
                  "....oPPPPPPo....",
                  "....oPPooPPo....",
                  "....oPPooPPo....",
                  "....oBBooPPo....",
                  ".....oo.oBBo....",
                  ".........oo....."],
    },
    "right": {
        "stand": [".....oPPPPo.....",
                  ".....oPPPPo.....",
                  ".....oPPPPo.....",
                  ".....oPPPPo.....",
                  ".....oPPPPo.....",
                  ".....oBBBBBo....",
                  ".....ooooooo...."],
        "stepa": [".....oPPPPo.....",
                  ".....oPPPPo.....",
                  "....oPPooPPo....",
                  "....oPPooPPo....",
                  "...oPPo..oPPo...",
                  "...oBBBo.oBBBo..",
                  "...ooooo.ooooo.."],
        "stepb": [".....oPPPPo.....",
                  ".....oPPPPo.....",
                  ".....oPPPPo.....",
                  "....oPPPPPo.....",
                  "....oPPoPPo.....",
                  "....oBBoBBBo....",
                  "....oooooooo...."],
    },
}
LEGS["up"] = LEGS["down"]

CHARS = {
    # short = how many leg rows to remove (Trevor is the tallest at the full 24px)
    "manuel":  dict(short=1, map="o=night0 H=warm1 h=warm0 S=skin2 s=skin1 E=night0 "
                                 "T=yerba1 t=yerba0 P=night3 B=warm0 G=warm2 g=steel W=warm4"),
    "trevor":  dict(short=0, map="o=night0 H=warm2 h=warm1 S=skin3 s=skin2 E=night0 "
                                 "T=tub1 t=tub0 P=night3 B=warm0 G=warm2 g=steel W=warm4"),
    "michael": dict(short=1, map="o=night0 H=night2 h=night1 S=skin3 s=skin2 E=night0 "
                                 "T=soft1 t=soft0 P=night3 B=warm0 G=warm2 g=steel W=warm4"),
}


def frame(name: str, facing: str, legs: str, bob: bool = False) -> list[str]:
    head = list(HEADS[name][facing])
    if bob:  # breathing: the head sinks 1px into the shoulders
        head = [BLANK] + head[:-1]
    rows = head + TORSO[facing] + LEGS[facing][legs]
    for _ in range(CHARS[name]["short"]):
        del rows[19]          # drop a shin row
        rows.insert(0, BLANK)  # keep feet on the same baseline
    assert len(rows) == 24 and all(len(r) == 16 for r in rows), (name, facing, legs)
    return rows


def overlay(rows, *pts):
    g = [list(r) for r in rows]
    for x, y, ch in pts:
        g[y][x] = ch
    return ["".join(r) for r in g]


def long_idle(name: str) -> list[list[str]]:
    """Four frames of what each roommate does when left standing for a while."""
    d = CHARS[name]["short"]
    a, b = frame(name, "down", "stand"), frame(name, "down", "stand", bob=True)
    if name == "manuel":      # sips mate: gourd at the chest, then at the mouth
        low = overlay(a, (9, 14 + d, "G"), (10, 14 + d, "G"), (10, 13 + d, "g"), (11, 14 + d, "S"))
        high = overlay(b, (10, 11 + d, "G"), (11, 11 + d, "G"), (9, 10 + d, "g"), (12, 12 + d, "S"), (12, 13 + d, "S"))
        return [low, low, high, high]
    if name == "trevor":      # tunes the guitar, badly: one hand on the pegs, head cocked on the last frame
        def g(rows, hand):
            return overlay(rows, *[(x, y, "G") for x in range(5, 10) for y in (14, 15, 16)], (7, 15, "o"),
                           (10, 14, "G"), (11, 13, "G"), (12, 12, "G"), (13, 11, "G"), (hand, 12 if hand == 12 else 11, "W"))
        return [g(a, 12), g(a, 13), g(a, 12), g(b, 13)]
    # michael: phone down, phone up, phone up, phone down
    low = overlay(a, (12, 16 + d, "g"), (12, 17 + d, "g"))
    high = overlay(b, (11, 12 + d, "g"), (11, 13 + d, "W"), (12, 13 + d, "S"), (12, 14 + d, "S"))
    return [low, high, high, low]


def alt_idle() -> list[list[str]]:
    """Manuel's other idle: back to the camera. Nothing is shown; the shoulder does the work."""
    d = CHARS["manuel"]["short"]
    a, b = frame("manuel", "up", "stand"), frame("manuel", "up", "stand", bob=True)
    return [overlay(a, (12, 14 + d, "T"), (11, 15 + d, "S")), overlay(b, (12, 15 + d, "T"), (11, 16 + d, "S"))]


def combat(name: str) -> dict[str, list[str]]:
    """Attack (wind-up, swing), dodge (two frames of a low lunge) and hurt, for each facing."""
    d = CHARS[name]["short"]
    out = {}
    for facing in ("down", "up", "right"):
        a = frame(name, facing, "stand")
        step = frame(name, facing, "stepa")
        if facing == "down":
            wind = overlay(a, (13, 11 + d, "G"), (14, 10 + d, "G"), (14, 9 + d, "G"), (15, 8 + d, "G"), (13, 12 + d, "S"))
            swing = overlay(step, (12, 17 + d, "G"), (11, 18 + d, "G"), (10, 19 + d, "G"), (9, 20 + d, "G"),
                            (5, 20 + d, "W"), (6, 21 + d, "W"), (7, 21 + d, "W"), (8, 21 + d, "W"), (12, 16 + d, "S"))
        elif facing == "up":
            wind = overlay(a, (13, 15 + d, "G"), (14, 16 + d, "G"), (14, 17 + d, "G"), (13, 14 + d, "S"))
            swing = overlay(step, (12, 9 + d, "G"), (12, 8 + d, "G"), (11, 7 + d, "G"), (11, 6 + d, "G"),
                            (6, 3 + d, "W"), (7, 2 + d, "W"), (8, 2 + d, "W"), (9, 2 + d, "W"), (10, 3 + d, "W"))
        else:
            wind = overlay(a, (4, 12 + d, "G"), (3, 11 + d, "G"), (2, 10 + d, "G"), (1, 9 + d, "G"), (5, 13 + d, "S"))
            swing = overlay(step, (11, 13 + d, "S"), (12, 13 + d, "G"), (13, 13 + d, "G"), (14, 13 + d, "G"), (15, 13 + d, "G"),
                            (15, 10 + d, "W"), (15, 11 + d, "W"), (15, 15 + d, "W"), (15, 16 + d, "W"))
        out[f"attack_{facing}_0"] = wind
        out[f"attack_{facing}_1"] = swing
        # dodge: the body drops and the legs fold; two rows lower, then three
        for n, cut in enumerate((2, 3)):
            rows = [r for i, r in enumerate(step) if not (19 - cut < i <= 19)]
            out[f"dodge_{facing}_{n}"] = [BLANK] * cut + rows
        # hurt: the head snaps aside and the top flashes
        head = ["." + r[:-1] for r in a[:11 + d]]
        hurt = head + a[11 + d:]
        out[f"hurt_{facing}_0"] = overlay(hurt, (2, 3 + d, "W"), (1, 5 + d, "W"), (14, 2 + d, "W"))
    return out


def write(name: str) -> None:
    out = [f"# {name}: generated by tools/art/gen_roommates.py. 16x24, facings down/up/right.",
           "# Left is the engine's flip of right. Props (mate, guitar, phone) are overlay sheets.",
           "@size 16 24", f"@map {CHARS[name]['map']}"]
    for facing in ("down", "up", "right"):
        seq = [("idle", 0, "stand", False), ("idle", 1, "stand", True),
               ("walk", 0, "stepa", False), ("walk", 1, "stand", True),
               ("walk", 2, "stepb", False), ("walk", 3, "stand", True)]
        for anim, n, legs, bob in seq:
            out.append(f"@frame {anim}_{facing}_{n}")
            out.extend(frame(name, facing, legs, bob))
    for fname, rows in combat(name).items():
        assert len(rows) == 24 and all(len(r) == 16 for r in rows), fname
        out.append(f"@frame {fname}")
        out.extend(rows)
    for n, rows in enumerate(long_idle(name)):
        out.append(f"@frame long_down_{n}")
        out.extend(rows)
    if name == "manuel":
        for n, rows in enumerate(alt_idle()):
            out.append(f"@frame alt_up_{n}")
            out.extend(rows)
    (REPO / "assets" / "src" / f"{name}.txt").write_text("\n".join(out) + "\n")


if __name__ == "__main__":
    for n in CHARS:
        write(n)
    print("wrote", ", ".join(f"assets/src/{n}.txt" for n in CHARS))
