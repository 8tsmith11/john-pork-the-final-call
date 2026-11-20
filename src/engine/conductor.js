// A conductor boss: it flies a swarm of drones in shapes, held together by a few relay drones (what and where: the
// sealed plan; this file is plumbing). Host-run inside the sim, drawn from the ordinary enemy snapshot.
//   - Shapes, one after another: a WALL that sweeps across toward the party, a FIST that winds up and rushes one
//     player, a RING that closes on one player and always leaves a gap. Each shape telegraphs before it hurts.
//   - Relays hover around the conductor, each linked to it by a visible beam (readable without any ability; a Ping
//     mark helps). Kill one and the swarm drops for a few seconds: drones fall dead, and the conductor takes full
//     damage. Otherwise the swarm soaks most of it. Dead relays come back after a while.
//   - More relays, more drones and more shapes as its health falls.
const TILE = 16;
export const CONDUCTOR = {
  relays: [3, 4, 5], drones: [10, 14, 18], relayHp: 30, droneHp: 6, relayRespawn: 9, dropFor: 4.5, shield: 0.1,
  shapes: [['wall', 'fist'], ['wall', 'fist', 'ring'], ['fist', 'ring', 'wall']], shapeTime: 4, telegraph: 1, droneDmg: 8,
  keepAway: 140, speed: 22, orbit: 54, ringGap: 2,
};
const C = CONDUCTOR;
const phaseOf = (e) => { const f = e.hp / e.def.hp; return f < 0.33 ? 3 : f < 0.66 ? 2 : 1; };

