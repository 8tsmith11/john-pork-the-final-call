// Rules for a map flagged `chase` (Trevor approved the system; where it's used is in the sealed plan). Host-run,
// in the snapshot. The map is a long strip run left to right, and only these things change:
//   1. A pace line sweeps along it at `speed`. Behind it the drones catch you: a hit, and you're pushed up to the
//      line. Nobody dies of being slow; nothing happens for being ahead. Downed roommates are carried along.
//   2. Everyone rides: scooters are forced on with a full battery. On this map you can fire a held gun from one.
//   3. Strafes: a lane ahead is marked for `warn` seconds, then swept; anyone in it, ahead of the line, is hit once.
//   4. When the line reaches `end`, the drones turn back (a 'chaseDone' event: the scene sets chase.<map>.done,
//      which the exit can require). The end line is in the snapshot from the start, so it can be drawn.
// Map spec: chase: { speed, start, end, dmg, strafeEvery, warn, strafeDmg, lanes: [[y0, y1] tiles] }.
const TILE = 16;
export const CHASE = { speed: 120, start: 0, end: null, dmg: 6, push: 6, strafeEvery: 5, warn: 1.2, strafeDmg: 8, lanes: [], ahead: 260 };

export function newChase(map) {
  if (!map?.chase) return null;
  const cfg = { ...CHASE, ...(map.chase === true ? {} : map.chase) };
  cfg.end ??= map.w * TILE - 4 * TILE;
  return { cfg, t: 0, pace: cfg.start, nextStrafe: cfg.strafeEvery, strafe: null, done: false, n: 0 };
}

function carryRider(sim, p, pace, push) {
  const x = Math.min(pace + push, sim.map.w * TILE - 6);
  if (x < pace) return false;
  if (!sim._hits(x, p.y)) { p.x = x; return true; }
  const row = Math.floor(p.y / TILE);
  const rows = Array.from({ length: sim.map.h }, (_, y) => y).sort((a, b) => Math.abs(a - row) - Math.abs(b - row));
  for (let tx = Math.floor(x / TILE); tx < sim.map.w; tx++) {
    const landingX = Math.max(x, tx * TILE + TILE / 2);
    for (const ty of rows) {
      const y = ty * TILE + TILE / 2;
      if (sim._hits(landingX, y)) continue;
      p.x = landingX;
      p.y = y;
      return true;
    }
  }
  return false;
}

export function stepChase(sim, st, dt, rng = Math.random) {
  const c = st.cfg;
  if (st.done) return;
  st.t += dt;
  st.pace = Math.min(c.end, c.start + c.speed * st.t);
  for (const p of sim.players.values()) {
    if (!p.downed) { p.riding = true; p.battery = 100; p.playing = null; }
    if (p.x < st.pace && carryRider(sim, p, st.pace, c.push) && !p.downed) {
      sim._hurtPlayer(p, c.dmg, 0, { nonlethal: true });
      sim.events.push({ t: 'caught', id: p.id, x: p.x, y: p.y });
    }
  }
  // strafes: warn a lane ahead of the line, then sweep it
  if (c.lanes.length) {
    if (!st.strafe && st.t >= st.nextStrafe) {
      const at = st.t + c.warn;
      const x0 = Math.ceil(c.start + c.speed * at);
      if (x0 < c.end) {
        const [y0, y1] = c.lanes[Math.floor(rng() * c.lanes.length)];
        const x1 = Math.min(sim.map.w * TILE, Math.ceil(x0 + c.ahead));
        st.strafe = { y0: y0 * TILE, y1: (y1 + 1) * TILE, x0, x1, at, id: ++st.n };
        sim.events.push({ t: 'strafeWarn', ...st.strafe });
      }
    } else if (st.strafe && st.t >= st.strafe.at) {
      const s = st.strafe;
      for (const p of sim.players.values()) if (!p.downed && p.y >= s.y0 && p.y < s.y1 && p.x >= s.x0 && p.x < s.x1) { sim._hurtPlayer(p, c.strafeDmg, 0); }
      sim.events.push({ t: 'strafe', id: s.id, y0: s.y0, y1: s.y1 });
      st.strafe = null; st.nextStrafe = st.t + c.strafeEvery;
    }
  }
  if (st.pace >= c.end) { st.done = true; st.strafe = null; sim.events.push({ t: 'chaseDone', map: sim.map.id }); }
}

/** For the snapshot: where the line is, where it ends, any lane being marked, and whether it's over. */
export function chaseView(st) {
  return { pace: Math.round(st.pace), end: st.cfg.end, done: st.done, ...(st.strafe ? { sw: [st.strafe.y0, st.strafe.y1, Math.round(st.strafe.x0), Math.round(st.strafe.x1)] } : {}) };
}
