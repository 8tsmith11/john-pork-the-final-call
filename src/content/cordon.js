// The quarantine cordon as the edge of the Act 1 map (Michael via BagelMeister #506, task #36).
// Continuity has College Park fenced: chain-link along the tree line, a checkpoint on every road out
// (barriers, a booth, floodlights, warning signs) and troopers on the posts. Walking up to the edge gets
// a trooper's line, not a dialogue box. Drawn in code (src/game/cordon.js) until real sprites land.
// Pockets-and-zones canon is unchanged: this is the cordon around this pocket, tonight.
import { outbreakPhase } from './outbreak.js';

const T = (x, y, face, n) => ({ id: `cordon.trooper_${n}`, cordon: 'trooper', selfDrawn: true, x, y, face, label: 'Continuity trooper',
  text: 'Visor down, rifle across the chest, a red stripe on the shoulder. The helmet turns to follow you and nothing else moves.' });
const L = (x, y, n) => ({ id: `cordon.light_${n}`, cordon: 'light', selfDrawn: true, x, y, light: 1.0, label: 'Floodlight',
  text: 'A floodlight on a mast, humming. The beam sweeps the fence line and comes back to you.' });
const B = (x, y, n) => ({ id: `cordon.booth_${n}`, cordon: 'booth', selfDrawn: true, x, y, light: 0.6, label: 'Checkpoint booth',
  text: 'A white booth with a slot for papers. The screen inside shows College Park as one grey square, and a timer.' });
const S = (x, y, n) => ({ id: `cordon.sign_${n}`, cordon: 'sign', selfDrawn: true, x, y, label: 'Cordon notice',
  text: 'CONTINUITY CONTAINMENT ZONE. NO ENTRY. NO EXIT. Under it, in marker: "how long".' });

// College Park (metro_plaza, 84 x 52). Roads out: Route 1 north and south, the cross street west.
// The Paint Branch trail east stays open: the lake is inside the cordon.
export const PLAZA_CORDON = {
  // Tiles that become solid barrier ('='). The checkpoints sit a few rows inside the map edge (task #36, gonman's
  // half): past each barrier a short strip of road runs on to the edge, walled at the sides, and a few Code-rot-taken
  // are penned there, pushing at the line (`held` below).
  barriers: [
    [55, 4, 11, 1], [55, 1, 1, 2], [66, 1, 1, 2],      // north: across Route 1, and the pen's side walls
    [55, 47, 12, 1], [55, 48, 1, 3], [66, 48, 1, 3],   // south
    [4, 30, 1, 6], [1, 30, 3, 1], [1, 35, 3, 1],       // west: across the cross street
  ],
  objects: [
    // North checkpoint (Route 1)
    T(58, 5, 'down', 1), { ...T(63, 5, 'up', 2), out: true }, B(55, 5, 1), L(55, 1, 1), L(66, 1, 2), S(52, 1, 1),   // one turns you back; one faces out at what's held beyond (trevor's half of #36)
    // South checkpoint (Route 1 toward the wall)
    T(58, 46, 'up', 3), { ...T(63, 46, 'down', 4), out: true }, B(67, 46, 2), L(55, 50, 3), L(66, 50, 4), S(53, 50, 2),
    // West checkpoint (the cross street)
    T(5, 30, 'right', 5), { ...T(5, 35, 'left', 6), out: true }, L(1, 29, 5), L(1, 36, 6), S(3, 27, 3),
    // Along the fence
    L(20, 1, 7), L(40, 1, 8), S(30, 1, 4), L(82, 12, 9), T(81, 20, 'left', 7), S(82, 30, 5),
    L(20, 50, 10), L(45, 50, 11), T(28, 49, 'up', 8), S(36, 50, 6), L(1, 12, 12), T(2, 18, 'right', 9),
  ],
  openings: [[83, 40, 1, 1]],   // edge tiles that don't trigger the turn-back (the trail to the lake)
  // After the Call the cordon closes (task #38): more troopers on the posts and along the fence, and the
  // floodlights go red. Drawn only in that phase; not map objects (nothing to examine, nothing to reach).
  closing: [[59, 5, 'down'], [62, 5, 'down'], [59, 46, 'up'], [62, 46, 'up'], [5, 32, 'right'], [5, 33, 'right'],
    [12, 2, 'down'], [48, 2, 'down'], [75, 2, 'down'], [81, 8, 'left'], [81, 33, 'left'], [40, 49, 'up'], [12, 49, 'up'], [2, 8, 'right'], [2, 24, 'right']],
};

