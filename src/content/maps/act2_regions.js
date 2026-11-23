// Act 2, ring two (docs/design/02-world-atlas.md §6-11), built with the level builder from text grids (Trevor: "this
// game must be much larger scale"). The way out: once Act 1 is complete, the Route 1 north checkpoint opens onto the
// Route 1 north hub, which branches to every ring-two region. Route 1 north, Greenbelt, Beltsville, the refuge, the
// Meade and Annapolis have their lines, prop art and a small find each from the polish pass (hub #30, gonman).
// Spanish: src/i18n/es-act2.js. The finds are listed sealed in docs/sealed/secrets-later-acts.md (open it with
// python3 tools/spoilers/seal.py open docs/sealed/secrets-later-acts.md). Baltimore has its own art pass (hub #6).
// The Act 2 story itself is sealed (BagelMeister).
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
    'Tgggg?gggggggggggsscssgggggggggggKgggggT',
    'TggggggggggggUgggsscssgggggggggggggggggT',
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
    '?': { prop: 'obj.purple_sign', id: 'obj.r1n_road_sign', label: 'Road sign',
      text: 'A highway sign on a post, the reflective letters peeled down to the glue: GREENBELT 2 · BELTSVILLE 4 · BALTIMORE 27. Somebody has crossed out the miles in marker and written walking hours beside them. Beside BALTIMORE there is no time, only DON\'T.' },
    K: { prop: 'obj.cordon_sign', id: 'obj.r1n_notice', label: 'Continuity notice',
      text: 'A Continuity notice on two legs, planted in front of the old mileage sign: RESTRICTED AREA AHEAD. NO STOPPING. Only the bottom line of the old sign shows past it, ANNAPOLIS 21, and beside it somebody has scratched a 4 into the paint with a key.' },
    U: { prop: 'obj.shelter', id: 'obj.r1n_shelter', label: 'Bus shelter', loot: 'lost',
      text: 'A bus shelter with no glass left in it. The timetable is still bolted to the post, and the last northbound bus on it is for a night in 2071. Under the bench, a cardboard box marked WALKERS, and under that, smaller: TAKE WHAT YOU NEED.' },
    N: { npc: 'npc.r1n_walker', art: 'npc.analogist_a', label: 'A walker on the shoulder',
      text: '"Two pairs of socks." He sits on the guardrail with one boot off, working at his heel. "Nobody tells you that about leaving. Two pairs, and you swap the inside pair at Greenbelt."' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
  },
})
  // Act 3: the Beltway road, open once Act 2 is complete (src/content/maps/act3_regions.js). It leaves by the west edge,
  // south of the farm road: the Beltway's way back is on its east edge, so you come out facing the way you went.
  .exit('beltway', 0, 10, { id: 'obj.r1n_to_beltway', selfDrawn: true, stepOn: true, pair: 'obj.bw_to_r1n', label: 'South-west to the Beltway',
    requiresFlag: 'act2.complete', lockedText: 'A barricade, and a sign: INNER LOOP CLOSED. Not yet.', text: 'The ring road around the Enclave.' })
  .build();

