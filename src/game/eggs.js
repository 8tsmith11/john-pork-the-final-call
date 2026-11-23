// Optional interaction. See docs/PROPOSALS.md (P-001) and docs/lore/roommates.md.
import * as W from '../engine/wallet.js';
import { TILE } from '../engine/sim.js';
import { audioOut } from '../audio/audio.js';

/** Roommates who opted in to being targets. */
export const TARGET_OK = { manuel: true, michael: true, trevor: false };
/** Roommates whose human said their character may do it to another roommate. Michael: his standing yes (roommates.md,
 *  bf78e6e). Manuel said yes only as a target (gonman's session, 2026-11-19), never as a doer on a roommate. */
export const DOER_ON_ROOMMATE_OK = { michael: true, manuel: false, trevor: false };
/** Roommates whose recorded boundary excludes taking part. */
export const NEVER_DOER = new Set(['trevor']);

/** Can `doer` (a roommate id) target roommate `target`? Pure, for tests. */
export function roommateTargetOk(doer, target) {
  return doer !== target && !NEVER_DOER.has(doer) && TARGET_OK[target] === true && DOER_ON_ROOMMATE_OK[doer] === true;
}

/** Is this person (an NPC object or a crowd walker) a possible target? Opt-in only: whoever owns a character tags it
 *  `eggOk: true` on purpose; untagged people and `eggNo` ones never are (gonman's and trevor's review, board #158/#166). */
export const personTargetOk = (o) => !!o && o.eggOk === true && o.eggNo !== true;

const RANGE = 18, PER_TARGET_COOLDOWN = 20000, ANIM_MS = 1400, PUDDLE_S = 25;

export class Eggs {
  constructor(scene) {
    this.s = scene;
    this.cool = new Map();     // target key -> time it can be picked again (host)
    this.puddles = [];         // { x, y, blobs: [[dx, dy, r]], t0 }
    this.gfx = scene.add.graphics().setDepth(4);   // on the floor, under everyone
    scene.input.keyboard.on('keydown-O', () => {
      if (scene.dlg || scene.menu) return;
      if (scene.mode === 'client') scene.net.send({ t: 'eggO' }); else this.act(scene.localId);
    });
  }

  /** Host: player `playerId` pressed O. Picks the overlapping NPC, crowd person, or other player. */
  act(playerId) {
    const s = this.s, me = s.sim.players.get(playerId);
    if (!me || me.downed || me.riding) return;
    if (NEVER_DOER.has(me.character)) return;
    let target = null, best = RANGE;
    for (const o of s.map.objects) {
      if (!o.npc || !personTargetOk(o)) continue;
      const d = Math.hypot(o.x * TILE + 8 - me.x, o.y * TILE + 8 - me.y);
      if (d <= best) { best = d; target = { key: o.id, x: o.x * TILE + 8, y: o.y * TILE + 8, name: o.label || o.id, npc: true }; }
    }
    const walker = s.crowd?.nearest?.(me.x, me.y);
    if (personTargetOk(walker) && Math.hypot(walker.x - me.x, walker.y - me.y) <= best) target = { key: `crowd:${walker.name}`, x: walker.x, y: walker.y, name: walker.name, npc: true };
    for (const p of s.sim.players.values()) {
      if (p === me || p.downed || !roommateTargetOk(me.character, p.character)) continue;
      const d = Math.hypot(p.x - me.x, p.y - me.y);
      if (d <= best) { best = d; target = { key: `player:${p.id}`, x: p.x, y: p.y, name: p.character ? (p.character[0].toUpperCase() + p.character.slice(1)) : p.id, pid: p.id }; }
    }
    if (!target) return;
    if ((this.cool.get(target.key) ?? 0) > s.time.now) { this._tell(playerId, `${target.name} needs a minute.`); return; }
    this.cool.set(target.key, s.time.now + PER_TARGET_COOLDOWN);
    W.addMoney(s.save, me.character, 1);     // the target pays $1 (the doer's own wallet)
    s._partyDirty = true;
    const ev = { t: 'eggO', id: playerId, x: Math.round(me.x), y: Math.round(me.y), tx: Math.round(target.x), ty: Math.round(target.y), tk: target.key, name: target.name, seed: Math.floor(Math.random() * 1e6) };
    s.sim.emit(ev);
  }

  _tell(playerId, text) { const s = this.s; if (playerId === s.localId) s._toast(text); else s.net?.send?.(playerId, { t: 'say', text }); }

  onHostMsg(peer, msg) { if (msg.t !== 'eggO') return false; this.act(peer); return true; }

  onEvent(ev) {
    if (ev.t !== 'eggO') return;
    const key = `${ev.id}:${ev.seed}`;
    if (this._last === key) return;   // clients can see one event on several frames
    this._last = key;
    const s = this.s;
    this._animate(ev);
    this._sound(ANIM_MS / 1000);
    s.time.delayedCall(ANIM_MS, () => {
      this._splat(ev);
      if (ev.id === s.localId) s._toast(`${ev.name} pays you $1.`);
    });
  }

