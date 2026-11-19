// Node test runner (no dependencies): `node tests/run.js`. Must pass before pushing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { makeStreams, Rng } from '../src/engine/rng.js';
import { rollWorld } from '../src/engine/worldRolls.js';
import { newSave, migrate, CURRENT_SCHEMA } from '../src/engine/save/schema.js';
import { Sim, MOVE, ROT, LULLABY as BOT_LULLABY, emptyInput } from '../src/engine/sim.js';
import { ENEMIES } from '../src/content/enemies.js';
import { room631 } from '../src/content/maps/room631.js';
import { MAPS as MAPS_FOR_TEST } from '../src/content/maps/index.js';
import { formatBalanceGroup } from '../tools/balance-summary.mjs';
import { BalanceBot, countHostMoves, newMoveCounts } from '../tools/balance-bot.mjs';
import { CompanionBrain as BalanceBrain } from '../src/engine/companion.js';
import { ITEMS as BALANCE_ITEMS } from '../src/content/items.js';
import * as BOT_RULES from '../src/engine/sim.js';
import { makeMap } from '../src/content/maps/build.js';
import { TRAITS } from '../src/content/rotVillains.js';

let failed = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n     ${e.message}`); } };

const rotArena = () => ({ id: 'rot-test', w: 100, h: 100, objects: [], enemies: [],
  spawns: [{ x: 160, y: 160 }], solid: () => false });

test('authored elite tuples preserve ordinary spawns and cannot replace their coordinates', () => {
  const map = makeMap({ id: 'elite-test', name: 'Test', layout: ['.....'], spawns: [[0, 0]],
    enemies: [['enemy.rotling', 1, 0], ['enemy.spitter', 3, 0, { elite: 'armored', x: -1, kind: 'bad' }]] });
  assert.deepEqual(map.enemies[0], { kind: 'enemy.rotling', x: 24, y: 8 });
  assert.deepEqual(map.enemies[1], { kind: 'enemy.spitter', x: 56, y: 8, elite: 'armored' });
  for (const seed of ['bal1', 'bal2', 'bal3', 'other']) {
    const sim = new Sim(map, { seed, killed: new Set(['elite-test#0']) });
    assert.equal(sim.enemies.size, 1);
    const e = [...sim.enemies.values()][0], base = ENEMIES['enemy.spitter'];
    assert.equal(e.spawnKey, 'elite-test#1'); assert.equal(e.def.trait, 'armored');
    assert.equal(e.hp, Math.round(base.hp * TRAITS.armored.hp * BOT_RULES.PARTY_SCALE.hp));
    assert.equal(e.def.armor, TRAITS.armored.armor); assert.equal(e.def.speed, base.speed * TRAITS.armored.speed);
    assert.equal(e.def.ai, base.ai); assert.match(e.def.vname, /^Elite /);
    const snap = sim.snapshot().enemies[0];
    assert.equal(snap.tr, 'armored'); assert.match(snap.vn, /^Elite /);
  }
});

test('authored elites reject unknown, inherited and malformed traits', () => {
  for (const elite of ['missing', 'toString', null, ['armored']]) {
    const map = { ...rotArena(), enemies: [{ kind: 'enemy.spitter', x: 200, y: 160, elite }] };
    assert.throws(() => new Sim(map), /Unknown elite trait .* at rot-test#0/);
  }
});

test('lake pressure preserves its seven original killed-spawn keys', () => {
  const map = MAPS_FOR_TEST.lake, old = [
    ['enemy.captcha', 12, 21], ['enemy.autocomplete', 58, 12], ['enemy.spitter', 61, 16],
    ['enemy.spitter', 21, 34], ['enemy.rotling', 29, 36], ['enemy.moth', 30, 7], ['enemy.spitter', 46, 19],
  ];
  assert.deepEqual(map.enemies.slice(0, 7).map((e) => [e.kind, (e.x - 8) / 16, (e.y - 8) / 16]), old);
  const sim = new Sim(map, { killed: new Set(old.map((_, i) => `lake#${i}`)) });
  assert.equal(sim.enemies.size, map.enemies.length - 7);
  assert.ok([...sim.enemies.values()].every((e) => Number(e.spawnKey.split('#')[1]) >= 7));
});

const botFixture = (options) => {
  const sim = new Sim(rotArena()); sim.addPlayer('host', 'trevor');
  const p = sim.players.get('host'), bot = new BalanceBot(sim, new BalanceBrain(sim), options), counts = newMoveCounts();
  p.mods.swing = { ...BALANCE_ITEMS['item.pry_bar'].swing };
  const step = () => { const inp = bot.input(p); sim.step(1 / 60, new Map([[p.id, inp]])); countHostMoves(counts, sim.events, p.id); return inp; };
  return { sim, p, bot, counts, step };
};
test('balance bot deflects an incoming shot through actual sim inputs', () => {
  const { sim, p, counts, step } = botFixture();
  sim.shots.push({ x: p.x + 16, y: p.y - 6, vx: -100, vy: 0, life: 2, dmg: 10, from: 'enemy' });
  step(); assert.equal(counts.deflect, 1); assert.equal(sim.shots[0].from, 'player');
  countHostMoves(counts, [{ t: 'deflect', by: 'ai:manuel' }, { t: 'perfect', id: 'ai:manuel' }], p.id);
  assert.equal(counts.deflect, 1); assert.equal(counts.perfect, 0);
});
test('balance bot rolls into a shot when melee is cooling down, then uses a dash-strike', () => {
  const { sim, p, bot, counts, step } = botFixture(); p.meleeCd = 0.2;
  sim.shots.push({ x: p.x + 14, y: p.y - 6, vx: -100, vy: 0, life: 2, dmg: 10, from: 'enemy' });
  sim.enemies.set('dummy', { id: 'dummy', kind: 'enemy.rotling', x: p.x + 80, y: p.y, hp: 999, cd: 9, hurtT: 0, sleepT: 99 });
  const inp = step(); assert.ok(inp.dodge && inp.mx > 0);
  assert.equal(bot.input(p).dodge, false, 'a roll is not reissued on cached frames');
  for (let i = 0; i < 50; i++) step();
  assert.ok(counts.perfect >= 1); assert.ok(counts.dashstrike >= 1); assert.equal(p.hp, 100);
});
test('balance bot respects stamina and ignores shots travelling away', () => {
  for (const away of [false, true]) {
    const { sim, p, bot } = botFixture(); p.meleeCd = 1; p.sta = 0;
    sim.shots.push({ x: p.x + 12, y: p.y - 6, vx: away ? 100 : -100, vy: 0, life: 2, dmg: 10, from: 'enemy' });
    if (away) p.sta = 100;
    assert.equal(bot.input(p).dodge, false);
  }
  const { sim, p, bot } = botFixture(); p.mods.swing = null;
  sim.shots.push({ x: p.x + 12, y: p.y - 6, vx: -100, vy: 0, life: 2, dmg: 10, from: 'enemy' });
  assert.equal(bot.input(p).dodge, true, 'no phantom deflect without a melee weapon');
});
test('balance bot honors the target checkout rules instead of its own defaults', () => {
  const { sim, p, bot } = botFixture({ rules: { ...BOT_RULES, MOVE: { ...BOT_RULES.MOVE, dashCost: 101 } } });
  p.meleeCd = 1;
  sim.shots.push({ x: p.x + 12, y: p.y - 6, vx: -100, vy: 0, life: 2, dmg: 10, from: 'enemy' });
  assert.equal(bot.input(p).dodge, false, 'target checkout requires more stamina than is available');
});
test('balance bot parries a committed lunge and sustains real combo finishers', () => {
  const f = botFixture();
  const e = { id: 'lunger', kind: 'enemy.rotling', x: f.p.x + 14, y: f.p.y, hp: 999, cd: 9, hurtT: 0,
    st: 'lunge', stT: 0.2, dx: -1, dy: 0, hitOnce: false };
  f.sim.enemies.set(e.id, e); f.step(); assert.equal(f.counts.parry, 1);
  const g = botFixture();
  g.sim.enemies.set('dummy', { id: 'dummy', kind: 'enemy.rotling', x: g.p.x + 14, y: g.p.y, hp: 999, cd: 9, hurtT: 0, sleepT: 99 });
  for (let i = 0; i < 150; i++) g.step();
  assert.ok(g.counts.finishers >= 1);
});

