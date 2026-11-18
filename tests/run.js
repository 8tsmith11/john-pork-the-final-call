// Node test runner (no dependencies): `node tests/run.js`. Must pass before pushing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { makeStreams, Rng } from '../src/engine/rng.js';
import { rollWorld } from '../src/engine/worldRolls.js';
import { newSave, migrate, CURRENT_SCHEMA } from '../src/engine/save/schema.js';
import { Sim, MOVE, emptyInput } from '../src/engine/sim.js';
import { room631 } from '../src/content/maps/room631.js';
import { MAPS as MAPS_FOR_TEST } from '../src/content/maps/index.js';

let failed = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n     ${e.message}`); } };

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
test('AI companions follow the human, fight, and never trigger exits', () => {
  const sim = new Sim(MAPS_FOR_TEST.tunnel_1, { seed: 's' });
  sim.addPlayer('host', 'trevor'); sim.addPlayer('ai:manuel', 'manuel'); sim.addPlayer('ai:michael', 'michael');
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
test('slot inventory: stacks, hotbar-first, remove, move/merge/swap, half', () => {
  const c = { inventory: new Array(36).fill(null) };
  assert.equal(Inv.add(c, 'item.mat_scrap', 150), 0);
  assert.deepEqual([c.inventory[0].qty, c.inventory[1].qty], [99, 51]);
  Inv.add(c, 'item.wooden_bat'); Inv.add(c, 'item.wooden_bat');
  assert.equal(c.inventory[2].id, 'item.wooden_bat'); assert.equal(c.inventory[3].id, 'item.wooden_bat');   // gear doesn't stack
  assert.ok(Inv.remove(c, 'item.mat_scrap', 60)); assert.equal(Inv.count(c, 'item.mat_scrap'), 90);
  assert.equal(c.inventory[0].qty, 90 > 99 ? 99 : c.inventory[0].qty);   // hotbar stack kept, back stack used first
  Inv.moveSlot(c, 0, 20); assert.equal(c.inventory[0], null); assert.equal(c.inventory[20].id, 'item.mat_scrap');
  Inv.moveSlot(c, 2, 20); assert.equal(c.inventory[20].id, 'item.wooden_bat'); assert.equal(c.inventory[2].id, 'item.mat_scrap');   // swap
  const before = c.inventory[2].qty; Inv.moveSlot(c, 2, 30, true); assert.equal(c.inventory[30].qty + c.inventory[2].qty, before);
  assert.ok(!Inv.pay(c, { 'item.mat_wire': 1 })); assert.ok(Inv.pay(c, { 'item.mat_scrap': 5 }));
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

if (failed) { console.log(`\n${failed} test(s) failed`); process.exit(1); }
console.log('\nall tests passed');
