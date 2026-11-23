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

import { growthLook, lookStage, bellyFor } from '../../content/growth.js';

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const P = {
  night0: '#0d0b1a', night1: '#17142b', night2: '#231f3f', night3: '#332e57',
  warm1: '#5c3a22', warm0: '#3a2418', warm2: '#8a5a2e', warm3: '#b9853f', warm4: '#e0b866',
  skin1: '#a3674a', skin2: '#d09a72', skin3: '#f0c9a0',
  yerba0: '#3e5a34', yerba1: '#6f9448', tub0: '#2c4a8a', tub1: '#4f7fd0', soft0: '#7a2f38', soft1: '#c05a5e',
  pork2: '#f7b8c8', parka: '#b46a26', slicker0: '#e0a51c', slicker1: '#ffd93b', bone: '#e8e2d0', steel: '#7a8794',
  screen1: '#1a8a9c', screen2: '#3fd0d6', concrete1: '#3f4a46', concrete2: '#5b6862', concrete3: '#7f8c84', pork1: '#e87a9c', signal: '#d42a3c',
  screen0: '#0f4a5c', concrete0: '#2b3331', pork0: '#a8456a', balloon0: '#f07818', balloon1: '#ffa23a', rot1: '#c8e619', warm3: '#b9853f',
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
  // Trevor's (task #29):
  'item.stage_jacket':   { slot: 'chestplate', style: 'parka', hood: false, main: P.tub0, shade: P.night2, line: P.night0, patches: [P.signal, P.warm4, P.bone] },   // denim, band patches
  'item.callus_gloves':  { slot: 'gloves', style: 'gloves', fingerless: true, main: P.night2, shade: P.night1 },
  'item.tank_goggles':   { slot: 'goggles', style: 'goggles', main: P.night1, lens: P.screen2, glint: P.bone },
  'item.spinner_pack':   { slot: 'backpack', style: 'pack', main: P.steel, shade: P.concrete1, detail: P.signal, kind: 'spinner' },
  // Everyone's gear (Trevor, 2026-11-23: "make armor and equipped items actually visible on the player"):
  'item.mesh_vest':      { slot: 'chestplate', style: 'vest', main: P.concrete3, shade: P.concrete1, line: P.night0 },   // hex lattice over the shirt
  'item.bike_helmet':    { slot: 'helmet', style: 'helmet', main: P.signal, shade: P.soft0, line: P.night0, stripe: P.bone },   // cracked shell, SLOW DOWN
  'item.hardhat':        { slot: 'helmet', style: 'helmet', main: P.slicker1, shade: P.slicker0, line: P.night0, brim: true },
  'item.work_pants':     { slot: 'leggings', style: 'pants', main: P.warm3, shade: P.warm2, patch: P.warm1 },   // stiff canvas, a knee patch
  'item.steel_toes':     { slot: 'boots', style: 'boots', main: P.concrete1, shade: P.concrete0, toe: P.steel },
  'item.sneakers':       { slot: 'boots', style: 'boots', main: P.bone, shade: P.concrete3, sole: P.balloon1 },   // bright soles
  'item.welding_goggles':{ slot: 'goggles', style: 'goggles', main: P.night1, lens: P.yerba0, glint: P.yerba1 },
  'item.work_gloves':    { slot: 'gloves', style: 'gloves', main: P.warm2, shade: P.warm1 },
  'item.wool_socks':     { slot: 'socks', style: 'socks', main: P.soft1, shade: P.bone },
  'item.pack_coolant':   { slot: 'backpack', style: 'pack', main: P.tub0, shade: P.night2, detail: P.screen2, kind: 'coolant' },
  'item.pack_drone':     { slot: 'backpack', style: 'pack', main: P.concrete1, shade: P.concrete0, detail: P.screen2, kind: 'drone' },
  'item.pack_capacitor': { slot: 'backpack', style: 'pack', main: P.slicker0, shade: P.warm2, detail: P.night0, kind: 'capacitor' },
  // Charms hang at the collar (front view); gadgets ride on the wrist, lit in their own color.
  'item.charm_1901':     { slot: 'charm', style: 'charm', main: P.warm4, shade: P.warm2 },
  'item.pork_pin':       { slot: 'charm', style: 'charm', main: P.pork1, shade: P.bone },
  'item.lake_bust':      { slot: 'charm', style: 'charm', main: P.bone, shade: P.concrete3 },
  'item.ozzie_lure':     { slot: 'charm', style: 'charm', main: P.signal, shade: P.bone },
};
// Gadgets: a cuff on the wrist with a lit cell, one color per gadget.
for (const [id, lit] of Object.entries({ sniffer: P.balloon1, salvage_array: P.warm4, phase_screen: P.screen2, vector_actuator: P.signal, arc_splicer: P.tub1, phase_tether: P.pork1, overclock_relay: P.rot1, patch_mesh: P.yerba1, ground_loop: P.bone })) {
  LOOKS[`item.${id}`] = { slot: 'gadget', style: 'wrist', main: P.concrete1, lit };
}
// Growth (src/content/growth.js): one look per level, painted under any gear.
for (let lv = 2; lv <= 8; lv++) {
  LOOKS[`fx.grow${lv}`] = { slot: '_grow', style: 'grow', level: lv };
  for (let b = 0; b <= 3; b++) LOOKS[`fx.grow${lv}b${b}`] = { slot: '_grow', style: 'grow', level: lv, belly: b };   // Manuel's weight after the gonman
}
const LOOK_SLOTS = [...new Set(Object.values(LOOKS).map((l) => l.slot))].filter((s) => s !== '_grow');
// Draw order, bottom to top: trousers, socks, boots, shirts, coats, the gags, vests over coats, packs, hands, wrists,
// charms, then whatever goes on the head.
const LAYER = { pants: 1, socks: 2, boots: 3, shirt: 4, parka: 5, butt: 6, pantsdown: 6, vest: 7, pack: 8, holster: 8, gloves: 9, wrist: 10, charm: 11, helmet: 12, goggles: 13, hat: 13, pacifier: 14 };

