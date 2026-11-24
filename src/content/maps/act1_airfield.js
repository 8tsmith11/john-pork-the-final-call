// The airfield (atlas section 4; hub #28/#29 as ruled on the story board): a small grass strip at the east end of
// Route 1 with a hangar that has been open since the first years of flight, and a windsock. The Analogists use the
// hangar as a meeting hall because nothing in it has a chip. Inside the Act 1 pocket: it is reached on foot from
// Lake Artemesia, by a spur of the Paint Branch trail (lake.js, its north edge), and has no other way out. The
// cordon fence runs along its far side. Built with the level builder (docs/design/11-level-builder.md).
// Spanish: src/i18n/es-route1.js.
import { level, fromGrid } from './builder.js';

const W = 60, H = 34;
const hash = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
const creekY = (x) => 28 + Math.round(Math.sin(x / 4.2));                      // Paint Branch, wandering along the south
const TRAIL_X = 29;                                                             // the trail in from the lake (two tiles wide)
const LAMPS = [6, 12, 18, 24, 30, 36, 42, 48, 54].flatMap((x) => [[x, 8], [x, 13]]);   // kerosene lamps along both edges of the strip
// Open ground: the field and the strip, the hangar's yard, the trail, the windsock, a way up to the fence.
const OPEN = [[3, 5, 54, 10], [18, 14, 24, 14], [12, 13, 9, 5], [26, 24, 8, 10], [47, 3, 9, 6], [38, 2, 5, 4]];
const isOpen = (x, y) => OPEN.some(([ox, oy, ow, oh]) => x >= ox && x < ox + ow && y >= oy && y < oy + oh);

const field = level({ id: 'airfield', name: 'The airfield', w: W, h: H, fill: 'g', border: null, outdoor: true, propScale: 1.5,
  world: { x: 84 + 40 - TRAIL_X, y: 17 - H } })   // flush on the lake's north edge, its trail meeting the lake's spur (the lake sits at 84,17; its spur at x 40)
  .edit((g) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) { g[y][x] = 'T'; continue; }   // a wall of trees round the edge
      if (isOpen(x, y)) continue;
      const edge = Math.min(x, y - 1, W - 1 - x, H - 1 - y), p = edge <= 2 ? 0.5 : edge <= 5 ? 0.22 : 0.05;   // woods, thicker at the edges
      if (hash(x, y) < p) g[y][x] = 'T';
    }
    for (let x = 1; x < W - 1; x++) { const y = creekY(x); g[y][x] = '~'; g[y + 1][x] = '~'; }
  })
  .rect(1, 1, W - 2, 1, '=')                                                     // the cordon fence along the far side
  .rect(6, 10, 48, 2, 'y')                                                       // the strip: grass, worn to gravel down the middle
  .rect(22, 16, 16, 8, '#').rect(22, 16, 1, 1, 'g').rect(37, 16, 1, 1, 'g')      // the hangar (corners stepped back)
  .rect(23, 24, 14, 2, 'p')                                                      // its apron, old concrete
  .edit((g) => {
    for (let y = 26; y < H - 1; y++) for (const x of [TRAIL_X, TRAIL_X + 1]) g[y][x] = g[y][x] === '~' ? 'b' : 'y';   // the trail, bridged over the creek
    g[H - 1][TRAIL_X] = 'y';                                                     // and out through the trees, south to the lake
  })
  .prop('obj.windsock', 51, 6, { id: 'obj.af_windsock', label: 'Windsock',
    text: 'Striped canvas on a pole at the edge of the strip, faded to the color of weak tea and patched with a pillowcase. There is no wind tonight. It hangs straight down.' })
  .prop('obj.runway_lamp', 30, 13, { id: 'obj.af_lamp', label: 'Runway lamp', light: 0.7,
    text: 'Kerosene, in a glass chimney on an iron stake. A row of them marks each edge of the grass. Somebody walks the strip at dusk with a box of matches and lights every one.' })
  .prop('obj.cordon_sign', 40, 1, { id: 'obj.af_fence', label: 'Fence',
    text: 'New chain-link along the far edge of the field, the posts still bright. Past it, floodlights on masts, aimed in at the grass. When a beam crosses the strip, the windsock\'s shadow swings round and back.' })
  .prop('obj.board', 32, 26, { id: 'obj.af_sign', label: 'Airfield sign',
    text: 'COLLEGE PARK AIRFIELD · OPEN SINCE 1909. Repainted over the old paint so many times that the letters stand up off the board.' })
  // Kids: talk only (approach: false, so no pickpocketing or intimidating a child), and never egg targets.
  .npc('npc.af_kid', 17, 14, { art: 'npc.analogist_kid', label: 'A kid with a paper airplane', age: 'child', eggNo: true, approach: false,
    text: '"Watch." The paper airplane goes about nine feet and noses into the grass. He fetches it, then turns round without being asked and shows you the back of his neck, where a lace port would go. Nothing there but a mosquito bite.\n\n"Mom says I can decide when I\'m forty."' })
  .npc('npc.af_mother', 15, 15, { art: 'npc.analogist_b', label: 'His mother, with a lantern', age: 'adult',
    text: '"We come out here when the city gets loud." She turns the lantern down a notch. "He thinks it\'s camping."',
    later: [{ if: 'act1.beat.call', text: '"Every phone in town went off at once. You could hear it from here, like crickets." She keeps her eyes on the kid.' }] })
  .exit('hangar', 29, 23, { id: 'obj.af_hangar_door', art: 'obj.door', label: 'The hangar', pair: 'obj.hangar_out',
    text: 'The big doors are rolled shut against the cold. The small door cut into them stands open a hand\'s width, and lamplight comes through.' })
  .exit('lake', TRAIL_X, H - 1, { id: 'obj.af_trail', art: 'obj.purple_sign', label: 'Trail to Lake Artemesia', pair: 'obj.lake_airfield',
    text: 'The Paint Branch trail, back south through the trees to the lake.' })
  .spawn(TRAIL_X, 27).spawn(TRAIL_X + 1, 27)
  // Dressing nobody needs to talk to: the rest of the runway lamps, a bench by the hangar, tie-down blocks.
  .scenery('obj.bench', 20, 21).scenery('obj.crate', 39, 22, { solid: true }).scenery('obj.boxes', 39, 21)
  .scenery('obj.tires', 44, 14, { solid: true }).scenery('obj.tires', 47, 14, { solid: true });
