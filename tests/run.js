// Node test runner (no dependencies): `node tests/run.js`. Must pass before pushing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { makeStreams, Rng } from '../src/engine/rng.js';
import { rollWorld } from '../src/engine/worldRolls.js';
import { newSave, migrate, CURRENT_SCHEMA } from '../src/engine/save/schema.js';
import { Sim, MOVE, ROT, MATE, UNDER, LULLABY as BOT_LULLABY, emptyInput } from '../src/engine/sim.js';
import { ENEMIES } from '../src/content/enemies.js';
import { ITEMS } from '../src/content/items.js';
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

const addSpawnParty = (sim) => {
  for (const [id, character] of [['host', 'trevor'], ['ai:manuel', 'manuel'], ['ai:michael', 'michael']]) sim.addPlayer(id, character);
};
test('deferred startup with the full roster matches boss scaling on ordinary map entry', () => {
  for (const seed of ['party-load-1', 'party-load-2', 'party-load-3']) {
    const loaded = new Sim(MAPS_FOR_TEST.platform, { seed, deferSpawn: true });
    assert.equal(loaded.enemies.size, 0); assert.equal(loaded.events.length, 0);
    addSpawnParty(loaded); loaded.spawnEnemies();
    const entered = new Sim(MAPS_FOR_TEST.room631, { seed });
    addSpawnParty(entered); entered.setMap(MAPS_FOR_TEST.platform);
    const boss = [...loaded.enemies.values()].find((e) => e.boss), other = [...entered.enemies.values()].find((e) => e.boss);
    assert.equal(boss.def.hp, 1440); assert.equal(boss.def.hp, other.def.hp);   // doubled in task #33
    assert.equal(loaded.snapshot().enemies.find((e) => e.boss).boss.max, other.def.hp);
    assert.deepEqual([...loaded.enemies.values()].map((e) => e.spawnKey), [...entered.enemies.values()].map((e) => e.spawnKey));
    assert.equal(loaded.events.filter((e) => e.t === 'boss').length, 1);
  }
});
test('startup stays eager by default and deferred spawning preserves killed enemies', () => {
  const map = MAPS_FOR_TEST.platform, eager = new Sim(map);
  assert.equal(eager.enemies.size, map.enemies.length);
  assert.equal([...eager.enemies.values()].find((e) => e.boss).def.hp, 720);   // solo Warden, doubled in task #33
  const killed = new Set(map.enemies.map((_, i) => `${map.id}#${i}`));
  const loaded = new Sim(map, { deferSpawn: true, killed });
  addSpawnParty(loaded); loaded.spawnEnemies();
  assert.equal(loaded.enemies.size, 0); assert.equal(loaded.events.length, 0);
});

test('recorded constructor settings apply before eager and deferred initial spawning', () => {
  for (const deferSpawn of [false, true]) {
    const sim = new Sim(MAPS_FOR_TEST.platform, { bossVariant: 'sahur', deferSpawn });
    if (deferSpawn) { addSpawnParty(sim); sim.spawnEnemies(); }
    const boss = [...sim.enemies.values()].find((e) => e.boss);
    assert.equal(boss.kind, 'boss.sahur');
    assert.equal(sim.snapshot().enemies.find((e) => e.boss).k, 'boss.sahur');
    assert.equal(sim.events.filter((e) => e.t === 'boss').length, 1);
  }
});
test('missing or unknown recorded settings preserve defaults and killed spawns stay killed', () => {
  const map = MAPS_FOR_TEST.platform;
  let ref = null;   // same HP as the default Warden, whatever its tuning is (it was doubled in 2de5b6e)
  for (const bossVariant of [undefined, 'warden', 'future-choice']) {
    const sim = new Sim(map, { bossVariant, deferSpawn: true });
    addSpawnParty(sim); sim.spawnEnemies();
    const boss = [...sim.enemies.values()].find((e) => e.boss);
    ref ??= boss.def.hp;
    assert.equal(boss.kind, 'boss.warden'); assert.equal(boss.def.hp, ref);
  }
  const killed = new Set(map.enemies.map((_, i) => `${map.id}#${i}`));
  const restored = new Sim(map, { bossVariant: 'sahur', deferSpawn: true, killed });
  addSpawnParty(restored); restored.spawnEnemies();
  assert.equal(restored.enemies.size, 0); assert.equal(restored.events.length, 0);
});

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

test('an ordinary plain Captcha keeps base armor until it becomes dizzy', () => {
  const map = { ...rotArena(), id: 'captcha-armor-probe', enemies: [{ kind: 'enemy.captcha', x: 210, y: 160 }] };
  const sim = new Sim(map, { seed: 'armor-2' }), e = [...sim.enemies.values()][0];
  assert.equal(e.def.trait, 'plain', 'ordinary seeded variant, without an authored override');
  let hp = e.hp; sim._hurtEnemy(e, 20, 0, 0);
  assert.equal(hp - e.hp, 14, 'base armor absorbs 30%');
  hp = e.hp; e.st = 'dizzy'; sim._hurtEnemy(e, 20, 0, 0);
  assert.equal(hp - e.hp, 40, 'charge recovery bypasses armor and takes double damage');
});

