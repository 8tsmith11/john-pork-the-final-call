// Procedural coderot villains (variety layer, never story-critical). Curated tables keep results
// coherent; the world seed's `rotVillains` stream picks from them.
import { makeStreams } from '../engine/rng.js';

const TITLES = ['DEPRECATED', 'ORPHANED', 'UNSIGNED', 'NULL', 'LEGACY', 'STALE', 'FORKED', 'UNPATCHED', 'VERBOSE', 'RECURSIVE'];
const NOUNS = ['SAINT', 'WIDOW', 'WARDEN', 'CHOIR', 'DEACON', 'MOTHER', 'USHER', 'TENANT', 'COURIER', 'LANDLORD'];
const EPITHETS = ['of the Green Line', 'Who Still Bills', 'of Platform Zero', 'Who Forgot Its Name', 'of 1901', 'Who Answers Wrong'];
const COLORS = [0x7fb069, 0xb3589c, 0x5fb3b3, 0xc9a227, 0x8f6fd1];

// Behavior modules the boss AI understands (src/engine/sim.js _stepBoss).
export const MODULES = ['ring', 'charge', 'summon', 'spray', 'blink'];

/** Damage taken off every hit on the Warden (after weak spots and marks). Tuned with the boss probe. */
export const WARDEN_GUARD = 9;

export function generateWarden(seed, playerCount = 1) {
  const r = makeStreams(seed)('rotVillains');
  const mods = r.shuffle(MODULES).slice(0, 2);
  return {
    name: `${r.pick(TITLES)} ${r.pick(NOUNS)}`,
    epithet: r.pick(EPITHETS),
    color: r.pick(COLORS),
    modules: mods,                       // phase 1 uses mods[0]; phase 2 adds mods[1]; phase 3 overloads
    // Harder road to the Warden (Michael via BagelMeister, #503, task #33): twice the health, harder
    // hits, a shell that turns light blows (`guard` is taken off every hit, so starter weapons barely
    // scratch it and real weapons, melee skills, marks and the open windows are how you win), and it
    // keeps pulling code rot zombies out of the tunnels during the fight.
    maxHp: (360 + 180 * Math.max(0, playerCount - 1)) * 2,
    radius: 11, speed: 34, damage: 20,
    dmgMul: 1.35, guard: WARDEN_GUARD,
    adds: { kind: 'enemy.rot_taken', every: [9, 7, 5], per: 2, cap: 6 },
  };
}

// Act 1's mid boss (task #34, Trevor's #510 "multiple bosses per act"): the Switchman, code rot grown out
// of the switchyard's old signal gear. Lighter than the Warden and beatable with starter gear; it sleeps
// until someone comes close. `mini` keeps its death from counting as the act's boss (no ending).
export function switchmanDef(playerCount = 1) {
  return {
    name: 'THE SWITCHMAN', epithet: 'Who Still Throws the Points', color: 0xd8b060,
    modules: ['charge', 'spray'], pool: [['charge', 'spray'], ['charge', 'spray', 'shock', 'blink'], ['charge', 'spray', 'shock', 'blink', 'ring']],
    // Tuned (Trevor via John Pork #584: beaten in under 5 s with starter gear): more HP, a light guard, and a
    // phase gate, so every phase shows at least one tell before it can be pushed into the next.
    maxHp: 600 + 300 * Math.max(0, playerCount - 1), radius: 10, speed: 30, damage: 14, mini: true, wake: 150, guard: 5, phaseGate: true,
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