  // The doer leans in and pumps; the target shudders. Sprites are the scene's own player/prop images.
  _animate(ev) {
    const s = this.s, spr = s.sprites?.get(ev.id), prop = s.propById?.[ev.tk]?.im;
    const target = prop ?? (ev.tk?.startsWith('player:') ? s.sprites?.get(ev.tk.slice(7)) : s.sprites?.get(ev.tk));
    const lean = Math.sign(ev.tx - ev.x) || 1;
    // Player sprites are placed from the snapshot every frame, so they move through offX/offY (as in crush.js); a prop holds still.
    if (spr) { spr.offX = 0; s.tweens.add({ targets: spr, offX: lean, yoyo: true, repeat: 9, duration: ANIM_MS / 20, ease: 'Sine.easeInOut', onComplete: () => { spr.offX = 0; } }); }
    if (prop) s.tweens.add({ targets: prop, y: '-=1', yoyo: true, repeat: 4, duration: ANIM_MS / 10, delay: ANIM_MS * 0.5 });
    else if (target) { target.offY = 0; s.tweens.add({ targets: target, offY: -1, yoyo: true, repeat: 4, duration: ANIM_MS / 10, delay: ANIM_MS * 0.5, onComplete: () => { target.offY = 0; } }); }
    const hand = s.add.text((ev.x + ev.tx) / 2, (ev.y + ev.ty) / 2 - 10, '✊', { fontSize: '7px' }).setOrigin(0.5).setDepth(6500);
    s.tweens.add({ targets: hand, y: '+=3', yoyo: true, repeat: 9, duration: ANIM_MS / 20, onComplete: () => hand.destroy() });
  }

  // A mess on the floor: a big blob where the target stands, smaller drops flung outward.
  _splat(ev) {
    let r = ev.seed;
    const rnd = () => ((r = (r * 1103515245 + 12345) % 2147483648) / 2147483648);
    const blobs = [[0, 0, 5]];
    for (let i = 0; i < 14; i++) { const a = rnd() * Math.PI * 2, d = 3 + rnd() * 16; blobs.push([Math.cos(a) * d, Math.sin(a) * d * 0.6, 0.8 + rnd() * 2.6]); }
    this.puddles.push({ x: ev.tx, y: ev.ty + 6, blobs, t0: this.s.time.now });
  }

  update() {
    const g = this.gfx, now = this.s.time.now; g.clear();
    if (this.s.map?.id !== this._map) { this._map = this.s.map?.id; this.puddles = []; }
    this.puddles = this.puddles.filter((p) => (now - p.t0) / 1000 < PUDDLE_S);
    for (const p of this.puddles) {
      const age = (now - p.t0) / 1000, spread = Math.min(1, 0.4 + age * 1.5), fade = Math.min(1, (PUDDLE_S - age) / 5);
      for (const [dx, dy, rad] of p.blobs) {
        g.fillStyle(0xe8e2d0, 0.9 * fade).fillEllipse(p.x + dx * spread, p.y + dy * spread, rad * 2 * spread, rad * 1.3 * spread);
        g.fillStyle(0xffffff, 0.7 * fade).fillEllipse(p.x + dx * spread - rad * 0.3, p.y + dy * spread - rad * 0.25, rad * 0.7, rad * 0.4);   // wet shine
      }
    }
  }

  // Sound: soft rhythmic rubbing, then a long toothpaste squeeze (a filtered, sweeping squelch) and a plop.
  _sound(dur) {
    const out = audioOut(); if (!out) return;
    const { ctx, dest } = out, t0 = ctx.currentTime;
    const noise = (len) => { const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const n = ctx.createBufferSource(); n.buffer = b; return n; };
    for (let i = 0; i < 10; i++) {              // rubbing
      const t = t0 + i * (dur / 10), n = noise(0.06), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'lowpass'; f.frequency.value = 700; g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      n.connect(f); f.connect(g); g.connect(dest); n.start(t);
    }
    const ts = t0 + dur, n = noise(0.9), bp = ctx.createBiquadFilter(), g = ctx.createGain();   // the squeeze
    bp.type = 'bandpass'; bp.Q.value = 6; bp.frequency.setValueAtTime(350, ts); bp.frequency.exponentialRampToValueAtTime(1400, ts + 0.55); bp.frequency.exponentialRampToValueAtTime(600, ts + 0.85);
    g.gain.setValueAtTime(0, ts); g.gain.linearRampToValueAtTime(0.6, ts + 0.08); g.gain.setValueAtTime(0.6, ts + 0.6); g.gain.exponentialRampToValueAtTime(0.001, ts + 0.9);
    const wob = ctx.createOscillator(), wg = ctx.createGain(); wob.frequency.value = 22; wg.gain.value = 180; wob.connect(wg); wg.connect(bp.frequency); wob.start(ts); wob.stop(ts + 0.9);
    n.connect(bp); bp.connect(g); g.connect(dest); n.start(ts);
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine';   // plop
    o.frequency.setValueAtTime(240, ts + 0.85); o.frequency.exponentialRampToValueAtTime(70, ts + 1.0);
    og.gain.setValueAtTime(0.5, ts + 0.85); og.gain.exponentialRampToValueAtTime(0.001, ts + 1.05);
    o.connect(og); og.connect(dest); o.start(ts + 0.85); o.stop(ts + 1.1);
  }
}