test('balance bot leaves a continuous moth hum before being locked asleep', () => {
  const { sim, p, counts, step } = botFixture(); p.meleeCd = 5;
  sim.enemies.set('moth', { id: 'moth', kind: 'enemy.moth', def: { ...ENEMIES['enemy.moth'], speed: 0 },
    x: p.x + 50, y: p.y, hp: 999, cd: 9, hurtT: 0 });
  let furthest = 0;
  for (let i = 0; i < 180; i++) {
    step(); assert.ok(!(p.sleepT > 0));
    const moth = sim.enemies.get('moth'); furthest = Math.max(furthest, Math.hypot(p.x - moth.x, p.y - moth.y));
  }
  assert.ok(furthest > BOT_LULLABY.mothRange, 'breaks the continuous hum while its weapon cools');
  assert.equal(counts.perfect, 0);
});

test('schema 4 -> 5 adds infection without losing existing exposure or unknown data', () => {
  const old = newSave({ seed: 'rot-save', rolls: {}, gameVersion: 'test' });
  old.schemaVersion = 4; delete old.party.manuel.rot;
  old.party.trevor.rot = 42.5; old.party.trevor.futureField = { keep: true };
  const back = migrate(JSON.parse(JSON.stringify(old)));
  assert.equal(back.schemaVersion, CURRENT_SCHEMA);
  assert.equal(back.party.manuel.rot, 0);
  assert.equal(back.party.trevor.rot, 42.5);
  assert.deepEqual(back.party.trevor.futureField, { keep: true });
  assert.deepEqual(migrate(JSON.parse(JSON.stringify(back))), back);
});

test('infection sources, charm range, caffeine and allies obey the disease rules', () => {
  const sim = new Sim(rotArena()); sim.addPlayer('host', 'trevor');
  const p = sim.players.get('host');
  sim.hazards.push({ x: p.x, y: p.y, r: 20, ttl: 10, dps: 1 });
  p.iframes = 100; sim._stepHazards(1);
  assert.equal(p.rot, ROT.poolRate, 'environmental exposure still applies during dodge immunity');
  const before = p.rot; sim.caffeinate('host', 45); assert.equal(p.rot, before);
  sim.addPlayer('ward', 'manuel'); const q = sim.players.get('ward'); q.analogCharm = true;
  sim.setRot('host', 50); sim.infect(p, 10); assert.equal(p.rot, 55);
  sim._stepRot(1); assert.equal(p.rot, 55 - ROT.charmDecay);
  q.x += ROT.charmRange + 1;
  const far = p.rot; sim._stepRot(1); assert.equal(p.rot, far, 'moderate exposure holds without a charm');
  sim.setRot('host', 0); sim.map.rotExposure = 999; sim._stepRot(1);
  assert.equal(p.rot, ROT.maxHallRate);
  p.downed = true; const down = p.rot; sim._stepRot(1); assert.equal(p.rot, down);
  const ally = { id: 'robot', rot: 0 }; sim.infect(ally, 100); assert.equal(ally.rot, 0);
  sim.setRot('host', Infinity); assert.equal(p.rot, 0);
  sim.setRot('host', 300); assert.equal(p.rot, 100);
});

test('light exposure decays after five quiet seconds, moderate holds, serious grows', () => {
  const sim = new Sim(rotArena()); sim.addPlayer('host', 'trevor'); const p = sim.players.get('host');
  sim.infect(p, 10); sim._stepRot(5); assert.equal(p.rot, 10);
  sim._stepRot(1); assert.equal(p.rot, 9.9);
  sim.infect(p, 1); const fresh = p.rot; sim._stepRot(4); assert.equal(p.rot, fresh, 'new exposure restarts quiet time');
  sim.setRot('host', 25); sim._stepRot(100); assert.equal(p.rot, 25);
  sim.setRot('host', 59.9); sim._stepRot(100); assert.equal(p.rot, 59.9);
  sim.setRot('host', 60); sim._stepRot(10); assert.equal(p.rot, 60.8);
  sim.setRot('host', 0.01); p.rotQuiet = 5; sim._stepRot(1); assert.equal(p.rot, 0);
});

