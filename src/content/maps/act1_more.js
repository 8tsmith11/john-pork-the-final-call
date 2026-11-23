// More of Act 1 (scope: docs/design/10-scope.md; Trevor: "this game must be much larger scale"). Layouts from the
// scaffold batch, built with the level builder from text grids; lines, prop art and one small secret per area from
// the polish pass (hub #30, gonman). Spanish: src/i18n/es-plaza.js (diner, campus) and es-aster.js (basement, roof).
// Brainstorm notes for each area are in docs/design/levels/act1_batch1.md.
import { makeMap } from './build.js';
import { fromGrid } from './builder.js';

// ---- The diner (College Park, east of Route 1): always open, a cook plating for an empty room ----
// Rebuilt to the room standard (hub #113; tools/level/rooms.mjs): the kitchen at the back through a swing door, the
// pass window, a counter with stools and the aisle behind it, booths under the street windows, tables, the restroom,
// and the jukebox in the far corner (the landmark, in view from the door). Booth, stool, counter and jukebox art in
// tools/art/gen_props.py. The regular's stool is crowds.js's hint (6, 7).
// Secret: the window booth has a snack left for whoever sits there next (one per save).
const DINER_BOOTH = 'Red vinyl split along the seam. Someone mended it with duct tape, and later mended the tape.';
export const diner = makeMap({
  id: 'diner', name: 'The diner', propScale: 1.25, wear: 'lived', standard: true,
  layout: [
    '##########################',   // 0
    '#wwwwwwwwwwwwww#wwww######',   // 1  kitchen | restroom
    '#wwwwwwwwwwwwww#wwww######',   // 2
    '#wwwwwwwwwwwwww#wwww######',   // 3
    '###=====#####.###.########',   // 4  the pass window, the kitchen's swing door, the restroom door
    '#wwwwwwwwwwwwwwkkkkkkkkkk#',   // 5  the aisle behind the counter | the dining room
    '#wwwwwwwwwwwwwkkkkkkkkkkk#',   // 6  the counter, and the gap at its end
    '#kkkkkkkkkkkkkkkkkkkkkkkk#',   // 7  stools
    '#kkkkkkkkkkkkkkkkkkkkkkkk#',   // 8
    '#kkkkkkkkkkkkkkkkkkkkkkkk#',   // 9
    '#kkkkkkkkkkkkkkkkkkkkkkkk#',   // 10
    '#kkkkkkkkkkkkkkkkkkkkkkkk#',   // 11
    '#kkkkkkkkkkkkkkkkkkkkkkkk#',   // 12
    '#kkkkkkkkkkkkkkkkkkkkkkkk#',   // 13 booths under the windows
    '#==========##..##========#',   // 14 the street windows and the door
  ],
  spawns: [[13, 13]],
  objects: [
    { id: 'obj.diner_out', x: 13, y: 14, w: 2, action: 'exit', to: 'metro_plaza', pair: 'obj.diner_door', art: 'obj.door', label: 'Out to Route 1', text: 'Back out onto Route 1.', floor: true, stepOn: true },
    { id: 'door.diner_kitchen', art: 'door.wall', x: 13, y: 4, label: 'Kitchen door', door: true },
    { id: 'door.diner_restroom', art: 'door.wall', x: 17, y: 4, label: 'Restroom', door: true },
    // Behind the counter
    { id: 'npc.diner_cook', x: 5, y: 5, npc: true, age: 'adult', art: 'npc.rotter_3', label: 'The cook', text: '"Order up. Scrapple, two over easy, rye." Nobody ordered it. He slides it down the counter, and it stops square in front of an empty stool.' },
    { id: 'obj.diner_counter', art: 'obj.counter', x: 7, y: 6, solid: true, label: 'The counter', action: 'shop', shop: 'diner' },
    // The far corner: the jukebox (the landmark), lit
    { id: 'obj.diner_jukebox', art: 'obj.jukebox', x: 24, y: 5, landmark: true, light: 0.8, solid: true, label: 'Jukebox', text: 'Forty slots, and every card in them has the same song title typed on it. Only the band changes, one per decade, back to the 2020s.' },
    { id: 'obj.diner_specials', art: 'obj.chalkboard', x: 20, y: 4, label: 'Specials board', text: 'SPECIAL: SCRAPPLE, TWO OVER EASY, RYE. The date under it is rubbed out and chalked in again every morning. The special stays.' },
    { id: 'obj.diner_neon', art: 'obj.neon', x: 20, y: 14, light: 0.7, label: 'Neon sign', text: 'The EAT sign from the back. From in here it reads TAE, and the A is dark.' },
    // Booths under the windows; the one nearest the door is the window booth
    ...[[2, 13], [6, 13], [19, 13]].map(([x, y], i) => ({ id: `obj.diner_booth_${i + 1}`, art: 'obj.booth', x, y, solid: true, label: 'Booth', text: DINER_BOOTH })),
    { id: 'obj.diner_window_booth', art: 'obj.booth', x: 10, y: 13, solid: true, label: 'The window booth', grant: 'item.energy_bar',
      text: 'The booth by the window, with a view of the door. On the seat, a Halfsmoke bar still in its wrapper, on a napkin that says in pencil: FOR WHOEVER SITS HERE NEXT. You sit down.',
      doneText: 'Only the napkin now. You leave it where it was.' },
    // The kitchen and the restroom
    { id: 'obj.diner_spices', art: 'obj.supplements', x: 8, y: 1, solid: true, label: 'Spice shelf', text: 'Jars in rows, the labels gone brown with grease. In the middle of the shelf, a clean square where a tin used to stand.' },
    { id: 'obj.diner_handwash', art: 'obj.house_rules', x: 18, y: 0, label: 'A sign over the sink', text: 'EMPLOYEES MUST WASH HANDS. Under it, a pencil tally of who has. The cook is winning.' },
  ],
  scenery: [
    // the counter, the coffee machine at its end, and ten stools
    ...[1, 2, 3, 4, 5, 6, 8, 9, 10, 11].map((x) => ({ art: 'obj.counter', x, y: 6, solid: true })), { art: 'obj.coffee', x: 12, y: 6, solid: true, light: 0.4 },
    ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((x) => ({ art: 'obj.stool', x, y: 7 })), { art: 'obj.bin', x: 14, y: 7 },
    // booths and tables
    ...[4, 8, 17, 21, 23].map((x) => ({ art: 'obj.booth', x, y: 13, solid: true })),
    ...[[18, 8], [21, 8], [18, 10], [21, 10]].map(([x, y]) => ({ art: 'obj.cafe_table', x, y, solid: true })),
    { art: 'obj.plant', x: 1, y: 7 }, { art: 'obj.plant', x: 24, y: 13 }, { art: 'obj.newsbox', x: 15, y: 13 },
    // the kitchen: the flat-top, the fridge, the prep table, supplies; the restroom sink
    { art: 'obj.stove', x: 2, y: 1, solid: true, light: 0.5 }, { art: 'obj.stove', x: 3, y: 1, solid: true }, { art: 'obj.fridge', x: 12, y: 1, solid: true },
    { art: 'obj.table', x: 6, y: 3, solid: true }, { art: 'obj.boxes', x: 14, y: 3 }, { art: 'obj.crate', x: 14, y: 1, solid: true },
    { art: 'obj.mm_mirror', x: 17, y: 1 },
  ],
});

