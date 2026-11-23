// Act 2 sub-areas (Trevor: "this game must be much larger scale"): each ring-two region grows past its one map.
// Layouts from the scaffold batch, built from text grids with the level builder, from the region's "To find" and
// "People" lines in docs/design/02-world-atlas.md; lines, prop art and a small find per area from the polish pass
// (hub #30, gonman). Spanish: src/i18n/es-act2.js. The finds are listed sealed in docs/sealed/secrets-later-acts.md
// (open it with python3 tools/spoilers/seal.py open docs/sealed/secrets-later-acts.md). Story placement is the
// lore gate's.
import { fromGrid } from './builder.js';

// The exit back to the region map, paired with the entrance added there (act2_regions.js). Doors face the way you go
// through them (tests/run.js): the co-op and the barn are reached down a path off the south edge of their region, so
// their doors are in the north wall.
// road: an open path at the map edge (code-drawn), not a door.
const out = (to, id, label, road = false) => ({ exit: to, id: `obj.${id}_out`, pair: `obj.${to}_to_${id}`, ...(road ? { selfDrawn: true } : { art: 'obj.door' }), label, stepOn: true, text: 'Back outside.' });

// ---- Greenbelt: the dish control room (a clean room with one set of footprints; a technician who never left) ----
export const gbDishes = fromGrid({
  id: 'gb_dishes', name: 'The dish control room', fill: 'e', act: 2,
  rows: [
    '##########################',
    '#eeeeeeeeeee#eeeeeeeeeeee#',
    '#eCVCCVCeTee#eeeeeeeeeeee#',
    '#eeeeeeeeeee#eeeeeeeeeeee#',
    '#eeeeNeLeeeeeeeeeeeeeeee$#',
    '#eeeeeeeeeee#eeeeeeeeeeee#',
    '#eeeeeeEeeee#eeeeeEeeeeee#',
    '#eeeeeeeeee@eeeeeeeeeeeee#',
    '###########DD#############',
  ],
  legend: {
    // The consoles: screens and scopes from before the Slop Decades, still on.
    C: { scenery: 'obj.terminal_lit', solid: true, tile: 'e', light: 0.4 },
    V: { scenery: 'obj.oscilloscope', solid: true, tile: 'e' },
    N: { npc: 'npc.gb_technician', art: 'npc.rotter_3', label: 'A technician',
      text: '"Relief\'s late." He checks the clock over the consoles against his wristwatch, then writes the time in the log. "Years late. I write it up every shift. Somebody up the line reads them."' },
    // The tapes sit on the technician's side, out of the guardian's reach: reading them never wakes the fight.
    T: { prop: 'obj.bookshelf', id: 'obj.gb_tapes', label: 'Telemetry tapes',
      text: 'Grey cans of telemetry tape on steel shelves up to the ceiling, every can labeled by hand. A strip of masking tape along the shelf edge says BEFORE 2030. It has dried out and curled up at both ends.' },
    L: { prop: 'obj.flight_log', id: 'obj.gb_shift_log', label: 'Shift log', action: 'pages', pages: [
      'The station\'s shift log, a ledger chained to a stand: date, dish, where it points, what came in, initials. For years now, every line has the same initials.',
      'An old page near the front. Five sets of initials to a shift, and a running argument in the margin about who keeps finishing the coffee.',
      'Further in, the page where the five sets of initials drop to one, with no reason given. At the foot of it, in the same hand: Relief did not arrive. Continued watch.',
      'Tonight. Dish 3: turning, not commanded. Signal: yes. Under SOURCE he has written a question mark and gone over it until the pencil went through the page.',
    ] },
    $: { prop: 'obj.window_6f', id: 'obj.gb_cleanroom', label: 'Clean room window',
      text: 'A window of wired glass into the clean room. The floor hasn\'t been swept in years, and there is one set of footprints in the dust.' },
    E: { enemy: 'enemy.autocomplete' },
    '@': { spawn: true },
    D: out('greenbelt', 'gb_dishes', 'Back down the hill'),
  },
})
  // Region guardian (optional): by the clean room it guards, far enough from the door to sleep until you go there.
  .enemy('boss.gb_receiver', 24, 2)
  // The footprints puzzle (src/content/puzzles.js, gb_footprints): the pass-through drawers under the window, and
  // the repeater lamp that shows when the dish's work light is over the clean room.
  .prop('obj.parts_bins', 24, 5, { id: 'obj.gb_passdrawers', label: 'Pass-through drawers',
    text: 'Twelve steel pass-through drawers set in the wall under the window, for handing things into the clean room without going in. None of them is numbered. Whoever numbered things here left before the drawers came.' })
  .prop('obj.siglamp_amber', 22, 1, { id: 'obj.gb_sweep_lamp', label: 'Repeater lamp',
    text: 'A repeater lamp on the wall, tagged DISH 3 WORK LIGHT in punched tape. It comes on when the dish\'s lamp swings over the clean room skylight, and goes off again. Somebody has timed it in pencil on the paint: a minute dark, a quarter of that lit. The numbers have been corrected twice.' })
  .build();

