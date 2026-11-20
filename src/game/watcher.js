// A long-running story beat (sealed: docs/sealed/trevor-requests.md 3d; PROCESS "Spoilers and surprises"). Keep plain
// comments here to timing and plumbing. Content (lines, flags, the place) is ROT13 data in src/content/watcher_sealed.js.
//
// Two parts, both host-run, shown the same on every screen:
//   1. A tension track: beats that play one at a time, in order, each once, when its story flag is set and nothing
//      else is on screen (texts, a screen glitch, a far-off sound). Spaced out so they build.
//   2. The climax: on its map, once its story flag is set, whatever beats were skipped collapse into the last one,
//      then a voiced line, then the cinematic, then the impact (collateral in a radius, a crater that stays) and the
//      fight. It doesn't depend on anything else: the flag and the map are the only conditions, so every path that
//      reaches that flag reaches the climax (tested). Leave mid-fight or reload and the crater and the fight are
//      still there; the fight is the way on.
import SEALED from '../content/watcher_sealed.js';
import { defineBoss } from '../content/builders.js';
import { speak, babble, sfx } from '../audio/audio.js';
import { getLang } from '../i18n.js';

const rot13 = (t) => t.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13) % 26) + (c <= 'Z' ? 65 : 97)));
export const WATCH = JSON.parse(rot13(SEALED));
const TILE = 16, BEAT_GAP = 25000;   // ms between two beats, so they spread out even if flags arrive together

export const flagsOf = (d) => ({ beat: (b) => `${d.id}.beat.${b.id}`, landed: `${d.id}.landed`, down: `boss.${d.id}.down` });

/** The climax is due: its map, its flag, and it hasn't happened. Nothing else (no beat, no roll) can hold it back. */
export function climaxDue(d, flags, mapId) {
  const c = d.climax, f = flagsOf(d);
  return !!(c?.map && mapId === c.map && flags[c.flag] && !flags[f.landed]);
}
/** The fight is still owed: landed here, not won yet. */
export function fightOwed(d, flags, mapId) {
  const f = flagsOf(d);
  return !!(d.climax?.map && mapId === d.climax.map && flags[f.landed] && !flags[f.down]);
}
/** The next beat to play, if any: the first unplayed one whose flag is set. */
export function nextBeat(d, flags) {
  const f = flagsOf(d);
  return d.beats.find((b) => flags[b.after] && !flags[f.beat(b)]) ?? null;
}

export class Watcher {
  constructor(scene, data = WATCH) {
    this.s = scene; this.d = data; this.f = flagsOf(data);
    this.lastBeatAt = -1e9; this.busy = false;
  }

  _quiet() { const s = this.s; return !(s.dlg || s.menu || s.stage?.active || s.comic?.active || s._transitioning || s._rotReload); }

  /** Host, every frame. */
  update() {
    const s = this.s;
    if (s.mode === 'client' || this.busy || !this._quiet() || !s.save) return;
    const flags = s.save.flags;
    if (climaxDue(this.d, flags, s.map?.id)) { this.climax(); return; }
    const b = nextBeat(this.d, flags);
    if (b && s.time.now - this.lastBeatAt >= BEAT_GAP) { this.lastBeatAt = s.time.now; this._mark(b); this._send({ t: 'watch', op: 'beat', id: b.id }); }
  }

  _mark(b) { this.s.save.flags[this.f.beat(b)] = true; }

  /** Host: the climax. Skipped beats fold into the last one, so the warning always comes first. */
  climax() {
    const s = this.s, d = this.d, flags = s.save.flags;
    this.busy = true;
    const unseen = d.beats.filter((b) => !flags[this.f.beat(b)]);
    for (const b of unseen) this._mark(b);
    const last = unseen.length ? unseen[unseen.length - 1] : null;
    flags[this.f.landed] = true;   // set first: a reload mid-sequence lands straight in the fight, never replays it
    this._send({ t: 'watch', op: 'climax', last: last?.id ?? null });
    s._save?.();
  }

