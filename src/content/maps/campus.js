// The campus (atlas ring one). Built with the level builder from the brainstorm grid in
// docs/design/levels/compute_hall_b.md; lines, prop art and the TA's secret line from the polish pass (hub #30,
// gonman). Spanish: src/i18n/es-plaza.js.
// Secret: once the autograder is down (side.autograder), the TA stops grading for one night.
import { fromGrid } from './builder.js';

export const computeHallB = fromGrid({
  id: 'compute_hall_b', name: 'Compute Hall B', fill: '.',
  rows: [
    '############################',
    '#AAAAAA#..........#........#',
    '#A?AA!A#..........#..T.....#',
    '#AAAAAA#..E.......#........#',
    '#AAAAAA####.###...####.#####',
    '#......................E...#',
    '####.#######.......#########',
    '#......#...........#.......#',
    '#..S...#...........#..$....#',
    '#......#....E......#.......#',
    '#......#...........#.......#',
    '####.###...........###.#####',
    '#..........................#',
    '#.....@.......E............#',
    '#..........................#',
    '###########DD###############',
  ],
  legend: {
    A: { tile: 'e' },
    '?': { prop: 'obj.workbench', id: 'obj.chb_bench', tile: 'e', label: 'Lab bench (245)', text: 'Manuel\'s bench in 245. Under a dust cover, a head in grey clay, half finished, the ears marked in pencil much lower than you\'d guess. Taped to the cover, in his writing: NO TOCAR. Under it, in English: THIS MEANS YOU.' },
    '!': { prop: 'obj.solder', id: 'obj.chb_bench_2', tile: 'e', label: 'Lab bench', text: 'Somebody\'s project, dropped mid-solder. The iron is still plugged in. It\'s still hot.' },
    $: { prop: 'obj.crate', id: 'obj.chb_storage', label: 'Storage crate', loot: 'parts', text: 'DEPT. SURPLUS, stenciled on the side over an older stencil that says DO NOT DISCARD.' },
    T: { npc: 'npc.chb_ta', art: 'npc.rotter_2', label: 'TA, still grading',
      text: '"Office hours are on the door. I changed them to whenever I\'m here, which is always." She initials a quiz without reading it and pulls the next one off the stack.',
      later: [{ if: 'boss.chb_autograder.down', text: 'For once she isn\'t grading. Half a sandwich on a paper bag. "Nobody upstairs knows the autograder\'s gone yet. Give me one night before they make me grade by hand."' }] },
    S: { npc: 'npc.chb_student', art: 'npc.rotter_1', label: 'Student, stuck', text: '"The doors here only unlock on the hour." He checks the clock over the door. It says 19:01. "I\'ll get the next one."' },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
    D: { exit: 'metro_plaza', id: 'obj.chb_doors', art: 'obj.door', label: 'Back out to the campus walk', stepOn: true, pair: 'obj.campus_door', text: 'Out into the night.' },
  },
}).exit('campus_quad', 12, 0, { id: 'obj.chb_quad_door', art: 'obj.door', label: 'Out to the quad', pair: 'obj.quad_chb', text: 'The back doors, out to the campus quad.' }).build();
