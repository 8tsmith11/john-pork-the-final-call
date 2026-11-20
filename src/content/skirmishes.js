// Where the ambient NPC fights happen (hub #69; rules: src/engine/skirmish.js). Each one belongs to a map and an
// outbreak phase, and once its machine falls it stays fallen (flag skirmish.<id>.over).
//
// College Park, before the Call: a Continuity abatement squad in the yard below ASTER, burning out a drone hub the Code rot
// has taken. It keeps launching rotted delivery drones at them (the rotling's lore: "it still thinks it is a delivery
// drone"). Worldbuilding: Continuity's answer to the rot is guns and tape, and the street is used to it.
import { outbreakPhase } from './outbreak.js';

export const SKIRMISHES = [
  {
    id: 'cp_drone_hub', map: 'metro_plaza', phases: ['before'], husk: ['after', 'contained'],   // after the Call only the burned husk is left
    area: [13, 22, 9, 6],            // the south-east of the garden below ASTER, clear of its gate and of Mrs. Okafor (gonman)
    machine: [20, 25],               // the rotted hub, east end
    troopers: [[14, 23], [15, 24], [14, 25], [15, 26]],   // a firing line at the west end
    label: 'Abatement in progress', labelEs: 'Saneamiento en curso',
    lines: [
      { en: 'Abatement in progress. Back behind the tape.', es: 'Saneamiento en curso. Atrás de la cinta.' },
      { en: 'Keep moving, citizen. Nothing to see.', es: 'Siga caminando, ciudadano. No hay nada que ver.' },
      { en: 'Drone left! Drone left!', es: '¡Dron a la izquierda! ¡Dron a la izquierda!' },
      { en: 'Hub\'s still hot. Keep pouring it on.', es: 'El nodo sigue caliente. Sigan dándole.' },
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
    if (s.phases.includes(phase)) out[s.map] = { ...s, over: !!flags[`skirmish.${s.id}.over`] };
    else if (s.husk?.includes(phase)) out[s.map] = { ...s, over: true };   // burned out by morning, seen or not
  }
  return out;
}
export const skirmishById = (id) => SKIRMISHES.find((s) => s.id === id);
