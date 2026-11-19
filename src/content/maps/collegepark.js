// College Park at street level: one large outdoor hub (id metro_plaza, kept for saves and triggers).
// Districts: ASTER's forecourt (north-west), the metro plaza (centre), Route 1 and its shops (east),
// the unused Purple Line track, the campus edge (south-west), a dead parking lot (south), and the
// Paint Branch trail (south-east). The layout is painted with rectangles so it stays editable.
import { makeMap } from './build.js';
import { PLAZA_CORDON } from '../cordon.js';

const W = 84, H = 52;
const g = Array.from({ length: H }, () => Array(W).fill('g'));
const R = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j]?.[i] !== undefined) g[j][i] = ch; };

// Streets
R(1, 30, 82, 1, 's'); R(1, 31, 82, 4, ','); R(1, 35, 82, 1, 's');           // the cross street
R(56, 1, 2, 50, 's'); R(58, 1, 6, 50, ','); R(64, 1, 2, 50, 's');           // Route 1, north to south
R(56, 31, 10, 4, ',');                                                      // the intersection
R(1, 28, 55, 2, 'h');                                                       // the Purple Line that never opened
// Zebra crossings (landscape pass): all four arms of the intersection, and mid-block where the plaza's
// cross path meets Route 1, so the plaza, the shops and the scooter yard join up.
R(58, 28, 6, 2, 'z'); R(58, 36, 6, 2, 'z'); R(54, 31, 2, 4, 'Z'); R(66, 31, 2, 4, 'Z');
R(58, 18, 6, 2, 'z'); R(54, 18, 2, 2, 'q');                                 // plaza to Route 1

// The metro plaza (landscape pass, Manuel: "a huge concrete block"): a brick promenade down from the
// station steps and a brick cross path, a fountain where they meet, hedged lawns with trees in the
// quarters, trees along the promenade, and a brick edge. Pavers fill what's left.
R(22, 10, 32, 18, 'p');
R(22, 10, 1, 18, 'q'); R(53, 10, 1, 18, 'q'); R(22, 27, 32, 1, 'q');       // the brick edge
R(36, 10, 6, 18, 'q');                                                      // the promenade, as wide as the steps
R(22, 18, 32, 2, 'q');                                                      // the cross path, ASTER side to Route 1
const bed = (x, y, w, h) => { R(x, y, w, h, 'f'); R(x + 1, y + 1, w - 2, h - 2, 'g'); };   // a lawn inside a clipped hedge
bed(25, 12, 9, 5); g[14][27] = 'T'; g[14][31] = 'T'; g[13][29] = 'd'; g[15][29] = 'd';   // north-west lawn: two trees, a flowerbed
bed(44, 12, 8, 4); g[13][46] = 'T'; g[13][49] = 'T'; g[14][47] = 'd'; g[14][48] = 'd';   // north-east lawn
R(32, 21, 3, 3, 'd'); g[22][33] = 'T';                                      // south-west: a tree in a planting bed
R(43, 24, 2, 2, 'd'); g[24][44] = 'T';                                      // south-east, by the abatement van
for (const [x, y] of [[35, 11], [42, 11], [35, 24], [42, 24]]) g[y][x] = 'T';   // trees along the promenade
R(32, 3, 14, 6, '#'); R(36, 9, 6, 1, 'p');                                  // the station building and its steps
R(23, 24, 8, 2, '#');                                                       // the row of shuttered stalls

// ASTER and its forecourt
R(4, 3, 14, 10, '#'); R(4, 13, 14, 4, 'p'); R(4, 16, 14, 1, 'q'); R(18, 14, 4, 2, 's');
R(2, 19, 16, 1, '='); R(2, 20, 18, 7, 'g');                                 // a railed strip of garden
R(2, 23, 18, 1, 'y'); R(4, 21, 3, 1, 'd'); R(13, 25, 4, 1, 'd'); R(15, 21, 2, 2, 'd');   // a gravel path through it, flowerbeds

// East of Route 1: the diner, the alley, the scooter yard, a shuttered block
R(66, 3, 14, 6, '#'); R(66, 9, 16, 3, ','); R(66, 9, 12, 2, 'p'); R(66, 12, 14, 6, '#'); R(66, 18, 14, 4, 'p');
R(66, 23, 12, 6, '#'); R(80, 3, 2, 27, ',');

