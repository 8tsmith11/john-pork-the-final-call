// Draws an ambient NPC fight from the snapshot (hub #69; rules: src/engine/skirmish.js, spots: src/content/skirmishes.js).
// Host and guests draw the same thing from snap.sk. Walk up to the tape and a trooper tells you to keep moving.
import { VIEW } from '../view.js';
import { getLang } from '../i18n.js';
import { sfx } from '../audio/audio.js';
import { troopTexture } from './cordon.js';
import { skirmishById } from '../content/skirmishes.js';

const LINE_CD = 7000;

export class SkirmishView {
  constructor(scene) { this.s = scene; this.id = null; this.troops = []; this.g = null; this.tape = null; this.over = null; this.nextLine = 0; this.lineIx = 0; }

  _clear() {
    for (const o of [this.g, this.tape, this.mg, this.glow, this.label, ...this.troops]) o?.destroy();
    this.g = this.tape = this.mg = this.glow = this.label = null; this.troops = []; this.id = null; this.over = null;
  }

  _build(sk) {
    const s = this.s; this.id = sk.id; this.mapId = s.map?.id;
    const [x0, y0, x1, y1] = sk.box;
    // Yellow tape around the lot, on short posts.
    this.tape = s.add.graphics().setDepth(3);
    this.tape.lineStyle(1, 0xf2c94c, sk.husk ? 0.35 : 0.9);   // after the Call the tape is old and torn
    const torn = (i) => sk.husk && (i * 7) % 5 < 2;   // gaps where it's been torn down
    for (let x = x0, i = 0; x < x1; x += 8, i++) { if (!torn(i)) this.tape.lineBetween(x, y0, Math.min(x + 5, x1), y0); if (!torn(i + 3)) this.tape.lineBetween(x, y1, Math.min(x + 5, x1), y1); }
    for (let y = y0, i = 0; y < y1; y += 8, i++) { if (!torn(i + 1)) this.tape.lineBetween(x0, y, x0, Math.min(y + 5, y1)); if (!torn(i + 4)) this.tape.lineBetween(x1, y, x1, Math.min(y + 5, y1)); }
    this.tape.fillStyle(0x4a5060, 1);
    for (const [px, py] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) this.tape.fillRect(px - 1, py - 6, 2, 7);
    const spec = skirmishById(sk.id), es = getLang() === 'es';
    if (spec?.label && !sk.husk) this.label = s.add.text(x0 + 4, y0 - 9, (es ? spec.labelEs : spec.label).toUpperCase(), { fontFamily: 'monospace', fontSize: '6px', color: '#f2c94c', backgroundColor: '#15171fcc', padding: { x: 2, y: 1 } }).setDepth(4);
    const art = s.textures.exists('props') && s.textures.get('props').has('npc.trooper_side');
    this.troops = sk.tr.map(([x, y]) => (art ? s.add.image(x, y + 8, 'props', 'npc.trooper_side') : s.add.image(x, y + 7, troopTexture(s))).setOrigin(0.5, 1).setDepth(y + 7));
    this.glow = s.add.graphics().setDepth(2.5);   // the rot's glow on the ground, under everyone (gonman)
    this.mg = s.add.graphics();   // the machine, redrawn each frame (it pulses), y-sorted
    this.g = s.add.graphics().setDepth(6000);   // drones and tracers fly above everything on the ground
  }

