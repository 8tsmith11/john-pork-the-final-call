// Harder road to the Warden (task #33, Michael via BagelMeister #503): the rolling gate to the platform
// is held three ways, and each puzzle points at the next.
//   1. The switchyard (src/content/switchyard.js): the yard has to agree with the hand corrections.
//   2. The breaker panel in the signal room: four breakers, set to a pattern written in two halves,
//      one inside the pump-room locker and one carved into the signal room's chair.
//   3. Three signal lamps on the approach: the colours only show on the departure board once the
//      breakers have power.
// Patterns are seeded per world, like the switchyard. Text comes in EN and ES (the clues are built
// from parts, so they are translated here rather than by exact-match tr()).
import { makeStreams } from '../engine/rng.js';

export const BREAKERS = ['1', '2', '3', '4'];
export const LAMPS = ['1', '2', '3'];
export const LAMP_COLORS = ['red', 'amber', 'green'];
export const GATE_FLAG = 'act1.tunnel.gate';

/** The breaker pattern for this world: never all down (the starting state) and never all up. */
export function breakerTarget(seed) {
  const r = makeStreams(seed)('breakers');
  const t = Object.fromEntries(BREAKERS.map((k) => [k, r.pick(['up', 'down'])]));
  if (BREAKERS.every((k) => t[k] === 'down')) t[r.pick(BREAKERS)] = 'up';
  if (BREAKERS.every((k) => t[k] === 'up')) t[r.pick(BREAKERS)] = 'down';
  return t;
}

/** The lamp colours for this world: never all red (the starting state). */
export function lampTarget(seed) {
  const r = makeStreams(seed)('signal-lamps');
  const t = Object.fromEntries(LAMPS.map((k) => [k, r.pick(LAMP_COLORS)]));
  if (LAMPS.every((k) => t[k] === 'red')) t[r.pick(LAMPS)] = r.pick(['amber', 'green']);
  return t;
}

export const breakerState = (flags, k) => flags[`act1.breaker.${k}`] ?? 'down';
export const lampState = (flags, k) => flags[`act1.siglamp.${k}`] ?? 'red';
export const breakersSet = (flags, seed) => { const t = breakerTarget(seed); return BREAKERS.every((k) => breakerState(flags, k) === t[k]); };
export const lampsSet = (flags, seed) => { const t = lampTarget(seed); return LAMPS.every((k) => lampState(flags, k) === t[k]); };
export const gateOpen = (flags, seed) => !!flags['act1.switchyard.solved'] && breakersSet(flags, seed) && lampsSet(flags, seed);

const UPDN = { en: { up: 'UP', down: 'DOWN' }, es: { up: 'ARRIBA', down: 'ABAJO' } };
const COL = { en: { red: 'RED', amber: 'AMBER', green: 'GREEN' }, es: { red: 'ROJO', amber: 'ÁMBAR', green: 'VERDE' } };

/** Clue text appended to existing objects (lang: 'en' | 'es'). */
export function puzzleClue(objId, seed, flags, lang = 'en') {
  const L = lang === 'es' ? 'es' : 'en', b = breakerTarget(seed), u = UPDN[L];
  if (objId === 'obj.locker') return L === 'es'
    ? `\n\nPegada dentro de la puerta, una tira de cinta de pintor: "TABLERO DEL PORTÓN ESTE. 1 ${u[b[1]]}, 2 ${u[b[2]]}."`
    : `\n\nTaped inside the door, a strip of masking tape: "EAST GATE PANEL. 1 ${u[b[1]]}, 2 ${u[b[2]]}."`;
  if (objId === 'obj.signal_chair') return L === 'es'
    ? `\n\nTallado en el asiento, chiquito: "3 ${u[b[3]]}, 4 ${u[b[4]]}. Después el tablero despierta."`
    : `\n\nCarved into the seat, small: "3 ${u[b[3]]}, 4 ${u[b[4]]}. Then the board wakes up."`;
  if (objId === 'obj.departures' && breakersSet(flags, seed)) {
    const t = lampTarget(seed), c = COL[L], seq = LAMPS.map((k) => c[t[k]]).join(' · ');
    return L === 'es'
      ? `\n\nCon corriente, el tablero despierta de verdad por primera vez en años: ANDÉN 0 · SEÑALES ${seq} · ESPERE AUTORIZACIÓN.`
      : `\n\nWith power, the board wakes up properly for the first time in years: PLATFORM 0 · SIGNALS ${seq} · HOLD FOR CLEARANCE.`;
  }
  return '';
}

/** What a breaker or lamp says when you throw it. */
export function toggleText(kind, k, state, lang = 'en') {
  const L = lang === 'es' ? 'es' : 'en';
  if (kind === 'breaker') return L === 'es' ? `Disyuntor ${k}: ${UPDN.es[state]}` : `Breaker ${k}: ${UPDN.en[state]}`;
  return L === 'es' ? `Señal ${k}: ${COL.es[state]}` : `Signal ${k}: ${COL.en[state]}`;
}

export const STEP_TEXT = {
  switchyard: { en: 'Somewhere east, something heavy shifts in its track. The yard agrees now. The gate still has power off and its signals at red.', es: 'En algún lugar al este, algo pesado se corre en su riel. El patio ya coincide. El portón sigue sin corriente y con las señales en rojo.' },
  breakers: { en: 'The panel hums. Down the corridor, the departure board flickers awake.', es: 'El tablero zumba. Por el pasillo, el tablero de salidas parpadea y despierta.' },
  lamps: { en: 'The three signals hold their colours.', es: 'Las tres señales mantienen sus colores.' },
  gate: { en: 'Yard, power, signals. At the east end the rolling gate unlocks and rolls back. The way to the platform is open.', es: 'Patio, corriente, señales. Al fondo, el portón corredizo se destraba y se abre. El camino al andén está libre.' },
};
