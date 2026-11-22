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
    { id: 'npc.diner_cook', x: 5, y: 5, npc: true, age: 'adult', art: 'npc.diner_cook', label: 'The cook', text: '"Order up. Scrapple, two over easy, rye." Nobody ordered it. He slides it down the counter, and it stops square in front of an empty stool.' },
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

// ---- ASTER basement, B-01 (the super's level): the boiler, the panel, Kess's workshop, storage cages ----
// Rebuilt to the room standard (hub #113; tools/level/rooms.mjs). The stairs come down beside the boiler (the
// landmark), on its pad with the water heaters. East of it the electrical room, then the tenants' storage cages along
// the north wall, 631's last. One corridor runs the width of the building; off its south side, Kess's workshop, the
// sump, and the bike room, whose east wall has the door to the laundry.
// Secret: 631 has a storage cage nobody told you about. Kess's pegboard is the hint. The two lootable cages keep the
// ids the level builder gave them, so saves that searched them still know.
const CAGE = 'Chicken wire on a wooden frame, a unit number stenciled on the door. The padlock is a twist tie.';
export const asterBasement = makeMap({
  id: 'aster_basement', name: 'ASTER, basement (B-01)', propScale: 1.25, wear: 'lived', standard: true,
  layout: [
    '##############################',   // 0  the panel
    '#::::mmmmmmmm#eeeeee#::::::::#',   // 1  stairs | the boiler | electrical room | storage cages
    '#::::mmmmmmmm#eeeeee#::::::::#',   // 2
    '#::::mmmmmmmm#eeeeee#::::::::#',   // 3
    '#::::mmmmmmmm#eeeeee#::::::::#',   // 4
    '#::::mmmmmmmm###e####::::::::#',   // 5  electrical room door
    '#::::::::::::::::::::::::::::#',   // 6  the corridor
    '#::::::::::::::::::::::::::::#',   // 7
    '#::::::::::::::::::::::::::::#',   // 8
    '#######k#######:::::#####:####',   // 9  workshop door | the sump | bike room door
    '#kkkkkkkkkkkkk#:::::#::::::::#',   // 10 Kess's workshop | | bikes
    '#kkkkkkkkkkkkk#:::::#::::::::#',   // 11
    '#kkkkkkkkkkkkk#:::::#::::::::#',   // 12 the laundry door, in the east wall
    '#kkkkkkkkkkkkk#:::::#::::::::#',   // 13
    '##############################',   // 14
  ],
  spawns: [[2, 3]],
  enemies: [['enemy.rotling', 24, 7]],
  decals: [['dec.drain', 9, 4], ['dec.puddle_1', 10, 4], ['dec.stain', 6, 3], ['dec.drain', 16, 11], ['dec.puddle_0', 18, 11], ['dec.drip', 17, 10], ['dec.stain', 22, 7], ['dec.oil', 24, 12], ['dec.rust', 12, 3]],
  objects: [
    { id: 'obj.basement_stairs', art: 'obj.stairs', x: 1, y: 1, action: 'exit', to: 'aster_lobby', pair: 'obj.lobby_basement', label: 'Stairs up to the lobby', text: 'Up to the lobby.' },
    { id: 'obj.basement_laundry', art: 'obj.door', x: 29, y: 12, action: 'exit', to: 'aster_laundry', pair: 'obj.laundry_out', label: 'The laundry room', text: 'The laundry room. Two dryers going, and somebody folding.' },
    { id: 'door.basement_electrical', art: 'door.wall', x: 16, y: 5, label: 'Electrical room', door: true },
    { id: 'door.basement_workshop', art: 'door.wall', x: 7, y: 9, label: 'Workshop door', door: true },
    { id: 'door.basement_bikes', art: 'door.wall', x: 25, y: 9, label: 'Bike room', door: true },
    // The boiler (the landmark) and the water heaters
    { id: 'obj.basement_boiler', art: 'obj.boiler', x: 8, y: 2, landmark: true, light: 0.8, solid: true, label: 'The boiler',
      text: 'Cast iron, older than the wiring. The needle sits a hair under the red and has sat there all winter. A service tag hangs off a valve on a string. The year on it has been written over twice.' },
    { id: 'obj.basement_heater', art: 'obj.water_heater', x: 11, y: 1, solid: true, light: 0.3, label: 'Water heater',
      text: 'The pilot is lit. A strip of masking tape across the dial: DO NOT TURN UP. 4F, THIS MEANS YOU.' },
    // The electrical room
    { id: 'obj.basement_panel', art: 'obj.fuse_panel', x: 16, y: 0, light: 0.5, label: 'Electrical panel',
      text: 'The building\'s panel, every breaker labeled in square capitals. LOBBY. HALLS. ELEVATOR (SOMETIMES). On the shelf under it, a cigar box marked SPARE FUSES. It is empty except for a note: ASK ME. K.' },
    // Storage cages, by unit
    { id: 'obj.aster_basement_crate_19_2', art: 'obj.storage_cage', x: 21, y: 1, solid: true, label: 'Storage cage', loot: 'parts', text: CAGE },
    { id: 'obj.aster_basement_crate_22_2', art: 'obj.storage_cage', x: 25, y: 1, solid: true, label: 'Storage cage', loot: 'parts', text: CAGE },
    { id: 'obj.basement_cage_631', art: 'obj.storage_cage', x: 28, y: 1, solid: true, label: 'Storage cage 631', grant: 'item.bike_helmet',
      text: 'Cage 631. Nobody told you the apartment came with one. You borrow the key off Kess\'s pegboard and put it back after. On the only shelf, a bike helmet some tenant before you left behind.',
      doneText: 'Cage 631. An empty shelf, and a clean ring in the dust where the helmet sat.' },
    // Kess's workshop
    { id: 'obj.kess_bench', art: 'obj.workbench', x: 3, y: 10, solid: true, label: 'Kess\'s workbench', text: 'Baby-food jars of screws, sorted by size and labeled in square capitals. The fullest jar says STRIPPED. Above the bench, a pegboard of storage-cage keys, one hook per unit. The key on 631\'s hook is furred with dust.' },
    { id: 'obj.kess_tools', art: 'obj.tool_wall', x: 10, y: 9, label: 'Tool board', text: 'Every tool hangs inside its own painted outline. Not one is missing.' },
    // The sump and the bike room
    { id: 'obj.basement_sump', art: 'obj.sump', x: 17, y: 12, solid: true, label: 'Sump pit', text: 'The pump kicks on every few minutes and sends the water somewhere else. The float is a red ball on a wire.' },
    { id: 'obj.basement_bikes', art: 'obj.bikerack', x: 22, y: 10, solid: true, label: 'Bike storage', text: 'Bikes on a rack, each with a unit number on a luggage tag. One has two locks on it and no wheels.' },
  ],
  scenery: [
    // the boiler pad and the landing
    { art: 'obj.pipe_run', x: 5, y: 1, solid: true }, { art: 'obj.pipe_run', x: 6, y: 1, solid: true }, { art: 'obj.water_heater', x: 12, y: 1, solid: true, anim: 560 },
    { art: 'obj.toolbox', x: 11, y: 4 }, { art: 'obj.extinguisher', x: 4, y: 1 }, { art: 'obj.boxes', x: 1, y: 4 },
    // the electrical room
    { art: 'obj.pipe_run', x: 14, y: 1, solid: true }, { art: 'obj.shelf_boxes', x: 19, y: 1, solid: true }, { art: 'obj.crate', x: 19, y: 3, solid: true }, { art: 'obj.worklamp', x: 14, y: 4, light: 0.4 },
    // the cages between the three you can open, and what didn't fit in them
    ...[22, 23, 24, 26, 27].map((x) => ({ art: 'obj.storage_cage', x, y: 1, solid: true })),
    { art: 'obj.boxes', x: 22, y: 4 }, { art: 'obj.crate', x: 27, y: 4, solid: true }, { art: 'obj.cart', x: 24, y: 4 },
    // the corridor
    { art: 'obj.tube_light', x: 18, y: 5, scale: 1, light: 0.5, anim: 260 }, { art: 'obj.dehumidifier', x: 19, y: 6 }, { art: 'obj.bin', x: 13, y: 8 }, { art: 'obj.recycle', x: 12, y: 8 },
    { art: 'obj.boxes', x: 1, y: 8 }, { art: 'obj.crate', x: 2, y: 8, solid: true }, { art: 'obj.ladders', x: 28, y: 8, solid: true },
    // Kess's workshop
    { art: 'obj.parts_bins', x: 1, y: 10, solid: true }, { art: 'obj.parts_bins', x: 2, y: 10, solid: true }, { art: 'obj.workbench', x: 4, y: 10, solid: true }, { art: 'obj.drill_press', x: 5, y: 10, solid: true },
    { art: 'obj.worklamp', x: 6, y: 11, light: 0.5 }, { art: 'obj.chair', x: 3, y: 11 }, { art: 'obj.shelf_tools', x: 12, y: 10, solid: true }, { art: 'obj.shelf_tools', x: 13, y: 10, solid: true },
    { art: 'obj.coffee', x: 9, y: 10, light: 0.3 }, { art: 'obj.toolbox', x: 8, y: 13 }, { art: 'obj.crate', x: 13, y: 13, solid: true }, { art: 'obj.boxes', x: 12, y: 13 }, { art: 'obj.couch', x: 2, y: 13, solid: true },
    // the sump
    { art: 'obj.pipe_run', x: 19, y: 10, solid: true }, { art: 'obj.dehumidifier', x: 15, y: 13 }, { art: 'obj.cone', x: 16, y: 13 },
    // the bike room
    { art: 'obj.bikerack', x: 21, y: 10, solid: true }, { art: 'obj.bikerack', x: 23, y: 10, solid: true }, { art: 'obj.tires', x: 28, y: 10 }, { art: 'obj.tube_light', x: 27, y: 9, scale: 1, light: 0.4 },
    { art: 'obj.crate', x: 21, y: 13, solid: true }, { art: 'obj.boxes', x: 22, y: 13 }, { art: 'obj.shoppingcart', x: 26, y: 13, solid: true },
  ],
});

