// Act 2 sub-areas, [SCAFFOLD] batch 2 (Trevor: "this game must be much larger scale"): each ring-two region
// grows past its one map. Built from text grids with the level builder; every "[scaffold]" line comes from the
// region's "To find" / "People" lines in docs/design/02-world-atlas.md. Story placement is the lore gate's.
import { fromGrid } from './builder.js';

// The exit back to the region map, paired with the entrance added there (act2_regions.js).
// road: an open path at the map edge (code-drawn), not a door.
const out = (to, id, label, road = false) => ({ exit: to, id: `obj.${id}_out`, pair: `obj.${to}_to_${id}`, ...(road ? { selfDrawn: true } : { art: 'obj.door' }), label, stepOn: true, text: 'Back outside.' });

// ---- Greenbelt: the dish control room (a clean room with one set of footprints; a technician who never left) ----
export const gbDishes = fromGrid({
  id: 'gb_dishes', name: 'The dish control room', fill: 'e', act: 2,
  rows: [
    '##########################',
    '#eeeeeeeeeee#eeeeeeeeeeee#',
    '#e??????eeee#eeeeeeeTeeee#',
    '#eeeeeeeeeee#eeeeeeeeeeee#',
    '#eeeeNeeeeeeeeeeeeeeeeee$#',
    '#eeeeeeeeeee#eeeeeeeeeeee#',
    '#eeeeeeEeeee#eeeeeEeeeeee#',
    '#eeeeeeeeee@eeeeeeeeeeeee#',
    '###########DD#############',
  ],
  legend: {
    '?': { scenery: 'obj.table', solid: true, tile: 'e' },
    N: { npc: 'npc.gb_technician', art: 'npc.rotter_3', label: 'A technician', text: '[scaffold] "I never left my post. Nobody relieved me. So technically I\'m still on shift."' },
    T: { prop: 'obj.crate', id: 'obj.gb_tapes', label: 'Telemetry tapes', loot: 'parts', text: '[scaffold] Telemetry tapes from before the Slop Decades. Clean.' },
    $: { prop: 'obj.board', id: 'obj.gb_cleanroom', label: 'Clean room window', text: '[scaffold] A clean room, and in the dust on its floor, one set of footprints.' },
    E: { enemy: 'enemy.autocomplete' },
    '@': { spawn: true },
    D: out('greenbelt', 'gb_dishes', 'Back down the hill'),
  },
})
  // Region guardian (optional): by the clean room it guards, far enough from the door to sleep until you go there.
  .enemy('boss.gb_receiver', 24, 2)
  .build();

// ---- Greenbelt: the co-op (a century of minute books; a shop run by committee) ----
export const gbCoop = fromGrid({
  id: 'gb_coop', name: 'The Greenbelt co-op', fill: '.', act: 2,
  rows: [
    '######################',
    '#....................#',
    '#.$$$$$$....S...MMMM.#',
    '#....................#',
    '#..........N.........#',
    '#.$$$$$$.............#',
    '#.........@..........#',
    '##########DD##########',
  ],
  legend: {
    $: { scenery: 'obj.crate', solid: true, tile: '.' },
    M: { prop: 'obj.board', label: 'Minute books', text: '[scaffold] The co-op\'s minute books, a century of them. Every argument the town ever had, in order.' },
    S: { prop: 'obj.kiosk', id: 'obj.gb_coop_counter', label: 'The co-op counter', action: 'shop', shop: 'coop' },
    N: { npc: 'npc.gb_clerk', art: 'npc.rotter_2', label: 'A clerk', text: '[scaffold] "Prices are set by vote. The vote was in 2071. We\'re due."' },
    '@': { spawn: true },
    D: out('greenbelt', 'gb_coop', 'Back out to the street'),
  },
}).build();

// ---- Beltsville: the barn the map doesn't show (a growth tank with a name written on it in marker) ----
// The breeding ledgers are read outside, in the vet's office (act2_regions.js), not in here.
export const bvBarn = fromGrid({
  id: 'bv_barn', name: 'The barn the map doesn\'t show', fill: ':', act: 2,
  rows: [
    '##########################',
    '#::::::::::::::::::::::::#',
    '#:TT::TT::TT::TT::TT:::::#',
    '#:TT::TT::TT::TT::TT::K::#',
    '#::::::::::::::::::::::::#',
    '#::E:::::::E:::::::E:::::#',
    '#::::::::::::::::::::::::#',
    '#::::::::::@:::::::::::::#',
    '###########DD#############',
  ],
  legend: {
    T: { scenery: 'obj.degasser', solid: true, tile: ':' },
    K: { prop: 'obj.board', id: 'obj.bv_named_tank', label: 'A growth tank', text: '[scaffold] A growth tank with a name written on it in marker.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    D: out('beltsville', 'bv_barn', 'Back out into the rain'),
  },
})
  // Region guardian (optional): at the back of the barn by the tank, asleep until you walk up to it.
  .enemy('boss.bv_shell', 23, 2)
  .build();

// ---- The refuge: the Analogist settlement (timber, lamps, a blacksmith, a library copied by hand) ----
export const rfSettlement = fromGrid({
  id: 'rf_settlement', name: 'The settlement', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'Tgg######ggggggggg######gggT',
    'Tgg#....#ggggggggg#....#gggT',
    'Tgg#.B..#ggggggggg#.L..#gggT',
    'Tgg###.##ggggNgggg###.##gggT',
    'Tggggggggggggggggggggggggg?T',
    'TggggggggggggggggggggggggggT',
    'Tggggggggg@gggggggggggggggggT',
    'TTTTTTTTTTSSTTTTTTTTTTTTTTTT',
  ].map((r) => r.slice(0, 28)),
  legend: {
    B: { npc: 'npc.rf_blacksmith', art: 'npc.rotter_3', label: 'The blacksmith', text: '[scaffold] "Bring me something that doesn\'t need charging and I\'ll make it last forever."' },
    L: { prop: 'obj.board', id: 'obj.rf_library', label: 'The library', text: '[scaffold] Books copied by hand. The copying errors are lovingly preserved, and footnoted.' },
    N: { npc: 'npc.rf_hardman', art: 'npc.rotter_1', label: 'A hard man', text: '[scaffold] "Hospitals are the disease. Ask me how I know."' },
    '?': { prop: 'obj.board', id: 'obj.rf_implants', label: 'A graveyard of implants', text: '[scaffold] A graveyard of smashed implants, each one with a small wooden marker.' },
    '@': { spawn: true },
    S: out('refuge', 'rf_settlement', 'Back down the boardwalk', true),
  },
}).build();

