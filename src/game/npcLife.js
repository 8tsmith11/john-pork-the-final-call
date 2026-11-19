// Named NPCs that act alive (Manuel's request): they turn to look at the nearest roommate, move a little
// in their own way (src/content/npc_life.js moods), throw a short line when you walk up (once per visit),
// shrink back when enemies are close, and complain when Manuel's gas cloud reaches them. Cosmetic and
// local: each screen animates its own copy; nothing here touches the sim or the save.
import { NPC_LIFE, NPC_FART } from '../content/npc_life.js';
import { esLine } from '../content/lines_es.js';

const LOOK = 60, HI = 30, AFRAID = 70;

export class NpcLife {
  constructor(scene) {
    this.s = scene;
    this.mapId = null;
    this.state = new Map();     // npc id -> { bx, by, phase, greeted, line, nextHop }
    this.quietUntil = 0;
  }

  _reset() {
    for (const st of this.state.values()) st.line?.destroy();
    this.state.clear(); this.mapId = this.s.map?.id;
  }

  update(snap) {
    const s = this.s, map = s.map;
    if (!map || !s.propById) return;
    if (map.id !== this.mapId) this._reset();
    const now = s.time.now, players = (snap?.players ?? []).filter((p) => !p.dn);
    const me = players.find((p) => p.id === s.localId);
    const enemies = snap?.enemies ?? [];
    for (const o of map.objects) {
      if (!o.npc) continue;
      const im = s.propById[o.id]?.im;
      if (!im?.active || !im.visible) continue;
      let st = this.state.get(o.id);
      if (!st) { st = { bx: im.x, by: im.y, phase: (o.x * 13 + o.y * 7) % 100, greeted: false, nextHop: now + 1500 + ((o.x * 97) % 3000) }; this.state.set(o.id, st); }
      const life = NPC_LIFE[o.id] ?? { mood: 'still' };
      if (s.perf?.asleep?.(o)) { im.setPosition(st.bx, st.by + 1); continue; }   // asleep: slumped, still
      const cx = st.bx + 8, cy = st.by - 8;
      // Afraid: an enemy close by makes them shrink back and tremble.
      const scared = enemies.some((e) => Math.hypot(e.x - cx, e.y - cy) < AFRAID);
      // Turn to look at the nearest roommate.
      let near = null, nd = LOOK;
      for (const p of players) { const d = Math.hypot(p.x - cx, p.y - cy); if (d < nd) { nd = d; near = p; } }
      if (near) im.setFlipX(near.x < cx);
      // Move in character.
      let dx = 0, dy = 0;
      const t = now / 1000 + st.phase;
      if (scared) { dx = Math.sin(now / 40) * 0.8; dy = 1; }
      else if (life.mood === 'pace') dx = Math.round(Math.sin(t * 0.6) * 3);
      else if (life.mood === 'nod') dy = Math.sin(t * 0.35) > 0.85 ? 1 : 0;
      else if (life.mood === 'fidget' && now > st.nextHop) {
        st.nextHop = now + 2200 + Math.random() * 3500;
        s.tweens.add({ targets: im, y: st.by - 2, duration: 90, yoyo: true });
        if (!near && Math.random() < 0.5) im.setFlipX(!im.flipX);
      }
      if (!s.tweens.isTweening(im)) im.setPosition(st.bx + dx, st.by + dy);
      if (st.line) st.line.setPosition(im.x + 8, im.y - 26);
      // A line when you walk up, once per visit, one voice at a time.
      if (me && !st.greeted && !s.dlg && !s.menu && now > this.quietUntil && Math.hypot(me.x - cx, me.y - cy) < HI && life.hi?.length) {
        st.greeted = true; this.quietUntil = now + 3500;
        this._say(o.id, life.hi[Math.floor(Math.random() * life.hi.length)], 2800);
      }
    }
  }

  _say(id, text, ms) {
    const s = this.s, im = s.propById?.[id]?.im, st = this.state.get(id);
    if (!im || !st) return;
    st.line?.destroy();
    const line = s.add.text(im.x + 8, im.y - 26, esLine(text), { fontFamily: 'monospace', fontSize: '6px', color: '#e8e8f0', backgroundColor: '#0b0d16cc', padding: { x: 2, y: 1 } }).setOrigin(0.5, 1).setDepth(7000);
    st.line = line;
    s.time.delayedCall(ms, () => { if (st.line === line) st.line = null; line.destroy(); });
  }

  /** Manuel's gas cloud at (x, y): NPCs within reach lean away and complain. */
  onFart(x, y) {
    const s = this.s; let delay = 900;
    for (const o of s.map?.objects ?? []) {
      if (!o.npc || s.perf?.asleep?.(o)) continue;
      const im = s.propById?.[o.id]?.im, st = this.state.get(o.id);
      if (!im?.visible || !st || Math.hypot(st.bx + 8 - x, st.by - 8 - y) > 80) continue;
      const away = st.bx + 8 > x ? 1 : -1;
      s.time.delayedCall(delay, () => {
        if (!im.active) return;
        s.tweens.add({ targets: im, x: st.bx + away * 3, duration: 160, yoyo: true, hold: 700 });
        const pool = [...(NPC_FART[o.id] ?? []), ...NPC_FART.any];
        this._say(o.id, pool[Math.floor(Math.random() * pool.length)], 2400);
      });
      delay += 500;
    }
  }

  destroy() { this._reset(); }
}
