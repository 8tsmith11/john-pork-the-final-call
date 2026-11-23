// Stage: in-world cutscenes (Michael, D-018: "events the roommates witness are animated cutscenes
// in the game's engine": less reading, more showing). A cutscene is a script of steps that the
// cast acts out on the real map, top-down, in the game's own art: they walk, turn, react, and talk
// in speech bubbles, while the camera pans, zooms and shakes. No text cards.
//
//   scene.stage.play('demo', onDone)       // scripts live in src/content/stage/<id>.js
//   ?stage=demo                             // debug: play one when the world loads
//   src/content/stage/index.js              // triggers: play a script once when a story flag is set
//   scene.stage.after('id', then)           // a story beat: the cutscene, then `then` (e.g. its dialogue) on every peer
// How to write and place one: docs/design/cutscenes.md.
//
// Sync (Michael: "all dialogue tracks with the host"): the host (or the solo player) runs it and
// tells every client to play the same script, so each screen acts it out in step; nothing streams.
// Clients can't skip. The host can (X), and that ends it for everyone. A client that wants a
// cutscene asks the host. Effects (`set` flags) apply once, on the host. At the end the host moves
// the roommates to where the cutscene left them, and clients see that in the next snapshot.
//
// During a cutscene: player input is frozen, solo pauses the world, and the cast are played by
// stand-ins (puppets) so the sim and NPC animation can't tug them around.
//
// Script format (src/content/stage/<id>.js, default export):
//   { id, map?: 'room631',            // only plays on this map (others: skipped, onDone runs)
//     cast: { michael: {}, kess: { npc: 'obj.npc_kess' } },   // roommates by name; NPCs by map object
//     steps: [ ...step ] }
// Steps run in order; each finishes before the next starts.
//   { place: 'trevor', at: [tx, ty], face?: 'left' }       // put an actor on a tile, instantly
//   { walk: 'trevor', to: [tx, ty] | [[tx, ty], ...], speed?: 48 }   // walk there (tiles), or
//   { walk: 'trevor', by: [dx, dy] }                        // walk relative to where they stand
//   { face: 'manuel', dir: 'left' | 'right' | 'up' | 'down' | 'trevor' }   // a direction, or toward someone
//   { say: 'michael', text: '...', es?: '...', dur?: 2 }   // speech bubble over their head
//   { emote: 'trevor', icon: '!' | '?' | '...' | 'heart' | 'note' | 'angry' | 'sweat' }
//   { cam: 'trevor' | [tx, ty] | 'cast', zoom?: 1.3, dur?: 1 }   // pan and zoom (zoom 1 = normal)
//   { shake: 0.006, dur?: 0.4 }    { fade: 'out' | 'in', dur?: 0.4 }    { wait: 1.5 }
//   { caption: '...', es?: '...' }  // a short line at the top, for sounds or time passing
//   { together: [ ...steps ] }      // run these at once; continue when all are done
//   { set: { 'act1.some.flag': true } }   // story effects, applied once on the host
//   { if: (ctx) => bool, ...step }  // skip this step for this run
// Places can be map objects too: walk { to: 'obj.manuel_closet' } stands next to it (the first open tile
// below, left, right or above), and cam / face accept an object id.
//
// Staging over dialogue (Michael, D-022: "the animations should always happen as text is occurring"):
//   { id, hold: true, cast, steps, cues: { 'node.n': [ ...step ] } }
// A hold script doesn't end when its steps do. It stays up behind a dialogue scene, and each line that
// carries a cue (`> do:` in the sealed script, "cue" in the generated data) plays cues[key] while that
// line is on screen. Every peer plays the cue its own dialogue box shows, so nothing extra is sent.
// The host ends it with stage.release(id) when the dialogue is over (clients get the usual 'end').
// Write story scripts as sealed or generic content: no spoilers in ids, comments or plain text.
import { TILE } from '../engine/sim.js';
import { VIEW } from '../view.js';
import { tr, getLang } from '../i18n.js';
import { speak, hush } from '../audio/audio.js';
import * as Settings from '../settings.js';
import { STAGE_TRIGGERS } from '../content/stage/index.js';

