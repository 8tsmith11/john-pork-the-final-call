// Shared events (D-014): an important scene plays on EVERY roommate's screen at once.
//
//   scene.shared.start('romance_trevor', 'finale', onDone)
//
// The local player is the MAIN player: their dialogue runs as usual (their choices, their effects),
// and they can't skip it. Everyone else gets a live mirror of the main player's dialogue box: same
// speaker, line and choices, updated as the main player reads. Watchers can't advance or choose,
// and they can skip with X (or Esc), which closes it on their screen only.
//
// Wire format (host relays client messages to the other clients):
//   { t: 'evStart', id, main }  { t: 'evState', id, state: { who, text, choices: [text] } }  { t: 'evEnd', id }
// Works in solo too (it's just a normal dialogue then).
import { VIEW } from '../view.js';

class Mirror {
  constructor(main) { this.spectator = true; this.main = main; this.done = false; this.line = null; this._choices = []; this.nodeId = null; }
  get choices() { return this._choices; }
  set(state) {
    this.line = state.text || state.who ? { who: state.who, text: state.text } : null;   // a new object = a new line
    this._choices = (state.choices ?? []).map((text) => ({ text }));
    this.nodeId = state.nodeId ?? null;
  }
  advance() {}
  choose() {}
}

export class SharedEvents {
  constructor(scene) {
    this.s = scene;
    this.active = null;     // the event this player is driving
    this.watching = null;   // the event this player is mirroring
    scene.input.keyboard.on('keydown', (ev) => {
      if (!this.s.dlg?.spectator) return;
      if (ev.key === 'x' || ev.key === 'X' || ev.key === 'Escape') this.skip();
    });
    scene.time.addEvent({ delay: 100, loop: true, callback: () => this._pump() });
    this.banner = scene.add.text(VIEW.w / 2, 22, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffb347', backgroundColor: '#0b0d16cc', padding: { x: 4, y: 2 } })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(9600).setVisible(false);
  }

  /** Start a shared scene with the local player as the main player. */
  async start(sceneName, nodeId = null, onDone = null) {
    const s = this.s;
    if (s.dlg?.spectator) { s.dlg.done = true; s._drawDialogue(); this.watching = null; }   // driving beats watching
    if (s.dlg) return false;
    const id = `${s.localId}:${Date.now().toString(36)}`;
    this.active = { id, last: '' };
    this._send({ t: 'evStart', id, main: s.character });
    await s.startDialogue(sceneName, nodeId, () => { this._send({ t: 'evEnd', id }); this.active = null; onDone?.(); });
    this._pump();
    return true;
  }

  skip() {
    const s = this.s;
    if (!s.dlg?.spectator) return;
    s.dlg.done = true; this.watching = null; this.banner.setVisible(false);
    s._drawDialogue(); s._toast('Skipped');
  }

  // Main player: mirror the dialogue box to everyone whenever it changes.
  _pump() {
    const s = this.s;
    if (!this.active || !s.dlg || s.dlg.spectator) return;
    const d = s.dlg, line = d.line, choices = d.choices;
    const state = choices.length ? { who: null, text: '', choices: choices.map((c) => c.text.replace(/\*/g, '')), nodeId: d.nodeId }
      : { who: line?.who ?? null, text: line?.text ?? '', choices: [], nodeId: d.nodeId };
    const key = JSON.stringify(state);
    if (key === this.active.last) return;
    this.active.last = key;
    this._send({ t: 'evState', id: this.active.id, state });
  }

  _send(msg) {
    const s = this.s;
    if (s.mode === 'host') s.net.broadcast(msg);
    else if (s.mode === 'client') s.net.send(msg);
  }

  /** Network hook. Host: pass the sending peer id so it relays to the others. Returns true if handled. */
  onMsg(msg, fromPeer = null) {
    if (!msg || !/^ev(Start|State|End)$/.test(msg.t)) return false;
    const s = this.s;
    if (s.mode === 'host' && fromPeer) for (const peer of s.net.conns.keys()) if (peer !== fromPeer) s.net.send(peer, msg);
    if (this.active?.id === msg.id) return true;   // our own event coming back
    if (msg.t === 'evStart') {
      if (s.dlg) return true;                        // already reading something: can't watch
      this.watching = { id: msg.id, main: msg.main };
      s.dlg = new Mirror(msg.main); s.dlgDone = null; s.dlgVoiced = false;
      this.banner.setText(`Watching ${String(msg.main).toUpperCase()}  ·  [X] skip`).setVisible(true);
      s._drawDialogue();
    } else if (msg.t === 'evState' && this.watching?.id === msg.id && s.dlg?.spectator) {
      s.dlg.set(msg.state); s._lineAt = 0; s._drawDialogue();
    } else if (msg.t === 'evEnd' && this.watching?.id === msg.id) {
      if (s.dlg?.spectator) { s.dlg.done = true; s._drawDialogue(); }
      this.watching = null; this.banner.setVisible(false);
    }
    return true;
  }
}