// ---- ASTER basement, B-01 (the super's level): boilers, Kess's workshop, storage cages ----
// Secret: 631 has a storage cage nobody told you about. Kess's pegboard is the hint.
export const asterBasement = fromGrid({
  id: 'aster_basement', name: 'ASTER, basement (B-01)', fill: ':',
  rows: [
    '##########################',
    '#U:::::#::::::::#::::::::#',
    '#::@:::#::BB::::#::$::$:G#',
    '#::::::#::BB::::#::::::::#',
    '#::::::####:#####::::::::#',
    '#:::::::::::::::####:#####',
    '#::K::::::::::::::::::::E#',
    '#::::::::::::::::::::::::#',
    '##########################',
  ],
  legend: {
    U: { exit: 'aster_lobby', id: 'obj.basement_stairs', art: 'obj.stairs', label: 'Stairs up to the lobby', pair: 'obj.lobby_basement', text: 'Up to the lobby.' },
    B: { scenery: 'obj.degasser', solid: true },
    K: { prop: 'obj.workbench', id: 'obj.kess_bench', label: 'Kess\'s workbench', text: 'Baby-food jars of screws, sorted by size and labeled in square capitals. The fullest jar says STRIPPED. Above the bench, a pegboard of storage-cage keys, one hook per unit. The key on 631\'s hook is furred with dust.' },
    $: { prop: 'obj.crate', label: 'Storage cage', loot: 'parts', text: 'Chicken wire on a wooden frame, a unit number stenciled on the door. The padlock is a twist tie.' },
    G: { prop: 'obj.crate', id: 'obj.basement_cage_631', label: 'Storage cage 631', grant: 'item.bike_helmet',
      text: 'Cage 631. Nobody told you the apartment came with one. You borrow the key off Kess\'s pegboard and put it back after. On the only shelf, a bike helmet some tenant before you left behind.',
      doneText: 'Cage 631. An empty shelf, and a clean ring in the dust where the helmet sat.' },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
  },
}).exit('aster_laundry', 25, 7, { id: 'obj.basement_laundry', art: 'obj.door', pair: 'obj.laundry_out', label: 'The laundry room', text: 'The laundry room. Two dryers going, and somebody folding.' }).build();

