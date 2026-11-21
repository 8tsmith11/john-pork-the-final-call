// Two shops on College Park's Route 1 strip (hub #28/#29, Trevor's suggestions as ruled on the story board):
// a hardware shop that repairs tools and sells fasteners and adapters from bins, and an independent feed and
// aquarium shop. Both open off the south face of the block east of Route 1 (collegepark.js), the way the diner
// opens off its own. Built with the level builder (docs/design/11-level-builder.md). Atlas section 4: the least
// rotted place in Act 1, so prices on chalkboards, a cash drawer, locks with keys. What they sell is in SHOPS
// (src/content/items.js): the game's ordinary shop menu, no new mechanic. Spanish: src/i18n/es-route1.js.
import { makeMap } from './build.js';
import { fromGrid } from './builder.js';

// ---- Hollis Hardware: aisles at the front, the counter, the workshop and the key machine behind it ----
// Rebuilt to the room standard (hub #113; tools/level/rooms.mjs). The door is in the south wall, as before. Straight
// ahead up the middle aisle is the counter, and behind it, in the workshop, the key machine under its board of blanks
// with a lamp bent over it (the landmark). Shelving runs either side of the aisle, the fastener and adapter bins on
// the right; the north-east corner is paint and garden. You get behind the counter round its east end.
export const hardware = makeMap({
  id: 'hardware', name: 'Hollis Hardware', world: { x: 62, y: 49 }, standard: true,
  layout: [
    '########################',   // 0  the repair tags
    '#kkkkkkkkkkk#pppppppppp#',   // 1  the workshop | paint and garden
    '#kkkkkkkkkkk#pppppppppp#',   // 2
    '#kkkkkkkkkkk#pppppppppp#',   // 3
    '#kkkkkkkkkkk#pppppppppp#',   // 4
    '#kkkkkkkkkkk#..........#',   // 5  the counter, and the way round it; the chalkboard on the end of the wall
    '#......................#',   // 6
    '#......................#',   // 7
    '#......................#',   // 8  shelving | the bins
    '#......................#',   // 9
    '#......................#',   // 10
    '#......................#',   // 11 shelving
    '#......................#',   // 12
    '#......................#',   // 13
    '#########..#####==#==###',   // 14 the door and the front windows
  ],
  spawns: [[10, 13]],
  objects: [
    { id: 'obj.hardware_out', x: 9, y: 14, w: 2, action: 'exit', to: 'metro_plaza', pair: 'obj.hardware_door', art: 'obj.door', label: 'Out to Route 1', text: 'Back out to the street.', floor: true, stepOn: true },
    // The counter
    { id: 'obj.hardware_counter', art: 'obj.shop_counter', x: 5, y: 5, solid: true, label: 'The counter', action: 'shop', shop: 'hardware' },
    { id: 'obj.hardware_drawer', art: 'obj.cash_drawer', x: 3, y: 5, solid: true, label: 'Cash drawer',
      text: 'A wooden cash drawer with brass corners. It opens with a key she wears on a shoelace, and a bell inside rings every time it does.' },
    { id: 'obj.hardware_chalkboard', art: 'obj.chalkboard', x: 12, y: 5, label: 'Chalkboard',
      text: 'Prices in chalk, rewritten so often the slate has worn grey.\n\nSCOOP OF FASTENERS $3 · WIRE AND ADAPTERS $4 · CELL, CHARGED $12 · WORK GLOVES $9 · HARD HAT $16 · WORK PANTS $20 · PIPE WRENCH $30\n\nREPAIRS: ASK. KEYS CUT WHILE YOU WAIT.' },
    { id: 'npc.dot_hollis', x: 5, y: 4, npc: true, art: 'npc.hollis', label: 'Dot Hollis', age: 'adult', role: 'vendor',
      text: '"What did you break?" Dot Hollis already has her hand out, palm up. "Did you bring all the pieces, or only the story?"',
      later: [{ if: 'act1.beat.call', text: '"Did yours ring too?" Dot pats her apron pocket, which holds a tape measure and nothing else. "Did it say who it was?"' }] },
    // The workshop
    { id: 'obj.hardware_key_machine', art: 'obj.key_machine', x: 8, y: 1, landmark: true, light: 0.8, solid: true, label: 'Key machine',
      text: 'A key duplicator with a hand crank. The brass shavings are saved in a coffee can underneath. A note in the same chalk as the prices: FOUND A KEY? THE AIRFIELD KEEPS A JAR.' },
    { id: 'obj.hardware_bench', art: 'obj.workbench', x: 4, y: 1, solid: true, label: 'Repair bench',
      text: 'A toaster in pieces, laid out in the order it came apart. A vise with its jaws worn bright. A jar of springs labeled MISC, with a smaller jar inside it, also labeled MISC.' },
    { id: 'obj.hardware_tags', art: 'obj.repair_tags', x: 2, y: 0, label: 'Repair tags',
      text: 'Tools on nails, each with a paper tag in pencil. KESS, B-01: HINGE JIG. RAY: TORQUE WRENCH, READS 4 LOW. A claw hammer has hung here since 2079. Its tag says HOLD.' },
    // The bins
    { id: 'obj.hardware_fasteners', art: 'obj.parts_bins', x: 13, y: 8, solid: true, label: 'Fastener bins',
      text: 'Steel drawers of screws, bolts, nuts and washers, one of each glued to the front so you can match by eye. A brass scoop hangs from a chain, beside a scale that weighs in ounces.' },
    { id: 'obj.hardware_adapters', art: 'obj.parts_bins', x: 17, y: 8, solid: true, label: 'Adapters',
      text: 'Plug adapters sorted by decade on masking tape. The 2060s drawer is the fullest. A tested one gets a dot of red nail polish, and every one in here has a dot.' },
    // Paint and garden
    { id: 'obj.hardware_mixer', art: 'obj.paint_mixer', x: 16, y: 1, solid: true, light: 0.3, label: 'Paint shaker',
      text: 'A can of porch grey clamped in the shaker, going. The order slip under the clamp is dated March. Dot says the customer will be back, and that it can only help the paint.' },
    { id: 'obj.hardware_wheelbarrow', art: 'obj.wheelbarrow', x: 21, y: 3, solid: true, label: 'Wheelbarrow',
      text: 'A price tag on a string: $40. Under it, a second tag: $40 AND YOU HAVE TO WHEEL IT HOME YOURSELF.' },
  ],
  scenery: [
    // the counter (the gap is at its east end)
    ...[1, 2, 4, 6, 7, 8, 9].map((x) => ({ art: 'obj.shop_counter', x, y: 5, solid: true })),
    // the workshop
    { art: 'obj.workbench', x: 5, y: 1, solid: true }, { art: 'obj.drill_press', x: 6, y: 1, solid: true }, { art: 'obj.worklamp', x: 1, y: 3, light: 0.5 },
    { art: 'obj.toolbox', x: 3, y: 3 }, { art: 'obj.crate', x: 11, y: 1, solid: true }, { art: 'obj.boxes', x: 11, y: 2 },
    // shelving left of the aisle; bins and shelving right of it
    ...[2, 3, 4].map((x) => ({ art: 'obj.shelf_tools', x, y: 8, solid: true })), ...[5, 6, 7].map((x) => ({ art: 'obj.shelf_boxes', x, y: 8, solid: true })),
    ...[14, 15, 18].map((x) => ({ art: 'obj.parts_bins', x, y: 8, solid: true })), ...[19, 20].map((x) => ({ art: 'obj.shelf_boxes', x, y: 8, solid: true })),
    ...[2, 3].map((x) => ({ art: 'obj.shelf_tools', x, y: 11, solid: true })), ...[4, 5, 6].map((x) => ({ art: 'obj.shelf_boxes', x, y: 11, solid: true })),
    ...[13, 14].map((x) => ({ art: 'obj.shelf_boxes', x, y: 11, solid: true })), ...[15, 16].map((x) => ({ art: 'obj.shelf_tools', x, y: 11, solid: true })),
    // paint and garden
    ...[13, 14, 15].map((x) => ({ art: 'obj.shelf_paint', x, y: 1, solid: true })), { art: 'obj.soil_bags', x: 19, y: 1, solid: true }, { art: 'obj.soil_bags', x: 20, y: 1, solid: true },
    { art: 'obj.hose_reel', x: 22, y: 1, solid: true }, { art: 'obj.flowerpot', x: 18, y: 3 }, { art: 'obj.flowerpot', x: 19, y: 3 }, { art: 'obj.plant', x: 22, y: 4 },
    // the front of the shop
    { art: 'obj.ladders', x: 22, y: 13, solid: true }, { art: 'obj.plant', x: 1, y: 13 }, { art: 'obj.bin', x: 12, y: 13 }, { art: 'obj.soil_bags', x: 19, y: 13, solid: true },
  ],
});

