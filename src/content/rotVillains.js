// Procedural coderot villains (variety layer, never story-critical). Curated tables keep results
// coherent; the world seed's `rotVillains` stream picks from them.
import { makeStreams } from '../engine/rng.js';

const TITLES = ['DEPRECATED', 'ORPHANED', 'UNSIGNED', 'NULL', 'LEGACY', 'STALE', 'FORKED', 'UNPATCHED', 'VERBOSE', 'RECURSIVE'];
const NOUNS = ['SAINT', 'WIDOW', 'WARDEN', 'CHOIR', 'DEACON', 'MOTHER', 'USHER', 'TENANT', 'COURIER', 'LANDLORD'];
const EPITHETS = ['of the Green Line', 'Who Still Bills', 'of Platform Zero', 'Who Forgot Its Name', 'of 1901', 'Who Answers Wrong'];
const COLORS = [0x7fb069, 0xb3589c, 0x5fb3b3, 0xc9a227, 0x8f6fd1];

// Behavior modules the boss AI understands (src/engine/sim.js _stepBoss).
export const MODULES = ['ring', 'charge', 'summon', 'spray', 'blink'];

export function generateWarden(seed, playerCount = 1) {
  const r = makeStreams(seed)('rotVillains');
  const mods = r.shuffle(MODULES).slice(0, 2);
  return {
    name: `${r.pick(TITLES)} ${r.pick(NOUNS)}`,
    epithet: r.pick(EPITHETS),
    color: r.pick(COLORS),
    modules: mods,                       // phase 1 uses mods[0]; phase 2 adds mods[1]; phase 3 overloads
    maxHp: 360 + 180 * Math.max(0, playerCount - 1),
    radius: 11, speed: 34, damage: 14,
  };
}