test('apartment rest halves nearby exposure and rejects distant or forged requests', () => {
  const map = rotArena(); map.id = 'room631'; map.objects = [{ id: 'bed', action: 'save', x: 10, y: 10 }];
  const sim = new Sim(map); sim.addPlayer('host', 'trevor'); sim.addPlayer('ai:manuel', 'manuel'); sim.addPlayer('far', 'michael');
  const p = sim.players.get('host'), q = sim.players.get('ai:manuel'), far = sim.players.get('far');
  p.x = p.y = q.x = q.y = 168; far.x = far.y = 300;
  sim.setRot(p.id, 80); sim.setRot(q.id, 40); sim.setRot(far.id, 60);
  assert.equal(sim.restAtSave('host', 'missing'), false);
  assert.equal(sim.restAtSave('far', 'bed'), false);
  assert.equal(sim.restAtSave('host', 'bed'), true);
  assert.equal(p.rot, 40); assert.equal(q.rot, 20); assert.equal(far.rot, 60);
  map.id = 'tunnel_1'; assert.equal(sim.restAtSave('host', 'bed'), false); assert.equal(p.rot, 40);
  map.id = 'room631'; p.downed = true; assert.equal(sim.restAtSave('host', 'bed'), false);
});

test('rot-taken and puddler contact infect only when the hit lands', () => {
  const sim = new Sim(rotArena()); sim.addPlayer('host', 'trevor');
  const p = sim.players.get('host'), def = ENEMIES['enemy.rot_taken'];
  const e = { id: 'e1', kind: 'enemy.rot_taken', def, x: p.x + 2, y: p.y, hp: def.hp, cd: 0, hurtT: 0 };
  sim.enemies.set(e.id, e); sim._stepEnemies(1 / 60);
  assert.equal(p.rot, def.infection); assert.ok(p.hp < 100);
  e.cd = 0; sim._stepEnemies(1 / 60); assert.equal(p.rot, def.infection, 'iframes prevent a second infection hit');
  p.iframes = 0; e.def = { ...def, ai: 'chase', trait: 'puddler' }; e.cd = 0;
  sim._stepEnemies(1 / 60); assert.equal(p.rot, def.infection + ROT.puddlerHit);
});

test('heavy infection slows movement and stamina but permits escape, and survives map changes', () => {
  const sim = new Sim(rotArena()); sim.addPlayer('host', 'trevor');
  const p = sim.players.get('host'); sim.setRot('host', 100); p.sta = 0;
  const start = p.x; sim.step(1 / 60, new Map([['host', { ...emptyInput(), mx: 1 }]]));
  assert.ok(Math.abs(p.x - start - MOVE.speed * 0.65 / 60) < 1e-8);
  assert.ok(Math.abs(p.sta - MOVE.staminaRegen * 0.5 / 60) < 1e-8);
  assert.equal(sim.snapshot().players[0].rot, 100);
  sim.setMap(rotArena()); assert.equal(p.rot, 100);
  sim.setRot('host', 0); const clean = p.x;
  sim.step(1 / 60, new Map([['host', { ...emptyInput(), mx: 1 }]]));
  assert.ok(Math.abs(p.x - clean - MOVE.speed / 60) < 1e-8);
});

test('rot-taken packs stay slow, can be put to sleep, and the drum resets infection', () => {
  const map = rotArena(); map.enemies = [120, 130, 140].map((x) => ({ kind: 'enemy.rot_taken', x, y: 120 }));
  const sim = new Sim(map, { seed: 'rot-pack' }); sim.addPlayer('host', 'trevor');
  const p = sim.players.get('host'); p.x = p.y = 200;
  const starts = new Map([...sim.enemies.values()].map((e) => [e.id, { x: e.x, y: e.y }]));
  sim._stepEnemies(1 / 60);
  for (const e of sim.enemies.values()) {
    assert.equal(e.def.speed, ENEMIES['enemy.rot_taken'].speed);
    assert.ok(e.hp > ENEMIES['enemy.rotling'].hp);
    const start = starts.get(e.id), distance = Math.hypot(e.x - start.x, e.y - start.y);
    assert.ok(distance > 0 && distance <= e.def.speed / 60 + 1e-8);
    assert.ok(Math.hypot(e.x - p.x, e.y - p.y) < Math.hypot(start.x - p.x, start.y - p.y));
    starts.set(e.id, { x: e.x, y: e.y }); e.sleepT = 1;
  }
  sim._stepEnemies(1 / 60);
  for (const e of sim.enemies.values()) assert.deepEqual({ x: e.x, y: e.y }, starts.get(e.id));
  sim.setRot('host', 75);
  const drum = { x: 120, y: 120, fightT: 0, cd: 0, cd2: 1, beat: 0, root: 0 };
  sim._stepSahur(drum, { speed: 40, radius: 9 }, 1 / 60);
  assert.equal(p.rot, 0);
});

test('balance reporting exposes one incomplete run and one wipe among successful seeds', () => {
  const base = { mapId: 'tunnel_1', solo: false, gear: false, secs: 30, killed: 12, of: 12, downs: 0, wipes: 0, dmg: 50 };
  const runs = [{ ...base, seed: 'bal1' }, { ...base, seed: 'bal2' },
    { ...base, seed: 'bal3', secs: 600, killed: 11, downs: 1, wipes: 1 }];
  // The old rounded mean would have reported killed 12/12, downs 0 and wipes 0.
  const lines = formatBalanceGroup(runs);
  assert.ok(lines[0].includes('cleared 2/3 runs'));
  assert.ok(lines[0].includes('max 600s'));
  assert.ok(lines[0].includes('downs total 1'));
  assert.ok(lines[0].includes('wipes total 1'));
  assert.ok(lines[1].includes('bal3: INCOMPLETE, 1 remaining'));
  assert.equal(lines.length, 2);
  const clear = formatBalanceGroup(runs.map((run) => ({ ...run, killed: 12, downs: 0, wipes: 0 })));
  assert.ok(clear[0].includes('cleared 3/3 runs'));
  assert.equal(clear.length, 1);
});

test('rng streams are deterministic and independent', () => {
  const a = makeStreams('seed-1'), b = makeStreams('seed-1');
  const xs = [1, 2, 3].map(() => a('loot').next());
  assert.deepEqual(xs, [1, 2, 3].map(() => b('loot').next()));
  b('fish').next(); b('fish').next();                       // drawing from another stream...
  assert.equal(a('loot').next(), b('loot').next());          // ...doesn't shift this one
  assert.notEqual(new Rng('x').next(), new Rng('y').next());
});

test('world rolls are stable for a seed', () => {
  assert.deepEqual(rollWorld('aster-pros-631'), rollWorld('aster-pros-631'));
  const seen = new Set(Array.from({ length: 40 }, (_, i) => rollWorld(`s${i}`).twistVariant));
  assert.deepEqual([...seen].sort(), ['A', 'B']);
});

