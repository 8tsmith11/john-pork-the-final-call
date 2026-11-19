// The quarantine cordon as the edge of the Act 1 map (Michael via BagelMeister #506, task #36).
// Continuity has College Park fenced: chain-link along the tree line, a checkpoint on every road out
// (barriers, a booth, floodlights, warning signs) and troopers on the posts. Walking up to the edge gets
// a trooper's line, not a dialogue box. Drawn in code (src/game/cordon.js) until real sprites land.
// Pockets-and-zones canon is unchanged: this is the cordon around this pocket, tonight.

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
  barriers: [[58, 1, 6, 1], [58, 50, 6, 1], [1, 31, 1, 4]],   // tiles that become solid barrier ('=')
  objects: [
    // North checkpoint (Route 1)
    T(57, 2, 'down', 1), T(64, 2, 'down', 2), B(54, 2, 1), L(55, 1, 1), L(66, 1, 2), S(52, 1, 1),
    // South checkpoint (Route 1 toward the wall)
    T(57, 49, 'up', 3), T(64, 49, 'up', 4), B(67, 49, 2), L(55, 50, 3), L(66, 50, 4), S(53, 50, 2),
    // West checkpoint (the cross street)
    T(2, 30, 'right', 5), T(2, 35, 'right', 6), L(1, 29, 5), L(1, 36, 6), S(3, 27, 3),
    // Along the fence
    L(20, 1, 7), L(40, 1, 8), S(30, 1, 4), L(82, 12, 9), T(81, 20, 'left', 7), S(82, 30, 5),
    L(20, 50, 10), L(45, 50, 11), T(28, 49, 'up', 8), S(36, 50, 6), L(1, 12, 12), T(2, 18, 'right', 9),
  ],
  openings: [[83, 40, 1, 1]],   // edge tiles that don't trigger the turn-back (the trail to the lake)
  // After the Call the cordon closes (task #38): more troopers on the posts and along the fence, and the
  // floodlights go red. Drawn only in that phase; not map objects (nothing to examine, nothing to reach).
  closing: [[59, 3, 'down'], [62, 3, 'down'], [59, 48, 'up'], [62, 48, 'up'], [3, 32, 'right'], [3, 33, 'right'],
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
export const CORDON_LINES = [
  { en: 'Back from the line, citizen.', es: 'Atrás de la línea, ciudadano.' },
  { en: 'College Park is under review. Step back.', es: 'College Park está en revisión. Retroceda.' },
  { en: 'Nobody in, nobody out. Not tonight.', es: 'Nadie entra, nadie sale. Esta noche no.' },
  { en: 'Keep walking. The other way.', es: 'Siga caminando. Para el otro lado.' },
  { en: 'That\'s far enough.', es: 'Hasta ahí.' },
  { en: 'Scanning. You\'re on the list. Go home.', es: 'Escaneando. Está en la lista. Vuelva a casa.' },
];
