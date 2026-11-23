// [SCAFFOLD] Districts: the two biggest regions become several maps each (10-scope.md stretch tier; Trevor: "this
// game must be much larger scale"). Baltimore (Act 2) gets its rowhouse streets, the refinery, the Callers' hall
// and the port authority; the Corridor (Act 3) gets its worker town, the substation, the cooling towers and the
// waterworks. Text grids with the level builder. Baltimore has its art and final text (hub #6); the Corridor's
// "[scaffold]" lines are still from the atlas. Story is the lore gate's.
import { fromGrid } from './builder.js';

const door = (to, id, pair, label, text) => ({ exit: to, id, pair, art: 'obj.door', label, text, stepOn: true });
const road = (to, id, pair, label, text, tile) => ({ exit: to, id, pair, selfDrawn: true, label, text, stepOn: true, ...(tile ? { tile } : {}) });

// ======================= Baltimore (Act 2) =======================
// Art pass (hub #6): the 'baltimore' sheet (tools/art/gen_baltimore.py). Pieces stand on the bottom edge of their
// tile at their drawn size. North-wall pieces are `floor: true` so whatever stands on the wall row (the Callers'
// book) draws in front of them. The text in these four maps is final.

// Lay scenery along a row: specs is [[x, art, extra?], ...].
const along = (L, y, specs, base = {}) => { for (const [x, art, extra] of specs) L.scenery(art, x, y, { ...base, ...extra }); return L; };
// Dress a north wall two rows deep with 16x32 pieces on its lower row; pick(x) chooses each one.
const northWall = (L, x0, x1, pick) => along(L, 1, Array.from({ length: x1 - x0 + 1 }, (_, i) => [x0 + i, pick(x0 + i)]), { floor: true });

