// Draws the College Park fight from the snapshot (hub #69; rules: src/engine/skirmish.js, spots: src/content/skirmishes.js).
// The rotted drone hub walks on four jointed legs (the gait follows how far it has walked), rises before it stomps
// (the ring on the ground is where not to be), and launches drones. The squad moves with it and fires tracers. Once it
// falls, the husk lies where it fell, legs folded. Host and guests draw the same thing from snap.sk.
import { VIEW } from '../view.js';
import { getLang } from '../i18n.js';
import { sfx } from '../audio/audio.js';
import { troopTexture } from './cordon.js';
import { skirmishById } from '../content/skirmishes.js';
import { SK } from '../engine/skirmish.js';

const LINE_CD = 7000;

export class SkirmishView {
  constructor(scene) { this.s = scene; this.id = null; this.troops = []; this.over = null; this.nextLine = 0; this.lineIx = 0; }

  _clear() {
    for (const o of [this.g, this.mg, this.glow, this.ring, this.sign, this.label, this.bar, ...this.troops]) o?.destroy();
    this.g = this.mg = this.glow = this.ring = this.sign = this.label = this.bar = null; this.troops = []; this.id = null; this.over = null;
  }

  _build(sk) {
    const s = this.s; this.id = sk.id; this.mapId = s.map?.id;
    const spec = skirmishById(sk.id), es = getLang() === 'es';
    // A cordon sign where the operation started, instead of a taped box: the fight goes where the hub goes.
    if (spec?.label && !sk.husk) {
      const [hx, hy] = sk.home;
      this.sign = s.add.graphics().setDepth(hy - 20);
      this.sign.fillStyle(0x4a5060, 1).fillRect(hx - 30, hy - 30, 2, 12).fillRect(hx + 2, hy - 30, 2, 12);
      this.sign.fillStyle(0xf2c94c, 1).fillRect(hx - 32, hy - 36, 38, 8);
      this.label = s.add.text(hx - 13, hy - 32, (es ? spec.labelEs : spec.label).toUpperCase(), { fontFamily: 'monospace', fontSize: '5px', color: '#15171f' }).setOrigin(0.5).setDepth(hy - 19);
    }
    const art = s.textures.exists('props') && s.textures.get('props').has('npc.trooper_side');
    this.troops = sk.tr.map(([x, y]) => (art ? s.add.image(x, y + 8, 'props', 'npc.trooper_side') : s.add.image(x, y + 7, troopTexture(s))).setOrigin(0.5, 1).setDepth(y + 7));
    this.glow = s.add.graphics().setDepth(2.5);   // the rot's glow on the ground, under everyone (gonman)
    this.ring = s.add.graphics().setDepth(3);     // the stomp warning
    this.mg = s.add.graphics();                    // the hub, redrawn each frame, y-sorted
    this.g = s.add.graphics().setDepth(6000);      // drones and tracers fly above everything on the ground
    this.bar = s.add.graphics().setDepth(6400);
  }

  /** A kill by the squad: a small burst. */
  onKill(ev) {
    for (let i = 0; i < 5; i++) this._spark(ev.x + (Math.random() * 8 - 4), ev.y - 12 - Math.random() * 6, Math.random() < 0.5 ? 0x7cff6b : 0x9aa3b7);
  }

