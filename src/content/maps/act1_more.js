// More of Act 1, [SCAFFOLD] batch (scope: docs/design/10-scope.md; Trevor: "this game must be much larger scale").
// Built with the level builder from text grids. Every "[scaffold]" line is a placeholder for the polish pass.
// Brainstorm notes for each area are in docs/design/levels/act1_batch1.md.
import { fromGrid } from './builder.js';

// ---- The diner (College Park, east of Route 1): always open, a cook plating for an empty room ----
export const diner = fromGrid({
  id: 'diner', name: 'The diner', fill: '.',
  rows: [
    '######################',
    '#kkkkkkkkk#..........#',
    '#kkCkkkkkk#..b....b..#',
    '#kkkkkkkkk#..........#',
    '###==S====#..b....b..#',
    '#....................#',
    '#..J.............b...#',
    '#....@...............#',
    '##########DD##########',
  ],
  legend: {
    C: { npc: 'npc.diner_cook', art: 'npc.rotter_3', tile: 'k', label: 'The cook', text: '[scaffold] "Order up." There is nobody to take it. He plates it anyway, and slides it down the counter.' },
    S: { prop: 'obj.kiosk', id: 'obj.diner_counter', tile: '.', label: 'The counter', action: 'shop', shop: 'diner' },
    J: { prop: 'obj.board', id: 'obj.diner_jukebox', label: 'Jukebox', text: '[scaffold] Every song on it is the same song, re-recorded by a different band each decade.' },
    b: { prop: 'obj.table', label: 'Booth', text: '[scaffold] A booth. The vinyl is cracked in the shape of everyone who sat here.' },
    '@': { spawn: true },
    D: { exit: 'metro_plaza', id: 'obj.diner_out', art: 'obj.door', label: 'Out to Route 1', stepOn: true, pair: 'obj.diner_door', text: 'Back out onto Route 1.' },
  },
}).build();

// ---- ASTER basement, B-01 (the super's level): boilers, Kess's workshop, storage cages ----
export const asterBasement = fromGrid({
  id: 'aster_basement', name: 'ASTER, basement (B-01)', fill: ':',
  rows: [
    '##########################',
    '#U:::::#::::::::#::::::::#',
    '#::@:::#::BB::::#::$::$::#',
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
    K: { prop: 'obj.table', id: 'obj.kess_bench', label: 'Kess\'s workbench', text: '[scaffold] Labeled jars of screws by size, one jar labeled STRIPPED that is fuller than the others.' },
    $: { prop: 'obj.crate', label: 'Storage cage', loot: 'parts', text: '[scaffold] A tenant\'s storage cage. The padlock is a twist tie.' },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
  },
}).build();

// ---- ASTER roof: water tank, the view of the cordon lights, a place people go to be alone ----
export const asterRoof = fromGrid({
  id: 'aster_roof', name: 'ASTER, the roof', fill: 'y', outdoor: false,
  rows: [
    '========================',
    '=yyyyyyyyyyyyyyyyyyyyyy=',
    '=yyWWyyyyyyyy@yyyyyyyyy=',
    '=yyWWyyyyyyyyyyyyyVyyyy=',
    '=yyyyyyyyyyyyyyyyyyyyyy=',
    '=yyyyyyyyyyyyyNyyyyyyyy=',
    '=yyyyyyyyyyyyyyyyyyyyyy=',
    '=Lyyyyyyyyyyyyyyyyyyyyy=',
    '========================',
  ],
  legend: {
    L: { exit: 'aster_hall', id: 'obj.roof_hatch', art: 'obj.stairs', label: 'Hatch down to the sixth floor', pair: 'obj.hall_roof', text: 'Back down the ladder.' },
    W: { scenery: 'obj.degasser', solid: true },
    V: { prop: 'obj.board', id: 'obj.roof_view', label: 'The view north', text: '[scaffold] The cordon lights in a ring around College Park. From up here you can see it is a circle, and you are in the middle.' },
    N: { npc: 'npc.roof_watcher', art: 'npc.rotter_1', label: 'Someone on the roof', text: '[scaffold] "Count the floodlights. There were eleven last week."' },
    '@': { spawn: true },
  },
}).build();

