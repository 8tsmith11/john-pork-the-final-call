// Boss pattern library (task #32, docs/research/combat.md #11). Every attack is three beats:
// a tell you can read (wind-up), the attack, and a recovery window where the boss takes extra damage.
// `red` marks attacks you can't deflect or parry: their tell is drawn red, so dodge instead.
// wind: seconds of tell per phase [1, 2, 3]. recover: open window afterwards (openDmg applies).
// `line` is for the story owners (gonman): what the Warden says or shows with each pattern.
export const BOSS_PATTERNS = {
  ring:   { name: 'Broadcast',    wind: [0.8, 0.65, 0.5],  recover: 0.7, red: false, line: null },
  spray:  { name: 'Aimed Fan',    wind: [0.7, 0.55, 0.45], recover: 0.6, red: false, line: null },
  spiral: { name: 'Hold Loop',    wind: [0.9, 0.7, 0.55],  recover: 0.9, red: false, line: null },
  charge: { name: 'Charge Line',  wind: [0.85, 0.7, 0.55], recover: 0,   red: true,  line: null },   // ends overheated anyway
  beam:   { name: 'Sweep',        wind: [0.9, 0.75, 0.6],  recover: 0,   red: true,  line: null },   // ends overheated anyway
  puddle: { name: 'Ground Pools', wind: [0.8, 0.65, 0.5],  recover: 0.8, red: true,  line: null },
  summon: { name: 'Fork',         wind: [0.9, 0.75, 0.6],  recover: 1.0, red: false, line: null },
  blink:  { name: 'Reroute',      wind: [0.6, 0.5, 0.4],   recover: 0.4, red: false, line: null },
  laser:  { name: 'Carrier',      wind: [1.2, 1.0, 0.9],   recover: 0,   red: true,  line: null },   // ends overheated
  shock:  { name: 'Ripple',       wind: [0.8, 0.7, 0.6],   recover: 0.5, red: true,  line: null },
  rain:   { name: 'Packet Rain',  wind: [0.8, 0.7, 0.6],   recover: 0.6, red: true,  line: null },
};
// Tuning for the bigger patterns (sim.js reads these).
export const LASER = { len: 300, half: 7, turn: [0.7, 0.7, 0.9], time: [4.5, 4.5, 6], dmg: 12, tick: 0.35 };
export const SHOCK = { speed: 110, max: 220, band: 6, dmg: 12 };
export const RAIN = { count: [6, 6, 9], fall: 1.0, r: 14, dmg: 14 };

// Which patterns a boss draws from in each phase. Phase 1 already has two, so it never repeats one move;
// phase 2 adds its second module plus the arena attacks; phase 3 adds the spiral.
export function bossPool(modules, phase) {
  const pool = [modules[0], 'spray'];
  if (phase >= 2) pool.push(modules[1], 'beam', 'puddle', 'laser', 'shock');
  if (phase >= 3) pool.push('spiral', 'rain');
  return [...new Set(pool.filter((m) => BOSS_PATTERNS[m]))];
}

// Never the same pattern twice in a row (when there's a choice).
export function pickPattern(pool, last, rand = Math.random) {
  const options = pool.length > 1 ? pool.filter((m) => m !== last) : pool;
  return options[Math.floor(rand() * options.length)];
}

export const windFor = (mod, phase) => BOSS_PATTERNS[mod]?.wind[Math.max(0, Math.min(2, phase - 1))] ?? 0.75;
