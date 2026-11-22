// Optional puzzles, as data for the puzzle kit (src/content/puzzleKit.js): the planned item puzzles for Acts 2-3
// (docs/sealed/acts-2-3.md §2-3), built in the lore gate's order (docs/sealed/scaffold-cohesion.md §7.2, hub #116).
// Each one grows out of a scaffold side quest, which is now its first stage (src/content/sideQuests.js, `puzzle:`):
// the giver sends you to look, the look shows you the puzzle, and the giver hears about it once it's solved.
// Spec shape:
//
//   definePuzzle({ id: 'tree_rings', kind: 'order', parts: ['obj.ring_a', ...], answer: [...],
//     stepText, stepTextEs, wrongText, wrongTextEs,
//     reward: { text, textEs, item?, money?, flag? } })
//
// Parts are map object ids; tests check they exist. Clues go in other objects' text, never in the part's own.
// The kit prints a cycle part's state as it is in `states`, in both languages, so states are marks that need no
// translating (digits, a pan's letter, a stop stamped on a collar).
import { definePuzzle, cycleWindow } from './puzzleKit.js';

export const PUZZLES = [
  // ---- Annapolis: the bell with no church (timed). The almanac's last correction says to ask the bell; the tide
  // board on the last piling says what the almanac swears. The reward is the island's trust (the solved flag) and
  // a boat upgrade with no boat: M2.5 keeps the boat.
  { id: 'ann_bell', kind: 'timed', parts: ['obj.ann_pier_bell'], window: cycleWindow(100, 25, 60),
    closedText: 'You ring it. The water sits under the red line, where the almanac says it stays, and the bay keeps the sound. The tide here turns when it likes. It likes to make people wait.',
    closedTextEs: 'La tocas. El agua está debajo de la línea roja, donde el almanaque dice que se queda, y la bahía se guarda el sonido. Acá la marea cambia cuando quiere. Le gusta hacer esperar.',
    solvedText: 'You let it hang. They heard you the first time.',
    solvedTextEs: 'La dejas quieta. Te oyeron la primera vez.',
    reward: { item: 'item.ann_oarlocks',
      text: 'The water is over the red line, which the almanac swears it can\'t be. You ring. This time the island answers: seven, a long gap, one. Before the last one fades there is a skiff alongside, and a woman in it who doesn\'t tie up. "You ring like family." She hands up a pair of bronze oarlocks. "For when you have something to put them on." (Bronze oarlocks)',
      textEs: 'El agua está por encima de la línea roja, cosa que el almanaque jura que no puede pasar. Tocas. Esta vez la isla contesta: siete, un hueco largo, una. Antes de que se apague la última hay un esquife al costado, y en él una mujer que no amarra. "Tocas como de la familia." Te alcanza un par de toletes de bronce. "Para cuando tengas dónde ponerlos." (Toletes de bronce)' } },

  // ---- Gaithersburg: the empty cradle (cycle + check). Each weight's peg steps 0 (its cradle) -> A -> B (the
  // comparator's pans). The comparator's card says what a closure is; the logbook says how it has closed since the
  // kilogram went out. Pays the party a standing +1 on every ability check (abilities.js, checkBonus).
  { id: 'gt_cradle', kind: 'cycle', parts: ['obj.gt_weight_500', 'obj.gt_weight_200', 'obj.gt_weight_200b', 'obj.gt_weight_100'], states: ['0', 'A', 'B'],
    check: (st) => { const g = [500, 200, 200, 100], on = (pan) => st.reduce((n, s, i) => n + (s === pan ? g[i] : 0), 0); return !st.includes('0') && on('A') === on('B'); },
    stepText: 'You move it with the forceps. Its peg on the tally board now sits at {state}. The beam is not level, or not everything is on it.',
    stepTextEs: 'La mueves con las pinzas. Su clavija en el tablero ahora está en {state}. La balanza no está nivelada, o no está todo arriba.',
    solvedText: 'Every peg is on the board and the beam is level. You leave it alone.',
    solvedTextEs: 'Todas las clavijas están en el tablero y la balanza está nivelada. No la tocas.',
    reward: {
      text: 'Its peg goes on the board, and the beam comes level and stays there. For once something in this building agrees with itself. You stand and watch it not move for a while. It is steadying. (+1 to every ability check, from now on)',
      textEs: 'Su clavija queda en el tablero, y la balanza se nivela y ahí se queda. Por una vez algo en este edificio está de acuerdo consigo mismo. Te quedas un rato mirando cómo no se mueve. Tranquiliza. (+1 a todas las pruebas de habilidad, desde ahora)' } },

  // ---- The refuge: tree rings (order). Push the pegs in the order the flagged years happened. The widths, the
  // tower's own slice and the fifth round's pencil note give the order; the fifth round's flag is the lie, and it
  // has no peg, so it is no part.
  { id: 'rf_rings', kind: 'order', parts: ['obj.rf_ring_phones', 'obj.rf_ring_clocks', 'obj.rf_ring_silence', 'obj.rf_ring_vote'],
    answer: ['obj.rf_ring_clocks', 'obj.rf_ring_vote', 'obj.rf_ring_phones', 'obj.rf_ring_silence'],
    stepText: 'You push the peg. It goes in and stays. ({n} of {total})',
    stepTextEs: 'Empujas la clavija. Entra y se queda. ({n} de {total})',
    wrongText: 'You push the peg. It slides back out, and so do the others. Wood keeps the order it grew in.',
    wrongTextEs: 'Empujas la clavija. Vuelve a salir, y las otras también. La madera guarda el orden en que creció.',
    solvedText: 'All four pegs are in. The tree has said what it knows.',
    solvedTextEs: 'Las cuatro clavijas están adentro. El árbol ya dijo lo que sabe.',
    reward: { item: 'item.analog_axe',
      text: 'The last peg goes in. Under the tower\'s first landing a wooden bar drops out of its slot, and a locker door swings open on leather hinges. Inside hangs an axe, oiled, with a paper flag of its own: "for whoever can tell the years apart." (Analogist felling axe)',
      textEs: 'Entra la última clavija. Debajo del primer descanso de la torre, una tranca de madera cae de su ranura, y la puerta de un armario se abre sobre bisagras de cuero. Adentro cuelga un hacha, aceitada, con su propia banderita de papel: "para quien sepa distinguir los años." (Hacha de tala analogista)' } },
].map(definePuzzle);

/** The puzzle a map object belongs to, if any. */
export const puzzleFor = (objId) => PUZZLES.find((p) => p.parts.includes(objId));
