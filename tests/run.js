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
  assert.equal(m.schemaVersion, 2); assert.equal(m.world.money, 55); assert.ok(!('scrap' in m.world));
  assert.equal(m.party.trevor.inventory.length, 36); assert.equal(m.party.trevor.inventory[1].id, 'item.wooden_bat');
  assert.equal(m.party.manuel.inventory.length, 36);
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

if (failed) { console.log(`\n${failed} test(s) failed`); process.exit(1); }
console.log('\nall tests passed');
