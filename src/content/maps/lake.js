// Lake Artemesia: an optional night area off the end of the Paint Branch trail (east edge of the
// plaza). A loop path around the lake, two fishing piers, the shut boathouse, a marsh, the Green
// Line running behind a fence on the east side, and a small island you can reach if you notice the
// stones. Painted with rectangles and ellipses so it stays editable.
import { makeMap } from './build.js';

const W = 72, H = 44;
const g = Array.from({ length: H }, () => Array(W).fill('g'));
const R = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j]?.[i] !== undefined) g[j][i] = ch; };
const ELL = (cx, cy, rx, ry, ch, inner = 0) => {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
    if (d <= 1 && d >= inner) g[y][x] = ch;
  }
};

// Trees first, scattered, then everything else is painted over them.
// Level design (gonman): groves, not a lattice. Trees bunch in named stands with open grass between
// them, so the lake reads as a park that grew and the eye gets somewhere to rest. `hash` is a fixed
// per-tile value, so the layout is the same on every machine.
const hash = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
const GROVES = [   // [cx, cy, rx, ry]
  [8, 6, 7, 4], [7, 14, 5, 3], [6, 29, 5, 4], [9, 37, 7, 4],          // the west woods, either side of the trail in
  [30, 3, 8, 2], [47, 2, 4, 1],                                        // along the north edge
  [47, 40, 10, 3], [35, 41, 4, 2],                                     // the south edge, behind the marsh
  [61, 13, 2.5, 5], [61, 31, 2.5, 6],                                  // the strip between the loop and the fence
];
for (let y = 1; y < H - 1; y++) for (let x = 1; x < 64; x++) {
  const inGrove = GROVES.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1);
  if (hash(x, y) < (inGrove ? 0.42 : 0.025)) g[y][x] = 'T';
}
for (let y = 2; y < H - 2; y++) if (hash(69, y) < 0.18) g[y][69] = 'T';
const CLEAR = [[29, 36]];                                         // enemy spawns must stand on grass; painted back after the groves   // a ragged line beyond the tracks

// Natural pass (Manuel: "more natural, less square"): the shore has bays and wobbles instead of a stepped
// oval, the loop is a gravel trail that bends with it, the marsh ponds are ponds. Reeds and lily pads come from
// the decal scatter (src/game/render/decor.js).
const n2 = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); };
const noise = (x, y) => { const gx = x / 5, gy = y / 5, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0, s = (v) => v * v * (3 - 2 * v);
  const a = n2(x0, y0), b = n2(x0 + 1, y0), c = n2(x0, y0 + 1), d = n2(x0 + 1, y0 + 1); return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy); };