  update(snap) {
    const sk = snap?.sk, s = this.s;
    if (!sk || s.map?.id !== this.mapId && this.id) this._clear();
    if (!sk) return;
    if (this.id !== sk.id) this._build(sk);
    const t = s.time.now / 1000, [mx, my, hp, max, leg, st, face, hurt] = sk.m;
    const me = snap.players?.find((p) => p.id === s.localId);
    const gl = this.glow.clear(), ring = this.ring.clear(), mg = this.mg.clear().setDepth(my + 10);
    if (!sk.over) {   // the rot's glow follows it
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      gl.fillStyle(0x7cff6b, 0.08 + 0.06 * pulse).fillCircle(mx, my, 30 + pulse * 6);
    }
    if (st === 2) {   // rising to stomp: the ring it will hit
      const k = 0.5 + 0.5 * Math.sin(t * 18);
      ring.fillStyle(0xff4d4d, 0.10 + 0.08 * k).fillCircle(mx, my, SK.stomp.r);
      ring.lineStyle(1, 0xff4d4d, 0.7 + 0.3 * k).strokeCircle(mx, my, SK.stomp.r);
    }
    this._drawHub(mg, mx, my, { over: sk.over, leg, st, face, hurt, frac: max ? hp / max : 0, t });
    // HP over it while it stands and someone is near (it's a fight you can join, so show how it's going).
    const bar = this.bar.clear();
    if (!sk.over && me && Math.hypot(me.x - mx, me.y - my) < 220) {
      bar.fillStyle(0x15171f, 0.9).fillRect(mx - 20, my - 66, 40, 4);
      bar.fillStyle(hp / max < 0.3 ? 0xff6b6b : 0x7cff6b, 1).fillRect(mx - 19, my - 65, 38 * (hp / max), 2);
    }
    // Troopers: face their aim, bob as they move; one who's down lies flat until he's back up.
    sk.tr.forEach(([x, y, down, aim, moving], i) => {
      const im = this.troops[i]; if (!im) return;
      const bob = moving ? Math.abs(Math.sin(t * 10 + i)) * 1.5 : 0;
      im.setPosition(x, y + 8 - bob).setDepth(y + 7).setFlipX(Math.cos(aim) < 0).setAngle(down ? (Math.cos(aim) < 0 ? 90 : -90) : 0).setAlpha(down ? 0.8 : 1);
    });
    // Drones and tracers.
    const g = this.g.clear();
    for (const [x, y, h] of sk.dr) {
      const bob = Math.sin(t * 9 + x) * 1.5, yy = y - 12 + bob;
      g.fillStyle(0x000000, 0.25).fillEllipse(x, y + 2, 8, 3);
      g.fillStyle(h ? 0xffffff : 0x2b2d33, 1).fillRect(x - 4, yy - 2, 8, 4);
      g.fillStyle(0x7cff6b, 0.6 + 0.4 * Math.sin(t * 20 + y)).fillRect(x - 1, yy - 1, 2, 2);
      g.fillStyle(0xd85bff, 0.8).fillRect(x + 2, yy, 1, 1);   // a rot fleck
      g.lineStyle(1, 0x9aa3b7, 0.8); const r = (t * 30) % 2 < 1 ? 5 : 3; g.lineBetween(x - r, yy - 3, x + r, yy - 3);
    }
    g.lineStyle(1, 0xffe08a, 0.95);
    for (const [x, y, a] of sk.sh) g.lineBetween(x, y, x - Math.cos(a) * 7, y - Math.sin(a) * 7);
    // The moment it falls.
    if (this.over === false && sk.over) {
      const close = me && Math.hypot(me.x - mx, me.y - my) < 320;
      for (let i = 0; i < 10; i++) this._puff(mx + (Math.random() * 28 - 14), my - 14 - Math.random() * 18, i % 2 ? 0xffb347 : 0x3a3d45);
      if (close) { s.cameras.main.shake(220, 0.006); sfx('kill'); }
    } else if (sk.over && Math.random() < 0.05) this._puff(mx + (Math.random() * 20 - 10), my - 20, 0x3a3d45);
    if (this.label && sk.over !== this.over) { const spec = skirmishById(sk.id), es = getLang() === 'es'; this.label.setText((sk.over ? (es ? spec.labelOverEs : spec.labelOver) : (es ? spec.labelEs : spec.label)).toUpperCase()); }
    this.over = sk.over;
    for (const ev of snap.events ?? []) {
      if (ev.t === 'skStomp') {   // the slam: a shockwave, and the ground shakes if you're close
        const w = s.add.circle(ev.x, ev.y, 6, 0xffe08a, 0).setStrokeStyle(2, 0xffe08a, 0.9).setDepth(5600);
        s.tweens.add({ targets: w, radius: ev.r, alpha: 0, duration: 320, onComplete: () => w.destroy() });
        for (let i = 0; i < 6; i++) this._puff(ev.x + Math.cos(i) * ev.r * 0.7, ev.y + Math.sin(i) * ev.r * 0.4, 0x6b6248);
        if (me && Math.hypot(me.x - ev.x, me.y - ev.y) < 200) { s.cameras.main.shake(160, 0.008); sfx('hit'); }
      }
    }
    this._talk(snap, sk);
  }