/** The looks a roommate is wearing right now, in draw order. */
export function looksFor(c) {
  const grow = growthLook(c?.level ?? 1, c?._belly);   // _belly: Manuel's belly right now, when it isn't his level's
  const worn = LOOK_SLOTS.map((sl) => c?.equipped?.[sl]).filter((id) => id && LOOKS[id]);
  worn.sort((a, b) => (LAYER[LOOKS[a].style] ?? 6) - (LAYER[LOOKS[b].style] ?? 6));
  return [...(grow ? [grow] : []), ...worn];
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
  if (look.patches && facing !== 'right') {   // band patches: front on the chest, back between the shoulders
    const px = Math.floor((x0 + x1) / 2);
    look.patches.forEach((c, i) => { const x = facing === 'down' ? px + (i === 0 ? -2 : i === 1 ? 2 : -2) : px - 1 + i, y = facing === 'down' ? top + 2 + (i === 2 ? 2 : 0) : top + 2; put(x, y, hex(c)); });
  }
  if (look.hood === false) return true;   // a jacket, not a parka: no hood
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
  if (any && (look.toe || look.sole)) for (let y = 0; y < h; y++) {
    let a = w, b = -1; for (let x = 0; x < w; x++) if (is(x, y, C.boots)) { a = Math.min(a, x); b = Math.max(b, x); }
    if (b < 0) continue;
    if (look.sole) for (let x = a; x <= b; x++) if (!is(x, y + 1, C.boots)) put(x, y + 1, hex(look.sole));   // the sole under each boot
    if (look.toe) { if (facing === 'right') put(b, y, hex(look.toe)); else if (facing === 'down') for (let x = a; x <= b; x++) if (is(x, y, C.boots) && !is(x + 1, y, C.boots)) put(x, y, hex(look.toe)); }
  }
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
  for (let x = 0; x < w; x++) {
    let last = -1; for (let y = top; y < h; y++) if (is(x, y, C.skin)) last = y;
    if (last < 0) continue;
    if (look.fingerless) { if (is(x, last - 1, C.skin)) { put(x, last - 1, hex(look.main)); any = true; } continue; }   // the fingertips stay bare
    put(x, last, hex(look.main)); if (is(x, last - 1, C.skin)) put(x, last - 1, hex(look.shade)); any = true;
  }
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
function paintGrowMarks(src, out, w, h, facing, body, look, who) {
  const { is, put, C, rows, span } = kit(src, out, w, h, body);
  const lv = look.level, st = lookStage(lv), dark = hex(P.night0);
  const [ptop, pbot] = rows(C.pants), [stop, sbot] = rows(C.shirt), [htop] = rows(C.hair), [ftop, fbot] = rows([C.skin[0]]);
  const pantsCols = (y) => { const xs = []; for (let x = 0; x < w; x++) if (is(x, y, C.pants)) xs.push(x); return xs; };
  // worn knees
  if (pbot >= 0) {
    const ky = Math.min(pbot, ptop + Math.floor((pbot - ptop) * 0.6)), xs = pantsCols(ky);
    if (lv >= 2 && xs.length) { put(xs[0], ky, hex(P.concrete2)); put(xs[0], ky + 1, hex(P.concrete1)); }
    if (lv >= 6 && xs.length > 1) { put(xs[xs.length - 1], ky, hex(P.concrete2)); put(xs[xs.length - 1], ky + 1, hex(P.concrete1)); }
  }
  // a wristband: the skin pixel just above the lowest one in the leftmost arm column (the hand stays bare)
  if (lv >= 4 && sbot >= 0 && who !== 'trevor') {
    for (let x = 0; x < w; x++) {
      const ys = []; for (let y = stop; y <= Math.min(h - 1, sbot + 3); y++) if (is(x, y, C.skin)) ys.push(y);
      if (ys.length >= 2) { put(x, ys[ys.length - 2], hex(MARK[who] ?? P.bone)); break; }
    }
  }
  // a patch on the shirt
  if (lv >= 5 && sbot >= 0 && facing !== 'up') {
    const y = sbot - 1, [a, b] = span(y);
    if (b > a + 2) { const x = facing === 'right' ? a + 1 : b - 2, c = hex(body.shirt[1] === P.soft0 ? P.warm2 : P.soft0); for (const [dx, dy] of [[0, 0], [1, 0], [0, -1], [1, -1]]) if (is(x + dx, y + dy, C.shirt)) put(x + dx, y + dy, c); }   // a 2x2 patch
  }
  // newer boots: a lit top edge
  if (lv >= 7) { const [bt] = rows(C.boots); if (bt < h) for (let x = 0; x < w; x++) if (is(x, bt, C.boots)) put(x, bt, hex(P.warm2)); }
  // A beard, slowly (Manuel: "grow a slight beard"): stubble at the jaw corners (3), the chin (5), a light beard
  // along the jaw (6), a little up the cheeks (8). In each roommate's own hair colour; not from behind.
  if (lv >= 3 && facing !== 'up' && ftop < h && stop < h) {
    let fb = -1; for (let y = stop - 1; y >= ftop; y--) { let n = 0; for (let x = 0; x < w; x++) if (is(x, y, C.skin)) n++; if (n >= 4) { fb = y; break; } }   // the jaw, not the neck
    if (fb > ftop + 1) {
      const stub = C.hair[1] ?? C.hair[0], row = (y) => { const xs = []; for (let x = 0; x < w; x++) if (is(x, y, C.skin)) xs.push(x); return xs; };
      const xs = row(fb), pick = (i) => xs[Math.max(0, Math.min(xs.length - 1, i))];
      if (facing === 'right') {                                         // side view: the jaw is the back-lower edge of the face
        put(pick(xs.length - 2), fb, stub); put(pick(xs.length - 1), fb, stub);
        if (lv >= 5) xs.forEach((x) => put(x, fb, stub));
        if (lv >= 6) { const up = row(fb - 1); if (up.length) { put(up[0], fb - 1, stub); put(up[1] ?? up[0], fb - 1, stub); } }
        if (lv >= 8) { const up = row(fb - 1); if (up.length > 2) put(up[up.length - 2], fb - 1, stub); }
      } else {
        put(pick(0), fb, stub); put(pick(xs.length - 1), fb, stub); put(pick(Math.floor(xs.length / 2)), fb, stub);
        if (lv >= 5) xs.forEach((x) => put(x, fb, stub));
        if (lv >= 6) { const up = row(fb - 1); if (up.length > 2) { put(up[0], fb - 1, stub); put(up[up.length - 1], fb - 1, stub); } }
        if (lv >= 8) { const up = row(fb - 1); if (up.length > 4) { const m = up[Math.floor(up.length / 2)]; put(m - 1, fb - 1, stub); put(m, fb - 1, stub); } }   // a moustache
      }
    }
  }
  if (st < 1) return true;
  // stage marks
  if (who === 'manuel' && lv >= 6 && facing !== 'up' && ftop < h && stop < h) {   // fuller cheeks (Manuel gets rounder)
    let fy = -1; for (let y = stop - 1; y >= ftop; y--) { let n = 0; for (let x = 0; x < w; x++) if (is(x, y, C.skin)) n++; if (n >= 4) { fy = y - 1; break; } }
    if (fy > ftop) { const [a, b] = span(fy); if (facing !== 'right') { put(a, fy, C.skin[1]); put(a - 1, fy, dark); } put(b, fy, C.skin[1]); put(b + 1, fy, dark); }
  }
  const smudge = (x, y) => { if (is(x, y, C.shirt)) put(x, y, hex(P.concrete2)); };
  if (who === 'manuel') {                                              // the sculptor: clay builds up; hair goes wild; then the gonman's eyes
    if (htop < h) {
      const xs = []; for (let x = 0; x < w; x++) if (is(x, htop, C.hair)) xs.push(x);
      if (xs.length) {
        const mid = xs[Math.floor(xs.length / 2)], tuft = (x, y) => put(x, y, hex(P.warm1));
        tuft(mid, htop - 1); tuft(mid - 2, htop - 1);
        if (lv >= 4) tuft(xs[xs.length - 1] + 1, htop + 1);
        if (st >= 2) { tuft(mid + 1, htop - 2); tuft(mid - 1, htop - 2); tuft(xs[0] - 1, htop + 1); tuft(mid + 2, htop - 1); }
        if (lv >= 8) { tuft(mid, htop - 3); tuft(mid - 3, htop - 1); }
      }
    }
    if (stop < h && facing !== 'up') {
      const [a, b] = span(stop + 2); smudge(a + 2, stop + 2); smudge(a + 3, stop + 2); smudge(a + 2, stop + 3);
      if (lv >= 5) smudge(b - 2, stop + 1);
      if (lv >= 7) { const [a2] = span(sbot); smudge(a2 + 3, sbot); }
      if (lv >= 8) { const [, b3] = span(stop + 3); if (is(b3 - 3, stop + 3, C.shirt)) put(b3 - 3, stop + 3, hex(P.yerba0)); }   // a mate stain
    }
    if (lv >= 4) for (let x = 0; x < w; x++) {                         // clay on his hands: the lowest skin pixel of each arm
      const ys = []; for (let y = stop; y <= Math.min(h - 1, sbot + 3); y++) if (is(x, y, C.skin)) ys.push(y);
      if (ys.length >= 2) put(x, ys[ys.length - 1], hex(P.concrete3));
    }
    // "Toothpaste" (Manuel's own request, his character only; implied, D-015): white splotches that turn up once
    // the gonman's stage two does (level 6) and spread a little. He says it's toothpaste (barks.js: toothpaste).
    if (st >= 2 && facing !== 'up') {
      const spot = (x, y, list) => { if (is(x, y, list)) put(x, y, hex(P.bone)); };
      const [a4, b4] = span(sbot); spot(b4 - 2, sbot, C.shirt); spot(b4 - 3, sbot, C.shirt); spot(b4 - 2, sbot - 1, C.shirt);
      if (lv >= 7 && ptop < h) { const xs = pantsCols(ptop + 1); if (xs.length) { spot(xs[1] ?? xs[0], ptop + 1, C.pants); spot(xs[1] ?? xs[0], ptop + 2, C.pants); } }
      if (lv >= 8 && stop < h) { const [a5] = span(stop + 1); spot(a5 + 2, stop + 1, C.shirt); spot(a5 + 3, stop + 2, C.shirt); }
    }
    if (st >= 2 && facing !== 'up' && ftop < h) for (let y = ftop; y <= fbot; y++) for (let x = 1; x < w - 1; x++)
      if (same(src, (y * w + x) * 4, dark) && is(x - 1, y, C.skin) && is(x + 1, y, C.skin)) put(x, y, hex(P.yerba1));   // the gonman doesn't blink
  }
  if (who === 'trevor' && ftop < h) {                                  // the gym one: a headband, then more muscle level by level
    const y = facing === 'up' && htop < h ? htop + 3 : Math.max(0, ftop - 1);   // from behind, the band goes round the back of his head
    for (let x = 0; x < w; x++) if (is(x, y, C.hair) || is(x, y, C.skin)) put(x, y, hex(P.bone));
    const widen = (yy, k) => { const [a, b] = span(yy); if (b < 0) return; for (let i = 0; i < k; i++) { put(a - i, yy, C.shirt[1]); put(b + i, yy, C.shirt[1]); } put(a - k, yy, dark); put(b + k, yy, dark); };
    if (stop < h) {
      if (lv >= 4) widen(stop, 1);                                       // shoulders
      if (st >= 2) { widen(stop, 2); widen(stop + 1, 1); }               // broad shoulders
    }
    if (lv >= 5 && sbot >= 0) for (const side of [-1, 1]) {            // thicker upper arms
      for (let yy = stop + 1; yy <= Math.min(sbot, stop + 3); yy++) {
        const [a, b] = span(yy); if (b < 0) continue; const x = side < 0 ? a : b;
        if (is(x + side * -1, yy, C.skin) || is(x, yy, C.skin) || is(x + side * -1, yy, C.shirt)) { put(x, yy, C.skin[1]); put(x + side, yy, dark); }
      }
    }
    if (lv >= 7 && stop < h && facing !== 'up') { const [a, b] = span(stop + 2); const m = Math.floor((a + b) / 2); if (is(m, stop + 2, C.shirt)) put(m, stop + 2, C.shirt[1]); if (is(m, stop + 3, C.shirt)) put(m, stop + 3, C.shirt[1]); }   // a chest line
    if (lv >= 8 && stop > 0) { const [a, b] = span(stop - 1); if (b > a + 3) { put(a + 1, stop - 1, C.skin[1]); put(b - 1, stop - 1, C.skin[1]); } }   // traps
  }
  if (who === 'michael' && ftop < h) {                                 // the lace: its glow spreads level by level
    const y = ftop + 1, [a, b] = span(y), x = facing === 'right' ? a : b;
    put(x, y, hex(P.screen2));
    if (lv >= 5) put(x, y - 1, hex(P.screen1));
    if (st >= 2) { put(x, y + 1, hex(P.screen2)); put(x, y + 2, hex(P.screen1)); if (facing === 'down') put(a, y, hex(P.screen1)); }
    if (lv >= 7 && sbot >= 0) for (let xx = w - 1; xx >= 0; xx--) {     // a cyan line at the wrist, where the lace talks to his hand
      const ys = []; for (let yy = stop; yy <= Math.min(h - 1, sbot + 3); yy++) if (is(xx, yy, C.skin)) ys.push(yy);
      if (ys.length >= 2) { put(xx, ys[ys.length - 2], hex(P.screen2)); break; }
    }
    if (lv >= 8 && facing !== 'up') for (let yy = ftop; yy <= ftop + 4; yy++) for (let xx = 1; xx < w - 1; xx++)
      if (same(src, (yy * w + xx) * 4, dark) && is(xx - 1, yy, C.skin) && is(xx + 1, yy, C.skin)) { put(xx, yy, hex(P.screen2)); yy = h; break; }   // a glint in one eye
    // His style, as he comes out of his shell (Michael's own entry: he grows more into his roommates over the game):
    // a small rainbow pin (3), a stud earring (4), a pink streak in his hair (5), pink nails and a heart on his
    // sleeve (6), a second earring (7), a bolder streak (8). Accessories he'd pick, not a caricature.
    const [ha, hb] = span(ftop + 1), earR = facing === 'right' ? ha : hb, earL = facing === 'right' ? -1 : ha;
    if (facing !== 'up' && stop < h) {                                  // the pin: red, yellow, green, blue (no orange: D-004)
      const [a2, b2] = span(stop + 1), px = facing === 'right' ? a2 + 2 : b2 - 3;
      [[0, 0, P.signal], [1, 0, P.warm4], [0, 1, P.yerba1], [1, 1, P.tub1]].forEach(([dx, dy, c]) => { if (is(px + dx, stop + 1 + dy, C.shirt)) put(px + dx, stop + 1 + dy, hex(c)); });
    }
    if (lv >= 4) put(earR, ftop + 2, hex(P.bone));                     // a stud earring
    if (lv >= 7 && earL >= 0 && facing === 'down') put(earL, ftop + 2, hex(P.bone));
    if (lv >= 5 && htop < h) {                                          // a pink streak through his fringe
      const xs = []; for (let x = 0; x < w; x++) if (is(x, htop + 1, C.hair)) xs.push(x);
      if (xs.length) { const x0 = xs[Math.floor(xs.length * (facing === 'right' ? 0.6 : 0.3))]; put(x0, htop + 1, hex(P.pork1)); put(x0, htop + 2, hex(P.pork1)); if (lv >= 8) { put(x0 + 1, htop + 1, hex(P.pork2)); put(x0 + 1, htop + 2, hex(P.pork1)); put(x0, htop, hex(P.pork1)); } }
    }
    if (st >= 2 && sbot >= 0) {
      for (let x = 0; x < w; x++) {                                     // pink nails: the lowest skin pixel of each arm
        const ys = []; for (let y = stop; y <= Math.min(h - 1, sbot + 3); y++) if (is(x, y, C.skin)) ys.push(y);
        if (ys.length >= 2) put(x, ys[ys.length - 1], hex(P.pork1));
      }
      const [a3] = span(stop + 1);                                      // a little heart on his sleeve
      if (is(a3 + 1, stop + 1, C.shirt) && is(a3 + 2, stop + 2, C.shirt)) { put(a3 + 1, stop + 1, hex(P.pork2)); put(a3 + 2, stop + 2, hex(P.pork2)); }
    }
  }
  return true;
}

// Manuel gets rounder as the story goes on (his own request): from level 3 his middle widens, most at the waist,
// by pushing his arms out and filling the space with belly (front and back), or pushing his front out (profile).
// Done after every other mark, on the combined picture, so the clay, the toothpaste and the rest move with him.
function paintGrow(src, out, w, h, facing, body, look, who) {
  paintGrowMarks(src, out, w, h, facing, body, look, who);
  const lv = look.level, k = who === 'manuel' ? (look.belly ?? bellyFor(lv)) : 0;
  if (!k) return true;
  const { C, rows } = kit(src, out, w, h, body), [stop, sbot] = rows(C.shirt); if (sbot < 0) return true;
  const at = (x, y) => { const i = (y * w + x) * 4; return out[i + 3] ? [out[i], out[i + 1], out[i + 2], 255] : [src[i], src[i + 1], src[i + 2], src[i + 3]]; };
  const dark = [...hex(P.night0), 255], shirt = [...C.shirt[0], 255], hi = [...hex(P.yerba1).map((v) => Math.min(255, v + 18)), 255], pants = [...C.pants[0], 255];
  const ys = []; for (let y = stop + 2; y <= Math.min(h - 1, sbot + 1); y++) ys.push(y);
  ys.forEach((y, i) => {
    const d = Math.max(0, Math.round(k * Math.sin(Math.PI * (i + 0.5) / ys.length) + (i >= ys.length / 2 ? 0.3 : 0)));
    if (!d) return;
    const row = Array.from({ length: w }, (_, x) => at(x, y)); let a = w, b = -1;
    row.forEach((p, x) => { if (p[3]) { a = Math.min(a, x); b = Math.max(b, x); } });
    if (b < 0) return;
    const mid = facing === 'right' ? b - 1 : Math.floor((a + b) / 2), dl = facing === 'right' ? 0 : d, dr = d, nw = Array(w).fill(null);   // profile: only the front pushes out
    for (let x = a; x <= b; x++) { const nx = x <= mid ? x - dl : x + dr; if (nx >= 0 && nx < w && row[x][3]) nw[nx] = row[x]; }
    for (let x = mid - dl + 1; x <= mid + dr; x++) if (x >= 0 && x < w) nw[x] = y > sbot ? pants : (x === mid ? hi : shirt);   // the belly
    for (let x = Math.max(0, a - dl); x <= Math.min(w - 1, b + dr); x++) if (!nw[x] && row[x][3]) nw[x] = dark;   // no holes onto the old outline
    nw.forEach((p, x) => { if (p) { const j = (y * w + x) * 4; out[j] = p[0]; out[j + 1] = p[1]; out[j + 2] = p[2]; out[j + 3] = 255; } });
  });
  return true;
}

// The torso: shirt pixels in the columns the waist spans (no sleeves). [x0, x1, top, bot]
function torso(src, w, h, body) {
  const { is, C, rows } = kit(src, null, w, h, body);
  const [top, bot] = rows(C.shirt); if (bot < 0) return null;
  let a = w, b = -1; for (let x = 0; x < w; x++) if (is(x, bot, C.shirt)) { a = Math.min(a, x); b = Math.max(b, x); }
  return b < 0 ? null : [a, b, top, bot];
}

// A helmet: a shell over the top of the head (the hair's first rows, and all of it from behind), a dark rim, a stripe
// down the middle (bike helmet) or a brim out over the face (hard hat).
function paintHelmet(src, out, w, h, facing, body, look) {
  const { is, put, empty, C, rows } = kit(src, out, w, h, body);
  const [ht, hb] = rows(C.hair); if (hb < 0) return false;
  const main = hex(look.main), shade = hex(look.shade), line = hex(look.line);
  const deep = facing === 'up' ? Math.min(hb, ht + 5) : ht + 2;
  for (let y = ht - 1; y <= deep; y++) {
    let a = w, b = -1; for (let x = 0; x < w; x++) if (!empty(x, y)) { a = Math.min(a, x); b = Math.max(b, x); }
    if (b < 0) continue;
    for (let x = a; x <= b; x++) {
      if (is(x, y, C.skin)) continue;   // never over the face
      const edge = x === a || x === b || y === ht - 1;
      put(x, y, edge ? line : y === deep ? shade : main);
    }
    if (look.stripe && y >= ht && y < deep) put(Math.floor((a + b) / 2) + (facing === 'right' ? -1 : 0), y, hex(look.stripe));
  }
  if (look.brim) {   // the hard hat's brim, one row past the shell, out over the forehead
    let a = w, b = -1; for (let x = 0; x < w; x++) if (!empty(x, deep)) { a = Math.min(a, x); b = Math.max(b, x); }
    if (b >= 0) { const y = deep + 1; if (facing === 'right') for (let x = a + 2; x <= b + 2; x++) put(x, deep, x > b ? line : shade); else for (let x = a - 1; x <= b + 1; x++) put(x, y - 1, x === a - 1 || x === b + 1 ? line : shade); }
  }
  return true;
}

// Goggles: a strap round the head at eye level and two lenses over the eyes (one from the side, none from behind).
function paintGoggles(src, out, w, h, facing, body, look) {
  const { is, put, empty, C, rows } = kit(src, out, w, h, body);
  const [st] = rows(C.skin); if (st >= h) return false;
  const y = st + 1, strap = hex(look.main), lens = hex(look.lens), glint = hex(look.glint);
  let a = w, b = -1; for (let x = 0; x < w; x++) if (!empty(x, y)) { a = Math.min(a, x); b = Math.max(b, x); }
  if (b < 0) return false;
  for (let x = a; x <= b; x++) put(x, y, strap);
  if (facing === 'up') return true;   // the strap across the back of the head
  const eyes = []; for (let x = a + 1; x < b; x++) if (!is(x, y, C.skin) && !is(x, y, C.hair) && is(x - 1, y, C.skin)) eyes.push(x);   // the eye pixels in that row
  if (!eyes.length) eyes.push(facing === 'right' ? b - 1 : Math.floor((a + b) / 2));
  for (const x of eyes) { put(x - 1, y, lens); put(x, y, lens); put(x - 1, y - 1, strap); put(x, y - 1, glint); }
  return true;
}

// Work trousers: recolor the legs, with a patch on one knee.
function paintPants(src, out, w, h, facing, body, look) {
  const { is, put, C, rows } = kit(src, out, w, h, body);
  const [top, bot] = rows(C.pants); if (bot < 0) return false;
  for (let y = top; y <= bot; y++) for (let x = 0; x < w; x++) if (is(x, y, C.pants)) put(x, y, x % 4 === 0 ? hex(look.shade) : hex(look.main));
  const knee = Math.min(bot, top + 3); let kx = -1; for (let x = 0; x < w; x++) if (is(x, knee, C.pants)) { kx = x; break; }
  if (kx >= 0 && facing !== 'up') { put(kx, knee, hex(look.patch)); put(kx + 1, knee, hex(look.patch)); }
  return true;
}

// The mesh vest: a hex lattice over the torso, with an outline down each side. No sleeves.
function paintVest(src, out, w, h, facing, body, look) {
  const T = torso(src, w, h, body); if (!T) return false;
  const { is, put, C } = kit(src, out, w, h, body);
  const [a, b, top, bot] = T, main = hex(look.main), shade = hex(look.shade), line = hex(look.line);
  for (let y = top; y <= bot; y++) for (let x = a; x <= b; x++) {
    if (!is(x, y, C.shirt)) continue;
    put(x, y, x === a || x === b ? line : (x + y * 2) % 3 === 0 ? shade : main);
  }
  return true;
}

// A backpack: from behind, the pack itself over the back; from the front, the two straps; from the side, the pack
// standing off the back. Each kind adds its own detail.
function paintPack(src, out, w, h, facing, body, look) {
  const T = torso(src, w, h, body); if (!T) return false;
  const { put, empty } = kit(src, out, w, h, body);
  const [a, b, top, bot] = T, main = hex(look.main), shade = hex(look.shade), det = hex(look.detail), line = hex(P.night0);
  if (facing === 'down') { for (let y = top; y <= bot - 1; y++) { put(a + 1, y, shade); put(b - 1, y, shade); } return true; }
  const box = facing === 'up' ? [a, b, top, bot] : (() => { let f = w; for (let x = 0; x < w; x++) if (!empty(x, top + 2)) { f = x; break; } return [f - 3, f, top, bot - 1]; })();
  const [x0, x1, y0, y1] = box;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, x === x0 || x === x1 || y === y0 || y === y1 ? line : y === y1 - 1 ? shade : main);
  const cx = Math.floor((x0 + x1) / 2), cy = Math.floor((y0 + y1) / 2);
  if (look.kind === 'coolant') for (let y = y0 + 1; y < y1; y++) { if (y % 2) put(x0 + 1, y, det); else put(x1 - 1, y, det); }
  if (look.kind === 'capacitor') { put(cx, cy - 1, det); put(cx - 1, cy, det); put(cx, cy, det); put(cx, cy + 1, det); }   // a bolt
  if (look.kind === 'drone') { for (let x = cx - 2; x <= cx + 2; x++) put(x, y0 - 1, shade); put(cx, y0 - 1, det); put(cx - 2, y0 - 2, line); put(cx + 2, y0 - 2, line); }   // riding on top
  if (look.kind === 'spinner') { for (let x = x0 - 1; x <= x1 + 1; x++) put(x, y0 - 1, det); put(cx, cy, det); }   // the weapon bar, still live
  return true;
}

