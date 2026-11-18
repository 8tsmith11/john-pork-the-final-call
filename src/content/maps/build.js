// Shared ASCII map builder. Legend (solid chars collide):
//   # wall   = rail/window   ~ water   | pillar          (solid)
//   . floor  b balcony  , asphalt  : tunnel floor  t track  g grass  k kitchen tile  e epoxy  w bathroom tile  (walkable)
import { TILE } from '../../engine/sim.js';

const SOLID = new Set(['#', '=', '~', '|']);

export const TILE_COLORS = {
  '#': 0x1c1f33, '=': 0x4a6080, '~': 0x1d3a4a, '|': 0x2b2f4a,
  '.': 0x3a2f2a, 'b': 0x2a3040, ',': 0x2c2c34, ':': 0x23262b, 't': 0x3b3530, 'g': 0x24341f,
  'k': 0x4a4540, 'e': 0x2f3a40, 'w': 0x3e4a52,
};

/** Tile coords in, pixel coords out. Objects keep tile coords (renderer and proximity use tiles). */
export function makeMap({ id, name, layout, spawns, objects = [], enemies = [], music = null }) {
  const w = Math.max(...layout.map((r) => r.length));
  const rows = layout.map((r) => r.padEnd(w, '#'));
  return {
    id, name, music, w, h: rows.length, layout: rows,
    spawns: spawns.map(([tx, ty]) => ({ x: tx * TILE + 8, y: ty * TILE + 8 })),
    objects,
    // Exits (doors, ladders, elevators) block walking; you use them by interacting.
    // Doors (door: true) block until opened. `floor: true` objects (grates) stay walkable.
    blocked: new Set(objects.filter((o) => o.action === 'exit' && !o.floor).map((o) => `${o.x},${o.y}`)),
    doors: new Map(objects.filter((o) => o.door).map((o) => [`${o.x},${o.y}`, o])),
    enemies: enemies.map(([kind, tx, ty]) => ({ kind, x: tx * TILE + 8, y: ty * TILE + 8 })),
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