function nearestPlayer(sim, x, y) {
  let best = null, bd = Infinity;
  for (const p of sim.players.values()) { if (p.downed) continue; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
  return best;
}

function spawnMinion(sim, e, kind, hp, radius, color) {
  const id = `e${sim._nextId++}`;
  sim.enemies.set(id, { id, kind, def: { name: kind === 'enemy.relay' ? 'Relay' : 'Drone', hp, radius, color, speed: 0, damage: 0, xp: kind === 'enemy.relay' ? 4 : 0, ai: kind === 'enemy.relay' ? 'relay' : 'swarmling' },
    x: e.x, y: e.y, hp, cd: 0, hurtT: 0, kx: 0, ky: 0, link: e.id, summoned: true });
  return id;
}

/** One step of the conductor and everything it flies. */
export function stepConductor(sim, e, dt) {
  const ph = phaseOf(e);
  if (ph !== e.phase) { e.phase = ph; sim.events.push({ t: 'phase', phase: ph }); }
  const target = nearestPlayer(sim, e.x, e.y);
  e.t = (e.t ?? 0) + dt;
  // relays: keep the phase's count, respawning dead ones after a while
  const relays = [...sim.enemies.values()].filter((m) => m.link === e.id && m.kind === 'enemy.relay');
  const drones = [...sim.enemies.values()].filter((m) => m.link === e.id && m.kind === 'enemy.swarmling');
  if (e.relaysSeen !== undefined && relays.length < e.relaysSeen) { e.dropT = C.dropFor; sim.events.push({ t: 'swarmDrop', id: e.id, x: e.x, y: e.y }); }
  e.respawnT = relays.length < C.relays[ph - 1] ? (e.respawnT ?? C.relayRespawn) - dt : C.relayRespawn;
  if (e.relaysSeen === undefined || (e.respawnT <= 0 && relays.length < C.relays[ph - 1])) {
    const want = e.relaysSeen === undefined ? C.relays[ph - 1] : 1;
    for (let i = 0; i < want; i++) relays.push(sim.enemies.get(spawnMinion(sim, e, 'enemy.relay', C.relayHp, 5, 0xffd27f)));
    e.respawnT = C.relayRespawn;
  }
  e.relaysSeen = relays.length;
  relays.forEach((r, i) => { const a = e.t * 0.6 + (i / relays.length) * Math.PI * 2; r.x = e.x + Math.cos(a) * C.orbit; r.y = e.y + Math.sin(a) * C.orbit * 0.7; });
  if (drones.length < C.drones[ph - 1] && !(e.dropT > 0)) drones.push(sim.enemies.get(spawnMinion(sim, e, 'enemy.swarmling', C.droneHp, 3, 0x8a93a8)));
  // the conductor keeps its distance
  if (target) {
    const dx = e.x - target.x, dy = e.y - target.y, d = Math.hypot(dx, dy) || 1, k = d < C.keepAway ? 1 : d > C.keepAway + 40 ? -1 : 0;
    if (k) sim._moveBody(e, (dx / d) * k * C.speed * dt, (dy / d) * k * C.speed * dt, e.def.radius ?? 10);
  }
  // dropped: the drones fall where they are and do nothing
  if (e.dropT > 0) {
    e.dropT = Math.max(0, e.dropT - dt);
    for (const m of drones) m.dead = true;
    if (e.dropT === 0) sim.events.push({ t: 'swarmUp', id: e.id });
    return;
  }
  for (const m of drones) m.dead = false;
  // shapes
  const shapes = C.shapes[ph - 1];
  if (!e.shape || e.shapeT >= C.shapeTime) {
    e.shapeI = ((e.shapeI ?? -1) + 1) % shapes.length; e.shape = shapes[e.shapeI]; e.shapeT = 0;
    e.lock = target ? { x: target.x, y: target.y, from: { x: e.x, y: e.y } } : { x: e.x, y: e.y, from: { x: e.x, y: e.y } };
    sim.events.push({ t: 'swarmShape', id: e.id, shape: e.shape, x: e.lock.x, y: e.lock.y });
  }
  e.shapeT += dt;
  const live = e.shapeT > C.telegraph, k = Math.min(1, Math.max(0, (e.shapeT - C.telegraph) / (C.shapeTime - C.telegraph))), L = e.lock;
  const n = drones.length;
  drones.forEach((m, i) => {
    const u = n > 1 ? i / (n - 1) : 0.5;
    if (e.shape === 'wall') {   // a line across the path from the conductor toward where the target was, sweeping past them
      const ax = L.x - L.from.x, ay = L.y - L.from.y, ad = Math.hypot(ax, ay) || 1, nx = -ay / ad, ny = ax / ad;
      const cx = L.from.x + ax * (live ? k * 1.6 : 0.15), cy = L.from.y + ay * (live ? k * 1.6 : 0.15);
      m.x = cx + nx * (u - 0.5) * 170; m.y = cy + ny * (u - 0.5) * 170;
    } else if (e.shape === 'fist') {   // bunched at the conductor (shaking: the tell), then a rush at the locked spot and back
      const a = (i / n) * Math.PI * 2, r = 10 + (i % 3) * 4, jitter = live ? 0 : Math.sin(e.t * 40 + i) * 2;
      const go = live ? (k < 0.5 ? k * 2 : 2 - k * 2) : 0;
      const cx = e.x + (L.x - e.x) * go, cy = e.y + (L.y - e.y) * go;
      m.x = cx + Math.cos(a) * r + jitter; m.y = cy + Math.sin(a) * r;
    } else {   // ring: around the locked spot, closing, with a gap to slip out through
      const gap = C.ringGap, slots = n + gap, a = ((i + gap) / slots) * Math.PI * 2 + 0.3, r = live ? 120 - k * 100 : 120;
      m.x = L.x + Math.cos(a) * r; m.y = L.y + Math.sin(a) * r;
    }
    m.tell = !live;
  });
  // drones hurt on contact once the shape is live
  if (live) for (const p of sim.players.values()) {
    if (p.downed) continue;
    if (drones.some((m) => Math.hypot(m.x - p.x, m.y - p.y) < 9)) sim._hurtPlayer(p, C.droneDmg, 0);
  }
}

/** The swarm soaks hits on the conductor unless it's dropped. */
export function conductorDamage(e, dmg) {
  return e.def?.ai === 'conductor' && !(e.dropT > 0) ? Math.max(1, Math.round(dmg * C.shield)) : dmg;
}
