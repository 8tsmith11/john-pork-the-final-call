// Worn gear drawn on the characters (Michael: "graphics for the parkas, like models on top of the
// characters"). Each look is an overlay atlas built once per roommate from that roommate's own sheet:
// every frame (walk, idle, swing, dodge, long idles) gets a matching overlay frame of the same name,
// so the overlay just copies the body sprite's current frame and never drifts out of step.
//
// A look recolors the roommate's shirt (T/t in tools/art/gen_roommates.py), turns the arms into
// sleeves (the lowest skin pixel of each arm column stays bare: the hand), drops a hem over the top
// of the trousers, and puts the hood up over the hair. Palette colors only (tools/art/palette.json).
//
// To add a model for another worn item: add an entry to LOOKS keyed by item id. `slot` says which
// equipment slot it is read from. Styles other than 'parka' need their own painter below.

import { growthLook, lookStage } from '../../content/growth.js';

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const P = {
  night0: '#0d0b1a', night1: '#17142b', night2: '#231f3f', night3: '#332e57',
  warm1: '#5c3a22', warm0: '#3a2418', warm2: '#8a5a2e', warm3: '#b9853f', warm4: '#e0b866',
  skin1: '#a3674a', skin2: '#d09a72', skin3: '#f0c9a0',
  yerba0: '#3e5a34', yerba1: '#6f9448', tub0: '#2c4a8a', tub1: '#4f7fd0', soft0: '#7a2f38', soft1: '#c05a5e',
  parka: '#b46a26', slicker0: '#e0a51c', slicker1: '#ffd93b', bone: '#e8e2d0', steel: '#7a8794',
  screen1: '#1a8a9c', screen2: '#3fd0d6', concrete2: '#5b6862', concrete3: '#7f8c84', pork1: '#e87a9c', signal: '#d42a3c',
};

// The colors each roommate's sheet is painted with (CHARS in tools/art/gen_roommates.py).
const BODY = {
  michael: { shirt: [P.soft1, P.soft0], skin: [P.skin3, P.skin2], hair: [P.night2, P.night1], pants: [P.night3], boots: [P.warm0] },
  trevor:  { shirt: [P.tub1, P.tub0],   skin: [P.skin3, P.skin2], hair: [P.warm2, P.warm1],   pants: [P.night3], boots: [P.warm0] },
  manuel:  { shirt: [P.yerba1, P.yerba0], skin: [P.skin2, P.skin1], hair: [P.warm1, P.warm0], pants: [P.night3], boots: [P.warm0] },
};

export const LOOKS = {
  'item.rain_parka':  { slot: 'parka', style: 'parka', main: P.slicker1, shade: P.slicker0, line: P.night0 },   // bright slicker yellow (Michael)
  'item.brown_parka': { slot: 'parka', style: 'parka', main: P.parka, shade: P.warm2, line: P.night0 },   // Michael's brown one
  // Not gear: Manuel's butt, now and then noticeably bigger (Manuel's own request; src/game/bigButt.js).
  'fx.bigbutt':          { slot: '_fx', style: 'butt' },
  // Not gear: Michael's trousers fall down to his ankles now and then (src/game/beltless.js). Boxers on, nothing shown.
  'fx.pantsdown':        { slot: '_fx', style: 'pantsdown', main: P.bone, heart: P.signal },   // white boxers with little red hearts (Michael)
  // Uniques (task #29, gonman). Manuel's:
  'item.arg_shirt':      { slot: 'chestplate', style: 'shirt', main: P.screen2, shade: P.screen1, stripe: P.bone, sun: P.warm4 },   // celeste y blanca, the sun on the chest
  'item.hasbulla_tee':   { slot: 'parka', style: 'shirt', main: P.bone, shade: P.concrete3, oversized: true, print: 'fighter' },     // white, oversized; a small fighter with a belt (no real person)
  'item.smart_pacifier': { slot: 'goggles', style: 'pacifier', main: P.pork1, shade: P.bone },
  'item.mate_holster':   { slot: 'backpack', style: 'holster', main: P.warm2, shade: P.warm1, metal: P.steel },
  // Michael's:
  'item.winged_boots':   { slot: 'boots', style: 'boots', main: P.bone, shade: P.concrete3, wing: P.bone },
  'item.cowboy_hat':     { slot: 'goggles', style: 'hat', main: P.warm2, shade: P.warm1, band: P.warm0 },
  'item.smoky_socks':    { slot: 'socks', style: 'socks', main: P.bone, shade: P.signal },
  'item.signal_gloves':  { slot: 'gloves', style: 'gloves', main: P.screen1, shade: P.screen2 },
};
// Growth (src/content/growth.js): one look per level, painted under any gear.
for (let lv = 2; lv <= 8; lv++) LOOKS[`fx.grow${lv}`] = { slot: '_grow', style: 'grow', level: lv };
const LOOK_SLOTS = [...new Set(Object.values(LOOKS).map((l) => l.slot))].filter((s) => s !== '_grow');

