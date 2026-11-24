// Draws a held cordon line from the snapshot (rules: src/engine/siege.js, posts: PLAZA_SIEGE in src/content/cordon.js):
// auto turrets whose barrels track and flash, riot robots with shields that lunge when they shove, the extra troopers
// on the line, tracers, and a small burst when something in a pen goes down. Cosmetic; the host owns the fight.
import { troopTexture } from './cordon.js';
import { sfx } from '../audio/audio.js';

const TURRET_BASE = 'siege_turret_base', TURRET_GUN = 'siege_turret_gun', ROBOT = 'siege_robot';

function textures(scene) {
  if (scene.textures.exists(ROBOT)) return;
  const make = (key, w, h, paint) => { const g = scene.make.graphics({ add: false }); paint((x, y, ww, hh, c, a = 1) => g.fillStyle(c, a).fillRect(x, y, ww, hh)); g.generateTexture(key, w, h); g.destroy(); };
  make(TURRET_BASE, 20, 14, (px) => {   // a sandbag ring around a squat mount, a red lamp on top
    px(0, 8, 20, 6, 0x6b6248); px(1, 7, 18, 1, 0x8f8360); px(3, 9, 4, 2, 0x857a5a); px(9, 10, 4, 2, 0x857a5a); px(15, 9, 4, 2, 0x857a5a);
    px(0, 13, 20, 1, 0x3d3726);
    px(6, 2, 8, 7, 0x3a4152); px(7, 1, 6, 1, 0x5a6378); px(7, 3, 6, 1, 0xf2c94c); px(9, 5, 2, 2, 0xff4d4d);
  });
  make(TURRET_GUN, 18, 6, (px) => {   // drawn pointing right; rotated to the aim
    px(0, 0, 7, 6, 0x2a2f3d); px(1, 1, 5, 1, 0x4a5164); px(2, 3, 2, 1, 0x6fe3e8);
    px(7, 1, 10, 2, 0x15171f); px(7, 3, 10, 2, 0x22262f); px(17, 1, 1, 4, 0x5a6378);   // twin barrels
  });
  make(ROBOT, 16, 22, (px) => {   // a riot unit: treads, a boxy torso, a sensor bar, a tall shield on its arm
    px(2, 18, 12, 4, 0x1c1f28); px(3, 19, 2, 2, 0x3a4152); px(7, 19, 2, 2, 0x3a4152); px(11, 19, 2, 2, 0x3a4152);
    px(3, 8, 10, 10, 0x4f5870); px(4, 9, 8, 2, 0x6a7590); px(3, 15, 10, 1, 0xf2c94c); px(3, 16, 10, 1, 0x15171f);
    px(4, 3, 8, 5, 0x3a4152); px(5, 5, 6, 1, 0xff4d4d);                      // head, red sensor bar
    px(0, 6, 3, 14, 0xb8c0d0); px(0, 6, 3, 1, 0xe8ecf4); px(1, 9, 1, 6, 0x7c869c);   // shield
    px(13, 9, 2, 6, 0x2a2f3d);                                               // the other arm
  });
}

export class SiegeView {
  constructor(scene) { this.s = scene; this.parts = []; this.mapId = null; this.nextSound = 0; }

  _clear() { for (const p of this.parts) p.destroy(); this.parts = []; this.g = null; }

  _build(view) {
    const s = this.s;
    this._clear(); this.mapId = s.map?.id;
    textures(s);
    const sheet = s.textures.exists('props') ? s.textures.get('props') : null;
    this.g = s.add.graphics().setDepth(5550); this.parts.push(this.g);
    this.units = view.d.map(([x, y, k, aim, , drawn]) => {
      if (k === 1) {
        const base = s.add.image(x, y + 8, TURRET_BASE).setOrigin(0.5, 1).setDepth(y + 5);
        const gun = s.add.image(x, y - 3, TURRET_GUN).setOrigin(0.25, 0.5).setDepth(y + 6).setRotation(aim);
        this.parts.push(base, gun);
        return { k, x, y, gun };
      }
      if (k === 2) {
        const im = s.add.image(x, y + 8, ROBOT).setOrigin(0.5, 1).setDepth(y + 7);
        this.parts.push(im);
        return { k, x, y, im };
      }
      if (drawn) return { k, x, y };   // the cordon already draws this trooper
      const frame = sheet?.has('npc.trooper_back') ? 'npc.trooper_back' : null;
      const im = (frame ? s.add.image(x, y + 8, 'props', frame) : s.add.image(x, y + 7, troopTexture(s))).setOrigin(0.5, 1).setDepth(y + 7);
      this.parts.push(im);
      return { k, x, y, im };
    });
  }

  /** A pen kill: a small burst, no numbers (the line kills all night). */
  onKill(ev) {
    const s = this.s;
    for (let i = 0; i < 6; i++) {
      const sq = s.add.rectangle(ev.x + (Math.random() * 10 - 5), ev.y - 4 - Math.random() * 8, 2, 2, Math.random() < 0.5 ? 0x7fb069 : 0xd65db1).setDepth(6000);
      s.tweens.add({ targets: sq, y: sq.y - 6 - Math.random() * 8, alpha: 0, duration: 320 + Math.random() * 200, onComplete: () => sq.destroy() });
    }
  }

  update(snap) {
    const s = this.s, view = snap?.sg;
    if (!view) { if (this.parts.length) this._clear(); this.mapId = null; return; }
    if (this.mapId !== s.map?.id || !this.units || this.units.length !== view.d.length) this._build(view);
    const g = this.g; g.clear();
    let fired = false;
    view.d.forEach(([x, y, k, aim, st], i) => {
      const u = this.units[i]; if (!u) return;
      if (k === 1) {
        u.gun.setRotation(aim);
        if (st === 1) { g.fillStyle(0xffe08a, 0.95).fillCircle(x + Math.cos(aim) * 15, y - 3 + Math.sin(aim) * 15, 2.5); fired = true; }
      } else if (k === 2) {
        // The shove: a short lunge toward the pen, shield first.
        const lunge = st === 2 ? 3 : 0, a = aim;
        u.im.setPosition(x + Math.cos(a) * lunge, y + 8 + Math.sin(a) * lunge);
        if (st === 2) g.lineStyle(1, 0xb8c0d0, 0.7).strokeCircle(x + Math.cos(a) * 10, y + Math.sin(a) * 10, 7);
      } else if (st === 1) {
        g.fillStyle(0xffe08a, 0.9).fillCircle(x + Math.cos(aim) * 8, y - 6 + Math.sin(aim) * 8, 1.5); fired = true;
      }
    });
    for (const [x1, y1, x2, y2, k] of view.tr) g.lineStyle(1, k ? 0xffb347 : 0xfff3c4, 0.8).lineBetween(x1, y1, x2, y2);
    // Gunfire is heard only near the line, and not every shot.
    const me = snap.players?.find((p) => p.id === s.localId);
    if (fired && me && s.time.now >= this.nextSound && view.d.some(([x, y]) => Math.hypot(x - me.x, y - me.y) < 150)) {
      this.nextSound = s.time.now + 260; sfx('shot');
    }
  }
}
