// The Lattice table: the host runs one game of the casino board game for the whole party (Trevor: "the board game
// minigame must let all players play, with ai playing for the players who are not there"). Every roommate in the
// party gets a side; a roommate nobody is playing, or whose player leaves the table, is played by the AI; the
// opponent is always the AI. Guests send moves, the host checks the move is theirs and legal, applies it with the
// rules in src/engine/lattice.js, and sends the table to everyone. Table talk (src/content/latticeTalk.js) rides
// along. No Phaser here: the scene passes `makeView` so the screen can be swapped out in tests.
import * as L from '../engine/lattice.js';
import { talkLine } from '../content/latticeTalk.js';

export const ROOMMATE_SIDES = ['trevor', 'manuel', 'michael'];
const AI_DELAY = { setup: 650, turn: 1100 };
// Lattice is required (Trevor), so the house eases off after each loss at a table until the party wins there:
// it wins about 25% of four-way games at full strength, 16% after one loss, 8% after two, 4% after three or more.
export const EASE_PER_LOSS = 0.15, EASE_MAX = 0.45;

// What changed at the table, for the talk lines.
const tally = (g) => ({
  roll: g.lastRoll ? g.lastRoll.join('') + ':' + g.turn : null,
  pieces: Object.fromEntries(g.sides.map((s) => [s, g.verts.filter((v) => v.owner === s).length + g.verts.filter((v) => v.owner === s && v.hub).length])),
  hands: Object.fromEntries(g.sides.map((s) => [s, L.RES.reduce((t, r) => t + g.hands[s][r], 0)])),
  points: Object.fromEntries(g.sides.map((s) => [s, L.points(g, s)])),
});

export class LatticeTable {
  constructor(scene, { makeView = null } = {}) {
    this.s = scene; this.makeView = makeView;
    this.g = null; this.view = null; this.id = null; this.opponent = 'The Dealer';
    this.left = new Set();      // roommates whose player stepped away from the table (the AI takes over)
    this.talk = []; this.talkN = 0;   // the latest lines, oldest first (screens play them in order)
    this.timer = null;
  }

  get host() { return this.s.mode !== 'client'; }
  get active() { return !!this.g && !this.closed; }

  /** Who is at the table: side -> peer id of the human playing it, or null for the AI. */
  seats() {
    const out = {};
    const humans = new Map();
    if (this.s.sim) for (const p of this.s.sim.players.values()) if (!String(p.id).startsWith('ai:')) humans.set(p.character, p.id);
    for (const side of this.g.sides) out[side] = side === 'npc' || this.left.has(side) ? null : humans.get(side) ?? null;
    return out;
  }

  // ---- starting ----
  /** Anyone: sit the party down at a table. A guest asks the host. */
  open(id = 'dealer', opponent = 'The Dealer', peer = this.s.localId) {
    if (!this.host) { this.s.net.send({ t: 'lattice', op: 'open', id, opponent }); return; }
    if (this.active) {   // already playing: whoever sits back down takes their side back from the AI
      const who = [...this.s.sim?.players.values() ?? []].find((p) => p.id === peer)?.character;
      if (who) this.left.delete(who);
      if (peer === this.s.localId) this._showLocal();
      this._send('state'); this._step(); return;
    }
    const party = Object.keys(this.s.save?.party ?? {});
    const sides = [...ROOMMATE_SIDES.filter((c) => party.includes(c)), 'npc'];
    const n = Number(this.s.save?.flags?.[`lattice.games.${id}`] ?? 0);
    this.g = L.newGame(`${this.s.save?.world?.seed ?? 'w'}:${id}:${n}`, sides);
    this.id = id; this.opponent = opponent; this.left = new Set(this.rematching ?? []); this.closed = false; this.recorded = false;
    const f = this.s.save?.flags ?? {};
    this.ease = f[`lattice.won.${id}`] ? 0 : Math.min(EASE_MAX, EASE_PER_LOSS * n);   // every earlier game here was a loss
    this._say('start', 'npc');
    this._send('start');
    if (!this.left.has(this.s.character)) this._showLocal();   // a host who left stays away from a rematch too
    this._step();
  }