/** The looks a roommate is wearing right now, in draw order. */
export function looksFor(c) {
  const grow = growthLook(c?.level ?? 1);
  return [...(grow ? [grow] : []), ...LOOK_SLOTS.map((sl) => c?.equipped?.[sl]).filter((id) => id && LOOKS[id])];
}

const same = (d, i, rgb) => d[i + 3] > 0 && d[i] === rgb[0] && d[i + 1] === rgb[1] && d[i + 2] === rgb[2];

// Paint one frame's overlay. src: RGBA of the body frame (w x h); out: RGBA to fill. facing: down/up/right.
function paintParka(src, out, w, h, facing, body, look) {
  const is = (x, y, list) => x >= 0 && y >= 0 && x < w && y < h && list.some((c) => same(src, (y * w + x) * 4, c));
  const put = (x, y, rgb) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; out[i] = rgb[0]; out[i + 1] = rgb[1]; out[i + 2] = rgb[2]; out[i + 3] = 255; };
  const empty = (x, y) => x < 0 || y < 0 || x >= w || y >= h || src[(y * w + x) * 4 + 3] === 0;
  const main = hex(look.main), shade = hex(look.shade), line = hex(look.line);
  const shirt = body.shirt.map(hex), skin = body.skin.map(hex), hair = body.hair.map(hex), pants = body.pants.map(hex);
  // the shirt's rows
  let top = h, bot = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (is(x, y, shirt)) { top = Math.min(top, y); bot = Math.max(bot, y); }
  if (bot < 0) return false;
  // body of the coat
  for (let y = top; y <= bot; y++) for (let x = 0; x < w; x++) {
    if (is(x, y, [shirt[0]])) put(x, y, main);
    else if (is(x, y, [shirt[1]])) put(x, y, shade);
  }
  // sleeves: skin below the neck, except the lowest skin pixel in each column (the hand)
  for (let x = 0; x < w; x++) {
    const ys = [];
    for (let y = top; y <= Math.min(h - 1, bot + 2); y++) if (is(x, y, skin)) ys.push(y);
    ys.slice(0, -1).forEach((y) => put(x, y, ys.length > 2 && y === ys[ys.length - 2] ? shade : main));
  }
  // hem: the coat hangs two rows past the waist, over the trousers
  for (let y = bot + 1; y <= Math.min(h - 1, bot + 2); y++) for (let x = 0; x < w; x++) if (is(x, y, pants)) put(x, y, y === bot + 2 ? shade : main);
  let x0 = w, x1 = -1;
  for (let x = 0; x < w; x++) if (!empty(x, top)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  // the zip, down the front
  if (facing === 'down') { const zx = Math.floor((x0 + x1) / 2); for (let y = top + 1; y <= Math.min(h - 1, bot + 2); y++) if (out[(y * w + zx) * 4 + 3]) put(zx, y, shade); }
  // hood, up (Michael: "hood of parka should be on"): it covers the hair in every facing. From the
  // front and side a darker rim frames the face; from behind it covers the whole back of the head.
  const headTop = Math.max(0, top - 12);
  const nearSkin = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => is(x + dx, y + dy, skin));
  for (let y = headTop; y < top; y++) for (let x = 0; x < w; x++) {
    if (is(x, y, hair)) put(x, y, facing !== 'up' && nearSkin(x, y) ? shade : main);
    // from behind, the hood covers the back of the head and neck: one parka-colored strip running
    // down into the coat between the neck's outlines (Michael)
    else if (facing === 'up' && is(x, y, skin)) put(x, y, main);
  }
  // from the side, the same strip down the back of the neck, from the hood into the collar
  if (facing === 'right') for (let y = Math.max(0, top - 2); y < top; y++) {
    let first = -1, sk = -1;
    for (let x = 0; x < w; x++) { if (first < 0 && !empty(x, y)) first = x; if (sk < 0 && is(x, y, skin)) sk = x; }
    if (first >= 0 && sk > first + 1) for (let x = first + 1; x < sk; x++) put(x, y, main);
  }
  // smooth the dome: spiky hair (Manuel's curls) leaves gaps and inner outlines along the top of the
  // head. Above the face, close the gaps with outline and paint inner outline pixels as hood.
  const ol = [line];
  let faceTop = top;
  for (let y = headTop; y < top && faceTop === top; y++) for (let x = 0; x < w; x++) if (is(x, y, skin)) { faceTop = y; break; }
  for (let y = headTop; y < faceTop; y++) {
    let a = w, b = -1;
    for (let x = 0; x < w; x++) if (!empty(x, y)) { a = Math.min(a, x); b = Math.max(b, x); }
    for (let x = a + 1; x < b; x++) {
      if (empty(x, y)) put(x, y, line);
      else if (is(x, y, ol) && (is(x, y + 1, hair) || is(x - 1, y, hair) && is(x + 1, y, hair))) put(x, y, main);
    }
  }
  return true;
}

