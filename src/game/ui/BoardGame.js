// Lattice, the casino board game screen (task #27). Rules: src/engine/lattice.js; the table (who plays which side,
// the AI, the network): src/game/latticeTable.js. This screen only draws the table it's given and sends moves, so
// the host, every guest and a solo player all use it (Trevor: everyone plays, the AI fills empty seats; "visually
// appealing, polished, and have dialogue in it": a felt table, portraits, animated dice, table talk in bubbles).
//   new BoardGame(scene, { me, opponent, act(move), leave() })  ·  view.update(tableMsg)  ·  view.close()
import { VIEW } from '../../view.js';
import * as L from '../../engine/lattice.js';
import { getLang } from '../../i18n.js';
import { ROOMMATES } from '../scenes/BootScene.js';

const RES_COLOR = { scrap: 0x8f96a3, wire: 0xd98a4a, cell: 0x56c9d0, gel: 0xc2559f, glass: 0x9cc7e6 };
const RES_ICON = { scrap: 'item.mat_scrap', wire: 'item.mat_wire', cell: 'item.mat_cell', gel: 'item.mat_gel', glass: 'item.mat_glass' };
const SIDE_COLOR = { trevor: 0x6a9ee8, manuel: 0x8ccc58, michael: 0xec7d76, npc: 0xb39bff, party: 0xffb347 };
const PIPS = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
const es = () => getLang() === 'es';
const T = (en, sp) => (es() ? sp : en);
const RES_NAME = () => (es() ? { scrap: 'chatarra', wire: 'cable', cell: 'celdas', gel: 'gel', glass: 'vidrio' } : { scrap: 'scrap', wire: 'wire', cell: 'cells', gel: 'gel', glass: 'glass' });
const F = (size, color = '#e8e8f0', extra = {}) => ({ fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra });
const shade = (c, k) => ((Math.min(255, ((c >> 16) & 255) * k) << 16) | (Math.min(255, ((c >> 8) & 255) * k) << 8) | Math.min(255, (c & 255) * k)) >>> 0;
const hex = (c) => '#' + c.toString(16).padStart(6, '0');

const FELT = { x: 10, y: 24, w: 286, h: 236 };
const PANEL_X = 304;

