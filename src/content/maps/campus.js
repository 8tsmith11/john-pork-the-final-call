// The campus (atlas ring one). [SCAFFOLD] built with the level builder from the brainstorm grid in
// docs/design/levels/compute_hall_b.md. Lines marked "[scaffold]" are placeholders for the polish pass (gonman).
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
    '?': { prop: 'obj.table', id: 'obj.chb_bench', tile: 'e', label: 'Lab bench (245)', text: '[scaffold] Manuel\'s bench in 245. A half-finished head sculpt under a dust cover, ears marked lower than you\'d think.' },
    '!': { prop: 'obj.table', id: 'obj.chb_bench_2', tile: 'e', label: 'Lab bench', text: '[scaffold] Somebody\'s project, abandoned mid-solder. The iron is still plugged in.' },
    $: { prop: 'obj.crate', id: 'obj.chb_storage', label: 'Storage crate', loot: 'parts', text: '[scaffold] Department surplus. Nobody has inventoried it since the review.' },
    T: { npc: 'npc.chb_ta', art: 'npc.rotter_2', label: 'TA, still grading', text: '[scaffold] "Office hours are posted. They\'re now. They\'re always now."' },
    S: { npc: 'npc.chb_student', art: 'npc.rotter_1', label: 'Student, stuck', text: '[scaffold] "The doors only unlock on the hour. I\'ve been here since the eleven o\'clock."' },
    E: { enemy: 'enemy.rotling' },
    '@': { spawn: true },
    D: { exit: 'metro_plaza', id: 'obj.chb_doors', art: 'obj.door', label: 'Back out to the campus walk', stepOn: true, pair: 'obj.campus_door', text: 'Out into the night.' },
  },
}).exit('campus_quad', 12, 0, { id: 'obj.chb_quad_door', art: 'obj.door', label: 'Out to the quad', pair: 'obj.quad_chb', text: 'The back doors, out to the campus quad.' }).build();