// ---- ASTER roof: water tank, the view of the cordon lights, a place people go to be alone ----
// Secret: a cooler behind the water tank, left for whoever needs it (a searchable container).
export const asterRoof = fromGrid({
  id: 'aster_roof', name: 'ASTER, the roof', fill: 'y', outdoor: false,
  rows: [
    '========================',
    '=yyyyyyyyyyyyyyyyyyyyyy=',
    '=yyWWyyyyyyyy@yyyyyyyyy=',
    '=yyWWKyyyyyyyyyyyyVyyyy=',
    '=yyyyyyyyyyyyyyyyyyyyyy=',
    '=yyyyyyyyyyyyyNyyyyyyyy=',
    '=yyyyyyyyyyyyyyyyyyyyyy=',
    '=Lyyyyyyyyyyyyyyyyyyyyy=',
    '========================',
  ],
  legend: {
    L: { exit: 'aster_hall', id: 'obj.roof_hatch', art: 'obj.stairs', label: 'Hatch down to the sixth floor', pair: 'obj.hall_roof', text: 'Back down the ladder.' },
    W: { scenery: 'obj.degasser', solid: true },
    V: { prop: 'obj.balcony_view', id: 'obj.roof_view', label: 'The view north', text: 'A coin viewer bolted to the rail, aimed north. Through it, the cordon floodlights stand in a ring around College Park, white against the dark. From up here you can see the ring close behind you, with ASTER near the middle.' },
    N: { npc: 'npc.roof_watcher', art: 'npc.rotter_1', label: 'Someone on the roof', text: '"Start at the water tower and go left. Don\'t count the moon. People count the moon." They keep their eyes on the north the whole time.' },
    K: { prop: 'obj.toolbox', id: 'obj.roof_cooler', label: 'A cooler behind the tank', loot: 'lost', text: 'A cooler wedged behind the water tank, out of the wind. On the lid in marker: IF YOU CAME UP HERE YOU NEED IT MORE THAN ME.' },
    '@': { spawn: true },
  },
}).build();

