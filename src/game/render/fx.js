// Combat effects, shared (hub #97, docs/art/combat-fx.md): one palette, owner rims, named depths, a noise budget and
// reduced motion. Every color here is a palette entry (tools/art/palette.json; a test checks they match).

export const PAL = {
  night0: 0x0d0b1a, concrete3: 0x7f8c84, warm3: 0xb9853f, warm4: 0xe0b866, bone: 0xe8e2d0, signal: 0xd42a3c, steel: 0x7a8794,
  screen1: 0x1a8a9c, screen2: 0x3fd0d6, rot0: 0xd417c8, rot1: 0xc8e619,
  yerba1: 0x6f9448, tub1: 0x4f7fd0, soft1: 0xc05a5e,
};
export const CSS = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, `#${v.toString(16).padStart(6, '0')}`]));

/** Each roommate's signature color, worn as the rim of their effects (an AI companion is that roommate). */
export const OWNER = { manuel: PAL.yerba1, trevor: PAL.tub1, michael: PAL.soft1 };

/** One set of depths: decals on the ground, world effects with the sprites, overlays, then text. */
export const DEPTH = { decal: 2.2, ground: 5450, overlay: 5600, text: 6000 };

/** Continuity's own hardware dies in steel and bone; everything else that fights you is rot. */
const CONTINUITY = /drone|captcha|trooper|abatement|attest|interdict|_ca\b/;
export const isContinuity = (kind) => CONTINUITY.test(String(kind ?? ''));

let reduced = null;
/** prefers-reduced-motion: no screen shake or flashes (checked once, then cached). */
export function reducedMotion() {
  if (reduced === null) reduced = typeof matchMedia === 'function' && !!matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced;
}

/** The noise budget: your own effects at full strength, everyone else's quieter. */
export const budget = (mine) => (mine ? { alpha: 1, count: 1 } : { alpha: 0.7, count: 0.6 });

/** Stepped alpha (1, 0.66, 0.33) instead of a smooth fade: tween props for Phaser. */
export const steppedFade = { value: 0, ease: 'Stepped', easeParams: [3] };

/** Screen shake and flash, only for the local player and never under reduced motion. */
export function shake(scene, mine, ms, k) { if (mine && !reducedMotion()) scene.cameras?.main?.shake(ms, k); }
export function flash(scene, mine, ms, r, g, b) { if (mine && !reducedMotion()) scene.cameras?.main?.flash(ms, r, g, b); }

/** An expanding ring with an optional owner rim just inside it. */
export function ring(scene, x, y, { color, owner = null, to, width = 1, duration = 400, alpha = 0.9, depth = DEPTH.overlay }) {
  const make = (c, w, a) => scene.add.circle(Math.round(x), Math.round(y), 6, c, 0).setStrokeStyle(w, c, a).setDepth(depth);
  const parts = [make(color, width, alpha)];
  if (owner != null) parts.push(make(owner, 1, alpha));
  parts.forEach((r, i) => scene.tweens.add({ targets: r, scale: (to / 6) * (i ? 0.86 : 1), alpha: steppedFade, duration, onComplete: () => r.destroy() }));
  return parts;
}

/** Whole-pixel squares flying out from a point. */
export function sparks(scene, x, y, { n, colors, spread = 10, duration = 220, size = 1, alpha = 1, depth = DEPTH.text }) {
  for (let i = 0; i < n; i++) {
    const sp = scene.add.rectangle(Math.round(x), Math.round(y), size, size, colors[i % colors.length], alpha).setDepth(depth);
    const a = Math.random() * Math.PI * 2, d = spread * (0.5 + Math.random() * 0.5);
    scene.tweens.add({ targets: sp, x: Math.round(x + Math.cos(a) * d), y: Math.round(y + Math.sin(a) * d), alpha: steppedFade, duration, onComplete: () => sp.destroy() });
  }
}

/** Four corner brackets round a box (the Ping mark): whole pixels, `len` long. */
export function brackets(g, left, top, right, bottom, color, alpha = 1, len = 3) {
  const [l, t, r, b] = [left, top, right, bottom].map(Math.round);
  g.lineStyle(1, color, alpha);
  for (const [x, y, dx, dy] of [[l, t, 1, 1], [r, t, -1, 1], [l, b, 1, -1], [r, b, -1, -1]]) g.lineBetween(x, y, x + dx * len, y).lineBetween(x, y, x, y + dy * len);
}
