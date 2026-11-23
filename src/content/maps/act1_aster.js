// More of ASTER (10-scope.md stretch; Trevor: "this game must be much larger scale"): three neighbors' apartments
// on the sixth floor, the fifth-floor landing, and the basement laundry. Doors 632 and 634 stay shut on purpose:
// their texts read like story hooks, which are the lore gate's to open. Each neighbor stays a small mystery.
// Spanish: src/i18n/es-aster.js.
//
// The three flats next to 631 are rebuilt to the room standard (hub #113; tools/level/rooms.mjs, `standard: true`):
// 631's scale (15 tall, so they draw at the same zoom as 631), a real floor plan each (kitchen, bath, bedroom, living
// room, and no two the same shape), a landmark in view from the door, and props of their own (tools/art/gen_props.py,
// the "ASTER's sixth floor, the neighbours" block; each new drawing is used only in its own flat).
// The fifth floor and the laundry room are rebuilt to it too (third slice): 15 tall like the flats, a landmark each.
import { makeMap } from './build.js';

// 637 opens off the hall's north side, so its door is in its south wall; 636 and 638 open off the south side, so
// theirs are in the north wall: you come out facing the way you went in (tests/run.js checks every paired door).
const out = (id, x, y) => ({ id: `obj.${id}_out`, x, y, w: 2, action: 'exit', to: 'aster_hall', pair: `obj.door_${id.slice(4)}`, art: 'obj.door',
  label: 'Back out to the hall', text: 'Back out to the hall.', floor: true, stepOn: true });
const flat = (id, name, layout, spawn, objects, scenery, extra = {}) =>
  makeMap({ id, name, layout, spawns: [spawn], objects, scenery, propScale: 1.25, wear: 'lived', standard: true, ...extra });