// ---- The campus quad (behind Compute Hall B): the dining hall, the robotics lab, the cordon at the edge ----
// Compute Hall B's back wall closes the north side of the quad, between the dining hall and the robotics lab: you walk
// north into its back door and come out of the hall's south wall (campus.js), facing the way you went.
// Job: the abatement bounty board can post a rot nest on the lawn here (src/content/jobs.js, NESTS).
export const campusQuad = fromGrid({
  id: 'campus_quad', name: 'The campus quad', fill: 'g', outdoor: true,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T########ggg########ggg#########AT',
    'T########ggg####H###ggg#########gT',
    'T####F###ggggqqqqqqgggg####R####gT',
    'Tggggqggggggggq....qggggggggqggggT',
    'Tggggqqqqqqqqqq.EE.qqqqqqqqqqggggT',
    'Tggggggggggggggq....qggggggggggggT',
    'TggTgggggggggggqqqqqqMgggggggTgggT',
    'Tggggggggggggggggg@ggggggggggggggT',
    'TggggggggggggggggggggggggggggggggT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    F: { exit: 'dining_hall', id: 'obj.quad_dining', art: 'obj.door', label: 'The dining hall', pair: 'obj.dining_out', text: 'The dining hall. The lights are on.' },
    R: { exit: 'robotics_lab', id: 'obj.quad_robotics', art: 'obj.door', label: 'Robotics and Autonomy Lab', pair: 'obj.robotics_out', text: 'The robotics lab. A keypad, and someone has written the code on the wall next to it.' },
    A: { exit: 'auditorium', id: 'obj.quad_auditorium', art: 'obj.door', label: 'The lecture auditorium', pair: 'obj.aud_out', text: 'The big lecture hall. A projector hums behind the doors.' },
    H: { exit: 'compute_hall_b', id: 'obj.quad_chb', art: 'obj.door', label: 'Back into Compute Hall B', pair: 'obj.chb_quad_door', text: 'Back inside.' },
    M: { prop: 'obj.directory', id: 'obj.quad_map', label: 'Campus map', text: 'A campus map under scratched plastic. YOU ARE HERE is a red dot on the quad. Someone has gone round the tree line in ballpoint and written beside it: NO FURTHER.' },
    E: { enemy: 'enemy.spitter' },
    '@': { spawn: true },
  },
}).build();

// ---- The dining hall (Trevor's future-locations list): long tables, the waffle machine, a cook who stayed ----
// Secret: the meal swipe reader by the door has three screens to page through.
export const diningHall = fromGrid({
  id: 'dining_hall', name: 'The dining hall', fill: 'k',
  rows: [
    '#############################',
    '#kkkkkkkkkkkkkkkkkkkkkkkkkkk#',
    '#kkttttttttkkkkkttttttttkkkk#',
    '#kkkkkkkkkkkkkkkkkkkkkkkkkkk#',
    '#kkttttttttkkkkkttttttttkkkk#',
    '#kkkkkkkkkkkkkkkkkkkkkkkkkkk#',
    '#kkkkkkkkkkWkkkkkkkkkkkCkkkk#',
    '#kkkkkkkkkkkk@kRkkkkkkkkkkkk#',
    '#############DD##############',
  ],
  legend: {
    t: { scenery: 'obj.table', solid: true, tile: 'k' },
    W: { prop: 'obj.kiosk', id: 'obj.waffle_machine', label: 'The waffle machine', light: 0.5, text: 'Chrome and a touch screen, the protective film still on one side. It presses the university seal into every waffle, and then the screen asks you to rate your waffle from one to five.' },
    C: { npc: 'npc.dining_cook', art: 'npc.rotter_2', label: 'A cook who stayed', text: '"Forty years on this grill. They put that machine in on a Sunday and nobody asked me." She scrapes down the flat-top, which is already clean.' },
    R: { prop: 'obj.lobby_monitor', id: 'obj.dining_swipe', label: 'Meal swipe reader', light: 0.4, action: 'pages', pages: [
      'You tap your student card out of habit. "WELCOME BACK. SWIPES REMAINING: 4,016." It has said 4,016 since the semester you started.',
      'Between swipes it scrolls TOP SWIPERS THIS WEEK, like a high-score table. First place is a card from ASTER 631. Second place has eleven.',
      'RATE YOUR MEAL, and five faces from a big smile down to a frown. The frown has been pressed so often its plastic has gone white.',
    ] },
    '@': { spawn: true },
    D: { exit: 'campus_quad', id: 'obj.dining_out', art: 'obj.door', label: 'Out to the quad', stepOn: true, pair: 'obj.quad_dining', text: 'Back out to the quad.' },
  },
}).build();