// ---- Rowhouse streets: marble steps, a mural of John Pork that gets him slightly wrong ----
// Continuous fronts, two storeys under a cornice. Each door sits in a recess: its upper storey stands on the wall
// row, its doorway and marble steps are a floor piece in the recess, so you climb the steps in front of the door.
// The skyline runs along the top edge, across the harbor.
const rows = fromGrid({
  id: 'bmore_rows', name: 'The rowhouse streets', fill: 'q', outdoor: true, act: 2,
  rows: [
    '##########R#########H##########',
    '#ppppppppppppppppppppppppppppp#',
    '#p#######ppp#######ppp###p###p#',
    '#p#o#d#d#ppp#d#d#O#ppp#d#p#M#p#',
    '#sssssssssssssssssssssssssssss#',
    '#ssssssssssssssssssssssssssssss#',
    '#qqqqqqqqqqqqqqqqqqqqqqqqqqqqq#',
    'Bqq@qqqqqqqqqqEqqqqqqqqqqqEqqqP',
    '##############################',
  ].map((r) => r.padEnd(31, '#').slice(0, 31)),
  legend: {
    // The stoops keep the ids they had when they were drawn as boards, so nothing that points at them breaks.
    o: { prop: 'bm.row_door_scrubbed', id: 'obj.bmore_rows_board_3_3', floor: true, label: 'Marble steps', text: 'Scrubbed white this morning. The bucket is still out, with a block of pumice worn down to the size of a bar of soap.' },
    O: { prop: 'bm.row_door_form_scrubbed', id: 'obj.bmore_rows_board_17_3', floor: true, label: 'Marble steps', text: 'Formstone up top, marble underfoot. Somebody has chalked a line across the top step and written WET under it.' },
    d: { tile: 's' },   // a doorway recess; its door is scenery below
    M: { prop: 'bm.mural', id: 'obj.bmore_mural', tile: '#', label: 'A mural of John Pork', text: 'John Pork, two stories tall, in his red plaid, over the harbor. Someone repaints the snout every spring. The candles at the bottom are newer than the paint.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    B: road('baltimore', 'obj.rows_to_baltimore', 'obj.baltimore_to_bmore_rows', 'West, back to the harbor street', 'Back toward the water.', 'q'),
    R: road('bmore_refinery', 'obj.rows_to_refinery', 'obj.refinery_out', 'North to the refinery', 'Under the red sign.', 'p'),
    H: road('bmore_hall', 'obj.rows_to_hall', 'obj.hall_out', 'The Callers\' hall', 'A crowd at the door, singing.', 'p'),
    P: road('bmore_authority', 'obj.rows_to_authority', 'obj.authority_out', 'East to the port authority', 'Continuity flags on the gate.', 'q'),
  },
});
along(rows, 3, [   // the window bays, each covering both wall rows
  [2, 'bm.row_brick_lit'], [4, 'bm.row_brick_screen'], [6, 'bm.row_form'], [8, 'bm.row_form_lit'],
  [12, 'bm.row_brick'], [14, 'bm.row_brick_board'], [16, 'bm.row_form_lit'], [18, 'bm.row_form'],
  [22, 'bm.row_brick_screen'], [24, 'bm.row_brick'],
]);
along(rows, 2, [   // the upper storey over each door, with its house's cornice
  [3, 'bm.row_upper_lit'], [5, 'bm.row_upper'], [7, 'bm.row_upper_form'], [13, 'bm.row_upper'],
  [15, 'bm.row_upper_board'], [17, 'bm.row_upper_form'], [23, 'bm.row_upper'],
]);
along(rows, 3, [   // the doorways that aren't stoop objects
  [5, 'bm.row_door_teal'], [7, 'bm.row_door_form'], [13, 'bm.row_door_dark'], [15, 'bm.row_door_board'], [23, 'bm.row_door'],
], { floor: true });
along(rows, 0, [[1, 'bm.sky_stacks'], [11, 'bm.sky_downtown'], [21, 'bm.sky_cranes']], { w: 9, floor: true });
along(rows, 5, [[8, 'obj.streetlamp'], [18, 'obj.streetlamp'], [28, 'obj.streetlamp']], { light: 0.9 });
export const bmoreRows = rows.scenery('obj.bin', 25, 4).build();

// ---- The sugar refinery: the sign still lit red over the water ----
// SHOAL across the wall in soft-red neon (the S flickers), silos where the degassers stood in, a stack that still
// breathes, and the switch nobody is allowed to touch. The sign is the thing you look at: an object on the wall tile
// under the S. The harbor street's marker (act2_regions.js) is the same sign seen from the water.
const refinery = fromGrid({
  id: 'bmore_refinery', name: 'The sugar refinery', fill: ':', act: 2, wear: 'tunnel',
  rows: [
    '##############################',
    '####################$#########',
    '#:::::::::::::::::::::::::::?#',
    '#::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::#',
    '#:::E::::::::E:::::::::::::::#',
    '#::::::::::::::::::::::E:::::#',
    '#::::::::::::::::::::::::@:::#',
    '#########################DD###',
  ],
  legend: {
    // The sign itself, on the right half of the S. Drawn by the scenery letters below (selfDrawn), so it adds no
    // art. It has the id the preacher's quest looks for (side.bmore_sign), so saves keep their place in it.
    $: { prop: 'bm.sign_S', id: 'obj.bmore_sign', selfDrawn: true, tile: '#', label: 'The refinery sign', text: 'SHOAL in red tube, every letter taller than you. Every few seconds the S cuts out, then comes back on with a hum.',
         textAfter: { flag: 'boss.bmore_sign.down', text: 'SHOAL in red tube, every letter taller than you. All five burn steady now, the S too. The hum is gone.' } },   // the keeper's quest steadies it (story #52, hub #77)
    '?': { prop: 'bm.sign_switch', id: 'obj.refinery_switch', label: 'The sign\'s switch', text: 'The switch for the sign, taped in the ON position. Many layers of tape, some of it older than you. A note under the newest layer: "LEAVE IT. THE BOATS STEER BY IT."' },
    E: { enemy: 'enemy.spitter' },
    '@': { spawn: true },
    D: door('bmore_rows', 'obj.refinery_out', 'obj.rows_to_refinery', 'Back out to the streets', 'Back outside.'),
  },
});
const REF_WALL = { 2: 'bm.wall_ref_vent', 5: 'bm.wall_ref_valve', 9: 'bm.wall_ref_door', 12: 'bm.wall_ref_vent', 17: 'bm.wall_ref_valve', 24: 'bm.wall_ref_door', 27: 'bm.wall_ref_vent' };
northWall(refinery, 1, 28, (x) => REF_WALL[x] ?? 'bm.wall_ref');
along(refinery, 1, [[19, 'bm.sign_S', { anim: 900, stillAfter: 'boss.bmore_sign.down' }], [21, 'bm.sign_H'], [23, 'bm.sign_O'], [25, 'bm.sign_A'], [27, 'bm.sign_L']], { w: 2, light: 0.8, floor: true });
along(refinery, 3, [[2, 'bm.silo'], [6, 'bm.silo'], [10, 'bm.silo'], [14, 'bm.silo']], { w: 2, h: 2, solid: true });
export const bmoreRefinery = refinery.scenery('bm.smokestack', 17, 3, { solid: true }).enemy('boss.bmore_sign', 4, 2).build();

// ---- The Callers' hall: their biggest congregation, on an old cannery floor; the book of what people heard ----
// Market-stall frames turned into pews, a Callers' banner of John Pork, the book on a stall post under it.
const hall = fromGrid({
  id: 'bmore_hall', name: 'The Callers\' hall', fill: '.', act: 2, wear: 'lived',
  rows: [
    '##########################',
    '#############K############',
    '#..[bbbbbb].....[bbbbbb].#',
    '#........................#',
    '#..[bbbbbb].....[bbbbbb].#',
    '#........................#',
    '#..[bbbbbb].....[bbbbbb].#',
    '#...........@............#',
    '############DD############',
  ],
  legend: {
    '[': { scenery: 'bm.pew_l', solid: true, tile: '.' },
    b: { scenery: 'bm.pew', solid: true, tile: '.' },
    ']': { scenery: 'bm.pew_r', solid: true, tile: '.' },
    K: { prop: 'bm.book_stand', id: 'obj.callers_book', tile: '#', label: 'The book of what they heard', text: 'The Callers\' book: what each of them heard when he called, written in their own hand. The pages run past a thousand. Slips of paper stick out where people came back to add a word.' },
    '@': { spawn: true },
    D: door('bmore_rows', 'obj.hall_out', 'obj.rows_to_hall', 'Back out to the streets', 'Back outside.'),
  },
});
northWall(hall, 1, 24, (x) => (x % 4 === 3 ? 'bm.wall_hall_lamp' : 'bm.wall_hall'));
export const bmoreHall = hall.scenery('bm.banner_pork', 13, 1, { w: 1, floor: true }).build();

// ---- The port authority: Continuity holds the paperwork, and the quay behind it ----
// The office (x 0-23): a window wall onto the harbor, desks in rows, the ledger. Through the side gate, the harbor
// side: containers two high along the fence, flatcars on a spur, a ship-to-shore crane on the quay with a box in
// its spreader, bollards, a timber pier and a short jetty.
const authority = fromGrid({
  id: 'bmore_authority', name: 'The port authority', fill: 'e', act: 2,
  rows: [
    '########################################~~~~',
    '########################,,,,,,,,,,,,,,,,~~~~',
    '#e==e==e==eeee==e==e==e#,,,,,,,,,,,,,,,,~~~~',
    '#eeeeeeeeeeeeeeeeeeee$e#,,,,,,,,,,,,,,,,bbb~',
    '#e==e==e==eeee==e==e==e#hhhhhhhhhhhh,,,,~~~~',
    '#eeeeEeeeeeeeeeeeeEeeeee,,,,,,,,,,,,,,,,~~~~',
    'Deee@eeeeeeeeeeeeeeeeeee,,,,,,,,,,,,,,,,,,,~',
    '########################################~~~~',
  ],
  legend: {
    $: { prop: 'bm.ledger_ca', id: 'obj.authority_ledger', label: 'Port ledger', text: 'The port ledger, printing as you watch: shifts and berths in Continuity\'s typeface. A coffee ring on page one got scanned years ago, so now it\'s on every copy.' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    D: road('bmore_rows', 'obj.authority_out', 'obj.rows_to_authority', 'Back out to the streets', 'Back outside.', 'e'),
  },
});
const CA_WALL = { 1: 'bm.wall_ca', 4: 'bm.wall_ca_window_crane', 6: 'bm.wall_ca_flag', 11: 'bm.wall_ca', 12: 'bm.wall_ca', 17: 'bm.wall_ca_flag', 19: 'bm.wall_ca_window_crane', 22: 'bm.wall_ca' };
northWall(authority, 1, 22, (x) => CA_WALL[x] ?? 'bm.wall_ca_window');
authority.scenery('bm.sky_downtown', 30, 0, { w: 9, floor: true });
// the quay: coping and fenders along the edge, the pier, the jetty and the wall under it; rails on the spur
for (const [x, y, art] of [[39, 1, 'bm.quay_e'], [39, 2, 'bm.quay_e'], [39, 4, 'bm.quay_e'], [39, 5, 'bm.quay_e'], [42, 6, 'bm.quay_e'],
  [40, 3, 'bm.pier'], [41, 3, 'bm.pier'], [42, 3, 'bm.pier_end'], [40, 7, 'bm.quay_s'], [41, 7, 'bm.quay_s'], [42, 7, 'bm.quay_s'],
  [25, 4, 'bm.rail_h'], [29, 4, 'bm.rail_h'], [33, 4, 'bm.rail_h_weeds'], [34, 4, 'bm.rail_h'], [35, 4, 'bm.rail_h_weeds']]) authority.scenery(art, x, y, { floor: true });
// the spur's buffer stop and flatcars; stacks along the back fence, singles on the near side
along(authority, 4, [[24, 'bm.rail_stop'], [26, 'bm.flatcar_box', { w: 3 }], [30, 'bm.flatcar', { w: 3 }]], { solid: true });
along(authority, 2, [[24, 'bm.boxes_rust_teal'], [27, 'bm.boxes_ca'], [30, 'bm.box_grey']], { w: 3, h: 2, solid: true });
along(authority, 6, [[25, 'bm.box_mustard', { w: 3 }], [30, 'bm.box20_rust', { w: 2 }]], { solid: true });
// the crane, drawn once, standing on a bogie under each leg (the legs are what you bump into); bollards on the edge
// and the pier end, kept clear of the crane's boom, trolley and hanging box so nothing solid hides behind them
authority.scenery('bm.crane', 35, 6, { w: 4, light: 0.6 });
along(authority, 6, [[35, 'bm.crane_bogie'], [38, 'bm.crane_bogie'], [42, 'bm.bollard_rope_s']], { solid: true });
along(authority, 1, [[39, 'bm.bollard_rope']], { solid: true });
along(authority, 3, [[42, 'bm.bollard']], { solid: true });
export const bmoreAuthority = authority.build();

// ======================= The Corridor (Act 3) =======================

// ---- The worker town: a town that sold its river, kept as housing between the halls ----
export const corTown = fromGrid({
  id: 'cor_town', name: 'The worker town', fill: 'g', outdoor: true, act: 3,
  rows: [
    'TTTTTTTTTTUTTTTTTTTTTWTTTTTTTTTT',
    'Tggggggggg,gggggggggg,ggggggggggT',
    'Tgg###g###,###g###gg,g###g###ggT',
    'Tgg#o#g#.#,#.#g#o#gg,g#.#g#o#ggT',
    'Tggggggggg,gggggggggg,ggggggggggT',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,C',
    'TggggggggggggggggEggggggggggggggT',
    'Tgggggggg@gggggggggggggggggEgggT',
    'TTTTTTTTTSSTTTTTTTTTTTTTTTTTTTTT',
  ].map((r) => r.padEnd(33, 'T').slice(0, 33)),
  legend: {
    o: { prop: 'obj.board', label: 'A company house', text: '[scaffold] A company house. The porch light is on a timer set by the hall.' },
    E: { enemy: 'enemy.autocomplete' },
    '@': { spawn: true },
    S: road('corridor', 'obj.town_to_corridor', 'obj.corridor_to_cor_town', 'South, back to the halls', 'Back toward the halls.', 'g'),
    U: road('cor_substation', 'obj.town_to_substation', 'obj.substation_out', 'North to the substation', 'A hum you feel in your teeth.', ','),
    W: road('cor_waterworks', 'obj.town_to_waterworks', 'obj.waterworks_out', 'The waterworks', 'Where the river went.', ','),
    C: road('cor_cooling', 'obj.town_to_cooling', 'obj.cooling_out', 'East to the cooling towers', 'Steam, breathing.', ','),
  },
}).build();

// ---- The substation: transformers like a field of iron ----
export const corSubstation = fromGrid({
  id: 'cor_substation', name: 'The substation', fill: ',', outdoor: true, act: 3,
  rows: [
    '############################',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,TT,TT,TT,TT,TT,TT,TT,TT,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,?,#',
    '#,TT,TT,TT,,,,,,,,TT,TT,,,,#',
    '#,,,,,,,,,,,,E,,,,,,,,,,,,,#',
    '#,TT,TT,TT,,,,,,,,TT,TT,,E,#',
    '#,,,,,,,,,,,,@,,,,,,,,,,,,,#',
    '#############SS#############',
  ],
  legend: {
    T: { scenery: 'obj.degasser', solid: true, tile: ',' },
    '?': { prop: 'obj.board', id: 'obj.substation_log', label: 'Switching log', text: '[scaffold] A switching log. Half the entries are signed by a person. Half are signed "auto."' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    S: road('cor_town', 'obj.substation_out', 'obj.town_to_substation', 'Back to town', 'Back to the worker town.', ','),
  },
}).build();

// ---- The cooling towers: steam, breathing; rain that evaporates before it lands ----
export const corCooling = fromGrid({
  id: 'cor_cooling', name: 'The cooling towers', fill: ',', outdoor: true, act: 3,
  rows: [
    '##################################',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,,WWW,,,,,WWW,,,,,,,,,,,,,,,,,,,#',
    '#,,WWW,,,,,WWW,,,,,,,,,,,,,,,,?,,#',
    '#,,WWW,,,,,WWW,,,,,,,,,,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,E,,,,,,,,,#',
    'D,,@,,,,,,,,,,,,,,,,,,,,,,,,,,E,,#',
    '##################################',
  ],
  legend: {
    W: { scenery: 'obj.degasser', solid: true, tile: ',' },
    '?': { prop: 'obj.board', id: 'obj.cooling_gauge', label: 'Temperature gauge', text: '[scaffold] The needle is past red, into a band someone painted later and labeled "fine."' },
    E: { enemy: 'enemy.spitter' },
    '@': { spawn: true },
    D: road('cor_town', 'obj.cooling_out', 'obj.town_to_cooling', 'West, back to town', 'Back to the worker town.', ','),
  },
}).enemy('boss.cor_tower', 28, 2).build();

// ---- The waterworks: the river the town sold, piped into the halls ----
export const corWaterworks = fromGrid({
  id: 'cor_waterworks', name: 'The waterworks', fill: ':', act: 3,
  rows: [
    '##############################',
    '#::::::::::::::::::::::::::::#',
    '#:~~~~~~~~~~~~~~~~~~~~~~~~~~:#',
    '#:~~~~~~~~~~~~~~~~~~~~~~~~~~:#',
    '#::::::::::::::::::::::::::::#',
    '#:::?::::::::::::::::::::E:::#',
    '#::::::::::E:::::::::::::::::#',
    '#:::::::::::::::::::::@::::::#',
    '######################SS######',
  ],
  legend: {
    '?': { prop: 'obj.board', id: 'obj.waterworks_deed', label: 'The deed', text: '[scaffold] The town\'s deed to the river, framed. Under it, the sale. Under that, the town\'s name, crossed out.' },
    E: { enemy: 'enemy.moth' },
    '@': { spawn: true },
    S: road('cor_town', 'obj.waterworks_out', 'obj.town_to_waterworks', 'Back to town', 'Back to the worker town.', ':'),
  },
}).enemy('boss.cor_intake', 4, 1).build();
