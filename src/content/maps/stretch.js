// Stretch-tier areas (10-scope.md; Trevor: "this game must be much larger scale"): eight more for Act 2, four more
// for Act 3, each one a place the atlas names. Layouts from the scaffold batch, built with the level builder from text
// grids; lines, prop art and one small secret per area from the polish pass (hub #30, gonman). Spanish:
// src/i18n/es-stretch.js. The finds are listed in docs/SECRETS.md.
import { fromGrid } from './builder.js';

const back = (to, id, label, tile, art = false) => ({ exit: to, id: `obj.${id}_out`, pair: `obj.${to}_to_${id}`, ...(art ? { art: 'obj.door' } : { selfDrawn: true }), label, stepOn: true, text: 'Back the way you came.', ...(tile ? { tile } : {}) });
const npc = (id, art, label, line, more = {}) => ({ npc: `npc.${id}`, art, label, text: line, ...more });
const R1 = 'npc.rotter_1', R2 = 'npc.rotter_2', R3 = 'npc.rotter_3';

// ======================= Act 2 =======================

// ---- The refuge, deeper: the violent fringe, a day's walk in ----
// Secret: the crate inside the west hut, where the camp breaks whatever lace it takes off people (searchable once).
export const rfFringe = fromGrid({
  id: 'rf_fringe', name: 'The fringe camp', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TgggTTggggggggggggTTgggggT',
    'Tgg####gggggggggg####ggggT',
    'Tgg#B.#ggggNggggg#..#ggggT',
    'Tgg##.#gggggggggg##.#ggggT',
    'TggggggggggEgggggggggg?ggT',
    'TgggggEggggggggggggEgggggT',
    'Tgggggggggggg@gggggggggggT',
    'TTTTTTTTTTTTTSSTTTTTTTTTTT',
  ],
  legend: {
    N: npc('rf_fringe_leader', R3, 'A man with a slate of names', '"The settlement sent you? They\'re soft back there. They let a doctor stay all winter." He thumbs a name off his slate and chalks it back on, neater.'),
    '?': { prop: 'obj.lab_board', id: 'obj.rf_fringe_list', label: 'A slate of names', text: 'A schoolroom slate nailed to a post, chalked in two columns: LACED and CLEAN. One name has been wiped out of CLEAN and written again under LACED, hard enough to snap the chalk.' },
    B: { prop: 'obj.lost_found', id: 'obj.rf_fringe_crate', tile: '.', label: 'A crate with a hammer on a chain', loot: 'parts',
      text: 'A crate inside the hut door, a claw hammer chained to the lid. Everything in it was taken off somebody at the tree line and hit once: lace studs by the handful, and a hearing aid with its battery door open.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    S: back('refuge', 'rf_fringe', 'Back toward the settlement', 'g'),
  },
}).scenery('obj.worklamp', 7, 4, { light: 0.7 }).scenery('obj.worklamp', 21, 4, { light: 0.7 }).scenery('obj.boxes', 2, 4).build();

// ---- The refuge marsh: boardwalks and bird blinds ----
// Secret: the volunteers' locker at the far west end of the boardwalk holds a rain parka (one per save).
export const rfMarsh = fromGrid({
  id: 'rf_marsh', name: 'The marsh boardwalk', fill: '~', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTSSTTTTTTTTTTTT',
    '~~~~~~~~~~~~~~bb~~~~~~~~~~~~',
    '~~bbbbbbbbbbbbbbbbbbbbbbbb~~',
    '~~V~~~~~~~~~~~bb~~~~~~~~~b~~',
    '~~b~~~~~~~~~~~bb~~~~~~~~~b~~',
    '~~bbbbbNbbbbbbbbbbbbbb?bbb~~',
    '~~~~~~~~~~~~~~@b~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],
  legend: {
    N: npc('rf_counter', R1, 'A bird counter', '"Herons, thirty-one. Ospreys, none for three years." He doesn\'t lower the binoculars. "Herons are up. Write that down if you\'ve got a pencil."', { tile: 'b' }),
    '?': { prop: 'obj.shelter', id: 'obj.rf_blind', tile: 'b', label: 'A bird blind', text: 'A plywood blind with a viewing slot of thick glass, and a tally board inside in pencil: HERON, EGRET, CORMORANT. The newest column was ruled in later. It is headed THINGS THAT AREN\'T BIRDS.' },
    V: { prop: 'obj.crate', id: 'obj.rf_marsh_locker', tile: 'b', label: 'A locker marked VOLUNTEERS', grant: 'item.rain_parka',
      text: 'A wooden locker bolted to the rail, VOLUNTEERS painted on the door. Inside, a yellow rain parka on a hanger and a card in pencil: IF YOU\'RE WEARING THIS, YOU\'RE COUNTING. You put it on.',
      doneText: 'The empty hanger and the card. You\'re counting now.' },
    '@': { spawn: true, tile: 'b' },
    S: back('refuge', 'rf_marsh', 'Back up to the forest', 'b'),
  },
}).build();