const ROOMMATES = new Set(['michael', 'trevor', 'manuel']);
const BAR = 22;                                   // letterbox bar height (view px)
const NAME_COLOR = { trevor: '#7fa7e8', michael: '#e8857e', manuel: '#9ccc6b' };
const EMOTE = { '!': '!', '?': '?', '...': '…', heart: '♥', note: '♪', angry: '#', sweat: '💧' };
const FONT = { fontFamily: 'monospace', fontSize: '6px', color: '#e8e8f0' };

export class Stage {
  constructor(scene) {
    this.s = scene;
    this.active = null;     // { id, script, tok, actors: Map, host }
    this.tok = 0;
    this._waiters = new Set();   // guests: story beats waiting for the host's copy of a cutscene to end
    scene.input.keyboard.on('keydown-X', () => { if (this.active?.host) this.skip(); });
    scene.events.once('shutdown', () => { this._gone = true; this._waiters.clear(); this._teardown(); });
  }

  get playing() { return !!this.active; }

  /** Play a cutscene. Host or solo: runs it and tells clients. Client: asks the host. */
  async play(id, onDone = null, ctx = {}) {
    const s = this.s;
    if (s.mode === 'client') { s.net.send({ t: 'stage', op: 'ask', id }); onDone?.(); return false; }
    const script = await loadScript(id);
    if (!script || this._gone || this.active || (script.map && script.map !== s.map?.id)) { onDone?.(); return false; }
    if (s.mode === 'host') s.net.broadcast({ t: 'stage', op: 'start', id });
    this._run(script, { host: true, onDone, ctx });
    return true;
  }

  /**
   * A story beat that every peer reaches at once (a map entry, the world loading): act cutscene `id` first,
   * then run `then` (usually the scene's dialogue). Host and solo play it. A guest never plays its own copy;
   * it waits for the host's: `then` runs when that ends, or after `grace` seconds if the host's never starts
   * (no script, wrong map). So the dialogue opens after the cutscene on every screen, not over it.
   */
  after(id, then, grace = 2) {
    if (this.s.mode !== 'client') { this.play(id, then); return; }
    const w = { id, go: () => { if (!this._waiters.delete(w)) return; then?.(); } };
    this._waiters.add(w);
    this.s.time.delayedCall(grace * 1000, () => { if (this.active?.id !== id && this._pending?.id !== id) w.go(); });
  }

  _release(id) { for (const w of [...this._waiters]) if (w.id === id) w.go(); }

  /** The host's X: end it for everyone now. */
  skip() { if (this.active?.host && !this.active.script.hold) this._finish(true); }

  holdForHost(id, hold = false) {
    if (this.s.mode !== 'client' || !id || this.active || this._pending) return;
    const s = this.s;
    this.active = { id, host: false, waitingForHost: true, script: { hold }, actors: new Map(), ui: [], zoom0: s.cameras.main.zoom };
    this._bars(true);
    const status = s.add.text(VIEW.w / 2, hold ? BAR / 2 : VIEW.h - BAR / 2, tr('Cutscene in progress'), FONT)
      .setOrigin(0.5).setScrollFactor(0).setDepth(9645);
    this.active.ui.push(status);
  }

  // A snapshot can arrive after an end message that was sent while the new World scene was starting.
  syncHostStage(id) {
    if (this.active?.waitingForHost && this.active.id !== id) this._finish(false);
  }

  get cueBusy() { return this.active?.cueRun?.busy === true; }

  /** Show a new line in a held scene. The host waits for its cue before advancing. */
  cue(key) {
    const a = this.active;
    if (!a?.script.hold || a.cueRun?.key === key) return false;
    this._stopCue(a);
    const steps = a.script.cues?.[key];
    const run = a.cueRun = { key, busy: !!steps, walks: new Set() };
    if (steps) this._steps(steps, a.tok, run).finally(() => { run.busy = false; });
    return run.busy;
  }

  _stopCue(a) {
    const run = a.cueRun;
    if (!run) return;
    a.cueRun = null;
    for (const stop of run.walks) stop();
  }

  _current(tok, cue) {
    return this.tok === tok && (!cue || this.active?.cueRun === cue);
  }

  /** Host and solo: end a hold script (its dialogue is over). */
  release(id) {
    if (this.s.mode === 'client' || this.active?.id !== id) return;
    this._finish(true);
  }

  onHostMsg(peer, msg) {
    if (msg?.t !== 'stage') return false;
    if (msg.op === 'ask' && typeof msg.id === 'string' && /^[a-z0-9_]+$/.test(msg.id)) this.play(msg.id);
    return true;
  }