// ---- 637: someone practising scales on a cello, the same exercise for eleven years ----
// Bedroom and bath along the outside wall (windows), the living room across the flat, the kitchen by the front door.
// The block top right is the hall bathroom, behind a wall they've covered in egg cartons; the cello sits against it.
// Secret: once you've told them how long it's been (side.apt637_scales), they try a new exercise after all.
export const apt637 = flat('apt_637', 'Apartment 637', [
  '#==####==####==#########',   // 0  outside wall
  '#cccccccc#wwwww#########',   // 1  bedroom | bath | the hall bathroom
  '#cccccccc#wwwww#########',   // 2
  '#cccccccc#wwwww#########',   // 3
  '#cccccccc#wwwww#########',   // 4
  '####.#######.###########',   // 5  bedroom and bath doors; egg cartons on the wall east of them
  '#...............uuuuuu.#',   // 6  living room; the practice rug top right
  '#...............uuuuuu.#',   // 7
  '#...............uuuuuu.#',   // 8
  '#######................#',   // 9  the kitchen's back wall
  '#kkkkkk................#',   // 10 kitchen, open to the living room
  '#kkkkkk................#',   // 11
  '#kkkkkk................#',   // 12
  '#kkkkkk................#',   // 13
  '#########..#############',   // 14 front door
], [9, 13], [
  out('apt_637', 9, 14),
  { id: 'door.apt637_bedroom', art: 'door.wall', x: 4, y: 5, label: 'Bedroom door', door: true },
  { id: 'door.apt637_bath', art: 'door.wall', x: 12, y: 5, label: 'Bathroom door', door: true },
  // The practice corner (the landmark)
  { id: 'obj.apt637_cello', art: 'obj.cello_corner', x: 19, y: 6, landmark: true, light: 0.9, solid: true, label: 'The cello',
    text: 'The cello, on a rubber stop so the spike doesn\'t mark the floorboards. A lamp bent low over the chair. In front of the chair, two pale patches worn into the varnish where their feet go.' },
  { id: 'obj.apt637_sheet', art: 'obj.music_stand', x: 17, y: 7, label: 'Sheet music', text: 'A binder of hand-copied sheet music open on a stand. The same exercise is copied out fresh on every page, with a date in the top corner.' },
  { id: 'obj.apt637_metronome', art: 'obj.metronome', x: 22, y: 6, label: 'Metronome', text: 'A wind-up metronome set to sixty. Someone once drew a pencil line at sixty-six, then rubbed it out.' },
  ...[16, 18, 20].map((x, i) => ({ id: `obj.apt637_foam_${i + 1}`, art: 'obj.egg_foam', x, y: 5, label: 'Egg cartons',
    text: 'Egg cartons glued over the wall they share with the hall bathroom, two hundred at least. Through them you can still hear somebody in there call "One minute!"' })),
  { id: 'npc.apt637_player', x: 16, y: 8, npc: true, age: 'adult', art: 'npc.rotter_2', label: 'The neighbor in 637',
    text: '"Nine o\'clock, scales. The one night I skipped, somebody slid a note under my door asking if I was all right." They play one up and back down. The same note goes wrong both ways.',
    later: [{ if: 'q.apt637_scales.told', text: 'A new page on the stand. It\'s the old exercise, moved up a half step. "Don\'t say anything," they say, and start.' }] },
  // Living room
  { id: 'obj.apt637_binders', art: 'obj.bookshelf', x: 8, y: 6, solid: true, label: 'Binders', text: 'Binders on every shelf, a year on each spine in the same handwriting. Eleven years. The newest binder is the thinnest.' },
  { id: 'obj.apt637_clock', art: 'obj.clock_6f', x: 6, y: 5, label: 'Wall clock', text: 'Set four minutes fast. Under it, a strip of tape that says 9:00.' },
  // Kitchen
  { id: 'obj.apt637_fridge', art: 'obj.fridge', x: 1, y: 10, solid: true, label: 'Their fridge', text: 'One magnet on the door, holding a note on lined paper: NO SCALES TONIGHT. ARE YOU OK? It isn\'t signed.' },
  { id: 'obj.apt637_table', art: 'obj.table', x: 4, y: 12, solid: true, label: 'Kitchen table', text: 'A table for two with one chair at it. The other chair is the one by the cello.' },
  // Bedroom and bath
  { id: 'obj.apt637_bed', art: 'obj.bed', x: 2, y: 2, solid: true, label: 'Their bed', text: 'Made tight. On the nightstand, a cake of rosin and a glass of water with dust on the surface.' },
  { id: 'obj.apt637_case', art: 'obj.cello_case', x: 6, y: 1, label: 'Cello case', text: 'The hard case, stood open against the wall, the red lining worn shiny at the neck. A luggage tag on the handle: PEABODY, and a year scratched off.' },
  { id: 'obj.apt637_humidifier', art: 'obj.dehumidifier', x: 5, y: 1, label: 'Humidifier', text: 'Running day and night, for the cello. The wallpaper behind it has started to curl.' },
  { id: 'obj.apt637_mirror', art: 'obj.trevor_mirror', x: 11, y: 1, label: 'Bathroom mirror', text: 'A tuning fork on the shelf under the mirror, between the toothpaste and the floss.' },
], [
  { art: 'obj.nightstand', x: 1, y: 1, light: 0.5 }, { art: 'obj.manuel_closet', x: 8, y: 1, solid: true }, { art: 'obj.hamper', x: 8, y: 4 },
  { art: 'obj.trevor_shower', x: 14, y: 1, solid: true }, { art: 'obj.plant', x: 10, y: 4 },
  { art: 'obj.plant', x: 1, y: 6 }, { art: 'obj.shoes', x: 8, y: 13 },
  { art: 'obj.couch', x: 16, y: 13, solid: true }, { art: 'obj.couch', x: 17, y: 13, solid: true }, { art: 'obj.table', x: 16, y: 11 }, { art: 'obj.plant', x: 22, y: 13 },
  { art: 'obj.stove', x: 2, y: 10, solid: true }, { art: 'obj.coffee', x: 3, y: 10, light: 0.35 }, { art: 'obj.chair', x: 4, y: 13 },
]);

