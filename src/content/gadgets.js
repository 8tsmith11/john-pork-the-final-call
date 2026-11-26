// The equipped gadget is a separate action on V. Range is in pixels and timers are in seconds.
export const BUILT_GADGET = 'item.assembled_gadget';

export const GADGETS = {
  'item.sniffer': { name: 'Helium sniffer', kind: 'sniffer', cooldown: 0,
    text: 'Sample the air for the helium trail. Fab #1 calibrates it.' },
  'item.salvage_array': { name: 'Salvage Array', kind: 'survey', cooldown: 0,
    text: 'Scan for the closest unopened salvage container in this area.' },
  'item.phase_screen': { name: 'Phase Screen', kind: 'screen', cooldown: 12, power: 2.2,
    text: 'Block ordinary incoming shots for a short time. Melee and heavy attacks still get through.' },
  'item.vector_actuator': { name: 'Vector Actuator', kind: 'vector', cooldown: 10, power: 48,
    text: 'Lunge in the direction you aim and shove the first enemy you meet if it can be moved. Walls stop you and you can still take hits.' },
  'item.arc_splicer': { name: 'Arc Splicer', kind: 'arc', cooldown: 9, range: 112, power: 18,
    text: 'Aim at an enemy. The arc jumps to two nearby enemies, losing power with each jump.' },
  'item.phase_tether': { name: 'Phase Tether', kind: 'tether', cooldown: 12, range: 128, power: 3,
    text: 'Slow one enemy in the direction you aim. Bosses resist the tether.' },
  'item.overclock_relay': { name: 'Overclock Relay', kind: 'relay', cooldown: 15, range: 64, power: 5,
    text: 'For a short time, nearby roommates recover stamina and recharge R faster.' },
  'item.patch_mesh': { name: 'Patch Mesh', kind: 'patch', cooldown: 24, range: 50, power: 16,
    text: 'Send repair microbots to nearby standing roommates. It cannot revive anyone.' },
  'item.ground_loop': { name: 'Ground Loop', kind: 'ground', cooldown: 20, range: 56, power: 8,
    text: 'Drain a little code rot from nearby roommates who are still standing.' },
};

export const GADGET_VALUE_CAP = 1.2;
export const GADGET_SUPPORT_WINDOW = 10;
export const ARC_HITS = 3;
export const arcDamage = (power, jump) => Math.round(power * 0.65 ** jump);

// Count the rounding that actual hits and healing use when comparing output per minute.
export function gadgetEffectValue(def, power) {
  if (def.kind === 'arc') return arcDamage(power, 0) + arcDamage(power, 1) + arcDamage(power, 2);
  if (def.kind === 'patch') return Math.round(power);
  return power;
}

export function gadgetStats(def, mods = {}) {
  if (!def.cooldown) return { cooldown: 0, power: 0 };
  const factor = (n, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? 1 + n : 1));
  const power = def.power * factor(mods.gadgetEffect, 0.7, 1.35);
  const chosen = def.cooldown * factor(mods.gadgetCd, 0.6, 1.4);
  const value = gadgetEffectValue(def, power) / gadgetEffectValue(def, def.power);
  const uptimeFloor = def.kind === 'screen' || def.kind === 'tether' ? power / 0.25 : 0;
  return { power, cooldown: Math.max(chosen, def.cooldown * value / GADGET_VALUE_CAP, uptimeFloor) };
}
