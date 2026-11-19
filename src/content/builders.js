// Content builders (docs/design/11-level-builder.md; Trevor: "a boss/enemy builder, npc builder, and item builder").
// Each takes a short spec, fills sensible defaults, validates it (throws with a clear message), and returns
// exactly what the game already reads, so new content can be written in these and old content keeps working:
//   ENEMIES[...]        <- defineEnemy(spec)       (src/content/enemies.js shape)
//   boss def            <- defineBoss(spec)        (the shape switchmanDef()/generateWarden() return)
//   map object + life   <- defineNpc(spec)         (a map object, plus an NPC_LIFE entry and optional `later` lines)
//   ITEMS[...] (+ shop) <- defineItem(spec)        (src/content/items.js shape)
// Brainstorm first in docs/design/levels/ and docs/design/bosses/ (TEMPLATE.md), then turn it into these.
import { BOSS_PATTERNS } from '../engine/bossPatterns.js';

const AIS = ['lunge', 'kite', 'swarm', 'charge', 'lullaby', 'mirror'];   // the AIs sim.js knows
const SLOTS = ['weapon', 'ranged', 'helmet', 'chestplate', 'leggings', 'boots', 'goggles', 'parka', 'gloves', 'socks', 'backpack', 'gadget', 'charm',
  'material', 'key', 'consumable', 'gift', 'instrument', 'junk'];   // the slots items.js uses
const MOODS = ['still', 'pace', 'fidget', 'nod'];   // npcLife.js moods

function need(cond, msg) { if (!cond) throw new Error(`builder: ${msg}`); }
const num = (v, lo, hi) => typeof v === 'number' && v >= lo && v <= hi;

/** An enemy kind. Required: id ('enemy.*'), name, hp, speed, damage, ai. Returns [id, def]. */
export function defineEnemy({ id, name, hp, speed, damage, ai, radius = 6, xp = Math.round(hp / 4), touchCooldown = 1.1, color = 0x7fb069, lore = '', tip = '', ...rest }) {
  need(/^enemy\.[a-z_]+$/.test(id ?? ''), `enemy id must look like enemy.name, got ${id}`);
  need(name, `${id}: needs a name`);
  need(num(hp, 1, 2000) && num(speed, 0, 400) && num(damage, 0, 200), `${id}: hp 1-2000, speed 0-400, damage 0-200`);
  need(AIS.includes(ai), `${id}: ai must be one of ${AIS.join(', ')}`);
  return [id, { name, hp, speed, damage, radius, xp, ai, touchCooldown, color, lore, ...(tip ? { tip } : {}), ...rest }];
}

/**
 * A boss. Required: name, hp, phases: three pattern lists (phase 1, 2, 3), each from BOSS_PATTERNS.
 * Optional: epithet, perPlayer (extra HP per extra roommate), guard, damage, speed, radius, mini (mid boss: no
 * act ending), wake (sleeps until someone is this close, px), phaseGate (each phase shows a tell before the next).
 * signature: a pattern guaranteed within the boss's first two attacks.
 * Returns a function (playerCount) => def, like switchmanDef.
 */
export function defineBoss({ name, epithet = '', hp, perPlayer = Math.round(hp / 2), phases, guard = 0, damage = 14, speed = 30, radius = 10, color = 0xd8b060, mini = true, wake = 0, phaseGate = true, ...rest }) {
  need(name, 'boss needs a name');
  need(num(hp, 50, 20000), `${name}: hp 50-20000`);
  need(Array.isArray(phases) && phases.length === 3 && phases.every((p) => Array.isArray(p) && p.length >= 1), `${name}: phases must be three non-empty pattern lists`);
  for (const p of phases.flat()) need(BOSS_PATTERNS[p], `${name}: unknown pattern '${p}' (known: ${Object.keys(BOSS_PATTERNS).join(', ')})`);
  return (playerCount = 1) => ({
    name, epithet, color, modules: phases[0].slice(0, 2), pool: phases.map((p) => [...p]),
    maxHp: hp + perPlayer * Math.max(0, playerCount - 1), radius, speed, damage, mini, ...(wake ? { wake } : {}), guard, phaseGate, ...rest,
  });
}

/**
 * An NPC. Required: id ('npc.*'), x, y, label. Optional: talk ('scene:node'), text (a one-liner when there's no
 * scene yet: scaffold), mood (how they idle), hi (lines when you walk up), later ([{ if: flag, text }]), art, age.
 * Returns { object, life } (object goes in the map's objects, life into NPC_LIFE[id]).
 */
export function defineNpc({ id, x, y, label, talk, text, mood = 'still', hi = [], later, art, age = 'adult', ...rest }) {
  need(/^npc\.[a-z0-9_]+$/.test(id ?? ''), `npc id must look like npc.name, got ${id}`);
  need(Number.isInteger(x) && Number.isInteger(y), `${id}: x, y must be tile integers`);
  need(label, `${id}: needs a label (the name shown)`);
  need(talk || text, `${id}: needs a talk scene or a text line`);
  need(MOODS.includes(mood), `${id}: mood must be one of ${MOODS.join(', ')}`);
  const object = { id, x, y, label, npc: true, age, ...(art ? { art } : {}), ...(talk ? { talk } : { text }), ...(later ? { later } : {}), ...rest };
  return { object, life: { mood, hi } };
}

/**
 * An item. Required: id ('item.*'), name, slot, text. Optional: mods, swing (melee profile), gun, analog, unique,
 * owner, price (adds a shop entry), es ({ name, text }) for Spanish.
 * Returns [id, def] (+ .shop when priced).
 */
export function defineItem({ id, name, slot, text, mods, swing, gun, price, es, ...rest }) {
  need(/^item\.[a-z0-9_]+$/.test(id ?? ''), `item id must look like item.name, got ${id}`);
  need(name && text, `${id}: needs a name and a text line`);
  need(SLOTS.includes(slot), `${id}: slot must be one of ${SLOTS.join(', ')}`);
  if (swing) need(num(swing.damage, 1, 200) && num(swing.range, 4, 80) && num(swing.cooldown, 0.1, 3), `${id}: swing needs damage 1-200, range 4-80, cooldown 0.1-3`);
  if (mods) for (const [k, v] of Object.entries(mods)) need(typeof v === 'number' && Math.abs(v) <= 100, `${id}: mod ${k} must be a small number`);
  const def = { name, slot, text, ...(mods ? { mods } : {}), ...(swing ? { swing } : {}), ...(gun ? { gun } : {}), ...(es ? { es } : {}), ...rest };
  const out = [id, def];
  if (price != null) { need(num(price, 1, 100000), `${id}: price 1-100000`); out.shop = { item: id, price }; }
  return out;
}
