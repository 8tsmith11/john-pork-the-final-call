// The lab bench (hub #44): the party works one SystemVerilog-style lab together (rules: src/engine/verilogLab.js).
// The host keeps the bench (choices, test results); anyone at the bench can cycle a blank or run the testbench, and
// everyone sees the same code. A passed lab sets lab.passed.<id> for the story. Phaser-free; the scene passes makeView.
import * as V from '../engine/verilogLab.js';

export class LabBench {
  constructor(scene, { makeView = null } = {}) { this.s = scene; this.makeView = makeView; this.bench = null; this.view = null; }
  get host() { return this.s.mode !== 'client'; }

  open(labId = 'mux') {
    if (!this.host) { this.s.net.send({ t: 'lab', op: 'open', lab: labId }); return; }
    const book = !!this.s.save?.flags?.['lab.book'];   // the 245 book, wherever the party got it (story sets the flag)
    if (!this.bench || this.bench.lab !== labId) this.bench = V.newBench(labId, { book });
    else this.bench.book = book;
    this._send('open'); this._showLocal();
  }

  /** Host: a move from anyone at the bench (cycle a blank, or run the tests). */
  act(a) {
    if (!this.host || !this.bench || !a) return false;
    const ok = a.type === 'cycle' ? V.cycle(this.bench, a.i | 0) : a.type === 'run' ? (V.runTests(this.bench), true) : false;
    if (!ok) return false;
    if (this.bench.passed && !this.s.save?.flags?.[`lab.passed.${this.bench.lab}`]) this.s._labPassed?.(this.bench.lab);
    this._send('state');
    return true;
  }

  _payload(op) { return { t: 'lab', op, bench: this.bench && JSON.parse(JSON.stringify(this.bench)) }; }
  _send(op) {
    const msg = this._payload(op);
    if (this.s.mode === 'host') this.s.net?.broadcast?.(msg);
    this.view?.update?.(msg.bench);
  }
  _showLocal() {
    if ((this.view && !this.view.closed) || !this.makeView) return;
    this.view = this.makeView({ act: (a) => (this.host ? this.act(a) : this.s.net.send({ t: 'lab', op: 'act', action: a })), leave: () => { this.view = null; } });
    this.view.update(this.bench);
  }

  onHostMsg(peer, msg) {
    if (msg?.t !== 'lab') return false;
    if (msg.op === 'open' && typeof msg.lab === 'string' && V.labById(msg.lab)) this.open(msg.lab);
    if (msg.op === 'act') this.act(msg.action);
    return true;
  }
  onClientMsg(msg) {
    if (msg?.t !== 'lab') return false;
    if (!msg.bench) return true;
    this.bench = msg.bench;
    if (msg.op === 'open' && (!this.view || this.view.closed) && this.makeView) this.view = this.makeView({ act: (a) => this.s.net.send({ t: 'lab', op: 'act', action: a }), leave: () => { this.view = null; } });
    this.view?.update?.(this.bench);
    return true;
  }
}
