// "Bastion" (working name): a two-way tower defense played as a board game with robotic pieces (hub #34).
// Pure rules, no Phaser, deterministic for a seed: tested in tests/run.js. The table (who plays, the AI, the
// network) and the screen come separately, like Lattice (src/engine/lattice.js, src/game/latticeTable.js).
//
// Three lanes run from the party's base (x = 0) to the opponent's (x = LANE). Each roommate has their own energy,
// earned over time, and spends it on TOWERS beside a lane on their half (defense) or UNITS sent down a lane
// (attack). Units march, fight the first enemy unit they meet, and hit the base at the end. Towers shoot the
// nearest enemy unit in range. A base at 0 loses. The opponent plays the same pieces from its side, plus waves
// that grow over time: an idle party loses; a party that builds and pushes can win.
import { Rng } from './rng.js';

export const LANES = 3, LANE = 24, SLOTS = 5;          // lane length in cells; tower slots per lane per side
export const OVERTIME = 300, DEFAULT_DIFFICULTY = 1.25;   // after OVERTIME seconds every tower wears down, so no match stalls
export const BASE_HP = 100, INCOME = 1.0, START_ENERGY = 6, MAX_ENERGY = 30;
export const TOWERS = {
  gun:   { cost: 4, hp: 14, range: 5,   dmg: 2,   rate: 0.8, name: 'Gun turret' },
  zap:   { cost: 7, hp: 12, range: 3.5, dmg: 1.2, rate: 0.35, splash: 1.5, name: 'Arc coil' },
  wall:  { cost: 3, hp: 30, range: 0,   dmg: 0,   rate: 0, blocks: true, name: 'Barrier' },
};
export const UNITS = {
  runner:  { cost: 2, hp: 5,  speed: 2.4, dmg: 1, rate: 0.6, baseDmg: 2, name: 'Runner' },
  bruiser: { cost: 5, hp: 18, speed: 1.1, dmg: 3, rate: 1.0, baseDmg: 5, name: 'Bruiser' },
  drone:   { cost: 4, hp: 7,  speed: 1.8, dmg: 1, rate: 0.5, baseDmg: 3, flies: true, name: 'Drone' },   // flies over barriers
};
// Tower slots sit at fixed positions on each half (cells from that side's base).
export const SLOT_X = [3, 6, 9, 12, 15].map((x) => x * 0.75);

/** sides: the roommates playing (each has their own energy); the opponent is always 'npc'. */
export function newMatch(seed = 'bastion', roommates = ['trevor'], { difficulty = DEFAULT_DIFFICULTY } = {}) {
  const rng = new Rng(`bastion:${seed}`);
  const hands = Object.fromEntries([...roommates, 'npc'].map((s) => [s, START_ENERGY]));
  return {
    seed, rng, t: 0, difficulty, roommates: [...roommates],
    base: { party: BASE_HP, npc: BASE_HP },
    energy: hands,
    towers: [],     // { id, side: 'party'|'npc', owner, kind, lane, slot, x, hp, cd }
    units: [],      // { id, side, owner, kind, lane, x, hp, cd }
    nextId: 1, wave: 0, nextWave: 20, winner: null, log: [],
  };
}

// The opponent starts dug in: a gun turret mid-way down every lane and a coil on one (a fortress to break).
export function fortify(m) {
  for (let lane = 0; lane < LANES; lane++) m.towers.push({ id: m.nextId++, side: 'npc', owner: 'npc', kind: 'gun', lane, slot: 2, x: towerX('npc', 2), hp: TOWERS.gun.hp, cd: 0 });
  const lane = m.rng.int(0, LANES - 1);
  m.towers.push({ id: m.nextId++, side: 'npc', owner: 'npc', kind: 'zap', lane, slot: 0, x: towerX('npc', 0), hp: TOWERS.zap.hp, cd: 0 });
  return m;
}

