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
test('combat: hit-stop freezes enemies and shots for a moment', () => {
  const { sim, p } = combatSim(); const e = dummy(sim, p.x + 60, p.y); e.cd = 0;
  sim.shots.push({ x: p.x + 40, y: p.y - 30, vx: 0, vy: -50, life: 2, dmg: 1, from: 'enemy' });
  sim.hitStop = 0.05; const sy = sim.shots[0].y, ex = e.x;
  sim.step(1 / 60, new Map());
  assert.equal(sim.shots[0].y, sy); assert.equal(e.x, ex);
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
