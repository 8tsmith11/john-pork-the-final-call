// Rules for a map flagged `inside` (Trevor approved the system; where it's used is in the sealed plan). Pure sim
// rules, host-run, in the snapshot. Kept apart from Michael's signal stages. Four things change, nothing else:
//   1. The clock: a visible beat. Enemies only get time in a short window on each beat (they act in bursts);
//      the party moves freely between beats. Shots fly as usual.
//   2. Wrap: with `wrap`, leaving one edge brings you in at the opposite one (players, enemies, shots).
//   3. Corruption: rot comes from corrupted floor tiles that flip on and off with the beat, not from being hit.
//   4. Collection: a downed roommate isn't revived or reloaded; after a few beats they come back, full health, at
//      the last terminal anyone reached. A full wipe still goes through the ordinary wipe.
// Map spec: inside: true | { beat, window, wrap, corrupt: [[x, y, phase]], terminals: [[x, y]], gcBeats }.
const TILE = 16;
export const INSIDE = { beat: 1.0, window: 0.3, wrap: false, corruptRate: 18, gcBeats: 4, termR: 24, corrupt: [], terminals: [] };

export function insideCfg(map) {
  if (!map?.inside) return null;
  return { ...INSIDE, ...(map.inside === true ? {} : map.inside) };
}

export function newInside(map) {
  const cfg = insideCfg(map);
  if (!cfg) return null;
  const at = cfg.terminals[0] ?? null;
  return { cfg, t: 0, n: 0, checkpoint: at ? { x: at[0] * TILE + 8, y: at[1] * TILE + 8 } : null };
}

/** Is corrupted tile k (one of cfg.corrupt) live on beat n? Each flips every beat, offset by its phase. */
export const corruptLive = (st, [, , phase = 0]) => (st.n + phase) % 2 === 0;

const wrap = (v, size) => ((v % size) + size) % size;

/**
 * Step the inside rules. Returns how much time enemies get this frame (0 between beats, sped up in the window, so
 * over a whole beat they get about as much time as anywhere else).
 */
export function stepInside(sim, st, dt) {
  const c = st.cfg, before = st.t;
  st.t += dt;
  if (Math.floor(st.t / c.beat) > Math.floor(before / c.beat)) { st.n++; sim.events.push({ t: 'beat', n: st.n }); }
  const phase = st.t % c.beat;
  // terminals: the last one anyone stood by is where collected roommates come back
  for (const [tx, ty] of c.terminals) {
    const x = tx * TILE + 8, y = ty * TILE + 8;
    if ((st.checkpoint?.x !== x || st.checkpoint?.y !== y) && [...sim.players.values()].some((p) => !p.downed && Math.hypot(p.x - x, p.y - y) <= c.termR)) {
      st.checkpoint = { x, y }; sim.events.push({ t: 'terminal', x, y });
    }
  }
  for (const p of sim.players.values()) {
    if (p.downed) {
      // collection: no revive needed in here; back at the checkpoint after gcBeats
      p.gcT = (p.gcT ?? 0) + dt;
      if (st.checkpoint && p.gcT >= c.gcBeats * c.beat && !sim.wiped) {
        Object.assign(p, { downed: false, reviveT: 0, gcT: 0, hp: sim.maxHp(p), x: st.checkpoint.x, y: st.checkpoint.y, iframes: 1, vx: 0, vy: 0 });
        sim.events.push({ t: 'collected', id: p.id, x: p.x, y: p.y });
      }
      continue;
    }
    p.gcT = 0;
    const tx = Math.floor(p.x / TILE), ty = Math.floor(p.y / TILE);
    for (const k of c.corrupt) if (k[0] === tx && k[1] === ty && corruptLive(st, k)) { sim.infect(p, c.corruptRate * dt); break; }
  }
  if (c.wrap) {
    const W = sim.map.w * TILE, H = sim.map.h * TILE;
    for (const o of [...sim.players.values(), ...sim.enemies.values(), ...sim.shots]) { o.x = wrap(o.x, W); o.y = wrap(o.y, H); }
  }
  return phase < c.window ? dt * (c.beat / c.window) : 0;
}

/** For the snapshot: the beat count, where in the beat we are (0..1), and which corrupted tiles are live. */
export function insideView(st) {
  return { n: st.n, ph: Math.round(((st.t % st.cfg.beat) / st.cfg.beat) * 100) / 100,
    live: st.cfg.corrupt.filter((k) => corruptLive(st, k)).map(([x, y]) => [x, y]), cp: st.checkpoint };
}