// Shared pixel helpers for the painters below.
function kit(src, out, w, h, body) {
  const is = (x, y, list) => x >= 0 && y >= 0 && x < w && y < h && list.some((c) => same(src, (y * w + x) * 4, c));
  const put = (x, y, rgb) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; out[i] = rgb[0]; out[i + 1] = rgb[1]; out[i + 2] = rgb[2]; out[i + 3] = 255; };
  const empty = (x, y) => x < 0 || y < 0 || x >= w || y >= h || src[(y * w + x) * 4 + 3] === 0;
  const C = { shirt: body.shirt.map(hex), skin: body.skin.map(hex), hair: body.hair.map(hex), pants: body.pants.map(hex), boots: body.boots.map(hex) };
  const rows = (list) => { let a = h, b = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (is(x, y, list)) { a = Math.min(a, y); b = Math.max(b, y); } return [a, b]; };
  const span = (y) => { let a = w, b = -1; for (let x = 0; x < w; x++) if (!empty(x, y)) { a = Math.min(a, x); b = Math.max(b, x); } return [a, b]; };
  return { is, put, empty, C, rows, span };
}

// A shirt: recolor the top. Optional vertical stripes and a sun badge (Argentina), short sleeves and a
// longer hem for an oversized fit, and a tiny print on the front.
function paintShirt(src, out, w, h, facing, body, look) {
  const { is, put, C, rows } = kit(src, out, w, h, body);
  const [top, bot] = rows(C.shirt); if (bot < 0) return false;
  const main = hex(look.main), shade = hex(look.shade), stripe = look.stripe && hex(look.stripe);
  for (let y = top; y <= bot; y++) for (let x = 0; x < w; x++) {
    if (!is(x, y, C.shirt)) continue;
    const dark = is(x, y, [C.shirt[1]]);
    put(x, y, stripe && x % 3 === 1 && !dark ? stripe : dark ? shade : main);
  }
  if (look.oversized) {                                    // short sleeves over the upper arm, a longer hem
    for (let x = 0; x < w; x++) for (let y = top; y <= Math.min(top + 2, h - 1); y++) if (is(x, y, C.skin)) put(x, y, main);
    for (let x = 0; x < w; x++) if (is(x, bot + 1, C.pants)) put(x, bot + 1, shade);
  }
  if (facing === 'down') {
    let a = w, b = -1; for (let x = 0; x < w; x++) if (is(x, top + 2, C.shirt)) { a = Math.min(a, x); b = Math.max(b, x); }
    const cx = Math.floor((a + b) / 2);
    if (look.sun) put(cx, top + 2, hex(look.sun));
    if (look.print === 'fighter') {                      // a two-pixel figure with a gold belt, nothing more
      const ink = hex(P.night1), gold = hex(P.warm4);
      put(cx, top + 1, ink); put(cx, top + 2, ink); put(cx - 1, top + 2, ink); put(cx + 1, top + 2, ink);
      put(cx - 1, top + 3, gold); put(cx, top + 3, gold); put(cx + 1, top + 3, gold);
    }
  }
  return true;
}