// ---- 638: the television that is always on ----
// The front door opens into the living room, and the set is the first thing you see. She has been logging what
// changes between the two times it says "things are stable" since spring; the spare room is where the notebooks go.
// The kitchen opens off the living room; bedroom, bath (through the bedroom) and the spare room along the windows.
// Secret: she keeps cold brew by the couch for the long nights, and offers you a can (one per save).
export const apt638 = flat('apt_638', 'Apartment 638', [
  '####..##################',   // 0  front door
  '#...............#kkkkkk#',   // 1  living room | kitchen
  '#...............#kkkkkk#',   // 2
  '#...............kkkkkkk#',   // 3  the kitchen opens off the living room
  '#...............kkkkkkk#',   // 4
  '#...............#kkkkkk#',   // 5
  '#...............#kkkkkk#',   // 6
  '####.##########.########',   // 7  bedroom door, spare room door
  '#cccccccc#wwww#........#',   // 8  bedroom | bath | spare room
  '#cccccccc#wwww#........#',   // 9
  '#cccccccc#wwww#........#',   // 10
  '#cccccccc.wwww#........#',   // 11 bath door, from the bedroom
  '#cccccccc#wwww#........#',   // 12
  '#cccccccc#wwww#........#',   // 13
  '#==####==###==#####==###',   // 14 outside wall
], [4, 1], [
  out('apt_638', 4, 0),
  { id: 'door.apt638_bedroom', art: 'door.wall', x: 4, y: 7, label: 'Bedroom door', door: true },
  { id: 'door.apt638_spare', art: 'door.wall', x: 15, y: 7, label: 'Spare room door', door: true },
  { id: 'door.apt638_bath', art: 'door.side', x: 9, y: 11, label: 'Bathroom door', door: true },
  // The set (the landmark) and her end of the room
  { id: 'obj.apt638_tv', art: 'obj.tv_continuity', x: 11, y: 1, landmark: true, light: 1.0, solid: true, label: 'The television', text: 'An anchor in front of a flag that doesn\'t move. "Citizens, things are stable." A pause, long enough to change the channel. "Citizens, things are stable."' },
  { id: 'obj.apt638_coffee_table', art: 'obj.table', x: 11, y: 3, label: 'Coffee table', text: 'Two pens, both blue, and a ruler. The ruler is for underlining.' },
  { id: 'obj.apt638_couch', art: 'obj.couch_back', x: 11, y: 5, solid: true, label: 'The couch', text: 'Turned square to the set. A pillow at one end, and a dent in the middle cushion the shape of one person.' },
  { id: 'obj.apt638_cans', art: 'obj.cold_brew', x: 13, y: 5, label: 'Cold brew by the couch', grant: 'item.caffeine',
    text: 'A carton of cold brew on the floor by the couch, the empties lined up in rows. She waves at the full cans without looking away from the screen. You take one.',
    doneText: 'Empty cans in rows by the couch. She has started a new row.' },
  { id: 'npc.apt638_viewer', x: 9, y: 5, npc: true, age: 'adult', art: 'npc.rotter_3', label: 'The neighbor in 638', text: '"Shh. Here it comes again." A notebook open on her knee, numbered down the margin to two hundred and six. She writes without looking down.' },
  ...[7, 14].map((x, i) => ({ id: `obj.apt638_grabs_${i + 1}`, art: 'obj.screengrab_wall', x, y: 0, label: 'Screen grabs',
    text: 'Printed stills of the anchor, pinned in rows. Red circles round her eyes and the flag behind her. Red string runs between the ones that match.' })),
  // Kitchen
  { id: 'obj.apt638_fridge', art: 'obj.fridge', x: 22, y: 1, solid: true, label: 'Her fridge', text: 'Cold brew, three rows deep. At the back, a jar of mustard with a date on the lid from before spring.' },
  { id: 'obj.apt638_table', art: 'obj.table', x: 19, y: 5, solid: true, label: 'Kitchen table', text: 'Transcripts of the broadcast, typed out word for word, two to a page, held down with a stapler. She has highlighted the commas.' },
  // Bedroom, bath, the spare room
  { id: 'obj.apt638_bed', art: 'obj.bed', x: 2, y: 9, solid: true, label: 'Her bed', text: 'Made with hospital corners. A film of dust on the blanket, unbroken.' },
  { id: 'obj.apt638_mirror', art: 'obj.mm_mirror', x: 11, y: 8, label: 'Bathroom mirror', text: 'A sticky note on the glass in her handwriting: WATCH THE EYES. The corners have curled.' },
  { id: 'obj.apt638_archive', art: 'obj.notebooks', x: 17, y: 8, solid: true, label: 'Notebooks', text: 'Composition books, all the same make, numbered on the spine in marker, 1 to 38. Every page inside is ruled into two columns, FIRST TIME and SECOND TIME.' },
  { id: 'obj.apt638_blanks', art: 'obj.boxes', x: 22, y: 13, label: 'Blank notebooks', text: 'Two cartons of blank composition books, bought in bulk. One carton is already half gone.' },
], [
  { art: 'obj.shoes', x: 1, y: 1 }, { art: 'obj.plant', x: 1, y: 6 }, { art: 'obj.nightstand', x: 7, y: 5, light: 0.4 },
  { art: 'obj.stove', x: 21, y: 1, solid: true }, { art: 'obj.chair', x: 19, y: 6 }, { art: 'obj.recycle', x: 22, y: 6 }, { art: 'obj.cold_brew', x: 17, y: 6 },
  { art: 'obj.nightstand', x: 1, y: 8, light: 0.5 }, { art: 'obj.manuel_closet', x: 8, y: 8, solid: true }, { art: 'obj.hamper', x: 8, y: 13 },
  { art: 'obj.mm_shower', x: 13, y: 8, solid: true },
  { art: 'obj.notebooks', x: 19, y: 8, solid: true }, { art: 'obj.notebooks', x: 21, y: 8, solid: true },
  { art: 'obj.notebooks', x: 17, y: 11, solid: true }, { art: 'obj.notebooks', x: 19, y: 11, solid: true }, { art: 'obj.notebooks', x: 21, y: 11, solid: true },
  { art: 'obj.worklamp', x: 16, y: 13, light: 0.4 },
]);