const blob = (cx, cy, rx, ry, ch, rough = 0.15, only = null) => {
  for (let y = Math.floor(cy - ry - 2); y <= Math.ceil(cy + ry + 2); y++) for (let x = Math.floor(cx - rx - 2); x <= Math.ceil(cx + rx + 2); x++) {
    if (g[y]?.[x] === undefined || (only && !only.includes(g[y][x]))) continue;
    const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
    if (d <= 1 + rough * (noise(x * 1.7 + cx, y * 1.7 + cy) - 0.5) * 2) g[y][x] = ch;
  }
};
const CX = 40, CY = 21.5, ringR = (a) => 1 + 0.05 * Math.sin(3 * a + 0.6) + 0.035 * Math.sin(5 * a + 2);   // the loop bends a little
const ringAt = (a) => [CX + 20.5 * ringR(a) * Math.cos(a), CY + 13.8 * ringR(a) * Math.sin(a)];
for (let y = 1; y < H - 1; y++) for (let x = 1; x < 63; x++) {          // the bank inside the loop: clear grass
  const a = Math.atan2((y + 0.5 - CY) / 13.8, (x + 0.5 - CX) / 20.5), k = ringR(a), d = ((x + 0.5 - CX) / (20.5 * k)) ** 2 + ((y + 0.5 - CY) / (13.8 * k)) ** 2;
  if (d < 0.93) g[y][x] = 'g';
}
// The lake: overlapping lobes, so the shore has bays and points instead of one oval.
for (const [cx, cy, rx, ry] of [[40, 21.5, 14, 8.6], [30.5, 17.5, 6, 4.2], [51, 24.5, 6.2, 4.4], [44, 28.6, 5.4, 2.8], [33.5, 26, 5, 3.4], [47.5, 14.2, 5.2, 3]]) blob(cx, cy, rx, ry, '~', 0.22);
for (let y = 2; y < H - 2; y++) for (let x = 2; x < 62; x++) {           // a few trees back on the bank inside the loop, away from the water
  if (g[y][x] !== 'g' || n2(x * 1.3, y * 2.1) > 0.06) continue;
  const ang = Math.atan2((y + 0.5 - CY) / 13.8, (x + 0.5 - CX) / 20.5), kk = ringR(ang);
  if (((x + 0.5 - CX) / (20.5 * kk)) ** 2 + ((y + 0.5 - CY) / (13.8 * kk)) ** 2 > 0.85) continue;   // only on the bank inside the loop
  if ([[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]].every(([dx, dy]) => g[y + dy]?.[x + dx] === 'g' || g[y + dy]?.[x + dx] === 'T')) g[y][x] = 'T';
}
blob(45, 18, 3.3, 2.5, 'g', 0.15); g[17][44] = 'T'; g[18][46] = 'g';    // the island, its one tree
for (const [x, y] of [[45, 8], [45, 9], [45, 10], [45, 11], [46, 11], [46, 12], [46, 13], [45, 13], [45, 14], [45, 15]]) g[y][x] = 'p';   // the stones, zig-zagging out to the island
R(40, 28, 2, 9, 'b');                                                    // south pier
R(54, 20, 8, 2, 'b');                                                    // east pier
let prev = null;                                                         // the loop trail, gravel, one tile wide and unbroken
for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.004) {
  const [fx, fy] = ringAt(a), x = Math.floor(fx), y = Math.floor(fy);
  if (prev && prev[0] !== x && prev[1] !== y && g[prev[1]]?.[x] !== undefined) g[prev[1]][x] = g[prev[1]][x] === 'b' ? 'b' : 'y';   // no diagonal gaps
  if (g[y]?.[x] !== undefined && g[y][x] !== 'b' && g[y][x] !== 'p') g[y][x] = 'y';
  prev = [x, y];
}
for (let x = 0; x <= 21; x++) { const y = Math.round(21.4 + 0.7 * Math.sin(x / 3.2)); for (const yy of [y, y + 1]) if (g[yy]?.[x] !== undefined) g[yy][x] = 'y'; }   // the trail in from Paint Branch, bending
blob(23.2, 37.9, 3.6, 2.0, '~', 0.25); blob(27.8, 39.6, 2.4, 1.4, '~', 0.25);   // the marsh ponds (the heron stands at the edge)
R(52, 3, 9, 4, '#'); R(52, 3, 1, 1, 'g'); R(60, 3, 1, 1, 'g'); R(53, 7, 7, 1, 'y'); R(54, 8, 5, 1, 'y');   // the boathouse (corners stepped) and its gravel apron
R(64, 1, 1, H - 2, '=');                                         // the fence
R(66, 1, 2, H - 2, 't');                                         // the Green Line, at grade here
R(0, 0, W, 1, 'T'); R(0, H - 1, W, 1, 'T'); R(0, 0, 1, H, 'T'); R(W - 1, 0, 1, H, 'T');
for (const [x, y] of CLEAR) g[y][x] = 'g';
R(0, 21, 1, 2, 'y');                                             // the way back out

const lamp = (x, y, text) => ({ id: `obj.lakelamp_${x}_${y}`, art: 'obj.streetlamp', x, y, label: 'Trail lamp', light: 0.8, text });

