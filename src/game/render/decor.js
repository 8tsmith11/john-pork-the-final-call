// Landscape pass (Manuel: "the plaza is a huge concrete block with some random small concrete structure").
// Floor decals stamped into the baked map under everything: puddles, cracks, leaves, litter, oil, manholes,
// weeds at the edges. Authored ones come from `map.decals` ([[frame, x, y], ...]); outdoor maps also get a
// seeded scatter so big paved areas never read as one flat texture. Pure functions: tested in tests/run.js.

const hash = (s) => {   // FNV-1a, then an avalanche so neighbouring tiles don't line up
  let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

const PAVED = new Set(['p', 'q', 's', 'm']);
const ROAD = new Set([',']);

/** Seeded decals for one map: [{ frame, x, y }] in tiles. Skips solid tiles and tiles with an object or scenery on them. */
export function scatterDecals(map) {
  if (!map.outdoor) return [];
  const taken = new Set([...(map.objects ?? []), ...(map.scenery ?? [])].map((o) => `${o.x},${o.y}`));
  for (const [, x, y] of map.decals ?? []) taken.add(`${x},${y}`);
  const at = (x, y) => map.layout[y]?.[x];
  const near = (x, y, ch) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(x + dx, y + dy) === ch);
  const out = [];
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
    const ch = at(x, y);
    if (ch === '#' && !taken.has(`${x},${y}`)) {   // roofs: only true tops (wall all round), never the lit front face
      const top = [[0, -1], [0, 1], [1, 0], [-1, 0], [0, 2]].every(([dx, dy]) => at(x + dx, y + dy) === '#');
      if (!top) continue;
      const b = hash(`${map.id}:roof:${x >> 1},${y >> 1}`), rr = hash(`${map.id}:r:${x},${y}`);
      const blockTop = [[0, 0], [1, 0], [0, 1], [1, 1]].every(([dx, dy]) => [[0, -1], [0, 1], [1, 0], [-1, 0], [0, 2]].every(([ex, ey]) => at((x & ~1) + dx + ex, (y & ~1) + dy + ey) === '#'));
      let f = null;
      if (blockTop && b < 0.1) f = 'roof.solar';                     // a solar array, 2x2
      else if (blockTop && b < 0.13) f = 'roof.garden';              // somebody grows things up here
      else if (rr < 0.035) f = 'roof.ac';
      else if (rr < 0.065) f = 'roof.vent';
      else if (rr < 0.08) f = 'roof.skylight';
      else if (rr < 0.087) f = 'roof.skylight_lit';
      else if (rr < 0.095) f = 'roof.tank';
      else if (rr < 0.102) f = 'roof.hatch';
      else if (rr < 0.107) f = 'roof.antenna';
      if (f) out.push({ frame: f, x, y });
      continue;
    }
    if (taken.has(`${x},${y}`) || map.solid(x, y)) continue;
    const r = hash(`${map.id}:${x},${y}`), pick = (list) => list[Math.floor(hash(`${map.id}#${x},${y}`) * list.length)];
    let frame = null;
    if (PAVED.has(ch)) {
      if (near(x, y, 'T') && r < 0.3) frame = pick(['dec.leaves_0', 'dec.leaves_1']);          // trees drop leaves
      else if ((near(x, y, 'g') || near(x, y, '#')) && r < 0.06) frame = 'dec.weeds';         // weeds where paving meets an edge
      else if (r < 0.022) frame = pick(['dec.crack_0', 'dec.crack_1', 'dec.gum', 'dec.litter_0', 'dec.stain']);
      else if (r < 0.034) frame = pick(['dec.puddle_0', 'dec.puddle_1']);                    // it has been raining all night
      else if (r < 0.038) frame = 'dec.litter_1';                                            // a flyer
    } else if (ROAD.has(ch)) {
      const interior = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => at(x + dx, y + dy) === ',');
      if (interior && (x * 31 + y * 17) % 89 === 0) frame = 'dec.manhole';
      else if (r < 0.02) frame = pick(['dec.oil', 'dec.crack_0', 'dec.crack_1']);
      else if (r < 0.032) frame = pick(['dec.puddle_0', 'dec.puddle_1']);
    } else if (ch === 'd') {
      if (r < 0.55) frame = 'dec.flowers';                                                     // planting beds are planted
    } else if (ch === 'g') {
      if (near(x, y, 'T') && r < 0.12) frame = pick(['dec.leaves_0', 'dec.leaves_1']);
      else if (r < 0.035) frame = 'dec.flowers';                                               // wildflowers in the lawns
    }
    if (frame) out.push({ frame, x, y });
  }
  return out;
}

/** Everything to stamp for a map: authored decals first, then the scatter. */
export function mapDecals(map) {
  return [...(map.decals ?? []).map(([frame, x, y]) => ({ frame, x, y })), ...scatterDecals(map)];
}

/** Which sheet a scenery piece's art lives in, and how it stands on its tile(s). */
export function sceneryPlacement(s, has) {
  if (has('big', s.art)) return { sheet: 'big', x: s.x * 16 + 16 * (s.w ?? 1) / 2, y: (s.y + 1) * 16, origin: [0.5, 1], shadow: 26 };
  if (has('wide', s.art)) return { sheet: 'wide', x: s.x * 16, y: (s.y + 1) * 16, origin: [0, 1], shadow: 28 };
  if (has('props', s.art)) return { sheet: 'props', x: s.x * 16, y: (s.y + 1) * 16, origin: [0, 1], shadow: 12 };
  return null;
}