export class BoardGame {
  constructor(scene, { me = null, opponent = 'The Dealer', act = () => {}, leave = () => {} } = {}) {
    this.s = scene; this.me = me; this.opponent = opponent; this.act = act; this.onLeave = leave;
    this.closed = false; this.mode = null; this.setupVert = null; this.give = 'scrap'; this.get = 'glass'; this.to = null;
    this.msg = null; this.g = null; this.seats = {}; this.lastTalk = 0; this.lastRoll = null; this.pulses = [];
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9750);
    this.table = scene.add.container(0, 0); this.dyn = scene.add.container(0, 0); this.fx = scene.add.container(0, 0);
    this.root.add([this.table, this.dyn, this.fx]);
    this._drawTable();
    this.dice = this._makeDice();
    this.esc = (ev) => { if (ev.key === 'Escape') this.leave(); };
    scene.input.keyboard.on('keydown', this.esc);
  }

  // ---- the table itself (drawn once) ----
  _drawTable() {
    const s = this.s, g = s.add.graphics(); this.table.add(g);
    g.fillStyle(0x05060b, 1).fillRect(0, 0, VIEW.w, VIEW.h);
    // wood rim with a lit top edge, then the felt with a soft dark border
    g.fillStyle(0x2a170d, 1).fillRoundedRect(FELT.x - 6, FELT.y - 6, FELT.w + 12, FELT.h + 12, 10);
    g.fillStyle(0x4a2b18, 1).fillRoundedRect(FELT.x - 5, FELT.y - 5, FELT.w + 10, FELT.h + 10, 9);
    g.lineStyle(1, 0x7a4a2a, 0.9).strokeRoundedRect(FELT.x - 5, FELT.y - 5, FELT.w + 10, FELT.h + 10, 9);
    g.fillStyle(0x0c3324, 1).fillRoundedRect(FELT.x, FELT.y, FELT.w, FELT.h, 6);
    for (let i = 0; i < 5; i++) g.lineStyle(2, 0x061a12, 0.18 - i * 0.03).strokeRoundedRect(FELT.x + i * 2, FELT.y + i * 2, FELT.w - i * 4, FELT.h - i * 4, 6);
    g.fillStyle(0x12402e, 0.5).fillEllipse(FELT.x + FELT.w / 2, FELT.y + FELT.h / 2, FELT.w * 0.8, FELT.h * 0.7);
    // title plate
    g.fillStyle(0x11131f, 1).fillRoundedRect(VIEW.w / 2 - 70, 3, 140, 15, 4).lineStyle(1, 0xc9a24a, 0.9).strokeRoundedRect(VIEW.w / 2 - 70, 3, 140, 15, 4);
    this.table.add(s.add.text(VIEW.w / 2, 6, 'L A T T I C E', F(9, '#f2d48a', { heading: true })).setOrigin(0.5, 0));
    const leave = s.add.text(VIEW.w - 6, 6, T('[ESC] leave', '[ESC] salir'), F(7, '#9aa3c7')).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    leave.on('pointerdown', (_pointer, _x, _y, event) => {
      event.stopPropagation();
      this.leave();
    });
    this.table.add(leave);
  }

  // ---- updates from the table ----
  update(msg) {
    if (this.closed || !msg?.state) return;
    const first = !this.g;
    this.g = msg.state; this.seats = msg.seats ?? {}; this.opponent = msg.opponent ?? this.opponent;
    if (first) this._fit();
    const mine = this._mySide();
    if (this.turnSide() !== mine) { this.mode = null; this.setupVert = null; }
    if (this.g.mustMoveRot && this.turnSide() === mine) this.mode = 'rot';
    this.redraw();
    const rollKey = this.g.lastRoll ? this.g.lastRoll.join('') + ':' + this.g.turn + ':' + this.g.log.length : null;
    if (rollKey && rollKey !== this.lastRoll) { this.lastRoll = rollKey; this._rollDice(this.g.lastRoll); }
    for (const t of [].concat(msg.talk ?? [])) if (t.n > this.lastTalk) { this.lastTalk = t.n; (this.talkQ ??= []).push(t); }
    if (!this.talking) this._nextBubble();
  }

  _mySide() { return this.g?.sides.includes(this.me) && this.seats[this.me] === 'human' ? this.me : null; }
  turnSide() { return this.g.phase === 'setup' ? L.setupSide(this.g) : L.side(this.g); }
  name(side) { return side === 'npc' ? this.opponent : ROOMMATES[side]?.name ?? side; }

  _fit() {
    const xs = this.g.verts.map((v) => v.x), ys = this.g.verts.map((v) => v.y);
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    this.R = Math.min((FELT.w - 34) / w, (FELT.h - 30) / h);
    this.cx = FELT.x + FELT.w / 2 - ((Math.max(...xs) + Math.min(...xs)) / 2) * this.R;
    this.cy = FELT.y + FELT.h / 2 + 4 - ((Math.max(...ys) + Math.min(...ys)) / 2) * this.R;
  }
  px(v) { return [this.cx + v.x * this.R, this.cy + v.y * this.R]; }

  redraw() {
    if (this.closed || !this.g) return;
    for (const p of this.pulses) this.s.tweens.killTweensOf(p);
    this.pulses = [];
    this.dyn.removeAll(true);
    const s = this.s, g = this.g, R = this.R, add = (o) => { this.dyn.add(o); return o; };
    const gr = add(s.add.graphics());
    const mine = this._mySide(), myTurn = mine && this.turnSide() === mine && !g.winner;

    // ---- districts ----
    g.hexes.forEach((h, hi) => {
      const pts = h.verts.map((vi) => this.px(g.verts[vi]));
      const cx = pts.reduce((t, p) => t + p[0], 0) / 6, cy = pts.reduce((t, p) => t + p[1], 0) / 6;
      const base = h.res ? RES_COLOR[h.res] : 0x2a2d3a;
      const poly = (k, color, alpha = 1) => { gr.fillStyle(color, alpha).beginPath(); pts.forEach(([x, y], i) => { const X = cx + (x - cx) * k, Y = cy + (y - cy) * k; i ? gr.lineTo(X, Y) : gr.moveTo(X, Y); }); gr.closePath().fillPath(); };
      poly(0.98, shade(base, 0.55)); poly(0.86, base); poly(0.62, shade(base, 1.15), 0.35);
      if (h.res) {
        const icon = s.textures.get('icons')?.has?.(RES_ICON[h.res]);
        if (icon) add(s.add.image(cx, cy - R * 0.36, 'icons', RES_ICON[h.res]).setDisplaySize(R * 0.42, R * 0.42).setAlpha(0.9));
        gr.fillStyle(0x000000, 0.35).fillCircle(cx + 1, cy + R * 0.12 + 1, R * 0.27);
        gr.fillStyle(0xf3ead2, 1).fillCircle(cx, cy + R * 0.12, R * 0.27).lineStyle(1, 0x6b5a3a, 0.8).strokeCircle(cx, cy + R * 0.12, R * 0.27);
        const hot = h.num === 6 || h.num === 8;
        add(s.add.text(cx, cy + R * 0.06, `${h.num}`, F(Math.max(7, Math.round(R * 0.32)), hot ? '#b8322a' : '#1c1f33', { fontStyle: 'bold' })).setOrigin(0.5));
        const n = PIPS[h.num] ?? 0;
        for (let i = 0; i < n; i++) gr.fillStyle(hot ? 0xb8322a : 0x1c1f33, 1).fillCircle(cx + (i - (n - 1) / 2) * 2.2, cy + R * 0.3, 0.8);
      }
      if (hi === g.rot) {
        poly(0.86, 0x000000, 0.55);
        for (let i = 0; i < 4; i++) gr.lineStyle(1, 0xd65db1, 0.7).lineBetween(cx - R * 0.4, cy - R * 0.3 + i * R * 0.2, cx + R * (0.1 + (i % 2) * 0.3), cy - R * 0.3 + i * R * 0.2);
        add(s.add.text(cx, cy - R * 0.55, T('CODE ROT', 'CÓDIGO PODRIDO'), F(5, '#ff8fe0')).setOrigin(0.5));
      }
      if (this.mode === 'rot' && myTurn && hi !== g.rot) {
        this._pulseRing(cx, cy, R * 0.45, 0xd65db1);
        add(s.add.zone(cx, cy, R, R).setInteractive({ useHandCursor: true })).on('pointerdown', () => this.send({ type: 'rot', hi }));
      }
    });

    // ---- links ----
    g.edges.forEach((e, ei) => {
      const [x1, y1] = this.px(g.verts[e.a]), [x2, y2] = this.px(g.verts[e.b]);
      if (e.owner) { gr.lineStyle(5, 0x0b0d16, 1).lineBetween(x1, y1, x2, y2); gr.lineStyle(3, SIDE_COLOR[e.owner] ?? 0xffffff, 1).lineBetween(x1, y1, x2, y2); }
      const open = myTurn && ((g.phase === 'setup' && this.setupVert != null && !e.owner && (e.a === this.setupVert || e.b === this.setupVert))
        || (this.mode === 'link' && L.canLink(g, mine, ei)));
      if (open) {
        gr.lineStyle(3, 0xffffff, 0.3).lineBetween(x1, y1, x2, y2);
        this._pulseRing((x1 + x2) / 2, (y1 + y2) / 2, 3, 0xffffff);
        add(s.add.zone((x1 + x2) / 2, (y1 + y2) / 2, 12, 12).setInteractive({ useHandCursor: true })).on('pointerdown', () => this._clickEdge(ei));
      }
    });

    // ---- relays and hubs ----
    g.verts.forEach((v, vi) => {
      const [x, y] = this.px(v), c = SIDE_COLOR[v.owner] ?? 0xffffff, r = Math.max(3, R * 0.15);
      if (v.owner) {
        gr.fillStyle(0x000000, 0.4).fillCircle(x + 1, y + 1.5, r + 1);
        if (v.hub) { gr.fillStyle(0x0b0d16, 1).fillRoundedRect(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4, 2); gr.fillStyle(c, 1).fillRoundedRect(x - r - 1, y - r - 1, 2 * r + 2, 2 * r + 2, 2); gr.fillStyle(shade(c, 1.35), 1).fillRect(x - r * 0.5, y - r * 0.5, r, r); }
        else { gr.fillStyle(0x0b0d16, 1).fillCircle(x, y, r + 1); gr.fillStyle(c, 1).fillCircle(x, y, r); gr.fillStyle(0xffffff, 0.6).fillCircle(x - r * 0.35, y - r * 0.35, r * 0.3); }
      }
      const open = myTurn && ((g.phase === 'setup' && this.setupVert == null && L.canRelay(g, mine, vi, true))
        || (this.mode === 'relay' && L.canRelay(g, mine, vi)) || (this.mode === 'hub' && L.canHub(g, mine, vi)));
      if (open) {
        this._pulseRing(x, y, r + 2, 0xffffff);
        add(s.add.zone(x, y, 12, 12).setInteractive({ useHandCursor: true })).on('pointerdown', () => this._clickVert(vi));
      }
    });
    if (this.setupVert != null) { const [x, y] = this.px(g.verts[this.setupVert]); gr.fillStyle(SIDE_COLOR[mine] ?? 0xffffff, 0.7).fillCircle(x, y, Math.max(3, R * 0.15)); }

    this._players(gr, add);
    this._controls(gr, add, mine, myTurn);
    if (g.winner) this._winner(gr, add);
  }

  // ---- the player cards ----
  _players(gr, add) {
    const s = this.s, g = this.g, turn = this.turnSide();
    this.cardY = {};
    g.sides.forEach((side, i) => {
      const y = 24 + i * 30, x = PANEL_X, w = VIEW.w - PANEL_X - 6, h = 27, c = SIDE_COLOR[side] ?? 0xffffff, isTurn = side === turn && !g.winner;
      this.cardY[side] = y;
      gr.fillStyle(isTurn ? 0x1e2338 : 0x13152a, 1).fillRoundedRect(x, y, w, h, 4);
      gr.lineStyle(isTurn ? 2 : 1, isTurn ? 0xf2d48a : 0x2a2f48, 1).strokeRoundedRect(x, y, w, h, 4);
      gr.fillStyle(c, 1).fillRoundedRect(x, y, 4, h, { tl: 4, bl: 4, tr: 0, br: 0 });
      // portrait: the roommate's own sprite, the dealer's emblem
      gr.fillStyle(0x0b0d16, 1).fillRoundedRect(x + 7, y + 3, 21, 21, 3).lineStyle(1, c, 0.8).strokeRoundedRect(x + 7, y + 3, 21, 21, 3);
      if (side !== 'npc' && s.textures.exists(side)) add(s.add.image(x + 17.5, y + 6, side, 'idle_down_0').setCrop(0, 0, 16, 14).setScale(1.35).setOrigin(0.5, 0));
      else add(s.add.text(x + 17.5, y + 13.5, '♦', F(13, hex(c))).setOrigin(0.5));
      const tag = side === this._mySide() ? T(' · you', ' · tú') : this.seats[side] === 'ai' ? ' · AI' : '';
      add(s.add.text(x + 33, y + 3, this.name(side) + tag, F(7, isTurn ? '#f2d48a' : '#e8e8f0')));
      const pts = L.points(g, side);
      for (let k = 0; k < L.TARGET; k++) gr.fillStyle(k < pts ? c : 0x2a2f48, 1).fillCircle(x + 36 + k * 7, y + 18, 2.4);
      const cards = L.RES.reduce((t, r) => t + g.hands[side][r], 0);
      add(s.add.text(x + w - 5, y + 14, T(`${cards} cards`, `${cards} cartas`), F(6, '#9aa3c7')).setOrigin(1, 0));
      if (isTurn) add(s.add.text(x + w - 5, y + 3, '▶', F(7, '#f2d48a')).setOrigin(1, 0));
    });
  }

  // ---- your hand, the buttons, the status line ----
  _controls(gr, add, mine, myTurn) {
    const s = this.s, g = this.g, x0 = PANEL_X, top = 24 + g.sides.length * 30 + 2, names = RES_NAME();
    if (mine) {
      const hand = g.hands[mine];
      L.RES.forEach((r, i) => {
        const x = x0 + i * 34, y = top;
        gr.fillStyle(shade(RES_COLOR[r], 0.35), 1).fillRoundedRect(x, y, 31, 22, 3).lineStyle(1, RES_COLOR[r], 0.9).strokeRoundedRect(x, y, 31, 22, 3);
        if (s.textures.get('icons')?.has?.(RES_ICON[r])) add(s.add.image(x + 9, y + 11, 'icons', RES_ICON[r]).setDisplaySize(12, 12));
        add(s.add.text(x + 27, y + 4, `${hand[r]}`, F(9, '#ffffff', { fontStyle: 'bold' })).setOrigin(1, 0));
        add(s.add.text(x + 16, y + 15, names[r], F(5, '#c9cde0')).setOrigin(0.5, 0));
      });
    }
    let y = top + (mine ? 26 : 2);
    const btn = (label, on, fn, x, w, hot = false) => {
      gr.fillStyle(on ? (hot ? 0x3a2a12 : 0x1a1d30) : 0x101220, 1).fillRoundedRect(x, y, w, 13, 3).lineStyle(1, on ? (hot ? 0xffb347 : 0x5d6487) : 0x22263a, 1).strokeRoundedRect(x, y, w, 13, 3);
      const t = add(s.add.text(x + w / 2, y + 2, label, F(7, on ? (hot ? '#ffd27f' : '#e8e8f0') : '#3d4260')).setOrigin(0.5, 0));
      if (on) add(s.add.zone(x, y, w, 13).setOrigin(0).setInteractive({ useHandCursor: true })).on('pointerdown', fn);
      return t;
    };
    const play = myTurn && g.phase === 'play', rolled = play && g.rolled && !g.mustMoveRot;
    const can = (k) => rolled && Object.entries(L.COST[k]).every(([r, n]) => g.hands[mine][r] >= n);
    btn(T('ROLL', 'TIRAR'), play && !g.rolled, () => this.send({ type: 'roll' }), x0, 52, play && !g.rolled);
    btn(T('END TURN', 'TERMINAR'), rolled, () => { this.mode = null; this.send({ type: 'end' }); }, x0 + 56, 58);
    btn(T('LINK', 'ENLACE'), can('link'), () => this._setMode('link'), x0 + 118, 46, this.mode === 'link');
    y += 16;
    btn(T('RELAY', 'RELÉ'), can('relay'), () => this._setMode('relay'), x0, 52, this.mode === 'relay');
    btn('HUB', can('hub'), () => this._setMode('hub'), x0 + 56, 58, this.mode === 'hub');
    btn(T('costs', 'costos'), true, () => { this.msg = T('Link: scrap + wire. Relay (1 pt): scrap + wire + gel + glass. Hub (relay to 2 pts): 2 cells + 2 glass.', 'Enlace: chatarra + cable. Relé (1 pt): chatarra + cable + gel + vidrio. Hub (relé a 2 pts): 2 celdas + 2 vidrio.'); this.redraw(); }, x0 + 118, 46);
    y += 16;
    const cyc = (k) => L.RES[(L.RES.indexOf(k) + 1) % L.RES.length];
    btn(T(`give ${names[this.give]}`, `doy ${names[this.give]}`), rolled, () => { this.give = cyc(this.give); this.redraw(); }, x0, 52);
    btn(T(`get ${names[this.get]}`, `pido ${names[this.get]}`), rolled, () => { this.get = cyc(this.get); this.redraw(); }, x0 + 56, 58);
    const others = g.sides.filter((o) => o !== mine);
    if (!others.includes(this.to)) this.to = null;
    btn(this.to ? `→ ${this.name(this.to).slice(0, 7)}` : T('→ anyone', '→ quien sea'), rolled, () => { const i = this.to ? others.indexOf(this.to) + 1 : 0; this.to = i < others.length ? others[i] : null; this.redraw(); }, x0 + 118, 46);
    y += 16;
    btn(T(`BANK ${L.BANK_RATE}:1`, `BANCO ${L.BANK_RATE}:1`), rolled && g.hands[mine]?.[this.give] >= L.BANK_RATE, () => this.send({ type: 'bank', give: this.give, get: this.get }), x0, 52);
    btn(T('OFFER 1:1', 'OFRECER 1:1'), rolled && g.hands[mine]?.[this.give] >= 1, () => this.send({ type: 'offer', give: this.give, get: this.get, to: this.to }), x0 + 56, 58);
    y += 18;
    add(s.add.text(x0, y, this.msg ?? this._status(mine, myTurn), { ...F(7, '#c9cde0'), wordWrap: { width: VIEW.w - x0 - 8 } }));
  }

  _status(mine, myTurn) {
    const g = this.g, who = this.name(this.turnSide()), last = g.log[g.log.length - 1];
    if (g.winner) return '';
    if (!mine) return T(`Watching. ${who} to play.`, `Mirando. Juega ${who}.`);
    if (!myTurn) return T(`${who} is playing${this.seats[this.turnSide()] === 'ai' ? ' (AI)' : ''}…`, `Está jugando ${who}${this.seats[this.turnSide()] === 'ai' ? ' (IA)' : ''}…`);
    if (g.phase === 'setup') return this.setupVert == null ? T('Your setup: pick a glowing corner for a relay.', 'Tu turno inicial: elige una esquina brillante para un relé.') : T('Now a side next to it for your link.', 'Ahora un lado junto a ella para tu enlace.');
    if (g.mustMoveRot) return T('Seven! Click a district to move the code rot onto.', '¡Siete! Haz clic en un distrito para mover la podredumbre.');
    if (!g.rolled) return T('Your turn: roll the dice.', 'Tu turno: tira los dados.');
    return T('Build, trade, or end your turn.', 'Construye, comercia o termina tu turno.') + (last ? `  (${last})` : '');
  }

  _setMode(m) { this.msg = null; this.mode = this.mode === m ? null : m; this.redraw(); }
  _clickVert(vi) {
    if (this.g.phase === 'setup') { this.setupVert = vi; this.msg = null; this.redraw(); return; }
    if (this.mode === 'relay' || this.mode === 'hub') { this.send({ type: 'build', kind: this.mode, idx: vi }); this.mode = null; }
  }
  _clickEdge(ei) {
    if (this.g.phase === 'setup') { this.send({ type: 'setup', vi: this.setupVert, ei }); this.setupVert = null; return; }
    if (this.mode === 'link') { this.send({ type: 'build', kind: 'link', idx: ei }); this.mode = null; }
  }
  send(a) { this.msg = null; this.act(a); }

  // ---- the end of the game ----
  _winner(gr, add) {
    const s = this.s, w = this.g.winner, party = w !== 'npc', mine = w === this._mySide();
    const bx = FELT.x + FELT.w / 2, by = FELT.y + FELT.h / 2;
    gr.fillStyle(0x05060b, 0.82).fillRoundedRect(bx - 100, by - 34, 200, 68, 6).lineStyle(2, 0xf2d48a, 1).strokeRoundedRect(bx - 100, by - 34, 200, 68, 6);
    const title = mine ? T('YOU WIN', 'GANASTE') : T(`${this.name(w).toUpperCase()} WINS`, `GANA ${this.name(w).toUpperCase()}`);
    add(s.add.text(bx, by - 26, title, F(12, party ? '#9be07a' : '#e58adf', { heading: true })).setOrigin(0.5, 0));
    add(s.add.text(bx, by - 8, party ? T('The party beats the house.', 'El grupo le gana a la casa.') : T('The house wins this one.', 'Esta la gana la casa.'), F(7, '#c9cde0')).setOrigin(0.5, 0));
    const y = by + 10;
    gr.fillStyle(0x3a2a12, 1).fillRoundedRect(bx - 45, y, 90, 15, 3).lineStyle(1, 0xffb347, 1).strokeRoundedRect(bx - 45, y, 90, 15, 3);
    add(s.add.text(bx, y + 3, T('leave the table', 'dejar la mesa'), F(7, '#ffd27f')).setOrigin(0.5, 0));
    add(s.add.zone(bx - 45, y, 90, 15).setOrigin(0).setInteractive({ useHandCursor: true })).on('pointerdown', () => this.leave());
  }

  // ---- little bits of life: pulsing spots, dice, speech bubbles ----
  _pulseRing(x, y, r, color) {
    const c = this.s.add.circle(x, y, r).setStrokeStyle(1.5, color, 1).setFillStyle(color, 0.12);
    this.dyn.add(c); this.pulses.push(c);
    this.s.tweens.add({ targets: c, alpha: 0.35, scale: 1.25, duration: 520, yoyo: true, repeat: -1 });
  }

  _makeDice() {
    const s = this.s, x = FELT.x + FELT.w - 40, y = FELT.y + 8, dice = [];
    for (let i = 0; i < 2; i++) { const g = s.add.graphics(); this.fx.add(g); dice.push({ g, x: x + i * 17, y }); }
    dice.forEach((d) => this._face(d, 0));
    return dice;
  }
  _face(d, n) {
    const g = d.g; g.clear();
    g.fillStyle(0x000000, 0.4).fillRoundedRect(d.x + 1, d.y + 2, 14, 14, 3);
    g.fillStyle(n ? 0xf6f1e4 : 0x2a2f48, 1).fillRoundedRect(d.x, d.y, 14, 14, 3).lineStyle(1, 0x8a7a5a, 1).strokeRoundedRect(d.x, d.y, 14, 14, 3);
    const P = { 1: [[7, 7]], 2: [[4, 4], [10, 10]], 3: [[4, 4], [7, 7], [10, 10]], 4: [[4, 4], [10, 4], [4, 10], [10, 10]], 5: [[4, 4], [10, 4], [7, 7], [4, 10], [10, 10]], 6: [[4, 3.5], [10, 3.5], [4, 7], [10, 7], [4, 10.5], [10, 10.5]] }[n] ?? [];
    for (const [px, py] of P) g.fillStyle(n === 6 || n === 1 ? 0xb8322a : 0x1c1f33, 1).fillCircle(d.x + px, d.y + py, 1.3);
  }
  _rollDice(final) {
    let k = 0;
    const spin = this.s.time.addEvent({ delay: 55, repeat: 8, callback: () => {
      if (this.closed) return spin.remove();
      k++;
      this.dice.forEach((d, i) => this._face(d, k > 8 ? final[i] : 1 + Math.floor(Math.random() * 6)));
    } });
    this.s.tweens.add({ targets: this.dice.map((d) => d.g), y: -3, duration: 120, yoyo: true, repeat: 1 });
  }

  // Lines play one after another, so an exchange reads like one ("The house wins." / "I let you have that one.").
  _nextBubble() {
    const t = this.talkQ?.shift();
    if (!t || this.closed) { this.talking = false; return; }
    this.talking = true;
    const text = es() ? t.es : t.en;
    this._bubble(t);
    this.s.time.delayedCall(1400 + text.length * 35, () => this._nextBubble());
  }

  _bubble(t) {
    this.bub?.forEach((o) => { this.s.tweens.killTweensOf(o); o.destroy(); });
    const s = this.s, text = es() ? t.es : t.en, y = (this.cardY?.[t.who] ?? 40) + 2, w = 150;
    const label = s.add.text(0, 0, `${this.name(t.who)}: `, F(6, hex(SIDE_COLOR[t.who] ?? 0xffffff), { fontStyle: 'bold' }));
    const body = s.add.text(0, 0, '', { ...F(7, '#1c1f33'), wordWrap: { width: w - 12 } });
    body.setText(text); const h = Math.max(18, body.height + label.height + 6); body.setText('');
    const x = PANEL_X - w - 6;
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.35).fillRoundedRect(x + 1, y + 2, w, h, 5);
    g.fillStyle(0xf6f1e4, 1).fillRoundedRect(x, y, w, h, 5).lineStyle(1, SIDE_COLOR[t.who] ?? 0xffffff, 1).strokeRoundedRect(x, y, w, h, 5);
    g.fillStyle(0xf6f1e4, 1).fillTriangle(x + w - 1, y + 6, x + w + 6, y + 9, x + w - 1, y + 12);
    label.setPosition(x + 6, y + 3); body.setPosition(x + 6, y + 3 + label.height);
    this.fx.add([g, label, body]); this.bub = [g, label, body];
    let i = 0;
    const type = s.time.addEvent({ delay: 22, repeat: text.length - 1, callback: () => { if (body.active) body.setText(text.slice(0, ++i)); } });
    s.tweens.add({ targets: this.bub, alpha: 0, delay: 3200 + text.length * 30, duration: 400, onComplete: () => type.remove() });
  }

  leave() { if (this.closed) return; this.onLeave?.(); this.close(); }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.s.input.keyboard.off('keydown', this.esc);
    for (const o of [...this.pulses, ...(this.bub ?? []), ...this.dice.map((d) => d.g)]) this.s.tweens.killTweensOf(o);
    this.root.destroy();
  }
}
