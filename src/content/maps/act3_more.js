// Act 3 sub-areas, [SCAFFOLD] batch (Trevor: "this game must be much larger scale"). Text grids with the level
// builder; every "[scaffold]" line comes from the atlas's "To find" / "People" (docs/design/02-world-atlas.md).
// Named characters (the Meade's people, the Director) are deliberately not placed: that's the lore gate's.
import { fromGrid } from './builder.js';

const out = (to, id, label, road = false) => ({ exit: to, id: `obj.${id}_out`, pair: `obj.${to}_to_${id}`, ...(road ? { selfDrawn: true } : { art: 'obj.door' }), label, stepOn: true, text: 'Back outside.' });

// ---- The Corridor: a sealed hall, written off, still drawing power, still running something ----
export const corSealed = fromGrid({
  id: 'cor_sealed', name: 'A sealed hall', fill: 'e', act: 3,
  rows: [
    '##############################',
    '#eeeeeeeeeeeeeeeeeeeeeeeeeeee#',
    '#e$$$$$$$$ee$$$$$$$$ee$$$$$ee#',
    '#eeeeeeeeeeeeeeeeeeeeeeeeeeee#',
    '#e$$$$$$$$ee$$$$$$$$ee$$$$$ee#',
    '#eeeEeeeeeeeeeeeEeeeeeeeeeE?e#',
    '#e$$$$$$$$ee$$$$$$$$ee$$$$$ee#',
    '#eeeeeeeeeeeee@eeeeeeeeeeeeee#',
    '##############DD##############',
  ],
  legend: {
    $: { scenery: 'obj.crate', solid: true, tile: 'e' },
    '?': { prop: 'obj.board', id: 'obj.cor_meters', label: 'Water meters', text: '[scaffold] Water meters, spinning. A hall nobody runs, drinking a river nobody owns anymore.' },
    E: { enemy: 'enemy.autocomplete' },
    '@': { spawn: true },
    D: out('corridor', 'cor_sealed', 'Back out the loading dock'),
  },
}).build();

// ---- Gaithersburg: the clock vault (the master clock; a logbook of leap seconds) ----
export const gtClockroom = fromGrid({
  id: 'gt_clockroom', name: 'The clock vault', fill: 'e', act: 3,
  rows: [
    '######################',
    '#eeeeeeeeeeeeeeeeeeee#',
    '#eeeeeeeeCCeeeeeeeeee#',
    '#eeeeeeeeCCeeeeeeeLee#',
    '#eeeeeeeeeeeeeeeeeeee#',
    '#eeeEeeeeeNeeeeeeEeee#',
    '#eeeeeeeee@eeeeeeeeee#',
    '##########DD##########',
  ],
  legend: {
    C: { scenery: 'obj.degasser', solid: true, tile: 'e' },
    L: { prop: 'obj.board', id: 'obj.gt_leapseconds', label: 'Leap-second logbook', text: '[scaffold] A logbook of leap seconds, in pen. The last entry is in a different hand, and it is wrong.' },
    N: { npc: 'npc.gt_timekeeper', art: 'npc.rotter_1', label: 'A timekeeper', text: '[scaffold] "Every faction needs to know what time it is. So nobody shoots us. Yet."' },
    E: { enemy: 'enemy.moth' },
    '@': { spawn: true },
    D: out('gaithersburg', 'gt_clockroom', 'Back up to the lab'),
  },
}).build();

// ---- Frederick: the switchyard, like a steel forest, mountains behind ----
export const frSwitchyard = fromGrid({
  id: 'fr_switchyard', name: 'The switchyard', fill: ',', outdoor: true, act: 3,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'T,ss,ss,ss,ss,ss,ss,ss,ss,ss,,,T',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,?,,T',
    'T,ss,ss,ss,,,,,,,,,ss,ss,ss,,,,T',
    'T,,,,,,,,,,,E,,,,,,,,,,,,,,,,,,T',
    'T,ss,ss,ss,,,,,,,,,ss,ss,ss,,E,T',
    'D,,@,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    s: { scenery: 'obj.degasser', solid: true, tile: ',' },
    '?': { prop: 'obj.board', id: 'obj.fr_dashboard_room', label: 'A control hut', text: '[scaffold] A room where, once, a team laughed at a dashboard. The chairs are still pushed back.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    D: { ...out('frederick', 'fr_switchyard', 'Back to town', true), tile: ',' },
  },
}).build();

// ---- The Enclave: the national archive (parchment, which nothing can rot) ----
export const enArchive = fromGrid({
  id: 'en_archive', name: 'The national archive', fill: '.', act: 3,
  rows: [
    '########################',
    '#......................#',
    '#..==..==..P...==..==..#',
    '#......................#',
    '#..==..==......==..==..#',
    '#..........N...........#',
    '#.....E..........E.....#',
    '#..........@...........#',
    '###########DD###########',
  ],
  legend: {
    P: { prop: 'obj.board', id: 'obj.en_parchment', label: 'The original documents', text: '[scaffold] On parchment, under glass. Nothing can rot them. Everyone who comes here checks.' },
    N: { npc: 'npc.en_functionary', art: 'npc.rotter_2', label: 'A functionary', text: '[scaffold] "Attested visitors only. You are... attested? Good. Don\'t tell me if you\'re not."' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    D: out('enclave', 'en_archive', 'Back out to the mall'),
  },
}).build();

// ---- The Meade, inside (Act 3): black glass, analysts who haven't been home, a list on a wall ----
export const meadeInside = fromGrid({
  id: 'meade_inside', name: 'The Meade, inside', fill: 'e', act: 3,
  rows: [
    '############################',
    '#eeeeeeee#eeeeeeeee#eeeeeee#',
    '#e??e??ee#eeeeWeeee#eeQeeee#',
    '#eeeeeeee#eeeeeeeee#eeeeeee#',
    '#e??e??eeeeeeeeeeeeeeeeeeee#',
    '#eeeeeeee#eeeeeeeee#eeeeeee#',
    '#eeeEeeee#eeeeNeeee#eeeeEee#',
    '#eeeeeeeeeeeee@eeeeeeeeeeee#',
    '##############DD############',
  ],
  legend: {
    '?': { scenery: 'obj.table', solid: true, tile: 'e' },
    W: { prop: 'obj.board', id: 'obj.md_the_wall', label: 'The wall', text: '[scaffold] A list on a wall. [polish: the lore gate decides what is on it]' },
    Q: { prop: 'obj.crate', id: 'obj.md_intercepts', label: 'Intercepts', text: '[scaffold] Intercepts of calls nobody should have been able to record.' },
    N: { npc: 'npc.md_analyst', art: 'npc.rotter_3', label: 'An analyst', text: '[scaffold] "I haven\'t been home in years. I keep meaning to check if it\'s still there."' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    D: out('meade', 'meade_inside', 'Back out to the perimeter'),
  },
}).build();