  // The hub on its legs. Four legs, jointed at the knee, stepping in diagonal pairs as it walks; folded under the
  // husk once it's down.
  _drawHub(mg, mx, my, { over, leg, st, face, hurt, frac, t }) {
    const ph = leg / 7, rise = st === 2 ? 6 + Math.sin(t * 30) : 0;
    const by = over ? my - 8 : my - 20 - rise + Math.abs(Math.sin(ph * 2)) * 1.2;   // the body's bottom edge
    mg.fillStyle(0x000000, 0.35).fillEllipse(mx, my + 2, 46, 10);
    const legs = [[-15, -1, 0], [15, -1, Math.PI], [-11, 1, Math.PI], [11, 1, 0]];   // hip x, front(1)/back(-1), gait offset
    for (const [hx, depth, off] of legs) {
      const side = Math.sign(hx);
      const hip = { x: mx + hx * 0.8, y: by - 2 };
      let foot, knee;
      if (over) {
        foot = { x: mx + hx * 1.5, y: my + depth };
        knee = { x: mx + hx * 1.4, y: by - 4 };
      } else {
        const swing = Math.sin(ph + off) * 5 * face, lift = Math.max(0, Math.cos(ph + off)) * 3;
        foot = { x: mx + hx * 1.35 + swing, y: my + depth * 2 - lift };
        knee = { x: (hip.x + foot.x) / 2 + side * 7, y: Math.min(hip.y, foot.y) - 5 - lift * 0.5 - rise * 0.3 };
      }
      const c = depth < 0 ? 0x2a2622 : 0x3a332c;
      mg.lineStyle(3, c, 1).lineBetween(hip.x, hip.y, knee.x, knee.y).lineBetween(knee.x, knee.y, foot.x, foot.y);
      mg.fillStyle(0x5b5147, 1).fillCircle(knee.x, knee.y, 2);
      mg.fillStyle(0x15171f, 1).fillRect(foot.x - 3, foot.y - 1, 6, 2);   // a foot pad
      if (!over) mg.lineStyle(1, 0x7cff6b, 0.6).lineBetween(hip.x, hip.y + 1, knee.x, knee.y + 1);   // rot growing along the strut
    }
    // The cabinet.
    const top = by - 32;
    mg.fillStyle(over ? 0x1d1f24 : 0x46403a, 1).fillRect(mx - 17, top, 34, 32);
    mg.fillStyle(over ? 0x15161a : 0x5b5147, 1).fillRect(mx - 19, top - 4, 38, 5);
    mg.fillStyle(0x2a2622, 1).fillRect(mx - 1 * face, top - 16, 2, 12).fillCircle(mx + 8 * face, top - 12, 4).fillRect(mx - 12 * face, top - 10, 2, 7);   // masts and a dish
    for (let i = 0; i < 4; i++) mg.fillStyle(0x15171f, 1).fillRect(mx - 14 + i * 8, top + 4, 6, 4);   // launch bays
    mg.fillStyle(0x15171f, 1).fillRect(mx - 9, top + 14, 18, 13);   // the core window
    if (over) return;
    const pulse = 0.55 + 0.45 * Math.sin(t * 4);
    mg.fillStyle(hurt ? 0xffffff : 0x7cff6b, 0.5 + 0.5 * pulse).fillRect(mx - 7, top + 16, 14, 9);   // the core, lit green (white when hit)
    mg.fillStyle(0xd85bff, pulse).fillRect(mx - 5, top + 18, 3, 3).fillRect(mx + 2, top + 21, 3, 3);
    mg.fillStyle(0x7cff6b, pulse).fillRect(mx - 16, top + 24, 2, 8).fillRect(mx + 14, top + 8, 2, 14);   // cracks
    for (let i = 0; i < 4; i++) if (Math.sin(t * 6 + i * 2) > 0.3) mg.fillStyle(st === 2 ? 0xff4d4d : 0xff4d6d, 1).fillRect(mx - 13 + i * 8, top + 5, 2, 2);   // bay lights
    if (frac < 0.6) mg.fillStyle(0xffb347, 0.5 + 0.5 * Math.sin(t * 13)).fillRect(mx - 16 + ((t * 9) % 30), top - 2, 3, 3);   // sparking as it fails
    if (frac < 0.3 && Math.random() < 0.08) this._puff(mx + (Math.random() * 20 - 10), top, 0x3a3d45);
  }

  _puff(x, y, color) {
    const c = this.s.add.circle(x, y, 3, color, 0.8).setDepth(6001);
    this.s.tweens.add({ targets: c, y: y - 14, scale: 2.4, alpha: 0, duration: 900, onComplete: () => c.destroy() });
  }

  _spark(x, y, color) {
    const c = this.s.add.rectangle(x, y, 2, 2, color).setDepth(6001);
    this.s.tweens.add({ targets: c, y: y - 8 - Math.random() * 6, x: x + (Math.random() * 8 - 4), alpha: 0, duration: 350, onComplete: () => c.destroy() });
  }

  // Close to the squad, a trooper calls out (or, once it's over, says it's over).
  _talk(snap, sk) {
    const s = this.s, me = snap.players?.find((p) => p.id === s.localId);
    if (!me || me.dn || s.time.now < this.nextLine || sk.husk || s.time.now < (s._edgeLineUntil ?? 0)) return;   // one voice at a time (the cordon shares the caption)
    if (!sk.tr.some(([x, y]) => Math.hypot(x - me.x, y - me.y) < 60)) return;
    const spec = skirmishById(sk.id), lines = sk.over ? spec?.linesOver : spec?.lines;
    if (!lines?.length) return;
    this.nextLine = s.time.now + LINE_CD;
    const line = lines[this.lineIx++ % lines.length], es = getLang() === 'es';
    this.caption = s._edgeCaption ??= s.add.text(VIEW.w / 2, VIEW.h - 84, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ff6b6b', backgroundColor: '#0b0d16dd', padding: { x: 4, y: 2 }, align: 'center' })
      .setOrigin(0.5, 1).setScrollFactor(0).setDepth(9350);
    s.tweens.killTweensOf(this.caption);
    this.caption.setText(`${es ? 'SOLDADO' : 'TROOPER'}: ${es ? line.es : line.en}`).setAlpha(1).setVisible(true);
    s.tweens.add({ targets: this.caption, alpha: 0, delay: 2600, duration: 500 });
    s._edgeLineUntil = s.time.now + 3100;
  }
}
