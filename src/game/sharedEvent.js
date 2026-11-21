// Shared events (D-014): an important scene plays on EVERY roommate's screen at once.
//
//   scene.shared.start('romance_trevor', 'finale', onDone)
//
// The main player advances the scene and applies its effects. Other players see the same speaker,
// line and choices. A choice assigned to a roommate can be made from that roommate's screen.
//
// Wire format (host relays client messages to the other clients):
//   evStart → evState (line or choices and turn) → evChoose (turn and index) → evState → evEnd
// Works in solo too (it's just a normal dialogue then).
import { VIEW } from '../view.js';

class Mirror {
  constructor(main, onChoose = null) { this.spectator = true; this.main = main; this.done = false; this.line = null; this._choices = []; this.nodeId = null; this.decider = null; this.onChoose = onChoose; }
  get choices() { return this._choices; }
  set(state) {
    this.line = state.text || state.who ? { who: state.who, text: state.text, cue: state.cue, choice: state.choice } : null;   // a new object = a new line
    this._choices = (state.choices ?? []).map((text) => ({ text }));
    this.nodeId = state.nodeId ?? null;
    this.decider = state.decider ?? null;
    this.turn = state.turn ?? null;
    this.pending = false;
  }
  advance() {}
  choose(i) {
    if (this.pending) return;
    this.pending = true;
    this.onChoose?.(i, this.turn);
  }
}

export class SharedEvents {
  constructor(scene) {
    this.s = scene;
    this.active = null;     // the event this player is driving
    this.watching = null;   // the event this player is mirroring
    this.guestEvents = new Map();
    this.deferredStarts = new Map();
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
    this.active = { id, last: '', scope, turn: 0 };
    const me = s._lastRendered?.players?.find((p) => p.id === s.localId)
      ?? (presentation ? s.sim?.players.get(s.localId) : null);
    if (scope !== 'self') this._send({ t: 'evStart', id, main: s.character, scope, map: s.map?.id, x: me?.x ?? 0, y: me?.y ?? 0, label, presentation });
    await s._startLocal(sceneName, nodeId, () => {
      if (scope !== 'self') this._send({ t: 'evEnd', id });
      this.active = null;
      s._dlgScope = null;
      onDone?.();
    });
    this._pump();
    return true;
  }

  // Who picks at this node: the roommate it's directed to (node `decider`), if a human plays them;
  // otherwise the main player. 'speaker' means whoever holds the conversation.
  deciderFor(node) {
    const s = this.s, want = node?.decider;
    if (s._aiDecider) return s._aiDecider;
    if (!want || want === 'speaker' || want === s.character || this.active?.scope === 'self') return s.character;
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
    this._resumeDirectedChoice();
    if (!this.active || this.active.scope === 'self' || !s.dlg || s.dlg.spectator) return;
    const d = s.dlg, line = d.line, choices = d.choices;
    const state = choices.length ? { who: null, text: '', choices: choices.map((c) => c.text.replace(/\*/g, '')), nodeId: d.nodeId, decider: this.deciderFor(d.node) }
      : { who: line?.who ?? null, text: line?.text ?? '', choices: [], nodeId: d.nodeId, line: d.i, choice: !!line?.choice, cue: line?.cue };   // cue: watchers stage the line too
    const key = JSON.stringify(state);
    if (key === this.active.last) return;
    this.active.last = key;
    if (choices.length) state.turn = ++this.active.turn;
    this._send({ t: 'evState', id: this.active.id, state });
  }

  _send(msg) {
    const s = this.s;
    if (s.mode === 'host') s.net.broadcast(msg);
    else if (s.mode === 'client') s.net.send(msg);
  }

  /** Track each guest's dialogue even when the host is watching something else. */
  onHostMsg(peer, msg) {
    if (msg?.t === 'evStart') {
      if (typeof msg.id !== 'string' || !msg.id.startsWith(`${peer}:`)) return true;
      if (this.guestEvents.get(peer) !== msg.id) this.endGuestDialogue(peer);
      this.guestEvents.set(peer, msg.id);
    } else if (msg?.t === 'evState' || msg?.t === 'evEnd') {
      if (typeof msg.id !== 'string' || this.guestEvents.get(peer) !== msg.id) return true;
      if (msg.t === 'evEnd') this.guestEvents.delete(peer);
    }
    return this.onMsg(msg, peer);
  }