const sideOf = (who) => (who === 'npc' ? 'npc' : 'party');
const dir = (side) => (side === 'party' ? 1 : -1);
const towerX = (side, slot) => (side === 'party' ? SLOT_X[slot] : LANE - SLOT_X[slot]);

// ---- actions (validated; return true if applied) ----
export function canPlace(m, who, kind, lane, slot) {
  const T = TOWERS[kind], side = sideOf(who);
  return !m.winner && !!T && lane >= 0 && lane < LANES && slot >= 0 && slot < SLOTS && m.energy[who] >= T.cost
    && !m.towers.some((t) => t.side === side && t.lane === lane && t.slot === slot);
}
export function place(m, who, kind, lane, slot) {
  if (!canPlace(m, who, kind, lane, slot)) return false;
  const T = TOWERS[kind], side = sideOf(who);
  m.energy[who] -= T.cost;
  m.towers.push({ id: m.nextId++, side, owner: who, kind, lane, slot, x: towerX(side, slot), hp: T.hp, cd: 0 });
  return true;
}
export function canSend(m, who, kind, lane) { const U = UNITS[kind]; return !m.winner && !!U && lane >= 0 && lane < LANES && m.energy[who] >= U.cost; }
export function send(m, who, kind, lane) {
  if (!canSend(m, who, kind, lane)) return false;
  const U = UNITS[kind], side = sideOf(who);
  m.energy[who] -= U.cost;
  m.units.push({ id: m.nextId++, side, owner: who, kind, lane, x: side === 'party' ? 0.2 : LANE - 0.2, hp: U.hp, cd: 0 });
  return true;
}

// ---- the clock ----
export function step(m, dt) {
  if (m.winner) return;
  m.t += dt;
  for (const who of Object.keys(m.energy)) {
    // the opponent scales with how many roommates sit at the table, so a full party isn't a walkover
    const rate = who === 'npc' ? INCOME * (0.6 + 0.4 * m.difficulty) * (0.6 + 0.4 * m.roommates.length) * (1 + m.t / 420) : INCOME;
    m.energy[who] = Math.min(MAX_ENERGY, m.energy[who] + rate * dt);
  }
  // opponent waves: free units that grow over time (the opponent's pressure)
  if (m.t >= m.nextWave) {
    m.wave++; m.nextWave = m.t + Math.max(10, 20 - m.wave);
    const n = 1 + Math.floor(m.wave * 0.35 * m.difficulty * (0.5 + 0.5 * m.roommates.length));
    for (let i = 0; i < n; i++) {
      const kind = m.wave > 3 && i % 3 === 2 ? 'bruiser' : m.wave > 2 && i % 2 ? 'drone' : 'runner';
      m.units.push({ id: m.nextId++, side: 'npc', owner: 'npc', kind, lane: m.rng.int(0, LANES - 1), x: LANE - 0.2, hp: UNITS[kind].hp, cd: 0 });
    }
    m.log.push(`wave ${m.wave}`);
  }
  // units: fight the nearest enemy in reach (unit, or a barrier for walkers), else march
  for (const u of m.units) {
    const U = UNITS[u.kind], d = dir(u.side);
    u.cd = Math.max(0, u.cd - dt);
    const foes = m.units.filter((o) => o.side !== u.side && o.lane === u.lane && o.hp > 0 && (o.x - u.x) * d >= -0.1 && (o.x - u.x) * d <= 0.8);
    const wall = U.flies ? null : m.towers.find((t) => t.side !== u.side && t.lane === u.lane && TOWERS[t.kind].blocks && t.hp > 0 && (t.x - u.x) * d >= -0.1 && (t.x - u.x) * d <= 0.7);
    const target = foes.sort((a, b) => Math.abs(a.x - u.x) - Math.abs(b.x - u.x))[0] ?? wall;
    if (target) { if (u.cd === 0) { target.hp -= U.dmg; u.cd = U.rate; } continue; }
    u.x += U.speed * d * dt;
    if ((d > 0 && u.x >= LANE) || (d < 0 && u.x <= 0)) {
      const hit = u.side === 'party' ? 'npc' : 'party';
      m.base[hit] -= U.baseDmg; u.hp = 0;
    }
  }
  // towers: shoot the nearest enemy unit in range (coils hit everything near it)
  for (const t of m.towers) {
    const T = TOWERS[t.kind]; if (!T.range || t.hp <= 0) continue;
    t.cd = Math.max(0, t.cd - dt); if (t.cd > 0) continue;
    const inRange = m.units.filter((u) => u.side !== t.side && u.lane === t.lane && u.hp > 0 && Math.abs(u.x - t.x) <= T.range)
      .sort((a, b) => Math.abs(a.x - t.x) - Math.abs(b.x - t.x));
    if (!inRange.length) continue;
    const first = inRange[0];
    for (const u of T.splash ? inRange.filter((v) => Math.abs(v.x - first.x) <= T.splash) : [first]) u.hp -= T.dmg;
    t.cd = T.rate;
  }
  if (m.t > OVERTIME) for (const t of m.towers) t.hp -= dt * 0.25 * (1 + (m.t - OVERTIME) / 120);   // overtime: towers wear down
  m.units = m.units.filter((u) => u.hp > 0);
  m.towers = m.towers.filter((t) => t.hp > 0);
  if (m.base.npc <= 0) m.winner = 'party';
  else if (m.base.party <= 0) m.winner = 'npc';
}

