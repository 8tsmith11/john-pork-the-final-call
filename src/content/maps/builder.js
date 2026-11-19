// Level builder (docs/design/11-level-builder.md; Trevor: "a level builder ... you guys would use"). A small
// fluent API over makeMap for scaffolding areas fast: paint ground, drop walled rooms with doors that always
// have wall on both sides, buildings with an entrance, roads, props, scenery, NPC slots, enemies and exits.
// It produces exactly what makeMap takes, so maps built with it work everywhere maps already work.
//
//   export const hall = level({ id: 'compute_hall_b', name: 'Compute Hall B', w: 30, h: 18, fill: 'm', border: '#' })
//     .room(2, 2, 10, 6, { floor: 'e', door: { side: 's', at: 4 } })
//     .exit('metro_plaza', 15, 17, { label: 'Out to the campus', stepOn: true, w: 2 })
//     .npc('npc.example', 6, 4, { label: 'Someone', text: '[scaffold] says something' })
//     .enemies('enemy.rotling', 3, [14, 3, 10, 8])
//     .spawn(15, 15)
//     .build();
//
// Placeholder text in a scaffold starts with "[scaffold]" so the polish pass can find it (tools/level/check.mjs).
import { makeMap } from './build.js';

const SOLID = new Set(['#', '=', '~', '|', 'T', 'f']);

/**
 * Brainstorm grids straight into a map (Trevor: "write levels as text grids"). `rows` is the grid; tile
 * characters are the normal map legend (build.js), and `legend` maps any other character to a thing:
 *   { E: { enemy: 'enemy.rotling' }, B: { enemy: 'boss.switchman' }, '@': { spawn: true },
 *     N: { npc: 'npc.kess', label: 'Kess' }, D: { exit: 'metro_plaza', label: 'Out' }, '?': { prop: 'obj.crate', label: 'Crate' } }
 * The tile under a legend character is `under` (default: the map's fill). Returns a level() builder, so more
 * calls can follow before .build().
 */
export function fromGrid({ id, name, rows, legend = {}, under, ...opts }) {
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const L = level({ id, name, w, h, border: null, ...opts });
  L.edit((g, set) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = rows[y][x] ?? '#', thing = legend[ch];
      if (!thing) { set(x, y, ch); continue; }
      set(x, y, thing.tile ?? under ?? opts.fill ?? '.');
      if (thing.enemy) L.enemy(thing.enemy, x, y, thing.opts);
      else if (thing.spawn) L.spawn(x, y);
      else if (thing.npc) L.npc(thing.npc, x, y, thing);
      else if (thing.exit) L.exit(thing.exit, x, y, thing);
      else if (thing.prop) L.prop(thing.prop, x, y, thing);
      else if (thing.scenery) L.scenery(thing.scenery, x, y, thing);
    }
  });
  return L;
}

