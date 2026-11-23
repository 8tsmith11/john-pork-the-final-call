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
export const INSIDE = { beat: 1.0, window: 0.3, wrap: false, corruptRate: 18, gcBeats: 4, termR: 24, corrupt: [], terminals: [],
  skipEvery: 0, slices: false, idleMove: 8, idleBeats: 2 };

// The Scheduler (a boss for the last inside sector; placement sealed) drives these through schedulerPhase():
//   skipEvery: every Nth beat is skipped: no window, the rhythm stutters.
//   slices: time-slicing. One roommate holds the seat per beat, in turn (AI roommates too); everyone else is held.
//   Held roommates are never punished. A seat-holder who barely moves through their slice gets their floor
//   deallocated: a corrupted tile under them for idleBeats beats.
export const SCHEDULER_PHASES = [null, { beat: 1.0 }, { beat: 0.75 }, { beat: 0.75, skipEvery: 3, slices: true }];
export function schedulerPhase(st, phase) {
  const ph = SCHEDULER_PHASES[Math.max(1, Math.min(SCHEDULER_PHASES.length - 1, phase))];
  st.cfg = { ...st.cfg, skipEvery: 0, slices: false, ...ph };
  if (!st.cfg.slices) {
    st.seat = null;
    st.seatCharacter = null;
    st.seatTravel = 0;
  }
  return st.cfg;
}

export function insideCfg(map) {
  if (!map?.inside) return null;
  return { ...INSIDE, ...(map.inside === true ? {} : map.inside) };
}

export function newInside(map) {
  const cfg = insideCfg(map);
  if (!cfg) return null;
  const terminals = cfg.terminals.map(([x, y]) => ({ x: x * TILE + 8, y: y * TILE + 8 }));
  const checkpoint = terminals[0] ?? map.spawns[0] ?? null;
  return { cfg, t: 0, n: 0, checkpoint, terminals, visits: new WeakMap(),
    seat: null, seatCharacter: null, seatSince: 0, seatTravel: 0, temp: [] };
}

/** Is corrupted tile k (one of cfg.corrupt) live on beat n? Each flips every beat, offset by its phase. */
export const corruptLive = (st, [, , phase = 0]) => (st.n + phase) % 2 === 0;

const wrap = (v, size) => ((v % size) + size) % size;

export function wrapInsidePoint(map, point) {
  point.x = wrap(point.x, map.w * TILE);
  point.y = wrap(point.y, map.h * TILE);
}

/** Advance the clock before applying any player controls for this frame. */
export function advanceInsideClock(sim, st, dt) {
  const c = st.cfg, before = st.t;
  st.t += dt;
  const nextBeat = Math.floor(st.t / c.beat) > Math.floor(before / c.beat);
  if (nextBeat) {
    st.n++; sim.events.push({ t: 'beat', n: st.n, skip: skipped(st) });
    st.temp = st.temp.filter((k) => k[3] > st.n);
  }
  const holder = sim.players.get(st.seat);
  if (c.slices && (nextBeat || !holder || holder.downed)) passSeat(sim, st, nextBeat);
}

/** Apply hazards and collection, then return the time enemies get during this frame. */
export function stepInside(sim, st, dt) {
  const c = st.cfg, phase = st.t % c.beat;
  for (const p of sim.players.values()) {
    if (c.wrap) wrapInsidePoint(sim.map, p);
    // An arrival changes the checkpoint. Someone waiting at an older terminal leaves it alone.
    const terminal = p.downed ? null : st.terminals.find(({ x, y }) => Math.hypot(p.x - x, p.y - y) <= c.termR);
    if (terminal && st.visits.get(p) !== terminal && st.checkpoint !== terminal) {
      st.checkpoint = terminal;
      sim.events.push({ t: 'terminal', x: terminal.x, y: terminal.y });
    }
    if (terminal) st.visits.set(p, terminal);
    else st.visits.delete(p);
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
    if (heldBySlice(st, p)) continue;
    const tx = Math.floor(p.x / TILE), ty = Math.floor(p.y / TILE);
    for (const k of c.corrupt) if (k[0] === tx && k[1] === ty && corruptLive(st, k)) { sim.infect(p, c.corruptRate * dt); break; }
    if (st.temp.some((k) => k[0] === tx && k[1] === ty)) sim.infect(p, c.corruptRate * dt);
  }
  return phase < c.window && !skipped(st) ? dt * (c.beat / c.window) : 0;
}

const skipped = (st) => st.cfg.skipEvery > 0 && st.n > 0 && st.n % st.cfg.skipEvery === 0;

// Hand the seat to the next standing roommate (in a fixed order, so everyone gets a turn); first judge the one
// leaving it: idle through the whole slice means a deallocated tile under them.
function passSeat(sim, st, nextBeat) {
  const c = st.cfg;
  const up = [...sim.players.values()].filter((p) => !p.downed).sort((a, b) => String(a.character).localeCompare(String(b.character)));
  const cur = up.find((p) => p.id === st.seat);
  const fullSlice = st.t - st.seatSince >= c.beat - 1e-6;
  if (nextBeat && cur && fullSlice && st.seatTravel < c.idleMove) {
    const tile = [Math.floor(cur.x / TILE), Math.floor(cur.y / TILE), 0, st.n + c.idleBeats];
    st.temp.push(tile); sim.events.push({ t: 'dealloc', id: cur.id, x: tile[0], y: tile[1] });
  }
  const next = up.find((p) => String(p.character).localeCompare(String(st.seatCharacter ?? '')) > 0) ?? up[0];
  st.seat = next?.id ?? null;
  st.seatCharacter = next?.character ?? null;
  st.seatSince = st.t;
  st.seatTravel = 0;
}

/** Time-slicing: is this player held this beat? */
export const heldBySlice = (st, p) => !!(st?.cfg.slices && st.seat && p.id !== st.seat && !p.downed);

/** For the snapshot: the beat count, where in the beat we are (0..1), and which corrupted tiles are live. */
export function insideView(st) {
  return { n: st.n, ph: Math.round(((st.t % st.cfg.beat) / st.cfg.beat) * 100) / 100,
    live: [...st.cfg.corrupt.filter((k) => corruptLive(st, k)), ...st.temp].map(([x, y]) => [x, y]), cp: st.checkpoint,
    ...(st.cfg.slices ? { seat: st.seat } : {}), ...(skipped(st) ? { skip: true } : {}) };
}
