// Is the world map connected? (Trevor, 2026-11-23: "make sure eventually that the whole map is connected logically.
// as in on the map view there's not just random rectangles but things actually connect.")
// Usage: node tools/level/world.mjs [--strict] [--list]
// The MAP tab draws every area at worldPos() (src/content/maps/index.js). This reports, against those positions:
//   - outdoor links: the neighbour is drawn flush against the edge the exit is on, with the two exits in line
//     (within ALIGN tiles), so the road carries on across the edge;
//   - interiors: the MAP tab draws a building's rooms as an inset at the outdoor door that leads in (doorOf), so every
//     interior needs a way out to an outdoor area;
//   - overlaps: no two outdoor areas drawn on top of each other (interiors aren't drawn as rectangles);
//   - geometry: an outdoor exit near an edge should lead to an area drawn on that side.
// Today it's a report (exit 0). --strict exits 1 on any failure, for when the world plan (docs/design/13-world-map.md)
// lands and this becomes a gate. --list prints every failing link.
import { MAPS, worldPos, doorOf } from '../../src/content/maps/index.js';

const ALIGN = 2, args = new Set(process.argv.slice(2));
const side = (m, o) => { const d = { W: o.x, E: m.w - 1 - o.x, N: o.y, S: m.h - 1 - o.y }; const k = Object.keys(d).sort((a, b) => d[a] - d[b])[0]; return d[k] <= 6 ? k : null; };
const at = (m, o) => { const p = worldPos(m); return { x: p.x + o.x, y: p.y + o.y }; };
const fails = { link: [], door: [], side: [], overlap: [] };
let links = 0, doors = 0;
const seen = new Set();
for (const m of Object.values(MAPS)) for (const o of m.objects) {
  if (o.action !== 'exit' || !MAPS[o.to]) continue;
  const b = MAPS[o.to], back = b.objects.find((q) => q.id === o.pair) ?? b.objects.find((q) => q.action === 'exit' && q.to === m.id);
  if (!back) { fails.link.push(`${m.id} -> ${b.id}: no exit back`); continue; }
  const key = [`${m.id}:${o.id}`, `${b.id}:${back.id}`].sort().join('|');   // each pair of exits once
  const pa = at(m, o), pb = at(b, back), gap = Math.round(Math.hypot(pa.x - pb.x, pa.y - pb.y));
  if (m.outdoor && b.outdoor) {
    if (seen.has(key)) continue; seen.add(key); links++;
    const s = side(m, o), wa = worldPos(m), wb = worldPos(b);
    // Meeting = the neighbour is flush against the edge the exit is on, and the two exits line up along that edge
    // (exits often sit a few tiles in from the edge, behind a cordon or a gate).
    const flush = s && { N: Math.abs(wb.y + b.h - wa.y), S: Math.abs(wa.y + m.h - wb.y), W: Math.abs(wb.x + b.w - wa.x), E: Math.abs(wa.x + m.w - wb.x) }[s];
    const along = s === 'N' || s === 'S' ? Math.abs(pa.x - pb.x) : Math.abs(pa.y - pb.y);
    if (!s ? gap > ALIGN : flush > 1 || along > ALIGN) fails.link.push(`${m.id} -> ${b.id}: ${s ? `${flush} tiles off the ${s} edge, ${along} out of line` : `ends ${gap} tiles apart`}`);
    const ok = { W: wb.x + b.w <= wa.x + 2, E: wb.x >= wa.x + m.w - 2, N: wb.y + b.h <= wa.y + 2, S: wb.y >= wa.y + m.h - 2 }[s];
    if (s && !ok) fails.side.push(`${m.id} -> ${b.id}: the exit is on the ${s} edge, the area isn't drawn there`);
  }
}
for (const m of Object.values(MAPS)) if (!m.outdoor) { doors++; if (!doorOf(m.id)) fails.door.push(`${m.id}: no way out to an outdoor door, so the map can't place it`); }
const ms = Object.values(MAPS).filter((m) => m.outdoor);
for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
  const A = ms[i], B = ms[j], a = worldPos(A), b = worldPos(B);
  const ix = Math.min(a.x + A.w, b.x + B.w) - Math.max(a.x, b.x), iy = Math.min(a.y + A.h, b.y + B.h) - Math.max(a.y, b.y);
  if (ix > 0 && iy > 0) fails.overlap.push(`${A.id} / ${B.id} (${ix}x${iy})`);
}
const pct = (bad, n) => `${n - bad}/${n} (${n ? Math.round((100 * (n - bad)) / n) : 100}%)`;
console.log(`outdoor links that meet on the map: ${pct(fails.link.filter((l) => !l.includes('no exit back')).length, links)}`);
console.log(`outdoor exits drawn on their edge's side: ${pct(fails.side.length, links)}`);
console.log(`interiors placed at their building's door: ${pct(fails.door.length, doors)}`);
console.log(`outdoor areas drawn on top of each other: ${fails.overlap.length}`);
if (args.has('--list')) for (const [k, v] of Object.entries(fails)) for (const f of v) console.log(`  ${k}: ${f}`);
const total = Object.values(fails).reduce((n, v) => n + v.length, 0);
if (args.has('--strict') && total) process.exit(1);