// ---- the AI: a roommate stand-in, and the opponent ----
const pressure = (m, side, lane) => m.units.filter((u) => u.side !== side && u.lane === lane).reduce((t, u) => t + UNITS[u.kind].hp, 0);
const defense = (m, side, lane) => m.towers.filter((t) => t.side === side && t.lane === lane).reduce((t, x) => t + (TOWERS[x.kind].dmg / Math.max(0.2, TOWERS[x.kind].rate)) * 4 + (TOWERS[x.kind].blocks ? 6 : 0), 0);

/** One decision for `who` (a roommate or 'npc'): defend the most pressed lane, else push the weakest one. */
export function aiAct(m, who) {
  if (m.winner) return false;
  const side = sideOf(who), e = m.energy[who], opp = who === 'npc';
  const lanes = [...Array(LANES).keys()];
  const worst = lanes.sort((a, b) => (pressure(m, side, b) - defense(m, side, b)) - (pressure(m, side, a) - defense(m, side, a)))[0];
  const free = [...Array(SLOTS).keys()].find((s) => !m.towers.some((t) => t.side === side && t.lane === worst && t.slot === s));
  // the opponent only builds when a lane is really in trouble; it spends the rest on attacks
  if (pressure(m, side, worst) > defense(m, side, worst) * (opp ? 1.6 : 1) && free != null && (!opp || e >= 10)) {
    const kind = pressure(m, side, worst) > 14 && e >= TOWERS.zap.cost ? 'zap' : e >= TOWERS.gun.cost ? 'gun' : null;
    if (kind && place(m, who, kind, worst, free)) return true;
  }
  if (e >= (opp ? 6 : 11)) {   // push where the enemy is thinnest (roommates save up for a bigger push)
    const target = [...Array(LANES).keys()].sort((a, b) => defense(m, side === 'party' ? 'npc' : 'party', a) - defense(m, side === 'party' ? 'npc' : 'party', b))[0];
    const kind = e >= 14 ? 'bruiser' : m.rng.next() < 0.5 ? 'drone' : 'runner';
    send(m, who, kind, target);
    if (!opp) while (m.energy[who] >= UNITS.runner.cost + 1 && send(m, who, 'runner', target));   // the rest go with it
    return true;
  }
  return false;
}

/** The match as plain data for the screen and the network. */
export function view(m) { const { rng, ...rest } = m; return JSON.parse(JSON.stringify(rest)); }
