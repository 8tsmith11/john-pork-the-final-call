// The Green Line switchyard (Act 1 required puzzle). Three levers must match the hand-corrected yard
// settings. The settings are seeded per world; the three corrections are written in three places in
// the tunnel branches, so exploring is how you solve it (not "kill everything").
import { makeStreams } from '../engine/rng.js';

export const LEVERS = ['a', 'b', 'c'];

export function solution(seed) {
  const r = makeStreams(seed)('switchyard');
  return Object.fromEntries(LEVERS.map((k) => [k, r.pick(['left', 'right'])]));
}

// Clue text appended to existing objects, in three different hands.
export function clueFor(objId, sol, drained = false) {
  if (objId === 'obj.work_order') return `\n\nAt the bottom, in pencil: "Yard reset for pump access. A to the ${sol.a.toUpperCase()}. Don't touch B or C. -R."`;
  if (objId === 'obj.sunk_vending') return drained
    ? `\n\nWith the water down you can read what was scratched into the side, deep, like someone had time: "B ${sol.b === 'left' ? '<<<' : '>>>'}"`
    : '\n\nSomething is scratched into the side, below the waterline. You can see the marks but not read them. If the water were lower...';
  if (objId === 'obj.ledger') return `\n\nThe last entry isn't a name. In the same formal hand: "Lever C, set ${sol.c}, as it was when they stopped coming."`;
  return '';
}

export const YARD_MAP_TEXT = 'A yard diagram, corrected by hand, three times, in three different hands. The east gate only opens when all three switches agree with the corrections. Somebody wrote them down where they worked: the pump room, the flooded bay, the signal desk.';