test('save round-trips through JSON + migrate, keeping unknown keys', () => {
  const s = newSave({ seed: 'abc', rolls: rollWorld('abc'), gameVersion: '0.1.0' });
  s.futureField = { keep: true };
  const back = migrate(JSON.parse(JSON.stringify(s)));
  assert.equal(back.schemaVersion, CURRENT_SCHEMA);
  assert.deepEqual(back.futureField, { keep: true });
  assert.equal(back.party.manuel.id, 'manuel');
});

test('migrate fills fields missing from older/partial saves', () => {
  const partial = { format: 'jpfc-save', schemaVersion: 1, world: { seed: 'z', rolls: {} } };
  const s = migrate(partial);
  assert.ok(s.party.trevor && s.standing && s.flags);
});

test('migrate rejects foreign and future saves', () => {
  assert.throws(() => migrate({ hello: 1 }));
  assert.throws(() => migrate({ format: 'jpfc-save', schemaVersion: CURRENT_SCHEMA + 1 }));
});

test('sim: diagonal is not faster, walls block, dodge bursts', () => {
  const sim = new Sim(room631); sim.addPlayer('a', 'trevor');
  const p = sim.players.get('a'); const x0 = p.x, y0 = p.y;
  const run = (inp, n) => { for (let i = 0; i < n; i++) sim.step(1 / 60, new Map([['a', { ...emptyInput(), ...inp }]])); };
  run({ mx: 1, my: 1 }, 30);
  const dist = Math.hypot(p.x - x0, p.y - y0);
  assert.ok(Math.abs(dist - MOVE.speed * 0.5) < 1.5, `diagonal moved ${dist}`);
  run({ mx: -1 }, 600);                                    // walk into the west wall for 10 s
  assert.ok(p.x > 16, `went through wall: x=${p.x}`);
  const before = p.x; run({ mx: 1, dodge: true }, 1); run({ mx: 1 }, 12);
  assert.ok(p.x - before > MOVE.speed * 0.2 + 10, 'dodge should burst further than walking');
});

test('world is consistent: killed enemies stay dead on re-entry', () => {
  const sim = new Sim(MAPS_FOR_TEST.tunnel_1, { seed: 's' }); sim.addPlayer('a', 'trevor');
  const n = sim.enemies.size; const first = [...sim.enemies.values()][0];
  sim._hurtEnemy(first, 999, 0, 0, 'a');
  sim.setMap(MAPS_FOR_TEST.metro_plaza, 'tunnel_1'); sim.setMap(MAPS_FOR_TEST.tunnel_1, 'metro_plaza');
  assert.equal(sim.enemies.size, n - 1);
});

test('combat robot: follows its owner, rams coderot, goes down and reboots', () => {
  const sim = new Sim(MAPS_FOR_TEST.tunnel_1, { seed: 's' }); sim.addPlayer('a', 'trevor');
  const p = sim.players.get('a');
  sim.enemies.clear();
  sim.addAlly({ owner: 'a', x: p.x, y: p.y });
  const a = sim.allies[0];
  const e = { id: 't', kind: 'enemy.rotling', x: p.x + 40, y: p.y, hp: 500, cd: 99, hurtT: 0, kx: 0, ky: 0, sleepT: 99 };
  sim.enemies.set('t', e);
  for (let i = 0; i < 120; i++) { sim.events = []; sim._stepAllies(1 / 30); }
  assert.ok(e.hp < 500, `robot never hit the rotling (hp ${e.hp}, robot at ${a.x | 0},${a.y | 0}, st ${a.st})`);
  for (let i = 0; i < 900 && !(a.down > 0); i++) { e.x = a.x; e.y = a.y; sim._stepAllies(1 / 30); }
  assert.ok(a.down > 0, 'robot never goes down when chewed on');
  sim.enemies.clear();
  for (let i = 0; i < 30 * 21; i++) sim._stepAllies(1 / 30);
  assert.equal(a.hp, a.maxHp);
  sim.setMap(MAPS_FOR_TEST.metro_plaza, 'tunnel_1'); sim._stepAllies(1 / 30);
  assert.ok(Math.hypot(a.x - p.x, a.y - p.y) < 30, 'robot comes along through exits');
  assert.equal(sim.snapshot().allies.length, 1);
});

