// The room standard (docs/design/13-audit-and-rebuild.md, "Rooms, a standard"; hub #113). Room 631, Compute Hall B and
// the plaza are what a finished map looks like; scaffolds have about 3 sprites, one floor and one box shape. These
// checks put numbers on the difference. tools/level/check.mjs reports them as warnings for every map, and fails a map
// marked `standard: true`. tests/run.js checks every `standard: true` map passes.
//
//   height    at least 11 tiles tall, or an explicit `zoom` (zoom comes from map height, so short rooms draw bigger)
//   sprites   indoors, at least 8 distinct drawn sprites among the things in the room
//   density   indoors, at least 10 things per 100 walkable tiles
//   variety   no one sprite is more than 40% of a map's things
//   floors    indoors, at least 2 floor kinds, the main one at most 80% of the floor
//   landmark  one object marked `landmark: true`, drawn with a sprite no other map uses, in view from the spawn
//   lights    indoors, at least 2 placed light sources (`light` on an object or a piece of scenery)
//
// "Things" are what furnishes a room: objects that aren't people, exits or doors, plus scenery, leaving out `floor: true`
// pieces (cable runs, grates, trays), which are part of the floor. A thing's sprite is its `art`, else its id (the
// renderer's rule); only sprites that exist in a sheet count as drawn.
import fs from 'node:fs';
import { VIEW } from '../../src/view.js';

export const RULES = { minH: 11, minSprites: 8, minDensity: 10, maxShare: 0.4, minFloors: 2, maxMainFloor: 0.8, minLights: 2 };
const SHEETS = ['props', 'big', 'wide', 'doors'];
const WALL = new Set(['#', '=', '~', '|', 'T', 'f']);
const TILE = 16;

let frames = null;
/** Every frame name in the sprite sheets the world draws objects from. */
export function drawnSprites() {
  frames ??= new Set(SHEETS.flatMap((s) => Object.keys(JSON.parse(fs.readFileSync(new URL(`../../assets/sprites/${s}.json`, import.meta.url), 'utf8')).frames)));
  return frames;
}

export const spriteOf = (o) => o.art ?? o.id;
export const thingsOf = (m) => [...m.objects.filter((o) => !o.npc && o.action !== 'exit' && !o.door), ...(m.scenery ?? [])].filter((t) => !t.floor);

