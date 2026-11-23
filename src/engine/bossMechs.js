// Signature mechanics for the builder bosses (hub #121, Trevor, 2026-11-23: "every boss should be genuinely unique ...
// cooler/more interesting, skill based"). The shared pattern library (bossPatterns.js) still gives each boss its
// moves; on top of that, `def.mech` gives it one rule that comes from where it lives and that a player has to learn:
//
//   pylons  (the Fence)        shielded while its pylons stand; break them, then it's open until they rebuild
//   tide    (the Tide Table)   the arena floods on a cycle; in the water it hurts you and shrugs off hits, so pull it
//                              up onto dry ground
//   flicker (the Red Sign)     lit: shielded and attacking; dark: helpless and open. Learn the rhythm
//   listen  (the Receiver)     it targets noise: whoever attacks, shoots or dodges gets a dish strike; go quiet
//   mimic   (Shell Zero)       an echo walks your path two seconds behind you; don't double back over it
//   chorus  (the Congregation) its congregation holds it up (heals it, halves damage) while near; split them off
//
// Host-run rules. stepMech runs inside _stepBoss once the boss is awake, mechDamage scales a hit, mechView goes in the
// snapshot for the scene to draw (WorldScene._mechFx). Names are placeholders until the lore gate names the bosses.

export const MECH = {
  pylons: { n: 3, r: 70, shield: 0.1, open: 12, rebuild: 1.5 },
  tide: { cycle: 14, dry: 6, rise: 2, flood: 4, line: 0.45, dps: 8, inWater: 0.4, onDry: 1.2, heal: 0.01 },
  flicker: { lit: 3.2, dark: 2.0, warn: 0.6, litMul: 0.15, darkMul: 1.5 },
  listen: { every: 5, lock: 1.2, r: 20, dmg: 18 },
  mimic: { delay: 2, every: 6, life: 4, r: 9, dmg: 12 },
  chorus: { n: 3, every: 18, reach: 90, heal: 0.006, mul: 0.5 },
};
import { ENEMIES } from '../content/enemies.js';

const TILE = 16;

function spawnUnit(sim, e, kind, x, y, extra = {}) {
  const base = ENEMIES[kind]; if (!base) return null;
  const id = `e${sim._nextId++}`;
  if (sim._hitsBox(x, y, base.radius, base.radius * 0.7)) return null;
  sim.enemies.set(id, { id, kind, def: { ...base, vname: base.name, trait: 'plain' }, x, y, hp: base.hp, cd: 1, hurtT: 0, kx: 0, ky: 0, mechOf: e.id, ...extra });
  return id;
}
const units = (sim, e) => [...sim.enemies.values()].filter((u) => u.mechOf === e.id);
const noisy = (p) => p.swingT > 0 || p.dodgeT > 0 || (p.shotCd ?? 0) > 0.05;

