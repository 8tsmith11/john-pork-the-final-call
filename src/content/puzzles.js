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
].map(definePuzzle);

/** The puzzle a map object belongs to, if any. */
export const puzzleFor = (objId) => PUZZLES.find((p) => p.parts.includes(objId));