// ---- 636: half moved out; deliveries for the previous tenant, and the one before ----
// Whoever lives here is mid-move and out: the kitchen packed, the couch gone (its outline is still in the dust), the
// boxes by the door that were never theirs left for whoever comes next. Kitchen west, the living room under the door,
// bedroom, bath and a walk-in closet along the windows. Secret: one of the boxes was misdelivered, and it's 631's
// (one per save). The delivery boxes keep the ids they had before the rebuild, so saves that searched them still know.
const parcel = (n, x, y) => ({ id: `obj.apt_636_boxes_${n}`, art: 'obj.parcel', x, y, label: 'A delivery box', loot: 'parts',
  text: 'A delivery box addressed to a tenant from two leases ago. The tape has gone yellow and lets go as soon as you touch it.' });
export const apt636 = flat('apt_636', 'Apartment 636', [
  '##################..####',   // 0  front door
  '#kkkkkk#...............#',   // 1  kitchen | living room
  '#kkkkkk#...............#',   // 2
  '#kkkkkkk...............#',   // 3  the kitchen opens off the living room
  '#kkkkkkk...............#',   // 4
  '#kkkkkk#...............#',   // 5
  '#kkkkkk#...............#',   // 6
  '#########.#####.####.###',   // 7  bedroom, bath, closet doors
  '#ccccccccccc#wwww#.....#',   // 8  bedroom | bath | walk-in closet
  '#ccccccccccc#wwww#.....#',   // 9
  '#ccccccccccc#wwww#.....#',   // 10
  '#ccccccccccc#wwww#######',   // 11
  '#ccccccccccc#wwww#######',   // 12
  '#ccccccccccc#wwww#######',   // 13
  '#==######==##==#########',   // 14 outside wall
], [18, 1], [
  out('apt_636', 18, 0),
  { id: 'door.apt636_bedroom', art: 'door.wall', x: 9, y: 7, label: 'Bedroom door', door: true },
  { id: 'door.apt636_bath', art: 'door.wall', x: 15, y: 7, label: 'Bathroom door', door: true },
  { id: 'door.apt636_closet', art: 'door.wall', x: 20, y: 7, label: 'Closet door', door: true },
  // By the door: the hand truck (the landmark) and the boxes that were never theirs
  { id: 'obj.apt636_hand_truck', art: 'obj.hand_truck', x: 15, y: 3, landmark: true, light: 0.8, solid: true, label: 'Hand truck',
    text: 'Three taped boxes strapped to a hand truck: KITCHEN, BOOKS, KITCHEN 2. A lamp rides on top with its shade off, still plugged in, the cord run across the floor to the wall.' },
  parcel('2_2', 20, 1), parcel('3_2', 21, 1), parcel('4_2', 22, 1), parcel('2_3', 21, 2), parcel('3_3', 22, 2),
  { id: 'obj.apt636_parcel', art: 'obj.parcel', x: 22, y: 3, label: 'A box addressed to 631', grant: 'item.wool_socks',
    text: 'This one is addressed to 631. It came to the wrong door months ago and got buried under the others. Inside: wool socks, the thick kind. One of you ordered these. Nobody says who.',
    doneText: 'The empty box. ASTER 631 on the label, and a delivery date from last spring.' },
  { id: 'obj.apt636_plant', art: 'obj.plant', x: 17, y: 1, label: 'Spider plant', text: 'A spider plant with a sticky note on the pot: FREE. PLEASE. It has put out three new runners since the note went on.' },
  // The rest of the living room
  { id: 'obj.apt636_list', art: 'obj.move_list', x: 11, y: 0, label: 'A list on the wall', text: 'Two columns, TAKE and LEAVE. Most of TAKE is crossed off. At the bottom of LEAVE, underlined twice: THE BOXES BY THE DOOR. NOT MINE.' },
  { id: 'obj.apt636_chair', art: 'obj.chair', x: 11, y: 4, label: 'One chair', text: 'One kitchen chair in the middle of the room, facing a clean rectangle on the floor where the couch used to be.' },
  { id: 'obj.apt636_givebox', art: 'obj.boxes', x: 8, y: 6, label: 'A moving box', text: 'Taped shut and labeled GIVE AWAY? The question mark has been gone over until the marker went through the cardboard.' },
  // Kitchen
  { id: 'obj.apt636_fridge', art: 'obj.fridge_open', x: 1, y: 1, light: 0.6, solid: true, label: 'The fridge', text: 'Emptied and propped open with a roll of tape, still running. The light is on inside, and cold air spills out over your feet.' },
  { id: 'obj.apt636_stove', art: 'obj.stove', x: 3, y: 1, solid: true, label: 'The stove', text: 'Burners wrapped in foil and the knobs taken off, for the deposit. The knobs are in a sandwich bag taped to the oven door.' },
  { id: 'obj.apt636_lease', art: 'obj.lease_counter', x: 5, y: 1, label: 'A lease on the counter', text: 'A lease on the counter. Three tenants\' names, each crossed out in the next one\'s ink. The fourth line is blank. The landlord\'s stamp is already on it.' },
  // Bedroom, bath, closet
  { id: 'obj.apt636_mattress', art: 'obj.mattress_up', x: 1, y: 8, solid: true, label: 'Mattress', text: 'Stood on its end against the wall and roped in two places. The bed frame it came off is nowhere in the flat.' },
  { id: 'obj.apt636_toolbox', art: 'obj.toolbox', x: 6, y: 11, label: 'An open toolbox', text: 'The Allen keys from the bed frame, laid out in a row by size. One size is missing.' },
  { id: 'obj.apt636_shower', art: 'obj.trevor_shower', x: 16, y: 8, solid: true, label: 'Shower', text: 'Scrubbed. A ring of rust on the ledge where a shampoo bottle stood for years.' },
  { id: 'obj.apt636_mirror', art: 'obj.trevor_mirror', x: 14, y: 8, label: 'Bathroom mirror', text: 'One toothbrush, left in the cup by the tap.' },
  { id: 'obj.apt636_wardrobe', art: 'obj.manuel_closet', x: 19, y: 8, solid: true, label: 'Wardrobe', text: 'Doors open. Nothing in it but wire hangers, all pushed to one end.' },
], [
  { art: 'obj.boxes', x: 9, y: 6 }, { art: 'obj.crate', x: 2, y: 6, solid: true }, { art: 'obj.boxes', x: 6, y: 6 },
  { art: 'obj.boxes', x: 11, y: 13 }, { art: 'obj.worklamp', x: 11, y: 8, light: 0.4 }, { art: 'obj.boxes', x: 22, y: 8 },
], {
  // Where the couch stood, and the dresser in the bedroom: clean outlines in the dust.
  decals: [['dec.outline_l', 11, 6], ['dec.outline_r', 12, 6], ['dec.outline_l', 4, 9], ['dec.outline_r', 5, 9]],
});