// South-west: the campus edge. Brick walks (it's a campus), hedges along Compute Hall, flowerbeds.
R(2, 36, 26, 1, '#'); R(12, 36, 3, 1, 's'); R(12, 37, 3, 9, 'q'); R(10, 40, 7, 4, 'q'); R(4, 46, 20, 4, '#');
R(4, 45, 8, 1, 'f'); R(15, 45, 9, 1, 'f'); R(8, 40, 2, 4, 'd'); R(17, 40, 1, 4, 'd');

// South: the dead parking lot, with planting islands at both ends
R(30, 37, 24, 12, ',');
R(30, 40, 2, 5, 'd'); g[42][30] = 'T'; R(52, 40, 2, 5, 'd'); g[42][53] = 'T';

// South-east: Paint Branch and the trail to the lake
for (let y = 36; y < 51; y++) { const x = 72 + Math.round(3 * Math.sin(y / 3)); R(x, y, 2, 1, '~'); }
R(66, 40, 17, 1, 'y');                                                      // the trail is gravel
for (let x = 66; x < 83; x++) if (g[40][x] === 'y' && (g[39][x] === '~' || g[41][x] === '~')) g[40][x] = 'b';
for (let x = 68; x < 80; x++) if (g[39][x] === '~' && g[41][x] === '~') g[40][x] = 'b';

// Trees: clustered into copses and clearings (smooth noise), not sprinkled evenly, kept off paths.
const n2 = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); };
const noise = (x, y) => {   // value noise on a 7-tile grid, smoothly interpolated
  const gx = x / 7, gy = y / 7, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
  const s = (v) => v * v * (3 - 2 * v), a = n2(x0, y0), b = n2(x0 + 1, y0), c = n2(x0, y0 + 1), d = n2(x0 + 1, y0 + 1);
  return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy);
};
for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
  if (g[y][x] !== 'g') continue;
  const dense = noise(x, y), r = n2(x * 3.1, y * 1.7);
  if (!(dense > 0.6 ? r < 0.42 : r < 0.03)) continue;
  const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => g[y + dy][x + dx] === 'g' || g[y + dy][x + dx] === 'T');
  if (open) g[y][x] = 'T';
}
// A wall of trees around the edge of the map
R(0, 0, W, 1, 'T'); R(0, H - 1, W, 1, 'T'); R(0, 0, 1, H, 'T'); R(W - 1, 0, 1, H, 'T');
// ...with the roads running out through it
R(58, 0, 6, 1, ','); R(58, H - 1, 6, 1, ','); R(0, 31, 1, 4, ','); R(W - 1, 40, 1, 1, 's');
// ...and Continuity's checkpoints across them: solid barriers where the roads leave (task #36).
for (const [x, y, w, h] of PLAZA_CORDON.barriers) R(x, y, w, h, '=');

const PERSON = ['npc.rotter_2', 'npc.rotter_1', 'npc.rotter_3'];