  // Everyone: show a beat, or play the climax. The host's _send runs this locally too.
  _present(msg) {
    const s = this.s, es = getLang() === 'es', d = this.d;
    if (msg.op === 'beat') {
      const b = d.beats.find((x) => x.id === msg.id); if (!b) return;
      const text = es && b.es ? b.es : b.text;
      if (b.kind === 'sms') { sfx?.('pickup'); const texts = (s.save.world.phone ??= { texts: [] }).texts; if (!texts.some((t) => t.text === b.text)) texts.push({ from: b.who, text: b.text, at: new Date().toISOString() }); s._say?.(`${String(b.who).toUpperCase()}\n${text}`); }
      else if (b.kind === 'glitch') { s.cameras?.main?.flash?.(220, 120, 255, 200); s._say?.(text); }
      else { s.cameras?.main?.shake?.(400, 0.002); s._say?.(text); }
      return;
    }
    if (msg.op === 'climax') {
      const c = d.climax, line = es && c.line.es ? c.line.es : c.line.text;
      const go = () => {
        if (!(this.s.dlgVoiced !== false && speak(c.line.who, line))) babble(c.line.who, line);
        s._caption?.(`${String(c.line.who).toUpperCase()}: ${line}`);
        s.time.delayedCall(2600, () => s.playCinematic ? s.playCinematic(c.cinematic, () => this._land()) : this._land());
      };
      const last = d.beats.find((x) => x.id === msg.last);
      if (last) { this._present({ op: 'beat', id: last.id }); s.time.delayedCall(2200, go); } else go();
    }
  }

  // After the cinematic: the impact and the fight (host), the crater (everyone).
  _land() {
    const s = this.s, c = this.d.climax, x = c.at[0] * TILE + 8, y = c.at[1] * TILE + 8;
    s.cameras?.main?.shake?.(900, 0.012);
    this.drawCrater();
    if (s.mode !== 'client') { s.sim.impact(x, y, c.r * TILE, 18); this.spawnFight(); }
    this.busy = false;
  }

  /** Host: the fight, at the crater (also when the party comes back to an unfinished one). */
  spawnFight() {
    const s = this.s, c = this.d.climax;
    if ([...s.sim.enemies.values()].some((e) => e.kind === `boss.${this.d.id}`)) return;
    const w = defineBoss(c.boss)(Math.max(1, s.sim.players.size));
    s.sim.spawnBoss(`boss.${this.d.id}`, w, c.at[0] * TILE + 8, c.at[1] * TILE + 8, `${this.d.id}#fight`);   // its look rides in the sealed spec
  }

  /** Map shown: a crater that already happened stays, its collateral stays gone, and an unfinished fight resumes. */
  onMapShown() {
    const s = this.s;
    if (!this.d.climax?.map || s.map?.id !== this.d.climax.map || !s.save.flags[this.f.landed]) return;
    this.drawCrater();
    if (s.mode !== 'client' && fightOwed(this.d, s.save.flags, s.map.id)) s.time.delayedCall(400, () => this.spawnFight());
  }

  drawCrater() {
    const s = this.s, c = this.d.climax, x = c.at[0] * TILE + 8, y = c.at[1] * TILE + 8, r = c.r * TILE;
    if (!s.add) return;
    this.crater?.destroy();
    this.crater = s.add.graphics().setDepth(2.2);
    this.crater.fillStyle(0x1a120c, 0.85).fillEllipse(x, y, r * 2, r * 1.3).fillStyle(0x3a2a1c, 0.6).fillEllipse(x, y - 2, r * 1.4, r * 0.8).lineStyle(2, 0x5a3e28, 0.8).strokeEllipse(x, y, r * 2, r * 1.3);
    for (const [id, p] of Object.entries(s.propById ?? {})) {   // collateral: what stood in the blast is gone
      const o = s.map.objects.find((q) => q.id === id);
      if (o && !o.npc && o.action !== 'exit' && Math.hypot(o.x * TILE + 8 - x, o.y * TILE + 8 - y) <= r) p.im?.setVisible(false);
    }
  }

  _send(msg) { if (this.s.mode === 'host') this.s.net?.broadcast(msg); this._present(msg); }
  onClientMsg(msg) { if (msg?.t !== 'watch') return false; this._present(msg); return true; }
}
