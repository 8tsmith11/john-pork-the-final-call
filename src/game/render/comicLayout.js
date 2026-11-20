// Comic pages: the page geometry, panel grids, lettering styles and painted backgrounds. Pure data and
// math (no Phaser), so the tests can check comics without a browser. The art direction behind every
// number here is docs/art/comic-pages.md; the drawing is src/game/render/comicPage.js and the scene
// mode is src/game/comic.js.

// The view is 480x270. A page keeps a margin round its live area and a strip at the bottom for the
// page number and the controls. Panel rects are in live-area pixels: (0, 0) is the top-left of the
// live area, (464, 248) its bottom-right.
export const VIEW_W = 480, VIEW_H = 270;
export const PAGE = { x: 8, y: 6, w: 464, h: 248 };
export const GUTTER = 6;
export const FOOTER_Y = 262;   // centre line of the page-number and controls strip

// Panel grids, as live-area rects [x, y, w, h]. A page names one (`layout`) and its panels take the
// cells in reading order; a panel's own `rect` replaces its cell.
const H2 = (PAGE.h - GUTTER) / 2;                 // 121: half-height row
const W2 = (PAGE.w - GUTTER) / 2;                 // 229: half-width column
export const LAYOUTS = {
  splash: [[0, 0, PAGE.w, PAGE.h]],
  two: [[0, 0, W2, PAGE.h], [W2 + GUTTER, 0, W2, PAGE.h]],
  three: [[0, 0, 150, PAGE.h], [156, 0, 150, PAGE.h], [312, 0, 152, PAGE.h]],
  stack: [[0, 0, PAGE.w, H2], [0, H2 + GUTTER, PAGE.w, H2]],
  grid4: [[0, 0, W2, H2], [W2 + GUTTER, 0, W2, H2], [0, H2 + GUTTER, W2, H2], [W2 + GUTTER, H2 + GUTTER, W2, H2]],
  strip3: [[0, 0, PAGE.w, H2], [0, H2 + GUTTER, W2, H2], [W2 + GUTTER, H2 + GUTTER, W2, H2]],
  tl: [[0, 0, 300, PAGE.h], [306, 0, 158, H2], [306, H2 + GUTTER, 158, H2]],
  six: [[0, 0, 150, H2], [156, 0, 150, H2], [312, 0, 152, H2], [0, H2 + GUTTER, 150, H2], [156, H2 + GUTTER, 150, H2], [312, H2 + GUTTER, 152, H2]],
  wide3: [[0, 0, 300, H2], [306, 0, 158, H2], [0, H2 + GUTTER, 150, H2], [156, H2 + GUTTER, 150, H2], [312, H2 + GUTTER, 152, H2]],
};

/** The rect of every panel on a page, in reading order (live-area pixels). */
export function panelRects(page) {
  const cells = LAYOUTS[page?.layout] ?? [];
  return (page?.panels ?? []).map((p, i) => p.rect ?? cells[i] ?? null);
}

// The palette entries the comic renderer paints with (all from tools/art/palette.json; a test checks).
export const PAL = {
  night0: '#0d0b1a', night1: '#17142b', night2: '#231f3f', night3: '#332e57',
  concrete0: '#2b3331', concrete1: '#3f4a46', concrete2: '#5b6862', concrete3: '#7f8c84',
  warm0: '#3a2418', warm1: '#5c3a22', warm2: '#8a5a2e', warm3: '#b9853f', warm4: '#e0b866',
  screen0: '#0f4a5c', screen1: '#1a8a9c', screen2: '#3fd0d6',
  bone: '#e8e2d0', signal: '#d42a3c', steel: '#7a8794',
};
export const num = (name) => parseInt((PAL[name] ?? PAL.night0).slice(1), 16);

