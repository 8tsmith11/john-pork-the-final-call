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
//   vents   (the Cooling Tower) floor vents blow in a sequence you can see coming; lure it over one and it's scalded open
//   current (the Intake)       the river pulls everyone toward it, in surges; after a surge it's gulping and open
//   power   (the Sealed Hall)  cables to floor sockets keep it shielded; stand on a socket to cut it
//   rewind  (the Master Clock) every so often it puts everyone back where they were three seconds ago and takes back
//                              half the damage of those seconds; hit it right after a rewind
//   molten  (Potline Nine)     channels fill with molten metal in turn; bait its charge into one and it sticks, open
//   verify  (the Attestation Gate) green: open; red: it scans, and anyone moving gets zapped. Hold still
//   rubric  (the Autograder)   it marks one kind of answer at a time (swing, shoot, dash-strike, on the board);
//                              the right kind lands hard, anything else barely scores. Change how you fight
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
  vents: { every: 2.6, warn: 1.0, blow: 0.6, r: 14, dmg: 14, scald: 2.0, scaldMul: 2 },
  current: { pull: 14, surge: 50, every: 7, warn: 1.0, last: 2.0, open: 2.5, openMul: 1.6, mouth: 26, dps: 12 },
  power: { n: 3, r: 14, hold: 1.5, off: 8, mul: [1.5, 0.75, 0.4, 0.2] },
  rewind: { every: 12, warn: 1.2, back: 3, giveBack: 0.5 },
  molten: { every: 5, warn: 1.0, last: 4, half: 14, dps: 10, stuck: 2.5, stuckMul: 1.8 },
  verify: { green: 5, amber: 1, red: 3, greenMul: 1.2, redMul: 0.1, still: 3, dmg: 8 },
  rubric: { every: 8, order: ['melee', 'shot', 'dash'], right: 1.6, wrong: 0.4 },
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

  if (['vents', 'current', 'power', 'rewind', 'molten', 'verify'].includes(kind)) stepMech3(sim, e, def, dt, kind, M, m);

  if (kind === 'rubric') {   // the question on the board changes every few seconds, in order
    const ask = M.order[Math.floor(m.t / M.every) % M.order.length];
    if (ask !== m.ask) { m.ask = ask; sim.events.push({ t: 'mech', kind, what: ask, x: e.x, y: e.y }); }
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

// Act 3's rules (split out to keep stepMech readable).
function stepMech3(sim, e, def, dt, kind, M, m) {
  const alive = (p) => !p.downed, W = sim.map.w * TILE, H = sim.map.h * TILE;
  const hurt = (p, n) => sim._hurtPlayer(p, Math.round(n * (def.dmgMul ?? 1)));

  if (kind === 'vents') {
    if (!m.vents) { m.vents = []; for (let x = 3; x < sim.map.w - 2; x += 4) for (const fy of [0.32, 0.72]) { const v = { x: x * TILE + 8, y: Math.round(H * fy / TILE) * TILE + 8 }; if (!sim._hitsBox(v.x, v.y, 4, 3)) m.vents.push(v); } m.next = M.every; m.group = 0; }
    if ((m.next -= dt) <= 0) { m.next = M.every; m.group = (m.group + 1) % 3; m.warnT = M.warn; m.blowT = 0; sim.events.push({ t: 'mech', kind, what: 'warn', x: e.x, y: e.y }); }
    const live = m.vents.filter((_, i) => i % 3 === m.group);
    if (m.warnT > 0 && (m.warnT -= dt) <= 0) m.blowT = M.blow;
    if (m.blowT > 0) {
      m.blowT -= dt;
      for (const v of live) {
        for (const p of sim.players.values()) if (alive(p) && Math.hypot(p.x - v.x, p.y - v.y) < M.r - sim._small(p) && (p._ventT = (p._ventT ?? 0) - dt) <= 0) { p._ventT = 0.6; hurt(p, M.dmg); }
        if (Math.hypot(e.x - v.x, e.y - v.y) < M.r + def.radius && !(m.scaldT > 0)) { m.scaldT = M.scald; sim.events.push({ t: 'mech', kind, what: 'scald', x: e.x, y: e.y }); }
      }
    }
    m.live = live; m.phaseNow = m.blowT > 0 ? 'blow' : m.warnT > 0 ? 'warn' : '';
    if (m.scaldT > 0) { m.scaldT -= dt; e.cd = Math.max(e.cd, 0.2); }
  }

  if (kind === 'current') {
    m.cyc = (m.cyc ?? 0) + dt;
    const c = m.cyc % M.every, warn = c > M.every - M.warn - M.last && c <= M.every - M.last, surge = c > M.every - M.last;
    if (surge && !m.surging) sim.events.push({ t: 'mech', kind, what: 'surge', x: e.x, y: e.y });
    if (!surge && m.surging) m.openT = M.open;   // it gulps: open for a moment
    m.surging = surge; m.warn = warn;
    const v = surge ? M.surge : M.pull;
    for (const p of sim.players.values()) {
      if (!alive(p)) continue;
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (p.dodgeT > 0) continue;   // a dodge breaks the pull for a moment
      if (d > 8) sim._moveBody(p, (dx / d) * v * dt, (dy / d) * v * dt, 5);
      if (surge && d < M.mouth && (p._mouthT = (p._mouthT ?? 0) - dt) <= 0) { p._mouthT = 0.5; hurt(p, M.dps * 0.5); }
    }
    if (m.openT > 0) m.openT -= dt;
  }

  if (kind === 'power') {
    if (!m.sockets) {
      m.sockets = [];
      for (let i = 0; i < M.n; i++) { const x = Math.round(W * (0.2 + 0.3 * i)), y = Math.round(H * (i % 2 ? 0.75 : 0.3)); m.sockets.push({ x, y, hold: 0, off: 0 }); }
    }
    for (const k of m.sockets) {
      if (k.off > 0) { k.off -= dt; continue; }
      const on = [...sim.players.values()].some((p) => alive(p) && Math.hypot(p.x - k.x, p.y - k.y) < M.r);
      k.hold = on ? k.hold + dt : Math.max(0, k.hold - dt * 2);
      if (k.hold >= M.hold) { k.off = M.off; k.hold = 0; sim.events.push({ t: 'mech', kind, what: 'cut', x: k.x, y: k.y }); }
    }
    m.live = m.sockets.filter((k) => !(k.off > 0)).length;
  }

  if (kind === 'rewind') {
    m.hist ??= []; m.rec = (m.rec ?? 0) - dt;
    if (m.rec <= 0) { m.rec = 0.1; m.hist.push({ t: m.t, hp: e.hp, pos: [...sim.players.values()].map((p) => [p.id, p.x, p.y]) }); while (m.hist.length && m.t - m.hist[0].t > M.back + 0.5) m.hist.shift(); }
    m.next = (m.next ?? M.every) - dt;
    if (m.next <= M.warn && !m.warning) { m.warning = true; sim.events.push({ t: 'mech', kind, what: 'warn', x: e.x, y: e.y }); }
    const then = m.hist.find((h) => h.t >= m.t - M.back);
    m.ghosts = m.warning && then ? then.pos.map(([, x, y]) => [Math.round(x), Math.round(y)]) : null;
    if (m.next <= 0 && then) {
      for (const [id, x, y] of then.pos) { const p = sim.players.get(id); if (p && alive(p)) { p.x = x; p.y = y; } }
      if (then.hp > e.hp) e.hp = Math.min(def.hp, e.hp + (then.hp - e.hp) * M.giveBack);
      sim.events.push({ t: 'mech', kind, what: 'rewind', x: e.x, y: e.y });
      m.next = M.every; m.warning = false; m.hist = [];
    }
  }

  if (kind === 'molten') {
    if (!m.lanes) { m.lanes = []; for (let x = 4; x < sim.map.w - 3; x += 6) m.lanes.push(x * TILE + 8); m.next = 2; m.lane = -1; }
    if ((m.next -= dt) <= 0) { m.next = M.every; m.lane = (m.lane + 1 + Math.floor(sim.tick % 2)) % m.lanes.length; m.warnT = M.warn; m.hotT = 0; sim.events.push({ t: 'mech', kind, what: 'warn', x: m.lanes[m.lane], y: e.y }); }
    if (m.warnT > 0 && (m.warnT -= dt) <= 0) m.hotT = M.last;
    const lx = m.lanes[m.lane];
    if (m.hotT > 0) {
      m.hotT -= dt;
      for (const p of sim.players.values()) if (alive(p) && Math.abs(p.x - lx) < M.half && (p._moltT = (p._moltT ?? 0) - dt) <= 0) { p._moltT = 0.5; hurt(p, M.dps * 0.5); }
      if (Math.abs(e.x - lx) < M.half + def.radius && !(m.stuckT > 0)) { m.stuckT = M.stuck; e.state = 'move'; e.dash = 0; sim.events.push({ t: 'mech', kind, what: 'stuck', x: e.x, y: e.y }); }
    }
    if (m.stuckT > 0) { m.stuckT -= dt; e.cd = Math.max(e.cd, 0.2); e.kx = e.ky = 0; }
  }

  if (kind === 'verify') {
    const T = M.green + M.amber + M.red, c = m.t % T;
    const ph = c < M.green ? 'green' : c < M.green + M.amber ? 'amber' : 'red';
    if (ph !== m.light) { m.light = ph; m.at = {}; sim.events.push({ t: 'mech', kind, what: ph, x: e.x, y: e.y }); for (const p of sim.players.values()) m.at[p.id] = [p.x, p.y]; }
    if (ph === 'red') for (const p of sim.players.values()) {
      if (!alive(p)) continue;
      const a = m.at[p.id] ?? (m.at[p.id] = [p.x, p.y]);
      if (Math.hypot(p.x - a[0], p.y - a[1]) > M.still && (p._scanT = (p._scanT ?? 0) - dt) <= 0) { p._scanT = 0.5; hurt(p, M.dmg); a[0] = p.x; a[1] = p.y; }
    }
    if (ph === 'red') { e.cd = Math.max(e.cd, 0.2); }
  }
}

/** How much of a hit lands, after the signature rule. */
export function mechDamage(sim, e, dmg, via = null) {
  const kind = e.def?.mech, m = e.mech; if (!kind || !m) return dmg;
  const M = MECH[kind];
  if (kind === 'pylons' && m.shielded) return Math.max(1, Math.round(dmg * M.shield));
  if (kind === 'tide') return Math.max(1, Math.round(dmg * (m.bossWet ? M.inWater : M.onDry)));
  if (kind === 'flicker') return Math.max(1, Math.round(dmg * (m.lit === false ? M.darkMul : M.litMul)));
  if (kind === 'chorus' && m.holders?.length) return Math.max(1, Math.round(dmg * M.mul));
  if (kind === 'rubric') return Math.max(1, Math.round(dmg * (via && via === m.ask ? M.right : M.wrong)));
  if (kind === 'vents') return Math.round(dmg * (m.scaldT > 0 ? M.scaldMul : 1));
  if (kind === 'current') return Math.round(dmg * (m.openT > 0 ? M.openMul : 1));
  if (kind === 'power') return Math.max(1, Math.round(dmg * M.mul[m.live ?? M.n]));
  if (kind === 'molten') return Math.round(dmg * (m.stuckT > 0 ? M.stuckMul : 1));
  if (kind === 'verify') return Math.max(1, Math.round(dmg * (m.light === 'red' ? M.redMul : M.greenMul)));
  return dmg;
}

/** Is the boss's rule shielding it right now (for the scene's 'BRACED'-style feedback)? */
export const mechShielded = (e) => {
  const m = e.mech, k = e.def?.mech;
  return !!m && ((k === 'power' && (m.live ?? 0) > 0) || (k === 'verify' && m.light === 'red') || (k === 'pylons' && m.shielded) || (k === 'flicker' && m.lit !== false) || (k === 'tide' && m.bossWet) || (k === 'chorus' && m.holders?.length > 0));
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
  if (k === 'vents') return { k, p: m.phaseNow ?? '', v: (m.live ?? []).map((v) => [v.x, v.y]), s: m.scaldT > 0 ? 1 : 0 };
  if (k === 'current') return { k, s: m.surging ? 1 : 0, w: m.warn ? 1 : 0, o: m.openT > 0 ? 1 : 0 };
  if (k === 'power') return { k, s: (m.sockets ?? []).map((q) => [q.x, q.y, q.off > 0 ? 0 : 1, Math.round(q.hold / MECH.power.hold * 100) / 100]) };
  if (k === 'rewind') return { k, ...(m.ghosts ? { g: m.ghosts } : {}) };
  if (k === 'molten') return { k, ...(m.lanes && m.lane >= 0 ? { x: m.lanes[m.lane], st: m.hotT > 0 ? 'hot' : m.warnT > 0 ? 'warn' : '' } : {}), s: m.stuckT > 0 ? 1 : 0 };
  if (k === 'verify') return { k, l: m.light ?? 'green' };
  if (k === 'rubric') return { k, a: m.ask ?? 'melee' };
  return { k };
}