// A gadget cuff on the near wrist: a dark band with a lit cell.
function paintWrist(src, out, w, h, facing, body, look) {
  const { is, put, C, rows } = kit(src, out, w, h, body);
  const [top] = rows(C.shirt); if (top >= h) return false;
  const cols = []; for (let x = 0; x < w; x++) { let last = -1; for (let y = top; y < h; y++) if (is(x, y, C.skin)) last = y; if (last > top) cols.push([x, last]); }
  if (!cols.length) return false;
  const [x, last] = facing === 'right' ? cols[cols.length - 1] : cols[0];
  const side = facing === 'right' ? -1 : 1;
  put(x, last - 1, hex(look.lit)); put(x, last - 2, hex(look.lit)); put(x, last - 3, hex(look.main));
  put(x - side, last - 1, hex(look.main)); put(x - side, last - 2, hex(look.main));   // the cuff wraps the forearm
  return true;
}

// A charm at the collar: a cord and a two-pixel pendant, from the front only.
function paintCharm(src, out, w, h, facing, body, look) {
  if (facing === 'up') return false;
  const T = torso(src, w, h, body); if (!T) return false;
  const { put } = kit(src, out, w, h, body);
  const [a, b, top] = T, cx = facing === 'right' ? b - 1 : Math.floor((a + b) / 2);
  put(cx, top, hex(look.shade)); put(cx, top + 1, hex(look.main)); put(cx, top + 2, hex(look.main));
  return true;
}

const PAINTERS = { helmet: paintHelmet, goggles: paintGoggles, pants: paintPants, vest: paintVest, pack: paintPack, wrist: paintWrist, charm: paintCharm, grow: paintGrow, pantsdown: paintPantsDown, butt: paintButt, parka: paintParka, shirt: paintShirt, hat: paintHat, boots: paintBoots, socks: paintSocks, gloves: paintGloves, pacifier: paintPacifier, holster: paintHolster };

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
