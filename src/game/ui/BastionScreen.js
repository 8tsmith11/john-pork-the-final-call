// The Bastion screen (hub #34): a neon arena for the two-way tower defense (rules: src/engine/bastion.js, the
// table: src/game/bastionTable.js). Three lanes run from the party's base (left) to the opponent's (right). Pick a
// piece in the palette, then click a glowing pad (towers, your half) or a lane (units). Units glide between the
// host's updates. Every roommate's energy shows on their card; the AI's seats say so.
//   new BastionScreen(scene, { me, act(move), leave() })  ·  view.update(tableMsg)  ·  view.close()
import { VIEW } from '../../view.js';
import * as B from '../../engine/bastion.js';
import { getLang } from '../../i18n.js';
import { ROOMMATES } from '../scenes/BootScene.js';

const es = () => getLang() === 'es';
const T = (en, sp) => (es() ? sp : en);
const F = (size, color = '#e8e8f0', extra = {}) => ({ fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra });
const SIDE = { trevor: 0x6a9ee8, manuel: 0x8ccc58, michael: 0xec7d76, npc: 0xff4f7a };
const A = { x0: 50, x1: 430, top: 34, lanes: [74, 120, 166] };        // arena geometry (view px)
const CELL = (A.x1 - A.x0) / B.LANE;
const lx = (x) => A.x0 + x * CELL;
const PADY = -17;                                                      // pads sit just above their lane

