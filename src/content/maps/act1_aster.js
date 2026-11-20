// More of ASTER (10-scope.md stretch; Trevor: "this game must be much larger scale"): three neighbors' apartments
// on the sixth floor, the fifth-floor landing, and the basement laundry. Doors 632 and 634 stay shut on purpose:
// their texts read like story hooks, which are the lore gate's to open. Layouts from the scaffold; lines, prop art
// and one small secret per area from the polish pass (hub #30, gonman). Each neighbor stays a small mystery.
// Spanish: src/i18n/es-aster.js.
import { fromGrid } from './builder.js';

const home = (id, label) => ({ exit: 'aster_hall', id: `obj.${id}_out`, pair: `obj.door_${id.slice(4)}`, art: 'obj.door', label, stepOn: true, text: 'Back out to the hall.' });

// ---- 637: the neighbor practicing scales, getting worse ----
// Secret: once you've told them how long it's been (side.apt637_scales), they try a new exercise after all.
export const apt637 = fromGrid({
  id: 'apt_637', name: 'Apartment 637', fill: '.',
  rows: [
    '##################',
    '#................#',
    '#.SS......bb.....#',
    '#.SS.............#',
    '#.......N.....M..#',
    '#................#',
    '#.......@........#',
    '########DD########',
  ],
  legend: {
    S: { scenery: 'obj.crate', solid: true, tile: '.' },
    b: { scenery: 'obj.table', solid: true, tile: '.' },
    N: { npc: 'npc.apt637_player', art: 'npc.rotter_2', label: 'The neighbor in 637',
      text: '"Nine o\'clock, scales. The one night I skipped, somebody slid a note under my door asking if I was all right." They play one up and back down. The same note goes wrong both ways.',
      later: [{ if: 'q.apt637_scales.told', text: 'A new page on the stand. It\'s the old exercise, moved up a half step. "Don\'t say anything," they say, and start.' }] },
    M: { prop: 'obj.house_rules', id: 'obj.apt637_sheet', label: 'Sheet music', text: 'A binder of hand-copied sheet music open on a stand. The same exercise is copied out fresh on every page, with a date in the top corner.' },
    '@': { spawn: true },
    D: home('apt_637', 'Back out to the hall'),
  },
}).build();

// ---- 638: the television that says "things are stable" ----
// Secret: she keeps cold brew by the couch for the long nights, and offers you a can (one per save).
export const apt638 = fromGrid({
  id: 'apt_638', name: 'Apartment 638', fill: '.',
  rows: [
    '##################',
    '#................#',
    '#..TV............#',
    '#................#',
    '#..bb.C...N......#',
    '#................#',
    '#........@.......#',
    '#########DD#######',
  ],
  legend: {
    T: { prop: 'obj.tv', id: 'obj.apt638_tv', label: 'The television', text: 'An anchor in front of a flag that doesn\'t move. "Citizens, things are stable." A pause, long enough to change the channel. "Citizens, things are stable."' },
    V: { scenery: 'obj.crate', solid: true, tile: '.' },
    b: { scenery: 'obj.couch', solid: true, tile: '.' },
    C: { prop: 'obj.boxes', id: 'obj.apt638_cans', label: 'Cold brew by the couch', grant: 'item.caffeine',
      text: 'A carton of cold brew on the floor by the couch, the empties lined up in rows. She waves at the full cans without looking away from the screen. You take one.',
      doneText: 'Empty cans in rows by the couch. She has started a new row.' },
    N: { npc: 'npc.apt638_viewer', art: 'npc.rotter_3', label: 'The neighbor in 638', text: '"Shh. Here it comes again." A notebook open on her knee, numbered down the margin to two hundred and six. She writes without looking down.' },
    '@': { spawn: true },
    D: home('apt_638', 'Back out to the hall'),
  },
}).build();

// ---- 636: nobody home; deliveries for the previous tenant, and the one before ----
// Secret: one of the boxes was misdelivered, and it's 631's (one per save).
export const apt636 = fromGrid({
  id: 'apt_636', name: 'Apartment 636', fill: '.',
  rows: [
    '################',
    '#..............#',
    '#.$$$..........#',
    '#.$$P.....?....#',
    '#..............#',
    '#......@.......#',
    '#######DD#######',
  ],
  legend: {
    $: { prop: 'obj.boxes', label: 'A delivery box', loot: 'parts', text: 'A delivery box addressed to a tenant from two leases ago. The tape has gone yellow and lets go as soon as you touch it.' },
    P: { prop: 'obj.boxes', id: 'obj.apt636_parcel', label: 'A box addressed to 631', grant: 'item.wool_socks',
      text: 'This one is addressed to 631. It came to the wrong door months ago and got buried under the others. Inside: wool socks, the thick kind. One of you ordered these. Nobody says who.',
      doneText: 'The empty box. ASTER 631 on the label, and a delivery date from last spring.' },
    '?': { prop: 'obj.house_rules', id: 'obj.apt636_lease', label: 'A lease on the counter', text: 'A lease on the counter. Three tenants\' names, each crossed out in the next one\'s ink. The fourth line is blank. The landlord\'s stamp is already on it.' },
    '@': { spawn: true },
    D: home('apt_636', 'Back out to the hall'),
  },
}).build();

