// Draws the quarantine cordon (src/content/cordon.js) and turns players back at the map edge.
// Cosmetic and local: troopers, barriers, booths, floodlights and signs use gonman's props frames (task #37;
// the code-drawn shapes stay as a fallback), plus a chain-link fence along the tree line of maps with `cordon: true`.
// Walking into the edge band makes the nearest trooper say a line (no dialogue box, nothing pauses).
import { CORDON_LINES } from '../content/cordon.js';
import { getLang } from '../i18n.js';
import { VIEW } from '../view.js';

const TILE = 16, BAND = 4, COOLDOWN = 6000;

function troopTexture(scene) {
  if (scene.textures.exists('cordon_trooper')) return 'cordon_trooper';
  const g = scene.make.graphics({ add: false });
  const px = (x, y, w, h, c) => g.fillStyle(c, 1).fillRect(x, y, w, h);
  px(5, 22, 3, 2, 0x111318); px(9, 22, 3, 2, 0x111318);                 // boots
  px(5, 15, 3, 7, 0x2a2f3d); px(9, 15, 3, 7, 0x2a2f3d);                 // legs
  px(4, 8, 9, 8, 0x3a4152); px(4, 9, 2, 3, 0xd23a3a);                   // body armour, red shoulder stripe
  px(3, 11, 11, 2, 0x15171f);                                           // rifle across the chest
  px(5, 2, 7, 6, 0x2a2f3d); px(6, 4, 5, 2, 0x6fe3e8);                   // helmet and lit visor
  g.generateTexture('cordon_trooper', 16, 24); g.destroy();
  return 'cordon_trooper';
}

export class Cordon {
  constructor(scene) { this.s = scene; this.mapId = null; this.objs = []; this.troopers = []; this.nextLine = 0; this.lineIx = 0; }

