// Procedural placeholder tileset: textured 16x16 tiles generated at boot (seeded, deterministic),
// so maps read as places before Fable's hand-made tiles land. Replace by loading a real tileset
// with the same keys: `tile_<char>`.
import { Rng } from '../../engine/rng.js';
import { TILE_COLORS } from '../../content/maps/build.js';

const hex = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
const css = ([r, g, b], k = 1) => `rgb(${Math.min(255, r * k) | 0},${Math.min(255, g * k) | 0},${Math.min(255, b * k) | 0})`;

const PAINTERS = {
  // wall: dark brick with a lit top edge
  '#': (ctx, base, r) => {
    ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = css(base, 1.35); ctx.fillRect(0, 0, 16, 2);
    ctx.fillStyle = css(base, 0.75);
    for (let y = 4; y < 16; y += 4) { ctx.fillRect(0, y, 16, 1); const off = (y / 4) % 2 ? 0 : 8; ctx.fillRect(off, y - 3, 1, 3); ctx.fillRect(off + 8 > 15 ? off - 8 : off + 8, y - 3, 1, 3); }
  },
  // apartment floor: worn wood planks
  '.': (ctx, base, r) => {
    ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y += 4) {
      ctx.fillStyle = css(base, 0.85 + r.next() * 0.25); ctx.fillRect(0, y, 16, 3);
      ctx.fillStyle = css(base, 0.6); ctx.fillRect(0, y + 3, 16, 1); ctx.fillRect(r.int(2, 13), y, 1, 3);
    }
  },
  // asphalt: speckled
  ',': (ctx, base, r) => { ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16); for (let i = 0; i < 14; i++) { ctx.fillStyle = css(base, r.chance(0.5) ? 1.4 : 0.7); ctx.fillRect(r.int(0, 15), r.int(0, 15), 1, 1); } },
  // tunnel concrete: stained, with seams
  ':': (ctx, base, r) => {
    ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = css(base, 0.8 + r.next() * 0.4); ctx.fillRect(r.int(0, 13), r.int(0, 13), r.int(1, 3), r.int(1, 3)); }
    ctx.fillStyle = css(base, 0.7); ctx.fillRect(15, 0, 1, 16);
  },
  // track: ballast + rails + sleepers
  't': (ctx, base, r) => {
    ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 18; i++) { ctx.fillStyle = css(base, 0.7 + r.next() * 0.6); ctx.fillRect(r.int(0, 15), r.int(0, 15), 1, 1); }
    ctx.fillStyle = 'rgb(70,52,38)'; ctx.fillRect(2, 0, 3, 16); ctx.fillRect(11, 0, 3, 16);
    ctx.fillStyle = 'rgb(150,140,128)'; ctx.fillRect(0, 5, 16, 1); ctx.fillRect(0, 10, 16, 1);
  },
  // kitchen: checkerboard linoleum
  'k': (ctx, base) => { ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16); ctx.fillStyle = css(base, 0.72); ctx.fillRect(0, 0, 8, 8); ctx.fillRect(8, 8, 8, 8); },
  // engineering room: sealed epoxy floor, a few scuffs and a hazard line
  'e': (ctx, base, r) => { ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16); for (let i = 0; i < 4; i++) { ctx.fillStyle = css(base, 1.25); ctx.fillRect(r.int(0, 12), r.int(0, 15), r.int(2, 4), 1); } },
  // bathroom: small square tiles
  'w': (ctx, base) => { ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16); ctx.fillStyle = css(base, 0.75); for (let i = 0; i < 16; i += 4) { ctx.fillRect(i, 0, 1, 16); ctx.fillRect(0, i, 16, 1); } },
  'g': (ctx, base, r) => { ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16); for (let i = 0; i < 20; i++) { ctx.fillStyle = css(base, 0.7 + r.next() * 0.8); ctx.fillRect(r.int(0, 15), r.int(0, 15), 1, r.int(1, 2)); } },
  'b': (ctx, base, r) => { ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16); ctx.fillStyle = css(base, 0.75); ctx.fillRect(0, 7, 16, 1); ctx.fillRect(7, 0, 1, 16); },
  '=': (ctx, base) => { ctx.fillStyle = css(base, 0.6); ctx.fillRect(0, 0, 16, 16); ctx.fillStyle = css(base, 1.3); ctx.fillRect(0, 2, 16, 2); for (let x = 1; x < 16; x += 4) ctx.fillRect(x, 4, 1, 12); },
  '|': (ctx, base) => { ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16); ctx.fillStyle = css(base, 1.4); ctx.fillRect(3, 0, 2, 16); ctx.fillStyle = css(base, 0.6); ctx.fillRect(12, 0, 2, 16); },
  '~': (ctx, base, r) => { ctx.fillStyle = css(base); ctx.fillRect(0, 0, 16, 16); ctx.fillStyle = css(base, 1.5); for (let i = 0; i < 3; i++) ctx.fillRect(r.int(0, 10), r.int(0, 15), 5, 1); },
};

export const VARIANTS = 4;

/** Create textures tile_<char>_<v> for every map char (call once in BootScene). */
export function makeTiles(scene) {
  for (const [ch, color] of Object.entries(TILE_COLORS)) {
    for (let v = 0; v < VARIANTS; v++) {
      const key = `tile_${ch.charCodeAt(0)}_${v}`;
      if (scene.textures.exists(key)) continue;
      const tex = scene.textures.createCanvas(key, 16, 16);
      (PAINTERS[ch] ?? PAINTERS[','])(tex.getContext(), hex(color), new Rng(`${ch}-${v}`));
      tex.refresh();
    }
  }
  // soft light sprite for the lighting pass
  if (!scene.textures.exists('light')) {
    const L = scene.textures.createCanvas('light', 128, 128), c = L.getContext();
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128); L.refresh();
  }
}

export function tileKey(ch, tx, ty) {
  return `tile_${ch.charCodeAt(0)}_${((tx * 7 + ty * 13) & 0xffff) % VARIANTS}`;
}