// A hat: a brim one pixel wider than the head on each side, a crown over the top of the hair, a band.
function paintHat(src, out, w, h, facing, body, look) {
  const { is, put, C, rows, span } = kit(src, out, w, h, body);
  const [ht, hb] = rows(C.hair); if (hb < 0) return false;
  const main = hex(look.main), shade = hex(look.shade), band = hex(look.band), line = hex(P.night0);
  const [a, b] = span(ht + 1), brim = ht + 2;
  for (let x = a - 1; x <= b + 1; x++) { put(x, brim, shade); put(x, brim + 1 > hb + 2 ? brim : brim, shade); }
  for (let y = ht - 2; y < brim; y++) for (let x = a + 1; x <= b - 1; x++) put(x, y, y === brim - 1 ? band : main);
  for (let x = a; x <= b; x++) put(x, ht - 3, line);
  put(a - 2, brim, line); put(b + 2, brim, line);
  return true;
}

// Boots: recolor the boot pixels; little wings at the heels (winged boots).
function paintBoots(src, out, w, h, facing, body, look) {
  const { is, put, C } = kit(src, out, w, h, body);
  let any = false;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (is(x, y, C.boots)) { put(x, y, y % 2 ? hex(look.shade) : hex(look.main)); any = true; }
  if (!any || !look.wing) return any;
  for (let y = h - 1; y >= 0; y--) {
    let a = w, b = -1; for (let x = 0; x < w; x++) if (is(x, y, C.boots)) { a = Math.min(a, x); b = Math.max(b, x); }
    if (b >= 0) { put(a - 1, y - 1, hex(look.wing)); put(a - 2, y - 2, hex(look.wing)); if (facing !== 'right') { put(b + 1, y - 1, hex(look.wing)); put(b + 2, y - 2, hex(look.wing)); } break; }
  }
  return true;
}

// Socks: the trouser row just above the boots, striped.
function paintSocks(src, out, w, h, facing, body, look) {
  const { is, put, C } = kit(src, out, w, h, body);
  let any = false;
  for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) if (is(x, y, C.pants) && is(x, y + 1, C.boots)) { put(x, y, hex(look.main)); put(x, y - 1, hex(look.shade)); any = true; }
  return any;
}

// Gloves: the hands (the lowest skin pixel of each arm column below the shirt line).
function paintGloves(src, out, w, h, facing, body, look) {
  const { is, put, C, rows } = kit(src, out, w, h, body);
  const [top] = rows(C.shirt); if (top >= h) return false;
  let any = false;
  for (let x = 0; x < w; x++) { let last = -1; for (let y = top; y < h; y++) if (is(x, y, C.skin)) last = y; if (last >= 0) { put(x, last, hex(look.main)); if (is(x, last - 1, C.skin)) put(x, last - 1, hex(look.shade)); any = true; } }
  return any;
}

