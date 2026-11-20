// Area moods: on maps marked `hood: true` (the code rot hood, hub task #14), one roommate reacts to
// the place now and then: a sealed line (src/content/moods.js) and a small shiver. The host picks
// the moment and tells everyone, so every screen shows the same thing. It works whether a human or
// the AI plays that roommate. What the lines say is sealed (hub task #20).
import { MOOD_WHO, MOOD_LINES } from '../content/moods.js';
import { getLang } from '../i18n.js';

const FIRST = 1800;                 // ms after arriving on the map
const GAP = [18000, 35000];         // ms between lines after that

export class Moods {
  constructor(scene) {
    this.s = scene;
    this.mapId = null;
    this.next = Infinity;
    this.n = Math.floor(Math.random() * MOOD_LINES.length);
  }

  /** Host and solo, every frame. */
  update(snap) {
    const s = this.s, map = s.map;
    if (s.mode === 'client' || !map || !snap?.players) return;
    if (map.id !== this.mapId) { this.mapId = map.id; this.next = map.hood ? s.time.now + FIRST : Infinity; }
    if (!map.hood || s.time.now < this.next) return;
    const p = snap.players.find((q) => q.c === MOOD_WHO && !q.dn);
    if (!p || s.dlg || s.stage?.active) { this.next = s.time.now + 4000; return; }
    this.next = s.time.now + GAP[0] + Math.random() * (GAP[1] - GAP[0]);
    const msg = { t: 'mood', a: p.id, i: this.n++ % MOOD_LINES.length };
    if (s.mode === 'host') s.net.broadcast(msg);
    this._show(msg);
  }

  onClientMsg(msg) {
    if (msg?.t !== 'mood') return false;
    this._show(msg);
    return true;
  }

  _show(msg) {
    const s = this.s, line = MOOD_LINES[msg.i | 0];
    if (!line) return;
    s._barkQuietUntil = 0;
    s._bark(msg.a, getLang() === 'es' ? line.es : line.en);
    // A quick shiver: the render loop adds offX every frame (as src/game/crush.js uses it).
    const sp = s.sprites?.get(msg.a);
    if (!sp?.active) return;
    sp.offX = 0;
    s.tweens.add({ targets: sp, offX: 1, duration: 45, yoyo: true, repeat: 7, onComplete: () => { sp.offX = 0; } });
  }
}