  onClientMsg(msg) {
    if (msg?.t !== 'stage') return false;
    if (msg.op === 'start' && typeof msg.id === 'string' && /^[a-z0-9_]+$/.test(msg.id)) {
      if (this.active?.waitingForHost) this._teardown();
      // The script may still be loading when the host ends it (a quick skip). Track the pending start
      // so an 'end', a newer 'start' or a scene shutdown cancels it before it can run.
      this._cancelPending();
      const pending = this._pending = { id: msg.id, cancelled: false };
      loadScript(msg.id).then((script) => {
        if (pending.cancelled || this._pending !== pending) return;
        this._pending = null;
        if (script && !this.active) this._run(script, { host: false });
      });
    }
    if (msg.op === 'end') {
      if (this._pending?.id === msg.id) this._cancelPending();
      if (this.active && this.active.id === msg.id) this._finish(false);
      this._release(msg.id);   // a beat waiting on it can go on (also when the scene never got to play here)
    }
    return true;
  }

  /** Each frame, after the world draws: keep the real sprites hidden behind their stand-ins. */
  update() {
    const a = this.active;
    if (!a) { this._checkTriggers(); return; }
    for (const act of a.actors.values()) {
      if (act.real?.active) act.real.setVisible(false);
      act.draw();
    }
    this.s.partyHealthGfx?.clear();   // teammate health bars would float where the real players stand
    // Shadows: the world drew them under the real players; redraw them under the stand-ins.
    const sh = this.s.charShadow, cast = new Set([...a.actors.values()].filter((q) => q.roommate).map((q) => q.name));
    if (sh) {
      sh.clear().fillStyle(0x000000, 0.55);
      for (const p of this.s._lastRendered?.players ?? []) if (!p.dn && !cast.has(p.c)) sh.fillEllipse(Math.round(p.x) + 1, Math.round(p.y) + 3, 11, 4);
      for (const act of a.actors.values()) if (act.roommate) sh.fillEllipse(Math.round(act.x) + 1, Math.round(act.y) + 3, 11, 4);
    }
  }

  // ---------- triggers ----------

  /** Host and solo: start any cutscene whose flag is now set (once per world, no dialogue open). */
  _checkTriggers() {
    const s = this.s, now = s.time.now;
    if (s.mode === 'client' || this._starting || s.dlg || !s.save?.flags || now < (this._nextCheck ?? 0)) return;
    this._nextCheck = now + 250;
    const f = s.save.flags;
    for (const t of STAGE_TRIGGERS) {
      const played = `stage.${t.id}.played`;
      if (f[played] || !f[t.flag] || (t.map && t.map !== s.map?.id) || this._missing?.has(t.id)) continue;
      // Played is recorded only once it really starts. If the party changes maps or another cutscene
      // starts while the script loads, the trigger stays eligible; a script that can't load is not retried.
      this._starting = true;
      loadScript(t.id)
        .then((script) => {
          if (!script) { (this._missing ??= new Set()).add(t.id); return false; }
          if (this._gone || (t.map && t.map !== s.map?.id)) return false;   // scene closed, or the party left the map
          return this.play(t.id);
        })
        .then((started) => { if (started) f[played] = true; })
        .finally(() => { this._starting = false; });
      return;
    }
  }

  // ---------- running ----------

  _run(script, { host, onDone = null, ctx = {} }) {
    const s = this.s, cam = s.cameras.main;
    const tok = ++this.tok;
    this.active = { id: script.id, script, tok, host, onDone, ctx, actors: new Map(), ui: [], zoom0: cam.zoom };
    for (const [name, spec] of Object.entries(script.cast ?? {})) {
      const act = this._makeActor(name, spec ?? {});
      if (act) this.active.actors.set(name, act);
    }
    cam.stopFollow();
    this._bars(true);
    this._steps(script.steps ?? [], tok).then(() => { if (this.tok === tok && !script.hold) this._finish(host); });
  }

  async _steps(steps, tok, cue) {
    for (const st of steps) {
      if (!this._current(tok, cue)) return;
      if (st.if && !st.if(this.active.ctx)) continue;
      await this._step(st, tok, cue);
    }
  }

