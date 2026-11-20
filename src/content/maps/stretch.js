// [SCAFFOLD] Stretch-tier areas (10-scope.md; Trevor: "this game must be much larger scale"): eight more for Act 2,
// four more for Act 3, each one a place the atlas names. Text grids with the level builder; every "[scaffold]"
// line from the atlas. The polish pass decides which of these earn their keep.
import { fromGrid } from './builder.js';

const back = (to, id, label, tile, art = false) => ({ exit: to, id: `obj.${id}_out`, pair: `obj.${to}_to_${id}`, ...(art ? { art: 'obj.door' } : { selfDrawn: true }), label, stepOn: true, text: 'Back the way you came.', ...(tile ? { tile } : {}) });
const npc = (id, art, label, line) => ({ npc: `npc.${id}`, art, label, text: `[scaffold] ${line}` });
const R1 = 'npc.rotter_1', R2 = 'npc.rotter_2', R3 = 'npc.rotter_3';

// ======================= Act 2 =======================

// ---- The refuge, deeper: the violent fringe, a day's walk in ----
export const rfFringe = fromGrid({
  id: 'rf_fringe', name: 'The fringe camp', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TgggTTggggggggggggTTgggggT',
    'Tgg####gggggggggg####ggggT',
    'Tgg#..#ggggNgggggg#..#gggT',
    'Tgg##.#gggggggggg##.#ggggT',
    'TggggggggggEgggggggggg?ggT',
    'TgggggEggggggggggggEgggggT',
    'Tgggggggggggg@ggggggggggggT',
    'TTTTTTTTTTTTTSSTTTTTTTTTTT',
  ].map((r) => r.slice(0, 26)),
  legend: {
    N: npc('rf_fringe_leader', R3, 'A man with a slate of names', '"Every name on here took an implant. We\'re keeping count. That\'s all. For now."'),
    '?': { prop: 'obj.board', id: 'obj.rf_fringe_list', label: 'A slate of names', text: '[scaffold] Names in chalk. Some are crossed out. Some have a mark next to them you don\'t like.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    S: back('refuge', 'rf_fringe', 'Back toward the settlement', 'g'),
  },
}).build();

// ---- The refuge marsh: boardwalks and bird blinds ----
export const rfMarsh = fromGrid({
  id: 'rf_marsh', name: 'The marsh boardwalk', fill: '~', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTSSTTTTTTTTTTTT',
    '~~~~~~~~~~~~~~bb~~~~~~~~~~~~',
    '~~bbbbbbbbbbbbbbbbbbbbbbbb~~',
    '~~b~~~~~~~~~~~bb~~~~~~~~~b~~',
    '~~b~~~~~~~~~~~bb~~~~~~~~~b~~',
    '~~bbbbbNbbbbbbbbbbbbbb?bbb~~',
    '~~~~~~~~~~~~~~@b~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],
  legend: {
    N: npc('rf_counter', R1, 'A bird counter', '"Forty years of tallies. The herons are up. Nothing else is."'),
    '?': { prop: 'obj.board', id: 'obj.rf_blind', label: 'A bird blind', text: '[scaffold] A blind, and a tally board in pencil. The newest column is headed "things that aren\'t birds."' },
    '@': { spawn: true, tile: 'b' },
    S: back('refuge', 'rf_marsh', 'Back up to the forest', 'b'),
  },
}).build();

