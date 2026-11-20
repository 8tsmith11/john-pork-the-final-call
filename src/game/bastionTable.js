// The Bastion table (hub #34): the host runs a real-time match of the two-way tower defense (src/engine/bastion.js)
// for the whole party. Every roommate plays their own energy; the AI plays any roommate nobody is playing (or who
// steps away) and the opponent. Guests send placements; the host checks they're theirs and legal, steps the clock
// and sends the board to everyone a few times a second. No Phaser here: the scene passes `makeView`.
import * as B from '../engine/bastion.js';
import { ROOMMATE_SIDES } from './latticeTable.js';

const TICK = 0.1, SEND_EVERY = 0.25, AI_EVERY = 1.0;

export class BastionTable {
  constructor(scene, { makeView = null, clock = null } = {}) {
    this.s = scene; this.makeView = makeView; this.clock = clock;
    this.m = null; this.view = null; this.id = null; this.left = new Set(); this.closed = true;
    this.timer = null; this.sinceSend = 0; this.sinceAi = 0; this.recorded = false;
  }

  get host() { return this.s.mode !== 'client'; }
  get active() { return !!this.m && !this.closed; }

  /** roommate -> peer id of the human playing it, or null for the AI. */
  seats() {
    const humans = new Map();
    if (this.s.sim) for (const p of this.s.sim.players.values()) if (!String(p.id).startsWith('ai:')) humans.set(p.character, p.id);
    return Object.fromEntries(this.m.roommates.map((r) => [r, this.left.has(r) ? null : humans.get(r) ?? null]));
  }

  open(id = 'match', { difficulty } = {}, peer = this.s.localId) {
    if (!this.host) { this.s.net.send({ t: 'bastion', op: 'open', id }); return; }
    if (this.active) {
      const who = [...this.s.sim?.players.values() ?? []].find((p) => p.id === peer)?.character;
      if (who) this.left.delete(who);
      if (peer === this.s.localId) this._showLocal();
      this._send('state'); return;
    }
    const party = Object.keys(this.s.save?.party ?? {}), roommates = ROOMMATE_SIDES.filter((c) => party.includes(c));
    const n = Number(this.s.save?.flags?.[`bastion.games.${id}`] ?? 0);
    this.m = B.fortify(B.newMatch(`${this.s.save?.world?.seed ?? 'w'}:${id}:${n}`, roommates, difficulty ? { difficulty } : {}));
    this.id = id; this.left = new Set(); this.closed = false; this.recorded = false; this.sinceSend = 0; this.sinceAi = 0;
    this._send('start');
    this._showLocal();
    this._run();
  }

  /** Host: a placement from `peer`. Only for their own roommate's energy, and only if the rules allow it. */
  act(peer, a) {
    if (!this.host || !this.active || this.m.winner || !a) return false;
    const who = Object.entries(this.seats()).find(([, p]) => p === peer)?.[0];
    if (!who) return false;
    const lane = a.lane | 0, ok = a.type === 'tower' ? B.place(this.m, who, a.kind, lane, a.slot | 0) : a.type === 'unit' ? B.send(this.m, who, a.kind, lane) : false;
    if (ok) this._send('state');
    return ok;
  }

  leave(peer) {
    if (!this.host || !this.active) return;
    const who = [...this.s.sim?.players.values() ?? []].find((p) => p.id === peer)?.character;
    if (who) this.left.add(who);
    if (!Object.values(this.seats()).some(Boolean)) this._close();
  }

  /** Host: advance the match by dt seconds (the real-time loop calls this; tests call it directly). */
  tick(dt = TICK) {
    if (!this.active || this.m.winner) return;
    B.step(this.m, dt);
    this.sinceAi += dt; this.sinceSend += dt;
    if (this.sinceAi >= AI_EVERY) {
      this.sinceAi = 0;
      const seats = this.seats();
      for (const r of this.m.roommates) if (!seats[r]) B.aiAct(this.m, r);
      B.aiAct(this.m, 'npc');
    }
    if (this.m.winner) { this._finish(); return; }
    if (this.sinceSend >= SEND_EVERY) { this.sinceSend = 0; this._send('state'); }
  }

  _run() {
    clearInterval(this.timer);
    if (this.clock === 'manual') return;   // tests drive tick() themselves
    this.timer = setInterval(() => { if (!this.active || this.m.winner) { clearInterval(this.timer); return; } this.tick(TICK); }, TICK * 1000);
  }

  _finish() {
    clearInterval(this.timer);
    if (this.recorded) return;
    this.recorded = true;
    this.s._bastionResult?.(this.id, this.m.winner === 'party');
    this._send('state');
  }

  _close() {
    clearInterval(this.timer); this.closed = true;
    this._send('close');
    this.view?.close?.(); this.view = null; this.m = null;
  }

  _payload(op) {
    return { t: 'bastion', op, id: this.id, state: this.m ? B.view(this.m) : null,
      seats: this.m ? Object.fromEntries(Object.entries(this.seats()).map(([k, v]) => [k, v ? 'human' : 'ai'])) : null };
  }
  _send(op) {
    const msg = this._payload(op);
    if (this.s.mode === 'host') this.s.net?.broadcast?.(msg);
    if (op !== 'close') this.view?.update?.(msg);
  }

  _showLocal() {
    if ((this.view && !this.view.closed) || !this.makeView) return;
    this.view = this.makeView({
      me: this.s.character,
      act: (a) => (this.host ? this.act(this.s.localId, a) : this.s.net.send({ t: 'bastion', op: 'act', action: a })),
      leave: () => { if (this.host) this.leave(this.s.localId); else this.s.net.send({ t: 'bastion', op: 'leave' }); this.view = null; },
    });
    this.view.update(this._payload('state'));
  }

  onHostMsg(peer, msg) {
    if (msg?.t !== 'bastion') return false;
    if (msg.op === 'open') this.open(typeof msg.id === 'string' ? msg.id.slice(0, 40) : 'match', {}, peer);
    if (msg.op === 'act') this.act(peer, msg.action);
    if (msg.op === 'leave') this.leave(peer);
    return true;
  }

  onClientMsg(msg) {
    if (msg?.t !== 'bastion') return false;
    if (msg.op === 'close') { this.view?.close?.(); this.view = null; return true; }
    if (!msg.state) return true;
    if (!this.view || this.view.closed) {
      if (msg.op !== 'start' && this.dismissed === msg.id) return true;
      this.dismissed = null;
      if (!this.makeView) return true;
      this.view = this.makeView({ me: this.s.character, act: (a) => this.s.net.send({ t: 'bastion', op: 'act', action: a }),
        leave: () => { this.s.net.send({ t: 'bastion', op: 'leave' }); this.dismissed = msg.id; this.view = null; } });
    }
    this.view.update(msg);
    return true;
  }
}