// ---- The fifth floor: the same hallway as yours, one floor down, a little wrong ----
// Rebuilt to the room standard (hub #113). The stairs are a landing at the west end (the one stack: down to the lobby,
// up to six), with the fire hose cabinet on its wall (the landmark). The hall runs east to a window. Doors both sides;
// 531 is the last on the north side, under 631. Off the south side: the trash room, and a lounge with a window nobody
// sits at. The three plain doors keep the ids the level builder gave them.
// Secret: the fire hose cabinet holds a hard hat left as collateral (one per save).
const DOOR_5F = 'The same door as the ones upstairs, a hundred lower. The peephole goes dark while you stand there and lights up again when you move on.';
const door5 = (id, x, y) => ({ id, art: 'obj.door', x, y, label: 'A fifth-floor door', text: DOOR_5F });
export const aster5f = makeMap({
  id: 'aster_5f', name: 'ASTER, fifth floor', propScale: 1.25, wear: 'lived', standard: true,
  layout: [
    '########################################',   // 0  the hose cabinet
    `#:::::${'#'.repeat(34)}`,                    // 1  the stair landing
    `#:::::${'#'.repeat(34)}`,                    // 2
    `#:::::${'#'.repeat(34)}`,                    // 3
    `#:::::${'#'.repeat(34)}`,                    // 4  north doors
    `#${'c'.repeat(38)}#`,                        // 5  the hall
    `#${'c'.repeat(38)}=`,                        // 6  the window at the east end
    `#${'c'.repeat(38)}#`,                        // 7
    '#############k##########mmmmmm##########',   // 8  south doors; the trash room; the lounge
    '##########kkkkkkk#####mmmmmmmmmm########',   // 9
    '##########kkkkkkk#####mmmmmmmmmm########',   // 10
    '##########kkkkkkk#####mmmmmmmmmm########',   // 11
    '##########kkkkkkk#####mmmmmmmmmm########',   // 12
    '##########kkkkkkk#####mmmmmmmmmm########',   // 13
    '###########################==###########',   // 14 the lounge window
  ],
  spawns: [[2, 3]],
  enemies: [['enemy.rotling', 34, 6]],
  decals: [['dec.chalk', 2, 2], ['dec.stain', 30, 7], ['dec.stain', 14, 11], ['dec.litter_0', 12, 10]],
  objects: [
    { id: 'obj.aster5_stairs', art: 'obj.stairs', x: 1, y: 1, action: 'exit', to: 'aster_lobby', pair: 'obj.lobby_5f', label: 'Stairs (lobby)', text: 'Back down to the lobby.' },
    { id: 'obj.aster5_up', art: 'obj.stairs', x: 3, y: 1, action: 'exit', to: 'aster_hall', pair: 'obj.stairs_6f', label: 'Stairs (sixth floor)', text: 'Up one more. The chalk numbers on the steps start again at 1, in a different hand.' },
    { id: 'door.aster5_trash', art: 'door.wall', x: 13, y: 8, label: 'Trash room', door: true },
    // The landing: the hose cabinet (the landmark)
    { id: 'obj.aster5_hose', art: 'obj.hose_cabinet', x: 5, y: 0, landmark: true, light: 0.8, label: 'Fire hose cabinet', grant: 'item.hardhat',
      text: 'FIRE HOSE, behind a glass door that doesn\'t lock. The hose is gone. On the hook where it hung, a yellow hard hat and a note: BORROWED HOSE FOR THE GARDEN. HAT IS COLLATERAL. 4F.',
      doneText: 'The empty cabinet and the note from 4F. Nobody has brought the hose back.' },
    // North side
    door5('obj.aster_5f_door_11_3', 11, 4), door5('obj.aster_5f_door_19_3', 19, 4), door5('obj.aster_5f_door_27_3', 27, 4),
    { id: 'obj.door_531', art: 'obj.door', x: 36, y: 4, label: '531', text: '531, right under 631. Two sticky notes on the door in the same handwriting. The older one: PLEASE NO FURNITURE AFTER MIDNIGHT. The newer one: WHAT ARE YOU BUILDING UP THERE.' },
    { id: 'obj.aster5_notices', art: 'obj.corkboard', x: 15, y: 4, label: 'Notices',
      text: 'ELEVATOR: SEE NOTICE ON SIX. There is no notice on six. QUIET HOURS 10 TO 7, underlined by three different pens. A sign-up sheet for the roof garden with one name on it: 4F.' },
    // South side
    door5('obj.aster5_door_s1', 6, 8), door5('obj.aster5_door_s2', 19, 8), door5('obj.aster5_door_s3', 35, 8),
    { id: 'obj.aster5_chute', art: 'obj.chute', x: 11, y: 8, label: 'Trash chute', text: 'The same chute as upstairs, one flap lower. Something is on its way down past you. It takes a while.' },
    { id: 'obj.aster5_puzzle', art: 'obj.table', x: 27, y: 11, solid: true, label: 'A jigsaw on the table',
      text: 'A thousand pieces, a lighthouse, nearly done. The last piece lies on the table beside the hole. Nobody on five will be the one to put it in.' },
    { id: 'obj.aster5_window', art: 'obj.window_6f', x: 39, y: 6, light: 0.5, label: 'Window at the end of the hall', text: 'The view from your own hall window, ten feet lower. It is not ten feet better.' },
    // People on five
    { id: 'npc.aster5_neighbor', x: 21, y: 6, npc: true, art: 'npc.rotter_1', label: 'Someone in the fifth-floor hall', age: 'adult', text: '"You\'re upstairs. Six-thirty-one. I know the three of you by your feet." He points at a spot on the ceiling. "Somebody stands right there at two every night, a long time. That\'s your fridge."' },
  ],
  scenery: [
    // doormats (flat), and what people leave outside their doors
    ...[[11, 5], [27, 5], [36, 5], [19, 7], [35, 7]].map(([x, y]) => ({ art: 'obj.doormat', x, y, floor: true, scale: 1 })),
    { art: 'obj.shoes', x: 12, y: 5 }, { art: 'obj.umbrella_stand', x: 28, y: 5 }, { art: 'obj.shoes', x: 34, y: 7 }, { art: 'obj.plant', x: 37, y: 5 }, { art: 'obj.boxes', x: 20, y: 7 },
    { art: 'obj.umbrella_stand', x: 7, y: 7 }, { art: 'obj.plant', x: 38, y: 7 },
    // lights: one of them has been about to go for a year
    { art: 'obj.tube_light', x: 23, y: 4, scale: 1, light: 0.5, anim: 240 }, { art: 'obj.tube_light', x: 31, y: 4, scale: 1, light: 0.4, anim: 4000 }, { art: 'obj.extinguisher', x: 8, y: 4, scale: 1 },
    // the landing
    { art: 'obj.boxes', x: 5, y: 3 }, { art: 'obj.bin', x: 1, y: 4 },
    // the trash room
    { art: 'obj.bin', x: 10, y: 9 }, { art: 'obj.recycle', x: 16, y: 9 }, { art: 'obj.recycle', x: 16, y: 10 }, { art: 'obj.boxes', x: 10, y: 13 }, { art: 'obj.boxes', x: 11, y: 13 }, { art: 'obj.crate', x: 16, y: 13, solid: true },
    // the lounge
    { art: 'obj.couch', x: 24, y: 9, solid: true }, { art: 'obj.plant', x: 22, y: 9 }, { art: 'obj.plant', x: 31, y: 13 }, { art: 'obj.chair', x: 26, y: 11 }, { art: 'obj.chair', x: 28, y: 12 },
    { art: 'obj.bookshelf', x: 31, y: 9, solid: true }, { art: 'obj.vending', x: 22, y: 13, solid: true, light: 0.4 }, { art: 'obj.ottoman', x: 25, y: 10 },
  ],
});

