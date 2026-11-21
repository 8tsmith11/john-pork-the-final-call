// A molting boss (what and where: the sealed plan; this file is plumbing). Host-run, drawn from the boss snapshot.
//   - Armoured: most of each hit is turned. Every so often it molts: the armour comes off and its shed skins drop
//     around it. Destroy every skin before the timer runs out and it stays bare for the phase; leave any and it
//     regrows the armour. Any hit from anyone destroys skin (no seat or build needed), and the count shows on the
//     boss bar ("SKIN BURNED 1/3  ·  7s").
//   - A climb and a drop: it goes up out of reach, a mark follows a player across the floor, then it drops on it.
//   - A breath: a line of burning puddles toward a player.
//   - Each new phase grows a fresh shell (it starts armoured again), with more skins and a faster drop.
export const MOLTER = {
  guard: 9, moltEvery: 14, skins: [3, 4, 5], skinHp: 20, burnTime: 10,
  climbEvery: 11, climbTell: 1.3, dropR: 34, dropDmg: 16,
  breathEvery: 7, breathPuddles: 5, breathDps: 7, speed: 26,
};
const M = MOLTER;
const phaseOf = (e) => { const f = e.hp / e.def.hp; return f < 0.33 ? 3 : f < 0.66 ? 2 : 1; };
function nearest(sim, x, y) {
  let best = null, bd = Infinity;
  for (const p of sim.players.values()) { if (p.downed) continue; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
  return best;
}

export function stepMolter(sim, e, dt) {
  const ph = phaseOf(e);
  if (e.phase !== ph) { e.phase = ph; e.armored = true; e.molt = null; e.moltT = M.moltEvery; sim.events.push({ t: 'phase', phase: ph }); }   // a fresh shell
  e.armored ??= true; e.moltT ??= M.moltEvery; e.climbT ??= M.climbEvery; e.breathT ??= M.breathEvery;
  const target = nearest(sim, e.x, e.y);
  // the shed: skins on the floor, a timer to burn them
  if (e.molt) {
    e.molt.t -= dt;
    const left = [...sim.enemies.values()].filter((m) => m.link === e.id && m.kind === 'enemy.skin');
    e.molt.burned = e.molt.total - left.length;
    if (!left.length) { sim.events.push({ t: 'moltBurned', id: e.id }); e.molt = null; e.moltT = Infinity; }   // bare for the rest of the phase
    else if (e.molt.t <= 0) {   // too slow: it grows back
      for (const m of left) sim.enemies.delete(m.id);
      e.armored = true; e.molt = null; e.moltT = M.moltEvery; sim.events.push({ t: 'moltRegrow', id: e.id });
    }
  } else if (e.armored && (e.moltT -= dt) <= 0) {
    e.armored = false; const n = M.skins[ph - 1];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, id = `e${sim._nextId++}`;
      let x = e.x + Math.cos(a) * 46, y = e.y + Math.sin(a) * 46;
      if (sim._hitsBox(x, y, 5, 4)) { x = e.x; y = e.y; }
      sim.enemies.set(id, { id, kind: 'enemy.skin', def: { name: 'Shed skin', hp: M.skinHp, radius: 6, color: 0xb8a070, speed: 0, damage: 0, xp: 2, ai: 'skin' }, x, y, hp: M.skinHp, cd: 0, hurtT: 0, kx: 0, ky: 0, link: e.id, summoned: true });
    }
    e.molt = { t: M.burnTime, total: n, burned: 0 };
    sim.events.push({ t: 'molt', id: e.id, x: e.x, y: e.y });
  }
  // climb and drop
  if (e.state === 'climb') {
    e.stT -= dt;
    const mk = e.marks?.[0];
    if (mk && target && e.stT > 0.35) { const d = Math.hypot(target.x - mk.x, target.y - mk.y) || 1, v = 70 * dt; mk.x += ((target.x - mk.x) / d) * Math.min(v, d); mk.y += ((target.y - mk.y) / d) * Math.min(v, d); }
    if (mk) mk.t = Math.max(0, e.stT);
    if (e.stT <= 0) {
      if (mk) { e.x = mk.x; e.y = mk.y; sim.events.push({ t: 'impact', x: mk.x, y: mk.y, r: M.dropR });
        for (const p of sim.players.values()) if (!p.downed && Math.hypot(p.x - mk.x, p.y - mk.y) < M.dropR) sim._hurtPlayer(p, M.dropDmg); }
      e.marks = []; e.state = 'move'; e.off = false; e.climbT = M.climbEvery - (ph - 1) * 2;
    }
    return;
  }
  if (target && (e.climbT -= dt) <= 0) {
    e.state = 'climb'; e.off = true; e.stT = M.climbTell + 1.2; e.marks = [{ x: target.x, y: target.y, t: e.stT }];
    sim.events.push({ t: 'climb', id: e.id }); return;
  }
  // breath: a line of burning puddles toward a player
  if (target && (e.breathT -= dt) <= 0) {
    e.breathT = M.breathEvery;
    const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
    for (let i = 1; i <= M.breathPuddles; i++) sim.hazards.push({ x: e.x + (dx / d) * i * 22, y: e.y + (dy / d) * i * 22, r: 11, ttl: 4.5, dps: M.breathDps });
    sim.events.push({ t: 'breath', id: e.id, x: e.x, y: e.y });
  }
  // otherwise it prowls toward the nearest player
  if (target) { const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1; if (d > 30) sim._moveBody(e, (dx / d) * M.speed * dt, (dy / d) * M.speed * dt, e.def.radius ?? 10); }
}

/** Armour turns most of a hit; up on the wall it can't be hit at all. */
export function molterDamage(e, dmg) {
  if (e.def?.ai !== 'molter') return dmg;
  if (e.off) return 0;
  return e.armored ? Math.max(1, dmg - M.guard) : dmg;
}
/** For the boss bar: [burned, total, seconds left] while a shed is on the floor. */
export const moltView = (e) => (e.molt ? [e.molt.burned, e.molt.total, Math.ceil(e.molt.t)] : null);