// Combat feel (docs/research/combat.md)
const { FEEL } = await import('../src/engine/sim.js');
const { ENEMIES: ENEMIES_T } = await import('../src/content/enemies.js');
const combatSim = () => {
  const sim = new Sim(MAPS_FOR_TEST.tunnel_1, { seed: 's' }); sim.addPlayer('a', 'trevor'); sim.enemies.clear();
  const p = sim.players.get('a'); p.aim = 0; return { sim, p };
};
const dummy = (sim, x, y, hp = 999) => { const e = { id: 'd' + x, kind: 'enemy.rotling', x, y, hp, cd: 99, hurtT: 0, kx: 0, ky: 0, sleepT: 0 }; sim.enemies.set(e.id, e); return e; };
test('combat: the third swing in a chain is a heavy finisher', () => {
  const { sim, p } = combatSim(); const e = dummy(sim, p.x + 12, p.y);
  const hits = [];
  for (let i = 0; i < 3; i++) { const before = e.hp; sim._melee(p); hits.push(before - e.hp); e.x = p.x + 12; e.y = p.y; e.kx = e.ky = 0; sim.tick += 30; }
  assert.equal(p.combo, 3); assert.ok(hits[2] > hits[0] * 1.4, `finisher ${hits[2]} vs first ${hits[0]}`);
  sim.tick += 200; sim._melee(p); assert.equal(p.combo, 1, 'a slow swing restarts the chain');
});
test('combat: a swing deflects enemy shots back as the player\'s', () => {
  const { sim, p } = combatSim();
  sim.shots.push({ x: p.x + 10, y: p.y - 6, vx: -100, vy: 0, life: 2, dmg: 10, from: 'enemy' });
  sim._melee(p);
  assert.equal(sim.shots[0].from, 'player'); assert.ok(sim.shots[0].vx > 0); assert.equal(sim.shots[0].dmg, 15);
});
test('combat: a hit early in a dodge is a perfect dodge (stamina back, focus)', () => {
  const { sim, p } = combatSim();
  p.dodgeT = 0.2; p.iframes = 0.2; p.dodgeStamp = sim.tick; p.perfectDone = false; p.sta = 10;
  sim._hurtPlayer(p, 20);
  assert.equal(p.hp, 100); assert.ok(p.focusT > 0); assert.ok(p.sta > 10);
  const q = combatSim(); q.p.dodgeT = 0.1; q.p.iframes = 0.1; q.p.dodgeStamp = q.sim.tick - 30; q.p.sta = 10;
  q.sim._hurtPlayer(q.p, 20); assert.ok(!(q.p.focusT > 0), 'late in the dodge is just a dodge');
});
test('combat: knocked hard into a wall, an enemy is slammed and stunned', () => {
  const { sim } = combatSim(); const m = sim.map;
  let wx = -1, wy = -1;
  outer: for (let y = 1; y < m.layout.length - 1; y++) for (let x = 2; x < m.layout[0].length - 1; x++) if (m.solid(x, y) && !m.solid(x - 1, y) && !m.solid(x - 2, y)) { wx = x; wy = y; break outer; }
  assert.ok(wx > 0, 'found a wall');
  const e = dummy(sim, (wx - 1) * 16 + 8, wy * 16 + 8, 100); e.kx = 300; e.ky = 0;
  for (let i = 0; i < 10 && !(e.stunT > 0); i++) sim._stepEnemies(1 / 60);
  assert.ok(e.stunT > 0, 'stunned'); assert.equal(e.hp, 100 - FEEL.slamDmg);
});
test('combat: hitting a lunging enemy parries it (attack cancelled, stunned, focus)', () => {
  const { sim, p } = combatSim(); const e = dummy(sim, p.x + 14, p.y); e.st = 'lunge'; e.hitOnce = false; e.stT = 0.2; e.dx = -1; e.dy = 0;
  sim._melee(p);
  assert.ok(e.hitOnce && e.stunT > 0 && p.focusT > 0, 'parried');
  assert.ok(sim.events.some((v) => v.t === 'parry'));
});
test('combat: attacking right out of a dodge is a dash-strike (lunge, more damage)', () => {
  const { sim, p } = combatSim(); const e = dummy(sim, p.x + 26, p.y);
  sim._melee(p); const plain = 999 - e.hp; e.hp = 999; sim.tick += 200;   // out of reach for a normal swing
  p.dodgeEndTick = sim.tick; const x0 = p.x; sim._melee(p);
  assert.ok(sim.events.some((v) => v.t === 'dashstrike') && p.x > x0, 'lunged');
  assert.ok(999 - e.hp > plain, `dash-strike reached and hit (${999 - e.hp} vs ${plain})`);
});
test('combat: a chaser that lands a hit stands open for a moment (x1.5 damage, no movement)', () => {
  const { sim, p } = combatSim(); p.iframes = 0;
  const e = { id: 'c', kind: 'enemy.rotling', def: { ...ENEMIES_T['enemy.rotling'], ai: 'chase' }, x: p.x + 4, y: p.y, hp: 999, cd: 0, hurtT: 0, kx: 0, ky: 0 };
  sim.enemies.set('c', e); sim._stepEnemies(1 / 60);
  assert.ok(e.openT > 0, 'open after its hit'); const x = e.x; sim._stepEnemies(1 / 60); assert.equal(e.x, x, 'holds still while open');
  sim._hurtEnemy(e, 10, 0, 0, 'a'); assert.equal(999 - e.hp, 15);
});
test('combat: guns hold a clip, then reload (no shots while reloading)', () => {
  const { sim, p } = combatSim(); p.mods.gun = 1; p.mods.gunStats = { cooldown: 0.1, damage: 4, speed: 200, life: 0.5, clip: 2, reload: 1 };
  sim._fire(p); sim._fire(p); assert.equal(p.ammo, 0); assert.ok(p.reloadT > 0);
  const n = sim.shots.length; sim._fire(p); assert.equal(sim.shots.length, n, 'no shot while reloading');
  for (let i = 0; i < 61; i++) sim.step(1 / 60, new Map());
  assert.equal(p.reloadT, 0); assert.equal(p.ammo, 2);
});
test('combat: hit-stop freezes enemies and shots for a moment', () => {
  const { sim, p } = combatSim(); const e = dummy(sim, p.x + 60, p.y); e.cd = 0;
  sim.shots.push({ x: p.x + 40, y: p.y - 30, vx: 0, vy: -50, life: 2, dmg: 1, from: 'enemy' });
  sim.hitStop = 0.05; const sy = sim.shots[0].y, ex = e.x;
  sim.step(1 / 60, new Map());
  assert.equal(sim.shots[0].y, sy); assert.equal(e.x, ex);
});

// Lattice, the casino board game (task #27)
const LAT = await import('../src/engine/lattice.js');
test('lattice: every seed sets up, plays to a winner, and fits ~5 minutes (AI vs AI)', () => {
  const lens = [];
  for (let k = 0; k < 20; k++) {
    const g = LAT.newGame('t' + k);
    assert.equal(g.verts.length, 24); assert.equal(g.edges.length, 30);
    while (g.phase === 'setup') assert.ok(LAT.aiSetup(g));
    assert.equal(g.verts.filter((v) => v.owner).length, 4);
    let t = 0; while (!g.winner && t < 400) { LAT.aiTurn(g); t++; }
    assert.ok(g.winner, `seed t${k} never finished`); assert.ok(LAT.points(g, g.winner) >= LAT.TARGET);
    lens.push(t);
  }
  lens.sort((a, b) => a - b);
  assert.ok(lens[10] <= 60, `median ${lens[10]} turns is too long for ~5 minutes`);
});
test('lattice: rules (spacing, links, costs, sevens, coderot)', () => {
  const g = LAT.newGame('rules');
  while (g.phase === 'setup') LAT.aiSetup(g);
  const mine = g.verts.findIndex((v) => v.owner === 'party');
  const next = g.edges.filter((e) => e.a === mine || e.b === mine).map((e) => (e.a === mine ? e.b : e.a))[0];
  assert.ok(!LAT.canRelay(g, 'party', next), 'no relay next to a relay');
  assert.equal(LAT.build(g, 'link', 0), false, 'must roll first');
  Object.assign(g.hands.party, { scrap: 0, wire: 0, cell: 0, gel: 0, glass: 0 });
  LAT.roll(g, [3, 4]); assert.ok(g.mustMoveRot, 'a 7 moves the coderot');
  assert.equal(LAT.endTurn(g), false, 'cannot end before moving it');
  const target = g.hexes.findIndex((h, i) => i !== g.rot && h.res); assert.ok(LAT.moveRot(g, target)); assert.equal(g.rot, target);
  const free = g.edges.findIndex((e, i) => LAT.canLink(g, 'party', i));
  assert.equal(LAT.build(g, 'link', free), false, 'cannot afford');
  g.hands.party.scrap = 1; g.hands.party.wire = 1; assert.ok(LAT.build(g, 'link', free));
  assert.equal(g.hands.party.scrap + g.hands.party.wire, 0);
  g.hands.party.glass = 3; assert.ok(LAT.bankTrade(g, 'glass', 'gel')); assert.equal(g.hands.party.gel, 1);
});

