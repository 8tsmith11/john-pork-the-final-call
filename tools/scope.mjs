// Scope counter (docs/design/10-scope.md): what the game has today against the per-act targets.
// Usage: node tools/scope.mjs. Maps without an `act` field count as Act 1 (everything built so far).
import { MAPS } from '../src/content/maps/index.js';
import { QUESTS } from '../src/content/quests.js';

const TARGET = {
  1: { areas: 10, npcs: 25, bosses: 3, side: 15 },
  2: { areas: 14, npcs: 35, bosses: 4, side: 25 },
  3: { areas: 10, npcs: 25, bosses: 4, side: 20 },
};

const have = { 1: { areas: 0, npcs: 0, bosses: 0, side: 0 }, 2: { areas: 0, npcs: 0, bosses: 0, side: 0 }, 3: { areas: 0, npcs: 0, bosses: 0, side: 0 } };
const seenNpc = new Set();
for (const m of Object.values(MAPS)) {
  const a = have[m.act ?? 1]; if (!a) continue;
  a.areas++;
  for (const o of m.objects) if (o.npc && !seenNpc.has(o.id)) { seenNpc.add(o.id); a.npcs++; }
  a.bosses += (m.enemies ?? []).filter((e) => String(e.kind).startsWith('boss.')).length;
}
for (const q of QUESTS) { const a = have[q.act ?? 1]; if (a && !q.main) a.side++; }

const bar = (n, t) => `${String(n).padStart(3)} / ${String(t).padEnd(3)} ${'#'.repeat(Math.min(20, Math.round((n / t) * 20))).padEnd(20, '.')}`;
for (const act of [1, 2, 3]) {
  console.log(`Act ${act}`);
  for (const k of ['areas', 'npcs', 'bosses', 'side']) console.log(`  ${k.padEnd(7)} ${bar(have[act][k], TARGET[act][k])}`);
}