// ---- ASTER roof: the water tank, the view of the cordon lights, a place people go to be alone ----
// Rebuilt to the room standard (hub #113). The hatch comes up in the west parapet's corner of the walkway (pavers);
// the water tank stands on its pad to the south-east (the landmark), the cooler wedged behind it. North of the walkway
// is the deck somebody laid for the lawn chairs, strung with lights; along the north parapet, the coin viewer and
// whoever is counting. The block in the north-east corner is the elevator machine room.
// Secret: a cooler behind the water tank, left for whoever needs it (a searchable container).
export const asterRoof = makeMap({
  id: 'aster_roof', name: 'ASTER, the roof', outdoor: false, propScale: 1.25, standard: true,
  layout: [
    '==========================',   // 0  the north parapet
    '=yyyyyyyyyyyyyyyyyyyyyyyy=',   // 1  the view
    '=yyyyyyyyyyyyyyyyyyyyyyyy=',   // 2
    '=yybbbbbbbbyyyyyyyy####yy=',   // 3  the deck | the elevator machine room
    '=yybbbbbbbbyyyyyyyy####yy=',   // 4
    '=yybbbbbbbbyyyyyyyy####yy=',   // 5
    '=yybbbbbbbbyyyyyyyyyyyyyy=',   // 6
    '=pppppppppppppppyyyyyyyyy=',   // 7  the hatch, and the walkway
    '=yyyyyyyyyyyyypyyyyyyyyyy=',   // 8
    '=yyyyyyyyyyyyypmmmmmmyyyy=',   // 9  the tank's pad
    '=yyyyyyyyyyyyypmmmmmmyyyy=',   // 10
    '=yyyyyyyyyyyyypmmmmmmyyyy=',   // 11
    '=yyyyyyyyyyyyyyyyyyyyyyyy=',   // 12
    '=yyyyyyyyyyyyyyyyyyyyyyyy=',   // 13
    '==========================',   // 14
  ],
  spawns: [[3, 8]],
  decals: [['dec.patch', 5, 9], ['dec.patch', 6, 9], ['dec.patch', 20, 13], ['dec.patch', 12, 2], ['dec.patch', 22, 8], ['dec.patch', 9, 12], ['dec.puddle_0', 17, 13], ['dec.puddle_1', 3, 10],
    ['roof.skylight_lit', 8, 10], ['roof.skylight', 9, 10], ['dec.stain', 16, 12], ['dec.leaves_0', 1, 13], ['dec.weeds', 24, 12]],
  objects: [
    { id: 'obj.roof_hatch', art: 'obj.hatch', x: 1, y: 7, action: 'exit', to: 'aster_hall', pair: 'obj.hall_roof', label: 'Hatch down to the sixth floor', text: 'Back down the ladder.' },
    // The water tank (the landmark), and what's behind it
    { id: 'obj.roof_tank', art: 'obj.water_tank', x: 17, y: 11, scale: 2, landmark: true, light: 0.8, solid: true, label: 'The water tank',
      text: 'Cedar staves and steel hoops on four legs. ASTER was stenciled on it once. A, T and R are left. It ticks as it cools.' },
    { id: 'obj.roof_cooler', art: 'obj.cooler', x: 19, y: 9, label: 'A cooler behind the tank', loot: 'lost', text: 'A cooler wedged behind the water tank, out of the wind. On the lid in marker: IF YOU CAME UP HERE YOU NEED IT MORE THAN ME.' },
    // The north parapet
    { id: 'obj.roof_view', art: 'obj.coin_viewer', x: 13, y: 1, solid: true, label: 'The view north', text: 'A coin viewer bolted to the rail, aimed north. Through it, the cordon floodlights stand in a ring around College Park, white against the dark. From up here you can see the ring close behind you, with ASTER near the middle.' },
    { id: 'npc.roof_watcher', x: 15, y: 2, npc: true, art: 'npc.roof_watcher', label: 'Someone on the roof', age: 'adult', text: '"Start at the water tower and go left. Don\'t count the moon. People count the moon." They keep their eyes on the north the whole time.' },
    // The deck, the garden, the machinery
    { id: 'obj.roof_chairs', art: 'obj.lawn_chair', x: 8, y: 4, label: 'Lawn chairs', text: 'Three lawn chairs facing north, and a fourth facing the other three.' },
    { id: 'obj.roof_garden', art: 'obj.balcony_plants', x: 2, y: 12, label: 'Tomatoes', text: 'Tomatoes in buckets, staked and labeled. A fire hose runs to them from somewhere below, coupled to a garden nozzle with a great deal of tape.' },
    { id: 'obj.roof_hvac', art: 'obj.hvac', x: 6, y: 12, solid: true, label: 'Rooftop units', text: 'Three units. Two run. The third has a nest in it, and as far as anyone is concerned the nest has a lease.' },
    { id: 'obj.roof_machine_room', art: 'obj.door', x: 20, y: 5, label: 'Elevator machine room', text: 'ELEVATOR MACHINE ROOM. Behind the door, something winds a cable very slowly and then stops to think about it.' },
  ],
  scenery: [
    // by the tank (drawn twice the size: it stands over its whole pad, and you can walk in under the legs): a lamp somebody left
    { art: 'obj.worklamp', x: 15, y: 11, light: 0.4 }, { art: 'obj.toolbox', x: 20, y: 11 }, { art: 'obj.roof_vent', x: 22, y: 10, solid: true },
    // the deck: lights strung along its north edge, the chairs, a table
    ...[3, 5, 7, 9].map((x, i) => ({ art: 'obj.string_lights', x, y: 2, scale: 1, ...(i % 2 ? {} : { light: 0.5 }) })),
    { art: 'obj.lawn_chair', x: 4, y: 4 }, { art: 'obj.lawn_chair', x: 6, y: 4 }, { art: 'obj.lawn_chair', x: 6, y: 6, flip: true }, { art: 'obj.cafe_table', x: 9, y: 5, solid: true }, { art: 'obj.crate', x: 3, y: 6, solid: true },
    // the garden in the south-west corner, by the units
    { art: 'obj.hose_reel', x: 3, y: 12, solid: true }, { art: 'obj.flowerpot', x: 1, y: 11 }, { art: 'obj.flowerpot', x: 2, y: 11 }, { art: 'obj.flowerpot', x: 1, y: 12 }, { art: 'obj.planter', x: 4, y: 13, solid: true },
    { art: 'obj.hvac', x: 8, y: 12, solid: true }, { art: 'obj.hvac', x: 10, y: 12, solid: true, anim: 300 },
    // vents, the aerial, and the machine room's corner
    { art: 'obj.roof_vent', x: 11, y: 9, solid: true }, { art: 'obj.roof_vent', x: 2, y: 2, solid: true }, { art: 'obj.roof_vent', x: 22, y: 12, solid: true }, { art: 'obj.roof_vent', x: 17, y: 5, solid: true },
    { art: 'obj.antenna', x: 23, y: 2, solid: true, light: 0.4, anim: 900 }, { art: 'obj.cables', x: 21, y: 6 }, { art: 'obj.toolbox', x: 22, y: 6 }, { art: 'obj.bench', x: 17, y: 2 },
    { art: 'obj.crate', x: 23, y: 13, solid: true }, { art: 'obj.boxes', x: 24, y: 13 }, { art: 'obj.planter', x: 12, y: 13, solid: true },
  ],
});

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