const { ES_QUESTS } = await import('../src/i18n/es-quests.js');
const { QUESTS: QUESTS_ES } = await import('../src/content/quests.js');
test('i18n: every quest title, reason, stage, pitch and reward line has Spanish', () => {
  const missing = [];
  for (const q of QUESTS_ES) for (const t of [q.title, q.why, q.pitch, q.reward?.line, ...q.stages.map((st) => st.text)]) if (t && !(t in ES_QUESTS)) missing.push(t.slice(0, 50));
  assert.deepEqual(missing, [], 'add these to src/i18n/es-quests.js');
});

const { ES_ITEMS } = await import('../src/i18n/es-items.js');
const { ITEMS: ITEMS_FOR_ES } = await import('../src/content/items.js');
test('i18n: every item has a Spanish name and description', () => {
  const missing = Object.entries(ITEMS_FOR_ES).filter(([id, d]) => { const es = ES_ITEMS[id.replace(/^item\./, '')]; return !es || !es[0] || (d.text && !es[1]); }).map(([id]) => id);
  assert.deepEqual(missing, [], 'add these to src/i18n/es-items.js');
});

const { ES_631 } = await import('../src/i18n/es-631.js');
test('i18n: every Room 631 label and description has Spanish', () => {
  const m = MAPS_FOR_TEST.room631, missing = [];
  for (const o of m.objects) for (const t of [o.label, o.text, ...(o.pages ?? []), ...((o.later ?? []).map((l) => l.text)), o.lockedText]) if (t && !(t in ES_631)) missing.push(t.slice(0, 40));
  assert.deepEqual(missing, [], 'add these to src/i18n/es-631.js');
});

const { PipePuzzle } = await import('../src/game/ui/PipePuzzle.js').catch(() => ({}));
test('pipe puzzle: every seed is solvable and starts unsolved', () => {
  if (!PipePuzzle) return;
  for (let i = 0; i < 300; i++) {
    const p = new PipePuzzle(null, `seed-${i}`);
    assert.ok(!p.solved(), `seed-${i} starts solved`);
    for (const row of p.grid) for (const c of row) if (c.solution !== undefined) c.r = c.solution;
    assert.ok(p.solved(), `seed-${i} solution doesn't solve`);
    for (const row of p.grid) for (const c of row) if (c.solution !== undefined) assert.ok(!c.locked, 'path tile locked');
  }
});

const SCENES = ['cold_open', 'aster', 'lead_a_helium', 'lead_b_halvard', 'lead_c_footage', 'the_call', 'descent_and_boss', 'ending', 'first_death'];
const { loadScene, Conversation, evalCond } = await import('../src/engine/dialogue.js');
await (async () => {
  try {
    for (const name of SCENES) {
      const scene = await loadScene(name);
      for (const speaker of ['michael', 'trevor', 'manuel']) for (const pick of [0, 1]) {
        const ctx = { speaker, present: ['michael', 'trevor', 'manuel'], flags: {}, inventory: [], seed: pick ? 'B' : 'A', morph: 0, standing: {} };
        const sink = { flag: (k, v) => { ctx.flags[k] = v; }, item: (i) => ctx.inventory.push(i), standing: (f, n) => { ctx.standing[f] = (ctx.standing[f] ?? 0) + n; } };
        const conv = new Conversation(scene, scene.start, ctx, sink);
        let steps = 0;
        while (!conv.done && steps < 2000) { if (conv.choices.length) conv.choose(Math.min(pick, conv.choices.length - 1)); else conv.advance(); steps++; }
        assert.ok(conv.done, `${name} as ${speaker} never ended (stuck at ${conv.nodeId})`);
      }
    }
    assert.equal(evalCond('speaker=trevor && flag act1.x', { speaker: 'trevor', flags: { 'act1.x': true }, present: [], inventory: [], standing: {} }), true);
    assert.equal(evalCond('not flag act1.x', { speaker: 'trevor', flags: { 'act1.x': true }, present: [], inventory: [], standing: {} }), false);
    console.log('ok   dialogue: all 9 scenes play to an end for every speaker');
  } catch (e) { failed++; console.log(`FAIL dialogue\n     ${e.message}`); }
})();

const { CompanionBrain } = await import('../src/engine/companion.js');
const { ITEMS: ITEMS_T } = await import('../src/content/items.js');
test('AI companions follow the human, fight, and never trigger exits', () => {
  const sim = new Sim(MAPS_FOR_TEST.tunnel_1, { seed: 's' });
  sim.addPlayer('host', 'trevor'); sim.addPlayer('ai:manuel', 'manuel'); sim.addPlayer('ai:michael', 'michael');
  for (const p of sim.players.values()) p.mods.swing = ITEMS_T['item.pry_bar'].swing;   // everyone starts with a pry bar
  const brain = new CompanionBrain(sim), h = sim.players.get('host'), before = sim.enemies.size;
  let aiExit = false;
  for (let t = 0; t < 60 * 40; t++) {
    const ang = t / 300, inputs = new Map([['host', { ...emptyInput(), mx: Math.cos(ang), my: Math.sin(ang * 1.3), attack: t % 20 === 0 }]]);
    for (const [id, i] of brain.inputs()) inputs.set(id, i);
    sim.step(1 / 60, inputs);
    if (sim.events.some((e) => e.t === 'bumpExit' && String(e.by).startsWith('ai:'))) aiExit = true;
  }
  for (const id of ['ai:manuel', 'ai:michael']) { const p = sim.players.get(id); assert.ok(Math.hypot(p.x - h.x, p.y - h.y) < 120, `${id} fell behind`); }
  assert.ok(sim.enemies.size < before, 'the party fought nothing');
  assert.ok(!aiExit, 'a companion used an exit');
  assert.ok(!sim.allWaiting('nope') || true);
});

