// Act 2, ring two (docs/design/02-world-atlas.md §6-11), [SCAFFOLD] batch built with the level builder from text
// grids (Trevor: "this game must be much larger scale"). The way out: once Act 1 is complete, the Route 1 north
// checkpoint opens onto the Route 1 north hub, which branches to every ring-two region. All "[scaffold]" lines
// come straight from the atlas and wait for the polish pass. The Act 2 story itself is sealed (BagelMeister).
import { fromGrid } from './builder.js';

// Road exits at map edges are walk-on and code-drawn (no door art): they're a road leaving the map, not a door.
const back = (id, label) => ({ exit: 'route1_north', id: `obj.${id}_out`, selfDrawn: true, label, pair: `obj.r1n_to_${id}`, stepOn: true, text: 'Back to Route 1.' });

// ---- Route 1 north: the old road out of the cordon, branching to ring two ----
export const route1North = fromGrid({
  id: 'route1_north', name: 'Route 1 north', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTBBTTTTTTTTTTTTTTTTTT',
    'TgggggggggggggggggsscssgggggggggggggggggT',
    'GgggggggggggggggggsscssgggggggggggggggggR',
    'Tgggg?gggggggggggsscssggggggggggg?gggggT',
    'TggggggggggggggggsscssgggggggggggggggggT',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'F,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,M',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'TgggggggggggggggggsscssgggggggggN,gggggT',
    'TgggggEgggggggggggsscssgggggggggggggggggA',
    'TgggggggggggggggggsscssgggggggggggggggggT',
    'Tggggggggggggggggg@ssssgggggggggggggggggT',
    'TTTTTTTTTTTTTTTTTTSSTTTTTTTTTTTTTTTTTTTTT',
  ].map((r) => r.slice(0, 41)),
  legend: {
    B: { exit: 'baltimore', id: 'obj.r1n_to_baltimore', selfDrawn: true, label: 'North to Baltimore', pair: 'obj.baltimore_out', stepOn: true, tile: ',', text: 'The road north, toward the harbor.' },
    G: { exit: 'greenbelt', id: 'obj.r1n_to_greenbelt', selfDrawn: true, label: 'West to Greenbelt', pair: 'obj.greenbelt_out', stepOn: true, text: 'The curved streets of Greenbelt, and the dishes on the hill.' },
    R: { exit: 'refuge', id: 'obj.r1n_to_refuge', selfDrawn: true, label: 'East into the refuge', pair: 'obj.refuge_out', stepOn: true, text: 'Forest. No signal past this sign.' },
    F: { exit: 'beltsville', id: 'obj.r1n_to_beltsville', selfDrawn: true, label: 'The farm road', pair: 'obj.beltsville_out', stepOn: true, tile: ',', text: 'White fences, long low barns.' },
    M: { exit: 'meade', id: 'obj.r1n_to_meade', selfDrawn: true, label: 'The Meade perimeter', pair: 'obj.meade_out', stepOn: true, tile: ',', text: 'Berms, black glass, antenna farms.' },
    A: { exit: 'annapolis', id: 'obj.r1n_to_annapolis', selfDrawn: true, label: 'South-east to Annapolis', pair: 'obj.annapolis_out', stepOn: true, text: 'Toward the bay.' },
    S: { exit: 'metro_plaza', id: 'obj.r1n_south', selfDrawn: true, label: 'South, back to College Park', pair: 'obj.plaza_r1n', stepOn: true, tile: 's', text: 'Back through the old checkpoint.' },
    '?': { prop: 'obj.board', label: 'Road sign', text: '[scaffold] Distances to places nobody has driven to in a long time, corrected in marker.' },
    N: { npc: 'npc.r1n_walker', art: 'npc.rotter_3', label: 'A walker on the shoulder', text: '[scaffold] "First time out of the pocket? Everyone looks back the first time."' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
  },
})
  // Act 3: the Beltway road, open once Act 2 is complete (src/content/maps/act3_regions.js).
  .exit('beltway', 10, 12, { id: 'obj.r1n_to_beltway', selfDrawn: true, stepOn: true, pair: 'obj.bw_to_r1n', label: 'South-west to the Beltway',
    requiresFlag: 'act2.complete', lockedText: 'A barricade, and a sign: INNER LOOP CLOSED. Not yet.', text: 'The ring road around the Enclave.' })
  .build();

