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

// ---- Regular coderot villains: every spawn gets a seeded variant (brief: "randomly created coderot
// villains"). Bounded tables keep them fair: stats move within safe ranges, traits are telegraphed.
const V_PREFIX = ['Stale', 'Forked', 'Leaky', 'Null', 'Looping', 'Orphan', 'Verbose', 'Deprecated', 'Cached', 'Unsigned', 'Zombie', 'Ghost'];
const V_NOUN = { 'enemy.rotling': ['Process', 'Daemon', 'Worker', 'Courier', 'Crawler'], 'enemy.spitter': ['Logger', 'Broadcaster', 'Echo', 'Spammer', 'Beacon'],
  'enemy.moth': ['Hold Queue', 'Lullaby', 'Muzak', 'Jingle', 'Waiting Room'], 'enemy.captcha': ['Verifier', 'Gatekeeper', 'Grid', 'Checkbox', 'Turnstile'], 'enemy.autocomplete': ['Suggestion', 'Predictor', 'Guess', 'Draft', 'Completion'] };
export const TRAITS = {
  plain:    { label: '', hp: 1, speed: 1 },
  sprinter: { label: 'fast', hp: 0.8, speed: 1.45 },
  armored:  { label: 'armored', hp: 1.6, speed: 0.8, armor: 0.3 },
  splitter: { label: 'splits', hp: 0.9, speed: 1 },
  puddler:  { label: 'leaks coderot', hp: 1, speed: 0.95 },
  blinker:  { label: 'blinks', hp: 0.85, speed: 1.05 },
};
const TINTS = [0x7fb069, 0xb3589c, 0x5fb3b3, 0xc9a227, 0x8f6fd1, 0xd07a5a];

export function rollVariant(seed, spawnKey, kind) {
  const r = makeStreams(seed)(`variant:${spawnKey}`);
  const trait = r.weighted([{ t: 'plain', w: 4 }, { t: 'sprinter', w: 2 }, { t: 'armored', w: 2 }, { t: 'splitter', w: 1.5 }, { t: 'puddler', w: 1.5 }, { t: 'blinker', w: 1 }]).t;
  return { name: `${r.pick(V_PREFIX)} ${r.pick(V_NOUN[kind] ?? ['Thing'])}`, trait, tint: r.pick(TINTS) };
}