// ---- The dining hall (Trevor's future-locations list): the serving line, the waffle machine, a cook who stayed ----
// Rebuilt to the room standard (hub #113): the kitchen and the dish room at the back, the pass windows, the aisle
// behind the serving line where the cook stands, the line itself (trays, steam tables, cereal, drinks) ending at the
// new waffle machine (the landmark, straight ahead of the door), then long tables, round tables and booths under the
// windows, and the dish return on the east wall. The student with the waffle is crowds.js's hint (18, 10).
// Secret: the meal swipe reader by the door has three screens to page through.
export const diningHall = makeMap({
  id: 'dining_hall', name: 'The dining hall', standard: true,
  layout: [
    '################################',   // 0
    '#kkkkkkkkkkkkkkkkkkkk#wwwwwwwww#',   // 1  kitchen | dish room
    '#kkkkkkkkkkkkkkkkkkkk#wwwwwwwww#',   // 2
    '#kkkkkkkkkkkkkkkkkkkk#wwwwwwwww#',   // 3
    '##========#=======##.##.##==####',   // 4  pass windows, the kitchen door, the dish room door, the dish return
    '#kkkkkkkkkkkkkkkkkkkmmmmmmmmmmm#',   // 5  the aisle behind the line
    '#kkkkkkkkkkkkkkkkkkkmmmmmmmmmmm#',   // 6  the serving line, the waffle machine at its end
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 7  the queue
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 8
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 9  long tables | round tables
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 10
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 11
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 12
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 13
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 14
    '#mmmmmmmmmmmmmmmmmccccccccccccc#',   // 15
    '#mmmmmmmmmmmmmmmmmccccccccccccc#',   // 16 booths under the windows
    '##==#==#==###mm####==#==#==#==##',   // 17 the windows and the doors
  ],
  spawns: [[13, 16]],
  objects: [
    { id: 'obj.dining_out', x: 13, y: 17, w: 2, action: 'exit', to: 'campus_quad', pair: 'obj.quad_dining', art: 'obj.door', label: 'Out to the quad', text: 'Back out to the quad.', floor: true, stepOn: true },
    { id: 'door.dining_kitchen', art: 'door.wall', x: 20, y: 4, label: 'Kitchen door', door: true },
    { id: 'door.dining_dish', art: 'door.wall', x: 23, y: 4, label: 'Dish room', door: true },
    // The line, and the machine at the end of it (the landmark)
    { id: 'obj.waffle_machine', x: 14, y: 6, landmark: true, light: 0.7, solid: true, label: 'The waffle machine', text: 'Chrome and a touch screen, the protective film still on one side. It presses the university seal into every waffle, and then the screen asks you to rate your waffle from one to five.' },
    { id: 'npc.dining_cook', x: 6, y: 5, npc: true, age: 'adult', art: 'npc.dining_cook', label: 'A cook who stayed', text: '"Forty years on this grill. They put that machine in on a Sunday and nobody asked me." She scrapes down the flat-top, which is already clean.' },
    { id: 'obj.dining_line', art: 'obj.steam_table', x: 5, y: 6, solid: true, label: 'The serving line', text: 'Six pans under the sneeze guard, all of them full and none of them touched. A card on the glass: PLEASE TRY THE WAFFLES. Nobody on the kitchen side wrote it.' },
    { id: 'obj.dining_cereal', art: 'obj.cereal_bar', x: 9, y: 6, solid: true, label: 'Cereal dispensers', text: 'Three tubes, three cranks. The middle one has been empty so long that someone has labeled it DECORATIVE.' },
    { id: 'obj.dining_menu', art: 'obj.chalkboard', x: 10, y: 4, label: 'Menu board', text: 'The week in chalk. Monday to Friday each say WAFFLES, in type. Under them, by hand and pressed hard: GRILL STILL OPEN.' },
    { id: 'obj.dining_condiments', art: 'obj.condiments', x: 16, y: 6, solid: true, label: 'Condiments', text: 'Ketchup, mustard, a jar of forks. The syrup has been moved to a locked cabinet under the waffle machine. The machine has the key.' },
    { id: 'obj.dining_swipe', art: 'obj.swipe_reader', x: 16, y: 15, solid: true, label: 'Meal swipe reader', light: 0.4, action: 'pages', pages: [
      'You tap your student card out of habit. "WELCOME BACK. SWIPES REMAINING: 4,016." It has said 4,016 since the semester you started.',
      'Between swipes it scrolls TOP SWIPERS THIS WEEK, like a high-score table. First place is a card from ASTER 631. Second place has eleven.',
      'RATE YOUR MEAL, and five faces from a big smile down to a frown. The frown has been pressed so often its plastic has gone white.',
    ] },
    { id: 'obj.dining_dish_return', art: 'obj.dish_return', x: 26, y: 5, solid: true, label: 'Dish return', text: 'The belt carries one tray through the window and round and back out again. The cup on it has been through enough times to be clean.' },
    // The kitchen
    { id: 'obj.dining_grill', art: 'obj.stove', x: 3, y: 1, solid: true, light: 0.4, label: 'The flat-top', text: 'Scraped to a mirror. Forty years of seasoning along the back edge, where the scraper doesn\'t reach.' },
    { id: 'obj.dining_walk_in', art: 'obj.fridge', x: 9, y: 1, solid: true, label: 'The walk-in', text: 'Eggs, butter, a case of scrapple. Every shelf is dated in grease pencil, and every date is this week.' },
  ],
  scenery: [
    // the line: trays, steam tables, the drinks; then the gap you walk round to get behind it
    { art: 'obj.tray_stack', x: 1, y: 6, solid: true }, { art: 'obj.tray_stack', x: 2, y: 6, solid: true },
    ...[3, 4, 6, 7, 8, 11, 12, 13].map((x) => ({ art: 'obj.steam_table', x, y: 6, solid: true, anim: 500 + x * 40 })),
    { art: 'obj.soda_fountain', x: 10, y: 6, solid: true, light: 0.4 }, { art: 'obj.steam_table', x: 15, y: 6, solid: true, anim: 700 },
    { art: 'obj.steam_table', x: 17, y: 6, solid: true, anim: 620 }, { art: 'obj.tray_stack', x: 18, y: 6, solid: true },
    // long tables to the west, round ones in the middle, booths under the east windows
    ...[9, 11, 13].flatMap((y) => [2, 4, 6, 8].map((x) => ({ art: 'obj.long_table', x, y, w: 2, solid: true }))),
    ...[[18, 9], [22, 9], [26, 9], [20, 12], [24, 12], [28, 12]].map(([x, y]) => ({ art: 'obj.cafe_table', x, y, solid: true })),
    ...[[17, 9], [23, 9], [27, 9], [21, 12], [25, 12]].map(([x, y]) => ({ art: 'obj.chair', x, y })),
    ...[19, 22, 25, 28].map((x) => ({ art: 'obj.booth', x, y: 16, solid: true })),
    { art: 'obj.plant', x: 1, y: 16 }, { art: 'obj.plant', x: 30, y: 7 }, { art: 'obj.bin', x: 25, y: 5 }, { art: 'obj.tray_stack', x: 28, y: 5, solid: true }, { art: 'obj.recycle', x: 11, y: 16 },
    // the kitchen and the dish room
    { art: 'obj.stove', x: 2, y: 1, solid: true }, { art: 'obj.stove', x: 4, y: 1, solid: true }, { art: 'obj.fridge', x: 10, y: 1, solid: true },
    { art: 'obj.kitchen_sink', x: 13, y: 1, solid: true }, { art: 'obj.kitchen_sink', x: 14, y: 1, solid: true },
    { art: 'obj.table', x: 6, y: 3, solid: true }, { art: 'obj.table', x: 7, y: 3, solid: true }, { art: 'obj.table', x: 14, y: 3, solid: true },
    { art: 'obj.crate', x: 18, y: 1, solid: true }, { art: 'obj.boxes', x: 19, y: 1 }, { art: 'obj.boxes', x: 17, y: 3 },
    { art: 'obj.kitchen_sink', x: 25, y: 1, solid: true }, { art: 'obj.tray_stack', x: 27, y: 1, solid: true }, { art: 'obj.tray_stack', x: 28, y: 1, solid: true }, { art: 'obj.crate', x: 30, y: 3, solid: true },
  ],
});

