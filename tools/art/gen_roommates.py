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
                                 "T=yerba1 t=yerba0 P=night3 B=warm0"),
    "trevor":  dict(short=0, map="o=night0 H=warm2 h=warm1 S=skin3 s=skin2 E=night0 "
                                 "T=tub1 t=tub0 P=night3 B=warm0"),
    "michael": dict(short=1, map="o=night0 H=night2 h=night1 S=skin3 s=skin2 E=night0 "
                                 "T=soft1 t=soft0 P=night3 B=warm0"),
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
    (REPO / "assets" / "src" / f"{name}.txt").write_text("\n".join(out) + "\n")


if __name__ == "__main__":
    for n in CHARS:
        write(n)
    print("wrote", ", ".join(f"assets/src/{n}.txt" for n in CHARS))