for (const [x, y] of LAMPS) if (!(x === 30 && y === 13)) field.scenery('obj.runway_lamp', x, y, { light: 0.6 });
export const airfield = field.build();

// ---- The hangar: a meeting hall round an old plane. Folding chairs, a card table, the field's paperwork ----
// It meets on Sundays (the corkboard at Pardo's says so too). Tonight is not a meeting: the families are here
// to sleep on the floor while the town is fenced, and the chalkboard by the door says which is which. Phones
// stay in the box by the door, so any ringing heard in here comes from that box and the room stays chip-free.
export const hangar = fromGrid({
  id: 'hangar', name: 'The hangar', fill: '.', world: { x: 112, y: -31 },
  rows: [
    '############################',
    '#..M.......................#',
    '#...........A..........L...#',
    '#..............Y...........#',
    '#..........R...............#',
    '#..........................#',
    '#...HHHHH.....HHHHH........#',
    '#.....................FTG..#',
    '#...HHHHH.....HHHHH........#',
    '#..........................#',
    '#..K.......................#',
    '#........B..@...S.U.J......#',
    '#############XX#############',
  ],
  legend: {
    A: { scenery: 'obj.plane', solid: true, w: 2 },
    Y: { prop: 'obj.board', id: 'obj.hangar_plane_card', label: 'Card by the plane',
      text: 'A card on a music stand beside the plane. Spruce and fabric, a four-cylinder engine, magnetos, no electronics anywhere. Last flown in the spring. Under that, in pencil: NOBODY SLEEPS IN THE PLANE.' },
    M: { prop: 'obj.bookshelf', id: 'obj.hangar_maps', label: 'Map shelf',
      text: 'Paper maps in cardboard tubes, labeled by hand: COLLEGE PARK. THE BELTWAY. ROUTE 1 TO BALTIMORE. One lies unrolled under four stones, every road marked in pencil with how many minutes it takes on foot.' },
    L: { prop: 'obj.flight_log', id: 'obj.hangar_flight_log', label: 'Flight log', action: 'pages', pages: [
      'The field\'s flight log, a ledger on a stand with a pencil on a string. Date, aircraft, pilot, minutes aloft, wind. Most of the remarks are about the wind.',
      // 22:40 is an ordinary local circuit flown that evening; the Call is the next entry, and it has no time.
      '2071. The day and the month are under a thumbprint in engine oil.\n\n22:40. Local circuit, solo. Three landings. Calm. Windsock limp.\n\nREMARKS: Owl on the windsock pole again. It didn\'t think much of my landings.',
      'The next entry has the same date, in another hand, and nothing in the time column.\n\nEvery phone in the box by the door rang at once. Nobody got to it in time. Then the power went out across the county. Lit the strip with kerosene lamps from the shed. Two planes came in on them before morning.',
      'The last entry is tonight\'s. No flights. Wind calm. Under REMARKS somebody has drawn a windsock, and a kid has colored it in.',
    ] },
    J: { prop: 'obj.key_jar', id: 'obj.hangar_key_jar', label: 'Jar of keys',
      text: 'A pickle jar of keys on a stool by the door. House keys, padlock keys, a mailbox key, a key for a car nobody has built since the 2050s. A card: IF YOU FIND THE DOOR ONE OF THESE OPENS, TELL US WHERE. People keep adding keys. Nobody has found a door.' },
    B: { prop: 'obj.lost_found', id: 'obj.hangar_phone_box', label: 'Box by the door',
      text: 'A cardboard box full of phones, screens down, a strip of tape with a name on each. The box is the rule: nothing with a chip goes past the door.' },
    S: { prop: 'obj.chalkboard', id: 'obj.hangar_schedule', label: 'Chalkboard by the door',
      text: 'In a careful hand, gone over so often the letters have thickened: SUNDAYS, 7 P.M. BRING A CHAIR. POTLUCK THE FIRST SUNDAY.\n\nUnder it, fresh, pressed so hard the chalk snapped: NO MEETING TONIGHT. THEY FENCED THE TOWN. IF YOU NEED THE FLOOR, TAKE IT. A.R.' },
    U: { prop: 'obj.house_rules', id: 'obj.hangar_rules', label: 'Hangar rules',
      text: 'Painted on plywood: PHONES IN THE BOX. BOOTS ON THE MAT. KIDS MAY TOUCH THE PLANE. ADULTS ASK FIRST.' },
    R: { npc: 'npc.deacon_reed', art: 'npc.deacon', label: 'Deacon Amos Reed', age: 'adult', role: 'elder',
      text: 'He nods to you and says nothing. The lantern in his hand ticks as it cools. You find yourself explaining why you came, all of it, and he waits until you run out.\n\n"There\'s coffee on the stove in back," he says. "Wash the cup after."',
      later: [{ if: 'act1.beat.call', text: '"It was the box by the door." He waits a while. "Every phone in it rang at once. Rang till the batteries quit."' }] },
    H: { scenery: 'obj.chair', solid: true },
    T: { prop: 'obj.table', id: 'obj.hangar_cards', label: 'Card table',
      text: 'Rummy, scored on the back of an envelope. A thermos. A cribbage board with matchsticks for pegs, because somebody lost the pegs in 2090.' },
    F: { npc: 'npc.af_cards_a', art: 'npc.analogist_a', label: 'A card player', age: 'adult',
      text: '"Sit in if you like. We play for matchsticks." He deals you a hand before you answer, then takes it back. "Next round."' },
    G: { npc: 'npc.af_cards_b', art: 'npc.analogist_b', label: 'Another card player', age: 'adult',
      text: '"He cheats," she says, without looking up. "With his face. You can read every card he holds off his eyebrows."' },
    K: { npc: 'npc.af_kid_asleep', art: 'npc.analogist_kid2', label: 'A kid, asleep', age: 'child', eggNo: true, approach: false,
      text: 'Asleep on a pile of coats with one shoe off. There is a paper airplane tucked inside the shoe.' },
    '@': { spawn: true },
    X: { exit: 'airfield', id: 'obj.hangar_out', art: 'obj.door', label: 'Out to the field', stepOn: true, pair: 'obj.af_hangar_door', text: 'Back out onto the grass.' },
  },
}).build();