// ---- The Robotics and Autonomy Lab: where the UMD Mars rover lives (Trevor: it belongs in the world, not his gear) ----
// Rebuilt to the room standard (hub #113): benches and the tool wall along the north wall, the gravel test pad in the
// middle of the bay with the rover on it under two work lamps (the landmark, straight ahead of the door), the charging
// docks on the west wall, a second rig to the east, the office in the north-east corner and the store room under it.
// The grad student asleep at a bench is crowds.js's hint (6, 13).
// Secret: the rover team's drawer holds a pair of welding goggles (one per save). The rover has its own frame,
// obj.mars_rover (tools/art/gen_props.py); obj.battlebot stays Trevor's, in 631.
const LAB_TOOLS = 'Every tool has its outline painted on the pegboard behind it. One outline is empty, with a sticky note in the middle: ASK THE GUY ASLEEP.';
export const roboticsLab = makeMap({
  id: 'robotics_lab', name: 'Robotics and Autonomy Lab', standard: true,
  layout: [
    '##############################',   // 0  the tool wall, the whiteboard
    '#eeeeeeeeeeeeeeeeeeee#.......#',   // 1  benches | the office
    '#eeeeeeeeeeeeeeeeeeee#.......#',   // 2
    '#eeeeeeeeeeeeeeeeeeee#.......#',   // 3
    '#eeeeeeeeeeeeeeeeeeee#.......#',   // 4
    '#eeeeeeeeeeeeeeeeeeee###.#####',   // 5  office door
    '#eeeeeeyyyyyyyyyeeeeeeeeeeeee#',   // 6  the test pad
    '#eeeeeeyyyyyyyyyeeeeeeeeeeeee#',   // 7
    '#eeeeeeyyyyyyyyyeeeeeeeeeeeee#',   // 8
    '#eeeeeeyyyyyyyyyeeeeeeeeeeeee#',   // 9
    '#eeeeeeyyyyyyyyyeeeeeeeeeeeee#',   // 10
    '#eeeeeeeeeeeeeeeeeeee####.####',   // 11 store room door
    '#eeeeeeeeeeeeeeeeeeee#mmmmmmm#',   // 12 bay | the store room
    '#eeeeeeeeeeeeeeeeeeee#mmmmmmm#',   // 13
    '#eeeeeeeeeeeeeeeeeeee#mmmmmmm#',   // 14
    '#eeeeeeeeeeeeeeeeeeee#mmmmmmm#',   // 15
    '###########ee#################',   // 16 the doors
  ],
  spawns: [[11, 15]],
  enemies: [['enemy.rotling', 18, 13]],
  objects: [
    { id: 'obj.robotics_out', x: 11, y: 16, w: 2, action: 'exit', to: 'campus_quad', pair: 'obj.quad_robotics', art: 'obj.door', label: 'Out to the quad', text: 'Back out to the quad.', floor: true, stepOn: true },
    { id: 'door.lab_office', art: 'door.wall', x: 24, y: 5, label: 'Office door', door: true },
    { id: 'door.lab_store', art: 'door.wall', x: 25, y: 11, label: 'Store room', door: true },
    // The pad and the rover (the landmark)
    { id: 'obj.mars_rover', art: 'obj.mars_rover', x: 11, y: 8, landmark: true, light: 0.8, solid: true, label: 'The Mars rover', text: 'The UMD rover team\'s machine, on the test pad in the middle of the bay. A laminated tag on the frame: FLIGHT SPARE, DO NOT CANNIBALIZE. It has been cannibalized a little.' },
    { id: 'obj.lab_pad', art: 'obj.cone', x: 7, y: 10, label: 'The test pad', text: 'Four tons of gravel raked into a little Mars, with cones at the corners. Someone has raked a smiley face into the far end and then, more carefully, raked most of it out.' },
    // Along the north wall
    ...[1, 15].map((x, i) => ({ id: `obj.lab_tools_${i + 1}`, art: 'obj.tool_wall', x, y: 0, label: 'Tool wall', text: LAB_TOOLS })),
    { id: 'obj.rover_drawer', art: 'obj.workbench', x: 3, y: 1, solid: true, label: 'Drawer marked ROVER TEAM', grant: 'item.welding_goggles',
      text: 'A steel drawer under the bench, ROVER TEAM ONLY on masking tape. Inside, welding goggles with more tape on the strap: RETURN TO BAY 3. This is bay 3. You borrow them anyway.',
      doneText: 'The empty drawer, and the tape: RETURN TO BAY 3.' },
    { id: 'obj.robotics_lab_parts_bins_3_6', art: 'obj.parts_bins', x: 5, y: 1, solid: true, label: 'Parts bin', loot: 'parts', text: 'Little drawers, each labeled in label-maker tape: M3 SCREWS, ENCODERS, MOTORS (DEAD), MOTORS (PROBABLY).' },
    { id: 'obj.rover_whiteboard', art: 'obj.whiteboard', x: 10, y: 0, label: 'Whiteboard', text: 'Wheel torque numbers in three colors of marker. DEMO DAY, with the date crossed out and moved four times. In the corner, a stick figure holding a wrench, labeled TREVOR. Someone gave it very good hair.' },
    { id: 'obj.lab_arm', art: 'obj.robot_arm', x: 12, y: 1, solid: true, label: 'Bench arm', text: 'It picks a bolt out of one cup and sets it in the other. When the first cup is empty it starts back. The log taped beside it is on page nine.' },
    // West wall, the east rig, the office and the store room
    { id: 'obj.lab_dock', art: 'obj.bot_dock', x: 1, y: 7, solid: true, light: 0.4, label: 'Charging dock', text: 'A delivery bot nosed into its dock. The display says 100%. Under it, in marker: IT SAID THAT YESTERDAY TOO. DO NOT UNPLUG.' },
    { id: 'obj.lab_couch', art: 'obj.couch', x: 27, y: 4, solid: true, label: 'The office couch', text: 'A pillow, a blanket folded square, and a toothbrush in a mug on the armrest. A sign-up sheet for the couch is taped to the wall. It is full through May.' },
    { id: 'obj.lab_wheels', art: 'obj.wheel_rack', x: 26, y: 12, solid: true, label: 'Spare wheels', text: 'Five rover wheels and a gap. In the gap, a sticky note: BORROWED, WILL PUT BACK.' },
  ],
  scenery: [
    { art: 'obj.workbench', x: 4, y: 1, solid: true }, { art: 'obj.oscilloscope', x: 6, y: 1, solid: true, light: 0.3 }, { art: 'obj.solder', x: 7, y: 1, solid: true },
    { art: 'obj.workbench', x: 13, y: 1, solid: true }, { art: 'obj.workbench', x: 14, y: 1, solid: true }, { art: 'obj.drill_press', x: 17, y: 1, solid: true }, { art: 'obj.parts_bins', x: 19, y: 1, solid: true },
    // the pad: cones at the other corners, two lamps, a toolbox and the tether
    { art: 'obj.cone', x: 7, y: 6 }, { art: 'obj.cone', x: 15, y: 6 }, { art: 'obj.cone', x: 15, y: 10 },
    { art: 'obj.worklamp', x: 8, y: 6, light: 0.6 }, { art: 'obj.worklamp', x: 14, y: 10, light: 0.6 }, { art: 'obj.toolbox', x: 9, y: 9 }, { art: 'obj.cables', x: 13, y: 8 },
    // the west wall and the bench the grad student sleeps at
    { art: 'obj.bot_dock', x: 1, y: 9, solid: true, anim: 900 }, { art: 'obj.parts_bins', x: 1, y: 12, solid: true }, { art: 'obj.parts_bins', x: 1, y: 13, solid: true },
    { art: 'obj.workbench', x: 4, y: 12, solid: true }, { art: 'obj.workbench', x: 5, y: 12, solid: true }, { art: 'obj.chair', x: 4, y: 13 },
    { art: 'obj.crate', x: 2, y: 15, solid: true }, { art: 'obj.boxes', x: 3, y: 15 }, { art: 'obj.bin', x: 9, y: 15 }, { art: 'obj.recycle', x: 14, y: 15 }, { art: 'obj.extinguisher', x: 19, y: 15 },
    // the east rig
    { art: 'obj.table', x: 20, y: 8, solid: true }, { art: 'obj.table', x: 21, y: 8, solid: true }, { art: 'obj.chair', x: 20, y: 9 },
    { art: 'obj.robot_arm', x: 25, y: 8, solid: true, anim: 700 }, { art: 'obj.cone', x: 24, y: 9 }, { art: 'obj.cone', x: 26, y: 9 }, { art: 'obj.cables', x: 27, y: 7 },
    // the office
    { art: 'obj.table', x: 22, y: 1, solid: true }, { art: 'obj.terminal_lit', x: 23, y: 1, solid: true, light: 0.35, anim: 640 }, { art: 'obj.chair', x: 23, y: 2 },
    { art: 'obj.coffee', x: 26, y: 1, light: 0.3 }, { art: 'obj.bookshelf', x: 28, y: 1, solid: true }, { art: 'obj.plant', x: 22, y: 4 },
    // the store room
    { art: 'obj.crate', x: 22, y: 12, solid: true }, { art: 'obj.crate', x: 23, y: 12, solid: true }, { art: 'obj.wheel_rack', x: 27, y: 12, solid: true },
    { art: 'obj.shelf_boxes', x: 22, y: 15, solid: true }, { art: 'obj.shelf_boxes', x: 23, y: 15, solid: true }, { art: 'obj.boxes', x: 28, y: 15 }, { art: 'obj.boxes', x: 27, y: 15 },
  ],
});

