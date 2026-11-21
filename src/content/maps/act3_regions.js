// Act 3, ring three (docs/design/02-world-atlas.md §12-15), [SCAFFOLD] batch from text grids with the level
// builder (Trevor: "this game must be much larger scale"). The way in: the Beltway road west off Route 1 north,
// open once Act 2 is complete. All "[scaffold]" lines come from the readable atlas; no sealed story here. The
// Act 3 story, and the final fight, are the lore gate's (BagelMeister).
import { fromGrid } from './builder.js';

const road = (to, id, pair, label, text, tile) => ({ exit: to, id, pair, label, text, stepOn: true, selfDrawn: true, ...(tile ? { tile } : {}) });
const back = (id, label, tile) => road('beltway', `obj.${id}_out`, `obj.bw_to_${id}`, label, 'Back to the Beltway.', tile);
// Lines, prop art and a small find per region from the polish pass (hub #30, gonman). Spanish: src/i18n/es-act3.js.
// The finds are listed sealed in docs/sealed/secrets-later-acts.md (open it with
// python3 tools/spoilers/seal.py open docs/sealed/secrets-later-acts.md).

// ---- The Beltway: the ring road outside the Enclave wall, branching to ring three ----
export const beltway = fromGrid({
  id: 'beltway', name: 'The Beltway', fill: ',', outdoor: true, act: 3,
  rows: [
    'TTTTTTTTTFFTTTTTTTTTTTTTTGGTTTTTTTTTTTT',
    'Tggggggggsssgggggggggggggsssggggggggggg',
    'Tggggggggsssgggggggg?ggggsssggggggggggg',
    'Tggggggggsssgggggggggggggsssggggggggggg',
    'C,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'TgggggKgggggggggggsssgggggNgggggggggggT',
    'T=================sss=================T',
    'Tgggggggggggg@gggggsssgggggggggggggggggT',
    'TTTTTTTTTTTTTTTTTTTEETTTTTTTTTTTTTTTTTT',
  ].map((r) => r.padEnd(39, 'T').slice(0, 39)),
  legend: {
    F: road('frederick', 'obj.bw_to_frederick', 'obj.frederick_out', 'North-west to Frederick', 'Toward the valley and the switchyard.', 's'),
    G: road('gaithersburg', 'obj.bw_to_gaithersburg', 'obj.gaithersburg_out', 'North to Gaithersburg', 'A deer fence, and labs behind it.', 's'),
    C: road('corridor', 'obj.bw_to_corridor', 'obj.corridor_out', 'West into the Corridor', 'The night is brown that way.', ','),
    R: road('route1_north', 'obj.bw_to_r1n', 'obj.r1n_to_beltway', 'East, back to Route 1', 'Back toward College Park.', ','),
    E: road('enclave', 'obj.bw_to_enclave', 'obj.enclave_out', 'The Enclave gate', 'An attestation gate, and the wall behind it.', 's'),
    '?': { prop: 'obj.billboard', id: 'obj.bw_sign', label: 'Beltway sign',
      text: 'A gantry sign over the inner lanes, still lit: INNER LOOP · ATTESTED TRAFFIC ONLY. Lower down, on the post, somebody has added in marker: OUTER LOOP · THE REST OF US, with an arrow pointing down at the lanes that have no paint left.' },
    N: { npc: 'npc.bw_driver', art: 'npc.rotter_3', label: 'A trucker on the shoulder',
      text: '"Twenty years on the loop." He works round the truck, knocking each tire with an iron and listening to it. "The inner lanes won\'t have me and the exits are shut, so I go round. Anything I deliver, I hand over the rail."' },
    // On the verge by the guardrail, at the west end, well clear of the road's one foe.
    K: { prop: 'obj.toolbox', id: 'obj.bw_gang_box', label: 'Gang box by the rail', loot: 'tools',
      text: 'A gang box chained to a guardrail post, BELTWAY MAINT. stenciled on the lid. The chain has rusted through at one link. Taped inside the lid, the last work order: REPLACE REFLECTORS, MILE 31, signed off as done. The box was due back at the depot the week the exits shut.' },
    '@': { spawn: true },
  },
}).enemy('enemy.captcha', 34, 7).build();