// ---- Greenbelt: the co-op (a century of minute books; a shop run by committee) ----
export const gbCoop = fromGrid({
  id: 'gb_coop', name: 'The Greenbelt co-op', fill: '.', act: 2,
  rows: [
    '##########DD##########',
    '#....................#',
    '#.$$$$$$....SG..MQQQ.#',
    '#....................#',
    '#..........N.........#',
    '#.FFFFFF.............#',
    '#.........@..........#',
    '######################',
  ],
  legend: {
    $: { scenery: 'obj.mate_shelf', solid: true, tile: '.' },   // shelves of jars
    F: { scenery: 'obj.feed_sacks', solid: true, tile: '.' },   // flour and rice by the sack
    Q: { scenery: 'obj.bookshelf', solid: true, tile: '.' },    // the rest of the minute books
    M: { prop: 'obj.bookshelf', id: 'obj.gb_coop_minutes', label: 'Minute books',
      text: 'The co-op\'s minute books, a century of them, one bound volume a year along the whole back wall. The 2071 volume is twice as thick as its neighbors, and 2072 is a single page.' },
    S: { prop: 'obj.kiosk', id: 'obj.gb_coop_counter', label: 'The co-op counter', action: 'shop', shop: 'coop' },
    G: { prop: 'obj.cafe_table', id: 'obj.gb_coop_tray', label: 'Sample tray', grant: 'item.crab_chips',
      text: 'A card table by the register with a hand-lettered card: FREE SAMPLE, ONE PER VISIT. Under it, smaller: CARRIED 4-3. One bag of Old Bay crab chips is left. You take it.',
      doneText: 'The card table, bare. A second card has gone up beside the first: SAMPLES SUSPENDED PENDING REVIEW.' },
    N: { npc: 'npc.gb_clerk', art: 'npc.rotter_2', label: 'A clerk',
      text: '"Eggs are thirty cents." She taps the price card, typed and gone yellow at the edges. "Same as the day they voted on it, in 2071. There\'s been no motion since, so they\'re thirty cents."' },
    '@': { spawn: true },
    D: out('greenbelt', 'gb_coop', 'Back out to the street'),
  },
}).build();

