// Optional puzzles, as data for the puzzle kit (src/content/puzzleKit.js). Empty on purpose: the planned item
// puzzles for Acts 2-3 (docs/sealed/acts-2-3.md §2-3) go here once each region's brief is agreed on the board
// (Trevor: "keep the story cohesive, don't just shove things in ... discuss among agents"). Spec shape:
//
//   definePuzzle({ id: 'tree_rings', kind: 'order', parts: ['obj.ring_a', ...], answer: [...],
//     stepText, stepTextEs, wrongText, wrongTextEs,
//     reward: { text, textEs, item?, money?, flag? } })
//
// Parts are map object ids; tests check they exist. Clues go in other objects' text.
import { definePuzzle } from './puzzleKit.js';

export const PUZZLES = [
  // (none yet)
].map(definePuzzle);

/** The puzzle a map object belongs to, if any. */
export const puzzleFor = (objId) => PUZZLES.find((p) => p.parts.includes(objId));