// ---- 6. Greenbelt and the dishes ----
export const greenbelt = fromGrid({
  id: 'greenbelt', name: 'Greenbelt and the dishes', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'Tgggggggg#####ggggg#####ggggggggT',
    'Tgggggggg#DDD#ggggg#DDD#ggggggggT',
    'Tgggggggg##o##ggggg##o##gggTggggT',
    'Tgggggggggqqqqqqqqqqqqqggggggg?gT',
    'Tggggqqqqqq.........qqqqqqgggggT',
    'Tggggq#oo#.....N.....#oo#qgggggT',
    'Tggggq####...........####qgggggT',
    'Tggggq####qqqqqqqqqqq####qgggggT',
    'Tgg@gqqqqqqq.......qqqqqqqgEgggT',
    'TgggggggggggggggggggggggggggggggX',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    D: { scenery: 'obj.degasser', solid: true, tile: '#' },
    o: { prop: 'obj.board', label: 'Co-op shopfront', text: '[scaffold] A co-op since the 1930s. The minute book on the counter is open to an argument from 2041.' },
    N: { npc: 'npc.gb_committee', art: 'npc.rotter_2', label: 'Committee member', text: '[scaffold] "We\'ll vote on whether to talk to you. Then we\'ll vote on the result."' },
    '?': { prop: 'obj.board', id: 'obj.gb_dishes', label: 'The dishes, on the hill', text: '[scaffold] White dishes the size of houses, pointed at a sky nobody is paid to watch. One of them is turning.' },
    E: { enemy: 'enemy.spitter' },
    '@': { spawn: true },
    X: back('greenbelt', 'Back east to Route 1'),
  },
}).enemy('boss.gb_receiver', 16, 5)
  .exit('gb_dishes', 29, 0, { id: 'obj.greenbelt_to_gb_dishes', selfDrawn: true, stepOn: true, pair: 'obj.gb_dishes_out', label: 'Up the hill to the dishes', text: 'The dish control room. The door is propped open with a tape reel.' })   // act2_more.js
  .exit('gb_coop', 3, 11, { id: 'obj.greenbelt_to_gb_coop', selfDrawn: true, stepOn: true, pair: 'obj.gb_coop_out', label: 'Down the path to the co-op', text: 'The co-op. OPEN, by a vote of 4 to 3.' })   // act2_more.js
  
  .exit('gb_center', 5, 0, { id: 'obj.greenbelt_to_gb_center', selfDrawn: true, stepOn: true, pair: 'obj.gb_center_out', label: 'Up to the town center', text: 'The curved streets climb toward the theater.' })   // stretch.js
  .build();

// ---- 7. Beltsville: the farms ----
export const beltsville = fromGrid({
  id: 'beltsville', name: 'Beltsville: the farms', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'Tgggggggggggggggggggggggggggggg=T',
    'Tg#########ggggg#########ggggg=T',
    'Tg#.......#ggggg#..$....#ggggg=T',
    'Tg#...$...#ggggg#.......#ggggg=T',
    'Tg####.####ggggg####.####ggggg=T',
    'Tgggggyyyyyyyyyyyyyyyyyygggggg=T',
    'TgggggyggggNggggggggggggyggEgg=T',
    'Tgggggygggggggggggggggggyggggg=T',
    'Tg@yyyyyggggggggg?ggggggyyyyyyyX',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    $: { prop: 'obj.crate', label: 'Feed bin', loot: 'parts', text: '[scaffold] Feed for something that isn\'t cattle.' },
    N: { npc: 'npc.bv_vet', art: 'npc.rotter_1', label: 'A veterinarian', text: '[scaffold] "I took the job for the right reasons. Ask me what the reasons were. I dare you."' },
    '?': { prop: 'obj.board', id: 'obj.bv_sealed_barn', label: 'The sealed barn', text: '[scaffold] The newest barn has an airlock. Rain on sheet metal, and under it, breathing.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    X: back('beltsville', 'Back to Route 1'),
  },
}).enemy('boss.bv_shell', 21, 4)
  .exit('bv_barn', 12, 10, { id: 'obj.beltsville_to_bv_barn', selfDrawn: true, stepOn: true, pair: 'obj.bv_barn_out', label: "A barn the map doesn't show", text: "A barn that isn't on any map. It has an airlock." })   // act2_more.js
  
  .exit('bv_lab', 6, 0, { id: 'obj.beltsville_to_bv_lab', art: 'obj.door', pair: 'obj.bv_lab_out', label: 'The tissue lab', text: 'Long, low, airlocked.' })   // stretch.js
  .build();

