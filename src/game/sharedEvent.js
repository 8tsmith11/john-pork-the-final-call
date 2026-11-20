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
  constructor(main, onChoose = null) { this.spectator = true; this.main = main; this.done = false; this.line = null; this._choices = []; this.nodeId = null; this.decider = null; this.onChoose = onChoose; }
  get choices() { return this._choices; }
  set(state) {
    this.line = state.text || state.who ? { who: state.who, text: state.text } : null;   // a new object = a new line
    this._choices = (state.choices ?? []).map((text) => ({ text }));
    this.nodeId = state.nodeId ?? null;
    this.decider = state.decider ?? null;
  }
  advance() {}
  choose(i) { this.onChoose?.(i); }   // only the decider's mirror forwards a pick to the main player
}

export class SharedEvents {
  constructor(scene) {
    this.s = scene;
    this.active = null;     // the event this player is driving
    this.watching = null;   // the event this player is mirroring
    scene.input.keyboard.on('keydown', (ev) => {
      if ((ev.key === 't' || ev.key === 'T') && !this.s.dlg) { this.joinOffer(); return; }
      if (!this.s.dlg?.spectator) return;
      if (ev.key === 'x' || ev.key === 'X' || ev.key === 'Escape') this.skip();
    });
    scene.time.addEvent({ delay: 100, loop: true, callback: () => this._pump() });
    this.banner = scene.add.text(VIEW.w / 2, 22, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffb347', backgroundColor: '#0b0d16cc', padding: { x: 4, y: 2 } })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(9600).setVisible(false);
  }

  /** Start a shared scene with the local player as the main player.
   * scope: 'all' (every screen, story scenes), 'nearby' (roommates within 8 tiles watch; others get a
   * toast and can press T to watch), 'self' (nobody else). Choices go to the node's decider. */
  async start(sceneName, nodeId = null, onDone = null, scope = 'all', label = '', presentation) {
    const s = this.s;
    if (s.dlg?.spectator) { s.dlg.done = true; s._drawDialogue(); this.watching = null; }   // driving beats watching
    if (s.dlg) return false;
    const id = `${s.localId}:${Date.now().toString(36)}`;
    this.active = { id, last: '', scope };
    const me = s._lastRendered?.players?.find((p) => p.id === s.localId)
      ?? (presentation ? s.sim?.players.get(s.localId) : null);
    if (scope !== 'self') this._send({ t: 'evStart', id, main: s.character, scope, map: s.map?.id, x: me?.x ?? 0, y: me?.y ?? 0, label, presentation });
    await s._startLocal(sceneName, nodeId, () => { this._send({ t: 'evEnd', id }); this.active = null; s._dlgScope = null; onDone?.(); });
    this._pump();
    return true;
  }

  // Who picks at this node: the roommate it's directed to (node `decider`), if a human plays them;
  // otherwise the main player. 'speaker' means whoever holds the conversation.
  deciderFor(node) {
    const s = this.s, want = node?.decider;
    if (!want || want === 'speaker' || want === s.character) return s.character;
    const humans = (s._lastRendered?.players ?? []).filter((p) => !String(p.id).startsWith('ai:')).map((p) => p.c);
    return humans.includes(want) ? want : s.character;
  }
  // Main player: may I pick here? If not, say who does.
  canChoose() {
    const s = this.s;
    if (!this.active || !s.dlg || s.dlg.spectator) return true;
    const who = this.deciderFor(s.dlg.node);
    if (who === s.character) return true;
    s._toast(`${who.toUpperCase()} decides`); return false;
  }
  // Everyone sees what was picked, and by whom.
  picked(who, text) { if (this.active) this._send({ t: 'evPick', id: this.active.id, who, text }); }

  skip() {
    const s = this.s;
    if (!s.dlg?.spectator) return;
    if (this.watching?.scope === 'all') return s._toast('Story scene: everyone watches this one.');
    s.dlg.done = true; this.watching = null; this.banner.setVisible(false);
    s._drawDialogue(); s._toast('Skipped');
  }

  // Main player: mirror the dialogue box to everyone whenever it changes.
  _pump() {
    const s = this.s;
    if (!this.active || !s.dlg || s.dlg.spectator) return;
    const d = s.dlg, line = d.line, choices = d.choices;
    const state = choices.length ? { who: null, text: '', choices: choices.map((c) => c.text.replace(/\*/g, '')), nodeId: d.nodeId, decider: this.deciderFor(d.node) }
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
    if (!msg || !/^ev(Start|State|End|Choose|Pick)$/.test(msg.t)) return false;
    const s = this.s;
    if (s.mode === 'host' && fromPeer && msg.presentation) msg = { ...msg, presentation: undefined };
    if (s.mode === 'host' && fromPeer) for (const peer of s.net.conns.keys()) if (peer !== fromPeer) s.net.send(peer, msg);
    // The decider picked on their screen: the main player applies it.
    if (msg.t === 'evChoose' && this.active?.id === msg.id) {
      if (s.dlg && !s.dlg.spectator && s.dlg.choices[msg.i]) { this.picked(msg.who, s.dlg.choices[msg.i].text.replace(/\*/g, '')); s.dlg.choose(msg.i); s._drawDialogue(); }
      return true;
    }
    if (msg.t === 'evPick') { if (msg.who !== s.character) s._toast(`${String(msg.who).toUpperCase()}: "${msg.text}"`); return true; }
    if (this.active?.id === msg.id) return true;   // our own event coming back
    if (msg.t === 'evState') (this.latest ??= {})[msg.id] = msg.state;
    if (msg.t === 'evStart') {
      if (msg.presentation === 'act1-finale') {
        this._prepareFinale(msg);
        this._watch(msg);
        return true;
      }
      if (s.dlg) return true;                        // already reading something: can't watch
      const me = s._lastRendered?.players?.find((p) => p.id === s.localId);
      const near = msg.scope === 'all' || (msg.map === s.map?.id && me && Math.hypot(me.x - msg.x, me.y - msg.y) <= 128);
      if (!near) { this.offer = msg; s._toast(`${String(msg.main).toUpperCase()} is talking${msg.label ? ` to ${msg.label}` : ''}  ·  [T] watch`); return true; }
      this._watch(msg);
    } else if (msg.t === 'evState' && this.watching?.id === msg.id && s.dlg?.spectator) {
      s.dlg.set(msg.state); s._lineAt = 0; s._drawDialogue();
    } else if (msg.t === 'evEnd') {
      if (this.offer?.id === msg.id) this.offer = null;
      if (this.watching?.id === msg.id) { if (s.dlg?.spectator) { s.dlg.done = true; s._drawDialogue(); } this.watching = null; this.banner.setVisible(false); }
    }
    return true;
  }

  _prepareFinale({ x, y }) {
    const s = this.s;
    // A party-wide ending may interrupt a guest's local conversation. Its unfinished callbacks stay unrun.
    if (this.active && this.active.scope !== 'self') this._send({ t: 'evEnd', id: this.active.id });
    this.active = this.watching = this.offer = null;
    if (s.dlg) {
      s.dlgDone = null;
      s.dlg.done = true;
      s._drawDialogue();
    }
    if (s.menu) s._closeMenu();
    s._closeSayAll();
    s.dlgFree = false;
    s._showActOneArrival(x, y);
  }

  _watch(msg) {
    const s = this.s;
    this.watching = { id: msg.id, main: msg.main, scope: msg.scope };
    s.dlg = new Mirror(msg.main, (i) => this._send({ t: 'evChoose', id: msg.id, i, who: s.character }));
    s.dlgDone = null; s.dlgVoiced = msg.presentation === 'act1-finale';
    if (this.latest?.[msg.id]) s.dlg.set(this.latest[msg.id]);
    this.banner.setText(msg.scope === 'all' ? `${String(msg.main).toUpperCase()}'s scene` : `Watching ${String(msg.main).toUpperCase()}  ·  [X] skip`).setVisible(true);
    s._drawDialogue();
  }

  /** [T]: join a conversation a roommate started somewhere else. */
  joinOffer() {
    if (!this.offer || this.s.dlg) return false;
    const msg = this.offer; this.offer = null; this._watch(msg); return true;
  }
}
