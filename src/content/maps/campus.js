// The campus (atlas ring one). Built with the level builder from the brainstorm grid in
// docs/design/levels/compute_hall_b.md; lines, prop art and the TA's secret line from the polish pass (hub #30,
// gonman). Spanish: src/i18n/es-plaza.js.
// Secret: once the autograder is down (side.autograder), the TA stops grading for one night.
//
// Hub #68 (Trevor: "compute hall needs more compute, suspicious lack of it"): the middle room is now Machine Room B,
// glassed in off both halls, on a raised floor with a perforated cold aisle between two rows of racks and a cooling
// unit at each end. The north room is a terminal lab, cable trays run along the hall walls, and floor cable runs from
// the machine room's door out to the terminals and to lab 245. Lab 245's bench, the quest objects, the doors, the
// people and the four rotlings keep their tiles (tests/run.js checks the bench: a sealed puzzle uses it).
// Art: tools/art/gen_props.py (obj.server_rack, obj.network_rack, obj.terminal_lit, obj.crac_unit, obj.cable_tray,
// obj.wall_display, obj.room_sign; dec.raised_floor, dec.raised_vent, dec.cable_*). Coloured light and cold air:
// src/content/maps/dressing.js.
import { fromGrid } from './builder.js';

// Floor dressing, the same size as the map: r raised floor, v perforated tile, - | cable runs, └ ┘ corners,
// ┬ where the run from the machine room splits east and west. Stamped as decals under everything.
const FLOOR = [
  '                            ',
  '                            ',
  '                |           ',
  '  |             |           ',
  '  |             |           ',
  '  └---------┬---┘           ',
  '            |               ',
  '        rrrrrrrrrrr         ',
  '        rrrrrrrrrrr         ',
  '        vvvvvvvvvvv         ',
  '        rrrrrrrrrrr         ',
  '                            ',
  '                            ',
  '                            ',
  '                            ',
  '                            ',
];
const DECAL = { r: ['dec.raised_floor'], v: ['dec.raised_vent'], '-': ['dec.cable_h'], '|': ['dec.cable_v'],
  '└': ['dec.cable_en'], '┘': ['dec.cable_wn'], '┬': ['dec.cable_ws', 'dec.cable_es'] };
const decals = FLOOR.flatMap((row, y) => [...row].flatMap((ch, x) => (DECAL[ch] ?? []).map((frame) => [frame, x, y])));

