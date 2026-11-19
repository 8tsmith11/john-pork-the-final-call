// More of ASTER, [SCAFFOLD] (10-scope.md stretch; Trevor: "this game must be much larger scale"): three neighbors'
// apartments on the sixth floor, the fifth-floor landing, and the basement laundry. Doors 632 and 634 stay shut on
// purpose: their texts read like story hooks, which are the lore gate's to open. Every "[scaffold]" line waits for
// the polish pass (gonman's floor texts set the tone: keep each neighbor a small mystery, not an explanation).
import { fromGrid } from './builder.js';

const home = (id, label) => ({ exit: 'aster_hall', id: `obj.${id}_out`, pair: `obj.door_${id.slice(4)}`, art: 'obj.door', label, stepOn: true, text: 'Back out to the hall.' });

// ---- 637: the neighbor practicing scales, getting worse ----
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
    N: { npc: 'npc.apt637_player', art: 'npc.rotter_2', label: 'The neighbor in 637', text: '[scaffold] "Scales. Every night. I\'m not getting better. I\'m getting more honest about it."' },
    M: { prop: 'obj.board', id: 'obj.apt637_sheet', label: 'Sheet music', text: '[scaffold] Hand-copied sheet music. Every page is the same exercise, dated, and the dates go back years.' },
    '@': { spawn: true },
    D: home('apt_637', 'Back out to the hall'),
  },
}).build();

// ---- 638: the television that says "things are stable" ----
export const apt638 = fromGrid({
  id: 'apt_638', name: 'Apartment 638', fill: '.',
  rows: [
    '##################',
    '#................#',
    '#..TV............#',
    '#................#',
    '#..bb.....N......#',
    '#................#',
    '#........@.......#',
    '#########DD#######',
  ],
  legend: {
    T: { prop: 'obj.board', id: 'obj.apt638_tv', label: 'The television', text: '[scaffold] "Citizens, things are stable." A pause. "Citizens, things are stable." The second one is a little different. You can\'t say how.' },
    V: { scenery: 'obj.crate', solid: true, tile: '.' },
    b: { scenery: 'obj.table', solid: true, tile: '.' },
    N: { npc: 'npc.apt638_viewer', art: 'npc.rotter_3', label: 'The neighbor in 638', text: '[scaffold] "Shh. They\'re about to say it again. I like to see if I can spot the difference."' },
    '@': { spawn: true },
    D: home('apt_638', 'Back out to the hall'),
  },
}).build();

// ---- 636: nobody home; deliveries for the previous tenant, and the one before ----
export const apt636 = fromGrid({
  id: 'apt_636', name: 'Apartment 636', fill: '.',
  rows: [
    '################',
    '#..............#',
    '#.$$$..........#',
    '#.$$$.....?....#',
    '#..............#',
    '#......@.......#',
    '#######DD#######',
  ],
  legend: {
    $: { prop: 'obj.crate', label: 'A delivery box', loot: 'parts', text: '[scaffold] Addressed to someone who lived here two tenants ago. Never opened. Until now.' },
    '?': { prop: 'obj.board', id: 'obj.apt636_lease', label: 'A lease on the counter', text: '[scaffold] A lease with three names, each crossed out by the next. The last line is blank.' },
    '@': { spawn: true },
    D: home('apt_636', 'Back out to the hall'),
  },
}).build();

// ---- The fifth floor: the same hallway as yours, one floor down, a little wrong ----
export const aster5f = fromGrid({
  id: 'aster_5f', name: 'ASTER, fifth floor', fill: ':',
  rows: [
    '########################################',
    '#S:::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::#',
    '#:::::d::::d:::::::d:::::::d:::::::::::#',
    '#::::::::::::::::::N:::::::::::::::E:::#',
    '#:@::::::::::::::::::::::::::::::::::::#',
    '########################################',
  ],
  legend: {
    d: { prop: 'obj.door', label: 'A fifth-floor door', text: '[scaffold] The same door as the one above it, one floor down. The number is the same too, minus a hundred. Mostly.' },
    N: { npc: 'npc.aster5_neighbor', art: 'npc.rotter_1', label: 'Someone in the fifth-floor hall', text: '[scaffold] "You\'re from upstairs. You walk loud. That\'s not a complaint. It\'s how I know someone\'s home."' },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
    S: { exit: 'aster_lobby', id: 'obj.aster5_stairs', art: 'obj.stairs', label: 'Stairs (lobby)', pair: 'obj.lobby_5f', text: 'Back down to the lobby.' },
  },
}).build();

// ---- The basement laundry: two machines that work, one that eats quarters and gives back something else ----
export const asterLaundry = fromGrid({
  id: 'aster_laundry', name: 'ASTER, the laundry room', fill: ':',
  rows: [
    '################',
    '#::::::::::::::#',
    '#:WW:WW:WW:::?:#',
    '#::::::::::::::#',
    '#::::::::::N:::#',
    'D:@::::::::::::#',
    '################',
  ],
  legend: {
    W: { scenery: 'obj.degasser', solid: true, tile: ':' },
    '?': { prop: 'obj.board', id: 'obj.laundry_board', label: 'Laundry room corkboard', text: '[scaffold] LOST: one sock (gray). FOUND: one sock (gray). Neither note mentions the other.' },
    N: { npc: 'npc.laundry_folder', art: 'npc.rotter_2', label: 'Someone folding at 3 a.m.', text: '[scaffold] "It\'s the only time the machines are free. Also the only time they work."' },
    '@': { spawn: true },
    D: { exit: 'aster_basement', id: 'obj.laundry_out', art: 'obj.door', label: 'Back to the basement', pair: 'obj.basement_laundry', stepOn: true, text: 'Back to B-01.' },
  },
}).build();