// ---- The basement laundry: machines that work, and one on the end that eats coins and gives back something else ----
// Rebuilt to the room standard (hub #113). You come in from the basement through the west wall. Washers and dryers
// along the north wall, and on the end, set apart, the old machine (the landmark). The folding tables are an island in
// the middle of the room; the supply closet is the north-east corner, the corkboard on its wall.
// Secret: the machine on the end (a searchable container). The person folding hints at it.
export const asterLaundry = makeMap({
  id: 'aster_laundry', name: 'ASTER, the laundry room', propScale: 1.25, wear: 'lived', standard: true,
  layout: [
    '##################',   // 0  the light
    '#wwwwwwwwwwww#kkk#',   // 1  the machines | the supply closet
    '#wwwwwwwwwwww#kkk#',   // 2
    '#wwwwwwwwwwww#kkk#',   // 3
    '#wwwwwwwwwwww##k##',   // 4  closet door; the corkboard
    '#wwwwwwwwwwwwwwww#',   // 5
    '#wwwwwwwwwwwwwwww#',   // 6
    ':::::::::::::::::#',   // 7  the door to the basement, in the west wall
    '#::::::::::::::::#',   // 8
    '#::::::::::::::::#',   // 9
    '#::::::::::::::::#',   // 10 the folding tables
    '#::::::::::::::::#',   // 11
    '#::::::::::::::::#',   // 12
    '#::::::::::::::::#',   // 13
    '##################',   // 14
  ],
  spawns: [[2, 7]],
  decals: [['dec.stain', 10, 2], ['dec.puddle_1', 3, 2], ['dec.drain', 7, 4]],
  objects: [
    { id: 'obj.laundry_out', art: 'obj.door', x: 0, y: 7, action: 'exit', to: 'aster_basement', pair: 'obj.basement_laundry', label: 'Back to the basement', text: 'Back to B-01.', floor: true, stepOn: true },
    { id: 'door.laundry_closet', art: 'door.wall', x: 15, y: 4, label: 'Supply closet', door: true },
    // The machines
    { id: 'obj.laundry_end_machine', art: 'obj.washer_odd', x: 11, y: 1, landmark: true, light: 0.8, solid: true, label: 'The machine on the end', loot: 'lost', text: 'OUT OF ORDER, on a sign in three different hands. It takes your coin anyway, hums for a while, and drops something into the lint tray that isn\'t your coin.' },
    { id: 'obj.laundry_dryers', art: 'obj.dryer', x: 8, y: 1, solid: true, label: 'Dryers', text: 'Two of the four are going. One of them has nothing in it but a single sneaker, which comes round every second and a half.' },
    { id: 'obj.laundry_change', art: 'obj.change_machine', x: 16, y: 8, solid: true, light: 0.4, label: 'Change machine', text: 'It takes a dollar and gives back three quarters. A note taped to the front: WE KNOW.' },
    // The corkboard, the socks, the person folding
    { id: 'obj.laundry_board', art: 'obj.corkboard', x: 16, y: 4, label: 'Laundry room corkboard', text: 'Index cards on cork. LOST: ONE SOCK, GRAY, WOOL. Two cards over, in different ink: FOUND: ONE GRAY SOCK, ASK AT 212. Neither card has moved since spring.' },
    { id: 'obj.laundry_socks', art: 'obj.sock_basket', x: 1, y: 9, label: 'Lost socks', text: 'LOST SOCKS, on a card on a stick. Forty singles, washed and folded. No two match. Somebody checks.' },
    { id: 'npc.laundry_folder', x: 8, y: 11, npc: true, art: 'npc.rotter_2', label: 'Someone folding at 3 a.m.', age: 'adult', text: '"Three a.m. is the only time every machine is free." She shakes out a towel and folds it into a square. "Except the one on the end. Nobody uses the one on the end."' },
  ],
  scenery: [
    ...[1, 2, 3, 4].map((x) => ({ art: 'obj.washer', x, y: 1, solid: true })), ...[6, 7, 9].map((x, i) => ({ art: 'obj.dryer', x, y: 1, solid: true, anim: 380 + 90 * i })),
    { art: 'obj.tube_light', x: 5, y: 0, scale: 1, light: 0.5, anim: 220 },
    // the folding tables, the carts
    { art: 'obj.folding_table', x: 7, y: 10, w: 2, solid: true }, { art: 'obj.folding_table', x: 9, y: 10, w: 2, solid: true, flip: true },
    { art: 'obj.laundry_cart', x: 3, y: 4 }, { art: 'obj.laundry_cart', x: 12, y: 9 }, { art: 'obj.hamper', x: 6, y: 11 }, { art: 'obj.laundry_cart', x: 10, y: 4 },
    // somewhere to wait
    { art: 'obj.bench', x: 3, y: 13 }, { art: 'obj.bench', x: 4, y: 13 }, { art: 'obj.vending', x: 8, y: 13, solid: true, light: 0.4 }, { art: 'obj.plant', x: 16, y: 13 }, { art: 'obj.chair', x: 12, y: 13 }, { art: 'obj.bin', x: 1, y: 13 },
    // the supply closet
    { art: 'obj.shelf_boxes', x: 14, y: 1, solid: true }, { art: 'obj.kitchen_sink', x: 16, y: 1, solid: true }, { art: 'obj.boxes', x: 14, y: 3 },
  ],
});
