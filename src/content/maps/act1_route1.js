// Two shops on College Park's Route 1 strip (hub #28/#29, Trevor's suggestions as ruled on the story board):
// a hardware shop that repairs tools and sells fasteners and adapters from bins, and an independent feed and
// aquarium shop. Both open off the south face of the block east of Route 1 (collegepark.js), the way the diner
// opens off its own. Built with the level builder (docs/design/11-level-builder.md). Atlas section 4: the least
// rotted place in Act 1, so prices on chalkboards, a cash drawer, locks with keys. What they sell is in SHOPS
// (src/content/items.js): the game's ordinary shop menu, no new mechanic. Spanish: src/i18n/es-route1.js.
import { fromGrid } from './builder.js';

// ---- Hollis Hardware: bins at the front, the repair bench and the key machine in the back ----
export const hardware = fromGrid({
  id: 'hardware', name: 'Hollis Hardware', fill: '.', world: { x: 62, y: 54 },
  rows: [
    '######################',
    '#kkkkkkkG#...........#',
    '#kRkkkKkk#..BBBB.BBF.#',
    '#kkkkHkkk#...........#',
    '###=CS==P#..BBBB.BBA.#',
    '#....................#',
    '#....................#',
    '#.............@......#',
    '#....................#',
    '#########XX###########',
  ],
  legend: {
    S: { prop: 'obj.table', id: 'obj.hardware_counter', label: 'The counter', action: 'shop', shop: 'hardware' },
    C: { prop: 'obj.lost_found', id: 'obj.hardware_drawer', tile: '=', label: 'Cash drawer',
      text: 'A wooden cash drawer with brass corners. It opens with a key she wears on a shoelace, and a bell inside rings every time it does.' },
    P: { prop: 'obj.chalkboard', id: 'obj.hardware_chalkboard', tile: '=', label: 'Chalkboard',
      text: 'Prices in chalk, rewritten so often the slate has worn grey.\n\nSCOOP OF FASTENERS $3 · WIRE AND ADAPTERS $4 · CELL, CHARGED $12 · WORK GLOVES $9 · HARD HAT $16 · WORK PANTS $20 · PIPE WRENCH $30\n\nREPAIRS: ASK. KEYS CUT WHILE YOU WAIT.' },
    H: { npc: 'npc.dot_hollis', art: 'npc.hollis', tile: 'k', label: 'Dot Hollis', age: 'adult', role: 'vendor',
      text: '"What did you break?" Dot Hollis already has her hand out, palm up. "Did you bring all the pieces, or only the story?"',
      later: [{ if: 'act1.beat.call', text: '"Did yours ring too?" Dot pats her apron pocket, which holds a tape measure and nothing else. "Did it say who it was?"' }] },
    R: { prop: 'obj.workbench', id: 'obj.hardware_bench', tile: 'k', label: 'Repair bench',
      text: 'A toaster in pieces, laid out in the order it came apart. A vise with its jaws worn bright. A jar of springs labeled MISC, with a smaller jar inside it, also labeled MISC.' },
    K: { prop: 'obj.drill_press', id: 'obj.hardware_key_machine', tile: 'k', label: 'Key machine',
      text: 'A key duplicator with a hand crank. The brass shavings are saved in a coffee can underneath. A note in the same chalk as the prices: FOUND A KEY? THE AIRFIELD KEEPS A JAR.' },
    G: { prop: 'obj.board', id: 'obj.hardware_tags', tile: 'k', label: 'Repair tags',
      text: 'Tools on nails, each with a paper tag in pencil. KESS, B-01: HINGE JIG. RAY: TORQUE WRENCH, READS 4 LOW. A claw hammer has hung here since 2079. Its tag says HOLD.' },
    B: { scenery: 'obj.parts_bins', solid: true },
    F: { prop: 'obj.parts_bins', id: 'obj.hardware_fasteners', label: 'Fastener bins',
      text: 'Steel drawers of screws, bolts, nuts and washers, one of each glued to the front so you can match by eye. A brass scoop hangs from a chain, beside a scale that weighs in ounces.' },
    A: { prop: 'obj.parts_bins', id: 'obj.hardware_adapters', label: 'Adapters',
      text: 'Plug adapters sorted by decade on masking tape. The 2060s drawer is the fullest. A tested one gets a dot of red nail polish, and every one in here has a dot.' },
    '@': { spawn: true },
    X: { exit: 'metro_plaza', id: 'obj.hardware_out', art: 'obj.door', label: 'Out to Route 1', stepOn: true, pair: 'obj.hardware_door', text: 'Back out to the street.' },
  },
}).build();

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
      text: 'Index cards on cork. LOST: GREY CAT, ANSWERS TO NOTHING. CANOE FOR SALE, ONE PADDLE. And in block capitals: HANGAR, SUNDAYS. BRING A CHAIR. LEAVE YOUR PHONE AT THE WINDSOCK.' },
    C: { prop: 'obj.crate', id: 'obj.feed_brooder', label: 'Brooder box', light: 0.5,
      text: 'Six chicks asleep in a pile under a heat lamp. Every few minutes the one on the bottom works its way to the top.' },
    '@': { spawn: true },
    X: { exit: 'metro_plaza', id: 'obj.feed_out', art: 'obj.door', label: 'Out to Route 1', stepOn: true, pair: 'obj.feed_door', text: 'Back out to the street.' },
  },
}).build();