// ---- 12. The Corridor: windowless halls to the horizon, cooling towers breathing steam ----
export const corridor = fromGrid({
  id: 'corridor', name: 'The Corridor', fill: ',', outdoor: true, act: 3,
  rows: [
    '##################################',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,########,,,,########,,,,WW,,,,,#',
    '#,#eeeeee#,,,,#eeeeee#,,,,WW,,,,,#',
    '#,#eee$ee#,,,,#eeeeee#,,,,,,,,WW,#',
    '#,#eeeeee#,,,,#eeEeee#,,,,,,,,WW,#',
    '#,####e###,,,,####e###,,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,N,,,,,,,#',
    '#,,,,E,,,,,,,,,,,,,?,,,,,,,,,,,E,R',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,@,,,#',
    '##################################',
  ],
  legend: {
    W: { scenery: 'obj.crac_unit', solid: true, tile: ',' },   // the halls' chillers, in pairs, fans turning
    // The west hall's front room. It keeps the id it had as a crate, so a save that searched it keeps that.
    $: { prop: 'obj.server_rack', id: 'obj.corridor_crate_6_4', label: 'Server rack', loot: 'parts',
      text: 'A server rack wheeled out of the rows and left by the hall door with its side panel off, as if a crew meant to come back for it. Half the drive sleds are gone. The rest blink green, and its fans still run.' },
    '?': { prop: 'obj.newsbox', id: 'obj.cor_handbook', label: 'Employee handbook',
      text: 'A dispenser box at the edge of the lot, FOR NEW HIRES lettered on the front, the kind that handed out the company handbook free. One copy is left behind the scuffed glass, from the Slop Decades, swollen with damp. The door still opens.' },
    N: { npc: 'npc.cor_nightshift', art: 'npc.rotter_1', label: 'A night-shift worker',
      text: '"Evening." She says it to the hall wall first, and pats it, then turns to you. "They like to be told when the shift changes. Give them a minute and they answer. The day shift never gives them the minute."' },
    E: { enemy: 'enemy.autocomplete' },
    '@': { spawn: true },
    R: back('corridor', 'East, back to the Beltway', ','),
  },
})   // its region guardian stands inside the sealed hall, by what it guards (act3_more.js)
  .exit('cor_sealed', 18, 0, { id: 'obj.corridor_to_cor_sealed', selfDrawn: true, stepOn: true, pair: 'obj.cor_sealed_out', label: "A sealed hall's loading dock", text: 'The dock door is chained. The chain has been cut.' })   // act3_more.js
  
  .exit('cor_town', 24, 10, { id: 'obj.corridor_to_cor_town', selfDrawn: true, stepOn: true, pair: 'obj.town_to_corridor', label: 'South to the worker town', text: 'Houses between the halls.' })   // districts.js
  .build();

// ---- 13. Gaithersburg: the standards (the second, the kilogram, the volt) ----
export const gaithersburg = fromGrid({
  id: 'gaithersburg', name: 'Gaithersburg: the standards', fill: 'g', outdoor: true, act: 3,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T============================T',
    'T=gggggggggggggggggggggggggg=T',
    'T=g########gggggg########gg=T',
    'T=g#eeeeee#gggggg#eeeeee#gg=T',
    'T=g#ee$eee#gggNgg#ee?eeJ#gg=T',   // the weights room is west, with its guardian; the clock sign by the vault stairs
    'T=g####e###gggggg####e###gg=T',
    'T=gggggggggqqqqqqgggggggggg=T',
    'T=ggggEggggqqqqqqggggggEg@g=T',
    'T=========================gg=T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTSSTT',
  ].map((r) => r.padEnd(30, 'T').slice(0, 30)),
  legend: {
    '?': { prop: 'obj.wall_display', id: 'obj.gt_master_clock', label: 'The master clock',
      text: 'Red digits behind glass in a brass frame, set into the wall at the head of the vault stairs where the whole campus can see them. The engraved plate under it says only OFFICIAL TIME.' },
    $: { prop: 'obj.key_jar', id: 'obj.gt_cradle', label: 'Reference weights',
      text: 'The weights room: brass reference weights under glass bells, one to a cradle, from a kilogram down to a gram. One cradle in the front row is empty. Its label is still there.' },
    N: { npc: 'npc.gt_physicist', art: 'npc.rotter_2', label: 'A physicist',
      text: '"What time do you have?" She turns your wrist over and reads your watch herself, then her own, then the one on her other wrist. She writes all three down in a notebook that is nothing but columns.' },
    // In the east building, by the door to the measurement labs, away from the weights room and its guardian.
    J: { prop: 'obj.bin', id: 'obj.gt_reject_bin', label: 'Reject bin', loot: 'trash',
      text: 'A steel bin by the door to the measurement labs, OUT OF TOLERANCE stenciled on the side. Everything in it failed calibration by less than a hair, and it all goes out with the scrap on Mondays.' },
    E: { enemy: 'enemy.moth' },
    '@': { spawn: true },
    S: back('gaithersburg', 'South, back to the Beltway', 'g'),
  },
}).enemy('boss.gt_clock', 6, 4)   // region guardian (optional), in the weights room by what it guards
  .exit('gt_clockroom', 20, 3, { id: 'obj.gaithersburg_to_gt_clockroom', art: 'obj.door', pair: 'obj.gt_clockroom_out', label: 'Down to the clock vault', text: 'Stairs down. A tick, from below.' })   // act3_more.js
  
  .exit('gt_labs', 23, 3, { id: 'obj.gaithersburg_to_gt_labs', art: 'obj.door', pair: 'obj.gt_labs_out', label: 'The measurement labs', text: 'Every faction checks its clocks here.' })   // stretch.js
  .build();