// ---- Pardo Feed & Aquarium: a wall of tanks on the left, the stockroom behind the counter ----
export const feedStore = fromGrid({
  id: 'feed_store', name: 'Pardo Feed & Aquarium', fill: '.', world: { x: 62, y: 65 },
  rows: [
    '######################',
    '#QQQEQQQQQ#FFFFkkFFFF#',
    '#......N..#kkkkkkkkkk#',
    '#.QQQWQQ..#FFkkkkkkGk#',
    '#.........####=S=====#',
    '#B...................#',
    '#..........C.........#',
    '#.............@......#',
    '#..................VV#',
    '#########XX###########',
  ],
  legend: {
    S: { prop: 'obj.table', id: 'obj.feed_counter', tile: 'k', label: 'The counter', action: 'shop', shop: 'feed' },
    N: { npc: 'npc.gus_pardo', art: 'npc.feedkeeper', label: 'Gus Pardo', age: 'adult', role: 'vendor',
      text: 'Gus Pardo is up to one elbow in a tank, moving a rock two inches to the left. "Better?" He is asking a catfish. He dries his arm on his flannel. "Feed\'s by the scoop. Don\'t tap the glass."',
      later: [{ if: 'act1.beat.call', text: '"Every phone on Route 1 went off at once." Gus doesn\'t carry one. "The angelfish all went to the back of the tank. They do that for thunder."' }] },
    // A nod to Trevor's shrimp (docs/lore/roommates.md: his room has a shrimp tank). Warm, nothing at his expense.
    E: { prop: 'obj.shrimp_tank', id: 'obj.feed_shrimp', label: 'Shrimp tank',
      text: 'A planted tank of cherry shrimp, red against green moss. An order card is taped to the glass: 631, ASTER. MOSS BALLS ×2, CHERRY SHRIMP ×6. PAID. Under it, in another pen: ASKS ABOUT WATER HARDNESS EVERY TIME. TELL HIM 8 dGH.' },
    W: { prop: 'obj.shrimp_tank', id: 'obj.feed_tanks', label: 'Tanks',
      text: 'Rows of tanks on steel racks, each with a hand-lettered card giving the species and what it eats. The pumps run off a car battery under the bottom shelf. Gus swaps it every night at two.' },
    Q: { scenery: 'obj.shrimp_tank', solid: true },
    F: { scenery: 'obj.feed_sacks', solid: true, tile: 'k' },
    V: { scenery: 'obj.feed_sacks', solid: true },
    G: { prop: 'obj.feed_sacks', id: 'obj.feed_pallet', tile: 'k', label: 'Feed sacks',
      text: 'Fifty-pound sacks of layer pellets and cracked corn on a pallet, BELTSVILLE printed on each in faded green. Somebody up there is still farming.' },
    B: { prop: 'obj.board', id: 'obj.feed_corkboard', label: 'Corkboard',
      text: 'Index cards on cork. LOST: GREY CAT, ANSWERS TO NOTHING. CANOE FOR SALE, ONE PADDLE. And in block capitals: HANGAR, SUNDAYS. BRING A CHAIR. LEAVE YOUR PHONE AT THE DOOR.' },
    C: { prop: 'obj.crate', id: 'obj.feed_brooder', label: 'Brooder box', light: 0.5,
      text: 'Six chicks asleep in a pile under a heat lamp. Every few minutes the one on the bottom works its way to the top.' },
    '@': { spawn: true },
    X: { exit: 'metro_plaza', id: 'obj.feed_out', art: 'obj.door', label: 'Out to Route 1', stepOn: true, pair: 'obj.feed_door', text: 'Back out to the street.' },
  },
}).build();
