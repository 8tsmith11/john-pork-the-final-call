import { BUILT_GADGET, GADGETS, gadgetEffectValue } from '../content/gadgets.js';
import { CONTROLS, FRAMES, PAYLOADS, POWER, componentItemId } from '../content/parts.js';
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

/** The first matching component in inventory order is the one the quote will use. */
export function recoveredSlot(character, part) {
  return character?.inventory.findIndex((stack) => stack?.id === componentItemId(part) && stack.roll?.component === part) ?? -1;
}

export function previewBuild(selection, flags = {}, lang = 'en', character) {
  const build = selectedParts(selection);
  const reused = {}, fabricated = {};
  for (const [role, part] of Object.entries(build)) {
    const slot = recoveredSlot(character, part);
    if (slot >= 0) reused[role] = slot;
    else fabricated[role] = part;
  }
  const result = legality(build, (flag) => flags?.[flag] === true, lang);
  const frame = character?.inventory?.[reused.frame]?.roll;
  const control = character?.inventory?.[reused.control]?.roll;
  const stats = result.ok ? balancedStats({ ...build, tol: boundedTolerance(frame?.tol) }) : null;
  if (stats && control) stats.glitch = glitchChance(build, controllerUses(control));
  return { ...result, build, reused, stats, cost: materials(fabricated) };
}

function balancedStats(build) {
  const stats = buildStats(build);
  // The parts formula may select a faster supply. Preserve the damage and control limits even with that supply.
  const rateFloor = stats.kind === 'arc' ? gadgetEffectValue(GADGETS['item.arc_splicer'], stats.effect) / 5.4
    : stats.kind === 'slow' ? stats.effect / 0.25 : 0;
  const range = { arc: GADGETS['item.arc_splicer'].range, burst: 46, slow: 42, scan: Math.round(160 * stats.effect) }[stats.kind];
  const energyCost = PAYLOADS[build.payload].cost;
  const capacity = Math.max(POWER[build.power].capacity, energyCost);
  return { ...stats, range, energyCost, capacity, cooldown: Math.max(stats.cooldown, Math.ceil(rateFloor * 10) / 10) };
}

function boundedTolerance(source) {
  const tol = {};
  for (const [stat, limit] of Object.entries(TOL)) {
    const value = source?.[stat];
    tol[stat] = Number.isFinite(value) ? Math.max(-limit, Math.min(limit, value)) : 0;
  }
  return tol;
}

export function equippedBuildStats(build) {
  const ids = selectedParts(build);
  return legality(ids).ok ? balancedStats({ ...ids, tol: boundedTolerance(build?.tol) }) : null;
}

const controllerUses = (roll) => Number.isSafeInteger(roll?.uses) ? Math.max(0, roll.uses) : 0;
const copyBag = (c) => ({ inventory: c.inventory.map((stack) => stack && { ...stack }) });

export function powerUnit(roll) {
  if (roll.powerUnit === null || typeof roll.powerUnit !== 'object') roll.powerUnit = {};
  return roll.powerUnit;
}

/** Costs and tolerance are derived on the host. A failed print leaves the inventory and sequence alone. */
export function printBuild(save, who, selection) {
  const c = save.party?.[who];
  if (!c) return { error: 'character' };
  const preview = previewBuild(selection, save.flags, 'en', c);
  if (!preview.ok) return { error: 'illegal', reasons: preview.reasons };
  const next = copyBag(c);
  if (!Inv.pay(next, preview.cost)) return { error: 'materials' };
  const world = save.world;
  const count = world.gearMade?.[BUILT_GADGET] ?? 0;
  const { frame, power, control } = preview.reused;
  const tol = c.inventory[frame]?.roll?.tol ?? rollTolerance(world.seed, preview.build, count);
  const battery = c.inventory[power]?.roll;
  const roll = { build: { ...preview.build, tol }, uses: controllerUses(c.inventory[control]?.roll),
    powerUnit: battery?.powerUnit ?? {} };
  for (const slot of Object.values(preview.reused)) Inv.takeSlot(next, slot);
  if (Inv.add(next, BUILT_GADGET, 1, roll) > 0) return { error: 'space' };
  c.inventory = next.inventory;
  c.gadgetPattern = preview.build;
  (world.gearMade ??= {})[BUILT_GADGET] = count + 1;
  return { roll };
}

export function dismantleGadget(character) {
  const roll = character?.equipped?.gadget === BUILT_GADGET ? character.rolled?.gadget : null;
  const build = roll?.build;
  if (!equippedBuildStats(build)) return { error: 'gadget' };
  const next = copyBag(character);
  for (const [role, part] of Object.entries(selectedParts(build))) {
    const component = { component: part };
    if (role === 'frame') component.tol = build.tol;
    if (role === 'power') component.powerUnit = roll.powerUnit ?? {};
    if (role === 'control') component.uses = controllerUses(roll);
    if (Inv.add(next, componentItemId(part), 1, component)) return { error: 'space' };
  }
  character.inventory = next.inventory;
  character.equipped.gadget = null;
  delete character.rolled.gadget;
  return { ok: true };
}

export function wornController(character) {
  if (character?.equipped?.gadget !== BUILT_GADGET) return null;
  const roll = character.rolled?.gadget;
  const build = roll?.build;
  if (!equippedBuildStats(build)) return null;
  const uses = controllerUses(roll);
  const base = glitchChance(build);
  return { roll, chance: glitchChance(build, uses), worn: base > 0 && uses > 0 };
}

export function serviceController(character) {
  const control = wornController(character);
  if (!control?.worn) return false;
  control.roll.uses = 0;
  return true;
}
