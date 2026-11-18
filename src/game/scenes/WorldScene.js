import { Sim, TILE } from '../../engine/sim.js';
import { InputReader } from '../../engine/input.js';
import { newSave } from '../../engine/save/schema.js';
import { autosave, loadAutosave } from '../../engine/save/storage.js';
import { rollWorld } from '../../engine/worldRolls.js';
import { newSeed } from '../../engine/rng.js';
import { MAPS } from '../../content/maps/index.js';
import { TILE_COLORS } from '../../content/maps/build.js';
import { ENEMIES } from '../../content/enemies.js';
import { GAME_VERSION } from '../../version.js';

const STEP = 1 / 60;
const XP_PER_LEVEL = 30;
const FONT = { fontFamily: 'monospace', fontSize: '8px', color: '#e8e8f0' };

export class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }

  // mode: 'solo' | 'host' | 'client'. Host and solo run the Sim; clients render host snapshots.
  init(data) {
    this.character = data.character; this.mode = data.mode;
    this.net = data.net; this.assignments = data.assignments; this.passedSave = data.save;
  }

  async create() {
    this.save = this.passedSave ?? (await loadAutosave().catch(() => null)) ?? this._newGame();
    const startMap = MAPS[this.save.world.area] ?? MAPS.room631;
    this.sim = new Sim(startMap);
    this.localId = this.mode === 'client' ? this.net.id : 'host';
    this.remoteInputs = new Map();
    this.snapBuf = [];
    if (this.mode !== 'client') {
      this.sim.addPlayer(this.localId, this.character);
      for (const [peer, ch] of Object.entries(this.assignments || {})) if (peer !== 'host') this.sim.addPlayer(peer, ch);
    }
    this.input.mouse?.disableContextMenu();
    this.sprites = new Map(); this.enemySprites = new Map(); this.shotGfx = this.add.graphics().setDepth(5000);
    this.fxGfx = this.add.graphics().setDepth(5001);
    this.input2 = new InputReader(this);
    this.acc = 0;
    this._makeUi();
    this._wireNet();
    this._showMap(startMap);
    this.ready = true;
  }

  _newGame() {
    const seed = newSeed();
    return newSave({ seed, rolls: rollWorld(seed), gameVersion: GAME_VERSION });
  }

  // ---------- networking ----------
  _wireNet() {
    if (this.mode === 'host') {
      this.net.on('msg', (peer, msg) => {
        if (msg.t === 'input') {
          const prev = this.remoteInputs.get(peer);
          this.remoteInputs.set(peer, { ...msg.inp, dodge: msg.inp.dodge || prev?.dodge, interact: false });
        }
        if (msg.t === 'flag' && typeof msg.key === 'string' && msg.key.startsWith('act')) this.save.flags[msg.key] = true;
        if (msg.t === 'exit') this._tryExit(this.sim.map.objects.find((o) => o.id === msg.obj));
      });
      this.net.on('leave', (peer) => this.sim.removePlayer(peer));
      this.time.addEvent({ delay: 50, loop: true, callback: () => this.net.broadcast({ t: 'snap', snap: this._lastSnap ?? this.sim.snapshot() }) });
    } else if (this.mode === 'client') {
      this.net.on('msg', (msg) => {
        if (msg.t === 'snap') { this.snapBuf.push({ at: performance.now(), snap: msg.snap }); if (this.snapBuf.length > 20) this.snapBuf.shift(); }
        if (msg.t === 'say') this._say(msg.text);
      });
      this.net.on('close', () => this._say('The host closed the game.'));
    }
  }

  _interpolated() {
    const t = performance.now() - 100, buf = this.snapBuf;
    if (!buf.length) return null;
    const i = buf.findIndex((s) => s.at > t);
    if (i <= 0) return buf[i === 0 ? 0 : buf.length - 1].snap;
    const a = buf[i - 1], b = buf[i], k = (t - a.at) / (b.at - a.at || 1);
    if (a.snap.map !== b.snap.map) return b.snap;
    const lerp = (list, prevList) => {
      const prev = new Map(prevList.map((p) => [p.id, p]));
      return list.map((p) => { const q = prev.get(p.id); return q ? { ...p, x: q.x + (p.x - q.x) * k, y: q.y + (p.y - q.y) * k } : p; });
    };
    return { ...b.snap, players: lerp(b.snap.players, a.snap.players), enemies: lerp(b.snap.enemies, a.snap.enemies) };
  }

  // ---------- map ----------
  _showMap(map) {
    this.map = map;
    this.mapGfx?.destroy();
    const g = this.mapGfx = this.add.graphics().setDepth(-10);
    map.layout.forEach((row, ty) => [...row].forEach((ch, tx) => {
      g.fillStyle(TILE_COLORS[ch] ?? 0x000000).fillRect(tx * TILE, ty * TILE, TILE, TILE);
      if (ch === '#') g.fillStyle(0x262a45).fillRect(tx * TILE, ty * TILE, TILE, 3);
      if (ch === 't') g.fillStyle(0x6b5d4d).fillRect(tx * TILE, ty * TILE + 5, TILE, 1).fillRect(tx * TILE, ty * TILE + 10, TILE, 1);
    }));
    for (const o of map.objects) {
      const warm = o.id === 'obj.printer_3' || o.id === 'obj.mate';
      const color = o.npc ? 0x8a8f6a : o.action === 'exit' ? 0xffb347 : o.id.includes('statue') || o.id.includes('flag') ? 0xf2a6b8 : warm ? 0xd98a4a : 0x6d7899;
      g.fillStyle(color, o.action === 'exit' ? 0.5 : 1).fillRect(o.x * TILE + 3, o.y * TILE + 3, TILE - 6, TILE - 6);
    }
    const mw = map.w * TILE, mh = map.h * TILE, vw = this.scale.width, vh = this.scale.height;
    this.cameras.main.setBounds(Math.min(0, (mw - vw) / 2), Math.min(0, (mh - vh) / 2), Math.max(mw, vw), Math.max(mh, vh)).setRoundPixels(true);
    this.mapLabel.setText(map.name);
    for (const s of this.enemySprites.values()) s.destroy();
    this.enemySprites.clear();
  }

  _tryExit(obj) {
    if (!obj || obj.action !== 'exit') return;
    if (obj.requiresClear && !this.sim.cleared) return this._announce('Something down here is still moving.');
    const to = MAPS[obj.to];
    if (!to) return this._announce(obj.text);
    this.sim.setMap(to);
    this.save.world.area = to.id;
    this._announce(obj.text);
  }

  _announce(text) { this._say(text); if (this.mode === 'host') this.net.broadcast({ t: 'say', text }); }

  // ---------- UI ----------
  _makeUi() {
    const W = this.scale.width, H = this.scale.height;
    this.hint = this.add.text(W / 2, H - 46, '', { ...FONT, color: '#ffb347' }).setOrigin(0.5).setScrollFactor(0).setDepth(9000);
    this.box = this.add.rectangle(W / 2, H - 22, W - 20, 34, 0x0b0d16, 0.9).setStrokeStyle(1, 0x5d6487).setScrollFactor(0).setDepth(9000).setVisible(false);
    this.boxText = this.add.text(18, H - 36, '', { ...FONT, wordWrap: { width: W - 36 } }).setScrollFactor(0).setDepth(9001).setVisible(false);
    this.mapLabel = this.add.text(6, 4, '', { ...FONT, color: '#9aa3c7' }).setScrollFactor(0).setDepth(9000);
    this.hud = this.add.graphics().setScrollFactor(0).setDepth(9000);
    this.hudText = this.add.text(W - 6, 4, '', { ...FONT, color: '#9aa3c7', align: 'right' }).setOrigin(1, 0).setScrollFactor(0).setDepth(9001);
  }

  _say(text) { this.box.setVisible(true); this.boxText.setText(text).setVisible(true); this.sayUntil = this.time.now + 4500; }

  _nearestObject(p) {
    let best = null, bd = 22;
    for (const o of this.map.objects) {
      const d = Math.hypot(o.x * TILE + 8 - p.x, o.y * TILE + 8 - p.y);
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }

  // ---------- loop ----------
  update(_, deltaMs) {
    if (!this.ready) return;
    let snap, me;
    if (this.mode === 'client') {
      snap = this._interpolated();
      me = snap?.players.find((p) => p.id === this.localId);
      if (!me) return;
      const inp = this.input2.read(me);
      this.net.send({ t: 'input', inp });
      this._handleInteract(me, inp.interact);
    } else {
      me = this.sim.players.get(this.localId);
      const inp = this.input2.read(me);
      this.acc += Math.min(deltaMs / 1000, 0.1);
      let first = true, events = [];
      while (this.acc >= STEP) {
        const inputs = new Map([[this.localId, first ? inp : { ...inp, dodge: false, interact: false }]]);
        for (const [peer, rinp] of this.remoteInputs) {
          inputs.set(peer, rinp);
          if (rinp.dodge) this.remoteInputs.set(peer, { ...rinp, dodge: false });
        }
        this.sim.step(STEP, inputs);
        events = events.concat(this.sim.events);
        this.acc -= STEP; first = false;
      }
      if (first) this._pendingInteract ||= inp.interact;
      this._handleInteract(me, inp.interact || this._pendingInteract);
      this._pendingInteract = false;
      this._hostEvents(events);
      snap = this._lastSnap = { ...this.sim.snapshot(), events };
    }
    if (snap.map !== this.map.id && MAPS[snap.map]) this._showMap(MAPS[snap.map]);
    if (this.sayUntil && this.time.now > this.sayUntil) { this.box.setVisible(false); this.boxText.setVisible(false); this.sayUntil = 0; }
    this._render(snap);
  }

  _hostEvents(events) {
    for (const ev of events) {
      if (ev.t === 'kill') {
        // XP is shared by the party (co-op), levels grant skill points.
        for (const p of this.sim.players.values()) {
          const c = this.save.party[p.character]; if (!c) continue;
          c.xp += ev.xp;
          while (c.xp >= c.level * XP_PER_LEVEL) { c.xp -= c.level * XP_PER_LEVEL; c.level++; c.skillPoints++; this._announce(`${p.character} reached level ${c.level}. (+1 skill point)`); }
        }
      }
    }
    if (this.sim.wiped && !this._wipeAt) this._wipeAt = this.time.now + 2500;
    if (this._wipeAt && this.time.now > this._wipeAt) {
      this._wipeAt = 0;
      this.sim.setMap(this.sim.map);
      this._announce('Everything goes dark. You come to where you came in, aching. (The rot doesn\'t forget.)');
    }
  }

  _handleInteract(me, pressed) {
    const near = this._nearestObject(me);
    this.hint.setText(near ? `[E] ${near.label}` : '');
    if (!pressed || !near) return;
    if (near.action === 'exit') {
      if (this.mode === 'client') this.net.send({ t: 'exit', obj: near.id });
      else this._tryExit(near);
      return;
    }
    this._say(near.text);
    if (near.flag) {
      if (this.mode === 'client') this.net.send({ t: 'flag', key: near.flag });
      else this.save.flags[near.flag] = true;
    }
    if (near.action === 'save') {
      if (this.mode === 'client') this._say('Only the host can save. (Their save is the world.)');
      else autosave(this.save);
    }
  }

  // ---------- rendering ----------
  _render(snap) {
    const seen = new Set();
    for (const p of snap.players) {
      seen.add(p.id);
      let s = this.sprites.get(p.id);
      if (!s) {
        s = this.add.sprite(p.x, p.y, p.c).setOrigin(0.5, 1);
        this.sprites.set(p.id, s);
        if (p.id === this.localId) this.cameras.main.startFollow(s, true, 0.15, 0.15);
      }
      s.setPosition(Math.round(p.x), Math.round(p.y + 4)).setDepth(p.y);
      const facing = p.f === 'left' ? 'right' : p.f;
      s.setFlipX(p.f === 'left');
      const key = `${p.c}_${p.m ? 'walk' : 'idle'}_${facing}`;
      if (s.anims.currentAnim?.key !== key) s.play(key);
      s.setAlpha(p.d ? 0.55 : p.iv ? (Math.floor(this.time.now / 60) % 2 ? 0.4 : 1) : 1);
      s.setAngle(p.dn ? 90 : 0).setTint(p.dn ? 0x777788 : 0xffffff);
    }
    for (const [id, s] of this.sprites) if (!seen.has(id)) { s.destroy(); this.sprites.delete(id); }

    const eseen = new Set();
    for (const e of snap.enemies || []) {
      eseen.add(e.id);
      let s = this.enemySprites.get(e.id);
      const def = ENEMIES[e.k];
      if (!s) { s = this.add.rectangle(e.x, e.y, def.radius * 2, def.radius * 2 + 2, def.color).setOrigin(0.5, 1); this.enemySprites.set(e.id, s); }
      s.setPosition(e.x, e.y + 3).setDepth(e.y).setFillStyle(e.h ? 0xffffff : def.color);
      s.setScale(1 + Math.sin(this.time.now / 90 + e.x) * 0.06, 1);   // jittery rot wobble
    }
    for (const [id, s] of this.enemySprites) if (!eseen.has(id)) { s.destroy(); this.enemySprites.delete(id); }

    this.shotGfx.clear();
    for (const sh of snap.shots || []) this.shotGfx.fillStyle(sh.f ? 0xffd27f : 0xd65db1).fillCircle(sh.x, sh.y, sh.f ? 2 : 2.5);

    for (const ev of snap.events || []) this._fx(ev, snap);
    this._drawHud(snap);
  }

  _fx(ev, snap) {
    if (ev.t === 'hit' || ev.t === 'kill') {
      const t = this.add.text(ev.x, ev.y - 14, ev.t === 'kill' ? '✕' : `${ev.dmg}`, { ...FONT, color: ev.t === 'kill' ? '#7fb069' : '#ffd27f' }).setOrigin(0.5).setDepth(6000);
      this.tweens.add({ targets: t, y: t.y - 10, alpha: 0, duration: 450, onComplete: () => t.destroy() });
      if (ev.by === this.localId) this.cameras.main.shake(60, 0.002);
    }
    if (ev.t === 'hurt' && ev.id === this.localId) { this.cameras.main.shake(120, 0.006); this.cameras.main.flash(80, 120, 20, 40); }
    if (ev.t === 'swing') {
      const p = snap.players.find((q) => q.id === ev.id); if (!p) return;
      const g = this.add.graphics().setDepth(p.y + 1);
      g.lineStyle(2, 0xe8e8f0, 0.8).beginPath().arc(p.x, p.y - 8, 16, ev.a - 0.9, ev.a + 0.9).strokePath();
      this.tweens.add({ targets: g, alpha: 0, duration: 140, onComplete: () => g.destroy() });
    }
    if (ev.t === 'down' && ev.id === this.localId) this._say('You\'re down. A roommate can pick you up: they just have to stand next to you.');
  }

  _drawHud(snap) {
    const g = this.hud.clear();
    const lines = [];
    snap.players.forEach((p, i) => {
      const y = 16 + i * 9, w = 60;
      g.fillStyle(0x1c1f33).fillRect(6, y, w, 5);
      g.fillStyle(p.dn ? 0x777788 : p.id === this.localId ? 0x7fb069 : 0x5f8fbf).fillRect(6, y, Math.max(0, (p.hp / 100) * w), 5);
      if (p.dn) g.fillStyle(0xffb347).fillRect(6, y + 5, (p.rv / 2) * w, 1);
    });
    if (snap.enemies?.length) lines.push(`rot: ${snap.enemies.length}`);
    if (this.mode !== 'client') { const c = this.save.party[this.character]; lines.push(`lv ${c.level}  xp ${c.xp}/${c.level * XP_PER_LEVEL}`); }
    this.hudText.setText(lines.join('\n'));
  }
}