// After the Call (the cordon has closed). gonman owns these words; first drafts.
export const CORDON_LINES_AFTER = [   // gonman: after the Call the troopers are scared too, and it shows
  { en: 'Back inside. Now.', es: 'Adentro. Ya.' },
  { en: 'Phones off, hands where we can see them.', es: 'Teléfonos apagados, las manos a la vista.' },
  { en: 'We heard it ring too. Go home.', es: 'Nosotros también lo oímos sonar. Vuelva a casa.' },
  { en: 'The line was closed. Now it\'s closed harder.', es: 'La línea estaba cerrada. Ahora está más cerrada.' },
  { en: 'Step back or get tagged.', es: 'Retroceda o lo marcamos.' },
  { en: 'If it calls again, don\'t pick up.', es: 'Si vuelve a llamar, no atienda.' },
];

// What a trooper says when you walk up to the line. Short: it's read while walking.
// The outward-facing trooper at a checkpoint talks to the line, not to you (task #36: the blockades face outward).
export const CORDON_LINES_OUT = [
  { en: 'Hold the line. Hold it.', es: 'Mantengan la línea. Manténganla.' },
  { en: 'They\'re pushing again. Eyes front.', es: 'Están empujando otra vez. Vista al frente.' },
  { en: 'Don\'t look at them. Look at the barrier.', es: 'No los mire a ellos. Mire la barrera.' },
  { en: 'Civilian behind me. Nobody crosses either way.', es: 'Civil detrás de mí. Nadie cruza para ningún lado.' },
];

export const CORDON_LINES = [
  { en: 'Back from the line, citizen.', es: 'Atrás de la línea, ciudadano.' },
  { en: 'College Park is under review. Step back.', es: 'College Park está en revisión. Retroceda.' },
  { en: 'Nobody in, nobody out. Not tonight.', es: 'Nadie entra, nadie sale. Esta noche no.' },
  { en: 'Keep walking. The other way.', es: 'Siga caminando. Para el otro lado.' },
  { en: 'That\'s far enough.', es: 'Hasta ahí.' },
  { en: 'Scanning. You\'re on the list. Go home.', es: 'Escaneando. Está en la lista. Vuelva a casa.' },
];

// The line holding (Trevor: "more enemies, the guards shoot them, auto turrets and robots that hold them back, they
// should keep coming, like an invasion being held off"). Rules: src/engine/siege.js. The pens are the walled road
// strips beyond each barrier (task #36); they're kept topped up from off the map, a mix of rot forms, the big ones rare.
const MIX = [['enemy.rot_taken', 6], ['enemy.rot_crawler', 4], ['enemy.rot_graft', 3], ['enemy.rot_sprawl', 2, 2], ['enemy.rot_hulk', 1, 1]];
export const PLAZA_SIEGE = {
  id: 'plaza_line',
  pens: [
    { id: 'north', rect: [56, 1, 10, 3], front: 'down', keep: 10, mix: MIX },
    { id: 'south', rect: [56, 48, 10, 3], front: 'up', keep: 9, mix: MIX },
    { id: 'west', rect: [1, 31, 3, 4], front: 'right', keep: 6, mix: [['enemy.rot_taken', 6], ['enemy.rot_crawler', 5], ['enemy.rot_graft', 2], ['enemy.rot_sprawl', 1, 1]] },
  ],
  // Troopers marked drawn are the cordon's own out-facing posts (drawn by src/game/cordon.js); the rest are drawn by
  // src/game/siegeView.js. Robots stand in the pen mouth, right against the barrier.
  defenders: [
    { kind: 'trooper', at: [63, 5], pen: 'north', drawn: true }, { kind: 'trooper', at: [60, 6], pen: 'north' },
    { kind: 'turret', at: [56, 5], pen: 'north' }, { kind: 'turret', at: [65, 5], pen: 'north' },
    { kind: 'robot', at: [59, 3], pen: 'north' }, { kind: 'robot', at: [63, 3], pen: 'north' },
    { kind: 'trooper', at: [63, 46], pen: 'south', drawn: true }, { kind: 'trooper', at: [60, 45], pen: 'south' },
    { kind: 'turret', at: [56, 46], pen: 'south' }, { kind: 'turret', at: [65, 46], pen: 'south' },
    { kind: 'robot', at: [59, 48], pen: 'south' }, { kind: 'robot', at: [63, 48], pen: 'south' },
    { kind: 'trooper', at: [5, 35], pen: 'west', drawn: true }, { kind: 'trooper', at: [6, 32], pen: 'west' },
    { kind: 'turret', at: [5, 33], pen: 'west' }, { kind: 'robot', at: [3, 33], pen: 'west' },
  ],
};

/** For the sim: { mapId: spec }. After the Call the push is heavier (task #38: the cordon closes harder). */
export function siegesFor(flags = {}) {
  const after = outbreakPhase(flags) === 'after';
  const pens = PLAZA_SIEGE.pens.map((p) => after
    ? { ...p, keep: Math.round(p.keep * 1.4), mix: p.mix.map(([k, w, max]) => [k, w, max == null ? max : max + 1]) }
    : p);
  return { metro_plaza: { ...PLAZA_SIEGE, pens } };
}