  // ---- moves ----
  turnSide() { return this.g.phase === 'setup' ? L.setupSide(this.g) : L.side(this.g); }

  /** Host: a move from `peer`. Applied only if it's that player's side's turn and the rules allow it. */
  act(peer, a) {
    if (a?.type === 'rematch') return this.rematch(peer);
    if (!this.host || !this.active || this.g.winner || !a) return false;
    const side = this.turnSide();
    if (this.seats()[side] !== peer) return false;
    const before = tally(this.g), g = this.g;
    let ok = false, asked = null;
    switch (a.type) {
      case 'setup': ok = Number.isInteger(a.vi) && Number.isInteger(a.ei) && L.setupPlace(g, a.vi, a.ei); break;
      case 'roll': ok = L.roll(g) != null; break;
      case 'rot': ok = Number.isInteger(a.hi) && L.moveRot(g, a.hi); break;
      case 'build': ok = ['link', 'relay', 'hub'].includes(a.kind) && Number.isInteger(a.idx) && L.build(g, a.kind, a.idx); break;
      case 'bank': ok = L.RES.includes(a.give) && L.RES.includes(a.get) && L.bankTrade(g, a.give, a.get); break;
      case 'offer': {
        if (!L.RES.includes(a.give) || !L.RES.includes(a.get) || (a.to && !g.sides.includes(a.to))) break;
        const took = L.offerTrade(g, a.give, a.get, a.to || null);
        asked = a.to || g.sides.find((s) => s !== side);
        this._say(took ? 'tradeYes' : 'tradeNo', took || asked);
        ok = true; break;
      }
      case 'end': ok = L.endTurn(g); break;
      default: ok = false;
    }
    if (!ok) return false;
    this._afterChange(side, before);
    this._send('state');
    this._step();
    return true;
  }

  /** Host: after a game, anyone seated can deal the same table again (a required table never strands you). */
  rematch(peer) {
    if (!this.host || !this.active || !this.g.winner || !this.recorded) return false;
    if (!Object.values(this.seats()).includes(peer)) return false;
    // Whoever left the table stays out through a rematch (John Pork): their side stays with the AI, and their
    // screen doesn't reopen.
    const { id, opponent } = this, left = new Set(this.left);
    this.g = null; this.rematching = left;
    this.open(id, opponent, peer);
    this.rematching = null;
    return true;
  }

  /** Host: a player leaves the table; their side goes to the AI. With nobody left watching, the game is called off. */
  leave(peer) {
    if (!this.host || !this.active) return;
    const who = [...this.s.sim?.players.values() ?? []].find((p) => p.id === peer)?.character;
    if (who) this.left.add(who);
    if (!Object.values(this.seats()).some(Boolean)) { this._close(); return; }   // nobody left at the table
    this._send('state');
    this._step();
  }

  // ---- the AI ----
  _step() {
    clearTimeout(this.timer); this.timer = null;
    if (!this.active) return;
    if (this.g.winner) { this._finish(); return; }
    const side = this.turnSide();
    if (this.seats()[side]) return;   // a human's turn: wait for their move
    const delay = this.g.phase === 'setup' ? AI_DELAY.setup : AI_DELAY.turn;
    this.timer = setTimeout(() => {
      if (!this.active || this.g.winner) return;
      const before = tally(this.g), s = this.turnSide();
      if (this.g.phase === 'setup') L.aiSetup(this.g); else L.aiTurn(this.g, s === 'npc' ? { ease: this.ease } : {});
      this._afterChange(s, before);
      this._send('state');
      this._step();
    }, this.fast ? 0 : delay);
  }