  _step(st, tok, cue) {
    const a = this.active, s = this.s, cam = s.cameras.main;
    if (st.together) return Promise.all(st.together.map((x) => (x.if && !x.if(a.ctx) ? null : this._step(x, tok, cue))));
    if (st.wait != null) return this._wait(st.wait);
    if (st.place) { const act = a.actors.get(st.place); if (act) { Object.assign(act, this._tilePos(act, st.at)); if (st.face) act.face(st.face); } return null; }
    if (st.walk) return this._walk(a.actors.get(st.walk), st, tok, cue);
    if (st.face) { const act = a.actors.get(st.face); if (act) act.face(this._dirOf(act, st.dir)); return null; }
    if (st.say) return this._say(st, tok, cue);
    if (st.emote) return this._emote(a.actors.get(st.emote), st.icon);
    if (st.caption) return this._caption(st);
    if (st.cam) {
      const p = this._camTarget(st.cam), ms = (st.dur ?? 1) * 1000;
      if (p) cam.pan(p.x, p.y, ms, 'Sine.easeInOut', true);
      cam.zoomTo(a.zoom0 * (st.zoom ?? 1), ms, 'Sine.easeInOut', true);
      return this._wait(st.dur ?? 1);
    }
    if (st.shake) { cam.shake((st.dur ?? 0.4) * 1000, st.shake); return this._wait(st.dur ?? 0.4); }
    if (st.fade) {
      const ms = (st.dur ?? 0.4) * 1000;
      if (st.fade === 'out') cam.fadeOut(ms, 0, 0, 0); else cam.fadeIn(ms, 0, 0, 0);
      return this._wait(st.dur ?? 0.4);
    }
    if (st.set) { if (a.host) for (const [k, v] of Object.entries(st.set)) s._flag(k, v); return null; }
    return null;
  }

  _wait(sec) { return new Promise((res) => this.s.time.delayedCall(Math.max(0, sec) * 1000, res)); }

  _finish(host) {
    const a = this.active, s = this.s;
    if (!a) return;
    this.tok++;
    this._stopCue(a);
    hush();
    if (host && s.mode === 'host') s.net.broadcast({ t: 'stage', op: 'end', id: a.id });
    // Host and solo: the roommates stay where the cutscene left them.
    if (host && s.sim) {
      for (const act of a.actors.values()) {
        if (!act.roommate || !act.moved) continue;
        for (const p of s.sim.players.values()) if (p.character === act.name) { p.x = act.x; p.y = act.y; }
      }
    }
    this._teardown();
    const cam = s.cameras.main;
    cam.resetFX?.(); cam.fadeIn(250, 0, 0, 0);
    cam.zoomTo(a.zoom0, 300, 'Sine.easeInOut', true);
    const me = s.sprites?.get(s.localId);
    if (me) cam.startFollow(me, true, 0.15, 0.15);
    a.onDone?.();
    this._release(a.id);
  }

  _cancelPending() {
    if (this._pending) { this._pending.cancelled = true; this._pending = null; }
  }

  _teardown() {
    this._cancelPending();
    const a = this.active;
    if (!a) return;
    this._stopCue(a);
    for (const act of a.actors.values()) act.destroy();
    for (const o of a.ui) o.destroy?.();
    this.active = null;
  }

  // ---------- actors ----------