// ---- The Meade: ten thousand spaces, forty cars ----
export const mdLot = fromGrid({
  id: 'md_lot', name: 'The Meade parking lot', fill: ',', outdoor: true, act: 2,
  rows: [
    '#############SS###############',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,c,,,,,,,,,,,,,,,,,,c,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,,,,,,,,,c,,,,,,,,,,,,,,,?,,#',
    '#,,,,,,,,,,,,,N,,,,,,,,,,,,,,#',
    '#,,,,,,c,,,,,,,,,,,,,,,,E,,,,#',
    '#,,,,,,,,,,,,@,,,,,,,,,,,,,,,#',
    '##############################',
  ],
  legend: {
    c: { scenery: 'obj.van', solid: true, tile: ',' },
    N: npc('md_attendant', R2, 'A lot attendant', '"Ten thousand spaces. Forty cars. I know every one by the dent."'),
    '?': { prop: 'obj.board', id: 'obj.md_lot_sign', label: 'Reserved sign', text: '[scaffold] RESERVED: DEPUTY DIRECTOR. The space is empty. The paint is fresh.' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    S: back('meade', 'md_lot', 'Back to the perimeter road', ','),
  },
}).build();

// ---- Annapolis: the wooden statehouse, above the waterline ----
export const annStatehouse = fromGrid({
  id: 'ann_statehouse', name: 'The statehouse', fill: '.', act: 2,
  rows: [
    '########################',
    '#......................#',
    '#..bbbb..........bbbb..#',
    '#..........?...........#',
    '#..bbbb..........bbbb..#',
    '#.........N............#',
    '#..........@...........#',
    '###########DD###########',
  ],
  legend: {
    b: { scenery: 'obj.table', solid: true, tile: '.' },
    '?': { prop: 'obj.board', id: 'obj.ann_tideline', label: 'The tide line', text: '[scaffold] A line painted on the wall at knee height, and dates beside it. The newest date is above the line.' },
    N: npc('ann_clerk', R3, 'A clerk of a legislature that doesn\'t meet', '"We have quorum on Tuesdays. It\'s me and the portrait."'),
    '@': { spawn: true },
    D: back('annapolis', 'ann_statehouse', 'Back out to the tide', '.', true),
  },
}).build();

// ---- Annapolis: the academy chapel ----
export const annChapel = fromGrid({
  id: 'ann_chapel', name: 'The academy chapel', fill: '.', act: 2,
  rows: [
    '######################',
    '#..........?.........#',
    '#.bbbbbb......bbbbbb.#',
    '#....................#',
    '#.bbbbbb......bbbbbb.#',
    '#.........N..........#',
    '#..........@.........#',
    '###########DD#########',
  ],
  legend: {
    b: { scenery: 'obj.table', solid: true, tile: '.' },
    '?': { prop: 'obj.board', id: 'obj.ann_chapel_roll', label: 'The roll of honor', text: '[scaffold] Names of midshipmen, by class year. The last class has no names, only the year.' },
    N: npc('ann_chaplain', R1, 'A chaplain with no fleet', '"I pray for the fleet. Nobody\'s told me where it is."'),
    '@': { spawn: true },
    D: back('annapolis', 'ann_chapel', 'Back out to the streets', '.', true),
  },
}).build();

// ---- The bay bridge, with a missing span ----
export const annBridge = fromGrid({
  id: 'ann_bridge', name: 'The broken bridge', fill: '~', outdoor: true, act: 2,
  rows: [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~,,,,,,,,,,,,,,,,,,,~~~~~~,,,,,~',
    'S,@,,,,,,N,,,,,,,,?,~~~~~~,,,,,~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],
  legend: {
    N: npc('ann_fisher', R2, 'Someone fishing off the bridge', '"The far half\'s still there. You just can\'t get to it. Story of the bay."'),
    '?': { prop: 'obj.board', id: 'obj.ann_span', label: 'The end of the span', text: '[scaffold] The road stops. Across the gap, the rest of the bridge, and an island that is on the old charts and not on the water.' },
    '@': { spawn: true, tile: ',' },
    S: back('annapolis', 'ann_bridge', 'Back to Annapolis', ','),
  },
}).build();

// ---- Beltsville: the tissue lab ----
export const bvLab = fromGrid({
  id: 'bv_lab', name: 'The tissue lab', fill: 'e', act: 2,
  rows: [
    '########################',
    '#eeeeeeeeeeeeeeeeeeeeee#',
    '#e==e==e==eeeeTTeeTTeee#',
    '#eeeeeeeeeeeeeTTeeTTeee#',
    '#eeeeeeeeeeNeeeeeeeeee?#',
    '#eeEeeeeeeeeeeeeeeEeeee#',
    '#eeeeeeeeeee@eeeeeeeeee#',
    '############SS##########',
  ],
  legend: {
    T: { scenery: 'obj.degasser', solid: true, tile: 'e' },
    N: npc('bv_lab_tech', R2, 'A lab technician', '"We grow them in batches. Every batch has a line on the board. One line got scrubbed, and nobody will say why."'),
    '?': { prop: 'obj.board', id: 'obj.bv_batch_board', label: 'Batch board', text: '[scaffold] Batch numbers, dates, and a column marked "took." Most say yes. One says "took, but."' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    S: back('beltsville', 'bv_lab', 'Back out to the farm', 'e', true),
  },
}).build();

// ---- Greenbelt's old town center: curved streets, a theater, the co-op's first storefront ----
export const gbCenter = fromGrid({
  id: 'gb_center', name: 'Greenbelt town center', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'Tggggg######gggg######gggggT',
    'Tggggg#.?..#gggg#....#gggggT',
    'Tggggg###.##gggg###.##gggggT',
    'Tgggqqqqqqqqqqqqqqqqqqqqggg T',
    'TgggqgggggggggNggggggggqgggT',
    'Tgggqqqqqqqqqqqqqqqqqqqqggg T',
    'Tggggggggggg@ggggggggggggggT',
    'TTTTTTTTTTTTSSTTTTTTTTTTTTTT',
  ].map((r) => r.replace(' ', 'g')),
  legend: {
    '?': { prop: 'obj.board', id: 'obj.gb_theater', label: 'The theater marquee', text: '[scaffold] NOW SHOWING: the same film since 2063, by a vote of 6 to 5. Every year, a recount.' },
    N: npc('gb_usher', R1, 'An usher', '"Tickets are free. Seats are assigned by committee. You\'re in row Q."'),
    '@': { spawn: true },
    S: back('greenbelt', 'gb_center', 'Back down to the co-op streets', 'g'),
  },
}).build();

// ======================= Act 3 =======================

// ---- Gaithersburg: the labs, where every faction's clocks are checked ----
export const gtLabs = fromGrid({
  id: 'gt_labs', name: 'The measurement labs', fill: 'e', act: 3,
  rows: [
    '##########################',
    '#eeeeeeeeeeeeeeeeeeeeeeee#',
    '#e==e==eeeeeeeee==e==eee?#',
    '#eeeeeeeeeeeeeeeeeeeeeeee#',
    '#e==e==eeeeNeeee==e==eeee#',
    '#eeeeEeeeeeeeeeeeeeeEeeee#',
    '#eeeeeeeeeee@eeeeeeeeeeee#',
    '############DD############',
  ],
  legend: {
    '?': { prop: 'obj.board', id: 'obj.gt_volt', label: 'The volt standard', text: '[scaffold] The reference volt, in a glass case. A sign: DO NOT LICK. Someone has added: AGAIN.' },
    N: npc('gt_metrologist', R2, 'A metrologist', '"Every faction sends someone to check their clocks against ours. They all leave unhappy. That\'s how you know it works."'),
    E: { enemy: 'enemy.moth' },
    '@': { spawn: true },
    D: back('gaithersburg', 'gt_labs', 'Back out to the campus', 'e', true),
  },
}).build();

// ---- Frederick: the market hall ----
export const frMarket = fromGrid({
  id: 'fr_market', name: 'The market hall', fill: '.', act: 3,
  rows: [
    '##########################',
    '#........................#',
    '#.$$$..$$$..$$$..$$$..?..#',
    '#........................#',
    '#.$$$..$$$..$$$..$$$.....#',
    '#.........N..........M...#',
    '#...........@............#',
    '############SS############',
  ],
  legend: {
    $: { scenery: 'obj.crate', solid: true, tile: '.' },
    '?': { prop: 'obj.board', id: 'obj.fr_prices', label: 'Price board', text: '[scaffold] Prices in chalk. Everything costs a little more than last week, and the chalk is a little shorter.' },
    N: npc('fr_grocer', R3, 'A grocer', '"Apples from the ridge. Don\'t ask what\'s on the ridge. Do buy the apples."'),
    M: npc('fr_market_kid', R1, 'A kid minding a stall', '"My mom says not to talk to people from outside. You\'re from outside. I\'m talking to you."'),
    '@': { spawn: true },
    S: back('frederick', 'fr_market', 'Back out to the square', '.', true),
  },
}).build();

// ---- The Enclave: the long green mall, monuments at each end, nobody on the grass ----
export const enMall = fromGrid({
  id: 'en_mall', name: 'The mall', fill: 'g', outdoor: true, act: 3,
  rows: [
    '##########################################',
    '#qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq#',
    '#qMMqggggggggggggggggggggggggggggggggqMMq#',
    '#qMMqggggggggggggggggggggggggggggggggqMMq#',
    '#qqqqqqqqqqqqqqqqqqNqqqqqqqqqqqqqqqqqq?qq#',
    '#qqqqqqqqqqqqqqqqqq@qqqqqqqqqqqqqqqqqqqqq#',
    '###################SS#####################',
  ],
  legend: {
    M: { scenery: 'obj.degasser', solid: true, tile: 'q' },
    '?': { prop: 'obj.board', id: 'obj.en_keep_off', label: 'KEEP OFF THE GRASS', text: '[scaffold] KEEP OFF THE GRASS. Under it, smaller: BY ORDER. Under that, smaller still: PLEASE.' },
    N: npc('en_tourist', R2, 'A tourist with a paper map', '"I came to see the monuments. They\'re very clean. I don\'t know what I expected."'),
    '@': { spawn: true },
    S: back('enclave', 'en_mall', 'Back to the Enclave streets', 'q'),
  },
}).build();

// ---- The Enclave metro: on time, one calm voice ----
export const enMetro = fromGrid({
  id: 'en_metro', name: 'The Enclave metro', fill: ':', act: 3,
  rows: [
    '##############SS##############',
    '#::::::::::::::::::::::::::::#',
    '#::::::::::::N:::::::::::::?:#',
    '#:::::::::::::@::::::::::::::#',
    '#============================#',
    '#tttttttttttttttttttttttttttt#',
    '##############################',
  ],
  legend: {
    '?': { prop: 'obj.board', id: 'obj.en_departures', label: 'Departure board', text: '[scaffold] Every train on time. Every train announced in the same calm voice. One destination you don\'t recognize, every eleven minutes.' },
    N: npc('en_rider', R3, 'A commuter', '"On time, every time. I miss being late. It meant something happened."'),
    '@': { spawn: true },
    S: back('enclave', 'en_metro', 'Up to the street', ':'),
  },
}).build();
