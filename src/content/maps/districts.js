// [SCAFFOLD] Districts: the two biggest regions become several maps each (10-scope.md stretch tier; Trevor: "this
// game must be much larger scale"). Baltimore (Act 2) gets its rowhouse streets, the refinery, the Callers' hall
// and the port authority; the Corridor (Act 3) gets its worker town, the substation, the cooling towers and the
// waterworks. Text grids with the level builder; every "[scaffold]" line from the atlas. Story is the lore gate's.
import { fromGrid } from './builder.js';

const door = (to, id, pair, label, text) => ({ exit: to, id, pair, art: 'obj.door', label, text, stepOn: true });
const road = (to, id, pair, label, text, tile) => ({ exit: to, id, pair, selfDrawn: true, label, text, stepOn: true, ...(tile ? { tile } : {}) });

// ======================= Baltimore (Act 2) =======================

// ---- Rowhouse streets: marble steps, murals of Pork that get him slightly wrong ----
export const bmoreRows = fromGrid({
  id: 'bmore_rows', name: 'The rowhouse streets', fill: 'q', outdoor: true, act: 2,
  rows: [
    '##########R#########H#########',
    '#qqqqqqqqqsqqqqqqqqqsqqqqqqqqq#',
    '#q###q###q#q###q###q#q###q###q#',
    '#q#o#q#.#q#q#.#q#o#q#q#.#q#M#q#',
    '#qqqqqqqqqqqqqqqqqqqqqqqqqqqqq#',
    '#ssssssssssssssssssssssssssssss#',
    '#qqqqqqqqqqqqqqqqqqqqqqqqqqqqq#',
    'Bqq@qqqqqqqqqqEqqqqqqqqqqqEqqqP',
    '##############################',
  ].map((r) => r.padEnd(31, '#').slice(0, 31)),
  legend: {
    o: { prop: 'obj.board', label: 'Marble steps', text: '[scaffold] Scrubbed white this morning. Outbreak or no outbreak.' },
    M: { prop: 'obj.board', id: 'obj.bmore_mural', label: 'A mural of Pork', text: '[scaffold] A mural of Pork. It gets him slightly wrong, in a way he would mind.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    B: road('baltimore', 'obj.rows_to_baltimore', 'obj.baltimore_to_bmore_rows', 'West, back to the harbor street', 'Back toward the water.', 'q'),
    R: road('bmore_refinery', 'obj.rows_to_refinery', 'obj.refinery_out', 'North to the refinery', 'Under the red sign.', 's'),
    H: road('bmore_hall', 'obj.rows_to_hall', 'obj.hall_out', 'The Callers\' hall', 'A crowd at the door, singing.', 's'),
    P: road('bmore_authority', 'obj.rows_to_authority', 'obj.authority_out', 'East to the port authority', 'Continuity flags on the gate.', 'q'),
  },
}).build();

// ---- The sugar refinery: the sign still lit red over the water ----
export const bmoreRefinery = fromGrid({
  id: 'bmore_refinery', name: 'The sugar refinery', fill: ':', act: 2,
  rows: [
    '##############################',
    '#::::::::::::::::::::::::::::#',
    '#:TT::TT::TT::TT::::::::::::?#',
    '#:TT::TT::TT::TT:::::::::::::#',
    '#::::::::::::::::::::::::::::#',
    '#:::E::::::::E:::::::::::::::#',
    '#::::::::::::::::::::::E:::::#',
    '#::::::::::::::::::::::::@:::#',
    '#########################DD###',
  ],
  legend: {
    T: { scenery: 'obj.degasser', solid: true, tile: ':' },
    '?': { prop: 'obj.board', id: 'obj.refinery_switch', label: 'The sign\'s switch', text: '[scaffold] The switch for the red sign. Taped ON. A note: "Leave it. People navigate by it."' },
    E: { enemy: 'enemy.spitter' },
    '@': { spawn: true },
    D: door('bmore_rows', 'obj.refinery_out', 'obj.rows_to_refinery', 'Back out to the streets', 'Back outside.'),
  },
}).enemy('boss.bmore_sign', 4, 2).build();

// ---- The Callers' hall: their biggest congregation; the book of what people say they heard ----
export const bmoreHall = fromGrid({
  id: 'bmore_hall', name: 'The Callers\' hall', fill: '.', act: 2,
  rows: [
    '##########################',
    '#............K...........#',
    '#..bbbbbbbb.....bbbbbbbb.#',
    '#........................#',
    '#..bbbbbbbb.....bbbbbbbb.#',
    '#........................#',
    '#..bbbbbbbb.....bbbbbbbb.#',
    '#...........@............#',
    '############DD############',
  ],
  legend: {
    b: { scenery: 'obj.table', solid: true, tile: '.' },
    K: { prop: 'obj.board', id: 'obj.callers_book', label: 'The book of what they heard', text: '[scaffold] The Callers\' book: what people say they heard when he called. A thousand entries. Some of them agree.' },
    '@': { spawn: true },
    D: door('bmore_rows', 'obj.hall_out', 'obj.rows_to_hall', 'Back out to the streets', 'Back outside.'),
  },
}).build();

// ---- The port authority: Continuity holds the paperwork ----
export const bmoreAuthority = fromGrid({
  id: 'bmore_authority', name: 'The port authority', fill: 'e', act: 2,
  rows: [
    '########################',
    '#eeeeeeeeeeeeeeeeeeeeee#',
    '#e==e==e==eeee==e==e==e#',
    '#eeeeeeeeeeeeeeeeeeee$e#',
    '#e==e==e==eeee==e==e==e#',
    '#eeeeEeeeeeeeeeeeeEeeee#',
    'Deee@eeeeeeeeeeeeeeeeee#',
    '########################',
  ],
  legend: {
    $: { prop: 'obj.crate', id: 'obj.authority_ledger', label: 'Port ledger', text: '[scaffold] The port ledger. Every container accounted for, except the ones that are.' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    D: road('bmore_rows', 'obj.authority_out', 'obj.rows_to_authority', 'Back out to the streets', 'Back outside.', 'e'),
  },
}).build();

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