// The smart pacifier: a pink shield and a white ring at the mouth, seen from the front and the side.
function paintPacifier(src, out, w, h, facing, body, look) {
  if (facing === 'up') return false;
  const { is, put, C, rows } = kit(src, out, w, h, body);
  const [top] = rows(C.shirt); if (top >= h) return false;
  let a = w, b = -1; const y = top - 2;
  for (let x = 0; x < w; x++) if (is(x, y, C.skin)) { a = Math.min(a, x); b = Math.max(b, x); }
  if (b < 0) return false;
  const cx = facing === 'right' ? b : Math.floor((a + b) / 2);
  put(cx, y, hex(look.main)); put(cx - 1, y, hex(look.main)); put(cx, y + 1, hex(look.shade));
  return true;
}

// The mate holster: a gourd and its straw on the hip (the back hip from behind).
function paintHolster(src, out, w, h, facing, body, look) {
  const { is, put, C, rows, span } = kit(src, out, w, h, body);
  const [, bot] = rows(C.shirt); if (bot < 0) return false;
  const [a, b] = span(bot);
  const x = facing === 'right' ? a + 1 : b;
  put(x, bot + 1, hex(look.main)); put(x, bot + 2, hex(look.main)); put(x + (facing === 'right' ? -1 : 1), bot + 2, hex(look.shade));
  put(x, bot, hex(look.shade)); put(x, bot - 1, hex(look.metal));
  return true;
}

// Manuel's bigger butt: the top rows of the trousers bulge out behind him (both sides from the front and
// back), in the trouser colour with an outline. Clothed, cartoonish, nothing else (D-015).
function paintButt(src, out, w, h, facing, body) {
  const { is, put, C, rows } = kit(src, out, w, h, body);
  const [hip, low] = rows(C.pants); if (low < 0) return false;
  const pants = C.pants[0], line = hex(P.night0), shine = hex(P.night3).map((v) => Math.min(255, v + 28));
  for (let y = Math.max(0, hip - 1); y <= Math.min(hip + 4, low); y++) {
    let a = w, b = -1; for (let x = 0; x < w; x++) if (is(x, y, C.pants) || is(x, y, C.shirt)) { a = Math.min(a, x); b = Math.max(b, x); }
    if (b < 0) continue;
    const swell = [1, 2, 3, 3, 2, 1][y - (hip - 1)] ?? 1;
    const sides = facing === 'right' ? [-1] : [-1, 1];
    for (const sd of sides) {
      const edge = sd < 0 ? a : b;
      for (let k = 1; k <= swell; k++) put(edge + sd * k, y, pants);
      put(edge + sd * (swell + 1), y, line);
    }
    if (y === hip + 1) put(facing === 'right' ? a - 1 : a, y, shine);
  }
  return true;
}

// Michael without a belt: his trousers slide down to his ankles. White boxers with little red hearts where the
// trousers started, bare legs below them, the trousers bunched over the boots. Boxers stay on (D-015).
function paintPantsDown(src, out, w, h, facing, body, look) {
  const { is, put, C, rows } = kit(src, out, w, h, body);
  const [hip, low] = rows(C.pants); if (low < 0) return false;
  const [bt] = rows(C.boots);
  const white = hex(look.main), heart = hex(look.heart), line = hex(P.night0), pants = C.pants[0];
  let left = w; for (let x = 0; x < w; x++) if (is(x, hip, C.pants)) { left = x; break; }
  for (let y = hip; y <= low; y++) for (let x = 0; x < w; x++) {
    if (!is(x, y, C.pants)) continue;
    if (y <= hip + 1) {
      // Boxers, two rows: each heart is two bumps on the top row and the point under them, tiled every 5 px.
      const p = (x - left + 4) % 5, isHeart = (y === hip && (p === 0 || p === 2)) || (y === hip + 1 && p === 1);   // a 1-2 px gap between hearts
      put(x, y, isHeart ? heart : white);
    } else put(x, y, is(x - 1, y, C.pants) && is(x + 1, y, C.pants) ? C.skin[0] : C.skin[1]);   // bare legs down to the ankles
  }
  // The trousers, bunched round the ankles over the tops of the boots, spilling one pixel out each side.
  const y = bt < h ? bt : low; let a = w, b = -1;
  for (let x = 0; x < w; x++) if (is(x, y, C.boots) || is(x, y, C.pants)) { a = Math.min(a, x); b = Math.max(b, x); }
  if (b >= 0) { for (let x = a - 1; x <= b + 1; x++) put(x, y, pants); put(a - 2, y, line); put(b + 2, y, line); }
  return true;
}

