import { BUILT_GADGET } from '../content/gadgets.js';
import { CONTROLS, FRAMES, PAYLOADS, POWER } from '../content/parts.js';
import { buildStats, legality, materials, rollTolerance } from './assembly.js';
import * as Inv from './inventory.js';

const PARTS_BY_ROLE = { frame: FRAMES, power: POWER, payload: PAYLOADS, control: CONTROLS };

export function previewBuild(selection, flags = {}) {
  const build = {};
  for (const [role, parts] of Object.entries(PARTS_BY_ROLE)) {
    const id = selection?.[role];
    if (typeof id === 'string' && Object.hasOwn(parts, id)) build[role] = id;
  }
  const result = legality(build, (flag) => flags[flag] === true);
  return { ...result, build, stats: result.ok ? buildStats(build) : null, cost: materials(build) };
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
  (world.gearMade ??= {})[BUILT_GADGET] = count + 1;
  return { roll };
}
