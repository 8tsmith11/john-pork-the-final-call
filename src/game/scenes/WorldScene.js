import { Sim, TILE } from '../../engine/sim.js';
import { InputReader } from '../../engine/input.js';
import { newSave } from '../../engine/save/schema.js';
import { autosave, loadAutosave } from '../../engine/save/storage.js';
import { rollWorld } from '../../engine/worldRolls.js';
import { newSeed } from '../../engine/rng.js';
import { room631 } from '../../content/maps/room631.js';
import { GAME_VERSION } from '../../version.js';

const STEP = 1 / 60;
const TILE_COLORS = { '#': 0x1c1f33, '.': 0x3a2f2a, 'b': 0x2a3040, '=': 0x4a6080 };

export class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }

  // mode: 'solo' | 'host' | 'client'. Host and solo run the Sim; clients render host snapshots.
  init(data) {
    this.character = data.character; this.mode = data.mode;
    this.net = data.net; this.assignments = data.assignments; this.passedSave = data.save;
  }

  async create() {
    this.save = this.passedSave ?? (await loadAutosave().catch(() => null)) ?? this._newGame();
    this.map = room631;
    this.sim = new Sim(this.map);
    this.localId = this.mode === 'client' ? this.net.id : 'host';
    this.remoteInputs = new Map();   // host: latest input per client
    this.snapBuf = [];               // client: recent snapshots for interpolation
    if (this.mode !== 'client') {
      this.sim.addPlayer(this.localId, this.character);
      for (const [peer, ch] of Object.entries(this.assignments || {})) if (peer !== 'host') this.sim.addPlayer(peer, ch);
    }
    this._wireNet();

    this._drawMap();
    this.sprites = new Map();
    this.input2 = new InputReader(this);
    // Center maps smaller than the screen instead of pinning them to the top-left.
    const mw = this.map.w * TILE, mh = this.map.h * TILE, vw = this.scale.width, vh = this.scale.height;
    const ox = Math.min(0, (mw - vw) / 2), oy = Math.min(0, (mh - vh) / 2);
    this.cameras.main.setBounds(ox, oy, Math.max(mw, vw), Math.max(mh, vh)).setRoundPixels(true);
    this.acc = 0;
    this._makeUi();
    this.ready = true;
  }

  _wireNet() {
    if (this.mode === 'host') {
      this.net.on('msg', (peer, msg) => {
        if (msg.t === 'input') {
          const prev = this.remoteInputs.get(peer);
          // One-shot buttons stick until a sim step consumes them.
          this.remoteInputs.set(peer, { ...msg.inp, dodge: msg.inp.dodge || prev?.dodge, interact: false });
        }
        if (msg.t === 'flag' && typeof msg.key === 'string' && msg.key.startsWith('act')) this.save.flags[msg.key] = true;
      });
      this.net.on('leave', (peer) => this.sim.removePlayer(peer));
      this.snapTimer = this.time.addEvent({ delay: 50, loop: true, callback: () => this.net.broadcast({ t: 'snap', snap: this.sim.snapshot() }) });
    } else if (this.mode === 'client') {
      this.net.on('msg', (msg) => {
        if (msg.t === 'snap') { this.snapBuf.push({ at: performance.now(), snap: msg.snap }); if (this.snapBuf.length > 20) this.snapBuf.shift(); }
      });
      this.net.on('close', () => this._say('The host closed the game.'));
    }
  }

  // Client: render ~100 ms in the past, interpolating between the two snapshots around that time.
  _interpolated() {
    const t = performance.now() - 100, buf = this.snapBuf;
    if (!buf.length) return null;
    let i = buf.findIndex((s) => s.at > t);
    if (i <= 0) return buf[i === 0 ? 0 : buf.length - 1].snap;
    const a = buf[i - 1], b = buf[i], k = (t - a.at) / (b.at - a.at || 1);
    const prev = new Map(a.snap.players.map((p) => [p.id, p]));
    return { ...b.snap, players: b.snap.players.map((p) => {
      const q = prev.get(p.id); if (!q) return p;
      return { ...p, x: q.x + (p.x - q.x) * k, y: q.y + (p.y - q.y) * k };
    }) };
  }

  _newGame() {
    const seed = newSeed();
    return newSave({ seed, rolls: rollWorld(seed), gameVersion: GAME_VERSION });
  }

  _drawMap() {
    const g = this.add.graphics();
    this.map.layout.forEach((row, ty) => [...row].forEach((ch, tx) => {
      g.fillStyle(TILE_COLORS[ch] ?? 0x000000).fillRect(tx * TILE, ty * TILE, TILE, TILE);
      if (ch === '#') g.fillStyle(0x262a45).fillRect(tx * TILE, ty * TILE, TILE, 3);
    }));
    for (const o of this.map.objects) {
      const warm = o.id === 'obj.printer_3' || o.id === 'obj.mate';
      const color = o.id.includes('statue') || o.id.includes('flag') ? 0xf2a6b8 : warm ? 0xd98a4a : 0x6d7899;
      g.fillStyle(color).fillRect(o.x * TILE + 3, o.y * TILE + 3, TILE - 6, TILE - 6);
    }
  }

  _makeUi() {
    const W = this.scale.width, H = this.scale.height;
    this.hint = this.add.text(W / 2, H - 46, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffb347' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.box = this.add.rectangle(W / 2, H - 22, W - 20, 34, 0x0b0d16, 0.9).setStrokeStyle(1, 0x5d6487)
      .setScrollFactor(0).setDepth(100).setVisible(false);
    this.boxText = this.add.text(18, H - 36, '', { fontFamily: 'monospace', fontSize: '8px', color: '#e8e8f0', wordWrap: { width: W - 36 } })
      .setScrollFactor(0).setDepth(101).setVisible(false);
    this.add.text(6, 4, this.map.name, { fontFamily: 'monospace', fontSize: '8px', color: '#9aa3c7' }).setScrollFactor(0).setDepth(100);
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
      let first = true;
      while (this.acc >= STEP) {
        const inputs = new Map([[this.localId, first ? inp : { ...inp, dodge: false, interact: false }]]);
        for (const [peer, rinp] of this.remoteInputs) {
          inputs.set(peer, rinp);
          if (rinp.dodge) this.remoteInputs.set(peer, { ...rinp, dodge: false });
        }
        this.sim.step(STEP, inputs);
        this.acc -= STEP; first = false;
      }
      if (first) this._pendingInteract ||= inp.interact; // no step this frame; don't lose the press
      this._handleInteract(me, inp.interact || this._pendingInteract);
      this._pendingInteract = false;
      snap = this.sim.snapshot();
    }
    if (this.sayUntil && this.time.now > this.sayUntil) { this.box.setVisible(false); this.boxText.setVisible(false); this.sayUntil = 0; }
    this._render(snap);
  }

  _handleInteract(me, pressed) {
    const near = this._nearestObject(me);
    this.hint.setText(near ? `[E] ${near.label}` : '');
    if (!pressed || !near) return;
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

  _render(snap) {
    for (const p of snap.players) {
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
      s.setAlpha(p.d ? 0.55 : 1);
    }
  }
}