// Growth details, cumulative by level. Everyone: a worn knee (2), a wristband (4), a shirt patch (5), newer boots
// (7), a second worn knee (8). Look stage 1 (level 3) and 2 (level 6) add each roommate's own mark.
const MARK = { manuel: P.warm4, trevor: P.bone, michael: P.pork1 };
function paintGrow(src, out, w, h, facing, body, look, who) {
  const { is, put, C, rows, span } = kit(src, out, w, h, body);
  const lv = look.level, st = lookStage(lv), dark = hex(P.night0);
  const [ptop, pbot] = rows(C.pants), [stop, sbot] = rows(C.shirt), [htop] = rows(C.hair), [ftop, fbot] = rows([C.skin[0]]);
  const pantsCols = (y) => { const xs = []; for (let x = 0; x < w; x++) if (is(x, y, C.pants)) xs.push(x); return xs; };
  // worn knees
  if (pbot >= 0) {
    const ky = Math.min(pbot, ptop + Math.floor((pbot - ptop) * 0.6)), xs = pantsCols(ky);
    if (lv >= 2 && xs.length) put(xs[0], ky, hex(P.concrete2));
    if (lv >= 8 && xs.length > 1) put(xs[xs.length - 1], ky, hex(P.concrete2));
  }
  // a wristband: the skin pixel just above the lowest one in the leftmost arm column (the hand stays bare)
  if (lv >= 4 && sbot >= 0) {
    for (let x = 0; x < w; x++) {
      const ys = []; for (let y = stop; y <= Math.min(h - 1, sbot + 3); y++) if (is(x, y, C.skin)) ys.push(y);
      if (ys.length >= 2) { put(x, ys[ys.length - 2], hex(MARK[who] ?? P.bone)); break; }
    }
  }
  // a patch on the shirt
  if (lv >= 5 && sbot >= 0 && facing !== 'up') {
    const y = sbot - 1, [a, b] = span(y);
    if (b > a + 2) { const x = facing === 'right' ? a + 1 : b - 2; if (is(x, y, C.shirt)) put(x, y, hex(body.shirt[1] === P.soft0 ? P.warm2 : P.soft0)); }
  }
  // newer boots: a lit top edge
  if (lv >= 7) { const [bt] = rows(C.boots); if (bt < h) for (let x = 0; x < w; x++) if (is(x, bt, C.boots)) put(x, bt, hex(P.warm2)); }
  if (st < 1) return true;
  // stage marks
  if (who === 'manuel' && htop < h) {                                  // wild hair, a clay smudge; then glowing eyes
    const xs = []; for (let x = 0; x < w; x++) if (is(x, htop, C.hair)) xs.push(x);
    if (xs.length) { const mid = xs[Math.floor(xs.length / 2)]; put(mid, htop - 1, hex(P.warm1)); if (st >= 2) { put(mid - 2, htop - 1, hex(P.warm1)); put(mid + 1, htop - 2, hex(P.warm0)); } }
    if (stop < h && facing !== 'up') { const [a] = span(stop + 2); put(a + 2, stop + 2, hex(P.concrete2)); }
    if (st >= 2 && facing !== 'up' && ftop < h) for (let y = ftop; y <= fbot; y++) for (let x = 1; x < w - 1; x++)
      if (same(src, (y * w + x) * 4, dark) && is(x - 1, y, C.skin) && is(x + 1, y, C.skin)) put(x, y, hex(P.yerba1));   // the gonman doesn't blink
  }
  if (who === 'trevor' && ftop < h) {                                  // a headband; then broader shoulders
    const y = Math.max(0, ftop - 1); for (let x = 0; x < w; x++) if (is(x, y, C.hair) || is(x, y, C.skin)) put(x, y, hex(P.bone));
    if (st >= 2 && stop < h) for (const y of [stop, stop + 1]) {   // shoulders one pixel wider each side, outline moved out with them
      const [a, b] = span(y); if (b < 0) continue;
      put(a, y, C.shirt[1]); put(b, y, C.shirt[1]); put(a - 1, y, dark); put(b + 1, y, dark);
    }
  }
  if (who === 'michael' && ftop < h) {                                 // the lace glowing behind his ear; then brighter, down the neck
    const y = ftop + 1, [a, b] = span(y), x = facing === 'right' ? a : b;
    put(x, y, hex(P.screen2));
    if (st >= 2) { put(x, y + 1, hex(P.screen2)); put(x, y + 2, hex(P.screen1)); if (facing === 'down') put(a, y, hex(P.screen1)); }
  }
  return true;
}