// ---- 14. Frederick and the Smelter: a market town, potlines turned server halls, a switchyard like a forest ----
export const frederick = fromGrid({
  id: 'frederick', name: 'Frederick and the Smelter', fill: 'g', outdoor: true, act: 3,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'Tqqqqqqqqqqqqgggg,,,,,,,,,,,,,,,,,,T',
    'Tq###q###q###gggg,WW,WW,WW,WW,WW,,,T',
    'Tq#F#q#$#q#R#gggg,,,,,,,,,,,,,,,,,,T',
    'Tqqqqqqqqqqqqgggg,WW,WW,WW,WW,WW,,,T',
    'TqqqqqqNqqqqqgggg,,,,,,,,,,,,,,,,,,T',
    'Tqqqqqqqqqqqqgggg,,,########,,,,,,,T',
    'Tqqqqq?qqqqqqqqqq,,,#eeeeee#,,E,,,,T',
    'Tqqqqqqqqqqq@qqqq,,,###e####,,,,,,,T',
    'TTTTTTTTTTTTSSTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    W: { scenery: 'obj.crac_unit', solid: true, tile: ',' },   // chillers along the campus edge, for the halls
    // The square's three fronts: the corner grocery, the middle door with the guest book, the watchmaker's.
    F: { prop: 'obj.flowerpot', id: 'obj.fr_grocery', label: 'The corner grocery', grant: 'item.flowers',
      text: 'A corner grocery with the blind pulled half down for the afternoon. On the step, a bucket of tulips in cellophane, a little wilted, and a card: GOING OVER. TAKE SOME. You take a bunch.',
      doneText: 'The bucket on the step, with an inch of water left in it.' },
    R: { prop: 'obj.window_6f', id: 'obj.fr_watchmaker', label: 'The watchmaker\'s',
      text: 'A watchmaker\'s window, a row of watches laid out on green velvet, every one stopped at a different time. A card propped among them in careful capitals: WE REPAIR. WE DO NOT SET.' },
    $: { prop: 'obj.flight_log', id: 'obj.fr_guestbook', label: 'A guest book',
      text: 'Through the middle door, which isn\'t locked, a guest book lies open on a lectern with a pen on a chain. The desk beside it is empty. Under the lectern the older volumes are stacked, each spine dated in ink.' },
    '?': { prop: 'obj.lab_board', id: 'obj.fr_potlines', label: 'Potline numbering',
      text: 'A tour board on the railing at the edge of the square, left from the smelter\'s open days: a painted plan of the works, the potlines numbered along the bottom. Past it, down in the valley, the server halls stand in rows on the old footings, a number on each end wall.' },
    N: { npc: 'npc.fr_old_woman', art: 'npc.rotter_3', label: 'A very old woman',
      text: '"You\'re not from the campus." She has a bowl of peas in the crook of her arm and shells them while she looks you over. "I worked up the hill most of my life. So did half this street. The other half married us." She splits another pod with her thumb.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    S: back('frederick', 'South-east, back to the Beltway', 'q'),
  },
}).enemy('boss.fr_potline', 22, 1)
  .exit('fr_switchyard', 35, 8, { id: 'obj.frederick_to_fr_switchyard', selfDrawn: true, stepOn: true, pair: 'obj.fr_switchyard_out', label: 'East into the switchyard', text: 'Steel towers like a forest.' })   // act3_more.js
  
  .exit('fr_market', 5, 0, { id: 'obj.frederick_to_fr_market', art: 'obj.door', pair: 'obj.fr_market_out', label: 'The market hall', text: 'Brick, a bell over the door.' })   // stretch.js
  .build();