  _build() {
    const s = this.s, map = s.map;
    for (const o of this.objs) o.destroy();
    this.objs = []; this.troopers = []; this.mapId = map?.id;
    const parts = (map?.objects ?? []).filter((o) => o.cordon);
    if (!map?.cordon && !parts.length) return;
    const g = s.add.graphics().setDepth(2); this.objs.push(g);
    const sheet = s.textures.exists('props') ? s.textures.get('props') : null, art = (f) => !!sheet?.has(f);
    // Chain-link fence just inside the tree line, broken where the barriers and openings are.
    if (map.cordon) {
      const W = map.w * TILE, H = map.h * TILE, y0 = TILE + 2, y1 = H - TILE - 2, x0 = TILE + 2, x1 = W - TILE - 2;
      const skip = (tx, ty) => map.layout[ty]?.[tx] === '=' || (map.cordonOpenings ?? []).some(([ox, oy, ow, oh]) => tx >= ox - 1 && tx < ox + ow + 1 && ty >= oy - 1 && ty < oy + oh + 1);
      g.lineStyle(1, 0x8a93a8, 0.55);
      for (let x = x0; x < x1; x += 4) { if (!skip(Math.floor(x / TILE), 1)) g.lineBetween(x, y0 - 6, x + 4, y0); if (!skip(Math.floor(x / TILE), map.h - 2)) g.lineBetween(x, y1 - 6, x + 4, y1); }
      for (let y = y0; y < y1; y += 4) { if (!skip(1, Math.floor(y / TILE))) g.lineBetween(x0, y, x0 + 3, y + 4); if (!skip(map.w - 2, Math.floor(y / TILE))) g.lineBetween(x1, y, x1 - 3, y + 4); }
      g.fillStyle(0x5a6274, 1);
      for (let x = x0; x < x1; x += TILE) { g.fillRect(x, y0 - 8, 1, 8); g.fillRect(x, y1 - 8, 1, 8); }
      for (let y = y0; y < y1; y += TILE) { g.fillRect(x0, y - 8, 1, 8); g.fillRect(x1, y - 8, 1, 8); }
    }
    // Barriers: red-and-white jersey blocks on the solid '=' tiles of a checkpoint.
    for (let ty = 0; ty < map.h; ty++) for (let tx = 0; tx < map.w; tx++) {
      if (map.layout[ty][tx] !== '=' || !map.cordon) continue;
      const x = tx * TILE, y = ty * TILE;
      if (art('obj.barrier')) { this.objs.push(s.add.image(x + 8, y + TILE, 'props', 'obj.barrier').setOrigin(0.5, 1).setDepth(y + TILE - 2)); continue; }
      g.fillStyle(0xd8d8de, 1).fillRect(x + 1, y + 5, 14, 9);
      g.fillStyle(0xd23a3a, 1).fillRect(x + 1, y + 5, 4, 9).fillRect(x + 9, y + 5, 4, 9);
      g.fillStyle(0x000000, 0.3).fillRect(x + 1, y + 13, 14, 2);
    }
    for (const o of parts) {
      const x = o.x * TILE, y = o.y * TILE;
      const frame = { light: 'obj.floodlight', booth: 'obj.cordon_booth', sign: 'obj.cordon_sign' }[o.cordon];
      if (frame && art(frame)) {   // gonman's sprites (task #37); the floodlight keeps its sweeping cone
        this.objs.push(s.add.image(x + 8, y + TILE, 'props', frame).setOrigin(0.5, 1).setDepth(y + TILE - 2));
        if (o.cordon === 'light') {
          const cone = s.add.triangle(x + 8, y - 6, 0, 0, -18, 34, 18, 34, 0xfff3c4, 0.08).setOrigin(0, 0).setDepth(3);
          s.tweens.add({ targets: cone, angle: { from: -25, to: 25 }, duration: 3000 + (o.x * 37) % 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
          this.objs.push(cone);
        }
        continue;
      }
      if (o.cordon === 'light') {
        g.fillStyle(0x4a5060, 1).fillRect(x + 7, y - 10, 2, 24); g.fillStyle(0xfff3c4, 1).fillRect(x + 4, y - 12, 8, 3);
        const cone = s.add.triangle(x + 8, y - 10, 0, 0, -18, 34, 18, 34, 0xfff3c4, 0.08).setOrigin(0, 0).setDepth(3);
        s.tweens.add({ targets: cone, angle: { from: -25, to: 25 }, duration: 3000 + (o.x * 37) % 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.objs.push(cone);
      } else if (o.cordon === 'booth') {
        g.fillStyle(0xe8e8ee, 1).fillRect(x + 1, y - 8, 14, 22); g.fillStyle(0x6fe3e8, 0.8).fillRect(x + 3, y - 5, 10, 6);
        g.fillStyle(0xd23a3a, 1).fillRect(x + 1, y - 9, 14, 2);
      } else if (o.cordon === 'sign') {
        g.fillStyle(0x4a5060, 1).fillRect(x + 7, y + 4, 2, 10); g.fillStyle(0xf2c94c, 1).fillRect(x + 1, y - 2, 14, 8);
        g.fillStyle(0x15171f, 1).fillRect(x + 3, y, 10, 1).fillRect(x + 3, y + 2, 7, 1);
      } else if (o.cordon === 'trooper') {
        const tf = o.face === 'up' ? 'npc.trooper_back' : o.face === 'left' || o.face === 'right' ? 'npc.trooper_side' : 'npc.trooper';
        const im = (art(tf) ? s.add.image(x + 8, y + TILE, 'props', tf) : s.add.image(x + 8, y + 15, troopTexture(s))).setOrigin(0.5, 1).setDepth(y + 15).setFlipX(o.face === 'left');
        s.tweens.add({ targets: im, scaleY: { from: 1, to: 0.97 }, duration: 1600 + (o.x * 53) % 600, yoyo: true, repeat: -1 });
        this.objs.push(im); this.troopers.push(im);
      }
    }
  }

  update(snap) {
    const s = this.s, map = s.map;
    if (!map) return;
    if (map.id !== this.mapId) this._build();
    if (!map.cordon || !this.troopers.length) return;
    const me = snap?.players?.find((p) => p.id === s.localId);
    if (!me || me.dn || s.time.now < this.nextLine) return;
    const tx = Math.floor(me.x / TILE), ty = Math.floor(me.y / TILE);
    const nearEdge = tx < BAND || ty < BAND || tx >= map.w - BAND || ty >= map.h - BAND;
    const open = (map.cordonOpenings ?? []).some(([ox, oy, ow, oh]) => Math.abs(tx - (ox + ow / 2)) <= BAND + 1 && Math.abs(ty - (oy + oh / 2)) <= BAND + 1);
    if (!nearEdge || open) return;
    const line = CORDON_LINES[this.lineIx++ % CORDON_LINES.length];
    this.nextLine = s.time.now + COOLDOWN;
    const text = getLang() === 'es' ? line.es : line.en;
    // Shown over you, not over the trooper: the posts sit at the screen's edge, under the HUD. A trooper
    // close by says it; farther out it comes over the loudspeakers.
    const t = this.troopers.reduce((a, b) => (Math.hypot(b.x - me.x, b.y - me.y) < Math.hypot(a.x - me.x, a.y - me.y) ? b : a));
    const who = Math.hypot(t.x - me.x, t.y - me.y) < 140 ? (getLang() === 'es' ? 'SOLDADO' : 'TROOPER') : (getLang() === 'es' ? 'ALTAVOZ' : 'LOUDSPEAKER');
    // A screen-fixed caption above the hotbar: at the map edge the camera stops, so anything over a head
    // would sit under the HUD.
    this.caption ??= s.add.text(VIEW.w / 2, VIEW.h - 84, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ff6b6b', backgroundColor: '#0b0d16dd', padding: { x: 4, y: 2 }, align: 'center' })
      .setOrigin(0.5, 1).setScrollFactor(0).setDepth(9350);
    s.tweens.killTweensOf(this.caption);
    this.caption.setText(`${who}: ${text}`).setAlpha(1).setVisible(true);
    s.tweens.add({ targets: this.caption, alpha: 0, delay: 2600, duration: 500 });
  }
}