const PAINTERS = { grow: paintGrow, pantsdown: paintPantsDown, butt: paintButt, parka: paintParka, shirt: paintShirt, hat: paintHat, boots: paintBoots, socks: paintSocks, gloves: paintGloves, pacifier: paintPacifier, holster: paintHolster };

/** Build (once) and return the overlay texture key for roommate `who` wearing item `id`. */
export function wearTexture(scene, who, id) {
  const key = `wear:${who}:${id}`, look = LOOKS[id], body = BODY[who];
  if (scene.textures.exists(key)) return key;
  if (!look || !body || !scene.textures.exists(who)) return null;
  const tex = scene.textures.get(who), img = tex.getSourceImage();
  const W = img.width, H = img.height;
  const read = document.createElement('canvas'); read.width = W; read.height = H;
  const rctx = read.getContext('2d', { willReadFrequently: true }); rctx.drawImage(img, 0, 0);
  const canvas = scene.textures.createCanvas(key, W, H), ctx = canvas.getContext();
  for (const name of tex.getFrameNames()) {
    const f = tex.get(name), fw = f.cutWidth, fh = f.cutHeight;
    if (!fw || !fh) continue;
    const src = rctx.getImageData(f.cutX, f.cutY, fw, fh), out = ctx.createImageData(fw, fh);
    const facing = /_up_/.test(name) ? 'up' : /_right_/.test(name) ? 'right' : 'down';
    PAINTERS[look.style]?.(src.data, out.data, fw, fh, facing, body, look, who);
    ctx.putImageData(out, f.cutX, f.cutY);
    const nf = canvas.add(name, 0, f.cutX, f.cutY, fw, fh);
    if (f.trimmed && nf) nf.setTrim(f.realWidth, f.realHeight, f.x, f.y, fw, fh);
  }
  canvas.refresh();
  return key;
}

/** Keep `body.wear` (one overlay sprite per worn look) on top of a body sprite, frame for frame. */
export function syncWear(scene, body, who, c) {
  const want = looksFor(c);
  body.wear ??= [];
  while (body.wear.length > want.length) body.wear.pop().destroy();
  want.forEach((id, k) => {
    const key = wearTexture(scene, who, id); if (!key) return;
    let o = body.wear[k];
    if (!o || !o.active) { o = body.wear[k] = scene.add.image(0, 0, key); if (!body._wearHooked) { body._wearHooked = true; body.once('destroy', () => body.wear?.forEach((x) => x.destroy())); } }
    if (o.texture.key !== key) o.setTexture(key);
    const fname = body.frame?.name;
    if (fname != null && o.frame?.name !== fname && o.texture.has(fname)) o.setFrame(fname);
    o.setOrigin(body.originX, body.originY).setPosition(body.x, body.y).setFlipX(body.flipX).setAngle(body.angle)
      .setScale(body.scaleX, body.scaleY).setAlpha(body.alpha).setVisible(body.visible && o.texture.has(fname))
      .setDepth(body.depth + 0.01).setScrollFactor(body.scrollFactorX, body.scrollFactorY);
    o.setTint(body.tintTopLeft ?? 0xffffff);
  });
  return body.wear;
}

// For tests and previews (tools that paint looks outside the browser).
export const _PAINTERS = PAINTERS, _BODY = BODY;