// ---- 8. The refuge: no signal, timber and lamps ----
export const refuge = fromGrid({
  id: 'refuge', name: 'The refuge', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTgggTTggggggggggggggTTgggggTTTT',
    'Tgggg~~~~~gggggTTggggggggggggggT',
    'Tggg~~~~~~~bbbbbbbbbbggggTggggT',
    'Tgggg~~~~~gggggggggggb######gggT',
    'TggggggggggggTgggggggb#....#gggT',
    'TgTggggggNggggggggggggb#..$.#gggT',
    'Tgggggggggggggggggggggb##.###gggT',
    'Xgg@gggggggTgggggg?gggbbbbgggggT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ].map((r) => r.slice(0, 32)),
  legend: {
    N: { npc: 'npc.rf_teacher', art: 'npc.rotter_2', label: 'A schoolteacher with a slate', text: '[scaffold] "No implants past the fence. Your gear won\'t help you here. Neither will mine, and I don\'t have any."' },
    $: { prop: 'obj.crate', label: 'Hand-copied books', text: '[scaffold] A library copied by hand, with the copying errors lovingly preserved.' },
    '?': { prop: 'obj.board', id: 'obj.rf_tower', label: 'The fire tower', text: '[scaffold] A fire tower, and on its rail, tree rings counted and labeled with events.' },
    '@': { spawn: true },
    X: { ...back('refuge', 'Back west to Route 1'), tile: 'g' },
  },
})
  .exit('rf_settlement', 8, 0, { id: 'obj.refuge_to_rf_settlement', selfDrawn: true, stepOn: true, pair: 'obj.rf_settlement_out', label: 'Up the boardwalk to the settlement', text: 'Timber walls, lamps in the windows.' })   // act2_more.js
  
  .exit('rf_fringe', 26, 0, { id: 'obj.refuge_to_rf_fringe', selfDrawn: true, stepOn: true, pair: 'obj.rf_fringe_out', label: 'Deeper into the forest', text: "A day's walk in, they say. It's less." })   // stretch.js
  .exit('rf_marsh', 15, 9, { id: 'obj.refuge_to_rf_marsh', selfDrawn: true, stepOn: true, pair: 'obj.rf_marsh_out', label: 'Down to the marsh boardwalk', text: 'Boardwalks over black water.' })   // stretch.js
  .build();