// ---- The fifth floor: the same hallway as yours, one floor down, a little wrong ----
// Secret: the fire hose cabinet holds a hard hat left as collateral (one per save). 531 sits right under 631.
export const aster5f = fromGrid({
  id: 'aster_5f', name: 'ASTER, fifth floor', fill: ':',
  rows: [
    '########################################',
    '#S::::::::::::H::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::#',
    '#:::::1::::d:::::::d:::::::d:::::::::::#',
    '#::::::::::::::::::N:::::::::::::::E:::#',
    '#:@::::::::::::::::::::::::::::::::::::#',
    '########################################',
  ],
  legend: {
    d: { prop: 'obj.door', label: 'A fifth-floor door', text: 'The same door as the ones upstairs, a hundred lower. The peephole goes dark while you stand there and lights up again when you move on.' },
    1: { prop: 'obj.door', id: 'obj.door_531', label: '531', text: '531, right under 631. Two sticky notes on the door in the same handwriting. The older one: PLEASE NO FURNITURE AFTER MIDNIGHT. The newer one: WHAT ARE YOU BUILDING UP THERE.' },
    H: { prop: 'obj.extinguisher', id: 'obj.aster5_hose', label: 'Fire hose cabinet', grant: 'item.hardhat',
      text: 'FIRE HOSE, behind a glass door that doesn\'t lock. The hose is gone. On the hook where it hung, a yellow hard hat and a note: BORROWED HOSE FOR THE GARDEN. HAT IS COLLATERAL. 4F.',
      doneText: 'The empty cabinet and the note from 4F. Nobody has brought the hose back.' },
    N: { npc: 'npc.aster5_neighbor', art: 'npc.rotter_1', label: 'Someone in the fifth-floor hall', text: '"You\'re upstairs. Six-thirty-one. I know the three of you by your feet." He points at a spot on the ceiling. "Somebody stands right there at two every night, a long time. That\'s your fridge."' },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
    S: { exit: 'aster_lobby', id: 'obj.aster5_stairs', art: 'obj.stairs', label: 'Stairs (lobby)', pair: 'obj.lobby_5f', text: 'Back down to the lobby.' },
  },
}).build();

// ---- The basement laundry: machines that work, and one on the end that eats coins and gives back something else ----
// Secret: the machine on the end (a searchable container). The person folding hints at it.
export const asterLaundry = fromGrid({
  id: 'aster_laundry', name: 'ASTER, the laundry room', fill: ':',
  rows: [
    '################',
    '#::::::::::::::#',
    '#:WW:WW:WW:X:?:#',
    '#::::::::::::::#',
    '#::::::::::N:::#',
    'D:@::::::::::::#',
    '################',
  ],
  legend: {
    W: { scenery: 'obj.washer', solid: true, tile: ':' },
    X: { prop: 'obj.washer', id: 'obj.laundry_end_machine', label: 'The machine on the end', loot: 'lost', text: 'OUT OF ORDER, on a sign in three different hands. It takes your coin anyway, hums for a while, and drops something into the lint tray that isn\'t your coin.' },
    '?': { prop: 'obj.board', id: 'obj.laundry_board', label: 'Laundry room corkboard', text: 'Index cards on cork. LOST: ONE SOCK, GRAY, WOOL. Two cards over, in different ink: FOUND: ONE GRAY SOCK, ASK AT 212. Neither card has moved since spring.' },
    N: { npc: 'npc.laundry_folder', art: 'npc.rotter_2', label: 'Someone folding at 3 a.m.', text: '"Three a.m. is the only time every machine is free." She shakes out a towel and folds it into a square. "Except the one on the end. Nobody uses the one on the end."' },
    '@': { spawn: true },
    D: { exit: 'aster_basement', id: 'obj.laundry_out', art: 'obj.door', label: 'Back to the basement', pair: 'obj.basement_laundry', stepOn: true, text: 'Back to B-01.' },
  },
}).build();