export class BastionScreen {
  constructor(scene, { me = null, act = () => {}, leave = () => {} } = {}) {
    this.s = scene; this.me = me; this.act = act; this.onLeave = leave;
    this.closed = false; this.pick = null; this.m = null; this.seats = {}; this.units = new Map(); this.pulses = [];
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9760);
    this.bg = scene.add.container(0, 0); this.dyn = scene.add.container(0, 0); this.unitLayer = scene.add.container(0, 0); this.top = scene.add.container(0, 0);
    this.root.add([this.bg, this.dyn, this.unitLayer, this.top]);
    this._drawArena();
    this.esc = (ev) => { if (ev.key === 'Escape') this.leave(); };
    scene.input.keyboard.on('keydown', this.esc);
  }

  _mine() { return this.m?.roommates.includes(this.me) && this.seats[this.me] === 'human' ? this.me : null; }

  _drawArena() {
    const s = this.s, g = s.add.graphics(); this.bg.add(g);
    g.fillStyle(0x05040c, 1).fillRect(0, 0, VIEW.w, VIEW.h);
    for (let x = 0; x < VIEW.w; x += 16) g.lineStyle(1, 0x1a1030, 0.5).lineBetween(x, A.top - 8, x, 196);   // a faint grid floor
    for (let y = A.top - 8; y < 196; y += 16) g.lineStyle(1, 0x1a1030, 0.5).lineBetween(0, y, VIEW.w, y);
    g.fillStyle(0x0d0a1c, 1).fillRoundedRect(A.x0 - 4, A.top - 6, A.x1 - A.x0 + 8, 160, 6).lineStyle(1, 0x3a2a6a, 1).strokeRoundedRect(A.x0 - 4, A.top - 6, A.x1 - A.x0 + 8, 160, 6);
    g.lineStyle(1, 0x6a4aff, 0.25).lineBetween((A.x0 + A.x1) / 2, A.top - 4, (A.x0 + A.x1) / 2, A.top + 150);   // the halfway line
    for (const y of A.lanes) {
      g.fillStyle(0x161032, 1).fillRect(A.x0, y - 5, A.x1 - A.x0, 10);
      g.lineStyle(1, 0x7a5cff, 0.8).lineBetween(A.x0, y - 5, A.x1, y - 5).lineBetween(A.x0, y + 5, A.x1, y + 5);
      for (let x = A.x0 + 8; x < A.x1; x += 16) g.fillStyle(0x7a5cff, 0.25).fillRect(x, y - 0.5, 6, 1);
    }
    g.fillStyle(0x11131f, 1).fillRoundedRect(VIEW.w / 2 - 66, 4, 132, 15, 4).lineStyle(1, 0xff4f7a, 0.9).strokeRoundedRect(VIEW.w / 2 - 66, 4, 132, 15, 4);
    this.bg.add(s.add.text(VIEW.w / 2, 7, 'B A S T I O N', F(9, '#ffb3c6', { heading: true })).setOrigin(0.5, 0));
    const leave = s.add.text(VIEW.w - 6, 7, T('[ESC] leave', '[ESC] salir'), F(7, '#9aa3c7')).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    leave.on('pointerdown', () => this.leave()); this.bg.add(leave);
  }

  update(msg) {
    if (this.closed || !msg?.state) return;
    this.m = msg.state; this.seats = msg.seats ?? {};
    this.redraw();
    this._syncUnits();
  }

  redraw() {
    for (const p of this.pulses) this.s.tweens.killTweensOf(p);
    this.pulses = [];
    this.dyn.removeAll(true); this.top.removeAll(true);
    const s = this.s, m = this.m, g = s.add.graphics(); this.dyn.add(g);
    const add = (o, layer = this.dyn) => { layer.add(o); return o; }, mine = this._mine();
    // bases
    for (const side of ['party', 'npc']) {
      const x = side === 'party' ? 8 : A.x1 + 6, w = 36, hp = Math.max(0, m.base[side]), c = side === 'party' ? 0x6ad4ff : 0xff4f7a;
      g.fillStyle(0x0d0a1c, 1).fillRoundedRect(x, A.top + 2, w, 148, 5).lineStyle(2, c, 0.9).strokeRoundedRect(x, A.top + 2, w, 148, 5);
      const fill = 140 * hp / B.BASE_HP;
      g.fillStyle(c, 0.25).fillRect(x + 4, A.top + 6 + (140 - fill), w - 8, fill);
      add(s.add.text(x + w / 2, A.top + 8, side === 'party' ? T('YOU', 'USTEDES') : T('THEM', 'ELLOS'), F(6, side === 'party' ? '#9fe6ff' : '#ffb3c6')).setOrigin(0.5, 0));
      add(s.add.text(x + w / 2, A.top + 70, `${Math.ceil(hp)}`, F(10, '#ffffff', { fontStyle: 'bold' })).setOrigin(0.5));
    }
    // pads and towers
    for (let lane = 0; lane < B.LANES; lane++) for (const side of ['party', 'npc']) for (let slot = 0; slot < B.SLOTS; slot++) {
      const x = lx(side === 'party' ? B.SLOT_X[slot] : B.LANE - B.SLOT_X[slot]), y = A.lanes[lane] + PADY;
      const t = m.towers.find((q) => q.side === side && q.lane === lane && q.slot === slot);
      if (!t) {
        g.fillStyle(side === 'party' ? 0x142238 : 0x2a1020, 1).fillRect(x - 4, y - 4, 8, 8);
        if (side === 'party' && mine && this.pick?.type === 'tower' && B.canPlace(m, mine, this.pick.kind, lane, slot)) {
          this._pulse(x, y, 6, 0x9fe6ff);
          add(s.add.zone(x, y, 14, 14).setInteractive({ useHandCursor: true })).on('pointerdown', () => this.act({ type: 'tower', kind: this.pick.kind, lane, slot }));
        }
        continue;
      }
      const c = SIDE[t.owner] ?? (side === 'party' ? 0x6ad4ff : 0xff4f7a), frac = t.hp / B.TOWERS[t.kind].hp;
      if (t.kind === 'gun') { g.fillStyle(0x0b0d16, 1).fillCircle(x, y, 5.5); g.fillStyle(c, 1).fillCircle(x, y, 4.5); g.lineStyle(2, 0xffffff, 0.9).lineBetween(x, y, x + (side === 'party' ? 6 : -6), y); }
      if (t.kind === 'zap') { g.fillStyle(0x0b0d16, 1).fillTriangle(x, y - 7, x - 6, y + 4, x + 6, y + 4); g.fillStyle(c, 1).fillTriangle(x, y - 5, x - 4, y + 3, x + 4, y + 3); g.lineStyle(1, 0xfff27a, 0.9).strokeCircle(x, y, 7); }
      if (t.kind === 'wall') { g.fillStyle(c, 0.9).fillRect(x - 3, A.lanes[lane] - 7, 6, 14); g.lineStyle(1, 0x0b0d16, 1).strokeRect(x - 3, A.lanes[lane] - 7, 6, 14); }
      g.fillStyle(0x000000, 0.7).fillRect(x - 5, y + 6, 10, 2); g.fillStyle(frac > 0.5 ? 0x7fe07a : 0xffb347, 1).fillRect(x - 5, y + 6, 10 * frac, 2);
    }
    // lanes are clickable when a unit is picked
    if (mine && this.pick?.type === 'unit' && B.canSend(m, mine, this.pick.kind, 0)) A.lanes.forEach((y, lane) => {
      g.lineStyle(1, 0x9fe6ff, 0.6).strokeRect(A.x0, y - 7, A.x1 - A.x0, 14);
      add(s.add.zone(A.x0, y - 8, A.x1 - A.x0, 16).setOrigin(0).setInteractive({ useHandCursor: true })).on('pointerdown', () => this.act({ type: 'unit', kind: this.pick.kind, lane }));
    });
    // top line: time and waves
    const mm = Math.floor(m.t / 60), ss = String(Math.floor(m.t % 60)).padStart(2, '0');
    add(s.add.text(10, 7, `${mm}:${ss}${m.t > B.OVERTIME ? T('  OVERTIME', '  TIEMPO EXTRA') : ''}`, F(7, m.t > B.OVERTIME ? '#ffb347' : '#9aa3c7')), this.top);
    add(s.add.text(VIEW.w / 2 + 74, 7, T(`wave ${m.wave}`, `oleada ${m.wave}`), F(7, '#ffb3c6')), this.top);
    this._cards(g, add, mine);
    if (m.winner) this._end(g, add);
  }

  _cards(g, add, mine) {
    const s = this.s, m = this.m, y = 202;
    m.roommates.forEach((r, i) => {
      const x = 8 + i * 74, c = SIDE[r], e = m.energy[r] ?? 0;
      g.fillStyle(r === mine ? 0x1e2338 : 0x13152a, 1).fillRoundedRect(x, y, 70, 30, 4).lineStyle(1, r === mine ? 0xf2d48a : 0x2a2f48, 1).strokeRoundedRect(x, y, 70, 30, 4);
      g.fillStyle(0x0b0d16, 1).fillRoundedRect(x + 3, y + 4, 22, 22, 3).lineStyle(1, c, 0.9).strokeRoundedRect(x + 3, y + 4, 22, 22, 3);
      if (s.textures.exists(r)) add(s.add.image(x + 14, y + 7, r, 'idle_down_0').setCrop(0, 0, 16, 14).setScale(1.4).setOrigin(0.5, 0));
      add(s.add.text(x + 28, y + 3, (ROOMMATES[r]?.name ?? r) + (r === mine ? T(' · you', ' · tú') : this.seats[r] === 'ai' ? ' · AI' : ''), F(6, r === mine ? '#f2d48a' : '#e8e8f0')));
      g.fillStyle(0x0b0d16, 1).fillRect(x + 28, y + 14, 38, 6); g.fillStyle(c, 1).fillRect(x + 28, y + 14, 38 * e / B.MAX_ENERGY, 6);
      add(s.add.text(x + 28, y + 21, `⚡${Math.floor(e)}`, F(6, '#c9cde0')));
    });
    // the palette: towers, then units
    const px = 8 + m.roommates.length * 74 + 4, pieces = [['tower', 'gun'], ['tower', 'zap'], ['tower', 'wall'], ['unit', 'runner'], ['unit', 'bruiser'], ['unit', 'drone']];
    const names = es() ? { gun: 'torreta', zap: 'bobina', wall: 'barrera', runner: 'corredor', bruiser: 'bruto', drone: 'dron' } : { gun: 'turret', zap: 'coil', wall: 'barrier', runner: 'runner', bruiser: 'bruiser', drone: 'drone' };
    pieces.forEach(([type, kind], i) => {
      const x = px + (i % 3) * 52, yy = y + Math.floor(i / 3) * 16, def = (type === 'tower' ? B.TOWERS : B.UNITS)[kind];
      const can = mine && (m.energy[mine] ?? 0) >= def.cost && !m.winner, on = this.pick?.kind === kind;
      g.fillStyle(on ? 0x3a2a12 : can ? 0x1a1d30 : 0x101220, 1).fillRoundedRect(x, yy, 49, 14, 3).lineStyle(1, on ? 0xffb347 : can ? (type === 'tower' ? 0x6ad4ff : 0xff8fb0) : 0x22263a, 1).strokeRoundedRect(x, yy, 49, 14, 3);
      add(s.add.text(x + 3, yy + 3, `${names[kind]} ${def.cost}`, F(6, can ? '#e8e8f0' : '#3d4260')));
      if (mine) add(s.add.zone(x, yy, 49, 14).setOrigin(0).setInteractive({ useHandCursor: true })).on('pointerdown', () => { this.pick = on ? null : { type, kind }; this.redraw(); });
    });
    const hint = !mine ? T('Watching: the AI has your seat.', 'Mirando: la IA tiene tu lugar.')
      : this.pick ? (this.pick.type === 'tower' ? T('Click a glowing pad on your half.', 'Haz clic en una base brillante de tu lado.') : T('Click a lane to send it.', 'Haz clic en un carril para enviarlo.'))
        : T('Pick a piece: towers defend, units attack.', 'Elige una pieza: las torres defienden, las unidades atacan.');
    add(s.add.text(px, y + 34, hint, F(6, '#9aa3c7')));
  }

  _end(g, add) {
    const s = this.s, won = this.m.winner === 'party', cx = (A.x0 + A.x1) / 2, cy = 110;
    g.fillStyle(0x05040c, 0.88).fillRoundedRect(cx - 90, cy - 30, 180, 60, 6).lineStyle(2, won ? 0x7fe07a : 0xff4f7a, 1).strokeRoundedRect(cx - 90, cy - 30, 180, 60, 6);
    add(s.add.text(cx, cy - 22, won ? T('THE BASTION FALLS', 'CAE EL BASTIÓN') : T('YOUR BASE IS DOWN', 'CAYÓ SU BASE'), F(11, won ? '#9be07a' : '#ff8fb0', { heading: true })).setOrigin(0.5, 0));
    g.fillStyle(0x1a1d30, 1).fillRoundedRect(cx - 40, cy + 6, 80, 14, 3).lineStyle(1, 0xffb347, 1).strokeRoundedRect(cx - 40, cy + 6, 80, 14, 3);
    add(s.add.text(cx, cy + 9, T('continue', 'continuar'), F(7, '#ffd27f')).setOrigin(0.5, 0));
    add(s.add.zone(cx - 40, cy + 6, 80, 14).setOrigin(0).setInteractive({ useHandCursor: true })).on('pointerdown', () => this.leave());
  }

  // ---- units glide between the host's updates ----
  _syncUnits() {
    const s = this.s, seen = new Set();
    for (const u of this.m.units) {
      seen.add(u.id);
      const y = A.lanes[u.lane] + (u.kind === 'drone' ? -3 : 0), x = lx(u.x);
      let spr = this.units.get(u.id);
      if (!spr) {
        spr = { g: s.add.graphics(), x, kind: u.kind, side: u.side, owner: u.owner };
        this.unitLayer.add(spr.g); this.units.set(u.id, spr);
        spr.g.setPosition(x, y);
      }
      this._drawUnit(spr, u);
      s.tweens.killTweensOf(spr.g);
      s.tweens.add({ targets: spr.g, x, y, duration: 240 });
    }
    for (const [id, spr] of this.units) if (!seen.has(id)) {   // gone: a little pop
      this.units.delete(id); s.tweens.killTweensOf(spr.g);
      s.tweens.add({ targets: spr.g, alpha: 0, scale: 1.8, duration: 160, onComplete: () => spr.g.destroy() });
    }
  }
  _drawUnit(spr, u) {
    const g = spr.g, c = SIDE[u.owner] ?? (u.side === 'party' ? 0x6ad4ff : 0xff4f7a), d = u.side === 'party' ? 1 : -1, frac = u.hp / B.UNITS[u.kind].hp;
    g.clear();
    if (u.kind === 'runner') { g.fillStyle(0x0b0d16, 1).fillTriangle(5 * d, 0, -4 * d, -4, -4 * d, 4); g.fillStyle(c, 1).fillTriangle(4 * d, 0, -3 * d, -3, -3 * d, 3); }
    if (u.kind === 'bruiser') { g.fillStyle(0x0b0d16, 1).fillRect(-5, -5, 10, 10); g.fillStyle(c, 1).fillRect(-4, -4, 8, 8); g.fillStyle(0xffffff, 0.8).fillRect(1 * d, -2, 2, 2); }
    if (u.kind === 'drone') { g.fillStyle(c, 1).fillTriangle(0, -4, -4, 0, 0, 4).fillTriangle(0, -4, 4, 0, 0, 4); g.lineStyle(1, 0xffffff, 0.7).strokeCircle(-4, -4, 2).strokeCircle(4, -4, 2); }
    g.fillStyle(0x000000, 0.7).fillRect(-5, 6, 10, 1.5); g.fillStyle(frac > 0.5 ? 0x7fe07a : 0xffb347, 1).fillRect(-5, 6, 10 * Math.max(0, frac), 1.5);
  }

  _pulse(x, y, r, color) {
    const c = this.s.add.circle(x, y, r).setStrokeStyle(1.2, color, 1).setFillStyle(color, 0.1);
    this.dyn.add(c); this.pulses.push(c);
    this.s.tweens.add({ targets: c, alpha: 0.3, scale: 1.3, duration: 480, yoyo: true, repeat: -1 });
  }

  leave() { if (this.closed) return; this.onLeave?.(); this.close(); }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.s.input.keyboard.off('keydown', this.esc);
    for (const o of [...this.pulses, ...[...this.units.values()].map((u) => u.g)]) this.s.tweens.killTweensOf(o);
    this.root.destroy();
  }
}
