#!/usr/bin/env python3
"""Write the comic-page prop sheet: assets/src/comic.txt (48x48 frames).

Pieces that comic panels compose into scenes (docs/art/comic-pages.md): a radio dish and a far one,
low flames, a smoke column, gravel, footprints, falling sparks, a motor housing. Everything is drawn
from shapes in code, palette only, deterministic. Panels place these at whole-number scales.

    python3 tools/art/gen_comic.py && python3 tools/art/build.py comic
"""
import math
import random
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
W = H = 48
MAP = "0=night0 1=night1 2=night2 3=night3 a=concrete0 b=concrete1 c=concrete2 d=concrete3 e=warm0 f=warm1 g=warm2 h=warm3 i=warm4 s=steel q=bone"
LIT = set("efghi")   # firelit pixels: the outline is dropped next to them (DIRECTION: no outline on the lit side)


class Canvas:
    def __init__(self):
        self.px = [["."] * W for _ in range(H)]

    def put(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < W and 0 <= y < H:
            self.px[y][x] = c

    def get(self, x, y):
        return self.px[y][x] if 0 <= x < W and 0 <= y < H else "."

    def rect(self, x, y, w, h, c):
        for j in range(y, y + h):
            for i in range(x, x + w):
                self.put(i, j, c)

    def line(self, x0, y0, x1, y1, c):
        x0, y0, x1, y1 = (int(round(v)) for v in (x0, y0, x1, y1))
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.put(x0, y0, c)
            if x0 == x1 and y0 == y1:
                return
            e2 = 2 * err
            if e2 >= dy:
                err += dy
                x0 += sx
            if e2 <= dx:
                err += dx
                y0 += sy

    def disc(self, cx, cy, r, c, soft=False):
        for j in range(int(cy - r - 1), int(cy + r + 2)):
            for i in range(int(cx - r - 1), int(cx + r + 2)):
                d = math.hypot(i - cx, j - cy)
                if d <= r and (not soft or d <= r - 1 or (i + j) % 2 == 0):
                    self.put(i, j, c)

    def outline(self, c="0"):
        """A 1 px outline round everything opaque, left off beside firelit pixels."""
        add = []
        for y in range(H):
            for x in range(W):
                if self.px[y][x] != ".":
                    continue
                near = [self.get(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
                solid = [n for n in near if n not in (".", c)]
                if solid and not any(n in LIT for n in solid):
                    add.append((x, y))
        for x, y in add:
            self.px[y][x] = c

    def rows(self):
        return ["".join(r) for r in self.px]


def dish(far=False):
    """A big radio dish on a pylon, aimed almost straight up (leaning left), firelit from below."""
    cv = Canvas()
    s = 0.5 if far else 1.0
    cx, ground = 24, 47
    vx, vy = cx, ground - 22 * s                     # the bowl's vertex
    th = math.radians(11)
    ax, ay = -math.sin(th), -math.cos(th)            # the bowl's axis (where it points)
    px, py = math.cos(th), -math.sin(th)             # across the bowl
    R, D = 18 * s, 7 * s
    body, rim, low, rib = ("2", "3", "2", "2") if far else ("s", "d", "h", "2")
    # pylon and yoke
    top = int(vy + 7 * s)
    for y in range(top, ground + 1):
        t = (y - top) / max(1, ground - top)
        hw = int(round((3 + 4 * t) * s))
        for x in range(cx - hw, cx + hw + 1):
            c = body if far else ("f" if x == cx - hw else "2" if x >= cx + hw - 1 else "a" if (y - top) % 4 == 3 else "b")
            cv.put(x, y, c)
    if not far:
        for x in (cx - 3, cx + 3):
            cv.rect(x, int(vy + 2), 1, top - int(vy + 2), "s")
        cv.rect(cx - 4, int(vy + 2), 9, 2, "s")
        cv.rect(cx + 3, int(vy + 4), 5, 4, "c")
        cv.put(cx + 6, int(vy + 5), "h")
    # bowl: between the parabola (its back) and the rim chord
    u = -R
    while u <= R:
        k = (u / R) ** 2
        bx, by = vx + px * u + ax * D * k, vy + py * u + ay * D * k     # back of the bowl
        hx, hy = vx + px * u + ax * D, vy + py * u + ay * D             # the rim, edge-on
        n = max(1, int(math.hypot(hx - bx, hy - by) * 3))
        for i in range(n + 1):
            f = i / n
            x, y = bx + (hx - bx) * f, by + (hy - by) * f
            depth = math.hypot(x - bx, y - by)
            c = rim if f > 0.86 else (low if depth < 1.2 and not far and abs(u) < R * 0.8 else body)
            cv.put(x, y, c)
        if not far:
            cv.put(bx - ax, by - ay, "g" if abs(u) < R * 0.7 else "2")         # firelight on the underside
        u += 0.25
    if not far:
        for uu in (-R * 0.5, R * 0.5):                                       # ribs across the back
            k = (uu / R) ** 2
            cv.line(vx, vy, vx + px * uu + ax * D * k, vy + py * uu + ay * D * k, rib)
        cv.outline()
        # the feed on three struts, drawn after the outline so they stay thin
        fx, fy = vx + ax * (D + 12), vy + ay * (D + 12)
        for uu in (-R, R):
            cv.line(vx + px * uu + ax * D, vy + py * uu + ay * D, fx, fy, "c")
        cv.line(vx + ax * D, vy + ay * D, fx, fy, "2")
        cv.rect(int(fx) - 1, int(fy) - 1, 3, 3, "d")
        cv.put(int(fx) + 1, int(fy) + 1, "2")
    return cv.rows()


def fire(phase):
    """A low, even line of flame along the bottom, like a pilot light. Two frames make the flicker."""
    cv = Canvas()
    r = random.Random(f"comic-fire-{phase}")
    for x in range(W):
        n = 0.5 + 0.5 * math.sin(x * 0.8 + phase * 2.1) * math.sin(x * 0.31 + 1.3 + phase * 0.7)
        hx = 3 + round(4 * n) + r.randint(0, 1)
        for y in range(hx + 1):
            f = y / hx
            cv.put(x, 44 - y, "i" if (f < 0.35 and hx >= 5) else "h" if f < 0.75 else "g")
        if hx >= 6 and r.random() < 0.3:
            cv.put(x, 44 - hx - 2, "g")
    for x in range(W):
        cv.put(x, 45, "h" if r.random() < 0.3 else "g")
        cv.put(x, 46, "g" if r.random() < 0.35 else "f")
        cv.put(x, 47, "f" if r.random() < 0.7 else "e")
    return cv.rows()


def smoke(phase):
    """A column of smoke leaning right, its foot warmed by the fire. Soft dithered edges, thinning out."""
    cv = Canvas()
    for i in range(14):
        cy = 46 - i * 3.4 - phase * 1.7
        cx = 18 + i * 0.9 + 2.5 * math.sin(i * 0.9 + phase)
        r = 4 + i * 0.35
        thin = i >= 9
        for j in range(int(cy - r - 1), int(cy + r + 2)):
            for x in range(int(cx - r - 1), int(cx + r + 2)):
                d = math.hypot(x - cx, j - cy)
                if d > r or (thin and (x + j) % 2) or (d > r - 1.2 and (x + j) % 2):
                    continue
                c = "b"
                if j > cy + r * 0.5 and i < 2:
                    c = "f"
                elif j < cy - r * 0.4 and x < cx:
                    c = "c"
                elif x > cx + r * 0.5:
                    c = "2"
                if cv.get(x, j) in ("c",) and c == "b":
                    continue
                cv.put(x, j, c)
    return cv.rows()


def gravel():
    cv = Canvas()
    r = random.Random("comic-gravel")
    cv.rect(0, 0, W, H, "a")
    for y in range(H):
        for x in range(W):
            v = r.random()
            if v < 0.05:
                cv.put(x, y, "c")
            elif v < 0.19:
                cv.put(x, y, "b")
            elif v < 0.25:
                cv.put(x, y, "1")
            elif v < 0.26:
                cv.put(x, y, "d")
    return cv.rows()


SOLE = [".111.", "11111", "12121", "11111", ".111.", ".....", ".111.", "12121", "11111", ".111."]


def prints():
    """Two footprints pressed into gravel, a stride apart."""
    cv = Canvas()
    for ox, oy in ((14, 30), (25, 17)):
        for j, row in enumerate(SOLE):
            for i, ch in enumerate(row):
                if ch != ".":
                    cv.put(ox + i, oy + j, ch)
        for i in (-1, 5):
            for j in (1, 3, 7):
                cv.put(ox + i, oy + j, "c")
    return cv.rows()


def sparks(phase):
    """A strut coming down, and sparks falling with it."""
    cv = Canvas()
    d = phase * 4
    for w in range(2):
        cv.line(6, 4 + d + w, 27, 18 + d + phase + w, "s")
        cv.line(27, 18 + d + phase + w, 31 + phase, 29 + d + w, "c")
    cv.outline()
    r = random.Random(f"comic-sparks-{phase}")
    for _ in range(14):
        x, y = r.randrange(4, 44), r.randrange(14, 46)
        cv.put(x, y, "i")
        for t in range(1, r.randrange(2, 4)):
            if cv.get(x, y - t) == ".":
                cv.put(x, y - t, "h" if t == 1 else "g")
    return cv.rows()


def motor(running):
    """The dish's motor housing: a gear behind a window, a gauge, and a lamp that's on while it runs."""
    cv = Canvas()
    cv.rect(8, 14, 32, 22, "c")
    cv.rect(8, 14, 32, 1, "d")
    cv.rect(8, 34, 32, 2, "b")
    cv.rect(20, 36, 8, 8, "b")
    cv.outline()
    for x, y in ((10, 16), (37, 16), (10, 33), (37, 33)):
        cv.put(x, y, "1")
    cv.disc(19, 25, 8, "0")
    cv.disc(19, 25, 6, "s")
    for k in range(8):
        a = k * math.pi / 4 + (0 if running else 0.2)
        cv.put(19 + math.cos(a) * 7, 25 + math.sin(a) * 7, "s")
    for k in range(3):
        a = k * 2 * math.pi / 3 + (0.5 if running else 0.9)
        cv.line(19, 25, 19 + math.cos(a) * 5, 25 + math.sin(a) * 5, "2")
    cv.rect(18, 24, 3, 3, "1")
    cv.disc(32, 21, 4, "1")
    cv.disc(32, 21, 3, "d")
    a = -math.pi / 4 if running else math.pi * 0.8
    cv.line(32, 21, 32 + math.cos(a) * 3, 21 + math.sin(a) * 3, "0")
    cv.rect(31, 29, 2, 2, "i" if running else "2")
    if running:
        for x, y in ((30, 29), (33, 29), (30, 30), (33, 30), (31, 28), (32, 31)):
            if cv.get(x, y) == "c":
                cv.put(x, y, "h")
    cv.line(40, 30, 47, 33, "1")
    return cv.rows()


FRAMES = [
    ("dish", dish()),
    ("dish_far", dish(far=True)),
    ("fire_0", fire(0)), ("fire_1", fire(1)),
    ("smoke_0", smoke(0)), ("smoke_1", smoke(1)),
    ("gravel", gravel()),
    ("prints", prints()),
    ("sparks_0", sparks(0)), ("sparks_1", sparks(1)),
    ("motor_0", motor(True)), ("motor_1", motor(False)),
]


def main():
    out = ["# comic: generated by tools/art/gen_comic.py. Do not hand-edit; change the generator.", f"@size {W} {H}", f"@map {MAP}"]
    for name, rows in FRAMES:
        assert len(rows) == H and all(len(r) == W for r in rows), name
        out.append(f"@frame {name}")
        out.extend(rows)
    path = REPO / "assets" / "src" / "comic.txt"
    path.write_text("\n".join(out) + "\n")
    print(f"comic: {len(FRAMES)} frames -> {path.relative_to(REPO)}")


if __name__ == "__main__":
    main()