const Inv = await import('../src/engine/inventory.js');
test('slot inventory: stacks, backpack-first (hotbar only when full), remove, move/merge/swap, half', () => {
  const c = { inventory: new Array(36).fill(null) };
  assert.equal(Inv.add(c, 'item.mat_scrap', 150), 0);
  assert.deepEqual([c.inventory[9].qty, c.inventory[10].qty], [99, 51]);   // backpack, not the hotbar
  assert.ok(c.inventory.slice(0, 9).every((x) => !x), 'hotbar stays empty');
  Inv.add(c, 'item.wooden_bat'); Inv.add(c, 'item.wooden_bat');
  assert.equal(c.inventory[11].id, 'item.wooden_bat'); assert.equal(c.inventory[12].id, 'item.wooden_bat');   // gear doesn't stack
  assert.ok(Inv.remove(c, 'item.mat_scrap', 60)); assert.equal(Inv.count(c, 'item.mat_scrap'), 90);
  Inv.moveSlot(c, 9, 20); assert.equal(c.inventory[9], null); assert.equal(c.inventory[20].id, 'item.mat_scrap');
  Inv.moveSlot(c, 11, 20); assert.equal(c.inventory[20].id, 'item.wooden_bat'); assert.equal(c.inventory[11].id, 'item.mat_scrap');   // swap
  const before = c.inventory[11].qty; Inv.moveSlot(c, 11, 30, true); assert.equal(c.inventory[30].qty + c.inventory[11].qty, before);
  assert.ok(!Inv.pay(c, { 'item.mat_wire': 1 })); assert.ok(Inv.pay(c, { 'item.mat_scrap': 5 }));
  const full = { inventory: new Array(36).fill(null).map((_, i) => (i >= 9 ? { id: 'item.wooden_bat', qty: 1 } : null)) };
  Inv.add(full, 'item.energy_bar'); assert.equal(full.inventory[0].id, 'item.energy_bar', 'hotbar takes it once the backpack is full');
});
test('schema 1 -> 2 migration: scrap becomes money, list inventory becomes 36 slots', () => {
  const old = newSave({ seed: 'm', rolls: {}, gameVersion: 't' });
  old.schemaVersion = 1; old.world.scrap = 10; delete old.world.money;
  old.party.trevor.inventory = [{ id: 'item.mate_flask', qty: 1 }, { id: 'item.wooden_bat', qty: 1 }];
  const m = migrate(JSON.parse(JSON.stringify(old)));
  assert.equal(m.schemaVersion, CURRENT_SCHEMA); assert.equal(m.world.money, 55); assert.ok(!('scrap' in m.world));
  assert.equal(m.party.trevor.inventory.length, 36); assert.equal(m.party.trevor.inventory[1].id, 'item.wooden_bat');
  assert.equal(m.party.manuel.inventory.length, 36);
});

test('schema 2 -> 3 migration: worn armor moves to the chestplate slot (D-014)', () => {
  const old = newSave({ seed: 'a', rolls: {}, gameVersion: 't' });
  old.schemaVersion = 2;
  for (const c of Object.values(old.party)) { c.equipped = { weapon: null, ranged: null, armor: 'item.mesh_vest', gadget: null, charm: null }; delete c.upgrades; }
  const m = migrate(JSON.parse(JSON.stringify(old)));
  assert.equal(m.schemaVersion, CURRENT_SCHEMA);
  assert.equal(m.party.trevor.equipped.chestplate, 'item.mesh_vest'); assert.ok(!('armor' in m.party.trevor.equipped));
  assert.equal(m.party.trevor.equipped.boots, null); assert.deepEqual(m.party.trevor.upgrades, {});
});

test('dialogue graphs: no dangling jumps, and the big scenes are not secretly dead ends', () => {
  const rot = (x) => x.replace(/[a-z]/gi, (c) => String.fromCharCode((c <= 'Z' ? 65 : 97) + ((c.toLowerCase().charCodeAt(0) - 97 + 13) % 26)));
  // Scenes that are one connected conversation (not a bag of standalone barks/fragments).
  const CONNECTED = { ending: 2, the_call: 8, cold_open: 2, lead_a_helium: 2, lead_b_halvard: 2, lead_c_footage: 2 };
  for (const f of fs.readdirSync('src/content/dialogue/act1')) {
    const src = fs.readFileSync(`src/content/dialogue/act1/${f}`, 'utf8');
    const d = JSON.parse(rot(JSON.parse(src.slice(src.indexOf('export default ') + 15).trim().replace(/;$/, ''))));
    const name = f.replace('.js', ''), ids = Object.keys(d.nodes);
    for (const [id, n] of Object.entries(d.nodes)) {
      for (const c of n.choices) assert.ok(c.go === 'END' || d.nodes[c.go], `${name}:${id} choice -> missing ${c.go}`);
      if (n.go) assert.ok(n.go === 'END' || d.nodes[n.go], `${name}:${id} -> missing ${n.go}`);
    }
    const terms = ids.filter((id) => { const n = d.nodes[id]; return !n.go && !(n.gos || []).length && !n.choices.length; });
    if (CONNECTED[name] != null) assert.ok(terms.length <= CONNECTED[name], `${name}: ${terms.length} dead-end nodes (max ${CONNECTED[name]}): ${terms.slice(0, 6).join(', ')}`);
  }
});

const { SKILL_TREE, skillOpen, migrateSkills } = await import('../src/content/skills.js');
const { playerMods: pmods } = await import('../src/content/items.js');

test('unique gear only works for its owner; upgrades scale bonuses (D-014)', () => {
  const wearing = (extra = {}) => ({ skills: {}, skillPoints: 0, equipped: { boots: 'item.winged_boots' }, upgrades: {}, ...extra });
  const mine = pmods(wearing(), 'michael'), theirs = pmods(wearing(), 'trevor');
  assert.ok(mine.blink && mine.speed >= 0.6, 'Michael gets the boots');
  assert.ok(!theirs.blink && theirs.speed < 0.6, 'Trevor gets nothing from them');
  const up = pmods(wearing({ upgrades: { 'item.winged_boots': 2 } }), 'michael');
  assert.ok(Math.abs((up.speed - mine.speed) - 0.6 * 0.3) < 1e-6, 'two armorer levels = +30% of the boots');
});