// ---- 6. Greenbelt and the dishes ----
export const greenbelt = fromGrid({
  id: 'greenbelt', name: 'Greenbelt and the dishes', fill: 'g', outdoor: true, act: 2,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'Tgggggggg#####ggggg#####ggggggggT',
    'Tgggggggg#DDD#ggggg#DDD#ggggggggT',
    'Tgggggggg##L##ggggg##H##gggTggggT',
    'Tgggggggggqqqqqqqqqqqqqggggggg?gT',
    'Tggggqqqqqq.........qqqqqqgggggT',
    'Tggggq#W##.....N.....##J#qgggggT',
    'Tggggq####...........####qgggggT',
    'Tggggq####qqqqqqqqqqq####qgggggT',
    'Tgg@gqqqqqqq.......qqqqqqqgEgggT',
    'TgggggggggggggggggggggggggggggggX',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    D: { scenery: 'obj.planter', solid: true, tile: '#' },   // window boxes on the upper floor
    L: { prop: 'obj.parts_bins', id: 'obj.gb_tool_library', label: 'The tool library', grant: 'item.work_gloves',
      text: 'TOOL LIBRARY on the glass, and under it the rules: BORROW FOR A WEEK. SIGN THE CLIPBOARD. On the returns shelf inside the door, a pair of work gloves with a tag on one thumb: OVERDUE SINCE 2088, FINE WAIVED BY VOTE. You sign the clipboard and take them.',
      doneText: 'The returns shelf, empty. On the clipboard, the line for the gloves has a pencil tick beside it now.' },
    H: { prop: 'obj.neon', id: 'obj.gb_barber', label: 'The barbershop', light: 0.5,
      text: 'HAIRCUTS in gold leaf on the window. Under it the price has been painted over so many times that the glass is thick with paint. The newest price is in chalk, which wipes off faster.' },
    W: { prop: 'obj.newsbox', id: 'obj.gb_weekly', label: 'The town weekly',
      text: 'The town weekly, one page taped inside the window every Friday, the way it has been since the 1930s. This week\'s front page is the committee\'s minutes in full. The headline is the vote count.' },
    J: { prop: 'obj.house_rules', id: 'obj.gb_pharmacy', label: 'The pharmacy',
      text: 'A pharmacy with its shutter down, and a note taped to the shutter in neat capitals: CLOSED UNTIL THE COMMITTEE DECIDES WHO HOLDS THE KEY. It is dated 2093. Under it, somebody keeps a tally of the meetings since.' },
    N: { npc: 'npc.gb_committee', art: 'npc.rotter_2', label: 'Committee member',
      text: '"Motion to hear the strangers out." She raises her own hand and counts it. "Carried, one to nothing. It won\'t be official till the counter\'s fixed. Go on anyway."' },
    '?': { prop: 'obj.balcony_view', id: 'obj.gb_dishes', label: 'The dishes, on the hill',
      text: 'White dishes on the hill above the town, each the size of a house, pointed at a sky nobody is paid to watch. Through the coin viewer at the top of the street, one of them is turning, slow as a minute hand, while the windsock beside it hangs straight down.' },
    E: { enemy: 'enemy.spitter' },
    '@': { spawn: true },
    X: back('greenbelt', 'Back east to Route 1'),
  },
})   // its region guardian stands in the dish control room, by what it guards (act2_more.js)
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
    'Tg#.L.....#ggggg#..$....#ggggg=T',
    'Tg#...Y...#ggggg#.......#ggggg=T',
    'Tg####.####ggggg####.####ggggg=T',
    'Tgggggyyyyyyyyyyyyyyyyyygggggg=T',
    'TgggggyggggNggggggggggggyggEgg=T',
    'Tgggggygggggggggggggggggyggggg=T',
    'Tg@yyyyyggggggggg?ggggggyyyyyyyX',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    // The equipment shed (the east building). It keeps the id it had as a feed bin, so a save that searched it keeps that.
    $: { prop: 'obj.parts_bins', id: 'obj.beltsville_crate_19_3', label: 'Parts bins', loot: 'parts',
      text: 'Steel shelves of parts bins in the equipment shed, labeled in marker: PUMP SEALS, FEED LINE. Further down the labels give up, and so did the sorting.' },
    Y: { prop: 'obj.feed_sacks', id: 'obj.bv_feed_sacks', label: 'Feed sacks',
      text: 'Paper sacks stacked against the office wall, stenciled TANK FEED · NOT FOR LIVESTOCK. On every sack, somebody has struck out LIVESTOCK with one careful line of marker.' },
    N: { npc: 'npc.bv_vet', art: 'npc.rotter_1', label: 'A veterinarian',
      text: '"I took this job for good reasons." She pulls her gloves on, then off again. "I wrote them down the day I signed. I keep meaning to find the list."' },
    // The vet's office (the west building): the ledgers are read here, outside the barn.
    L: { prop: 'obj.bookshelf', id: 'obj.bv_ledgers', label: 'Breeding ledgers', tile: '.',
      text: 'Breeding ledgers on the shelf in the vet\'s office, one cloth-bound volume a year, the years in white ink on the spines. Inside, every line is a date and a fence post number.' },
    '?': { prop: 'obj.cordon_sign', id: 'obj.bv_sealed_barn', label: 'The sealed barn',
      text: 'A notice on two legs: BIOSECURE. NO ENTRY WITHOUT ESCORT. Past it, down the track in the rain, a barn with no windows and an airlock where the door should be. Under the rain on its roof, a pump runs in and out, slow, like breathing.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    X: back('beltsville', 'Back to Route 1'),
  },
})   // its region guardian stands in the barn, by what it guards (act2_more.js)
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
    N: { npc: 'npc.rf_teacher', art: 'npc.analogist_b', label: 'A schoolteacher with a slate',
      text: '"Your phones go quiet past the fence." She wipes her slate clean with the heel of her hand. "The children think that\'s funny. Try not to check yours in front of them."' },
    // The old ranger station by the boardwalk, where the settlement meets the road.
    $: { prop: 'obj.lost_found', id: 'obj.rf_staves', label: 'A box by the ranger station door', grant: 'item.wooden_bat',
      text: 'A box inside the old ranger station door with WALKING STICKS painted on it, full of staves cut from the woods. Among them is a bat of ash wood, sanded smooth at the grip, with a cedar tag on twine: FOR THE ROAD BACK. You take it.',
      doneText: 'The box of walking sticks. The cedar tag hangs from one of the staves now.' },
    '?': { prop: 'obj.chalkboard', id: 'obj.rf_tower', label: 'The fire tower',
      text: 'A fire tower on four timber legs, its cab up in the treetops. Nailed to the rail of the bottom flight is a slice of an old oak, its rings labeled in ink on little paper flags.' },
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
    '#,,G,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,,,,c,,,,,,c,,,,,,c,,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,?,,#',
    '#,,,,,,,,,,,,,N,,,,,,,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    'X,,@,,,,,,,,,,,,,,,,,,,,,,,,E,,#',
    '################################',
  ],
  legend: {
    c: { scenery: 'obj.van', solid: true, w: 2, tile: ',' },   // one van per bay along the fence
    N: { npc: 'npc.md_quartermaster', art: 'npc.rotter_3', label: 'A quartermaster',
      text: '"Everything at the Meade has a form." He holds out a clipboard and pulls it back before you can take it. "I\'m the form you fill out to skip the others. I cost more."' },
    '?': { prop: 'obj.aframe', id: 'obj.md_menu', label: 'Cafeteria menu (posted outside)',
      text: 'The cafeteria menu, on a sandwich board at the edge of the berm road, typed fresh every morning. MONDAY: Meatloaf (Redacted). TUESDAY: Mystery Meat (Classified).' },
    // In the gutter under the fence, along from the gate: the badge is void and opens nothing.
    G: { prop: 'obj.room_sign', id: 'obj.md_badge', label: 'A badge on a lanyard', grant: 'item.keycard',
      text: 'A contractor badge face down in the gutter under the fence, its lanyard trodden flat. You turn it over: a photo of somebody you have never met, and a clearance stripe in steel grey. Somebody has clipped one corner off to void it.',
      doneText: 'The print of a lanyard in the grit, where the badge lay.' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    X: { ...back('meade', 'Back west to Route 1'), tile: ',' },
  },
}).enemy('boss.md_fence', 27, 3)
  // The gate is in the perimeter fence: you walk north through it and come in by the south wall of the Meade inside,
  // whose layout stays as it is (act3_more.js). Outside the Fence's wake radius, so arriving doesn't start the fight.
  .exit('meade_inside', 10, 1, { id: 'obj.meade_to_meade_inside', selfDrawn: true, stepOn: true, requiresFlag: 'act2.complete', lockedText: 'The gate does not acknowledge you. Not yet.', pair: 'obj.meade_inside_out', label: 'The Meade gate', text: 'Black glass behind the berm. The gate is open.' })   // act3_more.js
  
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
    // The refinery's sign seen from the water. You look at it up close for the preacher's quest: obj.bmore_sign, on
    // the refinery's wall (districts.js). This marker points you there.
    '?': { prop: 'obj.board', id: 'obj.bmore_sign_far', label: 'The refinery sign, far off', text: 'SHOAL, in red letters on the sugar refinery, up past the rowhouse streets. The S keeps going out. You\'d have to get a lot closer to see what\'s left.' },
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
    '#qqqqqqqqqqqqP~~~~~~qqqqqqqqq$b~',
    'Xqq@qqqqqqqqqqq~~~~qqqqqqqqqqqb~',
    '##########################~~~~~~',
  ],
  legend: {
    N: { npc: 'npc.ann_crabber', art: 'npc.rotter_1', label: 'A crabber',
      text: '"Pots go out at slack water." He coils a line round his elbow and back to his hand. "Slack water comes when it likes now. The almanac\'s no help, and my grandmother wrote half of it."' },
    '?': { prop: 'obj.directory', id: 'obj.ann_statehouse', label: 'The statehouse dome',
      text: 'A cast-iron marker on a post: THE STATEHOUSE, OLDEST IN CONTINUOUS LEGISLATIVE USE. Somebody has scratched a question mark after USE. Up the street, the wooden dome stands clear of the waterline. Down here, the high-water marks are pencilled on the post, each one dated.' },
    $: { prop: 'obj.cart', id: 'obj.ann_charts', label: 'Paper charts',
      text: 'A chart seller\'s handcart at the head of the pier, paper charts rolled in its bins, the soundings corrected by hand in red. The printed charts from the 2060s still show islands that aren\'t there anymore. Those go for half price.' },
    P: { prop: 'obj.hamper', id: 'obj.ann_basket', label: 'A basket on the seawall', grant: 'item.fish_perch',
      text: 'A bushel basket on the seawall under wet burlap, and a card held down with a stone: TOO SMALL TO SELL. TAKE ONE. One white perch left in it, still cold. You take it.',
      doneText: 'The empty basket and the burlap. Somebody will fill it again at the next low tide, whenever that turns out to be.' },
    '@': { spawn: true },
    X: { ...back('annapolis', 'North-west, back to Route 1'), tile: 'q' },
  },
})   // its region guardian stands at the harbor, by what it guards (act2_more.js)
  .exit('ann_harbor', 31, 7, { id: 'obj.annapolis_to_ann_harbor', selfDrawn: true, stepOn: true, pair: 'obj.ann_harbor_out', label: 'Down the pier to the harbor', text: 'Sailboats moored to second-floor windows. The harbor.' })   // act2_more.js
  
  .exit('ann_statehouse', 6, 8, { id: 'obj.annapolis_to_ann_statehouse', art: 'obj.door', pair: 'obj.ann_statehouse_out', label: 'The statehouse', text: 'A wooden dome above the waterline.' })   // stretch.js
  .exit('ann_bridge', 31, 5, { id: 'obj.annapolis_to_ann_bridge', selfDrawn: true, stepOn: true, pair: 'obj.ann_bridge_out', label: 'Out to the cut bridge', text: 'The bridge east, one span taken out.' })   // stretch.js
  .exit('ann_chapel', 3, 0, { id: 'obj.annapolis_to_ann_chapel', art: 'obj.door', pair: 'obj.ann_chapel_out', label: 'The academy chapel', text: 'Its doors are open. They always are.' })   // stretch.js
  .build();
