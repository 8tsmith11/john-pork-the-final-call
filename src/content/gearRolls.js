// Procedural gear rolls for the engineering room's machines (docs/design/09-engineering-room.md §4).
// A procedural recipe makes its base item plus 1–2 affixes from bounded tables, seeded by the world seed,
// the recipe and how many times it has been made, so a world is reproducible and co-op screens agree.
// Every affix stays inside its [min, max]; the chosen Fab tuning adds a separate fixed tradeoff.
import { makeStreams } from '../engine/rng.js';

// Which affixes can land on which kind of item. Values are added like an item's own `mods`.
// `es` (gonman): Spanish adjectives agree with the item's gender, so each label is a phrase that works
// after any noun ("llave inglesa de filo fino", "casco con placas").
export const AFFIXES = {
  keen:      { label: 'keen', es: 'de filo fino',      kinds: ['melee'],          mods: { melee: [1, 3] } },
  heavy:     { label: 'heavy', es: 'de peso',     kinds: ['melee'],          mods: { knock: [0.1, 0.3], speed: [-0.03, -0.01] } },
  balanced:  { label: 'balanced', es: 'de buen balance',  kinds: ['melee', 'gun'],   mods: { crit: [0.03, 0.08] } },
  milled:    { label: 'milled', es: 'de precisión',    kinds: ['gun'],            mods: { shot: [1, 3] } },
  quickload: { label: 'quick-load', es: 'de carga rápida', kinds: ['gun'],           mods: { shotCd: [-0.1, -0.04] } },
  plated:    { label: 'plated', es: 'con placas',    kinds: ['armor'],          mods: { armor: [0.02, 0.05] } },
  light:     { label: 'light', es: 'de bajo peso',     kinds: ['armor', 'gear'],  mods: { speed: [0.02, 0.05] } },
  breathing: { label: 'breathing', es: 'transpirable', kinds: ['armor', 'gear'],  mods: { staRegen: [0.05, 0.12] } },
  analog:    { label: 'analog', es: 'sin chip',    kinds: ['armor', 'gear', 'melee'], mods: { armor: [0.01, 0.02] }, analog: true },   // resists code rot (sealed analog line)
  tuned:     { label: 'tuned', es: 'con ajuste fino',     kinds: ['gear'],           mods: { abilityPower: [0.05, 0.12] } },
  insulated: { label: 'insulated', es: 'con aislamiento', kinds: ['gadget'], mods: { gadgetCd: [-0.09, -0.04] } },
  buffered:  { label: 'buffered', es: 'con reserva', kinds: ['gadget'], mods: { gadgetEffect: [0.05, 0.12] } },
};

export const FAB_TUNES = {
  cycle: { name: 'Fast cycle', label: 'quick-cycle', es: 'de ciclo rápido', part: 'item.mat_wire',
    mods: { melee: { melee: -1, meleeCd: -0.05 }, gun: { shot: -1, shotCd: -0.05 }, gadget: { gadgetCd: -0.15, gadgetEffect: -0.12 } } },
  output: { name: 'High output', label: 'high-output', es: 'de alta potencia', part: 'item.mat_cell',
    mods: { melee: { melee: 2, meleeCd: 0.07 }, gun: { shot: 2, shotCd: 0.06 }, gadget: { gadgetCd: 0.12, gadgetEffect: 0.18 } } },
};

export function fabCost(recipe, tune = 'stock') {
  if (tune === 'stock') return recipe.cost;
  if (typeof tune !== 'string') return null;
  const profile = Object.hasOwn(FAB_TUNES, tune) ? FAB_TUNES[tune] : null;
  if (!profile?.mods[recipe.roll]) return null;
  return { ...recipe.cost, [profile.part]: (recipe.cost[profile.part] ?? 0) + 1 };
}

const round = (v, step) => Math.round(v / step) * step;
const stepFor = (lo, hi) => (Number.isInteger(lo) && Number.isInteger(hi) ? 1 : 0.01);

/** Roll affixes for one built item and apply its chosen Fab tuning. */
export function rollGear(seed, recipeId, count, kind, tune = 'stock') {
  const r = makeStreams(`${seed}|${recipeId}|${count}`)('gearRolls');
  const pool = Object.entries(AFFIXES).filter(([, a]) => a.kinds.includes(kind));
  if (!pool.length) return { affixes: [], mods: {}, analog: false, label: '', labelEs: '' };
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
  const profile = Object.hasOwn(FAB_TUNES, tune) ? FAB_TUNES[tune] : null;
  const tuning = profile?.mods[kind];
  if (tuning) for (const [k, v] of Object.entries(tuning)) mods[k] = Math.round(((mods[k] ?? 0) + v) * 100) / 100;
  const labels = tuning ? [...picked.map(([, a]) => a), profile] : picked.map(([, a]) => a);
  return { affixes: picked.map(([id]) => id), mods, analog, ...(tuning ? { tune } : {}), label: labels.map((a) => a.label).join(', '), labelEs: labels.map((a) => a.es).join(', ') };
}

/** A rolled item's name: adjectives first in English ("keen rebar"), the phrase after the noun in Spanish
 *  ("barra de filo fino"). `name` is the base item's name in the current language. */
export function rolledName(name, roll, lang = 'en') {
  if (!roll?.affixes?.length) return name;
  return lang === 'es' ? `${name} ${roll.labelEs}` : `${roll.label} ${name}`;
}