export const lake = makeMap({
  id: 'lake', name: 'Lake Artemesia',
  enemyPower: { hp: 1.3, dmg: 1.25 },   // Trevor (2026-11-20): "buff the enemies in lake artemesia a bit"
  propScale: 1.5,
  outdoor: true,
  layout: g.map((r) => r.join('')),
  spawns: [[2, 21], [2, 22], [3, 22]],
  enemies: [
    ['enemy.captcha', 12, 21],                                     // on the trail in: a Captcha, checking who comes to the lake
    ['enemy.autocomplete', 58, 12], ['enemy.spitter', 61, 16, { elite: 'armored' }], // north-east woods: an armored ranged anchor
    ['enemy.spitter', 21, 34], ['enemy.rotling', 29, 36],          // the marsh
    ['enemy.moth', 30, 7],                                         // north shore: a Hold-Music Moth, alone, by the moth lamp
    ['enemy.spitter', 46, 19],                                     // on the island, with the thing it's sitting on
    // Append only: existing lake#0..6 killed-spawn keys must keep their meaning.
    ['enemy.rotling', 56, 13],                                    // closes while the north-east elite fires
    ['enemy.captcha', 52, 31],                                    // south-east bend, away from the fisherman
    ['enemy.autocomplete', 54, 30],                               // flanks the charge rather than another isolated duel
  ],
  objects: [
    { id: 'obj.lake_back', art: 'obj.purple_sign', x: 0, y: 22, label: 'Back to College Park', action: 'exit', to: 'metro_plaza', text: 'The trail back to the plaza.' },
    { id: 'obj.lake_sign', art: 'obj.board', x: 6, y: 20, label: 'Trail sign', text: 'LAKE ARTEMESIA · 0.4 MI. Under it, a newer plate: WATER SAFETY ZONE. CONTINUITY ADVISES AGAINST CONTACT WITH STANDING WATER. Somebody has scratched FISH ARE FINE under that.' },
    lamp(15, 20, 'Solar, on a timer. It comes on for a second when you walk under it, then decides you are not worth it.'),
    lamp(26, 10, 'The lamp hums. Moths do slow laps around it.'),
    lamp(55, 31, 'Half the glass is gone. It still works.'),
    lamp(39, 36, 'At the foot of the south pier. Someone has taped a fishing licence to it, expired 2091.'),
    { id: 'obj.lake_bench', art: 'obj.bench', x: 33, y: 35, label: 'Bench', text: 'IN MEMORY OF EVERYONE WHO FISHED HERE. No names. It\'s a long bench.' },
    // The south pier and its fisherman (side quest: "Something that glows")
    { id: 'npc.ozzie', x: 41, y: 29, label: 'Ozzie', npc: true, age: 'adult', eggNo: true, later: [
      { if: 'q.lantern.given', text: '"Wrote it down twice," Ozzie says, "in case the first one doesn\'t take." His eyes are back on the water. The notebook is open on his knee at the same page.' },
      { if: 'q.lantern.given && act1.complete', text: 'Ozzie offers you the second rod without a word. The two of you fish for a while. Nothing bites.' },
    ], text: 'An old man at the end of the pier with two rods, a bucket, and a notebook full of tally marks. He doesn\'t look up. "You\'re scaring them. Sit or go."' },
    { id: 'obj.tackle_box', art: 'obj.toolbox', x: 39, y: 34, label: 'Tackle box', loot: 'tackle', text: 'A tackle box left open on the bench end of the pier, lures in neat rows. Ozzie\'s spare.' },
    { id: 'obj.marsh_debris', art: 'obj.crate', x: 26, y: 35, label: 'Washed-up crate', loot: 'trash', text: 'A crate the marsh has been working on for a while. The label says PERISHABLE.' },
    // The east pier
    { id: 'obj.east_pier_sign', art: 'obj.board', x: 61, y: 19, label: 'Pier rules', text: 'NO DIVING. NO NETS. CATCH AND RELEASE.\nAll three have been crossed out, and under them in marker: TAKE WHAT YOU NEED.' },
    // The boathouse
    { id: 'obj.boathouse_door', art: 'obj.door', x: 56, y: 6, label: 'Boathouse', text: 'Padlocked, and the padlock is newer than the boathouse. Through the gap: paddle boats stacked to the roof, swan-shaped, eyes painted on. A Continuity notice on the door: RECREATIONAL WATERCRAFT SUSPENDED PENDING REVIEW.' },
    { id: 'obj.boats', art: 'obj.cart', x: 54, y: 7, label: 'Swan boat', text: 'One swan boat is outside, upside down, with a hole in it the size of a fist. Something punched out from inside.' },
    // The fence and the line
    { id: 'obj.fence_gap', art: 'obj.graffiti', x: 64, y: 30, label: 'Fence', text: 'Chain-link with razor wire, and past it the Green Line running at grade. A train goes by with every window dark and nobody aboard, exactly on time.' },
    // The marsh
    { id: 'obj.heron', art: 'obj.planter', x: 19, y: 38, label: 'Heron', text: 'A grey heron standing in the reeds, absolutely still. Then you notice it\'s been standing on one leg on nothing: the water under it is deep. It walks off north-east, on top of the lake, one careful step at a time.' },
    // The island (secret): reached by the stones from the north shore
    { id: 'obj.island_shrine', art: 'obj.statue_1', x: 46, y: 18, label: 'Something on the island', grant: 'item.lake_bust', grantFlag: 'secrets.lake.island', doneText: 'The plinth where the little bust was. A ring of clean stone where the moss didn\'t grow.', text: 'A plinth no taller than your knee, and on it a bust of John Pork the size of a fist, carved out of something white that isn\'t stone. Somebody keeps it clean. There are fresh flowers. You take it, and immediately feel like you shouldn\'t have.' },
  ],
});