// ---- The lecture auditorium (off the quad): a stage, a projector still running, and the Autograder ----
// Rebuilt to the room standard (hub #113). You come in at the back, by the projector on its cart (the landmark): its
// beam runs up the hall to the screen over the stage. The back rows of seats are still bolted down, raked, facing the
// stage; the front twelve rows have been unbolted and stacked along the side walls, which leaves the floor between
// the seats and the stage clear, 32 tiles by 15 (AUD_ARENA; the audit's boss arena is 30x16). That floor is where the
// Autograder waits. Nothing solid goes on it: floor decals (bolt holes, chalk row marks, drag scuffs, papers, a few
// seat cushions) and dropped problem sets only.
// Secret: the projector's clicker steps back through the last lecture, slide by slide.
// The way out is in the south wall, at the east end: the quad's door to it faces south (act1_more.js, above).
export const AUD_ARENA = { x: 2, y: 3, w: 32, h: 15 };
const AUD_W = 36, audRow = (ch) => `#${ch.repeat(AUD_W - 2)}#`;
const AUD_SEAT_X = [3, 5, 7, 9, 11, 13, 21, 23, 25, 27, 29, 31], AUD_SEAT_Y = [19, 21, 23];
const AUD_ROWS_OUT = [4, 6, 8, 10, 12, 14, 16];   // where the rows that came out stood
export const auditorium = makeMap({
  id: 'auditorium', name: 'The lecture auditorium', standard: true,
  layout: [
    '#'.repeat(AUD_W),                                  // 0  the boards
    audRow('.'), audRow('.'),                            // 1-2 the stage
    ...Array.from({ length: 15 }, () => audRow('e')),    // 3-17 the cleared floor
    ...Array.from({ length: 8 }, () => audRow('c')),     // 18-25 the seats that are left, and the cross-aisle at the back
    `${'#'.repeat(32)}c###`,                             // 26 the door, at the east end
  ],
  spawns: [[32, 25]],
  enemies: [['enemy.rotling', 9, 14], ['boss.chb_autograder', 17, 6]],   // same order as before (saves key kills by index)
  decals: [
    ...AUD_ROWS_OUT.flatMap((y) => AUD_SEAT_X.flatMap((x) => [['dec.bolt_holes', x, y], ['dec.bolt_holes', x + 1, y]])),
    // Flat dressing on the cleared floor (all decals, nothing to walk round): a chalk mark and a letter at the end of each
    // row that came out, drag marks up the middle aisle where the seats went to the walls, papers, a few cushions.
    ...AUD_ROWS_OUT.map((y) => ['dec.chalk_row', 2, y]),
    ...[[16, 5], [19, 9], [16, 13], [18, 16], [33, 9], [33, 13]].map(([x, y]) => ['dec.scuff', x, y]),
    ...[[18, 4], [15, 8], [20, 11], [17, 14], [19, 17], [3, 11], [32, 7]].map(([x, y]) => ['dec.papers', x, y]),
    ...[[20, 6], [15, 12], [18, 15]].map(([x, y]) => ['dec.cushion', x, y]),
  ],
  objects: [
    { id: 'obj.aud_out', x: 32, y: 26, action: 'exit', to: 'campus_quad', pair: 'obj.quad_auditorium', art: 'obj.door', label: 'Out to the quad', text: 'Back out to the quad.' },
    // The back of the hall: the projector (the landmark)
    { id: 'obj.aud_projector', art: 'obj.projector', x: 17, y: 24, landmark: true, light: 0.8, solid: true, label: 'The projector', action: 'pages', pages: [
      'Still running. Slide 41 of 41: QUESTIONS? The clicker is on the lectern. You press back.',
      'Slide 40: GRADING IS NOW FULLY AUTOMATED. A cartoon checkmark with a face, waving. You press back.',
      'Slide 39: OFFICE HOURS. The times have been deleted and replaced with one word, NOW, in a font nobody chose.',
      'Slide 1. The course title has rotted into a row of empty boxes. Under it, small: RECORDED 2079. PLAYS AT 19:01 DAILY.',
    ] },
    { id: 'obj.aud_backpack', art: 'obj.backpack', x: 9, y: 20, label: 'A backpack', text: 'Left under a seat. A laptop charger, a pencil case zipped shut, and a syllabus with the grading section torn out.' },
    // The stage
    { id: 'obj.aud_screen', art: 'obj.aud_screen', x: 17, y: 1, solid: true, light: 0.9, label: 'The screen', text: 'Slide 41, twelve feet wide: QUESTIONS? The cursor has been parked on the question mark for nineteen years.' },
    { id: 'obj.aud_lectern', art: 'obj.lectern', x: 12, y: 2, solid: true, label: 'The lectern', text: 'A clicker, a water glass dried down to a ring, and notes open at the last page. The last line is underlined twice: ANY QUESTIONS.' },
    { id: 'obj.aud_bluebooks', art: 'obj.bluebooks', x: 23, y: 2, solid: true, label: 'Exam booklets', text: 'A cart of blue books, every one graded. The same score on every cover, in the same red, to two decimal places.' },
    // The floor
    { id: 'obj.aud_stack', art: 'obj.seat_stack', x: 1, y: 10, solid: true, label: 'Stacked seats', text: 'The front twelve rows, unbolted and stacked along the wall in order of row letter. The bolts are in a paper cup. Somebody counted them and wrote the count on the cup.' },
    { id: 'obj.aud_paper', art: 'obj.graded_paper', x: 20, y: 9, label: 'A problem set', text: 'Problem 1 is marked wrong. So is the name at the top.' },
  ],
  scenery: [
    // the stage: curtains, speakers, the boards on the back wall, the demo table
    ...[1, 2, 33, 34].map((x) => ({ art: 'obj.curtain', x, y: 1, solid: true })), { art: 'obj.pa_speaker', x: 5, y: 1, solid: true }, { art: 'obj.pa_speaker', x: 30, y: 1, solid: true },
    ...[8, 10, 24, 26].map((x) => ({ art: 'obj.chalkboard', x, y: 0 })), { art: 'obj.table', x: 22, y: 2, solid: true },
    // the seats that came out, against the side walls (outside the arena)
    ...[4, 6, 8, 12, 14, 16].map((y) => ({ art: 'obj.seat_stack', x: 1, y, solid: true })), ...[4, 6, 8, 10, 12, 14, 16].map((y) => ({ art: 'obj.seat_stack', x: 34, y, solid: true })),
    ...[[7, 6], [27, 11], [13, 15], [30, 5]].map(([x, y]) => ({ art: 'obj.graded_paper', x, y })),
    // the rows that are left, two seats to a piece; one in three has a seat left down
    ...AUD_SEAT_Y.flatMap((y, r) => AUD_SEAT_X.map((x, i) => ({ art: (i + r) % 3 === 0 ? 'obj.aud_seats_b' : 'obj.aud_seats', x, y, w: 2, solid: true }))),
    ...[[2, 19], [2, 23], [33, 19], [33, 23]].map(([x, y]) => ({ art: 'obj.aisle_light', x, y, light: 0.3 })),
    ...[[2, 21], [33, 21], [15, 19], [20, 19], [15, 21], [20, 21], [15, 23], [20, 23]].map(([x, y]) => ({ art: 'obj.aisle_light', x, y })),
    { art: 'obj.backpack', x: 24, y: 22 }, { art: 'obj.backpack', x: 6, y: 22 },
    // the back wall
    ...[5, 9, 24, 27].map((x) => ({ art: 'obj.bench', x, y: 25 })), { art: 'obj.bin', x: 14, y: 25 }, { art: 'obj.recycle', x: 13, y: 25 },
    { art: 'obj.extinguisher', x: 34, y: 24 }, { art: 'obj.exit_sign', x: 30, y: 26, light: 0.5 },
  ],
});