// ---- The campus quad (behind Compute Hall B): the dining hall, the robotics lab, the cordon at the edge ----
export const campusQuad = fromGrid({
  id: 'campus_quad', name: 'The campus quad', fill: 'g', outdoor: true,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T########gggggggggggggg#########gT',
    'T########gggggggggggggg#########gT',
    'T####F###ggggqqqqqqgggg####R####gT',
    'Tggggqggggggggq....qggggggggqggggT',
    'Tggggqqqqqqqqqq.EE.qqqqqqqqqqggggT',
    'Tggggggggggggggq....qggggggggggggT',
    'TggTgggggggggggqqqqqqggggggggTgggT',
    'Tgggggggggggggggqq@qgggggggggggggT',
    'TgggggggggggggggqqHqgggggggggggggT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    F: { exit: 'dining_hall', id: 'obj.quad_dining', art: 'obj.door', label: 'The dining hall', pair: 'obj.dining_out', text: 'The dining hall. The lights are on.' },
    R: { exit: 'robotics_lab', id: 'obj.quad_robotics', art: 'obj.door', label: 'Robotics and Autonomy Lab', pair: 'obj.robotics_out', text: 'The robotics lab. A keypad, and someone has written the code on the wall next to it.' },
    H: { exit: 'compute_hall_b', id: 'obj.quad_chb', art: 'obj.door', label: 'Back into Compute Hall B', pair: 'obj.chb_quad_door', text: 'Back inside.' },
    E: { enemy: 'enemy.spitter' },
    '@': { spawn: true },
  },
}).build();

// ---- The dining hall (Trevor's future-locations list): long tables, the waffle machine, a cook who stayed ----
export const diningHall = fromGrid({
  id: 'dining_hall', name: 'The dining hall', fill: 'k',
  rows: [
    '############################',
    '#kkkkkkkkkkkkkkkkkkkkkkkkkkk#',
    '#kkttttttttkkkkkttttttttkkkk#',
    '#kkkkkkkkkkkkkkkkkkkkkkkkkkk#',
    '#kkttttttttkkkkkttttttttkkkk#',
    '#kkkkkkkkkkkkkkkkkkkkkkkkkkk#',
    '#kkkkkkkkkkWkkkkkkkkkkkCkkkk#',
    '#kkkkkkkkkkkk@kkkkkkkkkkkkkk#',
    '#############DD##############',
  ],
  legend: {
    t: { scenery: 'obj.table', solid: true, tile: 'k' },
    W: { prop: 'obj.kiosk', id: 'obj.waffle_machine', label: 'The waffle machine', text: '[scaffold] It is new. It is the only new thing on campus. It makes a waffle shaped like the university seal.' },
    C: { npc: 'npc.dining_cook', art: 'npc.rotter_2', label: 'A cook who stayed', text: '[scaffold] "Students come back. They always come back for the waffles."' },
    '@': { spawn: true },
    D: { exit: 'campus_quad', id: 'obj.dining_out', art: 'obj.door', label: 'Out to the quad', stepOn: true, pair: 'obj.quad_dining', text: 'Back out to the quad.' },
  },
}).build();

// ---- The Robotics and Autonomy Lab: where the UMD Mars rover lives (Trevor: it belongs in the world, not his gear) ----
export const roboticsLab = fromGrid({
  id: 'robotics_lab', name: 'Robotics and Autonomy Lab', fill: 'e',
  rows: [
    '##########################',
    '#eeeeeeeeeeeeeeeeeeeeeeee#',
    '#eeMeeeeeeeeeeeeeeeeQeeee#',
    '#eeeeeeeeeeeeeeeeeeeeeeee#',
    '#eeeeeee######eeeeeeeeeee#',
    '#eeeeeee#eeee#eeeeeeeeeee#',
    '#eeBeeeeeeeeeeeeeeeeeEeee#',
    '#eeeeeeeee@eeeeeeeeeeeeee#',
    '###########DD#############',
  ],
  legend: {
    M: { prop: 'obj.table', id: 'obj.mars_rover', label: 'The Mars rover', text: '[scaffold] The UMD rover team\'s machine, six wheels on rocker-bogies, half its panels off. A whiteboard behind it: DEMO DAY with the date crossed out four times.' },
    Q: { prop: 'obj.board', id: 'obj.rover_whiteboard', label: 'Whiteboard', text: '[scaffold] Wheel torque numbers, and a stick figure labeled TREVOR holding a wrench.' },
    B: { prop: 'obj.crate', label: 'Parts bin', loot: 'parts', text: '[scaffold] Motors, encoders, a bag of M3 screws. Good stuff.' },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
    D: { exit: 'campus_quad', id: 'obj.robotics_out', art: 'obj.door', label: 'Out to the quad', stepOn: true, pair: 'obj.quad_robotics', text: 'Back out to the quad.' },
  },
}).build();