  _makeActor(name, spec) {
    const s = this.s;
    if (spec.npc || !ROOMMATES.has(name)) {
      const im = s.propById?.[spec.npc ?? name]?.im;
      if (!im) return null;
      const puppet = s.add.image(im.x, im.y, im.texture.key, im.frame.name).setOrigin(im.originX, im.originY).setScale(im.scaleX, im.scaleY).setFlipX(im.flipX);
      // Track the feet (bottom centre) so tile positions mean the same thing for everyone.
      const ox = (0.5 - im.originX) * im.displayWidth, oy = (1 - im.originY) * im.displayHeight;
      const act = {
        name, roommate: false, real: im, sprite: puppet, x: im.x + ox, y: im.y + oy, dir: im.flipX ? 'left' : 'right',
        draw() { puppet.setPosition(Math.round(act.x - ox), Math.round(act.y - oy)).setDepth(act.y); },
        face(d) { act.dir = d; if (d === 'left' || d === 'right') puppet.setFlipX(d === 'left'); },
        walking() {}, destroy() { puppet.destroy(); act.bubble?.destroy(); if (im.active) im.setVisible(true); },
      };
      return act;
    }
    // A roommate: their own sprite sheet and animations, standing where they are now.
    const p = (s._lastRendered?.players ?? []).find((q) => q.c === name);
    const real = p ? s.sprites?.get(p.id) : null;
    if (!real && !spec.at) return null;
    const puppet = s.add.sprite(0, 0, name).setOrigin(0.5, 1);
    if (real) puppet.setScale(real.scaleX, real.scaleY);
    const act = {
      name, roommate: true, real, sprite: puppet, x: p?.x ?? 0, y: p?.y ?? 0, moving: false,
      dir: p?.f ?? 'down', moved: false,
      draw() {
        puppet.setPosition(Math.round(act.x), Math.round(act.y + 4)).setDepth(act.y);
        const facing = act.dir === 'left' ? 'right' : act.dir;
        const key = `${name}_${act.moving ? 'walk' : 'idle'}_${facing}`;
        puppet.setFlipX(act.dir === 'left');
        if (s.anims.exists(key) && puppet.anims.currentAnim?.key !== key) puppet.play(key);
      },
      face(d) { act.dir = d; },
      destroy() { puppet.destroy(); act.bubble?.destroy(); if (real?.active) real.setVisible(true); },
    };
    if (spec.at) Object.assign(act, this._tilePos(act, spec.at));
    if (spec.face) act.dir = spec.face;
    act.draw();
    return act;
  }

  /** Tile → actor position: roommates stand on the tile centre (sim coords); NPCs by their feet. */
  _tilePos(act, [tx, ty]) {
    return act.roommate ? { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE, moved: true } : { x: (tx + 0.5) * TILE, y: (ty + 1) * TILE };
  }

  _dirOf(act, dir) {
    const other = this.active.actors.get(dir) ?? this._objPoint(dir);
    if (!other) return dir;
    const dx = other.x - act.x, dy = other.y - act.y;
    return Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  }

  async _walk(act, st, tok, cue) {
    if (!act) return;
    const pts = st.by ? [[act.x / TILE - 0.5 + st.by[0], act.y / TILE - (act.roommate ? 0.5 : 1) + st.by[1]]]
      : Array.isArray(st.to?.[0]) ? st.to : [st.to];
    for (let i = 0; i < pts.length; i++) if (typeof pts[i] === 'string') pts[i] = this._beside(pts[i]);
    const speed = st.speed ?? 48;
    for (const pt of pts) {
      if (!this._current(tok, cue)) return;
      if (!pt) continue;
      const goal = this._tilePos(act, pt);
      const dx = goal.x - act.x, dy = goal.y - act.y, dist = Math.hypot(dx, dy);
      if (dist < 0.5) continue;
      act.dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      act.moving = true; act.moved = act.roommate;
      await new Promise((resolve) => {
        let stop;
        const finish = () => { cue?.walks.delete(stop); resolve(); };
        const tween = this.s.tweens.add({ targets: act, x: goal.x, y: goal.y, duration: (dist / speed) * 1000, onComplete: finish, onStop: finish });
        stop = () => { act.moving = false; tween.stop(); finish(); };
        cue?.walks.add(stop);
      });
    }
    if (this._current(tok, cue)) act.moving = false;
  }

  _say(st, tok, cue) {
    const a = this.active, s = this.s, act = a.actors.get(st.say);
    const text = (getLang() === 'es' && st.es) || tr(st.text ?? '');
    if (!text) return null;
    const dur = Math.max(st.dur ?? 0, 1.2 + text.length / 14);
    if (act && ROOMMATES.has(act.name) && Settings.get('voice') > 0) speak(act.name, text);
    if (!act) return this._caption({ caption: text, dur });
    act.bubble?.destroy();
    const t = s.add.text(0, 0, text, { ...FONT, color: NAME_COLOR[act.name] ?? '#f0ece2', backgroundColor: '#0b0d16e6', padding: { x: 3, y: 2 }, wordWrap: { width: 120 }, align: 'center' })
      .setOrigin(0.5, 1).setDepth(7100);
    const top = () => act.sprite.y - act.sprite.displayHeight - 3;
    const follow = s.time.addEvent({ delay: 16, loop: true, callback: () => t.active && t.setPosition(act.sprite.x, top()) });
    t.setPosition(act.sprite.x, top());
    const bubble = act.bubble = { destroy: () => { follow.remove(); t.destroy(); } };
    return this._wait(dur).then(() => {
      if (act.bubble !== bubble || !this._current(tok, cue)) return;
      bubble.destroy(); act.bubble = null;
    });
  }