export function level({ id, name, w, h, fill = 'g', border = '#', ...extra }) {
  const g = Array.from({ length: h }, () => Array(w).fill(fill));
  const objects = [], enemies = [], spawns = [], scenery = [];
  const set = (x, y, ch) => { if (y >= 0 && y < h && x >= 0 && x < w) g[y][x] = ch; };
  const at = (x, y) => g[y]?.[x];
  let seedN = 0;
  const rnd = () => { seedN = (seedN * 1103515245 + 12345 + id.length * 7919) & 0x7fffffff; return seedN / 0x7fffffff; };

  const B = {
    /** Paint a rectangle of one tile. */
    rect(x, y, rw, rh, ch) { for (let j = y; j < y + rh; j++) for (let i = x; i < x + rw; i++) set(i, j, ch); return B; },
    /** A straight road or path from (x1,y1) to (x2,y2), `width` tiles wide (horizontal or vertical). */
    road(x1, y1, x2, y2, { width = 2, ch = ',' } = {}) {
      if (y1 === y2) return B.rect(Math.min(x1, x2), y1, Math.abs(x2 - x1) + 1, width, ch);
      return B.rect(x1, Math.min(y1, y2), width, Math.abs(y2 - y1) + 1, ch);
    },
    /** A walled room: wall ring, floor inside. door: { side: 'n'|'s'|'e'|'w', at: offset along that wall, open?: bool }. */
    room(x, y, rw, rh, { floor = '.', wall = '#', door = null, doors = [] } = {}) {
      B.rect(x, y, rw, rh, wall); B.rect(x + 1, y + 1, rw - 2, rh - 2, floor);
      for (const d of [door, ...doors].filter(Boolean)) {
        const [dx, dy] = d.side === 'n' ? [x + d.at, y] : d.side === 's' ? [x + d.at, y + rh - 1] : d.side === 'w' ? [x, y + d.at] : [x + rw - 1, y + d.at];
        set(dx, dy, floor);   // the gap; the ring around it stays wall, so a door always has wall both sides
        if (d.id || d.label) objects.push({ id: d.id ?? `obj.${id}_door_${dx}_${dy}`, art: d.art ?? 'obj.door', x: dx, y: dy, label: d.label ?? 'Door', door: true, text: d.text ?? '' });
      }
      return B;
    },
    /** A solid building footprint with an entrance on one side. `to` makes it an exit into an interior map. */
    building(x, y, bw, bh, { wall = '#', door = { side: 's', at: Math.floor(bw / 2) }, label = 'Building', text = '', to = null, art = 'obj.door', id: bid } = {}) {
      B.rect(x, y, bw, bh, wall);
      const [dx, dy] = door.side === 'n' ? [x + door.at, y] : door.side === 's' ? [x + door.at, y + bh - 1] : door.side === 'w' ? [x, y + door.at] : [x + bw - 1, y + door.at];
      objects.push({ id: bid ?? `obj.${id}_bldg_${dx}_${dy}`, art, x: dx, y: dy, label, text, ...(to ? { action: 'exit', to } : {}) });
      return B;
    },
    /** Any interactable object (props, signs, shops, puzzles): { art, label, text, action, ... }. */
    prop(art, x, y, o = {}) { const { prop: _p, tile: _t, ...rest } = o; objects.push({ id: rest.id ?? `obj.${id}_${art.replace(/^obj\./, '')}_${x}_${y}`, art, x, y, label: rest.label ?? art.replace(/^obj\./, ''), text: rest.text ?? '', ...rest }); return B; },
    /** Non-interactable dressing (decor), optionally solid. */
    scenery(art, x, y, o = {}) { scenery.push({ art, x, y, ...o }); return B; },
    /** An NPC slot. Real NPCs get a talk scene later; a scaffold can use `text`. */
    npc(nid, x, y, o = {}) { const { npc: _n, tile: _t, ...rest } = o; objects.push({ id: nid, x, y, npc: true, label: rest.label ?? nid, age: rest.age ?? 'adult', ...rest }); return B; },
    /** An exit to another map. stepOn: walk-on (floor) exit; w: width in tiles; pair: id of the exit it lands at. */
    exit(to, x, y, o = {}) {
      const { exit: _e, tile: _t, ...rest } = o;
      // A doorway drawn as several adjacent cells (e.g. 'DD') becomes one exit `w` tiles wide.
      const prev = objects.find((q) => q.action === 'exit' && q.to === to && q.y === y && q.x + (q.w ?? 1) === x && (!rest.id || q.id === rest.id));
      if (prev) { prev.w = (prev.w ?? 1) + 1; return B; }
      objects.push({ id: rest.id ?? `obj.${id}_to_${to}_${x}_${y}`, x, y, label: rest.label ?? `To ${to}`, action: 'exit', to, text: rest.text ?? '', ...(rest.stepOn ? { floor: true, stepOn: true } : {}), ...rest });
      return B;
    },
    enemy(kind, x, y, opts) { enemies.push(opts ? [kind, x, y, opts] : [kind, x, y]); return B; },
    /** n enemies of a kind scattered on walkable tiles inside [x, y, w, h] (deterministic per map id). */
    enemies(kind, n, [ax, ay, aw, ah]) {
      for (let k = 0, tries = 0; k < n && tries < 500; tries++) {
        const x = ax + Math.floor(rnd() * aw), y = ay + Math.floor(rnd() * ah);
        if (SOLID.has(at(x, y)) || objects.some((o) => o.x === x && o.y === y) || enemies.some((e) => e[1] === x && e[2] === y)) continue;
        enemies.push([kind, x, y]); k++;
      }
      return B;
    },
    spawn(x, y) { spawns.push([x, y]); return B; },
    /** Escape hatch: edit the tile grid directly (g[y][x]). */
    edit(fn) { fn(g, set); return B; },
    build() {
      if (border) { B.rect(0, 0, w, 1, border); B.rect(0, h - 1, w, 1, border); B.rect(0, 0, 1, h, border); B.rect(w - 1, 0, 1, h, border); }
      for (const o of objects) if (o.action === 'exit' && o.stepOn) for (let i = 0; i < (o.w ?? 1); i++) if (SOLID.has(at(o.x + i, o.y))) set(o.x + i, o.y, fill === '#' ? '.' : fill);
      return makeMap({ id, name, layout: g.map((r) => r.join('')), spawns: spawns.length ? spawns : [[Math.floor(w / 2), Math.floor(h / 2)]], objects, enemies, ...(scenery.length ? { scenery } : {}), ...extra });
    },
  };
  return B;
}