// Paper: the page ground behind the gutters. 'bone' is the printed look; 'night' is for pages that
// should feel like a recording or a memory in the dark. `ink` is the panel frame; `key` an outer
// keyline (so a dark frame still reads on dark paper); `folio` the footer text.
export const PAPER = {
  bone: { ground: 'bone', ink: 'night0', key: null, folio: 'night2', back: 'concrete3' },
  night: { ground: 'night0', ink: 'night0', key: 'concrete2', folio: 'concrete3', back: 'night2' },
};

// Lettering. Balloons and captions are VT323 capitals; sound effects are Pixelify Sans.
// fill/line/text are palette names. `cut` trims the corners by a pixel (speech), `dash` dashes the line.
export const LETTERING = {
  speech: { fill: 'bone', line: 'night0', text: 'night0', cut: true, tail: true },
  whisper: { fill: 'bone', line: 'concrete2', text: 'night2', cut: true, tail: true, dash: true },
  log: { fill: 'screen0', line: 'screen1', text: 'screen2', cut: false, tail: false },
  narration: { fill: 'warm4', line: 'night0', text: 'night0', cut: false, tail: false },
  stamp: { fill: 'night0', line: 'steel', text: 'bone', cut: false, tail: false },
};
export const TEXT_KINDS = new Set(['caption', 'balloon', 'sfx', 'stamp']);
export const CAPTION_STYLES = new Set(['narration', 'log']);
export const BALLOON_STYLES = new Set(['speech', 'whisper', 'log']);
export const LETTER = { size: 8, pad: [4, 3], wrap: 104, captionInset: 4 };

/** Every key a reader uses on a comic page, mapped to what it does. */
export function actionForKey(key) {
  if (key === 'e' || key === 'E' || key === ' ' || key === 'Enter' || key === 'ArrowRight' || key === 'd' || key === 'D') return 'next';
  if (key === 'ArrowLeft' || key === 'Backspace' || key === 'a' || key === 'A') return 'back';
  if (key === 'Escape') return 'skip';
  return null;
}

/** The controls line under a page, in the reader's language. Only the host turns the page, so a guest
 *  is told the host turns, and that Esc closes it on their own screen. */
export function footerHint(lang, { index, total, host, skippable }) {
  const es = lang === 'es', last = index >= total - 1;
  if (!host) return [es ? 'El anfitrión pasa la página' : 'The host turns the page', `Esc: ${es ? 'cerrar' : 'close'}`].join('  ·  ');
  const parts = [`${es ? 'E / Espacio / clic' : 'E / Space / click'}: ${es ? (last ? 'terminar' : 'siguiente') : (last ? 'done' : 'next')}`];
  if (index > 0) parts.push(`←: ${es ? 'atrás' : 'back'}`);
  if (skippable) parts.push(`Esc: ${es ? 'saltar' : 'skip'}`);
  return parts.join('  ·  ');
}

/** The text a reader sees, in their language, lettered in capitals for balloons and captions. */
export function letterText(item, lang) {
  const raw = (lang === 'es' ? item.es : item.en) || item.en || '';
  return item.kind === 'sfx' ? raw : raw.toLocaleUpperCase(lang === 'es' ? 'es' : 'en');
}

// The atlases a panel can draw from: the comic sheet (tools/art/gen_comic.py) and the game's own
// sheets, so pages can reuse props, people and tiles.
export const ART_KEYS = new Set(['comic', 'props', 'wide', 'big', 'doors', 'principals', 'enemies', 'warden', 'decals', 'icons', 'tiles', 'romance', 'trevor', 'michael', 'manuel']);

