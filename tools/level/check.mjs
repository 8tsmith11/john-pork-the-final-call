// Check maps for the usual level-design mistakes (docs/design/11-level-builder.md).
// Usage: node tools/level/check.mjs [mapId ...]     (no args: every map). Exit code 1 if anything fails.
// Checks: everything reachable from the spawn; doors have wall on both sides; nothing interactable sits on a
// solid tile it can't be reached from; unique object ids; exits lead to known maps; "[scaffold]" text left.
import { MAPS } from '../../src/content/maps/index.js';

const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(MAPS);
let bad = 0;
for (const id of ids) {
  const m = MAPS[id]; if (!m) { console.log(`?? ${id}: no such map`); bad++; continue; }
  const problems = [], notes = [];
  const walk = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && (!m.solid(x, y) || m.doors?.has(`${x},${y}`));
  // reachability from the first spawn
  const sx = Math.floor(m.spawns[0].x / 16), sy = Math.floor(m.spawns[0].y / 16), seen = new Set([`${sx},${sy}`]), q = [[sx, sy]];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + dx},${y + dy}`; if (!seen.has(k) && walk(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } } }
  const reachable = (x, y) => seen.has(`${x},${y}`) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`));
  const idCount = {};
  for (const o of m.objects) {
    idCount[o.id] = (idCount[o.id] ?? 0) + 1;
    if (!reachable(o.x, o.y)) problems.push(`unreachable: ${o.id} at ${o.x},${o.y}`);
    if (o.action === 'exit' && !MAPS[o.to]) notes.push(`exit ${o.id} leads to ${o.to}, which doesn't exist yet`);
    for (const t of [o.text, o.label, ...(o.later ?? []).map((l) => l.text)]) if (typeof t === 'string' && t.includes('[scaffold]')) notes.push(`placeholder text: ${o.id}`);
  }
  for (const [oid, n] of Object.entries(idCount)) if (n > 1) problems.push(`duplicate id ${oid} (x${n})`);
  for (const [k, d] of m.doors ?? []) {
    const [x, y] = k.split(',').map(Number), wall = (a, b) => m.solid(a, b) && !m.doors.has(`${a},${b}`);
    if (!((wall(x - 1, y) && wall(x + 1, y)) || (wall(x, y - 1) && wall(x, y + 1)))) problems.push(`door ${d.id} at ${k} has no wall on one side`);
  }
  for (const e of m.enemies) { const x = Math.floor(e.x / 16), y = Math.floor(e.y / 16); if (m.solid(x, y)) problems.push(`enemy ${e.kind} on a solid tile ${x},${y}`); else if (!seen.has(`${x},${y}`)) problems.push(`enemy ${e.kind} unreachable at ${x},${y}`); }
  bad += problems.length;
  console.log(`${problems.length ? 'XX' : 'OK'} ${id}${problems.length ? '' : ` (${m.objects.length} objects, ${m.enemies.length} enemies)`}`);
  for (const p of problems) console.log(`   ✗ ${p}`);
  for (const n of [...new Set(notes)]) console.log(`   · ${n}`);
}
process.exit(bad ? 1 : 0);
