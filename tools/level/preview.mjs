// Preview a map as text, with everything on it marked (docs/design/11-level-builder.md).
// Usage: node tools/level/preview.mjs <mapId>        (or a module path exporting a built map as default/`map`)
// Tiles print as their map characters; on top: @ spawn, E enemy, B boss, N npc, X exit, D door, o object, s scenery.
import { MAPS } from '../../src/content/maps/index.js';
import { pathToFileURL } from 'node:url';

const arg = process.argv[2];
if (!arg) { console.log('usage: node tools/level/preview.mjs <mapId|path.js>'); process.exit(1); }
let map = MAPS[arg];
if (!map) { const mod = await import(pathToFileURL(arg).href); map = mod.default ?? mod.map ?? Object.values(mod).find((v) => v?.layout); }
if (!map) { console.log(`no map ${arg}. Known: ${Object.keys(MAPS).join(', ')}`); process.exit(1); }

const grid = map.layout.map((r) => r.split(''));
const mark = (x, y, ch) => { if (grid[y]?.[x] !== undefined) grid[y][x] = ch; };
for (const s of map.scenery ?? []) mark(s.x, s.y, 's');
for (const o of map.objects) {
  const ch = o.npc ? 'N' : o.action === 'exit' ? 'X' : o.door ? 'D' : 'o';
  for (let i = 0; i < (o.w ?? 1); i++) mark(o.x + i, o.y, ch);
}
for (const e of map.enemies) mark(Math.floor(e.x / 16), Math.floor(e.y / 16), String(e.kind).startsWith('boss.') ? 'B' : 'E');
for (const sp of map.spawns) mark(Math.floor(sp.x / 16), Math.floor(sp.y / 16), '@');

console.log(`${map.id} "${map.name}" ${map.w}x${map.h}${map.outdoor ? ' outdoor' : ''}${map.act ? ` act ${map.act}` : ''}`);
console.log('    ' + Array.from({ length: map.w }, (_, i) => (i % 10 ? ' ' : String(i / 10 % 10))).join(''));
grid.forEach((r, y) => console.log(String(y).padStart(3) + ' ' + r.join('')));
console.log('\n@ spawn  E enemy  B boss  N npc  X exit  D door  o object  s scenery');
for (const o of map.objects) console.log(`  ${(o.npc ? 'N' : o.action === 'exit' ? 'X' : o.door ? 'D' : 'o')} ${String(o.x).padStart(3)},${String(o.y).padEnd(3)} ${o.id}${o.to ? ` -> ${o.to}` : ''}  ${o.label ?? ''}`);
const kinds = {}; for (const e of map.enemies) kinds[e.kind] = (kinds[e.kind] ?? 0) + 1;
console.log(`  enemies: ${Object.entries(kinds).map(([k, n]) => `${k} x${n}`).join(', ') || 'none'}`);
