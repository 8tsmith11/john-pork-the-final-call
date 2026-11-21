// Painted cinematic shots: procedural pixel-art layers drawn every frame into a Graphics, for cutscenes that need
// more than backdrops and sprites (space, weather, effects). A shot spec is data:
//   { layers: [{ p: 'stars' | 'planet' | 'figure' | 'flames' | 'streaks' | 'clouds' | 'city' | 'craft' | 'flash' |
//                   'shock' | 'tint', ...params }], dur, shake }
// Any numeric param can be [from, to] (eased over the shot) or [from, to, 'lin'] (linear). Everything is drawn
// in view pixels (480x270; the letterboxed picture is y 30..240), seeded so it looks the same on every screen.
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export function at(v, t) {
  if (!Array.isArray(v)) return v;
  const k = v[2] === 'lin' ? t : ease(t);
  return typeof v[0] === 'number' ? lerp(v[0], v[1], k) : v[0];
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const px = (n) => Math.round(n);

const PAINT = {
  // A star field that drifts; a few stars twinkle.
  stars(g, L, t, now) {
    const r = rng(L.seed ?? 7), drift = at(L.drift ?? 0, t), n = L.n ?? 140;
    for (let i = 0; i < n; i++) {
      const x = ((r() * 520 - drift * (0.3 + r() * 0.7)) % 520 + 520) % 520 - 20, y = 30 + r() * 210, b = r();
      const tw = b > 0.92 ? 0.5 + 0.5 * Math.sin(now / 300 + i) : 1;
      g.fillStyle(b > 0.97 ? 0xbfd8ff : 0xf2efe6, (0.25 + b * 0.75) * tw).fillRect(px(x), px(y), b > 0.95 ? 2 : 1, b > 0.95 ? 2 : 1);
    }
  },
  // A planet: ocean, continents, cloud bands, a night side with city lights, and an atmosphere rim.
  planet(g, L, t) {
    const cx = at(L.x, t), cy = at(L.y, t), R = at(L.r, t), rot = at(L.rot ?? 0, t), night = at(L.night ?? 0.4, t);
    g.fillStyle(0x0d2a52, 1).fillCircle(cx, cy, R);
    for (let k = 1; k <= 5; k++) g.fillStyle(0x16407a, 0.18).fillCircle(cx - R * 0.12, cy - R * 0.12, R * (1 - k * 0.12));
    const r = rng(L.seed ?? 3);
    for (let i = 0; i < 26; i++) {   // continents: clusters of blobs that move with the rotation
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.92, wob = (r() - 0.5) * 0.6;
      const x = cx + Math.cos(a + rot) * d, y = cy + Math.sin(a) * d * 0.98;
      if (Math.hypot(x - cx, y - cy) > R - 3) continue;
      const s = (0.05 + r() * 0.1) * R;
      g.fillStyle(r() > 0.35 ? 0x3e6b3a : 0x7a6a44, 0.95).fillEllipse(x, y, s * (1.6 + wob), s);
      g.fillStyle(0x56844a, 0.6).fillEllipse(x + s * 0.2, y - s * 0.15, s * 0.8, s * 0.45);
    }
    for (let i = 0; i < 14; i++) {   // cloud swirls, a little faster than the ground
      const a = r() * Math.PI * 2, d = r() * R * 0.9, x = cx + Math.cos(a + rot * 1.3) * d, y = cy + Math.sin(a) * d;
      if (Math.hypot(x - cx, y - cy) > R - 4) continue;
      g.fillStyle(0xf2f4f8, 0.55).fillEllipse(x, y, R * (0.12 + r() * 0.2), R * 0.025 + 1);
    }
    if (night > 0) {   // the night side, with cities
      g.fillStyle(0x020611, 0.75 * night).fillEllipse(cx + R * 0.55, cy, R * 1.5, R * 2.02);
      const c = rng((L.seed ?? 3) + 11);
      for (let i = 0; i < 160; i++) {
        const a = c() * Math.PI * 2, d = Math.sqrt(c()) * R * 0.95, x = cx + Math.cos(a + rot) * d, y = cy + Math.sin(a) * d;
        if (x < cx + R * 0.05 || Math.hypot(x - cx, y - cy) > R - 2) continue;
        g.fillStyle(0xffd27f, (0.4 + c() * 0.6) * night).fillRect(px(x), px(y), 1, 1);
      }
    }
    g.lineStyle(2, 0x6fc6ff, 0.55).strokeCircle(cx, cy, R + 1);   // the atmosphere
    g.lineStyle(4, 0x6fc6ff, 0.12).strokeCircle(cx, cy, R + 4);
    if (L.sunrise) g.fillStyle(0xffc070, 0.25).fillEllipse(cx - R * 0.7, cy - R * 0.72, R * 0.5, R * 0.08);
  },
  // A carved standing figure seen from the side (wood, grain, a held staff, eyes that can glow), tilt to any angle.
  figure(g, L, t, now) {
    const x = at(L.x, t), y = at(L.y, t), s = at(L.s ?? 3, t), tilt = at(L.tilt ?? 0, t), eyes = at(L.eyes ?? 0, t);
    const rot = (dx, dy) => [x + dx * Math.cos(tilt) - dy * Math.sin(tilt), y + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
    const box = (dx, dy, w, h, c, a = 1) => {   // a rotated box as a polygon, so the figure can tip over
      const pts = [rot(dx, dy), rot(dx + w, dy), rot(dx + w, dy + h), rot(dx, dy + h)].map(([px2, py2]) => ({ x: px2, y: py2 }));
      g.fillStyle(c, a).fillPoints(pts, true);
    };
    const u = s, rim = L.rim ?? 0xffb070;
    box(-3 * u, -2 * u, 2 * u, 8 * u, 0x4a2e18); box(1 * u, -2 * u, 2 * u, 8 * u, 0x4a2e18);   // legs
    box(-3.5 * u, 5 * u, 3 * u, 1.2 * u, 0x3a2414); box(0.5 * u, 5 * u, 3 * u, 1.2 * u, 0x3a2414);   // feet
    box(-4.5 * u, -14 * u, 9 * u, 13 * u, 0x8a5a32);                       // body
    box(1.5 * u, -14 * u, 3 * u, 13 * u, 0x5e3c20, 0.75);                 // its shadowed side
    for (let i = 0; i < 4; i++) box(-4.5 * u, (-13 + i * 3) * u, 9 * u, 0.45 * u, 0x6e4626, 0.8);   // grain
    box(-4.5 * u, -14 * u, 0.7 * u, 13 * u, rim, 0.55);                   // rim light from the sun
    box(-5.5 * u, -25 * u, 11 * u, 11 * u, 0x9a6a3c);                     // head, carved
    box(2 * u, -25 * u, 3.5 * u, 11 * u, 0x6a4424, 0.7);
    box(-5.5 * u, -25 * u, 0.7 * u, 11 * u, rim, 0.6);
    box(-5.5 * u, -25 * u, 11 * u, 1.4 * u, 0x5a3a20);                    // the carved top
    box(-4.8 * u, -22.4 * u, 9.6 * u, 1.1 * u, 0x5a3a20);                 // brow
    box(-0.8 * u, -20.6 * u, 1.6 * u, 3 * u, 0x7a4e2a);                   // nose
    box(-2.5 * u, -16.8 * u, 5 * u, 0.9 * u, 0x2a180c);                   // mouth
    box(5.2 * u, -27 * u, 2 * u, 31 * u, 0x3e2614);                       // the bat, held upright
    box(4.7 * u, -30 * u, 3 * u, 8 * u, 0x4a2e18);                        // its heavy end
    box(4.7 * u, -30 * u, 0.6 * u, 8 * u, rim, 0.5);
    box(3.6 * u, -10 * u, 2.6 * u, 2.2 * u, 0x6e4626);                    // hand
    const glow = eyes * (0.85 + 0.15 * Math.sin(now / 90));
    if (eyes > 0.02) {
      for (const ex of [-3.4, 1.0]) {
        for (const [grow, c, al] of [[3.2, 0xff3a1a, 0.08], [2, 0xff6a2a, 0.16], [1, 0xff8a3a, 0.3]]) box((ex - grow * 0.6) * u, (-21.2 - grow * 0.6) * u, (2.4 + grow * 1.2) * u, (1.6 + grow * 1.2) * u * eyes, c, al * glow);
        box(ex * u, -21.2 * u, 2.4 * u, 1.6 * u * eyes, 0xffe0a0, glow);
      }
    } else for (const ex of [-3.2, 1.2]) box(ex * u, -20.4 * u, 2 * u, 0.4 * u, 0x3a2414);
  },
  // A moving fireball: a hot front at (x, y) and a trail of fire and sparks behind it along `ang`.
  flames(g, L, t, now) {
    const x = at(L.x, t), y = at(L.y, t), s = at(L.s ?? 3, t), k = at(L.k ?? 1, t), ang = at(L.ang ?? -Math.PI / 2, t);
    const r = rng(Math.floor(now / 40)), ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 6; i >= 0; i--) {   // the trail: glowing ellipses stretched back along the path
      const d = i * 12 * s * k, w = (10 + i * 5) * s * k, cx = x + ca * d, cy = y + sa * d;
      g.fillStyle(i < 2 ? 0xfff2c0 : i < 4 ? 0xffb347 : 0xe0542a, (0.5 - i * 0.06) * Math.min(1, k)).fillEllipse(cx, cy, Math.abs(sa) > 0.7 ? w : w * 2.2, Math.abs(sa) > 0.7 ? w * 2.2 : w);
    }
    for (let i = 0; i < 110 * k; i++) {   // sparks and embers torn off it
      const d = r() * 90 * s * k, spread = (r() - 0.5) * (8 + d * 0.35) * s * 0.35;
      const fx = x + ca * d - sa * spread, fy = y + sa * d + ca * spread;
      const c = d < 18 * s ? 0xfff6d0 : d < 45 * s ? 0xffb347 : 0xd8402a;
      g.fillStyle(c, Math.max(0, 1 - d / (90 * s * k))).fillRect(px(fx), px(fy), Math.max(1, s * (d < 20 * s ? 1.2 : 0.7)), Math.max(1, s * (d < 20 * s ? 1.2 : 0.7)));
    }
    g.fillStyle(0xffffff, 0.55 * Math.min(1, k)).fillCircle(x, y, 6 * s * k);   // the shock front, white hot
    g.fillStyle(0xffd27f, 0.28 * k).fillCircle(x, y, 13 * s * k);
    g.fillStyle(0xff8a3a, 0.12 * k).fillCircle(x, y, 22 * s * k);
  },
  // A high-altitude sky: a vertical gradient into a hazy horizon at `horizon`, far clouds below it.
  atmo(g, L, t) {
    const hy = at(L.horizon ?? 200, t), bands = [[0x000000, 0], [0x050b1c, 0.25], [0x0c1c40, 0.5], [0x1f3f7a, 0.7], [0x4f7fc0, 0.85], [0xbfe0ff, 1]];
    const mix = (c1, c2, k) => ((Math.round(((c1 >> 16) & 255) + (((c2 >> 16) & 255) - ((c1 >> 16) & 255)) * k) << 16) |
      (Math.round(((c1 >> 8) & 255) + (((c2 >> 8) & 255) - ((c1 >> 8) & 255)) * k) << 8) | Math.round((c1 & 255) + ((c2 & 255) - (c1 & 255)) * k));
    for (let y = 30; y < hy; y += 3) {   // a smooth gradient, in 3 px steps so it still reads as pixels
      const f = (y - 30) / Math.max(1, hy - 30);
      let i = 0; while (i < bands.length - 2 && f > bands[i + 1][1]) i++;
      const k = (f - bands[i][1]) / (bands[i + 1][1] - bands[i][1]);
      g.fillStyle(mix(bands[i][0], bands[i + 1][0], Math.max(0, Math.min(1, k))), 1).fillRect(0, y, 480, 3);
    }
    g.fillStyle(0x6a8ab8, 1).fillRect(0, hy, 480, 240 - hy);
    const r = rng(L.seed ?? 4);
    for (let i = 0; i < 30; i++) { const x = r() * 520 - 20, y = hy + 4 + r() * (240 - hy); g.fillStyle(0xe8eef6, 0.5 + r() * 0.4).fillEllipse(x, y, 20 + r() * 60, 2 + r() * 4); }
    g.fillStyle(0xffffff, 0.35).fillRect(0, hy - 2, 480, 3);
  },
  // Speed lines rushing past.
  streaks(g, L, t, now) {
    const r = rng(Math.floor(now / 40)), n = at(L.n ?? 30, t), dir = L.dir ?? 'up';
    for (let i = 0; i < n; i++) {
      const x = r() * 480, y = 30 + r() * 210, len = 10 + r() * 40;
      g.lineStyle(1, 0xf2efe6, 0.25 + r() * 0.35);
      if (dir === 'up') g.lineBetween(x, y, x, y - len); else g.lineBetween(x, y, x + len, y);
    }
  },
  // Cloud banks scrolling past.
  clouds(g, L, t) {
    const r = rng(L.seed ?? 5), off = at(L.off ?? 0, t), a = at(L.a ?? 0.85, t);
    for (let i = 0; i < 22; i++) {
      const x = r() * 520 - 20, y0 = r() * 400, w = 60 + r() * 140, h = 14 + r() * 20;
      const y = ((y0 - off) % 400 + 400) % 400 - 80;
      g.fillStyle(0x9aa6b8, a * 0.6).fillEllipse(x, y + 4, w, h);
      g.fillStyle(0xd8dee8, a).fillEllipse(x, y, w * 0.9, h * 0.8);
    }
  },
  // A city at night from above: streets, blocks, and thousands of lights.
  city(g, L, t, now) {
    const z = at(L.zoom ?? 1, t), cx = 240, cy = 135, r = rng(L.seed ?? 9);
    g.fillStyle(0x07090f, 1).fillRect(0, 30, 480, 210);
    for (let i = -30; i <= 30; i++) {
      const sx = cx + i * 22 * z, sy = cy + i * 18 * z;
      g.lineStyle(Math.max(1, z * 1.2), 0xffb347, 0.35).lineBetween(sx, 30, sx + 40 * z, 240);
      g.lineStyle(Math.max(1, z), 0xffd27f, 0.25).lineBetween(0, sy, 480, sy - 30 * z);
    }
    for (let i = 0; i < 900; i++) {
      const x = cx + (r() - 0.5) * 900 * z, y = cy + (r() - 0.5) * 700 * z;
      if (y < 30 || y > 240 || x < 0 || x > 480) continue;
      const c = r() > 0.85 ? 0x6ff2ff : r() > 0.3 ? 0xffd27f : 0xf2efe6;
      g.fillStyle(c, 0.5 + 0.5 * Math.sin(now / 500 + i)).fillRect(px(x), px(y), Math.max(1, z * 0.8), Math.max(1, z * 0.8));
    }
  },
  // An aircraft from the side: a slim body, a rotor or wing, and blinking navigation lights.
  craft(g, L, t, now) {
    const x = at(L.x, t), y = at(L.y, t), s = at(L.s ?? 2, t);
    g.fillStyle(0x1a1d2b, 1).fillEllipse(x, y, 26 * s, 8 * s);
    g.fillStyle(0x2a2f4a, 1).fillRect(x - 18 * s, y - 1 * s, 10 * s, 2 * s);
    g.fillStyle(0x6ff2ff, 0.7).fillEllipse(x + 6 * s, y - 1 * s, 7 * s, 3 * s);   // the canopy glow: someone's flying it
    g.lineStyle(Math.max(1, s * 0.6), 0x8a93a8, 0.8).lineBetween(x - 14 * s, y - 6 * s, x + 14 * s, y - 6 * s);
    const blink = Math.floor(now / 400) % 2;
    g.fillStyle(0xff3b3b, blink ? 1 : 0.2).fillRect(px(x - 13 * s), px(y), 2, 2);
    g.fillStyle(0x7fff9a, blink ? 0.2 : 1).fillRect(px(x + 12 * s), px(y), 2, 2);
  },
  flash(g, L, t) { const a = at(L.a, t); if (a > 0) g.fillStyle(L.c ?? 0xffffff, a).fillRect(0, 0, 480, 270); },
  shock(g, L, t) { const r = at(L.r, t), a = at(L.a ?? 1, t); g.lineStyle(at(L.w ?? 4, t), 0xfff2c0, a).strokeCircle(at(L.x, t), at(L.y, t), r); },
  tint(g, L, t) { const a = at(L.a, t); if (a > 0) g.fillStyle(L.c ?? 0x000000, a).fillRect(0, 0, 480, 270); },
};

/** The painter for one shot spec: (g, t 0..1, now ms) -> draws every layer in order. */
export function painter(spec) {
  return (g, t, now) => { g.clear(); for (const L of spec.layers ?? []) PAINT[L.p]?.(g, L, t, now); };
}
export const PAINTERS = Object.keys(PAINT);
