import { BUILT_GADGET, GADGETS, gadgetEffectValue } from '../content/gadgets.js';
import { CONTROLS, FRAMES, PAYLOADS, POWER } from '../content/parts.js';
import { TOL, buildStats, glitchChance, legality, materials, rollTolerance } from './assembly.js';
import * as Inv from './inventory.js';

export const PARTS_BY_ROLE = { frame: FRAMES, power: POWER, payload: PAYLOADS, control: CONTROLS };

function selectedParts(selection) {
  const build = {};
  for (const [role, parts] of Object.entries(PARTS_BY_ROLE)) {
    const id = selection?.[role];
    if (typeof id === 'string' && Object.hasOwn(parts, id)) build[role] = id;
  }
  return build;
}

export function previewBuild(selection, flags = {}, lang = 'en') {
  const build = selectedParts(selection);
  const result = legality(build, (flag) => flags?.[flag] === true, lang);
  return { ...result, build, stats: result.ok ? balancedStats(build) : null, cost: materials(build) };
}

function balancedStats(build) {
  const stats = buildStats(build);
  // The parts formula may select a faster supply. Preserve the damage and control limits even with that supply.
  const rateFloor = stats.kind === 'arc' ? gadgetEffectValue(GADGETS['item.arc_splicer'], stats.effect) / 5.4
    : stats.kind === 'slow' ? stats.effect / 0.25 : 0;
  const range = { arc: GADGETS['item.arc_splicer'].range, burst: 46, slow: 42, scan: Math.round(160 * stats.effect) }[stats.kind];
  return { ...stats, range, cooldown: Math.max(stats.cooldown, Math.ceil(rateFloor * 10) / 10) };
}

export function equippedBuildStats(build) {
  const ids = selectedParts(build);
  if (!legality(ids).ok) return null;
  const tol = {};
  for (const [stat, limit] of Object.entries(TOL)) {
    const value = build?.tol?.[stat];
    tol[stat] = Number.isFinite(value) ? Math.max(-limit, Math.min(limit, value)) : 0;
  }
  return balancedStats({ ...ids, tol });
}

/** Costs and tolerance are derived on the host. A failed print leaves the inventory and sequence alone. */
export function printBuild(save, who, selection) {
  const c = save.party?.[who];
  if (!c) return { error: 'character' };
  const preview = previewBuild(selection, save.flags);
  if (!preview.ok) return { error: 'illegal', reasons: preview.reasons };
  const next = { inventory: c.inventory.map((stack) => stack && { ...stack }) };
  if (!Inv.pay(next, preview.cost)) return { error: 'materials' };
  const world = save.world;
  const count = world.gearMade?.[BUILT_GADGET] ?? 0;
  const tol = rollTolerance(world.seed, preview.build, count);
  const roll = { build: { ...preview.build, tol }, uses: 0 };
  if (Inv.add(next, BUILT_GADGET, 1, roll) > 0) return { error: 'space' };
  c.inventory = next.inventory;
  c.gadgetPattern = preview.build;
  (world.gearMade ??= {})[BUILT_GADGET] = count + 1;
  return { roll };
}

export function wornController(character) {
  if (character?.equipped?.gadget !== BUILT_GADGET) return null;
  const roll = character.rolled?.gadget;
  const build = roll?.build;
  if (!equippedBuildStats(build)) return null;
  const uses = Number.isSafeInteger(roll.uses) ? Math.max(0, roll.uses) : 0;
  const base = glitchChance(build);
  return { roll, chance: glitchChance(build, uses), worn: base > 0 && uses > 0 };
}

export function serviceController(character) {
  const control = wornController(character);
  if (!control?.worn) return false;
  control.roll.uses = 0;
  return true;
}
