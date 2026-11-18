// Voice cameos at runtime (content and rules: src/content/cameos.js). The host decides when a cameo
// arrives (its `when` test, or a manual play(id)) and tells everyone; each screen then rings the phone,
// shows "Voicemail from X", and plays the recording once. Flags under act1.cameo.* keep it to once.
import { CAMEOS } from '../content/cameos.js';
import { ring, setMusicDuck } from '../audio/audio.js';

export class Cameos {
  constructor(scene) {
    this.s = scene;
    if (scene.mode !== 'client') scene.time.addEvent({ delay: 1000, loop: true, callback: () => this._check() });
  }

  get flags() { return this.s.save.flags; }
  ready(id) { return !!CAMEOS[id]?.file; }
  /** Delivered and finished playing on this screen (or never will: no recording). */
  finished(id) { return !this.ready(id) || (!!this.flags[`act1.cameo.${id}`] && this.busy !== id); }

  _check() {
    const s = this.s;
    if (s.dlg && !s.dlg.spectator) return;            // never over someone's dialogue
    for (const [id, c] of Object.entries(CAMEOS)) {
      if (!c.file || c.cue === 'manual' || !c.when || this.flags[`act1.cameo.${id}`]) continue;
      try { if (c.when(this.flags, s.save)) this.play(id); } catch { /* a bad test never breaks the game */ }
    }
  }

  /** Deliver a cameo now (host or solo). Returns false if there's no recording or it already played. */
  play(id) {
    const s = this.s, c = CAMEOS[id];
    if (!c?.file || this.flags[`act1.cameo.${id}`]) return false;
    s._flag(`act1.cameo.${id}`, true);
    if (s.mode === 'host') s.net.broadcast({ t: 'cameo', id });
    this._deliver(id);
    return true;
  }

  onClientMsg(msg) {
    if (msg.t !== 'cameo') return false;
    this.flags[`act1.cameo.${msg.id}`] = true;
    this._deliver(msg.id);
    return true;
  }

  // Ring, then the voicemail plays with the music ducked under it.
  _deliver(id) {
    const s = this.s, c = CAMEOS[id];
    this.busy = id;
    const vms = ((s.save.world.phone ??= { texts: [] }).voicemails ??= []);
    if (!vms.some((v) => v.id === id)) vms.push({ id, from: c.from, at: new Date().toISOString() });
    ring(1);
    s.time.delayedCall(2600, () => {
      s._toast(`▶ Voicemail from ${c.from}`);
      this.replay(id);
    });
  }

  /** Play a delivered voicemail (also used by the PHONE tab's ▶). */
  replay(id) {
    const c = CAMEOS[id];
    if (!c?.file) { if (this.busy === id) this.busy = null; return; }
    this.audio?.pause();
    const el = this.audio = new Audio(c.file);
    el.volume = 1;
    setMusicDuck?.(true);
    const done = () => { setMusicDuck?.(false); if (this.busy === id) this.busy = null; };
    el.addEventListener('ended', done, { once: true });
    el.addEventListener('error', done, { once: true });
    el.play().catch(done);
  }
}