  _afterChange(side, before) {
    const g = this.g, after = tally(g);
    if (after.roll !== before.roll && g.lastRoll && g.lastRoll[0] + g.lastRoll[1] === 7) this._say('seven', side);
    // a hand that shrank when a robber's grew by one: coderot moved onto them
    const robbed = g.sides.find((s) => s !== side && after.hands[s] < before.hands[s] && after.hands[side] > before.hands[side]);
    if (robbed && !g.mustMoveRot) { this._say('robbed', robbed); }
    if (after.pieces[side] > before.pieces[side] && Math.random() < 0.6) this._say('build', side);
    for (const s of g.sides) if (after.points[s] === L.TARGET - 1 && before.points[s] < L.TARGET - 1) {
      this._say('close', s);
      const other = g.sides.filter((o) => o !== s); this._say('warn', other[Math.floor(Math.random() * other.length)]);
    }
  }

  _finish() {
    if (this.recorded) return;
    this.recorded = true;
    const w = this.g.winner, party = ROOMMATE_SIDES.includes(w);
    this._say('win', w);
    const loser = this.g.sides.filter((s) => s !== w); this._say('lose', party ? 'npc' : loser[Math.floor(Math.random() * loser.length)]);
    this.s._latticeResult?.(this.id, party, w);
    this._send('state');
  }

  _close() {
    clearTimeout(this.timer); this.closed = true;
    this._send('close');
    this.view?.close?.(); this.view = null;
    this.g = null;
  }

  // ---- talk and the network ----
  _say(event, speaker) {
    const who = speaker === 'npc' ? 'dealer' : speaker;
    const line = talkLine(event, who);
    if (line) { this.talk.push({ n: ++this.talkN, who: speaker, ...line }); this.talk = this.talk.slice(-4); }
  }

  _payload(op) {
    return { t: 'lattice', op, id: this.id, opponent: this.opponent, state: this.g ? L.view(this.g) : null, ...(this.rematching ? { rematch: true } : {}),
      seats: this.g ? Object.fromEntries(Object.entries(this.seats()).map(([k, v]) => [k, v ? 'human' : 'ai'])) : null, talk: this.talk };
  }

  _send(op) {
    const msg = this._payload(op);
    if (this.s.mode === 'host') this.s.net?.broadcast?.(msg);
    if (op !== 'close') this.view?.update?.(msg);
  }

  /** The local screen: the host's (or solo player's) own view, driving moves through act(). */
  _showLocal() {
    if (this.view && !this.view.closed) return;
    if (!this.makeView) return;
    this.view = this.makeView({
      me: this.s.character, opponent: this.opponent,
      act: (a) => (this.host ? this.act(this.s.localId, a) : this.s.net.send({ t: 'lattice', op: 'act', action: a })),
      leave: () => { if (this.host) this.leave(this.s.localId); else this.s.net.send({ t: 'lattice', op: 'leave' }); this.view = null; },
    });
    this.view.update(this._payload('state'));
  }

  // ---- message routing (WorldScene) ----
  onHostMsg(peer, msg) {
    if (msg?.t !== 'lattice') return false;
    if (msg.op === 'open') this.open(typeof msg.id === 'string' ? msg.id.slice(0, 40) : 'dealer', typeof msg.opponent === 'string' ? msg.opponent.slice(0, 40) : 'The Dealer', peer);
    if (msg.op === 'act') this.act(peer, msg.action);
    if (msg.op === 'leave') this.leave(peer);
    return true;
  }

  onClientMsg(msg) {
    if (msg?.t !== 'lattice') return false;
    if (msg.op === 'close') { this.view?.close?.(); this.view = null; return true; }
    if ((msg.op === 'start' || msg.op === 'state') && msg.state) {
      if (!this.view || this.view.closed) {
        if ((msg.op !== 'start' || msg.rematch) && this.dismissed === msg.id) return true;   // they left this table: stay out, rematches too
        this.dismissed = null;
        this.opponent = msg.opponent; this._clientShow(msg);
      } else this.view.update(msg);
    }
    return true;
  }

  _clientShow(msg) {
    if (!this.makeView) return;
    this.view = this.makeView({
      me: this.s.character, opponent: msg.opponent,
      act: (a) => this.s.net.send({ t: 'lattice', op: 'act', action: a }),
      leave: () => { this.s.net.send({ t: 'lattice', op: 'leave' }); this.dismissed = msg.id; this.view = null; },
    });
    this.view.update(msg);
  }
}