// ---- Baltimore: the container stacks (whole neighborhoods living in shipping boxes) ----
export const bmoreStacks = fromGrid({
  id: 'bmore_stacks', name: 'The container stacks', fill: ',', outdoor: true, act: 2,
  rows: [
    '##############################',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,cccc,cccc,cccc,,cccc,cccc,,#',
    '#,cccc,cccc,cccc,,cccc,cccc,,#',
    '#,,,,,,,,,,,,,,N,,,,,,,,,,,,,#',
    '#,cccc,cccc,,,,,,,cccc,cccc,,#',
    '#,cccc,cccc,,E,,,,cccc,cccc$,#',
    'D,,,,@,,,,,,,,,,,,,,,,,,,,E,,#',
    '##############################',
  ],
  legend: {
    c: { scenery: 'obj.crate', solid: true, tile: ',' },
    N: { npc: 'npc.bmore_steward', art: 'npc.rotter_2', label: 'A union steward', text: '[scaffold] "Dockhand shells have a union. We had to vote on whether shells could vote. They won."' },
    $: { prop: 'obj.crate', id: 'obj.bmore_manifests', label: 'Shipping manifests', loot: 'parts', text: '[scaffold] Shipping manifests for helium, and a box marked SOVEREIGN STACK that nobody will open.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    D: { ...out('baltimore', 'bmore_stacks', 'Back to the harbor street', true), tile: ',' },
  },
}).build();

// ---- Baltimore: the rowhouse clinic (a doctor running a clinic out of a front room) ----
export const bmoreClinic = fromGrid({
  id: 'bmore_clinic', name: 'The rowhouse clinic', fill: '.', act: 2,
  rows: [
    '####################',
    '#..................#',
    '#.bb.bb.bb..#......#',
    '#...........#..Dc..#',
    '#.bb.bb.bb..#......#',
    '#...........###.####',
    '#.........@........#',
    '##########XX########',
  ],
  legend: {
    b: { scenery: 'obj.table', solid: true, tile: '.' },
    D: { npc: 'npc.bmore_doctor', art: 'npc.rotter_1', label: 'The doctor', text: '[scaffold] "Sit. Everyone sits. I see you in order, and the order is: worst first."' },
    c: { prop: 'obj.crate', id: 'obj.bmore_meds', label: 'Supply shelf', text: '[scaffold] Bandages, boiled and rewound. Labels in three handwritings.' },
    '@': { spawn: true },
    X: out('baltimore', 'bmore_clinic', 'Back out to the street'),
  },
}).build();

// ---- Annapolis: the harbor (where the party gets a boat; a harbor pilot; a bell on an island with no church) ----
export const annHarbor = fromGrid({
  id: 'ann_harbor', name: 'The harbor', fill: 'b', outdoor: true, act: 2,
  rows: [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~bbbbbbb~~~~~~bbbbbbb~~~~~',
    '~~~b~~~~~b~~~~~~b~~~~~b~~~~~',
    '~~~b~~~~~b~~~~~~b~~~~~b~~~~~',
    '~~~bbbbbbbbbbbbbbbbbbbbbb?~~',
    'bbbbbbbbbbbbNbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbb$bbbbbbbbbbbbb',
    'Dbb@bbbbbbbbbbbbbbbbbbbbbbbb',
    '############################',
  ],
  legend: {
    N: { npc: 'npc.ann_pilot', art: 'npc.rotter_3', label: 'A harbor pilot', text: '[scaffold] "I\'ll get you a boat. Then I\'ll get you a chart. The chart matters more."' },
    // The almanac sits by the pilot, out of the guardian's reach: reading it never wakes the fight.
    $: { prop: 'obj.crate', id: 'obj.ann_almanac', label: 'Tide almanac', text: '[scaffold] A tide almanac annotated by four generations, each correcting the last.' },
    '?': { prop: 'obj.board', id: 'obj.ann_bell', label: 'A bell across the water', text: '[scaffold] Faint, from the east: a church bell, from an island with no church.' },
    '@': { spawn: true },
    D: { ...out('annapolis', 'ann_harbor', 'Back up the pier', true), tile: 'b' },
  },
})
  // Region guardian (optional): at the end of the pier, by the bell it guards.
  .enemy('boss.ann_tide', 26, 5)
  .build();
