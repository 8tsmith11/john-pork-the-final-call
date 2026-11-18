// Ambient crowd: cosmetic pedestrians that make places feel alive. Generated per map from the world
// seed (so co-op players see the same people), simulated locally, never story-critical.
import { Rng } from '../engine/rng.js';
import { TILE } from '../engine/sim.js';

const SKIN = ['#f1c9a5', '#e0ac85', '#c68863', '#8d5a3b', '#5c3a26', '#f5d7c0'];
const HAIR = ['#1a1a22', '#3a2416', '#6b4a2e', '#b08850', '#d8d0c0', '#2c2c3a', '#7a2f2f'];
const COAT = ['#3b4a6b', '#5a3d5c', '#2f4a3a', '#6b5a3a', '#4a4a52', '#7a3b3b', '#2b3f55', '#55606e', '#8a6f3a'];
const UMBRELLA = ['#2b3f55', '#7a3b3b', '#1f1f28', '#4a6b3b', '#d8a040'];

const FIRST = ['Dana', 'Marcus', 'Yuki', 'Rosa', 'Tobi', 'Imani', 'Greg', 'Priya', 'Luis', 'Hannah', 'Wen', 'Andre', 'Sofia', 'Kofi', 'Mira', 'Desmond',
  'Lena', 'Omar', 'Bea', 'Raj', 'Carmen', 'Theo', 'Nadia', 'Jules', 'Ade', 'Ines', 'Sam', 'Kenji', 'Fatima', 'Vic'];
const LAST = ['Okafor', 'Reyes-Hart', 'Kowalski', 'Nguyen', 'Brennan', 'Haddad', 'Moreau', 'Pak', 'Silva', 'Adeyemi', 'Lindqvist', 'Castro', 'Oyelaran', 'Fitch'];


const LINES = {
  any: [
    'Trains are twenty minutes out, the board says. The board said that forty minutes ago.',
    'Don\'t stand under the awning. The abatement guys spray at nine.',
    'My lace keeps showing me ads for a dentist I\'ve never been to.',
    'You\'re from ASTER? My cousin lived there. Sixth floor. She moved out after the ceiling thing.',
    'If you\'re going north on Route 1, don\'t. Just don\'t.',
    'They said the Purple Line opens soon. My grandma said that.',
    'Got a light? No? Nobody has a light anymore.',
    'I\'m not crying, the rain\'s just warm today.',
    'Heard drumming under the street last night. Three hits, then nothing.',
    'Scan says I\'m "provisionally attested." Provisionally. Like I might stop being a person.',
    'You want a lace patch? Unofficial. Works better than the official one. Mostly.',
    'Somebody keyed JUSTICE FOR JOHN PORK into the bus shelter again. They keep painting over it.',
  ],
  shell: [
    'Attested and available. Please step around me.',
    'I\'m on shift. I can\'t talk. I\'d like to.',
    'This unit delivers groceries. This unit does not know where the balloon went.',
  ],
  aster_hall: [
    'Keep it down. Some of us have 245 lab in the morning.',
    'Was that you guys at three a.m.? Somebody was walking around out here.',
    'The bathroom\'s been occupied since Tuesday. I\'ve stopped asking.',
  ],
};

function makeSprite(scene, key, r) {
  if (scene.textures.exists(key)) return;
  const shell = r.chance(0.14), umbrella = !shell && r.chance(0.35), lace = !shell && r.chance(0.3);
  const skin = shell ? '#d9dde3' : r.pick(SKIN), hair = r.pick(HAIR), coat = r.pick(COAT), legs = r.pick(['#1f1f28', '#2c3340', '#3a3030']);
  const tex = scene.textures.createCanvas(key, 32, 24), c = tex.getContext();
  for (let f = 0; f < 2; f++) {
    const x0 = f * 16, bob = f;
    c.fillStyle = legs; c.fillRect(x0 + 5, 18, 2, 5 - bob); c.fillRect(x0 + 9, 18, 2, 5 - (1 - bob));
    c.fillStyle = coat; c.fillRect(x0 + 4, 9 + bob, 8, 10);
    c.fillStyle = skin; c.fillRect(x0 + 5, 3 + bob, 6, 6);
    c.fillStyle = hair; c.fillRect(x0 + 5, 2 + bob, 6, r.chance(0.5) ? 2 : 3);
    c.fillStyle = '#111'; c.fillRect(x0 + 6, 5 + bob, 1, 1); c.fillRect(x0 + 9, 5 + bob, 1, 1);
    if (shell) { c.fillStyle = '#6ff2ff'; c.fillRect(x0 + 6, 9 + bob, 4, 1); }          // attestation glyph at the collar
    if (lace) { c.fillStyle = '#d65db1'; c.fillRect(x0 + 10, 4 + bob, 1, 1); }          // lace implant glow
    if (umbrella) { c.fillStyle = r.pick(UMBRELLA); c.fillRect(x0 + 1, 0, 14, 2); c.fillRect(x0 + 3, -1 + 1, 10, 1); c.fillStyle = '#222'; c.fillRect(x0 + 12, 2, 1, 9); }
  }
  tex.add('f0', 0, 0, 0, 16, 24); tex.add('f1', 0, 16, 0, 16, 24); tex.refresh();
  return { shell };
}

const PIXEL_LINES = [
  'People keep squinting at me. Is there something on my face?',
  'I had my photo taken for the attestation office. They sent it back. Twice.',
  'My mother says I look just like my father. I don\'t know how she can tell.',
  'You\'re staring. It\'s fine. Everyone does. Nobody says why.',
];

