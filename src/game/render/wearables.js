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

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const P = {
  night0: '#0d0b1a', night1: '#17142b', night2: '#231f3f', night3: '#332e57',
  warm1: '#5c3a22', warm0: '#3a2418', warm2: '#8a5a2e', warm3: '#b9853f', warm4: '#e0b866',
  skin1: '#a3674a', skin2: '#d09a72', skin3: '#f0c9a0',
  yerba0: '#3e5a34', yerba1: '#6f9448', tub0: '#2c4a8a', tub1: '#4f7fd0', soft0: '#7a2f38', soft1: '#c05a5e',
  parka: '#b46a26', bone: '#e8e2d0', steel: '#7a8794',
};

// The colors each roommate's sheet is painted with (CHARS in tools/art/gen_roommates.py).
const BODY = {
  michael: { shirt: [P.soft1, P.soft0], skin: [P.skin3, P.skin2], hair: [P.night2, P.night1], pants: [P.night3] },
  trevor:  { shirt: [P.tub1, P.tub0],   skin: [P.skin3, P.skin2], hair: [P.warm2, P.warm1],   pants: [P.night3] },
  manuel:  { shirt: [P.yerba1, P.yerba0], skin: [P.skin2, P.skin1], hair: [P.warm1, P.warm0], pants: [P.night3] },
};

export const LOOKS = {
  'item.rain_parka':  { slot: 'parka', style: 'parka', main: P.warm4, shade: P.warm3, line: P.night0 },   // yellow
  'item.brown_parka': { slot: 'parka', style: 'parka', main: P.parka, shade: P.warm2, line: P.night0 },   // Michael's brown one
};
const LOOK_SLOTS = [...new Set(Object.values(LOOKS).map((l) => l.slot))];

/** The looks a roommate is wearing right now, in draw order. */
export function looksFor(c) {
  return LOOK_SLOTS.map((sl) => c?.equipped?.[sl]).filter((id) => id && LOOKS[id]);
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
    else if (facing === 'up' && is(x, y, skin) && y >= top - 2) put(x, y, shade);   // the neck disappears into it
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

const PAINTERS = { parka: paintParka };

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
    PAINTERS[look.style]?.(src.data, out.data, fw, fh, facing, body, look);
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