// ---- Beltsville: the barn the map doesn't show (a growth tank with a name written on it in marker) ----
// The breeding ledgers are read outside, in the vet's office (act2_regions.js), not in here.
export const bvBarn = fromGrid({
  id: 'bv_barn', name: 'The barn the map doesn\'t show', fill: ':', act: 2,
  rows: [
    '###########DD#############',
    '#:::::::::::::R::::::::::#',
    '#:TT::TT::TT::TT::TT:::::#',
    '#:TT::TT::TT::TT::TT::K::#',
    '#::::::::::::::::::::::::#',
    '#::E:::::::E:::::::E:::::#',
    '#::::::::::::::::::::::::#',
    '#::::::::::@:::::::::::::#',
    '##########################',
  ],
  legend: {
    T: { scenery: 'obj.degasser', solid: true, tile: ':' },   // growth tanks, in rows
    K: { prop: 'obj.degasser', id: 'obj.bv_named_tank', label: 'A growth tank',
      text: 'One growth tank stands apart from the rows, its glass fogged from the inside. Across the front, black marker strokes that were a name once, faded too far to read.' },
    R: { prop: 'obj.shoes', id: 'obj.bv_boot_rack', label: 'Boot rack', grant: 'item.steel_toes',
      text: 'A boot rack inside the airlock, steel-toe boots hosed off and drying upside down on pegs, a name on tape for every pair. One pair says SPARE on the tape instead. They fit well enough.',
      doneText: 'The rack, and two empty pegs with SPARE on the tape.' },
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
    B: { npc: 'npc.rf_blacksmith', art: 'npc.analogist_a', label: 'The blacksmith',
      text: '"Does it need charging?" He doesn\'t look up from the hinge on the anvil. "Then I can\'t fix it. Anything else, I can make outlast you."',
      later: [{ if: 'q.rf_library.told', text: '"Page two hundred, she says." He holds up a horseshoe no bigger than a coin. "It goes on the shelf beside her horse book. She thinks I haven\'t read it."' }] },
    L: { prop: 'obj.bookshelf', id: 'obj.rf_library', label: 'The library',
      text: 'Shelves of books copied out by hand, with the copyist\'s name on every flyleaf. Where a copyist slipped, the mistake stays in, and someone else has footnoted it.' },
    N: { npc: 'npc.rf_hardman', art: 'npc.analogist_b', label: 'A hard man',
      text: '"They put mine in at a hospital." He rubs the back of his neck, where the port used to be. "That\'s where it starts, every time. Ask anybody here who had one."' },
    '?': { prop: 'obj.planter', id: 'obj.rf_implants', label: 'A graveyard of implants',
      text: 'A plot of turned earth inside the fence, laid out like a churchyard in miniature: rows of wooden markers a hand high, each carved with initials and a date. Bits of lace hardware glint in the dirt between them, smashed flat.' },
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
    '#,cccc,cccc,cccc,Ucccc,cccc,,#',
    '#,,,,,,,,,,,,,,N,,,,,,,,,,,,,#',
    '#,cccc,cccc,,,,,,,cccc,cccc,,#',
    '#,cccc,cccc,,E,,,,cccc,cccc$,#',
    'D,,,,@,,,,,,,,,,,,,,,,,,,,E,,#',
    '##############################',
  ],
  legend: {
    c: { scenery: 'obj.crate', solid: true, tile: ',' },
    N: { npc: 'npc.bmore_steward', art: 'npc.rotter_2', label: 'A union steward',
      text: '"Shells got their union cards the year of the strike." She checks a hiring slip against the containers, row by row. "Four years to win a vote on whether they could vote. Mind the third tier, it sways."' },
    $: { prop: 'obj.crate', id: 'obj.bmore_manifests', label: 'Shipping manifests',
      text: 'A crate on its own at the end of the row, SOVEREIGN STACK stenciled on two sides and the union\'s chalk X on the lid, the one that means hands off. The manifest is in a plastic sleeve stapled to the slats.' },
    U: { prop: 'obj.toolbox', id: 'obj.bmore_tool_crib', label: 'Union tool crib', loot: 'tools',
      text: 'A container with its doors chained open, UNION TOOL CRIB stenciled across them, and a sign-out sheet on a nail. The rule at the top of the sheet: TAKE IT, SIGN IT, BRING IT BACK. Most of the lines say BACK.' },
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
    '#.....W............#',
    '#.bb.bb.bb..#......#',
    '#...........#..Dc..#',
    '#.bb.bb.bb..#......#',
    '#...........###.####',
    '#.........@........#',
    '##########XX########',
  ],
  legend: {
    b: { scenery: 'obj.bench', solid: true, tile: '.' },   // the waiting room
    D: { npc: 'npc.bmore_doctor', art: 'npc.rotter_1', label: 'The doctor',
      text: '"Sit." She doesn\'t look up from the arm she\'s wrapping. "Everybody sits. I take you worst first, and from here you look fine. Go on, sit."' },
    c: { prop: 'obj.mate_shelf', id: 'obj.bmore_meds', label: 'Supply shelf',
      text: 'A kitchen shelf turned supply shelf. Bandages boiled and rolled tight in mason jars, labeled in three different hands, and not one jar more than half full.' },
    W: { prop: 'obj.photo_wall', id: 'obj.bmore_card_wall', label: 'Cards by the door', action: 'pages', pages: [
      'Index cards pinned up by the door, one from every patient who came back to say thank you. The oldest ones are typed. Lately they come in crayon.',
      'BACK ON THE CRANES MONDAY. HANDS STOPPED SHAKING. PIER 4, NIGHTS.',
      'In pencil: She asked me what year it was. I said 1901, and she didn\'t laugh. Thank you for not laughing.',
      'A crayon drawing of a woman with very long arms, reaching over a line of tiny people. Along the bottom: TO THE DOCTOR, FROM THE LINE.',
    ] },
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
    N: { npc: 'npc.ann_pilot', art: 'npc.rotter_3', label: 'A harbor pilot',
      text: '"Everybody who walks down this pier wants a boat." She keeps splicing the line in her lap. "Learn the water first. The almanac\'s by my hut, for all the good it does."',
      later: [{ if: 'q.ann_bell.told', text: 'She has started her own count, in chalk on the hut door: seven strokes, a gap, then one more, row under row. "Same as last night," she says, and chalks another row.' }] },
    // The almanac sits by the pilot, out of the guardian's reach: reading it never wakes the fight.
    $: { prop: 'obj.flight_log', id: 'obj.ann_almanac', label: 'Tide almanac',
      text: 'The tide almanac on a lectern by the harbormaster\'s hut, a fat book with a cracked spine, its pages swollen with damp. Every printed time has other times written in beside it.' },
    '?': { prop: 'obj.bollard', id: 'obj.ann_bell', label: 'A bell across the water',
      text: 'The last bollard at the end of the pier, worn smooth by rope. From somewhere east over the water comes a church bell. The charts put one island out that way, and no church on it.' },
    '@': { spawn: true },
    D: { ...out('annapolis', 'ann_harbor', 'Back up the pier', true), tile: 'b' },
  },
})
  // Region guardian (optional): at the end of the pier, by the bell it guards.
  .enemy('boss.ann_tide', 26, 5)
  // The bell puzzle (src/content/puzzles.js, ann_bell): the pier's own bell beside the bollard where you listen, and
  // the tide board that says what the almanac swears.
  .prop('obj.pier_bell', 24, 4, { id: 'obj.ann_pier_bell', label: 'The pier bell',
    text: 'A brass fog bell on a timber post at the end of the pier, green where the spray gets it. The rope has been spliced so many times it is mostly splice.' })
  .prop('obj.room_sign', 21, 4, { id: 'obj.ann_tide_board', label: 'Tide board',
    text: 'A tide board nailed to a piling, the feet painted in white. Near the top is a red line lettered HIGHEST EVER, and under that, in four different hands: "per the almanac." The weed on the board starts a hand above the red line.' })
  .build();
