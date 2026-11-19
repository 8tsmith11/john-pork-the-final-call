// Headless balance probe: a combat-aware scripted human, with or without two AI companions.
// Usage: node tools/balance.mjs "$PWD" [--legacy] (old chase/swing policy for comparison).
// Both policies use seeded randomness. This skilled script is not an average-human playtest.
import { formatBalanceGroup } from './balance-summary.mjs';
import { BalanceBot, countHostMoves, newMoveCounts } from './balance-bot.mjs';
const root = process.argv[2];
const legacy = process.argv.includes('--legacy');
const rules = await import(root + '/src/engine/sim.js');
const { Sim } = rules;
const { Rng } = await import(root + '/src/engine/rng.js');
const { CompanionBrain } = await import(root + '/src/engine/companion.js');
const { MAPS } = await import(root + '/src/content/maps/index.js');
const { playerMods } = await import(root + '/src/content/items.js');

function run(mapId, solo, gear, seed) {
  // Includes Math.random calls in the sim/companion brain; restore it even if a case fails.
  const random = Math.random, rng = new Rng(`balance:${mapId}:${solo}:${gear}:${seed}`);
  Math.random = () => rng.next();
  try { return runSeed(mapId, solo, gear, seed); }
  finally { Math.random = random; }
}

function runSeed(mapId, solo, gear, seed) {
  const sim = new Sim(MAPS[mapId], { seed });
  sim.addPlayer('host', 'trevor');
  if (!solo) { sim.addPlayer('ai:manuel', 'manuel'); sim.addPlayer('ai:michael', 'michael'); }
  // 'bare' = the starter pry bar everyone owns (nobody fights unarmed any more).
  const char = { equipped: gear ? { weapon: 'item.wooden_bat', armor: 'item.mesh_vest' } : { weapon: 'item.pry_bar' }, skills: {} };
  for (const p of sim.players.values()) sim.setMods(p.id, playerMods(char, p.character));
  const brain = new CompanionBrain(sim), h = sim.players.get('host');
  const bot = new BalanceBot(sim, brain, { legacy, rules }), moves = newMoveCounts();
  const start = sim.enemies.size; let downs = 0, wipes = 0, dmg = 0, t = 0;
  for (; t < 60 * 600 && sim.enemies.size > 0; t++) {
    const inp = bot.input(h), previousDodge = h.dodgeStamp;
    const inputs = new Map([['host', inp]]);
    for (const [id, i] of brain.inputs()) inputs.set(id, i);
    sim.step(1 / 60, inputs);
    if (h.dodgeStamp !== previousDodge) moves.rolls++;
    countHostMoves(moves, sim.events, h.id);
    for (const e of sim.events) { if (e.t === 'down') downs++; if (e.t === 'hurt') dmg += e.dmg; }
    if (sim.wiped) { wipes++; for (const p of sim.players.values()) { p.downed = false; p.hp = 60; } }
  }
  const stalled = sim.enemies.size > 0 ? {
    player: { hp: h.hp, exposure: Math.round(h.rot ?? 0), asleep: (h.sleepT ?? 0) > 0 },
    enemies: [...sim.enemies.values()].map((e) => ({ kind: e.kind, hp: e.hp })),
  } : null;
  return { mapId, solo, gear, seed, secs: Math.round(t / 60), killed: start - sim.enemies.size, of: start, downs, wipes, dmg, moves, stalled };
}
console.log(`Controller: ${legacy ? 'legacy chase/swing' : 'combat-aware, 100ms decisions'}; seeded cases; move counts are host-only.`);
for (const mapId of ['tunnel_1', 'lake']) for (const solo of [false, true]) for (const gear of [false, true]) {
  const rs = [1, 2, 3].map((k) => run(mapId, solo, gear, 'bal' + k));
  for (const line of formatBalanceGroup(rs)) console.log(line);
  console.log('  host moves total: ' + Object.keys(rs[0].moves).map((k) => `${k} ${rs.reduce((n, r) => n + r.moves[k], 0)}`).join(', '));
  for (const r of rs) if (r.stalled) console.log(`  ${r.seed} stalled state: ${JSON.stringify(r.stalled)}`);
}