export const computeHallB = fromGrid({
  id: 'compute_hall_b', name: 'Compute Hall B', fill: 'm', decals,
  rows: [
    '#HHHHHH#HHHH#HHHHH##########',
    '#AAAAAA#MPMmmmMYMR#........#',
    '#A?AA!A#mmmmmmmmmm#..T.....#',
    '#AAAAAA#mmEmmmmmmm#........#',
    '#AAAAAAHHHHmHUHmmmHHHHmHHHH#',
    '#mmmmmmmmmmmmmmmmmmmmmmEmmm#',
    '####m#######m======#########',
    '#mmmmmm#Ceeeeeeeeee#mmmmmXX#',
    '#mmSmmm#RrNReKrLRre#mm$mmmm#',
    '#mmmmmm#eeeeEeeeeee#mmmmmmm#',
    '#mmmmmm#rNRreRrRNRO#mmmmmmX#',
    '#HHHmHHH===Im======HBHmHHHH#',
    '#mmmmmmmmmmmmmmmmmmmmmmmmmm#',
    '#mmmmm@mmmmmmmEmmmmmmmmmmmm#',
    '#mmmmmmmmmmmmmmmmmmmmmmmmmm#',
    '###########DD###############',
  ],
  legend: {
    A: { tile: 'e' },
    '?': { prop: 'obj.workbench', id: 'obj.chb_bench', tile: 'e', label: 'Lab bench (245)', text: 'Manuel\'s bench in 245. Under a dust cover, a head in grey clay, half finished, the ears marked in pencil much lower than you\'d guess. Taped to the cover, in his writing: NO TOCAR. Under it, in English: THIS MEANS YOU.' },
    '!': { prop: 'obj.solder', id: 'obj.chb_bench_2', tile: 'e', label: 'Lab bench', text: 'Somebody\'s project, dropped mid-solder. The iron is still plugged in. It\'s still hot.' },
    $: { prop: 'obj.crate', id: 'obj.chb_storage', label: 'Storage crate', loot: 'parts', text: 'DEPT. SURPLUS, stenciled on the side over an older stencil that says DO NOT DISCARD.' },
    T: { npc: 'npc.chb_ta', art: 'npc.rotter_2', tile: '.', label: 'TA, still grading',
      text: '"Office hours are on the door. I changed them to whenever I\'m here, which is always." She initials a quiz without reading it and pulls the next one off the stack.',
      later: [{ if: 'boss.chb_autograder.down', text: 'For once she isn\'t grading. Half a sandwich on a paper bag. "Nobody upstairs knows the autograder\'s gone yet. Give me one night before they make me grade by hand."' }] },
    S: { npc: 'npc.chb_student', art: 'npc.rotter_1', label: 'Student, stuck', text: '"The doors here only unlock on the hour." He checks the clock over the door. It says 19:01. "I\'ll get the next one."' },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
    D: { exit: 'metro_plaza', id: 'obj.chb_doors', art: 'obj.door', label: 'Back out to the campus walk', stepOn: true, pair: 'obj.campus_door', text: 'Out into the night.' },
    // ---- hub #68: the compute ----
    // Machine Room B: racks you walk round (scenery; each kind blinks at its own pace), two you can read, two coolers.
    R: { scenery: 'obj.server_rack', solid: true },
    r: { scenery: 'obj.server_rack', solid: true, anim: 610 },
    N: { scenery: 'obj.network_rack', solid: true, anim: 530 },
    O: { scenery: 'obj.crac_unit', solid: true, anim: 900 },
    K: { prop: 'obj.server_rack', id: 'obj.chb_rack', solid: true, label: 'Server rack',
      text: 'Forty-two slots, all full, every light green except one amber near the top. Beside it, a sticky note in a TA\'s handwriting: IT\'S FINE. IT\'S BEEN AMBER SINCE MARCH.' },
    L: { prop: 'obj.network_rack', id: 'obj.chb_network_rack', solid: true, label: 'Network rack',
      text: 'Forty-eight ports, forty-eight cables. A laminated chart on the door says which goes where. The chart is older than anyone who works here, so nobody unplugs anything.' },
    C: { prop: 'obj.crac_unit', id: 'obj.chb_cooling', solid: true, label: 'Cooling unit',
      text: 'A cooling unit the size of a wardrobe, running flat out: RETURN 31°C, SUPPLY 17°C. Six university hoodies hang from its handle, every size, for whoever comes in without one.' },
    I: { prop: 'obj.room_sign', id: 'obj.chb_machine_sign', tile: '=', label: 'Plaque',
      text: 'MACHINE ROOM B. THIS ROOM IS KEPT AT 17°C FOR THE COMFORT OF THE MACHINES. Somebody has scratched a line under MACHINES.' },
    X: { scenery: 'obj.boxes', solid: true },   // the storage room's surplus, still boxed
    // The terminal lab (north room): a row of terminals along the wall, two you can read.
    M: { scenery: 'obj.terminal_lit', solid: true, anim: 640, light: 0.35 },
    P: { prop: 'obj.terminal_lit', id: 'obj.chb_terminal_login', solid: true, light: 0.35, label: 'Terminal',
      text: 'A login prompt. Someone typed their username and stopped there. The cursor has been waiting for a password since 19:01.' },
    Y: { prop: 'obj.terminal_lit', id: 'obj.chb_terminal_queue', solid: true, light: 0.35, label: 'Terminal',
      text: 'The job queue. SIM_245_LAB3, WAITING, four hundred lines of it. Position in queue: 212. It moves up one place a night.' },
    // On the walls: cable trays along every hall, one you can read, and the building's own status board.
    H: { scenery: 'obj.cable_tray', floor: true, tile: '#' },
    U: { prop: 'obj.cable_tray', id: 'obj.chb_cable_tray', floor: true, tile: '#', label: 'Cable tray',
      text: 'A ladder tray bolted along the wall, so full of cable it sags between the brackets. A paper cup hangs off it on a twist tie, catching a drip from the coolant line. It is half full.' },
    B: { prop: 'obj.wall_display', id: 'obj.chb_status_board', tile: '#', light: 0.5, label: 'Status board',
      text: 'Amber letters crawl across it: COMPUTE HALL B. LOAD 99%. APPRENTICES IN BUILDING: 0. THANK YOU FOR SAVING ENERGY.' },
  },
}).exit('campus_quad', 12, 0, { id: 'obj.chb_quad_door', art: 'obj.door', label: 'Out to the quad', pair: 'obj.quad_chb', text: 'The back doors, out to the campus quad.' }).build();