// ---- The Meade: ten thousand spaces, forty cars ----
// Secret: the grey sedan by the east fence has been idling since '94, with cold brew on the seat (one per save).
export const mdLot = fromGrid({
  id: 'md_lot', name: 'The Meade parking lot', fill: ',', outdoor: true, act: 2,
  rows: [
    '#############SS###############',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,c,,,,,,,,,,,,,,,,,,c,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,,,,,,,,,c,,,,,,,,,,,,,,,?,,#',
    '#,,,,,,,,,,,,,N,,,,,,,,,,,,,,#',
    '#,,,,,,c,,,,,,,,,,,,,,,,E,,G,#',
    '#,,,,,,,,,,,,@,,,,,,,,,,,,,,,#',
    '##############################',
  ],
  // Bay lines, so the empty spaces read as spaces. The lane down from the perimeter road (x 13-14) stays clear.
  decals: [1, 2, 6, 7].flatMap((y) => [3, 5, 7, 9, 11, 17, 19, 21, 23, 25, 27].map((x) => ['dec.bay_v', x, y])),
  legend: {
    c: { scenery: 'obj.car', solid: true, w: 2, tile: ',' },
    N: npc('md_attendant', R2, 'A lot attendant', '"Ten thousand spaces, forty cars." He points with his chin at a grey sedan by the fence. "That one hasn\'t moved since \'94. Engine\'s been running the whole time."'),
    '?': { prop: 'obj.purple_sign', id: 'obj.md_lot_sign', label: 'Reserved sign', text: 'RESERVED: DEPUTY DIRECTOR, at the head of the best space in the lot. Nobody has ever parked in it. The lines around it are bright white.' },
    G: { prop: 'obj.car', id: 'obj.md_lot_sedan', label: 'A grey sedan by the fence', grant: 'item.caffeine',
      text: 'A grey sedan two spaces from the fence, engine idling. The permit on the dash says ANALYST and 2094. The window is down an inch, and on the passenger seat is a carton of cold brew with one can left. You work it out through the gap.',
      doneText: 'The empty carton on the seat. The engine is still running.' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    S: back('meade', 'md_lot', 'Back to the perimeter road', ','),
  },
}).build();

// ---- Annapolis: the wooden statehouse, above the waterline ----
// Secret: the clerk's minute books (paged, four Tuesdays). After his errand, the clerk has a new pencil line to show.
export const annStatehouse = fromGrid({
  id: 'ann_statehouse', name: 'The statehouse', fill: '.', act: 2,
  rows: [
    '########################',
    '#.M....................#',
    '#..bbbb..........bbbb..#',
    '#..........?...........#',
    '#..bbbb..........bbbb..#',
    '#.........N............#',
    '#..........@...........#',
    '###########DD###########',
  ],
  legend: {
    b: { scenery: 'obj.table', solid: true, tile: '.' },
    // The tide line is painted round a column (a pillar tile), so the column is its drawing.
    '?': { prop: 'obj.ann_tideline', id: 'obj.ann_tideline', selfDrawn: true, tile: '|', label: 'The tide line', text: 'A stone column in the middle of the chamber, with a portrait of a governor hung on it at eye level. A line is painted round the column at knee height. Above it, dates in pencil climb toward the frame.' },
    N: npc('ann_clerk', R3, 'A clerk of a legislature that doesn\'t meet', '"We make quorum on Tuesdays. Me and the portrait." He squares a stack of bills against the desk. "The portrait abstains."',
      { later: [{ if: 'q.ann_tideline.told', text: 'The portrait hangs a nail higher than it did. He has pencilled a fresh line an inch under the frame and dated it for next spring.' }] }),
    M: { prop: 'obj.bookshelf', id: 'obj.ann_minutes', label: 'The minute books', action: 'pages', pages: [
      'Bound minutes in the clerk\'s hand, a volume for every year since the water came in. The newest is open. TUESDAY. Present: the Clerk; the portrait. Quorum declared. No business. Adjourned at 9:04.',
      'TUESDAY. Present: the Clerk; the portrait. The Clerk moved that the carpet be dried. Carried without objection. The carpet has not dried.',
      'TUESDAY. Present: the Clerk; the portrait; one midshipman, in out of the tide, who asked not to be named. Entered as a member of the public.',
      'TUESDAY. Present: the Clerk. The portrait was away for cleaning. No quorum. The Clerk waited until five.',
    ] },
    '@': { spawn: true },
    D: back('annapolis', 'ann_statehouse', 'Back out to the tide', '.', true),
  },
}).build();

// ---- Annapolis: the academy chapel ----
// Secret: the box of things left in the pews, under the back pew (searchable once).
export const annChapel = fromGrid({
  id: 'ann_chapel', name: 'The academy chapel', fill: '.', act: 2,
  rows: [
    '######################',
    '#..........?.........#',
    '#.bbbbbb......bbbbbb.#',
    '#....................#',
    '#Lbbbbbb......bbbbbb.#',
    '#.........N..........#',
    '#..........@.........#',
    '###########DD#########',
  ],
  legend: {
    b: { scenery: 'obj.bench', solid: true, tile: '.' },
    '?': { prop: 'obj.directory', id: 'obj.ann_chapel_roll', label: 'The roll of honor', text: 'Brass plates down a dark board, a class year on each and the midshipmen\'s names under it in small capitals. The last plate has a year and no names, and someone keeps it polished.' },
    N: npc('ann_chaplain', R1, 'A chaplain with no fleet', '"Six every morning, for the fleet." He marks his place with the ribbon. "Norfolk stopped answering in the spring. I aim the prayers a little further south now."'),
    L: { prop: 'obj.boxes', id: 'obj.ann_chapel_box', label: 'A box under the back pew', loot: 'lost',
      text: 'A cardboard box under the back pew, LEFT IN CHAPEL in marker. Odd gloves, and a prayer card marking a page in a paperback thriller. Nobody has thrown any of it out.' },
    '@': { spawn: true },
    D: back('annapolis', 'ann_chapel', 'Back out to the streets', '.', true),
  },
}).build();

// ---- The bay bridge, with a missing span ----
// The span was lifted out on purpose, years ago (a closed road, nothing more). LoreKeeper: this bridge must look and
// read nothing like the real 2024 collapse in Baltimore, so no ship, no wreckage, no night of it: cones and a sign.
// Secret: the shared tackle box wired to the rail beside the person fishing (searchable once).
export const annBridge = fromGrid({
  id: 'ann_bridge', name: 'The broken bridge', fill: '~', outdoor: true, act: 2,
  rows: [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~,,,,,,,,,K,,,,,,,,,~~~~~~,,,,,~',
    'S,@,,,,,,N,,,,,,,,?,~~~~~~,,,,,~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],
  legend: {
    N: npc('ann_fisher', R2, 'Someone fishing off the bridge', '"Rockfish come right up to the cut for the shade off the far half." She checks an empty hook and casts again. "Nobody\'s crossed since they lifted the span out. The fish go back and forth all day."', { tile: ',' }),
    '?': { prop: 'obj.cordon_sign', id: 'obj.ann_span', tile: ',', label: 'The end of the span', text: 'The road stops at two cones and a sign: SPAN REMOVED BY ORDER, 2061. TO BE REINSTATED. The edge is sawn square. Across the gap the bridge carries on east with its lamps lit, and north of it, where the old charts put an island, there is open water.' },
    K: { prop: 'obj.toolbox', id: 'obj.ann_bridge_tackle', tile: ',', label: 'A tackle box on the rail', loot: 'tackle',
      text: 'A tackle box wired to the guardrail, SHARE stenciled on the lid. Hooks sorted by size, and a tide table in pencil that disagrees with the printed one.' },
    '@': { spawn: true, tile: ',' },
    S: back('annapolis', 'ann_bridge', 'Back to Annapolis', ','),
  },
}).scenery('obj.cone', 19, 2).scenery('obj.cone', 19, 3)
  .scenery('obj.streetlamp', 5, 2, { light: 0.8 }).scenery('obj.streetlamp', 15, 2, { light: 0.8 }).scenery('obj.streetlamp', 28, 2, { light: 0.8 }).build();

// ---- Beltsville: the tissue lab ----
// Secret: the sample fridge in the corner is down to its last vial of tank sedative (a sleeping potion, one per save).
export const bvLab = fromGrid({
  id: 'bv_lab', name: 'The tissue lab', fill: 'e', act: 2,
  rows: [
    '########################',
    '#eeeeeeeeeeeeeeeeeeeeee#',
    '#e==e==e==eeeeTTeeTTeee#',
    '#eeeeeeeeeeeeeTTeeTTeee#',
    '#eeeeeeeeeeNeeeeeeeeee?#',
    '#eeEeeeeeeeeeeeeeeEeeee#',
    '#eeeeeeeeeee@eeeeeeeeeF#',
    '############SS##########',
  ],
  legend: {
    T: { scenery: 'obj.degasser', solid: true, tile: 'e' },
    N: npc('bv_lab_tech', R2, 'A lab technician', '"We grow them in batches. Every batch has a line on the board. One line got scrubbed, and nobody will say why."'),
    '?': { prop: 'obj.whiteboard', id: 'obj.bv_batch_board', label: 'Batch board', text: 'A whiteboard beside the tanks, ruled in marker: batch, date, TOOK. Down the TOOK column it says yes, yes, yes. One row says took, but, and nothing after it.' },
    F: { prop: 'obj.fridge', id: 'obj.bv_lab_fridge', label: 'Sample fridge', grant: 'item.sleep_potion',
      text: 'A sample fridge humming in the corner. Racks of blue vials, TANK SEDATIVE, DO NOT REMOVE. One rack is down to a single vial, and nobody has signed for the others. You don\'t sign either.',
      doneText: 'The fridge hums. The empty rack has a new label on it: SEE ME.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    S: back('beltsville', 'bv_lab', 'Back out to the farm', 'e', true),
  },
}).scenery('obj.microscope', 3, 2).scenery('obj.microscope', 8, 2).build();

// ---- Greenbelt's old town center: curved streets, a theater, the co-op's first storefront ----
// Secret: the honor jar on the co-op's first counter (a butterscotch, one per save).
export const gbCenter = fromGrid({
  id: 'gb_center', name: 'Greenbelt town center', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'Tggggg######gggg######gggggT',
    'Tggggg#.?..#gggg#.J..#gggggT',
    'Tggggg###.##gggg###.##gggggT',
    'TgggqqqqqqqqqqqqqqqqqqqqgggT',
    'TgggqgggggggggNggggggggqgggT',
    'TgggqqqqqqqqqqqqqqqqqqqqgggT',
    'Tggggggggggg@ggggggggggggggT',
    'TTTTTTTTTTTTSSTTTTTTTTTTTTTT',
  ],
  legend: {
    '?': { prop: 'obj.neon', id: 'obj.gb_theater', tile: '.', light: 0.8, label: 'The theater marquee', text: 'NOW SHOWING, in red plastic letters on the lobby board: the same title since 2063, picked by the committee six votes to five. Two letters faded pink and were replaced, and the replacements have faded too.' },
    N: npc('gb_usher', R1, 'An usher', '"Tickets are free. Seats are assigned by committee." He tears you a stub anyway. "Row Q. Everybody new starts in row Q."'),
    J: { prop: 'obj.mate_shelf', id: 'obj.gb_center_jar', tile: '.', label: 'The co-op\'s first counter', grant: 'item.hard_candy',
      text: 'The co-op\'s first storefront, kept as it was by a committee that meets about it once a month. On the counter, a jar of butterscotch and a card: TAKE ONE, LEAVE ONE. You have nothing to leave. You take one.',
      doneText: 'The jar and the card. You still owe the co-op one butterscotch.' },
    '@': { spawn: true },
    S: back('greenbelt', 'gb_center', 'Back down to the co-op streets', 'g'),
  },
}).scenery('obj.bench', 8, 5).scenery('obj.bench', 20, 5)
  .scenery('obj.streetlamp', 3, 5, { light: 0.8 }).scenery('obj.streetlamp', 24, 5, { light: 0.8 }).build();

// ======================= Act 3 =======================

// ---- Gaithersburg: the labs, where every faction's clocks are checked ----
// Secret: the clock-check register by the door (paged: four factions' visits).
export const gtLabs = fromGrid({
  id: 'gt_labs', name: 'The measurement labs', fill: 'e', act: 3,
  rows: [
    '##########################',
    '#eeeeeeeeeeeeeeeeeeeeeeee#',
    '#e==e==eeeeeeeee==e==eee?#',
    '#eeeeeeeeeeeeeeeeeeeeeeee#',
    '#e==e==eeeeNeeee==e==eeee#',
    '#eeeeEeeeeeeeeeeeeeeEeeee#',
    '#eeeeeeeeeee@eReeeeeeeeee#',
    '############DD############',
  ],
  legend: {
    '?': { prop: 'obj.oscilloscope', id: 'obj.gt_volt', label: 'The volt standard', text: 'The reference volt: a row of cells in a glass case held at thirty degrees, wired to a meter with more digits than anyone needs. A card on the glass says DO NOT LICK. Someone has added underneath: AGAIN.' },
    N: npc('gt_metrologist', R2, 'A metrologist', '"Continuity was in this morning to check its clocks against ours. Then the Analogists, with a sundial." She initials the log without looking at it. "They all leave unhappy. I\'ve stopped offering coffee."'),
    R: { prop: 'obj.security_desk', id: 'obj.gt_register', label: 'Clock-check register', action: 'pages', pages: [
      'A sign-in book by the door for visitors checking their clocks. CONTINUITY, ENCLAVE OFFICE: 0.4 seconds fast. Corrected. Signed, then countersigned by someone more senior.',
      'ANALOGIST DELEGATION: one sundial, right to the minute at noon. They asked the staff to stop smiling. The request is minuted.',
      'INTERDICTION: declined to state their offset. Asked who else had signed in today. Asked twice.',
      'BALTIMORE PORT AUTHORITY: three clocks showing three times, each one insisted on. Entered as three visits.',
    ] },
    E: { enemy: 'enemy.moth' },
    '@': { spawn: true },
    D: back('gaithersburg', 'gt_labs', 'Back out to the campus', 'e', true),
  },
}).scenery('obj.microscope', 3, 2).scenery('obj.solder', 6, 4).scenery('obj.microscope', 17, 4).scenery('obj.solder', 20, 2).build();

// ---- Frederick: the market hall ----
// Secret: the kid minding a stall has more to say each time you ask (paged).
export const frMarket = fromGrid({
  id: 'fr_market', name: 'The market hall', fill: '.', act: 3,
  rows: [
    '##########################',
    '#........................#',
    '#.$%$..$%$..$%$..$%$..?..#',
    '#........................#',
    '#.$%$..$%$..$%$..$%$.....#',
    '#.........N..........M...#',
    '#...........@............#',
    '############SS############',
  ],
  legend: {
    $: { scenery: 'obj.cart', solid: true, tile: '.' },
    '%': { scenery: 'obj.boxes', solid: true, tile: '.' },
    '?': { prop: 'obj.lab_board', id: 'obj.fr_prices', label: 'Price board', text: 'Prices in chalk on a blackboard behind the stalls. Everything is up a few cents from last week, and the chalk in the tray is down to a stub.' },
    N: npc('fr_grocer', R3, 'A grocer', '"Ridge apples. Best in the county." He shines one on his apron and sets it back shine-out. "The ridge itself, I wouldn\'t know. I only go up as far as the orchard."'),
    M: { npc: 'npc.fr_market_kid', art: R1, label: 'A kid minding a stall', age: 'child', eggNo: true, action: 'pages', pages: [
      '"My mom says don\'t talk to people from outside." The kid looks you over. "You\'re from outside. Pears are two dollars."',
      '"The spotty ones are a dollar. Same pears. People are weird about spots."',
      '"The church bells go when the campus changes shift. Mom says don\'t count them." The kid is counting them.',
      '"If anybody asks, I didn\'t sell you anything." You haven\'t bought anything.',
    ] },
    '@': { spawn: true },
    S: back('frederick', 'fr_market', 'Back out to the square', '.', true),
  },
}).build();

// ---- The Enclave: the long green mall, monuments at each end, nobody on the grass ----
// Secret: somebody's old coin in the coin viewer by the west monument (one per save).
export const enMall = fromGrid({
  id: 'en_mall', name: 'The mall', fill: 'g', outdoor: true, act: 3,
  rows: [
    '##########################################',
    '#qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq#',
    '#qqqqggggggggggggggggggggggggggggggggqqqq#',
    '#qMqVggggggggggggggggggggggggggggggggqMqq#',
    '#qqqqqqqqqqqqqqqqqqNqqqqqqqqqqqqqqqqqq?qq#',
    '#qqqqqqqqqqqqqqqqqq@qqqqqqqqqqqqqqqqqqqqq#',
    '###################SS#####################',
  ],
  legend: {
    // A monument at each end: one fountain, two tiles by two (its footprint runs up from this tile).
    M: { scenery: 'obj.fountain', solid: true, w: 2, h: 2, tile: 'q' },
    '?': { prop: 'obj.cordon_sign', id: 'obj.en_keep_off', tile: 'q', label: 'KEEP OFF THE GRASS', text: 'A sign at the edge of the lawn: KEEP OFF THE GRASS. Under it, smaller, BY ORDER. Under that, smaller still and in fresher paint, PLEASE.' },
    N: npc('en_tourist', R2, 'A tourist with a paper map', '"I came to see the monuments." The paper map is folded to the mall, worn through along the crease. "They\'re very clean. The guidebook had pigeons in it."', { tile: 'q' }),
    V: { prop: 'obj.balcony_view', id: 'obj.en_mall_viewer', tile: 'q', label: 'A coin viewer', grant: 'item.relic_coin',
      text: 'A coin viewer on a post, aimed down the mall at the far monument. In the coin return, somebody\'s coin: a 2081 commemorative, TEN YEARS OF STABILITY. The viewer only takes new coins. You keep it.',
      doneText: 'The far monument through the glass, very clean. The coin return is empty.' },
    '@': { spawn: true },
    S: back('enclave', 'en_mall', 'Back to the Enclave streets', 'q'),
  },
}).scenery('obj.streetlamp', 9, 1, { light: 0.8 }).scenery('obj.streetlamp', 16, 1, { light: 0.8 }).scenery('obj.streetlamp', 23, 1, { light: 0.8 }).scenery('obj.streetlamp', 30, 1, { light: 0.8 })
  .scenery('obj.bench', 10, 5).scenery('obj.bench', 28, 5).build();

// ---- The Enclave metro: on time, one calm voice ----
// Secret: the help point at the west end answers every press in the same calm voice (paged).
export const enMetro = fromGrid({
  id: 'en_metro', name: 'The Enclave metro', fill: ':', act: 3,
  rows: [
    '##############SS##############',
    '#::H:::::::::::::::::::::::::#',
    '#::::::::::::N:::::::::::::?:#',
    '#:::::::::::::@::::::::::::::#',
    '#============================#',
    '#tttttttttttttttttttttttttttt#',
    '##############################',
  ],
  legend: {
    '?': { prop: 'obj.lobby_monitor', id: 'obj.en_departures', light: 0.6, label: 'Departure board', text: 'White letters on black, every train ON TIME, each one read out as it comes up in the same calm voice. Every eleven minutes, one destination you don\'t recognize.' },
    N: npc('en_rider', R3, 'A commuter', '"Seventeen years on this line, and it\'s never been late once." She checks her watch against the board anyway. "I used to blame the train. Now I have to be on time myself."'),
    H: { prop: 'obj.payphone', id: 'obj.en_metro_help', label: 'Help point', action: 'pages', pages: [
      'You press HELP. "Thank you for calling. Your train is on time." You haven\'t said which train.',
      'You press HELP again. "Thank you for calling. Please stand clear of the doors." The nearest doors are a platform away.',
      '"Thank you for calling. If you are lost, stay where you are and someone will come for you." The line stays open for a while afterwards.',
      '"Thank you for calling. This is your fourth call today." A pause, the same length as the others. "Thank you for calling."',
    ] },
    '@': { spawn: true },
    S: back('enclave', 'en_metro', 'Up to the street', ':'),
  },
}).scenery('obj.bench', 6, 3).scenery('obj.bench', 21, 3).scenery('obj.bin', 23, 3).build();