/** One tick of the boss's signature rule (host). */
export function stepMech(sim, e, def, dt) {
  const kind = def.mech; if (!kind) return;
  const M = MECH[kind], m = (e.mech ??= { t: 0 });
  m.t += dt;
  const alive = (p) => !p.downed;

  if (kind === 'pylons') {
    const up = units(sim, e).length;
    if (!m.built || (m.openT !== undefined && (m.openT -= dt) <= 0 && up === 0)) {   // (re)build the pylons
      m.built = true; m.openT = undefined;
      for (let i = 0; i < M.n; i++) {   // around it; closer in, or turned a little, if a wall's in the way
        const a0 = (i / M.n) * Math.PI * 2 + m.t;
        tries: for (const r of [M.r, M.r * 0.7, M.r * 0.45]) for (const da of [0, 0.5, -0.5, 1]) if (spawnUnit(sim, e, 'enemy.fence_pylon', e.x + Math.cos(a0 + da) * r, e.y + Math.sin(a0 + da) * r * 0.7)) break tries;
      }
      sim.events.push({ t: 'mech', kind, what: 'rebuild', x: e.x, y: e.y });
    } else if (up === 0 && m.openT === undefined) {
      m.openT = M.open; sim.events.push({ t: 'mech', kind, what: 'open', x: e.x, y: e.y });
    }
    m.shielded = units(sim, e).length > 0;
  }

  if (kind === 'tide') {
    const c = m.t % M.cycle, H = sim.map.h * TILE, top = H * M.line;
    // 0 = dry, rising to 1 = flooded, then falling. The water covers everything below its edge.
    m.level = c < M.dry ? 0 : c < M.dry + M.rise ? (c - M.dry) / M.rise : c < M.dry + M.rise + M.flood ? 1 : 1 - (c - M.dry - M.rise - M.flood) / (M.cycle - M.dry - M.rise - M.flood);
    m.edge = H - (H - top) * m.level;
    if (m.level >= 1 && !m.warned) { m.warned = true; sim.events.push({ t: 'mech', kind, what: 'flood', x: e.x, y: e.y }); }
    if (m.level === 0) m.warned = false;
    const wet = (y) => m.level > 0 && y > m.edge;
    for (const p of sim.players.values()) if (alive(p) && wet(p.y) && (p._tideT = (p._tideT ?? 0) - dt) <= 0) { p._tideT = 0.5; sim._hurtPlayer(p, Math.round(M.dps * 0.5)); }
    m.bossWet = wet(e.y);
    if (m.bossWet) e.hp = Math.min(def.hp, e.hp + def.hp * M.heal * dt);
  }

  if (kind === 'flicker') {
    const c = m.t % (M.lit + M.dark), lit = c < M.lit;
    if (lit !== m.lit) { m.lit = lit; sim.events.push({ t: 'mech', kind, what: lit ? 'lit' : 'dark', x: e.x, y: e.y }); }
    m.warn = lit ? c > M.lit - M.warn : c > M.lit + M.dark - M.warn;   // the buzz before it changes
    if (!lit) { e.cd = Math.max(e.cd, 0.3); if (e.state === 'windup') e.state = 'move'; }   // dark: it can't attack
  }

  if (kind === 'listen') {
    if (!m.lock && (m.wait = (m.wait ?? M.every) - dt) <= 0) {
      const loud = [...sim.players.values()].filter((p) => alive(p) && noisy(p));
      if (loud.length) { const p = loud[0]; m.lock = { x: p.x, y: p.y, t: M.lock, who: p.id }; sim.events.push({ t: 'mech', kind, what: 'lock', x: p.x, y: p.y }); }
      else m.wait = 0.4;   // nobody's making noise: keep listening
    }
    if (m.lock) {
      const p = sim.players.get(m.lock.who);
      if (p && noisy(p)) { m.lock.x = p.x; m.lock.y = p.y; }   // it follows you while you're loud, not when you go quiet
      if ((m.lock.t -= dt) <= 0) {
        for (const q of sim.players.values()) if (alive(q) && Math.hypot(q.x - m.lock.x, q.y - m.lock.y) < M.r - sim._small(q)) sim._hurtPlayer(q, Math.round(M.dmg * (def.dmgMul ?? 1)));
        sim.events.push({ t: 'impact', x: m.lock.x, y: m.lock.y, r: M.r });
        m.lock = null; m.wait = M.every;
      }
    }
  }

  if (kind === 'mimic') {
    const [target] = sim._nearestPlayer(e.x, e.y);
    m.trail ??= [];
    if (target && (m.rec = (m.rec ?? 0) - dt) <= 0) { m.rec = 0.1; m.trail.push([target.x, target.y, m.t]); while (m.trail.length && m.t - m.trail[0][2] > M.delay + M.life) m.trail.shift(); }
    if (!m.echo && (m.wait = (m.wait ?? 3) - dt) <= 0) { m.echo = { start: m.t, hit: new Set() }; m.wait = M.every; sim.events.push({ t: 'mech', kind, what: 'echo', x: e.x, y: e.y }); }
    if (m.echo) {
      const at = m.t - M.delay, pt = m.trail.find((q) => q[2] >= at);   // where the target was two seconds ago
      if (!pt || m.t - m.echo.start > M.life) m.echo = null;
      else {
        m.echo.x = pt[0]; m.echo.y = pt[1];
        for (const p of sim.players.values()) if (alive(p) && !m.echo.hit.has(p.id) && Math.hypot(p.x - pt[0], p.y - pt[1]) < M.r - sim._small(p)) { m.echo.hit.add(p.id); sim._hurtPlayer(p, Math.round(M.dmg * (def.dmgMul ?? 1))); }
      }
    }
  }

  if (kind === 'chorus') {
    if ((m.wait = (m.wait ?? 0) - dt) <= 0) {
      m.wait = M.every;
      const have = units(sim, e).length;
      for (let i = have; i < M.n; i++) { const a = (i / M.n) * Math.PI * 2; spawnUnit(sim, e, 'enemy.rot_taken', e.x + Math.cos(a) * 40, e.y + Math.sin(a) * 30, { summoned: true }); }
      sim.events.push({ t: 'mech', kind, what: 'gather', x: e.x, y: e.y });
    }
    m.holders = units(sim, e).filter((u) => Math.hypot(u.x - e.x, u.y - e.y) < M.reach).map((u) => u.id);
    if (m.holders.length) e.hp = Math.min(def.hp, e.hp + def.hp * M.heal * dt);
  }
}

/** How much of a hit lands, after the signature rule. */
export function mechDamage(sim, e, dmg) {
  const kind = e.def?.mech, m = e.mech; if (!kind || !m) return dmg;
  const M = MECH[kind];
  if (kind === 'pylons' && m.shielded) return Math.max(1, Math.round(dmg * M.shield));
  if (kind === 'tide') return Math.max(1, Math.round(dmg * (m.bossWet ? M.inWater : M.onDry)));
  if (kind === 'flicker') return Math.max(1, Math.round(dmg * (m.lit === false ? M.darkMul : M.litMul)));
  if (kind === 'chorus' && m.holders?.length) return Math.max(1, Math.round(dmg * M.mul));
  return dmg;
}

/** Is the boss's rule shielding it right now (for the scene's 'BRACED'-style feedback)? */
export const mechShielded = (e) => {
  const m = e.mech, k = e.def?.mech;
  return !!m && ((k === 'pylons' && m.shielded) || (k === 'flicker' && m.lit !== false) || (k === 'tide' && m.bossWet) || (k === 'chorus' && m.holders?.length > 0));
};

/** Compact state for the snapshot. */
export function mechView(e) {
  const k = e.def?.mech, m = e.mech; if (!k || !m) return undefined;
  const R = Math.round;
  if (k === 'pylons') return { k, s: m.shielded ? 1 : 0, o: m.openT != null ? Math.ceil(m.openT) : null };
  if (k === 'tide') return { k, e: R(m.edge ?? 0), l: Math.round((m.level ?? 0) * 100) / 100, w: m.bossWet ? 1 : 0 };
  if (k === 'flicker') return { k, lit: m.lit === false ? 0 : 1, warn: m.warn ? 1 : 0 };
  if (k === 'listen') return { k, ...(m.lock ? { lx: R(m.lock.x), ly: R(m.lock.y), lt: Math.round(m.lock.t * 10) / 10 } : {}) };
  if (k === 'mimic') return { k, ...(m.echo?.x != null ? { ex: R(m.echo.x), ey: R(m.echo.y) } : {}) };
  if (k === 'chorus') return { k, h: m.holders ?? [] };
  return { k };
}