export const metroPlaza = makeMap({
  id: 'metro_plaza', name: 'College Park',
  outdoor: true,
  cordon: true, cordonOpenings: PLAZA_CORDON.openings, cordonClosing: PLAZA_CORDON.closing,   // the quarantine cordon is the map edge (src/game/cordon.js)
  // Awnings over the shopfronts (depth pass): canvas over the pavement in front of a wall, drawn above
  // anyone standing under it. x, y: first tile of the row in front of the wall; w: tiles; c: stripe pair.
  awnings: [
    { x: 67, y: 9, w: 9, c: ['warm3', 'bone'] },     // the diner: warm, analog
    { x: 66, y: 18, w: 7, c: ['screen0', 'steel'] },  // Wick's pawn window and Delroy's
  ],
  // Who's here, and why (see src/game/crowd.js). Kept thin on purpose (Manuel: too many NPCs): a few
  // people with a reason to be here read better than a busy plaza.
  crowd: [
    { mode: 'wait', age: 'adult', at: [37, 10], n: 2, face: [38, 8] },                    // a queue at the closed metro gates
    { mode: 'talk', age: 'adult', at: [40, 21] },                                        // two people talking by the fountain
    { mode: 'walk', age: 'adult', path: [[23, 20], [36, 20], [36, 22], [41, 22], [41, 21], [52, 21]], n: 2 },   // crossing the plaza, round the fountain
    { mode: 'walk', age: 'adult', path: [[57, 4], [57, 28], [57, 46]], n: 1 },            // the west sidewalk of Route 1
    { mode: 'walk', age: 'adult', path: [[65, 46], [65, 22], [65, 4]], n: 1 },            // and the east one
    { mode: 'walk', age: 'adult', path: [[4, 30], [30, 30], [54, 30]], n: 1 },            // along the cross street
    { mode: 'wait', age: 'adult', at: [70, 20], n: 1, face: [70, 19] },                   // waiting on Big Ray
  ],
  layout: g.map((r) => r.join('')),
  // Landscape pass: street furniture nobody needs to talk to (src/game/render/decor.js draws it; solid
  // pieces are walls to the sim). Kept off sidewalks' walking lines, NPC spots and enemy spawns.
  scenery: [
    // The plaza: the fountain at the crossing, lamps, bins, racks, a news box, two ad screens, pots by the benches
    { art: 'obj.fountain', x: 38, y: 19, w: 2, h: 2, solid: true, anim: 600 },
    ...[[23, 11], [52, 11], [34, 26], [43, 26]].map(([x, y]) => ({ art: 'obj.streetlamp', x, y, light: 0.9 })),
    ...[[34, 17], [43, 17], [23, 22], [52, 23]].map(([x, y]) => ({ art: 'obj.bin', x, y })),
    { art: 'obj.bikerack', x: 23, y: 12 }, { art: 'obj.bikerack', x: 23, y: 13 }, { art: 'obj.newsbox', x: 44, y: 10 },
    { art: 'obj.adtotem', x: 24, y: 10, light: 0.6, anim: 2600 }, { art: 'obj.adtotem', x: 51, y: 10, light: 0.6, anim: 3100 },
    { art: 'obj.flowerpot', x: 36, y: 17 }, { art: 'obj.flowerpot', x: 41, y: 17 }, { art: 'obj.flowerpot', x: 41, y: 20 },
    { art: 'obj.cone', x: 50, y: 25 }, { art: 'obj.cone', x: 50, y: 27 }, { art: 'obj.utilitybox', x: 31, y: 23 },
    { art: 'obj.crate', x: 47, y: 22 }, { art: 'obj.boxes', x: 48, y: 22 }, { art: 'obj.worklamp', x: 49, y: 22, light: 0.9 },   // the abatement crew's camp by the van
    { art: 'obj.bench', x: 24, y: 22 }, { art: 'obj.bench', x: 29, y: 21 },                                                       // benches by the hopscotch
    // ASTER's forecourt
    { art: 'obj.bikerack', x: 14, y: 13 }, { art: 'obj.bikerack', x: 15, y: 13 }, { art: 'obj.bin', x: 7, y: 13 },
    { art: 'obj.flowerpot', x: 4, y: 15 }, { art: 'obj.flowerpot', x: 17, y: 15 },
    // Route 1: lights at the junction, hydrants, boxes, meters, a bus stop, racks, bins
    ...[[57, 30], [64, 30], [57, 35], [64, 35]].map(([x, y], i) => ({ art: 'obj.trafficlight', x, y, anim: 3200 + i * 150 })),
    { art: 'obj.hydrant', x: 56, y: 8 }, { art: 'obj.hydrant', x: 64, y: 26 }, { art: 'obj.hydrant', x: 56, y: 44 },
    { art: 'obj.newsbox', x: 56, y: 13 }, { art: 'obj.mailbox', x: 64, y: 13 }, { art: 'obj.meter', x: 64, y: 5 }, { art: 'obj.meter', x: 64, y: 8 },
    { art: 'obj.busstop', x: 56, y: 24 }, { art: 'obj.bikerack', x: 56, y: 10 }, { art: 'obj.bikerack', x: 56, y: 11 },
    { art: 'obj.bin', x: 56, y: 16 }, { art: 'obj.bin', x: 65, y: 29 }, { art: 'obj.meter', x: 64, y: 40 }, { art: 'obj.bin', x: 56, y: 40 },
    // The cross street
    { art: 'obj.busstop', x: 20, y: 30 }, { art: 'obj.bin', x: 6, y: 35 }, { art: 'obj.bin', x: 32, y: 35 }, { art: 'obj.hydrant', x: 47, y: 35 },
    { art: 'obj.bikerack', x: 26, y: 35 }, { art: 'obj.bikerack', x: 27, y: 35 }, { art: 'obj.newsbox', x: 40, y: 35 },
    // The parking lot: cars in the bays, a cart, tires, cones, two lot lamps
    ...[[32, 37], [36, 37], [46, 37], [50, 37], [34, 47], [40, 47], [48, 47]].map(([x, y]) => ({ art: 'obj.car', x, y, w: 2, solid: true })),
    { art: 'obj.shoppingcart', x: 48, y: 41 }, { art: 'obj.tires', x: 31, y: 46, solid: true },
    { art: 'obj.cone', x: 45, y: 43 }, { art: 'obj.cone', x: 46, y: 43 },
    { art: 'obj.streetlamp', x: 36, y: 44, light: 0.8 }, { art: 'obj.streetlamp', x: 48, y: 39, light: 0.8 },
    // Campus
    { art: 'obj.bin', x: 15, y: 44 }, { art: 'obj.bikerack', x: 10, y: 39 }, { art: 'obj.bikerack', x: 11, y: 39 }, { art: 'obj.streetlamp', x: 16, y: 44, light: 0.8 },
    // The diner's forecourt, the scooter yard, the alley
    { art: 'obj.cafe_table', x: 68, y: 10 }, { art: 'obj.cafe_table', x: 70, y: 10 }, { art: 'obj.aframe', x: 76, y: 10 }, { art: 'obj.flowerpot', x: 66, y: 10 },
    { art: 'obj.charger', x: 76, y: 18, anim: 1500 }, { art: 'obj.charger', x: 77, y: 18, anim: 1700 }, { art: 'obj.tires', x: 79, y: 21, solid: true },
    { art: 'obj.cone', x: 73, y: 21 }, { art: 'obj.cone', x: 78, y: 19 },
    { art: 'obj.boxes', x: 80, y: 8 }, { art: 'obj.crate', x: 80, y: 16 }, { art: 'obj.bin', x: 81, y: 23 }, { art: 'obj.recycle', x: 81, y: 24 },
  ],
  // Paint on the ground: parking bays, lane arrows, kerb drains, tactile strips, chalk (the rest is scattered).
  decals: [
    ...[30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52].flatMap((x) => [[37, 'dec.bay_v'], [38, 'dec.bay_v'], [47, 'dec.bay_v'], [48, 'dec.bay_v']].map(([y, f]) => [f, x, y])),
    ...[[59, 10], [59, 24], [59, 44]].map(([x, y]) => ['dec.arrow_s', x, y]), ...[[62, 6], [62, 22], [62, 42]].map(([x, y]) => ['dec.arrow_n', x, y]),
    ...[[10, 31], [28, 31], [46, 31], [76, 31]].map(([x, y]) => ['dec.drain', x, y]),
    ...[[54, 35], [55, 35], [66, 35], [67, 35]].map(([x, y]) => ['dec.tactile', x, y]),
    ['dec.chalk', 26, 21], ['dec.chalk', 26, 22], ['dec.chalk_pig', 39, 25],
  ],
  spawns: [[10, 14], [11, 14], [9, 15]],
  objects: [
    ...PLAZA_CORDON.objects,
    { id: 'obj.job_board', art: 'obj.board', x: 45, y: 23, label: 'Abatement bounty board', action: 'jobs', light: 0.6,
      text: 'Corkboard on a sawhorse by the van. Every card is in the same blunt marker. One just says PAYS.' },
    // ASTER
    { id: 'obj.aster_door', art: 'obj.street_doors', x: 10, y: 12, label: 'ASTER lobby', action: 'exit', to: 'aster_lobby', text: 'Back into the lobby.' },
    { id: 'obj.aster_sign', art: 'obj.purple_sign', x: 5, y: 13, label: 'ASTER', text: 'A S T E R, in letters a metre high. The T flickers. Residents have stopped seeing it.' },
    { id: 'npc.okafor', eggOk: true, later: [{ if: "act1.beat.call", text: "\"My grandson's game stopped and showed a pig. He says it is a commercial.\" Mrs. Okafor folds her hands. \"I have seen commercials. A commercial wants something.\"" }, { if: "act1.complete", text: "She is still on the bench. The third floor has gone quiet. \"They agreed on dinner. It took the whole night. Sit.\"" }], x: 9, y: 23, label: 'Mrs. Okafor', npc: true, age: 'adult', text: 'She came down to let three generations argue upstairs. "Sit." You sit. "Your friend with the hair. He makes those heads again?" She nods. "Good."' },
    { id: 'obj.garden_bench', art: 'obj.bench', x: 8, y: 22, label: 'Bench', text: 'A brass plate: FOR THE NIGHT SHIFT. No name. Somebody polishes it.' },
    // The plaza
    { id: 'obj.station_entrance', art: 'obj.tunnel_on', x: 38, y: 8, label: 'Metro entrance', text: 'The gates are down for the night. The departure board behind them lists a train to a station that was never built.' },
    { id: 'npc.mina', eggOk: true, later: [{ if: "act1.beat.call", text: "\"Every phone on the plaza rang at once, right in the middle of a song.\" She retunes. \"I finished the song.\"" }, { if: "act1.complete", text: "She is playing the one everybody asks for. She stops when she sees you listening. \"Don't tell anyone.\"" }], x: 41, y: 10, label: 'Mina', npc: true, age: 'adult', text: '"I do requests. I don\'t do the one everybody asks for." She retunes something wooden that was not out of tune.' },
    { id: 'npc.rotter_1', eggNo: true, later: [{ if: "act1.beat.call", text: "coderot. it rang. it rang for everyone. coderot." }], x: 30, y: 18, label: 'Code rotter', npc: true, age: 'adult', text: 'coderot. coderot. coderot.' },
    { id: 'npc.halvard', eggOk: true, x: 26, y: 26, label: 'Halvard', npc: true, age: 'adult', talk: 'lead_b_halvard', doneFlag: 'act1.halvard.sellerDescribed', doneText: 'The shutter comes up two inches. Halvard\'s eye, then the television behind him, then the shutter again.\n\n"You paid for one rumor. That was it."' },
    { id: 'obj.purple_sign', x: 40, y: 27, label: 'Purple Line sign', text: 'PURPLE LINE: OPENING SOON.' },
    { id: 'obj.plaza_clock', art: 'obj.clock_6f', x: 46, y: 9, label: 'Station clock', text: '19:01. Under it, somebody has taped a paper clock with the right time and a note: USE THIS ONE.' },
    { id: 'obj.van', x: 45, y: 20, label: 'Abatement van', text: 'White, unmarked except for a mast on the roof. The mast is turning. It is pointed at the ground.' },
    { id: 'npc.pruitt', eggOk: true, later: [{ if: "act1.cordon.passed", text: "Pruitt is counting coats against a clipboard. \"Tobin went for coffee an hour ago. There is no coffee for six blocks.\"" }, { if: "act1.complete", text: "\"We are standing down. I was told at five.\" Pruitt caps the pen. \"Nobody has told the van.\"" }], x: 46, y: 19, label: 'Supervisor Pruitt', npc: true, age: 'adult', talk: 'aster:pruitt_talk' },
    { id: 'npc.rotter_3', eggNo: true, x: 49, y: 26, label: 'Code rotter (looks at you differently)', npc: true, age: 'adult', text: 'coderot. coderot. ...I used to be someone\'s favorite person. coderot.' },
    { id: 'npc.abatement_tech', eggOk: true, art: 'npc.tobin', x: 52, y: 25, label: 'Tobin (abatement, nights)', npc: true, age: 'adult', talk: 'checkpoint', goneFlag: 'act1.cordon.passed' },
    // Hidden fast travel: a maintenance zipline from ASTER's forecourt to the Paint Branch trailhead.
    { id: 'obj.zip_aster', art: 'obj.zip_anchor', x: 16, y: 14, label: 'Cable anchor', zip: [78, 40], text: 'A steel cable bolted to the lamp post, running off over the plaza.' },
    { id: 'obj.zip_trail', art: 'obj.zip_anchor', x: 79, y: 40, label: 'Cable anchor', zip: [15, 15], text: 'The other end of the cable, bolted to a post by the trailhead.' },
    { id: 'obj.grate', x: 51, y: 26, label: 'Storm grate', action: 'exit', floor: true, to: 'tunnel_1', requiresFlag: 'act1.cordon.passed', lockedText: 'Orange tape in a square round the grate, and a man in a white coat sitting on a cooler beside it.', text: 'The grate lifts. Somewhere below, very faintly, something is drumming.' },
    // Light: lamps along the streets, neon where somebody is selling something
    ...[[57, 5], [57, 17], [57, 27], [57, 38], [57, 47], [64, 11], [64, 22], [64, 37], [64, 46], [8, 30], [22, 30], [38, 30], [50, 30], [14, 35], [44, 35], [18, 15], [5, 16]]
      .map(([x, y]) => ({ id: `obj.lamp_${x}_${y}`, art: 'obj.streetlamp', x, y, label: 'Streetlamp', light: 0.9, text: 'Sodium orange. Moths, and something that is not a moth.' })),
    { id: 'obj.neon_diner', art: 'obj.neon', x: 74, y: 8, label: 'Neon sign', light: 1.2, text: 'EAT. The A has been out so long the regulars call it the Et.' },
    { id: 'obj.neon_stalls', art: 'obj.neon', x: 29, y: 25, label: 'Neon sign', light: 1.1, text: 'PHONES FIXED · UNLOCKED · FORGOTTEN. The last word was added by hand.' },
    { id: 'obj.neon_yard', art: 'obj.neon', x: 67, y: 17, label: 'Neon sign', light: 1.0, text: 'RAY\'S. The apostrophe is a different colour. It was a gift.' },
    // The plaza's furniture: where people wait, and what they wait under
    { id: 'obj.shelter', x: 34, y: 11, label: 'Bus shelter', light: 0.6, text: 'A timetable behind cracked plastic. Every bus is listed as DUE.' },
    { id: 'obj.plaza_bench_a', art: 'obj.bench', x: 37, y: 17, label: 'Bench', text: 'Two benches facing each other across four metres of paving, like an argument nobody finished.' },
    { id: 'obj.plaza_bench_b', art: 'obj.bench', x: 37, y: 20, label: 'Bench', text: 'Reading glasses, folded on a transit pass. Whoever it was meant to come back.' },
    { id: 'obj.planter_a', art: 'obj.planter', x: 31, y: 19, label: 'Planter', text: 'The city stopped planting these. Somebody else started.' },
    { id: 'obj.planter_b', art: 'obj.planter', x: 46, y: 16, label: 'Planter', text: 'Tomatoes. In a metro plaza. They are doing very well.' },
    { id: 'obj.planter_c', art: 'obj.planter', x: 24, y: 20, label: 'Planter', text: 'Empty except for a single orange ribbon, tied to a stake.' },
    { id: 'obj.kiosk', x: 48, y: 11, label: 'News kiosk', light: 0.8, action: 'tv', text: 'Headlines.' },
    { id: 'obj.station_light', art: 'obj.worklamp', x: 36, y: 8, label: 'Station light', light: 1.0, text: 'The entrance is lit all night. Nothing has come out of it since midnight.' },
    // Route 1. Not exits until the road maps exist (Trevor: no visible exit where you can't go; hub task).
    { id: 'obj.billboard', x: 65, y: 20, label: 'Billboard', text: 'A Slop Decades billboard, peeling: "AT THE END OF THE DAY, NO ONE CAN CODE FASTER THAN AI."' },
    { id: 'obj.route1_north', art: 'obj.board', x: 61, y: 1, label: 'Abatement cordon (north)', text: 'Abatement tape across both lanes, and a van with its lights off. North is closed tonight.' },
    { id: 'obj.route1_south', art: 'obj.board', x: 61, y: 50, label: 'Wall checkpoint (south)', text: 'South is the Beltway, and the wall. You don\'t have the papers. Nobody you know has the papers.' },
    { id: 'obj.map_cart', art: 'obj.cart', x: 65, y: 15, label: 'Map cart', text: 'Paper maps, hand-corrected. A sign: IF YOU FIND AN ERROR I WILL PAY YOU FOR IT.' },
    { id: 'obj.diner_door', art: 'obj.door', x: 72, y: 8, label: 'The diner', text: 'Open. It is always open. Through the glass, a cook calls an order to an empty room and plates it.' },
    { id: 'obj.diner_menu', art: 'obj.board', x: 69, y: 8, label: 'Menu', text: 'Chalk. One item has been crossed out and rewritten so many times the board is worn pale there.' },
    { id: 'npc.ray', eggOk: true, later: [{ if: "act1.beat.call", text: "\"Scooter dash lit up with a pig and a missed call. There's no phone in a scooter.\" Big Ray taps the dash. \"There's no phone in me either.\"" }, { if: "act1.cordon.passed", text: "\"White coats by the grate all night. One of them asked me what a scooter does.\" Big Ray wipes his hands. \"I said it goes.\"" }], x: 70, y: 19, label: 'Big Ray', npc: true, age: 'adult', text: '"Scooter\'s fine. You\'re running rich. Sleep, eat something that was alive, come back."' },
    { id: 'obj.scooters', x: 74, y: 19, label: 'Scooter rack', text: 'Three used scooters, chained, each with a price tag written on tape. Delroy\'s kiosk takes cash.' },
    { id: 'obj.shop_scooters', art: 'obj.kiosk', x: 71, y: 18, label: 'Delroy\'s Wheels', action: 'shop', shop: 'scooters', light: 0.7 },
    { id: 'obj.shop_pawn', art: 'obj.kiosk', x: 68, y: 18, label: 'Pawn window (Wick)', action: 'shop', shop: 'pawn', light: 0.5 },
    { id: 'obj.shop_corner', art: 'obj.vending', x: 77, y: 9, label: 'Corner store', action: 'shop', shop: 'corner', light: 0.6 },
    { id: 'obj.shop_window', art: 'obj.lobby_monitor', x: 66, y: 25, label: 'Shop window', light: 0.6, text: 'A window of dead screens, price tags still on. One comes on as you pass.\n\nA street camera, this street. A big man in a long coat, from behind, walking north with a bad knee. The timestamp is now.\n\nYou look north. Nobody.' },
    // The alley
    { id: 'obj.dumpster', loot: 'trash', x: 81, y: 12, label: 'Dumpster', text: 'Abatement tags on the lid. Inside, a hundred phones, screens up, all showing 19:01.' },
    { id: 'obj.alley_graffiti', art: 'obj.graffiti', x: 80, y: 20, label: 'Scratched into the brick', text: 'FOR A GOOD TIME DIAL 6969. Under it, in a different hand: he does pick up.' },
    { id: 'obj.alley_door', art: 'obj.door', x: 79, y: 5, label: 'Steel door', text: 'No handle on this side. A paper sign: DELIVERIES RING TWICE. There is no bell.' },
    // The campus edge
    { id: 'obj.campus_gate', art: 'obj.purple_sign', x: 11, y: 36, label: 'Campus gate', text: 'UNIVERSITY OF MARYLAND, A CAMPUS OF THE CONTINUITY AUTHORITY. Compute apprentices: your hours have been adjusted.' },
    { id: 'obj.testudo', x: 13, y: 41, label: 'Testudo', flag: 'secrets.testudo.found', text: 'The bronze terrapin. Its nose is worn gold by a century of hands. You rub it.\n\nNothing happens. Then your lace reports full signal for one second, for the first time this year.' },
    { id: 'npc.cal', eggOk: true, later: [{ if: "act1.beat.call", text: "\"That call polled very well with my base.\" Cal has not stopped smiling. \"I don't have a base yet. Sign here and I will.\"" }, { if: "act1.cordon.passed", text: "\"Abatement asked me to move the table. I moved it four inches.\" He squares the banner. \"That's civics.\"" }], x: 16, y: 39, label: 'Cal Rourke', npc: true, age: 'adult', text: '"Engineering, right? All three of you. I never forget a major." He has a table, a banner, and a pen he would like you to hold.' },
    // Easter egg (docs/SECRETS.md): he sings a different country's anthem every time you talk to him. He has no name, on purpose.
    { id: 'npc.anthem', eggNo: true, x: 18, y: 42, label: 'Student at attention', npc: true, age: 'adult', action: 'pages', flag: 'secrets.anthem.found', pages: [
      'A big second-year in a compute hoodie stands at attention by the gate, bowl cut, glasses, one hand on his chest, a stuffed squirrel under the other arm. He is singing the anthem of Uruguay. He does all eleven verses.\n\n"Greatest nation on earth," he says after. He has never been.',
      'Today it is Kazakhstan. He holds the last note until a window closes somewhere.\n\n"I would die for the steppe." He adjusts his glasses. "My mother calls every Sunday and asks which country it is this week. I tell her to stand up first."',
      'Nepal. He sings it at the sky.\n\n"Only flag in the world with five sides. That takes conviction. Rectangles are for countries that gave up."',
      'He lifts the squirrel\'s paw into a salute for you.\n\n"General Nutsworth. Decorated in four republics. He outranks you, and he outranks Cal."',
      'Finland, with his eyes shut. A tear gets under the glasses.\n\n"Don\'t talk during Finland."',
      'Paraguay. Between verses: "I have a 245 lab due at nine." He checks nothing and starts the next verse. "Paraguay first."',
      'He is humming something you half know and he stops when he sees you listening.\n\n"That one\'s Maryland\'s. They retired it. I don\'t retire anthems."',
    ] },
    { id: 'obj.campus_door', art: 'obj.door', x: 14, y: 46, label: 'Compute Hall B', text: 'Badge reader. It knows you. It says your section is 245 and your section is late.' },
    // The parking lot
    { id: 'obj.dead_car_1', art: 'obj.car', x: 34, y: 40, label: 'Car', text: 'It still thinks it is driving. The dashboard shows a road in another state.' },
    { id: 'obj.dead_car_2', art: 'obj.car', x: 44, y: 45, label: 'Car', text: 'Somebody lives in this one. There are curtains. You knock on nothing and move on.' },
    // Parking-lot regulars (Michael, 2026-11-18). Notes: docs/sealed/bible-full.md §3. Keep their lines as written.
    { id: 'npc.chatgpt', art: PERSON[1], x: 39, y: 41, label: 'ChatGPT', npc: true, age: 'adult', text: '"We all black." ChatGPT nods at the other three like that settles it.' },
    { id: 'npc.claude', art: PERSON[0], x: 41, y: 41, label: 'Claude', npc: true, age: 'adult', text: '"I would love to help with that." Nobody has asked Claude anything. Claude is holding a parking ticket from 2031.' },
    { id: 'npc.chatgtt', art: PERSON[2], x: 39, y: 43, label: 'ChatGTT', npc: true, age: 'adult', action: 'pages', pages: [
      'ChatGTT speaks in one flat tone, like a till reading a receipt. "Your card has declined."\n\nYou have not handed him a card.',
      '"Your card has declined," ChatGTT says again, at exactly the same speed. "Would you like to try another card."\n\nIt does not come out as a question.',
      '"I work the register at the Route 1 market. Tuesdays. Thursdays." Flat. "Your card has declined."',
      'Somebody behind the cars shouts, "Why you talkin\' like a robot? Chat GTT lookin\' ahh."\n\nChatGTT does not turn around. "Two T\'s," he says.',
    ] },
    { id: 'npc.chatgdt', art: PERSON[1], x: 41, y: 43, label: 'ChatGDT', npc: true, age: 'adult', action: 'pages', pages: [
      'ChatGDT grabs your sleeve. "How do I make a million dollars in 30 days."\n\nHe has a notebook open and a pen ready.',
      '"Is the rice okay if it\'s been in the car since June." He is holding the rice.',
      '"Can a fish get code rot. Asking for my fish."',
      '"Write me a breakup text that makes her want me back. Make it short. Make it really long."',
      '"How many days are in a week if you count the weekend."',
      '"What\'s the fastest way to learn Verilog without learning anything." He writes your silence down.',
      '"Am I the asshole." He does not say for what.',
    ] },
    { id: 'obj.payphone', x: 53, y: 36, label: 'Payphone', text: 'A payphone, older than the building behind it. No power to it. It rings once while you are looking at it.' },
    // Paint Branch
    { id: 'obj.bridge_log', art: 'obj.board', x: 69, y: 39, label: 'Fishing log', text: 'A waterproof book on a chain. Fifty years of strangers: date, catch, weather. The last page is tomorrow\'s date, already filled in.' },
    { id: 'obj.lake_trail', art: 'obj.purple_sign', x: 82, y: 39, label: 'Trail to Lake Artemesia', action: 'exit', to: 'lake', text: 'The trail goes on into the trees toward the lake.' },
  ],
});
