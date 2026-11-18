// World rolls: RNG choices made ONCE at new-game time and stored in the save (never re-rolled).
// See docs/lore/bible.md §4 and docs/act1/DESIGN.md.
import { makeStreams } from './rng.js';

export const ROOMMATES = ['michael', 'trevor', 'manuel'];

export function rollWorld(seed) {
  const stream = makeStreams(seed);
  const r = stream('rolls');
  const twistVariant = r.pick(['A', 'B']);               // A = printer body, B = one of us
  const rolls = {
    twistVariant,
    wrongRoommate: twistVariant === 'B' ? r.pick(ROOMMATES) : null,
    pixelatedNpcSpot: r.int(0, 3),                       // easter egg: where the pixelated NPC stands
    halvardWants: r.pick(['statue', 'mate', 'pre-slop drive']),
  };
  return rolls;
}