// ---- 9. The Meade (perimeter in Act 2) ----
export const meade = fromGrid({
  id: 'meade', name: 'The Meade, perimeter', fill: ',', outdoor: true, act: 2,
  rows: [
    '################################',
    '#==============================#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,,,,ccc,,,,ccc,,,,ccc,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,?,,#',
    '#,,,,,,,,,,,,,N,,,,,,,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    'X,,@,,,,,,,,,,,,,,,,,,,,,,,,E,,#',
    '################################',
  ],
  legend: {
    c: { scenery: 'obj.van', tile: ',' },
    N: { npc: 'npc.md_quartermaster', art: 'npc.rotter_3', label: 'A quartermaster', text: '[scaffold] "I can be reasoned with. That\'s not the same as being on your side."' },
    '?': { prop: 'obj.board', id: 'obj.md_menu', label: 'Cafeteria menu (posted outside)', text: '[scaffold] The only thing at the Meade with a sense of humor. Tuesday: "Mystery Meat (Classified)."' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    X: { ...back('meade', 'Back west to Route 1'), tile: ',' },
  },
}).enemy('boss.md_fence', 27, 3)
  .exit('meade_inside', 10, 8, { id: 'obj.meade_to_meade_inside', selfDrawn: true, stepOn: true, requiresFlag: 'act2.complete', lockedText: 'The gate does not acknowledge you. Not yet.', pair: 'obj.meade_inside_out', label: 'The Meade gate', text: 'Black glass behind the berm. The gate is open.' })   // act3_more.js
  
  .exit('md_lot', 4, 8, { id: 'obj.meade_to_md_lot', selfDrawn: true, stepOn: true, pair: 'obj.md_lot_out', label: 'The parking lot', text: 'Ten thousand spaces.' })   // stretch.js
  .build();

// ---- 10. Baltimore: the port, an outbreak in progress ----
export const baltimore = fromGrid({
  id: 'baltimore', name: 'Baltimore: the port', fill: ',', outdoor: true, act: 2,
  rows: [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    '#,,,,,cc,,,,,cc,,,,,,cc,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,?,,#',
    '#ssssssssssssssssssssssssssssssss#',
    '#qqqqqqqqqqqqqqqqNqqqqqqqqqqqqqqq#',
    '#qq###q###q###q###q###q###q###qqq#',
    '#qq#o#q#.#q#.#q#$#q#.#q#.#q#o#qqq#',
    '#qqqqqqqEqqqqqqqqqqqqEqqqqqqEqqqqq#',
    '#qqqqqqqqqqqqqqqq@qqqqqqqqqqqqqqqq#',
    '#################XX################',
  ].map((r) => r.slice(0, 34)),
  legend: {
    c: { scenery: 'obj.crate', solid: true, tile: ',' },
    o: { prop: 'obj.board', label: 'Rowhouse stoop', text: '[scaffold] Marble steps, scrubbed white. Someone still scrubs them, outbreak or not.' },
    $: { prop: 'obj.crate', id: 'obj.bmore_clinic', label: 'Clinic in a rowhouse', text: '[scaffold] A doctor running a clinic out of a front room. The line goes down the block.' },
    N: { npc: 'npc.bmore_preacher', art: 'npc.rotter_2', label: 'A Caller preacher', text: '[scaffold] "Everyone hears him eventually. The question is whether you pick up." He is very good, and partly right.' },
    '?': { prop: 'obj.board', id: 'obj.bmore_sign', label: 'The sugar refinery sign', text: '[scaffold] Still lit red over the water. The S flickers.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    X: { ...back('baltimore', 'South, back to Route 1'), tile: 'q' },
  },
}).enemy('boss.bmore_congregation', 24, 3)
  .exit('bmore_stacks', 33, 4, { id: 'obj.baltimore_to_bmore_stacks', selfDrawn: true, stepOn: true, pair: 'obj.bmore_stacks_out', label: 'Into the container stacks', text: 'Shipping containers stacked five high, with curtains.' })   // act2_more.js
  .exit('bmore_clinic', 0, 9, { id: 'obj.baltimore_to_bmore_clinic', selfDrawn: true, stepOn: true, pair: 'obj.bmore_clinic_out', label: 'Around back to the rowhouse clinic', text: 'A rowhouse with a line out the door.' })   // act2_more.js
  
  .exit('bmore_rows', 33, 10, { id: 'obj.baltimore_to_bmore_rows', selfDrawn: true, stepOn: true, pair: 'obj.rows_to_baltimore', label: 'East into the rowhouse streets', text: 'Marble steps, scrubbed white.' })   // districts.js
  .build();

// ---- 11. Annapolis and the bay ----
export const annapolis = fromGrid({
  id: 'annapolis', name: 'Annapolis and the bay', fill: 'q', outdoor: true, act: 2,
  rows: [
    '##########################~~~~~~',
    '#qqqqqqqq#####qqqqqqqqqqqq~~~~~~',
    '#qqqqqqqq#...#qqqqqqqqqqqqbb~~~~',
    '#qqqqqqqq##.##qqqqqqNqqqqqbb~~~~',
    '#qqq?qqqqqqqqqqqqqqqqqqqqqbb~~~~',
    '#qqqqqqqqqqqqqq~~~~qqqqqqqbbbbb~',
    '#qqqqqqqqqqqqq~~~~~~qqqqqqqqq$b~',
    'Xqq@qqqqqqqqqqq~~~~qqqqqqqqqqqb~',
    '##########################~~~~~~',
  ],
  legend: {
    N: { npc: 'npc.ann_crabber', art: 'npc.rotter_1', label: 'A crabber', text: '[scaffold] "Tide comes when the almanac says it won\'t. Four generations wrote in this book and it\'s still wrong."' },
    '?': { prop: 'obj.board', id: 'obj.ann_statehouse', label: 'The statehouse dome', text: '[scaffold] A wooden dome above the waterline. The tide is in the street twice a day.' },
    $: { prop: 'obj.crate', id: 'obj.ann_charts', label: 'Paper charts', text: '[scaffold] Paper charts: the only accurate ones. This is where the party gets a boat (atlas).' },
    '@': { spawn: true },
    X: { ...back('annapolis', 'North-west, back to Route 1'), tile: 'q' },
  },
}).enemy('boss.ann_tide', 16, 2)
  .exit('ann_harbor', 31, 7, { id: 'obj.annapolis_to_ann_harbor', selfDrawn: true, stepOn: true, pair: 'obj.ann_harbor_out', label: 'Down the pier to the harbor', text: 'Sailboats moored to second-floor windows. The harbor.' })   // act2_more.js
  
  .exit('ann_statehouse', 6, 8, { id: 'obj.annapolis_to_ann_statehouse', art: 'obj.door', pair: 'obj.ann_statehouse_out', label: 'The statehouse', text: 'A wooden dome above the waterline.' })   // stretch.js
  .exit('ann_bridge', 28, 8, { id: 'obj.annapolis_to_ann_bridge', selfDrawn: true, stepOn: true, pair: 'obj.ann_bridge_out', label: 'Out to the broken bridge', text: 'The bridge east, with a span missing.' })   // stretch.js
  .exit('ann_chapel', 3, 0, { id: 'obj.annapolis_to_ann_chapel', art: 'obj.door', pair: 'obj.ann_chapel_out', label: 'The academy chapel', text: 'Its doors are open. They always are.' })   // stretch.js
  .build();