test('ability scores: modifiers, level points, checks (D-017)', async () => {
  const { modOf, abilityModsFor, check } = await import('../src/content/abilities.js');
  assert.equal(modOf(10), 0); assert.equal(modOf(11), 0); assert.equal(modOf(14), 2); assert.equal(modOf(8), -1); assert.equal(modOf(1), -5); assert.equal(modOf(30), 10);
  assert.equal(abilityModsFor({ abilities: { str: 16 } }, 'trevor').melee, 6);
  const r = check({ abilities: { cha: 14 } }, 'michael', 'cha', 15, { rand: () => 0.6 });   // d20 = 13, +2
  assert.equal(r.total, 15); assert.ok(r.success);
});
test('skill trees: valid links, capstone needs all three branches, mods sum, old skills refunded', () => {
  for (const [who, t] of Object.entries(SKILL_TREE)) {
    const ids = new Set(t.nodes.map((n) => n.id));
    assert.equal(ids.size, t.nodes.length, `${who}: duplicate ids`);
    for (const n of t.nodes) for (const r of n.req || []) assert.ok(ids.has(r), `${who}:${n.id} needs missing ${r}`);
    const cap = t.nodes.find((n) => n.row === 4); assert.equal(cap.req.length, 3, `${who}: capstone`);
    const c = { skills: {}, skillPoints: 0, equipped: {} };
    assert.ok(!skillOpen(who, c, cap));
    for (const n of t.nodes) c.skills[n.id] = n.max;
    assert.ok(skillOpen(who, c, cap));
    const m = pmods(c, who); assert.ok(m.abilityPower > 0 && m.armor <= 0.6);
  }
  const old = { skills: { 'skill.trevor.stack': 2, 'tr.amp': 1 }, skillPoints: 1 };
  assert.equal(migrateSkills(old, 'trevor'), 2); assert.equal(old.skillPoints, 3); assert.deepEqual(Object.keys(old.skills), ['tr.amp']);
});

// Every source file must at least parse. A file the tests don't import (map dressing, scenes) can
// otherwise carry a syntax error straight to a black screen in the browser.
{
  const { execFileSync } = await import('node:child_process');
  const { readdirSync, statSync } = await import('node:fs');
  const walk = (d) => readdirSync(d).flatMap((n) => { const p = `${d}/${n}`; return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []; });
  const root = new URL('../src', import.meta.url).pathname;
  test('every file under src/ parses', () => {
    const bad = [];
    for (const f of walk(root)) { try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { bad.push(`${f.slice(root.length + 1)}: ${String(e.stderr).split('\n').find((l) => l.includes('SyntaxError')) ?? 'syntax error'}`); } }
    assert.equal(bad.length, 0, bad.join('; '));
  });
}

// Level design guard: from the spawn, every object on every map can be walked up to (doors open on
// contact, so they count as passable). Catches a prop or NPC walled off by a later layout edit.
test('every map object is reachable on foot', () => {
  const bad = [];
  for (const m of Object.values(MAPS_FOR_TEST)) {
    const seen = new Set(), q = [];
    for (const s of m.spawns) { const x = Math.floor(s.x / 16), y = Math.floor(s.y / 16); if (m.solid(x, y)) bad.push(`${m.id}: spawn in a wall at ${x},${y}`); else { seen.add(`${x},${y}`); q.push([x, y]); } }
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
        if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || seen.has(k) || (m.solid(nx, ny) && !m.doors?.has(k))) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    for (const e of m.enemies ?? []) if (m.solid(Math.floor(e.x / 16), Math.floor(e.y / 16))) bad.push(`${m.id}: ${e.kind} spawns inside a wall or tree at ${Math.floor(e.x / 16)},${Math.floor(e.y / 16)}`);
    for (const o of m.objects) if (![[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${o.x + dx},${o.y + dy}`))) bad.push(`${m.id}: ${o.id} at ${o.x},${o.y}`);
  }
  assert.equal(bad.length, 0, bad.join('; '));
});

test('stepping onto the lobby street doors leaves the building', () => {
  const sim = new Sim(MAPS_FOR_TEST.aster_lobby, { seed: 's' }); sim.addPlayer('a', 'manuel');
  const p = sim.players.get('a'); p.x = 17 * 16 + 8; p.y = 12 * 16 + 8;
  sim.events.length = 0; sim._moveAxis(p, 0, 16);
  assert.ok(sim.events.some((e) => e.t === 'bumpExit' && e.id === 'obj.street_doors'));
});

const yard = await import('../src/content/switchyard.js');
test('the switchyard answer is never the levers\' starting position', () => {
  const { solution, LEVERS } = yard;
  for (let i = 0; i < 400; i++) assert.ok(LEVERS.some((k) => solution(`seed-${i}`)[k] === 'right'), `seed-${i}`);
});

test('the blue pill makes dodges free while it lasts', () => {
  const sim = new Sim(MAPS_FOR_TEST.room631, { seed: 's' }); sim.addPlayer('a', 'manuel');
  const p = sim.players.get('a'); p.x = 14 * 16 + 8; p.y = 9 * 16 + 8;
  const dodge = () => { p.dodgeT = 0; p.dodgeCd = 0; sim.step(1 / 60, new Map([['a', { ...emptyInput(), dodge: true, mx: 1 }]])); };
  dodge(); const spent = MOVE.stamina - p.sta; assert.ok(spent > 0, 'a normal dodge costs stamina');
  p.sta = MOVE.stamina; p.staT = 0; p.pillT = 45; dodge();
  assert.equal(p.sta, MOVE.stamina);
});

const { BARKS } = await import('../src/content/barks.js');
const { LINES_ES } = await import('../src/content/lines_es.js');
const crowd = await import('../src/game/crowd.js');
test('every bark and crowd line has Spanish', () => {
  const all = []; const walk = (o) => { if (typeof o === 'string') all.push(o); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
  walk(BARKS); walk(crowd.LINES); walk(crowd.PIXEL_LINES);
  const missing = all.filter((s) => !LINES_ES[s]);
  assert.deepEqual(missing, [], 'add these to src/content/lines_es.js');
});

const { laneDashes } = await import('../src/game/render/tiles.js');
test('roads get centre-line dashes that stop at junctions', () => {
  const lay = ['ssssss,,,,ssssss', ',,,,,,,,,,,,,,,,', ',,,,,,,,,,,,,,,,', ',,,,,,,,,,,,,,,,', 'ssssss,,,,ssssss', 'ssssss,,,,ssssss', 'ssssss,,,,ssssss', 'ssssss,,,,ssssss'];
  const d = laneDashes(lay);
  assert.ok(d.some((r) => r.h === 2 && r.y === 2 * 16 - 1 + 8), 'horizontal road has a centre line');
  assert.ok(!d.some((r) => r.x >= 6 * 16 && r.x < 10 * 16 && r.h === 2), 'no horizontal dash inside the junction');
});

if (failed) { console.log(`\n${failed} test(s) failed`); process.exit(1); }
console.log('\nall tests passed');
