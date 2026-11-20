// The signal-routing puzzle in co-op (Trevor: "make sure everyone can participate or at least spectate; no race
// conditions with multiple people doing the same puzzle"). The host keeps each panel's tile rotations. Anyone at the
// panel sees the same board live and can turn tiles; turns go through the host one at a time, so two people clicking
// at once can't fight; only the host decides it's solved, once. Phaser-free; the scene passes makeView.
//   host <- guest { t: 'pipe', op: 'open' | 'rot', id, i?, j? }
//   host -> all   { t: 'pipe', op: 'state', id, rots, by? }   { t: 'pipe', op: 'solved', id, by }
import { PipePuzzle } from './ui/PipePuzzle.js';

export class PipeTable {
  constructor(scene, { makeView = null, near = null, solved = null } = {}) {
    this.s = scene; this.makeView = makeView;
    this.near = near;        // host: (peer, objectId) -> is that player at the panel?
    this.solvedCb = solved;  // host: (object, peer) -> record it (flag, toast)
    this.state = new Map();  // host: id -> rotations
    this.views = new Map();  // this screen: id -> view
  }
  get host() { return this.s.mode !== 'client'; }
  _seed(id) { return `${this.s.save?.world?.seed ?? 'w'}:${id}`; }
  _obj(id) { return this.s.map?.objects?.find((o) => o.id === id && o.puzzle === 'pipes'); }
  _rots(id) {
    if (!this.state.has(id)) this.state.set(id, new PipePuzzle(null, this._seed(id)).rots());
    return this.state.get(id);
  }

  /** Someone on this screen walks up to the panel. */
  open(o, onSolvedHere) {
    if (this.views.get(o.id) && !this.views.get(o.id).closed) return this.views.get(o.id);
    const v = this.makeView?.(this._seed(o.id), (i, j) => this.rotate(o.id, i, j), onSolvedHere);
    if (v) this.views.set(o.id, v);
    if (this.host) v?.setRots(this._rots(o.id));
    else this.s.net.send({ t: 'pipe', op: 'open', id: o.id });
    return v;
  }

  rotate(id, i, j) {
    if (this.host) this.apply(this.s.localId, id, i, j);
    else this.s.net.send({ t: 'pipe', op: 'rot', id, i, j });
  }

  /** Host: one turn, from anyone at the panel. Returns true if it turned. */
  apply(peer, id, i, j) {
    const o = this._obj(id);
    if (!this.host || !o || this.s.save?.flags?.[o.solvedFlag] || !Number.isInteger(i) || !Number.isInteger(j)) return false;
    if (this.near && !this.near(peer, id)) return false;
    const model = new PipePuzzle(null, this._seed(id)); model.setRots(this._rots(id));
    const c = model.grid[j]?.[i];
    if (!c || c.locked) return false;
    c.r = (c.r + 1) % 4;
    const rots = model.rots(); this.state.set(id, rots);
    this._send({ t: 'pipe', op: 'state', id, rots, by: peer });
    if (model.solved()) { this.solvedCb?.(o, peer); this._send({ t: 'pipe', op: 'solved', id, by: peer }); }
    return true;
  }

  _send(msg) { if (this.s.mode === 'host') this.s.net?.broadcast(msg); this._show(msg); }

  _show(msg) {
    const v = this.views.get(msg.id);
    if (msg.op === 'state') v?.setRots(msg.rots);
    if (msg.op === 'solved') { v?.finish(); this.views.delete(msg.id); if (msg.by === this.s.localId) this.s._pipeSolvedHere?.(msg.id); }
  }

  onHostMsg(peer, msg) {
    if (msg?.t !== 'pipe') return false;
    if (msg.op === 'open' && this._obj(msg.id)) this.s.net?.send(peer, { t: 'pipe', op: 'state', id: msg.id, rots: this._rots(msg.id) });
    if (msg.op === 'rot') this.apply(peer, msg.id, msg.i, msg.j);
    return true;
  }
  onClientMsg(msg) { if (msg?.t !== 'pipe') return false; this._show(msg); return true; }
}
