// Procedural gear rolls for the engineering room's machines (docs/design/09-engineering-room.md §4).
// A procedural recipe makes its base item plus 1–2 affixes from bounded tables, seeded by the world seed,
// the recipe and how many times it has been made, so a world is reproducible and co-op screens agree.
// Every affix stays inside its [min, max]; tests check that. Engine only: no machine uses it yet.
import { makeStreams } from '../engine/rng.js';

// Which affixes can land on which kind of item. Values are added like an item's own `mods`.
export const AFFIXES = {
  keen:      { label: 'keen',      kinds: ['melee'],          mods: { melee: [1, 3] } },
  heavy:     { label: 'heavy',     kinds: ['melee'],          mods: { knock: [0.1, 0.3], speed: [-0.03, -0.01] } },
  balanced:  { label: 'balanced',  kinds: ['melee', 'gun'],   mods: { crit: [0.03, 0.08] } },
  milled:    { label: 'milled',    kinds: ['gun'],            mods: { shot: [1, 3] } },
  quickload: { label: 'quick-load', kinds: ['gun'],           mods: { shotCd: [-0.1, -0.04] } },
  plated:    { label: 'plated',    kinds: ['armor'],          mods: { armor: [0.02, 0.05] } },
  light:     { label: 'light',     kinds: ['armor', 'gear'],  mods: { speed: [0.02, 0.05] } },
  breathing: { label: 'breathing', kinds: ['armor', 'gear'],  mods: { staRegen: [0.05, 0.12] } },
  analog:    { label: 'analog',    kinds: ['armor', 'gear', 'melee'], mods: { armor: [0.01, 0.02] }, analog: true },   // resists code rot (sealed analog line)
  tuned:     { label: 'tuned',     kinds: ['gear'],           mods: { abilityPower: [0.05, 0.12] } },
};

const round = (v, step) => Math.round(v / step) * step;
const stepFor = (lo, hi) => (Number.isInteger(lo) && Number.isInteger(hi) ? 1 : 0.01);

/** Roll the affixes for one made item. kind: 'melee'|'gun'|'armor'|'gear'. Returns { affixes, mods, analog, label }. */
export function rollGear(seed, recipeId, count, kind) {
  const r = makeStreams(`${seed}|${recipeId}|${count}`)('gearRolls');
  const pool = Object.entries(AFFIXES).filter(([, a]) => a.kinds.includes(kind));
  if (!pool.length) return { affixes: [], mods: {}, analog: false, label: '' };
  const n = Math.min(pool.length, r.next() < 0.35 ? 2 : 1);
  const picked = r.shuffle(pool).slice(0, n);
  const mods = {}; let analog = false;
  for (const [, a] of picked) {
    for (const [k, [lo, hi]] of Object.entries(a.mods)) {
      const v = round(lo + (hi - lo) * r.next(), stepFor(lo, hi));
      mods[k] = Math.round(((mods[k] ?? 0) + v) * 100) / 100;
    }
    if (a.analog) analog = true;
  }
  return { affixes: picked.map(([id]) => id), mods, analog, label: picked.map(([, a]) => a.label).join(', ') };
}