// ---- 15. The Enclave: Washington inside the wall; everything works, nobody on the grass ----
export const enclave = fromGrid({
  id: 'enclave', name: 'The Enclave', fill: 'g', outdoor: true, act: 3,
  rows: [
    '##################SS################',
    '#qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq#',
    '#q==q==q==q==qqqqqqqqqq==q==q==q==q#',
    '#qqqqqqqqqqqqqqqq?qGqqqqqqqqqqqqqqq#',
    '#ggggggggggggggggggggggggggggggggggg#',
    '#gMggggggggggggggggggggggggggggggMg#',
    '#ggggggggggggggggggggggggggggggggggg#',
    '#qqqqqqqqqqqqNqqqqqqqqqqqqqqqqqq$qq#',
    '#qqqqqqqEqqqqqqqqq@qqqqqqqqqEqqqqqq#',
    '####################################',
  ].map((r) => r.padEnd(36, '#').slice(0, 36)),
  legend: {
    M: { scenery: 'obj.degasser', solid: true, tile: 'g' },   // attestation pillars at each end of the lawn
    '?': { prop: 'obj.purple_sign', id: 'obj.en_metro', label: 'Metro entrance',
      text: 'A metro pylon on the north walk: the station name in white on bronze, an arrow pointing across the lawn to the escalators, and a speaker grille that carries the announcements up from the platform, one after another, on the minute.' },
    // The archive's east wing, where the addresses are kept (the reading room and the originals are through the marble steps).
    $: { prop: 'obj.directory', id: 'obj.en_archive', label: 'The national archive',
      text: 'The national archive\'s east wing, where the Director\'s addresses are kept. Along its wall runs a row of glass cases, one printed copy in each, under the date it was read. The cases are dusted daily, and the visitors walk straight past them.' },
    N: { npc: 'npc.en_cleaner', art: 'npc.rotter_1', label: 'A cleaner',
      text: '"Path, please." A cleaner in a grown body, a little too tall for his overalls, polishes a bollard that was clean already. "Not the grass. They never say why. I think it\'s so they can see who did."' },
    // On the north walk, halfway between where the two embassies' staff stand.
    G: { prop: 'obj.bench', id: 'obj.en_gift_box', label: 'A gift box on a bench', grant: 'item.chocolates',
      text: 'A bench on the north walk, halfway between the two embassies. On it, a heart-shaped box of chocolates in its ribbon, stamped RETURNED WITH THANKS by one embassy and again, underneath, by the other. Neither embassy will be seen picking it up. You pick it up.',
      doneText: 'The bench, and a square of clean wood where the box sat.' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    S: back('enclave', 'Out through the gate, to the Beltway', 'q'),
  },
}).enemy('boss.en_gate', 32, 5)
  .exit('en_archive', 4, 9, { id: 'obj.enclave_to_en_archive', selfDrawn: true, stepOn: true, pair: 'obj.en_archive_out', label: 'The archive reading room', text: 'Marble steps. The doors open on schedule.' })   // act3_more.js
  
  .exit('en_mall', 10, 0, { id: 'obj.enclave_to_en_mall', selfDrawn: true, stepOn: true, pair: 'obj.en_mall_out', label: 'North to the mall', text: 'Long and green and empty.' })   // stretch.js
  .exit('en_metro', 14, 9, { id: 'obj.enclave_to_en_metro', selfDrawn: true, stepOn: true, pair: 'obj.en_metro_out', label: 'Down to the metro', text: 'On time. Always.' })   // stretch.js
  .build();