// Replace a generated sprite sheet with a blocky mosaic of itself (works in Canvas and WebGL).
function mosaic(scene, key, size) {
  const tex = scene.textures.get(key);
  const canvas = tex?.getSourceImage?.();
  const ctx = canvas?.getContext?.('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let by = 0; by < h; by += size) for (let bx = 0; bx < w; bx += size) {
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let y = by; y < Math.min(h, by + size); y++) for (let x = bx; x < Math.min(w, bx + size); x++) {
      const i = (y * w + x) * 4; if (d[i + 3] > 0) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } a += d[i + 3];
    }
    const cells = Math.min(h, by + size) - by, cols = Math.min(w, bx + size) - bx, solid = n * 2 >= cells * cols;
    for (let y = by; y < by + cells; y++) for (let x = bx; x < bx + cols; x++) {
      const i = (y * w + x) * 4;
      if (solid) { d[i] = r / n; d[i + 1] = g / n; d[i + 2] = b / n; d[i + 3] = 255; } else d[i + 3] = 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  tex.refresh?.();
}

export class Crowd {
  // Placement is authored per map (map.crowd), never scattered randomly:
  //   { mode: 'walk', path: [[x,y],[x,y],...], n }   people walking a route back and forth
  //   { mode: 'wait', at: [x,y], n, face: [x,y] }     a queue or a cluster waiting for something
  //   { mode: 'talk', at: [x,y] }                     two people facing each other, chatting
  constructor(scene, map, seed) {
    this.scene = scene; this.map = map; this.people = [];
    const specs = map.crowd || [];
    if (!specs.length) return;
    const r = new Rng(`${seed}::crowd::${map.id}`);
    let i = 0;
    const spawn = (tx, ty, mode, extra = {}) => {
      const key = `crowd_${seed}_${map.id}_${i++}`;
      const info = makeSprite(scene, key, new Rng(key)) ?? { shell: false };
      // Easter egg (docs/SECRETS.md): the fourth person on the plaza is permanently pixelated. It
      // looks like rot. It isn't, and nobody explains it. Keep this when reworking the crowd.
      const pixel = map.id === 'metro_plaza' && i === 4;
      if (pixel) { mosaic(scene, key, 4); info.shell = false; }
      const spr = scene.add.sprite(tx * TILE + 8, ty * TILE + 8, key, 'f0').setOrigin(0.5, 1);
      const name = info.shell ? `Unit ${r.pick(['CR', 'DL', 'AB', 'MX', 'HN'])}-${r.int(100, 999)}` : `${r.pick(FIRST)} ${r.pick(LAST)}`;
      const p = { name, spr, x: tx * TILE + 8, y: ty * TILE + 8, mode, shell: info.shell, pixel, speed: 16 + r.next() * 10, t: r.next() * 3, r: new Rng(`${key}-ai`), ...extra };
      this.people.push(p); return p;
    };
    for (const sp of specs) {
      if (sp.mode === 'walk') {
        for (let k = 0; k < (sp.n ?? 1); k++) {
          const leg = r.int(0, sp.path.length - 2), f = r.next();
          const [ax, ay] = sp.path[leg], [bx, by] = sp.path[leg + 1];
          spawn(ax + (bx - ax) * f, ay + (by - ay) * f + (k % 2 ? 0.6 : 0), 'walk', { path: sp.path, leg: leg + 1, dir: r.chance(0.5) ? 1 : -1 });
        }
      } else if (sp.mode === 'wait') {
        for (let k = 0; k < (sp.n ?? 1); k++) spawn(sp.at[0] + k * 0.9, sp.at[1] + (k % 2) * 0.3, 'wait', { face: sp.face });
      } else if (sp.mode === 'talk') {
        const a = spawn(sp.at[0], sp.at[1], 'talk'), b = spawn(sp.at[0] + 1.2, sp.at[1], 'talk');
        a.spr.setFlipX(false); b.spr.setFlipX(true);
      }
    }
  }

  update(dt) {
    for (const p of this.people) {
      p.t -= dt;
      if (p.mode === 'walk' && p.path) {
        const [tx, ty] = p.path[p.leg], gx = tx * TILE + 8, gy = ty * TILE + 8;
        const d = Math.hypot(gx - p.x, gy - p.y);
        if (d < 2) {                                   // reached a waypoint: continue, turning at the ends
          if (p.leg + p.dir < 0 || p.leg + p.dir >= p.path.length) p.dir *= -1;
          p.leg += p.dir;
        } else {
          p.x += ((gx - p.x) / d) * p.speed * dt; p.y += ((gy - p.y) / d) * p.speed * dt;
          p.spr.setFlipX(gx < p.x);
        }
        p.spr.setFrame(Math.floor(this.scene.time.now / 200 + p.speed) % 2 ? 'f1' : 'f0');
      } else {
        p.spr.setFrame('f0');
        if (p.mode === 'wait' && p.face) p.spr.setFlipX(p.face[0] * TILE < p.x);
        if (p.mode === 'talk') p.spr.setY(Math.round(p.y + 4 - (Math.sin(this.scene.time.now / 300 + p.x) > 0.7 ? 1 : 0)));
      }
      if (p.mode !== 'talk') p.spr.setPosition(Math.round(p.x), Math.round(p.y + 4));
      p.spr.setDepth(p.y);
    }
  }

  nearest(x, y, reach = 20) {
    let best = null, bd = reach;
    for (const p of this.people) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
    return best;
  }

  lineFor(p) {
    if (p.pixel) return p.r.pick(PIXEL_LINES);
    const pool = p.shell ? LINES.shell : (LINES[this.map.id] ?? LINES.any);
    return p.r.pick(pool);
  }

  destroy() { for (const p of this.people) p.spr.destroy(); this.people = []; }
}