// ---- painted backgrounds ----
// A panel's `bg` is one of these, painted once per panel size into a canvas (comicPage.js). Each is
// bands of palette colours blended with an ordered dither, top to bottom, plus a few stars at night.
export const BACKGROUNDS = {
  night: { bands: [['night0', 0], ['night1', 0.45], ['night2', 1]], stars: 'night3' },
  ember: { bands: [['night0', 0], ['night1', 0.5], ['warm0', 1]], stars: 'night3' },
  smoke: { bands: [['night1', 0], ['concrete0', 0.55], ['night2', 1]] },
  ground: { bands: [['night1', 0], ['concrete0', 1]] },
  dusk: { bands: [['night2', 0], ['night3', 0.6], ['concrete1', 1]] },
  black: { bands: [['night0', 0], ['night0', 1]] },
  screen: { bands: [['night0', 0], ['screen0', 1]] },
  paper: { bands: [['bone', 0], ['bone', 1]] },
};
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const rgb = (name) => { const v = num(name); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };

/** RGBA pixels (Uint8ClampedArray, w*h*4) for a painted background. Deterministic per seed. */
export function bgPixels(preset, w, h, seed = 1) {
  const def = BACKGROUNDS[preset] ?? BACKGROUNDS.night;
  const out = new Uint8ClampedArray(w * h * 4);
  const bands = def.bands;
  for (let y = 0; y < h; y++) {
    const t = h > 1 ? y / (h - 1) : 0;
    let i = 0;
    while (i < bands.length - 2 && t > bands[i + 1][1]) i++;
    const [a, ta] = bands[i], [b, tb] = bands[i + 1];
    const k = tb > ta ? Math.min(1, Math.max(0, (t - ta) / (tb - ta))) : 1;
    const ca = rgb(a), cb = rgb(b);
    for (let x = 0; x < w; x++) {
      const c = k * 16 > BAYER[(y & 3) * 4 + (x & 3)] ? cb : ca;
      const o = (y * w + x) * 4;
      out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255;
    }
  }
  if (def.stars) {
    const c = rgb(def.stars);
    let s = (seed >>> 0) || 1;
    const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    const n = Math.round((w * h) / 900);
    for (let i = 0; i < n; i++) {
      const x = Math.floor(rnd() * w), y = Math.floor(rnd() * h * 0.55), o = (y * w + x) * 4;
      out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2];
    }
  }
  return out;
}

/** Visible part of an image placed at (x, y) with an integer scale inside a w x h panel: a crop in
 *  frame pixels, or null when none of it shows. (Phaser crops in display space, flipped or not.) */
export function cropFor(x, y, fw, fh, scale, w, h) {
  const x0 = Math.max(0, Math.ceil(-x / scale)), y0 = Math.max(0, Math.ceil(-y / scale));
  const x1 = Math.min(fw, Math.floor((w - x) / scale)), y1 = Math.min(fh, Math.floor((h - y) / scale));
  if (x1 <= x0 || y1 <= y0) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, full: x0 === 0 && y0 === 0 && x1 === fw && y1 === fh };
}

/** Where a balloon's tail meets the balloon and where it points, for a box at (x, y, w, h) and a tail
 *  target (tx, ty) clamped to the panel (an off-panel speaker's tail stops at the frame line). */
export function tailFor(box, target, pw, ph) {
  const tx = Math.max(0, Math.min(pw, target[0])), ty = Math.max(0, Math.min(ph, target[1]));
  const { x, y, w, h } = box;
  let side;
  if (ty >= y + h) side = 'bottom'; else if (ty <= y) side = 'top'; else side = tx < x + w / 2 ? 'left' : 'right';
  const along = side === 'bottom' || side === 'top';
  const base = along ? Math.max(x + 6, Math.min(x + w - 6, tx)) : Math.max(y + 5, Math.min(y + h - 5, ty));
  const edge = side === 'bottom' ? y + h - 1 : side === 'top' ? y : side === 'left' ? x : x + w - 1;
  return { side, base, edge, tip: [tx, ty] };
}

/** Keep a w x h box inside a panel, `inset` pixels from its frame. */
export function clampBox(x, y, w, h, pw, ph, inset = 3) {
  return {
    x: Math.round(Math.max(inset, Math.min(pw - w - inset, x))),
    y: Math.round(Math.max(inset, Math.min(ph - h - inset, y))),
  };
}
