// Lake Artemesia: an optional night area off the end of the Paint Branch trail (east edge of the
// plaza). A loop path around the lake, two fishing piers, the shut boathouse, a marsh, the Green
// Line running behind a fence on the east side, and a small island you can reach if you notice the
// stones. Painted with rectangles and ellipses so it stays editable.
import { makeMap } from './build.js';

const W = 72, H = 44;
const g = Array.from({ length: H }, () => Array(W).fill('g'));
const R = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j]?.[i] !== undefined) g[j][i] = ch; };
const ELL = (cx, cy, rx, ry, ch, inner = 0) => {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
    if (d <= 1 && d >= inner) g[y][x] = ch;
  }
};

// Trees first, scattered, then everything else is painted over them.
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if ((x * 11 + y * 7) % 13 === 0) g[y][x] = 'T';

ELL(40, 21, 21, 15, 's', 0.8);                                   // the loop trail around the lake
ELL(40, 21, 19.5, 13.5, 'g');                                    // the bank inside the loop
ELL(40, 21, 17, 11, '~');                                        // the lake
ELL(45, 18, 3.2, 2.4, 'g');                                      // the island
R(44, 17, 1, 1, 'T');                                            // its one tree
for (const [x, y] of [[45, 8], [45, 9], [45, 10], [45, 11], [46, 11], [46, 12], [46, 13], [45, 13], [45, 14], [45, 15]]) g[y][x] = 'p';   // the stones, zig-zagging out to the island
R(1, 21, 16, 2, 's');                                            // the trail in from Paint Branch
R(16, 20, 4, 4, 's');
R(40, 29, 2, 7, 'b');                                            // south pier
R(56, 20, 6, 2, 'b');                                            // east pier
ELL(23, 37, 5, 3, '~'); ELL(27, 39, 3, 2, '~');                  // the marsh
R(52, 3, 9, 4, '#'); R(53, 7, 7, 1, 'p');                        // the boathouse and its apron
R(64, 1, 1, H - 2, '=');                                         // the fence
R(66, 1, 2, H - 2, 't');                                         // the Green Line, at grade here
R(0, 0, W, 1, 'T'); R(0, H - 1, W, 1, 'T'); R(0, 0, 1, H, 'T'); R(W - 1, 0, 1, H, 'T');
R(0, 21, 1, 2, 's');                                             // the way back out

const lamp = (x, y, text) => ({ id: `obj.lakelamp_${x}_${y}`, art: 'obj.streetlamp', x, y, label: 'Trail lamp', light: 0.8, text });

export const lake = makeMap({
  id: 'lake', name: 'Lake Artemesia',
  outdoor: true,
  layout: g.map((r) => r.join('')),
  spawns: [[2, 21], [2, 22], [3, 22]],
  enemies: [
    ['enemy.rotling', 12, 21],                                     // on the trail in
    ['enemy.rotling', 58, 12], ['enemy.spitter', 61, 16],          // north-east woods by the fence
    ['enemy.spitter', 21, 34], ['enemy.rotling', 29, 36],          // the marsh
    ['enemy.rotling', 30, 7],                                      // north shore
    ['enemy.spitter', 46, 19],                                     // on the island, with the thing it's sitting on
  ],
  objects: [
    { id: 'obj.lake_back', art: 'obj.purple_sign', x: 0, y: 22, label: 'Back to College Park', action: 'exit', to: 'metro_plaza', text: 'The trail back to the plaza.' },
    { id: 'obj.lake_sign', art: 'obj.board', x: 6, y: 20, label: 'Trail sign', text: 'LAKE ARTEMESIA · 0.4 MI. Under it, a newer plate: WATER SAFETY ZONE. CONTINUITY ADVISES AGAINST CONTACT WITH STANDING WATER. Somebody has scratched FISH ARE FINE under that.' },
    lamp(15, 20, 'Solar, on a timer. It comes on for a second when you walk under it, then decides you are not worth it.'),
    lamp(26, 10, 'The lamp hums. Moths do slow laps around it.'),
    lamp(55, 31, 'Half the glass is gone. It still works.'),
    lamp(39, 36, 'At the foot of the south pier. Someone has taped a fishing licence to it, expired 2091.'),
    { id: 'obj.lake_bench', art: 'obj.bench', x: 33, y: 35, label: 'Bench', text: 'IN MEMORY OF EVERYONE WHO FISHED HERE. No names. It\'s a long bench.' },
    // The south pier and its fisherman (side quest: "Something that glows")
    { id: 'npc.ozzie', art: 'npc.seun', x: 41, y: 29, label: 'Ozzie', npc: true, later: [
      { if: 'q.lantern.given', text: '"Wrote it down twice," Ozzie says, "in case the first one doesn\'t take." His eyes are back on the water. The notebook is open on his knee at the same page.' },
      { if: 'q.lantern.given && act1.complete', text: 'Ozzie offers you the second rod without a word. The two of you fish for a while. Nothing bites.' },
    ], text: 'An old man at the end of the pier with two rods, a bucket, and a notebook full of tally marks. He doesn\'t look up. "You\'re scaring them. Sit or go."' },
    { id: 'obj.tackle_box', art: 'obj.toolbox', x: 39, y: 34, label: 'Tackle box', loot: 'tackle', text: 'A tackle box left open on the bench end of the pier, lures in neat rows. Ozzie\'s spare.' },
    { id: 'obj.marsh_debris', art: 'obj.crate', x: 26, y: 35, label: 'Washed-up crate', loot: 'trash', text: 'A crate the marsh has been working on for a while. The label says PERISHABLE.' },
    // The east pier
    { id: 'obj.east_pier_sign', art: 'obj.board', x: 61, y: 19, label: 'Pier rules', text: 'NO DIVING. NO NETS. CATCH AND RELEASE.\nAll three have been crossed out, and under them in marker: TAKE WHAT YOU NEED.' },
    // The boathouse
    { id: 'obj.boathouse_door', art: 'obj.door', x: 56, y: 6, label: 'Boathouse', text: 'Padlocked, and the padlock is newer than the boathouse. Through the gap: paddle boats stacked to the roof, swan-shaped, eyes painted on. A Continuity notice on the door: RECREATIONAL WATERCRAFT SUSPENDED PENDING REVIEW.' },
    { id: 'obj.boats', art: 'obj.cart', x: 54, y: 7, label: 'Swan boat', text: 'One swan boat is outside, upside down, with a hole in it the size of a fist. Something punched out from inside.' },
    // The fence and the line
    { id: 'obj.fence_gap', art: 'obj.graffiti', x: 64, y: 30, label: 'Fence', text: 'Chain-link with razor wire, and past it the Green Line running at grade. A train goes by with every window dark and nobody aboard, exactly on time.' },
    // The marsh
    { id: 'obj.heron', art: 'obj.planter', x: 19, y: 38, label: 'Heron', text: 'A grey heron standing in the reeds, absolutely still. Then you notice it\'s been standing on one leg on nothing: the water under it is deep. It walks off north-east, on top of the lake, one careful step at a time.' },
    // The island (secret): reached by the stones from the north shore
    { id: 'obj.island_shrine', art: 'obj.statue_1', x: 46, y: 18, label: 'Something on the island', grant: 'item.lake_bust', grantFlag: 'secrets.lake.island', doneText: 'The plinth where the little bust was. A ring of clean stone where the moss didn\'t grow.', text: 'A plinth no taller than your knee, and on it a bust of John Pork the size of a fist, carved out of something white that isn\'t stone. Somebody keeps it clean. There are fresh flowers. You take it, and immediately feel like you shouldn\'t have.' },
  ],
});