/** Tiles you can walk to from the first spawn (interior doors count as open). */
export function walkable(m) {
  const pass = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && (!m.solid(x, y) || m.doors?.has(`${x},${y}`));
  const sx = Math.floor(m.spawns[0].x / TILE), sy = Math.floor(m.spawns[0].y / TILE), seen = new Set([`${sx},${sy}`]), q = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + dx},${y + dy}`; if (!seen.has(k) && pass(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } }
  }
  return seen;
}

/** The zoom WorldScene picks for a map (height decides, 4 to 7), unless the map sets its own. */
export const zoomOf = (m) => m.zoom ?? Math.max(VIEW.zoom, Math.min(7, Math.floor((VIEW.h * VIEW.zoom) / (m.h * TILE))));

/** Is tile (tx, ty) on the first screen, with the camera on the spawn and clamped the way WorldScene clamps it? */
export function onFirstScreen(m, tx, ty) {
  const z = zoomOf(m), vw = (VIEW.w * VIEW.zoom) / z, vh = (VIEW.h * VIEW.zoom) / z, mw = m.w * TILE, mh = m.h * TILE;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const bx = Math.min(0, (mw - vw) / 2), by = Math.min(0, (mh - vh) / 2), bw = Math.max(mw, vw), bh = Math.max(mh, vh);
  const cx = clamp(m.spawns[0].x - vw / 2, bx, bx + bw - vw), cy = clamp(m.spawns[0].y - vh / 2, by, by + bh - vh);
  const px = tx * TILE + 8, py = ty * TILE + 8;
  return px >= cx && px <= cx + vw && py >= cy && py <= cy + vh;
}

/** A straight look from the spawn to (tx, ty) that no wall or shut door blocks (the end tiles don't count). */
export function inSight(m, tx, ty) {
  let x = Math.floor(m.spawns[0].x / TILE), y = Math.floor(m.spawns[0].y / TILE);
  const dx = Math.abs(tx - x), dy = -Math.abs(ty - y), sx = x < tx ? 1 : -1, sy = y < ty ? 1 : -1;
  let err = dx + dy;
  for (let n = 0; n < 400 && !(x === tx && y === ty); n++) {
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
    if (x === tx && y === ty) break;
    if (m.layout[y]?.[x] === '#' || m.doors?.has(`${x},${y}`)) return false;
  }
  return true;
}

/** Where a map stands against the standard: the numbers, and the rules it misses (empty when it meets them all). */
export function roomReport(m, MAPS) {
  const drawn = drawnSprites(), indoors = !m.outdoor, things = thingsOf(m), miss = [];
  const tiles = walkable(m), floor = {};
  for (const k of tiles) { const [x, y] = k.split(',').map(Number), ch = m.layout[y]?.[x]; if (ch && !WALL.has(ch)) floor[ch] = (floor[ch] ?? 0) + 1; }
  const floorN = Object.values(floor).reduce((a, b) => a + b, 0), mainFloor = floorN ? Math.max(...Object.values(floor)) / floorN : 1;
  const count = {};
  for (const t of things) count[spriteOf(t)] = (count[spriteOf(t)] ?? 0) + 1;
  const sprites = Object.keys(count).filter((s) => drawn.has(s));
  const [topSprite, topN] = Object.entries(count).sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
  const density = (100 * things.length) / Math.max(1, floorN);
  const lights = [...m.objects, ...(m.scenery ?? [])].filter((o) => (typeof o.light === 'number' ? o.light > 0 : !!o.light)).length;
  const stats = { indoors, h: m.h, zoom: zoomOf(m), walkable: floorN, things: things.length, sprites: sprites.length, density: +density.toFixed(1),
    topSprite, topShare: things.length ? +(topN / things.length).toFixed(2) : 0, floors: Object.keys(floor).length, mainFloor: +mainFloor.toFixed(2), lights };

  if (m.h < RULES.minH && m.zoom == null) miss.push(`height ${m.h} < ${RULES.minH} (draws at zoom ${stats.zoom}; make it taller or set zoom)`);
  if (things.length && topN / things.length > RULES.maxShare) miss.push(`${topSprite} is ${Math.round((100 * topN) / things.length)}% of the things (max ${RULES.maxShare * 100}%)`);
  if (indoors) {
    if (sprites.length < RULES.minSprites) miss.push(`${sprites.length} distinct sprites (min ${RULES.minSprites})`);
    if (density < RULES.minDensity) miss.push(`${stats.density} things per 100 walkable tiles (min ${RULES.minDensity})`);
    if (stats.floors < RULES.minFloors) miss.push(`${stats.floors} floor kind (min ${RULES.minFloors})`);
    else if (mainFloor > RULES.maxMainFloor) miss.push(`main floor '${Object.entries(floor).sort((a, b) => b[1] - a[1])[0][0]}' is ${Math.round(mainFloor * 100)}% (max ${RULES.maxMainFloor * 100}%)`);
    if (lights < RULES.minLights) miss.push(`${lights} light source${lights === 1 ? '' : 's'} (min ${RULES.minLights})`);
  }
  const marks = m.objects.filter((o) => o.landmark);
  if (marks.length !== 1) miss.push(marks.length ? `${marks.length} landmarks (one per map)` : 'no landmark (mark one object landmark: true)');
  for (const o of marks) {
    const s = spriteOf(o), others = Object.values(MAPS).filter((q) => q.id !== m.id && [...q.objects, ...(q.scenery ?? [])].some((t) => spriteOf(t) === s)).map((q) => q.id);
    if (!drawn.has(s)) miss.push(`landmark ${o.id}: ${s} isn't drawn in any sheet`);
    if (others.length) miss.push(`landmark ${o.id}: ${s} is also used by ${[...new Set(others)].join(', ')}`);
    if (!onFirstScreen(m, o.x, o.y)) miss.push(`landmark ${o.id} at ${o.x},${o.y} is off the first screen from the spawn`);
    else if (!inSight(m, o.x, o.y)) miss.push(`landmark ${o.id} at ${o.x},${o.y} is behind a wall from the spawn`);
  }
  return { stats, miss };
}