  _emote(act, icon) {
    if (!act) return null;
    const s = this.s, ch = EMOTE[icon] ?? icon ?? '!';
    const t = s.add.text(act.sprite.x, act.sprite.y - act.sprite.displayHeight - 2, ch, { ...FONT, fontSize: '9px', color: '#ffd27f', stroke: '#0b0d16', strokeThickness: 2 })
      .setOrigin(0.5, 1).setDepth(7150).setScale(0.2);
    this.active.ui.push(t);
    s.tweens.add({ targets: t, scale: 1, y: t.y - 4, duration: 180, ease: 'Back.easeOut' });
    s.tweens.add({ targets: t, alpha: 0, delay: 900, duration: 250 });
    return this._wait(0.7);
  }

  _caption(st) {
    const s = this.s, text = (getLang() === 'es' && st.es) || tr(st.caption);
    const t = s.add.text(VIEW.w / 2, BAR + 4, text, { ...FONT, fontSize: '8px', color: '#f2e6c9', backgroundColor: '#0b0d16cc', padding: { x: 4, y: 2 } })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(9650);
    this.active.ui.push(t);
    const dur = st.dur ?? Math.max(1.5, 1 + text.length / 16);
    s.tweens.add({ targets: t, alpha: 0, delay: dur * 1000 - 250, duration: 250 });
    return this._wait(dur);
  }

  _camTarget(c) {
    const a = this.active;
    if (Array.isArray(c)) return { x: (c[0] + 0.5) * TILE, y: (c[1] + 0.5) * TILE };
    if (c === 'cast') {
      const list = [...a.actors.values()];
      if (!list.length) return null;
      return { x: list.reduce((n, q) => n + q.x, 0) / list.length, y: list.reduce((n, q) => n + q.y, 0) / list.length };
    }
    const act = a.actors.get(c);
    return act ? { x: act.x, y: act.y } : this._objPoint(c);
  }

  /** A map object's tile, by id. */
  _objTile(id) {
    const o = typeof id === 'string' && this.s.map?.objects?.find((q) => q.id === id);
    return o ? [o.x, o.y] : null;
  }

  _objPoint(id) { const t = this._objTile(id); return t ? { x: (t[0] + 0.5) * TILE, y: (t[1] + 0.5) * TILE } : null; }

  /** The tile to stand on next to a map object: below it, else left, right, above. */
  _beside(id) {
    const t = this._objTile(id), m = this.s.map;
    if (!t) return null;
    for (const [dx, dy] of [[0, 1], [-1, 0], [1, 0], [0, -1]]) if (!m?.solid?.(t[0] + dx, t[1] + dy)) return [t[0] + dx, t[1] + dy];
    return [t[0], t[1] + 1];
  }

  // Letterbox bars slide in, so everyone can tell the game is showing them something.
  _bars(on) {
    const s = this.s, ui = this.active.ui;
    for (const top of this.active.script.hold ? [true] : [true, false]) {   // a hold script: the dialogue box sits where the bottom bar would
      const r = s.add.rectangle(0, top ? -BAR : VIEW.h, VIEW.w, BAR, 0x000000).setOrigin(0).setScrollFactor(0).setDepth(9640);
      ui.push(r);
      s.tweens.add({ targets: r, y: top ? 0 : VIEW.h - BAR, duration: 350, ease: 'Sine.easeOut' });
    }
    if (this.active.host && s.mode !== 'client' && !this.active.script.hold) {
      const hint = s.add.text(VIEW.w - 6, VIEW.h - BAR / 2, tr('X: skip'), { ...FONT, color: '#5a5d6b' }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(9645);
      ui.push(hint);
    }
  }
}

const cache = new Map();
async function loadScript(id) {
  if (!/^[a-z0-9_]+$/.test(id)) return null;
  if (cache.has(id)) return cache.get(id);
  try {
    const mod = await import(`../content/stage/${id}.js`);
    cache.set(id, mod.default);
    return mod.default;
  } catch {
    console.info(`[stage] no cutscene named ${id}`);
    return null;
  }
}