  update(snap) {
    const sk = snap?.sk, s = this.s;
    if (!sk || s.map?.id !== this.mapId && this.id) this._clear();
    if (!sk) return;
    if (this.id !== sk.id) this._build(sk);
    const t = s.time.now / 1000, [mx, my, hp, max] = sk.m;
    // The machine: a rotted drone hub. Cracks pulse while it stands; afterwards a black husk that smokes.
    const mg = this.mg.clear().setDepth(my + 8);
    const gl = this.glow.clear();
    if (!sk.over) {   // the rot's glow on the ground, and tendrils out across the yard
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      gl.fillStyle(0x7cff6b, 0.10 + 0.08 * pulse).fillCircle(mx, my, 34 + pulse * 6);
      gl.lineStyle(1, 0x7cff6b, 0.35 + 0.25 * pulse);
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, l = 22 + (i % 3) * 8; gl.lineBetween(mx + Math.cos(a) * 12, my + 6 + Math.sin(a) * 4, mx + Math.cos(a) * l, my + 6 + Math.sin(a) * l * 0.45); }
    }
    mg.fillStyle(0x000000, 0.35).fillEllipse(mx, my + 8, 44, 10);
    mg.fillStyle(sk.over ? 0x1d1f24 : 0x46403a, 1).fillRect(mx - 17, my - 30, 34, 38);   // the hub's cabinet
    mg.fillStyle(sk.over ? 0x15161a : 0x5b5147, 1).fillRect(mx - 19, my - 34, 38, 5);
    mg.fillStyle(0x2a2622, 1).fillRect(mx - 1, my - 48, 2, 14).fillCircle(mx + 8, my - 44, 4).fillRect(mx - 12, my - 42, 2, 8);   // masts and a dish
    for (let i = 0; i < 4; i++) mg.fillStyle(0x15171f, 1).fillRect(mx - 14 + i * 8, my - 26, 6, 4);   // launch bays
    mg.fillStyle(0x15171f, 1).fillRect(mx - 9, my - 16, 18, 14);   // the core window
    if (!sk.over) {
      const pulse = 0.55 + 0.45 * Math.sin(t * 4), hurt = 1 - hp / max;
      mg.fillStyle(0x7cff6b, 0.5 + 0.5 * pulse).fillRect(mx - 7, my - 14, 14, 10);   // the core, lit green
      mg.fillStyle(0xd85bff, pulse).fillRect(mx - 5, my - 11, 3, 3).fillRect(mx + 2, my - 8, 3, 3);
      mg.fillStyle(0x7cff6b, pulse).fillRect(mx - 16, my - 4, 2, 10).fillRect(mx + 14, my - 22, 2, 14).fillRect(mx - 14, my - 28, 6, 1);   // cracks
      for (let i = 0; i < 4; i++) if (Math.sin(t * 6 + i * 2) > 0.3) mg.fillStyle(0xff4d6d, 1).fillRect(mx - 13 + i * 8, my - 25, 2, 2);   // bay lights
      if (hurt > 0.4) mg.fillStyle(0xffb347, 0.5 + 0.5 * Math.sin(t * 13)).fillRect(mx - 16 + ((t * 9) % 30), my - 32, 3, 3);   // sparking as it fails
    } else if (Math.random() < 0.06) this._puff(mx + (Math.random() * 20 - 10), my - 30, 0x3a3d45);
    // Troopers: face their aim; one who's down lies flat until he's back up.
    sk.tr.forEach(([x, y, down, aim], i) => {
      const im = this.troops[i]; if (!im) return;
      im.setFlipX(Math.cos(aim) < 0).setAngle(down ? (Math.cos(aim) < 0 ? 90 : -90) : 0).setAlpha(down ? 0.8 : 1);
    });
    // Drones and tracers.
    const g = this.g.clear();
    for (const [x, y] of sk.dr) {
      const bob = Math.sin(t * 9 + x) * 1.5, yy = y - 14 + bob;
      g.fillStyle(0x000000, 0.25).fillEllipse(x, y + 4, 8, 3);
      g.fillStyle(0x2b2d33, 1).fillRect(x - 4, yy - 2, 8, 4);
      g.fillStyle(0x7cff6b, 0.6 + 0.4 * Math.sin(t * 20 + y)).fillRect(x - 1, yy - 1, 2, 2);
      g.lineStyle(1, 0x9aa3b7, 0.8); const r = (t * 30) % 2 < 1 ? 5 : 3; g.lineBetween(x - r, yy - 3, x + r, yy - 3);
    }
    g.lineStyle(1, 0xffe08a, 0.95);
    for (const [x, y, a] of sk.sh) g.lineBetween(x, y, x - Math.cos(a) * 6, y - Math.sin(a) * 6);
    // The moment the hub falls.
    if (this.over === false && sk.over) {
      const me = snap.players?.find((p) => p.id === s.localId), close = me && Math.hypot(me.x - mx, me.y - my) < 320;
      for (let i = 0; i < 8; i++) this._puff(mx + (Math.random() * 24 - 12), my - 10 - Math.random() * 16, i % 2 ? 0xffb347 : 0x3a3d45);
      if (close) { s.cameras.main.shake(180, 0.004); sfx('kill'); }
    }
    // The sign follows the operation: in progress, then complete once the hub falls (before the Call).
    if (this.label && sk.over !== this.over) { const spec = skirmishById(sk.id), es = getLang() === 'es'; this.label.setText((sk.over ? (es ? spec.labelOverEs : spec.labelOver) : (es ? spec.labelEs : spec.label)).toUpperCase()); }
    this.over = sk.over;
    this._talk(snap, sk);
  }

  _puff(x, y, color) {
    const c = this.s.add.circle(x, y, 3, color, 0.8).setDepth(6001);
    this.s.tweens.add({ targets: c, y: y - 14, scale: 2.4, alpha: 0, duration: 900, onComplete: () => c.destroy() });
  }

  // At the tape, a trooper tells you to keep moving (or, once it's over, that it's over).
  _talk(snap, sk) {
    const s = this.s, me = snap.players?.find((p) => p.id === s.localId);
    if (!me || me.dn || s.time.now < this.nextLine) return;
    const [x0, y0, x1, y1] = sk.box, pad = 28;
    if (me.x < x0 - pad || me.x > x1 + pad || me.y < y0 - pad || me.y > y1 + pad) return;
    if (sk.husk) return;   // nobody left to say anything
    const spec = skirmishById(sk.id), lines = sk.over ? spec?.linesOver : spec?.lines;
    if (!lines?.length) return;
    this.nextLine = s.time.now + LINE_CD;
    const line = lines[this.lineIx++ % lines.length], es = getLang() === 'es';
    this.caption ??= s.add.text(VIEW.w / 2, VIEW.h - 84, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ff6b6b', backgroundColor: '#0b0d16dd', padding: { x: 4, y: 2 }, align: 'center' })
      .setOrigin(0.5, 1).setScrollFactor(0).setDepth(9350);
    s.tweens.killTweensOf(this.caption);
    this.caption.setText(`${es ? 'SOLDADO' : 'TROOPER'}: ${es ? line.es : line.en}`).setAlpha(1).setVisible(true);
    s.tweens.add({ targets: this.caption, alpha: 0, delay: 2600, duration: 500 });
  }
}