  endGuestDialogue(peer) {
    const id = this.guestEvents.get(peer);
    if (!id) return;
    this.guestEvents.delete(peer);
    const end = { t: 'evEnd', id };
    this.onMsg(end);
    this._send(end);
  }

  /** Network hook. Host: pass the sending peer id so it relays to the others. Returns true if handled. */
  onMsg(msg, fromPeer = null) {
    if (!msg || !/^ev(Start|State|End|Choose)$/.test(msg.t)) return false;
    const s = this.s;
    if (s.mode === 'host' && fromPeer && msg.presentation) msg = { ...msg, presentation: undefined };
    if (msg.t === 'evChoose' && s.mode === 'host' && fromPeer) {
      const who = s._charOf(fromPeer);
      if (!who) return true;
      msg = { ...msg, who };
    }
    if (s.mode === 'host' && fromPeer) for (const peer of s.net.conns.keys()) if (peer !== fromPeer) s.net.send(peer, msg);
    // The decider picked on their screen: the main player applies it.
    if (msg.t === 'evChoose' && this.active?.id === msg.id) {
      if (s.dlg && !s.dlg.spectator && Number.isInteger(msg.i) && msg.turn === this.active.turn &&
          msg.who !== s._aiDecider && msg.who === this.deciderFor(s.dlg.node)) s._commitDialogueChoice(msg.i, msg.who);
      return true;
    }
    if (this.active?.id === msg.id) return true;   // our own event coming back
    if (msg.t === 'evState') {
      (this.latest ??= {})[msg.id] = msg.state;
      if (this._resumeDirectedChoice()) return true;
    }
    if (msg.t === 'evStart') {
      if (msg.presentation === 'act1-finale') {
        this._prepareFinale(msg);
        this._watch(msg);
        return true;
      }
      if (s.dlg) {
        this.deferredStarts.set(msg.id, msg);
        return true;
      }
      const me = s._lastRendered?.players?.find((p) => p.id === s.localId);
      const near = msg.scope === 'all' || (msg.map === s.map?.id && me && Math.hypot(me.x - msg.x, me.y - msg.y) <= 128);
      if (!near) { this.offer = msg; s._toast(`${String(msg.main).toUpperCase()} is talking${msg.label ? ` to ${msg.label}` : ''}  ·  [T] watch`); return true; }
      this._watch(msg);
    } else if (msg.t === 'evState' && this.watching?.id === msg.id && s.dlg?.spectator) {
      s.dlg.set(msg.state); s._lineAt = 0; s._drawDialogue();
    } else if (msg.t === 'evEnd') {
      if (this.latest) delete this.latest[msg.id];
      this.deferredStarts.delete(msg.id);
      if (this.offer?.id === msg.id) this.offer = null;
      if (this.watching?.id === msg.id) { if (s.dlg?.spectator) { s.dlg.done = true; s._drawDialogue(); } this.watching = null; this.banner.setVisible(false); }
    }
    return true;
  }

  _resumeDirectedChoice() {
    const s = this.s;
    if (this.active || s.dlg || s.sayOpen || s.menu || s.stage?.active) return false;
    const isMyTurn = (msg) => {
      const state = this.latest?.[msg.id];
      return state?.decider === s.character && state.choices?.length;
    };
    if (this.offer && isMyTurn(this.offer)) return this.joinOffer();
    for (const [id, msg] of this.deferredStarts) {
      if (!isMyTurn(msg)) continue;
      this.deferredStarts.delete(id);
      this._watch(msg);
      return true;
    }
    return false;
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
    s.dlg = new Mirror(msg.main, (i, turn) => this._send({ t: 'evChoose', id: msg.id, i, turn, who: s.character }));
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
