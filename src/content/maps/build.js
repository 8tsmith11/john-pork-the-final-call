// Shared ASCII map builder. Legend (solid chars collide):
//   # wall   = rail/window   ~ water   | pillar          (solid)
//   . floor  b balcony  , asphalt  : tunnel floor  t track  g grass  k kitchen tile  e epoxy  w bathroom tile  c carpet  m lobby stone  p pavers  s sidewalk  h track running east-west  u rug  (walkable)
//   T tree (solid)   f hedge (solid)
//   q brick paving  z/Z crosswalk across a north-south / east-west road  d planting soil  y gravel  (walkable)
import { TILE } from '../../engine/sim.js';

const SOLID = new Set(['#', '=', '~', '|', 'T', 'f']);

export const TILE_COLORS = {
  '#': 0x1c1f33, '=': 0x4a6080, '~': 0x1d3a4a, '|': 0x2b2f4a,
  '.': 0x3a2f2a, 'b': 0x2a3040, ',': 0x2c2c34, ':': 0x23262b, 't': 0x3b3530, 'g': 0x24341f,
  'k': 0x4a4540, 'e': 0x2f3a40, 'w': 0x3e4a52, 'c': 0x4a2f38, 'm': 0x4a4f52, 'h': 0x3b3530, 'u': 0x5a2f36, 'p': 0x3f4446, 's': 0x55595a, 'T': 0x1f3a22,
  'q': 0x5a3436, 'z': 0x2c2c34, 'Z': 0x2c2c34, 'd': 0x3a2418, 'f': 0x2c4a28, 'y': 0x3f4a46,
};

/** Tile coords in, pixel coords out. Objects keep tile coords (renderer and proximity use tiles). */
export function makeMap({ id, name, layout, spawns, objects = [], enemies = [], music = null, crowd = [], world = null, ...extra }) {
  const w = Math.max(...layout.map((r) => r.length));
  const rows = layout.map((r) => r.padEnd(w, '#'));
  return {
    ...extra,   // e.g. outdoor: true (scooters allowed)
    id, name, music, crowd, world, w, h: rows.length, layout: rows,
    spawns: spawns.map(([tx, ty]) => ({ x: tx * TILE + 8, y: ty * TILE + 8 })),
    objects,
    // Exits (doors, ladders, elevators) block walking; you use them by interacting.
    // Doors (door: true) block until opened. `floor: true` objects (grates) stay walkable.
    // Exits block; so does solid scenery (street furniture you walk round: `scenery: [{ art, x, y, solid, w, h }]`).
    blocked: new Set([...objects.filter((o) => o.action === 'exit' && !o.floor).map((o) => `${o.x},${o.y}`),
      ...(extra.scenery ?? []).filter((s) => s.solid).flatMap((s) => Array.from({ length: (s.w ?? 1) * (s.h ?? 1) }, (_, i) => `${s.x + (i % (s.w ?? 1))},${s.y - Math.floor(i / (s.w ?? 1))}`))]),
    doors: new Map(objects.filter((o) => o.door).map((o) => [`${o.x},${o.y}`, o])),
    // Optional fourth field carries authored spawn options, e.g. { elite: 'armored' }.
    enemies: enemies.map(([kind, tx, ty, options]) => ({ ...options, kind, x: tx * TILE + 8, y: ty * TILE + 8 })),
    solid(tx, ty) {
      if (ty < 0 || tx < 0 || ty >= this.h || tx >= this.w) return true;
      const k = `${tx},${ty}`;
      if (this.blocked.has(k)) return true;
      const d = this.doors.get(k);
      if (d) return !d.open;
      return SOLID.has(this.layout[ty][tx]);
    },
  };
}