// ---- The Robotics and Autonomy Lab: where the UMD Mars rover lives (Trevor: it belongs in the world, not his gear) ----
// Secret: the rover team's drawer holds a pair of welding goggles (one per save). The rover has its own frame,
// obj.mars_rover (tools/art/gen_props.py); obj.battlebot stays Trevor's, in 631.
export const roboticsLab = fromGrid({
  id: 'robotics_lab', name: 'Robotics and Autonomy Lab', fill: 'e',
  rows: [
    '##########################',
    '#eeeeeeeeeeeeeeeeeeeeeeee#',
    '#eeMeeeeeeeeeeeeeeeeQeeee#',
    '#eeeeeeeeeeeeeeeeeeeeeeee#',
    '#eeeeeee######eeeeeeeeeee#',
    '#eeeeeee#eeee#eeeeeeeeeee#',
    '#eeBeKeeeeeeeeeeeeeeeEeee#',
    '#eeeeeeeee@eeeeeeeeeeeeee#',
    '###########DD#############',
  ],
  legend: {
    M: { prop: 'obj.mars_rover', id: 'obj.mars_rover', label: 'The Mars rover', text: 'The UMD rover team\'s machine, on a cart in the middle of the bay. A laminated tag on the frame: FLIGHT SPARE, DO NOT CANNIBALIZE. It has been cannibalized a little.' },
    Q: { prop: 'obj.whiteboard', id: 'obj.rover_whiteboard', label: 'Whiteboard', text: 'Wheel torque numbers in three colors of marker. DEMO DAY, with the date crossed out and moved four times. In the corner, a stick figure holding a wrench, labeled TREVOR. Someone gave it very good hair.' },
    B: { prop: 'obj.parts_bins', label: 'Parts bin', loot: 'parts', text: 'Little drawers, each labeled in label-maker tape: M3 SCREWS, ENCODERS, MOTORS (DEAD), MOTORS (PROBABLY).' },
    K: { prop: 'obj.workbench', id: 'obj.rover_drawer', label: 'Drawer marked ROVER TEAM', grant: 'item.welding_goggles',
      text: 'A steel drawer under the bench, ROVER TEAM ONLY on masking tape. Inside, welding goggles with more tape on the strap: RETURN TO BAY 3. This is bay 3. You borrow them anyway.',
      doneText: 'The empty drawer, and the tape: RETURN TO BAY 3.' },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
    D: { exit: 'campus_quad', id: 'obj.robotics_out', art: 'obj.door', label: 'Out to the quad', stepOn: true, pair: 'obj.quad_robotics', text: 'Back out to the quad.' },
  },
}).build();

// ---- The lecture auditorium (off the quad): tiered seats, a projector still running, and the Autograder ----
// Secret: the projector's clicker steps back through the last lecture, slide by slide.
// The way out is in the south wall, at the east end: the quad's door to it faces south (act1_more.js, above).
export const auditorium = fromGrid({
  id: 'auditorium', name: 'The lecture auditorium', fill: 'e',
  rows: [
    '########################################',
    '#eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee#',
    '#eeeeeeeesssssssssseesssssssssseeeeeeee#',
    '#eePeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee#',
    '#eeeeeeeesssssssssseesssssssssseeeeeeee#',
    '#eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee#',
    '#eeeeeeeesssssssssseesssssssssseeeeeeee#',
    '#eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee#',
    '#eeeeeeeesssssssssseesssssssssseeeeEeee#',
    '#eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee@eee#',
    '#####################################U##',
  ],
  legend: {
    s: { scenery: 'obj.table', solid: true, tile: 'e' },
    P: { prop: 'obj.lobby_monitor', id: 'obj.aud_projector', label: 'The projector', light: 0.6, action: 'pages', pages: [
      'Still running. Slide 41 of 41: QUESTIONS? The clicker is on the lectern. You press back.',
      'Slide 40: GRADING IS NOW FULLY AUTOMATED. A cartoon checkmark with a face, waving. You press back.',
      'Slide 39: OFFICE HOURS. The times have been deleted and replaced with one word, NOW, in a font nobody chose.',
      'Slide 1. The course title has rotted into a row of empty boxes. Under it, small: RECORDED 2079. PLAYS AT 19:01 DAILY.',
    ] },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
    U: { exit: 'campus_quad', id: 'obj.aud_out', art: 'obj.door', label: 'Out to the quad', pair: 'obj.quad_auditorium', text: 'Back out to the quad.' },
  },
}).enemy('boss.chb_autograder', 3, 6).build();
