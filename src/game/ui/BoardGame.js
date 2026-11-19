// The casino board game screen (task #27). Rules: src/engine/lattice.js. Full-screen overlay:
// the hex board on the left, your hand, costs and actions on the right. The opponent's turns play
// out with short pauses so you can follow them. Opens with new BoardGame(scene, { opponent, seed, onEnd }).
import { VIEW } from '../../view.js';
import * as L from '../../engine/lattice.js';

const RES_COLOR = { scrap: 0x8a8f9c, wire: 0xd98a4a, cell: 0x6fe3e8, gel: 0xd65db1, glass: 0xb8d8f0 };
const RES_NAME = { scrap: 'scrap', wire: 'wire', cell: 'cells', gel: 'gel', glass: 'glass' };
const SIDE_COLOR = { party: 0xffb347, npc: 0x9b7bff };
const F = (size, color = '#e8e8f0') => ({ fontFamily: 'monospace', fontSize: `${size}px`, color });

export class BoardGame {
  constructor(scene, { opponent = 'The dealer', seed = 'casino', onEnd = null } = {}) {
    this.s = scene; this.opponent = opponent; this.onEnd = onEnd; this.closed = false;
    this.g = L.newGame(seed, ['party', 'npc']);
    this.mode = null; this.give = 'scrap'; this.get = 'glass'; this.msg = 'Setup: pick a corner for your first relay, then a side next to it.';
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9750);
    this.cx = 133; this.cy = 142; this.R = 36;   // board centre and hex radius (view px)
    this.esc = (ev) => { if (ev.key === 'Escape') this.close(false); };
    scene.input.keyboard.on('keydown', this.esc);
    this.redraw();
    this._maybeNpc();
  }

  px(v) { return [this.cx + v.x * this.R, this.cy + v.y * this.R]; }

  redraw() {
    if (this.closed) return;
    this.root.removeAll(true);
    const s = this.s, g = this.g, add = (o) => { this.root.add(o); return o; };
    const gr = add(s.add.graphics());
    gr.fillStyle(0x07080e, 1).fillRect(0, 0, VIEW.w, VIEW.h);
    gr.fillStyle(0x0d2a1f, 1).fillRoundedRect(8, 22, 250, 240, 6).lineStyle(1, 0x2f6f4f, 1).strokeRoundedRect(8, 22, 250, 240, 6);   // felt
    add(s.add.text(VIEW.w / 2, 6, `LATTICE  ·  you vs ${this.opponent}`, { ...F(9, '#ffd27f'), heading: true }).setOrigin(0.5, 0));
    // hexes
    g.hexes.forEach((h, hi) => {
      const pts = h.verts.map((vi) => this.px(g.verts[vi]));
      gr.fillStyle(h.res ? RES_COLOR[h.res] : 0x2a2d3a, hi === g.rot ? 0.35 : 0.85).beginPath();
      pts.forEach(([x, y], i) => (i ? gr.lineTo(x, y) : gr.moveTo(x, y))); gr.closePath().fillPath();
      gr.lineStyle(1, 0x0b0d16, 1).strokePath();
      const [cx, cy] = [pts.reduce((t, p) => t + p[0], 0) / 6, pts.reduce((t, p) => t + p[1], 0) / 6];
      if (h.num) {
        gr.fillStyle(0xf5ecd7, 1).fillCircle(cx, cy, 7);
        add(s.add.text(cx, cy, `${h.num}`, F(8, h.num === 6 || h.num === 8 ? '#c0392b' : '#1c1f33')).setOrigin(0.5));
        add(s.add.text(cx, cy + 10, RES_NAME[h.res], F(5, '#0b0d16')).setOrigin(0.5, 0));
      }
      if (hi === g.rot) add(s.add.text(cx, cy - 12, 'CODE ROT', F(5, '#d65db1')).setOrigin(0.5));
      if (this.mode === 'rot' && hi !== g.rot) {
        const z = add(s.add.zone(cx, cy, 30, 30).setInteractive({ useHandCursor: true }));
        z.on('pointerdown', () => { if (L.moveRot(g, hi)) { this.mode = null; this.msg = 'Coderot moved. Build, trade, or end your turn.'; this.redraw(); } });
        gr.lineStyle(2, 0xd65db1, 0.9).strokeCircle(cx, cy, 13);
      }
    });
    // edges
    const me = 'party', turnSide = g.phase === 'setup' ? L.setupSide(g) : L.side(g);
    g.edges.forEach((e, ei) => {
      const [x1, y1] = this.px(g.verts[e.a]), [x2, y2] = this.px(g.verts[e.b]);
      if (e.owner) gr.lineStyle(4, SIDE_COLOR[e.owner], 1).lineBetween(x1, y1, x2, y2);
      const open = (g.phase === 'setup' && turnSide === me && this.setupVert != null && !e.owner && (e.a === this.setupVert || e.b === this.setupVert))
        || (this.mode === 'link' && L.canLink(g, me, ei));
      if (open) {
        gr.lineStyle(3, 0xffffff, 0.35).lineBetween(x1, y1, x2, y2);
        const z = add(s.add.zone((x1 + x2) / 2, (y1 + y2) / 2, 12, 12).setInteractive({ useHandCursor: true }));
        z.on('pointerdown', () => this._clickEdge(ei));
      }
    });
    // corners
    g.verts.forEach((v, vi) => {
      const [x, y] = this.px(v);
      if (v.owner) {
        gr.fillStyle(SIDE_COLOR[v.owner], 1);
        if (v.hub) gr.fillRect(x - 5, y - 5, 10, 10).lineStyle(1, 0x0b0d16).strokeRect(x - 5, y - 5, 10, 10);
        else gr.fillCircle(x, y, 4).lineStyle(1, 0x0b0d16).strokeCircle(x, y, 4);
      }
      const open = (g.phase === 'setup' && turnSide === me && this.setupVert == null && L.canRelay(g, me, vi, true))
        || (this.mode === 'relay' && L.canRelay(g, me, vi)) || (this.mode === 'hub' && L.canHub(g, me, vi));
      if (open) {
        gr.lineStyle(1, 0xffffff, 0.8).strokeCircle(x, y, 5);
        const z = add(s.add.zone(x, y, 12, 12).setInteractive({ useHandCursor: true }));
        z.on('pointerdown', () => this._clickVert(vi));
      }
    });
    if (this.setupVert != null) { const [x, y] = this.px(g.verts[this.setupVert]); gr.fillStyle(SIDE_COLOR.party, 0.6).fillCircle(x, y, 4); }
    // right panel
    const rx = 268; let y = 26;
    const line = (text, color, size = 7) => { const t = add(s.add.text(rx, y, text, { ...F(size, color), wordWrap: { width: VIEW.w - rx - 8 } })); y += t.height + 2; return t; };
    line(`You ${L.points(g, 'party')}  ·  ${this.opponent} ${L.points(g, 'npc')}   (first to ${L.TARGET})`, '#ffd27f', 8);
    line(g.lastRoll ? `Last roll: ${g.lastRoll[0]} + ${g.lastRoll[1]} = ${g.lastRoll[0] + g.lastRoll[1]}` : 'No rolls yet.', '#9aa3c7');
    y += 2; line('YOUR HAND', '#ffb347');
    const hand = g.hands.party;
    for (const r of L.RES) {
      gr.fillStyle(RES_COLOR[r], 1).fillRect(rx, y + 1, 6, 6);
      add(s.add.text(rx + 9, y, `${RES_NAME[r]} ${hand[r]}`, F(7)));
      add(s.add.text(rx + 70, y, `them: ${g.hands.npc[r]}`, F(6, '#5d6487')));
      y += 9;
    }
    y += 3; line('COSTS  link: scrap+wire · relay: scrap+wire+gel+glass (1 pt) · hub: 2 cells+2 glass (relay → 2 pts)', '#5d6487', 6);
    y += 2; line(this.msg, '#e8e8f0', 7);
    // buttons
    const yourTurn = g.phase === 'play' && L.side(g) === me && !g.winner;
    const btn = (label, on, fn, x, yy, w = 62) => {
      const b = add(s.add.text(x, yy, label, { ...F(7, on ? '#ffb347' : '#3d4260'), backgroundColor: '#11131f', padding: { x: 3, y: 2 } }));
      if (on) b.setInteractive({ useHandCursor: true }).on('pointerdown', fn);
      return b;
    };
    const by = 196;
    btn('ROLL', yourTurn && !g.rolled, () => { const n = L.roll(g); this.msg = n === 7 ? 'Seven. Pick a district for the coderot.' : `Rolled ${n}.`; if (g.mustMoveRot) this.mode = 'rot'; this.redraw(); }, rx, by);
    btn('END TURN', yourTurn && g.rolled && !g.mustMoveRot, () => { this.mode = null; L.endTurn(g); this.msg = `${this.opponent}'s turn.`; this.redraw(); this._maybeNpc(); }, rx + 70, by);
    const can = (k) => yourTurn && g.rolled && !g.mustMoveRot && Object.entries(L.COST[k]).every(([r, n]) => hand[r] >= n);
    btn(this.mode === 'link' ? '[LINK]' : 'LINK', can('link'), () => this._setMode('link'), rx, by + 16, 40);
    btn(this.mode === 'relay' ? '[RELAY]' : 'RELAY', can('relay'), () => this._setMode('relay'), rx + 46, by + 16, 40);
    btn(this.mode === 'hub' ? '[HUB]' : 'HUB', can('hub'), () => this._setMode('hub'), rx + 98, by + 16, 40);
    const tradeOn = yourTurn && g.rolled && !g.mustMoveRot;
    btn(`give ${RES_NAME[this.give]}`, tradeOn, () => { this.give = L.RES[(L.RES.indexOf(this.give) + 1) % L.RES.length]; this.redraw(); }, rx, by + 32);
    btn(`get ${RES_NAME[this.get]}`, tradeOn, () => { this.get = L.RES[(L.RES.indexOf(this.get) + 1) % L.RES.length]; this.redraw(); }, rx + 70, by + 32);
    btn(`BANK ${L.BANK_RATE}:1`, tradeOn && hand[this.give] >= L.BANK_RATE, () => { if (L.bankTrade(g, this.give, this.get)) this.msg = `Traded ${L.BANK_RATE} ${RES_NAME[this.give]} for 1 ${RES_NAME[this.get]}.`; this.redraw(); }, rx, by + 48);
    btn('OFFER 1:1', tradeOn && hand[this.give] >= 1, () => { this.msg = L.offerTrade(g, this.give, this.get) ? `${this.opponent} takes the trade.` : `${this.opponent} shakes their head.`; this.redraw(); }, rx + 70, by + 48);
    btn('[ESC] leave', true, () => this.close(false), VIEW.w - 60, 8);
    if (g.winner) {
      const won = g.winner === 'party';
      gr.fillStyle(0x07080e, 0.85).fillRect(40, 110, 180, 50).lineStyle(1, 0xffd27f).strokeRect(40, 110, 180, 50);
      add(s.add.text(130, 122, won ? 'YOU WIN' : `${this.opponent.toUpperCase()} WINS`, { ...F(11, won ? '#7fb069' : '#d65db1'), heading: true }).setOrigin(0.5));
      btn('continue', true, () => this.close(won), 108, 140);
    }
  }

  _setMode(m) { this.mode = this.mode === m ? null : m; this.msg = { link: 'Pick a glowing side.', relay: 'Pick a glowing corner.', hub: 'Pick one of your relays.' }[m] ?? this.msg; this.redraw(); }

  _clickVert(vi) {
    const g = this.g;
    if (g.phase === 'setup') { this.setupVert = vi; this.msg = 'Now pick a side next to it.'; this.redraw(); return; }
    if ((this.mode === 'relay' || this.mode === 'hub') && L.build(g, this.mode, vi)) { this.msg = this.mode === 'hub' ? 'Hub up: double output.' : 'Relay built.'; this.mode = null; this._afterBuild(); }
  }
  _clickEdge(ei) {
    const g = this.g;
    if (g.phase === 'setup') {
      if (L.setupPlace(g, this.setupVert, ei)) { this.setupVert = null; this.msg = g.phase === 'play' ? 'Your turn: ROLL.' : 'Placed.'; this.redraw(); this._maybeNpc(); }
      return;
    }
    if (this.mode === 'link' && L.build(g, 'link', ei)) { this.msg = 'Link built.'; this.mode = null; this._afterBuild(); }
  }
  _afterBuild() { this.redraw(); }

  // The opponent plays its setup placements and turns with short pauses.
  _maybeNpc() {
    const g = this.g;
    if (this.closed || g.winner) return;
    const npcSetup = g.phase === 'setup' && L.setupSide(g) === 'npc';
    const npcTurn = g.phase === 'play' && L.side(g) === 'npc';
    if (!npcSetup && !npcTurn) return;
    this.s.time.delayedCall(npcSetup ? 500 : 900, () => {
      if (this.closed) return;
      if (npcSetup) { L.aiSetup(g); this.msg = g.phase === 'play' ? 'Your turn: ROLL.' : (L.setupSide(g) === 'party' ? 'Your placement: a corner, then a side.' : `${this.opponent} places.`); }
      else { L.aiTurn(g); const r = g.lastRoll; this.msg = g.winner ? '' : `${this.opponent} rolled ${r ? r[0] + r[1] : '?'}. Your turn: ROLL.`; }
      this.redraw(); this._maybeNpc();
    });
  }

  close(won) {
    if (this.closed) return;
    this.closed = true;
    this.s.input.keyboard.off('keydown', this.esc);
    this.root.destroy();
    this.onEnd?.(won, this.g);
  }
}
