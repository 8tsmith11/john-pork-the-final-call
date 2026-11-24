// Where the ambient NPC fights happen (hub #69; rules: src/engine/skirmish.js). Each one belongs to a map and an
// outbreak phase, and once its machine falls it stays fallen (flag skirmish.<id>.over).
//
// College Park, before the Call: a Continuity abatement squad in the yard below ASTER, burning out a drone hub the Code rot
// has taken. It keeps launching rotted delivery drones at them (the rotling's lore: "it still thinks it is a delivery
// drone"). Worldbuilding: Continuity's answer to the rot is guns and tape, and the street is used to it.
import { outbreakPhase } from './outbreak.js';

export const SKIRMISHES = [
  {
    id: 'cp_drone_hub', map: 'metro_plaza', phases: ['before'], huskPhases: ['after', 'contained'],   // after the Call only the burned husk is left
    machine: [20, 25],               // where it starts: the garden below ASTER
    // Where it walks (Trevor: it moves, on legs, and the fight isn't boxed in): the garden, the street past the
    // building, the plaza's paths, and back. It plants at each stop to launch drones.
    route: [[20, 25], [10, 22], [19, 21], [29, 26], [39, 22], [46, 22], [39, 15], [30, 21]],
    troopers: [[14, 23], [15, 24], [14, 25], [15, 26]],   // the squad starts west of it and moves with it
    label: 'Abatement in progress', labelEs: 'Saneamiento en curso',
    labelOver: 'Abatement complete', labelOverEs: 'Saneamiento completado',   // the squad standing down, before the Call
    // After the Call: no squad, no sign, no lines; just the burned husk inside torn tape.
    lines: [
      { en: 'Abatement in progress. Back behind the tape.', es: 'Saneamiento en curso. Atrás de la cinta.' },
      { en: 'Keep moving, citizen. Nothing to see.', es: 'Siga caminando, ciudadano. No hay nada que ver.' },
      { en: 'Drone left! Drone left!', es: '¡Dron a la izquierda! ¡Dron a la izquierda!' },
      { en: 'Hub\'s still hot. Keep pouring it on.', es: 'El nodo sigue caliente. Sigan dándole.' },
      { en: 'You want to help? Stay out of the ring when it rises.', es: '¿Quiere ayudar? Salga del círculo cuando se levante.' },
      { en: 'It\'s moving again! Keep the line on it!', es: '¡Se está moviendo otra vez! ¡Mantengan la línea encima!' },
    ],
    linesOver: [
      { en: 'Hub\'s cold. Log it and move on.', es: 'El nodo se apagó. Regístrenlo y sigan.' },
      { en: 'Area\'s clear. Still closed. Go home.', es: 'Zona despejada. Sigue cerrada. Vuelva a casa.' },
    ],
  },
];

/** For the sim: { mapId: spec } for the current phase, with `over` set for fights already finished. */
export function skirmishesFor(flags = {}) {
  const phase = outbreakPhase(flags), out = {};
  for (const s of SKIRMISHES) {
    // Where it fell (if it did), so the husk lies there on later visits.
    const fell = typeof flags[`skirmish.${s.id}.fell`] === 'string' ? flags[`skirmish.${s.id}.fell`].split(',').map(Number) : null;
    const at = fell?.length === 2 && fell.every(Number.isFinite) ? { fell } : {};
    if (s.phases.includes(phase)) out[s.map] = { ...s, ...at, husk: false, over: !!flags[`skirmish.${s.id}.over`] };
    else if (s.huskPhases?.includes(phase)) out[s.map] = { ...s, ...at, over: true, husk: true };   // burned out by morning, seen or not
  }
  return out;
}
export const skirmishById = (id) => SKIRMISHES.find((s) => s.id === id);