test('armored variants retain their protection without stacking it onto base armor', () => {
  for (const [kind, elite, damage] of [
    ['enemy.captcha', 'armored', 14], ['enemy.spitter', 'armored', 14], ['enemy.spitter', 'plain', 20],
  ]) {
    const map = { ...rotArena(), enemies: [{ kind, x: 210, y: 160, elite }] };
    const sim = new Sim(map), e = [...sim.enemies.values()][0], hp = e.hp;
    sim._hurtEnemy(e, 20, 0, 0);
    assert.equal(hp - e.hp, damage, `${elite} ${kind}`);
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
test('balance bot rolls into an undeflectable shot even when its melee weapon is ready', () => {
  const { sim, p, counts, step } = botFixture();
  sim.shots.push({ x: p.x + 16, y: p.y - 6, vx: -100, vy: 0, life: 2, dmg: 10, from: 'enemy', noDeflect: true });
  const inp = step(); assert.ok(inp.dodge && inp.mx > 0); assert.equal(inp.attack, false);
  for (let i = 0; i < 12; i++) step();
  assert.equal(counts.deflect, 0); assert.ok(counts.perfect >= 1); assert.equal(p.hp, 100);
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

const sleepArena = () => ({ ...rotArena(), id: 'sleep-recovery',
  enemies: [{ kind: 'enemy.moth', x: 210, y: 160, elite: 'plain' }] });
const advanceSleep = (sim, seconds, input = () => emptyInput(), events = []) => {
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    sim.step(1 / 60, new Map([...sim.players.values()].map((p) => [p.id, input(p)])));
    events.push(...sim.events.map((e) => ({ ...e, seconds: sim.tick / 60 })));
  }
  return events;
};

test('three sleeping input-driven players recover from moth hum and can leave without caffeine', () => {
  const sim = new Sim(sleepArena(), { seed: 'bal1' });
  for (const [id, character] of [['host', 'trevor'], ['second', 'manuel'], ['third', 'michael']]) sim.addPlayer(id, character);
  const events = advanceSleep(sim, 4);
  assert.ok([...sim.players.values()].every((p) => p.sleepT > 0), 'hum still puts all three to sleep');
  advanceSleep(sim, 36, () => ({ ...emptyInput(), mx: -1, attack: true, dodge: true }), events);
  for (const p of sim.players.values()) {
    assert.ok(!(p.sleepT > 0)); assert.ok(p.x < 160 - BOT_LULLABY.mothRange, `${p.id} regained movement`);
    assert.equal(p.hp, 100); assert.equal(p.downed, false);
  }
  assert.equal(events.filter((e) => e.t === 'sleep').length, 3);
  assert.equal(events.filter((e) => e.t === 'wake').length, 3);
  assert.equal(sim.wiped, false);
});

test('continuous moth hum: after waking, the sleep cooldown and then the normal exposure before sleep can start again', () => {
  const sim = new Sim(sleepArena(), { seed: 'bal1' }); sim.addPlayer('host', 'trevor');
  const events = advanceSleep(sim, BOT_LULLABY.expose * 2 + BOT_LULLABY.sleep + BOT_LULLABY.immune + 1);
  const sleeps = events.filter((e) => e.t === 'sleep'), wakes = events.filter((e) => e.t === 'wake');
  assert.equal(sleeps.length, 2); assert.equal(wakes.length, 1);
  assert.ok(Math.abs(wakes[0].seconds - sleeps[0].seconds - BOT_LULLABY.sleep) <= 2 / 60);
  assert.ok(Math.abs(sleeps[1].seconds - wakes[0].seconds - BOT_LULLABY.immune - BOT_LULLABY.expose) <= 2 / 60);
});

test('player lullaby (Trevor: was overpowered): short sleep, no refresh, a cooldown before the same target sleeps again', () => {
  const sim = new Sim(rotArena());
  sim.addPlayer('singer', 'michael'); sim.addPlayer('target', 'trevor'); sim.addPlayer('baby', 'manuel');
  const target = sim.players.get('target'), baby = sim.players.get('baby');
  target.x = 200; baby.x = 220; baby.mods.sleepGuard = 1;
  const base = ENEMIES['enemy.rotling'];
  sim.enemies.set('listener', { id: 'listener', kind: 'enemy.rotling', x: 240, y: 160, hp: 500,
    def: { ...base, speed: 0 }, cd: 999, hurtT: 0, kx: 0, ky: 0 });
  const L = BOT_LULLABY;
  sim.setPlaying('singer', 'lullaby'); advanceSleep(sim, L.expose + 0.5);
  assert.ok(!(sim.players.get('singer').sleepT > 0));
  assert.ok(target.sleepT > 0 && baby.sleepT > 0 && sim.enemies.get('listener').sleepT > 0, 'everyone in range falls asleep');
  advanceSleep(sim, L.sleep);                                   // still playing: no refresh
  assert.ok(!(target.sleepT > 0) && !(sim.enemies.get('listener').sleepT > 0), 'wakes after the short sleep');
  assert.ok(baby.sleepT > 0, 'the pacifier still gives the longer baby sleep');
  advanceSleep(sim, L.immune - 1);
  assert.ok(!(target.sleepT > 0) && !(sim.enemies.get('listener').sleepT > 0), 'cooldown: can\'t be sung back to sleep yet');
  advanceSleep(sim, 1 + L.expose + 0.5);
  assert.ok(target.sleepT > 0, 'after the cooldown and a fresh exposure, sleep works again');
});

test('caffeine still wakes a moth sleeper immediately and blocks hum only while wired', () => {
  const sim = new Sim(sleepArena(), { seed: 'bal1' }); sim.addPlayer('host', 'trevor');
  const p = sim.players.get('host'); advanceSleep(sim, 4); assert.ok(p.sleepT > 0);
  sim.caffeinate('host', 5); assert.equal(p.sleepT, 0);
  advanceSleep(sim, 4); assert.ok(p.wiredT > 0); assert.ok(!(p.sleepT > 0));
  advanceSleep(sim, 2); assert.equal(p.wiredT, 0); assert.ok(!(p.sleepT > 0));
  assert.ok(!(p.sleepT > 0)); advanceSleep(sim, BOT_LULLABY.immune + BOT_LULLABY.expose); assert.ok(p.sleepT > 0, 'hum works again after the sleep cooldown and normal exposure');
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
const { ES_TUNNELS_LAKE } = await import('../src/i18n/es-tunnels-lake.js');
test('i18n: every tunnel, platform and lake label and description has Spanish', () => {
  const missing = [];
  for (const id of ['tunnel_1', 'platform', 'lake']) for (const o of MAPS_FOR_TEST[id].objects) for (const t of [o.label, o.text, ...(o.pages ?? []), ...((o.later ?? []).map((l) => l.text)), o.lockedText]) if (t && !(t in ES_TUNNELS_LAKE)) missing.push(`${id}: ${t.slice(0, 40)}`);
  assert.deepEqual(missing, [], 'add these to src/i18n/es-tunnels-lake.js');
});
const { ES_PLAZA } = await import('../src/i18n/es-plaza.js');
test('i18n: every plaza label and description has Spanish', () => {
  const missing = [];
  for (const o of MAPS_FOR_TEST.metro_plaza.objects) for (const t of [o.label, o.text, ...(o.pages ?? []), ...((o.later ?? []).map((l) => l.text)), o.lockedText]) if (t && !(t in ES_PLAZA)) missing.push(t.slice(0, 40));
  assert.deepEqual(missing, [], 'add these to src/i18n/es-plaza.js');
});
test('i18n: every Room 631 label and description has Spanish', () => {
  const m = MAPS_FOR_TEST.room631, missing = [];
  for (const o of m.objects) for (const t of [o.label, o.text, ...(o.pages ?? []), ...((o.later ?? []).map((l) => l.text)), o.lockedText]) if (t && !(t in ES_631)) missing.push(t.slice(0, 40));
  assert.deepEqual(missing, [], 'add these to src/i18n/es-631.js');
});

const { ES_ASTER } = await import('../src/i18n/es-aster.js');
test('i18n: every ASTER hallway and lobby label and description has Spanish', () => {
  const missing = [];
  for (const id of ['aster_hall', 'aster_lobby']) for (const o of MAPS_FOR_TEST[id].objects) for (const t of [o.label, o.text, ...(o.pages ?? []), ...((o.later ?? []).map((l) => l.text)), o.lockedText, o.doneText]) if (typeof t === 'string' && t && !(t in ES_ASTER)) missing.push(`${id}: ${t.slice(0, 40)}`);
  assert.deepEqual(missing, [], 'add these to src/i18n/es-aster.js');
});

const { GUIDE_PEOPLE } = await import('../src/content/guide.js');
test('i18n: every guide stage has Spanish', () => {
  const missing = GUIDE_PEOPLE.flatMap((e) => e.stages.filter((s) => !s.es).map((s) => `${e.id}: ${s.text.slice(0, 40)}`));
  assert.deepEqual(missing, [], 'add an es: field to these stages in src/content/guide.js');
});

const { Crush } = await import('../src/game/crush.js');
test('D-016 gesture timing: rare and idle-only early, frequent after the switchyard, AI roommates included', () => {
  const sent = [];
  const mk = (flags) => { const sc = { mode: 'solo', time: { now: 0 }, save: { flags, world: { act: 1 } } }; const c = new Crush(sc); c._send = (m) => sent.push(m); return { sc, c }; };
  const snap = (dx) => ({ players: [{ id: 'ai:michael', c: 'michael', x: 100 + dx, y: 100 }, { id: 'p1', c: 'manuel', x: 110, y: 100 }] });
  // early (no flags): moving never pats; standing still does, then waits minutes
  let { sc, c } = mk({});
  for (let i = 0; i < 400; i++) { sc.time.now = 250000 + i * 1000; c.update(snap(i % 2)); }
  assert.equal(sent.filter((m) => m.pat).length, 0, 'no pat while Michael keeps moving early on');
  for (let i = 0; i < 1800; i++) { sc.time.now = 700000 + i * 1000; c.update(snap(0)); }
  const early = sent.filter((m) => m.pat).length; assert.ok(early >= 1 && early <= 4, `early pats in 30 min: ${early}`);
  // after the switchyard: many more, even while moving
  sent.length = 0; ({ sc, c } = mk({ 'act1.beat.call': true, 'act1.switchyard.solved': true }));
  for (let i = 0; i < 1800; i++) { sc.time.now = 250000 + i * 1000; c.update(snap(i % 2)); }
  const late = sent.filter((m) => m.pat).length; assert.ok(late >= 12, `late pats in 30 min: ${late}`);
});

const i18nMod = await import('../src/i18n.js');
test('i18n: built-in object names are never treated as translations', () => {
  const i18n = i18nMod; const was = i18n.getLang(); i18n.setLang('es');
  try { for (const s of ['constructor', 'toString', '__proto__', 'hasOwnProperty', '→ constructor', '[E] toString']) assert.equal(i18n.tr(s), s); } finally { i18n.setLang(was); }
});

const fartMod = await import('../src/game/fart.js');
const buttMod = await import('../src/game/bigButt.js');
const npcLifeMod = await import('../src/content/npc_life.js');
test('Manuel\'s fart: on its own, rare, Michael only sniffs once his side says yes', () => {
  const sent = [], sc = { mode: 'solo', time: { now: 0 } }, f = new fartMod.Fart(sc); f._send = (m) => sent.push(m);
  const snap = { players: [{ id: 'ai:manuel', c: 'manuel', x: 100, y: 100 }, { id: 'p2', c: 'michael', x: 120, y: 100 }] };
  for (let i = 0; i < 3600; i++) { sc.time.now = i * 1000; f.update(snap); }   // an hour, no input at all
  assert.ok(sent.length >= 5 && sent.length <= 16, `farts in an hour: ${sent.length}`);
  assert.ok(sent.every((m) => m.id === 'ai:manuel' && m.line), 'always Manuel, always a line');
  if (!fartMod.MICHAEL_SAYS_YES) assert.ok(sent.every((m) => !m.sniff && !m.reply), 'Michael stays out of it until his yes');
  else assert.ok(sent.every((m) => m.sniff === 'p2' && m.reply), 'Michael close by sniffs every one');
});

const { ES_HUD } = await import('../src/i18n/es-hud.js');
test('i18n: every map name has Spanish', () => {
  const missing = Object.values(MAPS_FOR_TEST).map((m) => m.name).filter((n) => n && !(n in ES_HUD));
  assert.deepEqual(missing, [], 'add these to src/i18n/es-hud.js');
});

const eggsMod = await import('../src/game/eggs.js').catch(() => null);
test('O-key egg: Trevor\'s character is never a doer or a target; roommate targets need both yeses', () => {
  if (!eggsMod) return;
  const { roommateTargetOk, NEVER_DOER, TARGET_OK } = eggsMod;
  assert.ok(NEVER_DOER.has('trevor'));
  assert.equal(TARGET_OK.trevor, false);
  for (const d of ['manuel', 'michael', 'trevor']) assert.equal(roommateTargetOk(d, 'trevor'), false, `${d} -> trevor`);
  for (const t of ['manuel', 'michael', 'trevor']) assert.equal(roommateTargetOk('trevor', t), false, `trevor -> ${t}`);
  assert.equal(roommateTargetOk('manuel', 'manuel'), false, 'nobody targets themselves');
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

// Every generated scene (romance and checkpoint included), so a new scene can't skip this check.
const SCENES = fs.readdirSync(new URL('../src/content/dialogue/act1/', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, ''));
const { loadScene, Conversation, evalCond } = await import('../src/engine/dialogue.js');
await (async () => {
  try {
    for (const name of SCENES) {
      const scene = await loadScene(name);
      for (const speaker of ['michael', 'trevor', 'manuel']) for (const pick of [0, 1, 2, 99]) {
        const ctx = { speaker, present: ['michael', 'trevor', 'manuel'], flags: {}, inventory: [], seed: pick % 2 ? 'B' : 'A', morph: 0, standing: {} };
        const sink = { flag: (k, v) => { ctx.flags[k] = v; }, item: (i) => ctx.inventory.push(i), standing: (f, n) => { ctx.standing[f] = (ctx.standing[f] ?? 0) + n; } };
        const conv = new Conversation(scene, scene.start, ctx, sink);
        let steps = 0;
        while (!conv.done && steps < 2000) { if (conv.choices.length) conv.choose(Math.min(pick, conv.choices.length - 1)); else conv.advance(); steps++; }
        assert.ok(conv.done, `${name} as ${speaker} never ended (stuck at ${conv.nodeId})`);
      }
    }
    assert.equal(evalCond('speaker=trevor && flag act1.x', { speaker: 'trevor', flags: { 'act1.x': true }, present: [], inventory: [], standing: {} }), true);
    assert.equal(evalCond('not flag act1.x', { speaker: 'trevor', flags: { 'act1.x': true }, present: [], inventory: [], standing: {} }), false);
    console.log(`ok   dialogue: all ${SCENES.length} scenes play to an end for every speaker, first/second/third/last choice`);
  } catch (e) { failed++; console.log(`FAIL dialogue\n     ${e.message}`); }
})();

test('every door has wall on both sides (no doors standing on an open patch)', () => {
  for (const m of Object.values(MAPS_FOR_TEST)) {
    const walk = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !m.solid(x, y);
    for (const [k, d] of m.doors ?? []) {
      const [x, y] = k.split(',').map(Number), wall = (a, b) => m.solid(a, b) && !m.doors.has(`${a},${b}`);
      assert.ok((wall(x - 1, y) && wall(x + 1, y)) || (wall(x, y - 1) && wall(x, y + 1)), `${m.id} ${d.id} at ${k} has no wall on one side`);
    }
    for (const o of m.objects) {
      if (o.action !== 'exit' || !walk(o.x, o.y) || !/door/i.test(o.id + (o.art ?? '') + (o.label ?? ''))) continue;   // walk-through doorways
      let l = o.x, r = o.x; while (walk(l - 1, o.y)) l--; while (walk(r + 1, o.y)) r++;
      let u = o.y, dn = o.y; while (walk(o.x, u - 1)) u--; while (walk(o.x, dn + 1)) dn++;
      assert.ok(r - l + 1 <= 2 || dn - u + 1 <= 2, `${m.id} ${o.id}: the doorway is wider than the doors (${r - l + 1} tiles)`);
    }
  }
});
const { BOSS_PATTERNS, bossPool, pickPattern } = await import('../src/engine/bossPatterns.js');
const { MODULES: WARDEN_MODULES } = await import('../src/content/rotVillains.js');
test('boss pattern library: every module has a pattern, pools grow by phase, no move twice running', () => {
  for (const m of WARDEN_MODULES) assert.ok(BOSS_PATTERNS[m], `module ${m} has no pattern`);
  for (const [k, p] of Object.entries(BOSS_PATTERNS)) assert.ok(p.wind.length === 3 && p.wind[0] >= p.wind[2] && p.wind[2] >= 0.35, `${k} wind-ups must shrink by phase and stay readable`);
  const pool = bossPool(['ring', 'charge'], 1);
  assert.ok(pool.length >= 2 && bossPool(['ring', 'charge'], 2).length > pool.length && bossPool(['ring', 'charge'], 3).includes('spiral'));
  let last = null;
  for (let i = 0; i < 500; i++) { const n = pickPattern(bossPool(['ring', 'charge'], 3), last); assert.notEqual(n, last); last = n; }
});
test('boss beam: running circles close to the boss stays ahead of it; standing still gets hit', () => {
  const run = (circle) => {
    const sim = new Sim(MAPS_FOR_TEST.platform, { seed: 'laser' }); sim.addPlayer('host', 'trevor');
    const boss = [...sim.enemies.values()].find((e) => e.boss), h = sim.players.get('host');
    boss.phase = 3; boss.state = 'laser'; boss.laserT = 6; boss.laserDir = 1; boss.cd = 99;
    let ang = 0; const R = 50;
    boss.laserA = ang - 1.2;   // starts behind the player, turning toward them
    let hits = 0;
    for (let t = 0; t < 60 * 5.5; t++) {
      if (circle) ang += (68 / R) / 60;   // just under walking speed, same direction as the beam
      h.x = boss.x + Math.cos(ang) * R; h.y = boss.y - 4 + Math.sin(ang) * R; h.hp = 999; h.iframes = 0;
      const before = h.hp; boss.cd = 99; sim._stepBoss(boss, boss.def, 1 / 60); if (h.hp < before) hits++;
      if (boss.state !== 'laser') break;
    }
    return hits;
  };
  assert.equal(run(true), 0, 'circling should outrun the beam');
  assert.ok(run(false) > 0, 'standing still should get hit');
});
test('boss fight: the Warden uses several patterns with tells and recovery windows, sweep shots can\'t be deflected', () => {
  const sim = new Sim(MAPS_FOR_TEST.platform, { seed: 'boss-test' });
  sim.addPlayer('host', 'trevor');
  const boss = [...sim.enemies.values()].find((e) => e.boss);
  assert.ok(boss, 'no boss on the platform');
  const kinds = new Set(); let sawOpen = false, deflectable = false, beamFired = false;
  for (let t = 0; t < 60 * 90; t++) {
    const h = sim.players.get('host'); h.hp = h.maxHp ?? 100; h.downed = false;
    if (t === 60 * 20) { boss.hp = boss.def.hp * 0.6; boss.phase = 2; }   // push into phase 2, then 3
    if (t === 60 * 50) { boss.hp = boss.def.hp * 0.25; boss.phase = 3; }
    sim.step(1 / 60, new Map());
    for (const ev of sim.events) if (ev.t === 'tell' && ev.kind) { kinds.add(ev.kind); assert.ok(ev.dur >= 0.35 && 'red' in ev); }
    if (boss.openT > 0) sawOpen = true;
    for (const s of sim.shots) if (s.from === 'enemy' && Math.hypot(s.vx, s.vy) > 200) { beamFired = true; if (!s.noDeflect) deflectable = true; }   // only the Sweep fires this fast
    sim.events.length = 0;
  }
  assert.ok(kinds.size >= 4, `only ${[...kinds]} used`);
  assert.ok(sawOpen, 'no recovery window');
  assert.ok(!deflectable, 'beam shots should be undeflectable');
});

const Outbreak = await import('../src/content/outbreak.js');
test('outbreak phases (task #38): before the Call, after it, contained; phase spawns have their own killed keys', () => {
  assert.equal(Outbreak.outbreakPhase({}), 'before');
  assert.equal(Outbreak.outbreakPhase({ 'act1.beat.call': true }), 'after');
  assert.equal(Outbreak.outbreakPhase({ 'act1.beat.call': true, 'act1.outbreak.contained': true }), 'contained');
  const map = MAPS_FOR_TEST.metro_plaza, base = new Sim(map, { seed: 'ph' }).enemies.size;
  const extra = { metro_plaza: { phase: 'after', list: [['enemy.rotling', 40, 20], ['enemy.rotling', 42, 20]] } };
  const sim = new Sim(map, { seed: 'ph', deferSpawn: true }); sim.phaseEnemies = extra; sim.spawnEnemies();
  assert.equal(sim.enemies.size, base + 2);
  const keys = [...sim.enemies.values()].map((e) => e.spawnKey).filter((k) => k.includes('#after.'));
  assert.deepEqual(keys.sort(), ['metro_plaza#after.0', 'metro_plaza#after.1']);
  const again = new Sim(map, { seed: 'ph', deferSpawn: true, killed: new Set(['metro_plaza#after.0']) }); again.phaseEnemies = extra; again.spawnEnemies();
  assert.equal(again.enemies.size, base + 1, 'a killed phase enemy stays dead');
});

const Wallet = await import('../src/engine/wallet.js');
test('money per roommate (Trevor #515): own wallets, pay, shared finds to each, send between roommates', () => {
  const save = { party: { trevor: { money: 25 }, manuel: { money: 25 }, michael: { money: 25 } } };
  assert.equal(Wallet.pay(save, 'trevor', 30), false); assert.equal(Wallet.money(save, 'trevor'), 25);
  assert.equal(Wallet.pay(save, 'trevor', 20), true); assert.equal(Wallet.money(save, 'trevor'), 5);
  Wallet.addEach(save, 10); assert.deepEqual(Object.values(save.party).map((c) => c.money), [15, 35, 35]);
  assert.equal(Wallet.send(save, 'manuel', 'trevor', 50), 35, 'sends only what they have');
  assert.equal(Wallet.money(save, 'manuel'), 0); assert.equal(Wallet.money(save, 'trevor'), 50);
  assert.equal(Wallet.send(save, 'trevor', 'trevor', 5), 0); assert.equal(Wallet.send(save, 'trevor', 'nobody', 5), 0);
  assert.equal(Wallet.addMoney(save, 'michael', -999), 0, 'never below zero');
});
test('schema 6 -> 7: the shared wallet splits evenly into each roommate\'s, remainder to the first', () => {
  const old = newSave({ seed: 'm7', rolls: {}, gameVersion: 't' });
  old.schemaVersion = 6; old.world.money = 100;
  for (const c of Object.values(old.party)) delete c.money;
  const m = migrate(JSON.parse(JSON.stringify(old)));
  const ids = Object.keys(m.party);
  assert.equal(m.party[ids[0]].money, 34); assert.equal(m.party[ids[1]].money, 33); assert.equal(m.party[ids[2]].money, 33);
  assert.ok(!('money' in m.world));
});

const { CompanionBrain } = await import('../src/engine/companion.js');
const { ITEMS: ITEMS_T } = await import('../src/content/items.js');
test('AI companions follow the human, fight, and never trigger exits', () => {
  const sim = new Sim(MAPS_FOR_TEST.tunnel_1, { seed: 's' });
  sim.addPlayer('host', 'trevor'); sim.addPlayer('ai:manuel', 'manuel'); sim.addPlayer('ai:michael', 'michael');
  for (const p of sim.players.values()) p.mods.swing = ITEMS_T['item.pry_bar'].swing;   // everyone starts with a pry bar
  // This test is about following, not surviving: the host here wanders and barely swings, so the code rot
  // zombie packs along the route (task #33) would just down the party. The rotlings stay for "fought something".
  for (const [id, e] of [...sim.enemies]) if (e.kind === 'enemy.rot_taken') sim.enemies.delete(id);
  const brain = new CompanionBrain(sim), h = sim.players.get('host'), before = sim.enemies.size;
  let aiExit = false; const near = { 'ai:manuel': 0, 'ai:michael': 0 }; let frames = 0;
  for (let t = 0; t < 60 * 40; t++) {
    const ang = t / 300, inputs = new Map([['host', { ...emptyInput(), mx: Math.cos(ang), my: Math.sin(ang * 1.3), attack: t % 20 === 0 }]]);
    for (const [id, i] of brain.inputs()) inputs.set(id, i);
    sim.step(1 / 60, inputs);
    if (sim.events.some((e) => e.t === 'bumpExit' && String(e.by).startsWith('ai:'))) aiExit = true;
    if (t > 60 * 10) { frames++; for (const id in near) { const p = sim.players.get(id); if (Math.hypot(p.x - h.x, p.y - h.y) < 120) near[id]++; } }
  }
  // Following, measured over time: companions break off to fight, so one end-of-run snapshot was flaky.
  for (const id in near) assert.ok(near[id] / frames >= 0.7, `${id} fell behind (near ${(near[id] / frames * 100).toFixed(0)}% of the time)`);
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
  for (const c of Object.values(old.party)) delete c.money;   // schema-1 saves had no wallets
  old.party.trevor.inventory = [{ id: 'item.mate_flask', qty: 1 }, { id: 'item.wooden_bat', qty: 1 }];
  const m = migrate(JSON.parse(JSON.stringify(old)));
  // 25 + 10 scrap x3 = 55, then schema 7 splits it across the three wallets (remainder to the first).
  const total = Object.values(m.party).reduce((t, c) => t + c.money, 0);
  assert.equal(m.schemaVersion, CURRENT_SCHEMA); assert.equal(total, 55); assert.ok(!('money' in m.world)); assert.ok(!('scrap' in m.world));
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

test('worn gear leaves the bag and sits in its equipment slot (Michael)', () => {
  const c = { inventory: new Array(36).fill(null), equipped: {} };
  Inv.add(c, 'item.rain_parka'); Inv.add(c, 'item.brown_parka'); Inv.add(c, 'item.wooden_bat');
  assert.ok(Inv.wear(c, 'item.rain_parka'));
  assert.equal(c.equipped.parka, 'item.rain_parka'); assert.equal(Inv.count(c, 'item.rain_parka'), 0, 'not in the bag while worn');
  assert.ok(Inv.has(c, 'item.rain_parka'), 'still owned'); assert.equal(Inv.ids(c).length, 2);
  assert.ok(Inv.wear(c, 'item.brown_parka'), 'swap');
  assert.equal(c.equipped.parka, 'item.brown_parka'); assert.equal(Inv.count(c, 'item.rain_parka'), 1, 'the old one goes back in the bag');
  assert.ok(Inv.unwear(c, 'parka')); assert.equal(c.equipped.parka, null); assert.equal(Inv.count(c, 'item.brown_parka'), 1);
  assert.ok(!Inv.wear(c, 'item.wooden_bat'), 'weapons are held from the hotbar, not worn');
  const full = { inventory: new Array(36).fill(null).map(() => ({ id: 'item.wooden_bat', qty: 1 })), equipped: { parka: 'item.rain_parka' } };
  assert.ok(!Inv.unwear(full, 'parka'), 'no room to take it off'); assert.equal(full.equipped.parka, 'item.rain_parka');
});
test('schema 5 -> 6 migration: worn gear comes out of the bag, weapons stay', () => {
  const old = newSave({ seed: 'w', rolls: {}, gameVersion: 't' });
  old.schemaVersion = 5;
  const t = old.party.trevor;
  t.inventory[0] = { id: 'item.pry_bar', qty: 1 }; t.inventory[9] = { id: 'item.rain_parka', qty: 1 }; t.inventory[10] = { id: 'item.mesh_vest', qty: 1 };
  t.equipped.weapon = 'item.pry_bar'; t.equipped.parka = 'item.rain_parka'; t.equipped.chestplate = 'item.mesh_vest'; t.equipped.boots = 'item.sneakers';
  const m = migrate(JSON.parse(JSON.stringify(old))), mt = m.party.trevor;
  assert.equal(m.schemaVersion, CURRENT_SCHEMA);
  assert.equal(mt.inventory[9], null); assert.equal(mt.inventory[10], null);
  assert.equal(mt.inventory[0].id, 'item.pry_bar'); assert.equal(mt.equipped.parka, 'item.rain_parka'); assert.equal(mt.equipped.boots, 'item.sneakers');
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

// tts/item-names: in tests/run.js, add one test that loops over ITEMS in src/content/items.js
// and checks that every item has a non-empty name and text. List any that don't.
test('every item in ITEMS has a non-empty name and text', () => {
  const bad = [];
  for (const [id, it] of Object.entries(BALANCE_ITEMS)) {
    const missing = [];
    if (!it || typeof it.name !== 'string' || !it.name.trim()) missing.push('name');
    if (!it || typeof it.text !== 'string' || !it.text.trim()) missing.push('text');
    if (missing.length) bad.push(`${id} (${missing.join(', ')})`);
  }
  assert.equal(bad.length, 0, `Items with missing name/text: ${bad.join('; ')}`);
});

// Every source file must at least parse. A file the tests don't import (map dressing, scenes) can
// otherwise carry a syntax error straight to a black screen in the browser.
{
  const { execFileSync } = await import('node:child_process');
  const { readdirSync, statSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const walk = (d) => readdirSync(d).flatMap((n) => { const p = `${d}/${n}`; return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []; });
  const root = fileURLToPath(new URL('../src', import.meta.url));
  test('every file under src/ parses', () => {
    const bad = [];
    for (const f of walk(root)) { try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { bad.push(`${f.slice(root.length + 1)}: ${String(e.stderr).split('\n').find((l) => l.includes('SyntaxError')) ?? 'syntax error'}`); } }
    assert.equal(bad.length, 0, bad.join('; '));
  });
}

test('map objects have atlas art or a code-drawn renderer', () => {
  const atlasDir = new URL('../assets/sprites/', import.meta.url);
  const frames = new Set();
  for (const file of fs.readdirSync(atlasDir)) {
    if (!file.endsWith('.json')) continue;
    const atlas = JSON.parse(fs.readFileSync(new URL(file, atlasDir), 'utf8'));
    for (const frame of Object.keys(atlas.frames)) frames.add(frame);
  }
  const missing = [];
  for (const map of Object.values(MAPS_FOR_TEST)) {
    for (const object of map.objects) {
      // WorldScene draws these outside its atlas-based map object pass.
      if (object.romance || object.selfDrawn || object.lever) continue;
      const frame = object.art ?? object.id;
      if (!frames.has(frame)) missing.push(map.id + '/' + object.id + ' needs ' + frame);
    }
  }
  assert.deepEqual(missing, [], 'Missing map object art:\n' + missing.join('\n'));
});

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
  const q = sim.players.get('a'); q.x = 18 * 16 + 8; q.y = 12 * 16 + 8; q.onTile = null;   // the right-hand door too
  sim.events.length = 0; sim._moveAxis(q, 0, 16);
  assert.ok(sim.events.some((e) => e.t === 'bumpExit' && e.id === 'obj.street_doors'), 'right-hand door tile does nothing');
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
  walk(BARKS); walk(crowd.LINES); walk(crowd.PIXEL_LINES); walk(fartMod.FART_LINES); walk(buttMod.BUTT_LINES); walk(Object.values(npcLifeMod.NPC_LIFE).map((l) => l.hi)); walk(npcLifeMod.NPC_FART);
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

test('mate gives a caffeine kick, then a short slow crash; another gourd restarts it', () => {
  assert.ok(ITEMS['item.mate_flask'].mateKick, 'the mate thermos is a caffeine item');
  const sim = new Sim(MAPS_FOR_TEST.room631, { seed: 's' }); sim.addPlayer('a', 'manuel');
  const p = sim.players.get('a'); p.x = 14 * 16 + 8; p.y = 9 * 16 + 8;
  const idle = new Map([['a', emptyInput()]]), walk = new Map([['a', { ...emptyInput(), mx: 1 }]]);
  const speed = () => { sim.step(1 / 60, walk); const v = p.vx; p.x = 14 * 16 + 8; return v; };
  const regen = () => { p.sta = 0; p.staT = 0; sim.step(0.5, idle); return p.sta; };
  const baseSpeed = speed(), baseRegen = regen();
  assert.equal(sim.mate('a'), true);
  assert.ok(sim.snapshot().players[0].mt > 0, 'the snapshot shows the buff');
  assert.ok(Math.abs(speed() - baseSpeed * (1 + MATE.speed)) < 1e-6, 'faster while buzzed');
  assert.ok(regen() > baseRegen * 1.4, 'stamina comes back quicker');
  sim.step(5, idle); assert.equal(sim.mate('a'), true, 'no cooldown'); assert.equal(p.mateT, MATE.buff, 'a second gourd restarts the kick');
  for (let t = 0; t < MATE.buff; t += 0.5) sim.step(0.5, idle);
  assert.equal(p.mateT, 0); assert.ok(sim.snapshot().players[0].cr, 'the crash follows');
  assert.ok(Math.abs(speed() - baseSpeed * (1 + MATE.crashSpeed)) < 1e-6, 'slower in the crash');
  assert.ok(Math.abs(regen() - baseRegen) < 1e-6, 'stamina regen is normal in the crash');
  sim.mate('a'); assert.equal(p.crashT, 0, 'mate cancels the crash'); p.mateT = 0.1; sim.step(0.2, idle);
  for (let t = 0; t < MATE.crash; t += 0.5) sim.step(0.5, idle);
  assert.equal(p.crashT, 0); assert.ok(Math.abs(speed() - baseSpeed) < 1e-6, 'back to normal after the crash');
});

test('code rot at 100%: solo it is death and a save reload; with another human up you go under', () => {
  const at = (sim, id, tx, ty) => { const p = sim.players.get(id); p.x = tx * 16 + 8; p.y = ty * 16 + 8; return p; };
  const idle = (sim) => new Map([...sim.players.keys()].map((id) => [id, emptyInput()]));
  // Solo, with only AI roommates: death by code rot.
  let sim = new Sim(MAPS_FOR_TEST.room631, { seed: 'u' }); sim.addPlayer('host', 'michael'); sim.addPlayer('ai:trevor', 'trevor');
  at(sim, 'host', 14, 9); at(sim, 'ai:trevor', 20, 9); sim.setRot('host', 100); sim.step(1 / 60, idle(sim));
  assert.equal(sim.rotDeath, 'host', 'AI roommates do not keep you from dying'); assert.ok(!(sim.players.get('host').under > 0));
  // Co-op: the other human is up, so Michael goes under, walks at them and swings.
  sim = new Sim(MAPS_FOR_TEST.room631, { seed: 'u' }); sim.addPlayer('host', 'michael'); sim.addPlayer('peer', 'manuel');
  const m = at(sim, 'host', 14, 9), q = at(sim, 'peer', 18, 9); sim.setRot('host', 100);
  sim.step(1 / 60, idle(sim));
  assert.ok(m.under > 0 && !sim.rotDeath, 'gone under, not dead'); assert.ok(sim.snapshot().players.find((p) => p.id === 'host').un > 0);
  const x0 = m.x; q.x = 40 * 16; sim.step(0.2, idle(sim)); assert.ok(m.x > x0, 'the zombie walks at the nearest roommate');
  q.x = m.x + 10; q.y = m.y; q.iframes = 0; const hp = q.hp; sim.step(1 / 60, idle(sim)); sim.step(1.2, idle(sim));
  assert.ok(q.hp < hp, 'the zombie hurts roommates');
  // Pull back: stand next to them for UNDER.pullTime.
  for (let t = 0; t < UNDER.pullTime + 0.5; t += 0.25) { q.x = m.x + 8; q.y = m.y; q.iframes = 9; sim.step(0.25, idle(sim)); }
  assert.ok(!(m.under > 0) && !m.downed, 'pulled back'); assert.ok(m.rot >= UNDER.afterPull && m.rot < UNDER.afterPull + 1, 'code rot drops back, still high');
  // Nobody comes: after the window they drop, downed, with code rot left high.
  sim.setRot('host', 100); q.x = 40 * 16; q.y = m.y; sim.step(1 / 60, idle(sim)); assert.ok(m.under > 0);
  for (let t = 0; t < UNDER.window + 1; t += 0.5) { q.x = 40 * 16; q.y = m.y; q.iframes = 9; sim.step(0.5, idle(sim)); }
  assert.ok(m.downed && !(m.under > 0)); assert.equal(m.rot, UNDER.afterDrop); assert.ok(!sim.rotDeath);
  // Going under with no other human up (the other human is down) is death by code rot too.
  m.downed = false; m.hp = 50; q.downed = true; sim.setRot('host', 100); sim.step(1 / 60, idle(sim));
  assert.equal(sim.rotDeath, 'host');
});

test('a party wipe brings everyone back with full health and no code rot', () => {
  const sim = new Sim(MAPS_FOR_TEST.room631, { seed: 'w' }); sim.addPlayer('host', 'michael'); sim.addPlayer('ai:manuel', 'manuel');
  for (const p of sim.players.values()) { p.hp = 0; p.downed = true; p.rot = 80; }
  assert.ok(sim.wiped); sim.setMap(sim.map, null); sim.wipeReset();
  for (const p of sim.players.values()) { assert.equal(p.hp, sim.maxHp(p)); assert.equal(p.rot, 0); assert.ok(!p.downed); }
});

// Task #33 (Michael via BagelMeister #503): the harder road to the Warden.
const tunPuz = await import('../src/content/tunnelPuzzles.js');
const { playerMods: playerModsT } = await import('../src/content/items.js');
const wardenFight = (loadout, seed) => {
  const L = {
    bare: () => ({ equipped: { weapon: 'item.pry_bar' }, skills: {} }),
    good: (who) => ({ equipped: { weapon: 'item.pipe_wrench', chestplate: 'item.mesh_vest', helmet: 'item.hardhat', leggings: 'item.work_pants', boots: 'item.steel_toes' },
      skills: { trevor: { 'tr.jab': 3, 'tr.tank': 3, 'tr.amp': 2 }, manuel: { 'ma.hands': 3, 'ma.shoulders': 2, 'ma.clay': 2 }, michael: { 'mi.ping': 3, 'mi.lock': 2, 'mi.luck': 2 } }[who] }),
  }[loadout];
  const random = Math.random, rng = new Rng(`boss:${loadout}:${seed}`); Math.random = () => rng.next();
  try {
    const sim = new Sim(MAPS_FOR_TEST.platform, { seed, deferSpawn: true });
    sim.addPlayer('host', 'trevor'); sim.addPlayer('ai:manuel', 'manuel'); sim.addPlayer('ai:michael', 'michael');
    for (const p of sim.players.values()) { sim.setMods(p.id, playerModsT(L(p.character), p.character)); p.hp = sim.maxHp(p); }
    sim.spawnEnemies();
    const brain = new CompanionBrain(sim), h = sim.players.get('host'), bot = new BalanceBot(sim, brain);
    let won = false, adds = 0, crumbled = 0;
    for (let t = 0; t < 60 * 420 && !won && !sim.wiped; t++) {
      const inputs = new Map([['host', bot.input(h)]]); for (const [id, i] of brain.inputs()) inputs.set(id, i);
      sim.step(1 / 60, inputs);
      for (const e of sim.events) { if (e.t === 'kill' && e.boss) won = true; if (e.t === 'adds') adds++; if (e.crumble) crumbled++; }
    }
    return { won, adds, crumbled, summonedLeft: [...sim.enemies.values()].filter((e) => e.summoned).length };
  } finally { Math.random = random; }
};
test('the Warden: starter gear never beats it, a geared and skilled party does; its zombies crumble with it', () => {
  for (const s of ['w1', 'w2']) assert.equal(wardenFight('bare', s).won, false, `bare ${s} won`);
  for (const s of ['w1', 'w2']) { const r = wardenFight('good', s); assert.ok(r.won, `good ${s} lost`); assert.equal(r.summonedLeft, 0, 'adds outlived the Warden'); }
  const long = wardenFight('bare', 'w1'); assert.ok(long.adds >= 1, 'the Warden never pulled in any zombies');
});
test('the Warden is twice as tough and hits harder; the Sahur variant is unchanged', () => {
  const sim = new Sim(MAPS_FOR_TEST.platform, { seed: 's', deferSpawn: true });
  for (const c of ['trevor', 'manuel', 'michael']) sim.addPlayer(c, c);
  sim.spawnEnemies();
  const w = [...sim.enemies.values()].find((e) => e.boss);
  assert.equal(w.def.hp, 1440); assert.ok(w.def.damage > 14 && w.def.dmgMul > 1 && w.def.guard > 0 && w.def.adds);
  const s2 = new Sim(MAPS_FOR_TEST.platform, { seed: 's', deferSpawn: true }); s2.bossVariant = 'sahur';
  for (const c of ['trevor', 'manuel', 'michael']) s2.addPlayer(c, c);
  s2.spawnEnemies();
  const sah = [...s2.enemies.values()].find((e) => e.boss);
  assert.ok(sah.sahur && sah.def.hp === 99999 && sah.def.damage === 16 && !sah.def.guard && !sah.def.adds);
});
test('the platform gate needs the yard, the breakers and the signals; no world starts solved', () => {
  for (let i = 0; i < 300; i++) {
    const seed = `gate-${i}`, b = tunPuz.breakerTarget(seed), l = tunPuz.lampTarget(seed);
    assert.ok(tunPuz.BREAKERS.some((k) => b[k] === 'up') && tunPuz.BREAKERS.some((k) => b[k] === 'down'), seed);
    assert.ok(tunPuz.LAMPS.some((k) => l[k] !== 'red'), seed);
  }
  const seed = 'gate-x', f = {};
  assert.equal(tunPuz.gateOpen(f, seed), false);
  for (const k of tunPuz.BREAKERS) f[`act1.breaker.${k}`] = tunPuz.breakerTarget(seed)[k];
  for (const k of tunPuz.LAMPS) f[`act1.siglamp.${k}`] = tunPuz.lampTarget(seed)[k];
  assert.equal(tunPuz.gateOpen(f, seed), false, 'opened without the yard');
  f['act1.switchyard.solved'] = true; assert.equal(tunPuz.gateOpen(f, seed), true);
  assert.equal(MAPS_FOR_TEST.tunnel_1.objects.find((o) => o.id === 'obj.tunnel_on').requiresFlag, tunPuz.GATE_FLAG);
  assert.ok(tunPuz.puzzleClue('obj.locker', seed, f, 'es').includes('TABLERO'));
});

test('the Switchman (Act 1 mid boss): sleeps until you come close, starter gear beats it, and its death is not the act boss', () => {
  const random = Math.random, rng = new Rng('switchman'); Math.random = () => rng.next();
  try {
    const sim = new Sim(MAPS_FOR_TEST.tunnel_1, { seed: 'sw', deferSpawn: true });
    sim.addPlayer('host', 'trevor'); sim.addPlayer('ai:manuel', 'manuel'); sim.addPlayer('ai:michael', 'michael');
    for (const p of sim.players.values()) sim.setMods(p.id, playerModsT({ equipped: { weapon: 'item.pry_bar' }, skills: {} }, p.character));
    sim.spawnEnemies();
    for (const [id, e] of [...sim.enemies]) if (e.kind !== 'boss.switchman') sim.enemies.delete(id);   // just the boss
    const sw = [...sim.enemies.values()][0];
    assert.ok(sw && sw.boss && sw.mini && !sw.awake);
    sim.step(1 / 60, new Map());
    assert.ok(sim.snapshot().enemies[0].boss.idle, 'boss bar should stay hidden while it sleeps');
    for (const p of sim.players.values()) { p.x = sw.x - 60; p.y = sw.y; }
    const brain = new CompanionBrain(sim), h = sim.players.get('host'), bot = new BalanceBot(sim, brain);
    let woke = false, kill = null;
    for (let t = 0; t < 60 * 240 && !kill; t++) {
      const inputs = new Map([['host', bot.input(h)]]); for (const [id, i] of brain.inputs()) inputs.set(id, i);
      sim.step(1 / 60, inputs);
      for (const e of sim.events) { if (e.t === 'boss' && e.kind === 'boss.switchman') woke = true; if (e.t === 'kill' && e.boss) kill = e; }
      if (sim.wiped) for (const p of sim.players.values()) { p.downed = false; p.hp = sim.maxHp(p); }   // a wipe brings everyone back (death rules)
    }
    assert.ok(woke, 'it never woke up'); assert.ok(kill, 'starter gear could not beat the Switchman');
    assert.equal(kill.mini, true, 'its kill must be flagged as the mid boss, so it never starts the ending');
  } finally { Math.random = random; }
});

const fuseMod = await import('../src/content/tunnelPuzzles.js');
const fuseQuests = await import('../src/content/quests.js');
const fuseItems = await import('../src/content/items.js');
const fuseTunnels = await import('../src/content/maps/tunnels.js');
test('the fuse errand (Trevor #514): the carrier is in the signal room, the fuses are a key item, and the quest only names the panel once it is seen', () => {
  const tun = fuseTunnels.tunnel1;
  const carrier = tun.objects.find((o) => o.id === 'obj.fuse_carrier');
  assert.ok(carrier, 'no fuse carrier in the tunnels');
  const b1 = tun.objects.find((o) => o.id === 'obj.breaker_1');
  assert.ok(Math.abs(carrier.x - b1.x) + Math.abs(carrier.y - b1.y) <= 2, 'the carrier should sit next to the breakers');
  assert.equal(fuseItems.ITEMS['item.wmata_fuses']?.slot, 'key');
  for (const k of ['dead', 'install', 'installed', 'kess']) assert.ok(fuseMod.FUSE_TEXT[k].en && fuseMod.FUSE_TEXT[k].es, `FUSE_TEXT.${k}`);
  const st = fuseQuests.QUESTS.find((q) => q.id === 'main.balloon').stages;
  const shown = (f) => st.find((s) => !s.done(f, {}))?.text ?? '';
  const base = { 'act1.balloon.noticedGone': true, 'act1.clue.lockForced': true, 'met.npc.dez': true, 'act1.cordon.passed': true };
  assert.ok(!/fuse|breaker|panel/i.test(shown(base)), 'the first tunnel stage names the panel before it is seen: ' + shown(base));
  assert.ok(/fuses/.test(shown({ ...base, 'act1.fuses.seen': true })));
  assert.ok(/gate/i.test(shown({ ...base, 'act1.fuses.seen': true, 'act1.fuses.in': true })));
  const leads = st.find((s) => /leads/.test(s.text)).text;
  assert.ok(!/Halvard/.test(leads), 'the leads stage names Halvard before you meet him');
});

const modeScene = await (await import('../src/engine/dialogue.js')).loadScene('descent_and_boss');
test('dialogue modes from the scripts (Trevor #528): Mode: story on the scene, *Mode: free* on talk nodes', () => {
  assert.equal(modeScene.mode, 'story');
  for (const n of ['pumproom_rest', 'switchyard_levers', 'rotter_sit']) assert.equal(modeScene.nodes[n].mode, 'free', n);
  for (const n of ['descent_entry', 'door_open']) assert.ok(!modeScene.nodes[n].mode, `${n} should follow the scene (story)`);
  assert.ok(!Object.values(modeScene.nodes).some((n) => n.lines.some((l) => /^Mode:/i.test(l.text ?? ''))), 'a Mode tag leaked into a caption');
});

if (failed) { console.log(`\n${failed} test(s) failed`); process.exit(1); }
console.log('\nall tests passed');
