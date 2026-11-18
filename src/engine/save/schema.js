// The save file is a CONTRACT (docs/tech/PLAN.md §3, PROCESS.md "Saves are a contract").
// - Bump CURRENT_SCHEMA and append a migration whenever the shape changes.
// - Never reference content by index; always by stable string id.
// - Unknown keys are preserved so older builds don't wipe newer data.

export const FORMAT = 'jpfc-save';
export const SLOTS = 36;   // inventory slots per character: 0..8 hotbar, 9..35 backpack
export const CURRENT_SCHEMA = 3;

/** migrations[n] upgrades a schema-n save to schema n+1. Append only. */
export const migrations = {
  // 1 -> 2: money replaces scrap as the currency; inventories become 36 fixed slots (9 hotbar + 27).
  1: (save) => {
    save.world ??= {};
    save.world.money = (save.world.money ?? 25) + (save.world.scrap ?? 0) * 3;
    delete save.world.scrap;
    for (const c of Object.values(save.party ?? {})) {
      const list = Array.isArray(c.inventory) ? c.inventory.filter((x) => x && x.id) : [];
      c.inventory = new Array(SLOTS).fill(null);
      list.slice(0, SLOTS).forEach((it, i) => { c.inventory[i] = { id: it.id, qty: it.qty ?? 1 }; });
    }
    save.schemaVersion = 2; return save;
  },
  // 2 -> 3 (D-014): the single 'armor' slot becomes helmet/chestplate/leggings/boots, with gear slots
  // (goggles, parka, gloves, socks, backpack) on top. What was worn as armor moves to chestplate.
  2: (save) => {
    for (const c of Object.values(save.party ?? {})) {
      c.equipped ??= {};
      if ('armor' in c.equipped) { c.equipped.chestplate ??= c.equipped.armor; delete c.equipped.armor; }
      c.upgrades ??= {};
    }
    save.schemaVersion = 3; return save;
  },
};

export function newCharacter(id) {
  return {
    id,
    level: 1, xp: 0, skillPoints: 0,
    skills: {},                 // { 'skill.id': rank }
    morph: { line: id, stage: 0 },
    hp: null,                   // null = full
    inventory: new Array(SLOTS).fill(null),   // fixed slots: { id, qty } | null (engine/inventory.js)
    equipped: { weapon: null, ranged: null, gadget: null, charm: null,
      helmet: null, chestplate: null, leggings: null, boots: null,          // armor
      goggles: null, parka: null, gloves: null, socks: null, backpack: null }, // gear on top
    upgrades: {},               // { 'item.id': level } from the master armorer (0..5)
  };
}

export function newSave({ seed, rolls, gameVersion }) {
  return {
    format: FORMAT,
    schemaVersion: CURRENT_SCHEMA,
    savedAt: new Date().toISOString(),
    meta: { gameVersion, playtimeSec: 0, slotName: 'Room 631' },
    world: { seed, act: 1, area: 'room631', rolls, money: 25 },   // money: the party's shared wallet ($)
    flags: {},                  // namespaced: 'act1.balloon.ribbonInspected'
    standing: { continuity: 0, callers: 0, analogists: 0, archivists: 0 },
    // Multiplayer: the save lives on the HOST only. It remembers who played whom, so the lobby can
    // suggest the same character to returning players. Joiners claim a character in the lobby and
    // receive the save from the host (docs/DECISIONS.md D-010).
    session: { hostCharacter: null, claims: {} },   // claims: { michael: { playerName, lastSeen } }
    party: { michael: newCharacter('michael'), trevor: newCharacter('trevor'), manuel: newCharacter('manuel') },
    codex: { seen: [] },
  };
}

/** Upgrade any older save to CURRENT_SCHEMA. Throws on saves we can't read. */
export function migrate(save) {
  if (!save || save.format !== FORMAT) throw new Error('Not a John Pork: The Final Call save file.');
  let v = save.schemaVersion;
  if (!Number.isInteger(v) || v < 1) throw new Error(`Bad schemaVersion: ${v}`);
  if (v > CURRENT_SCHEMA) throw new Error(`This save is from a newer version of the game (schema ${v}). Update the game.`);
  while (v < CURRENT_SCHEMA) {
    const step = migrations[v];
    if (!step) throw new Error(`Missing migration from schema ${v}.`);
    save = step(save);
    v = save.schemaVersion;
  }
  return fillDefaults(save);
}

/** Add any fields newer code expects, without touching unknown keys. */
function fillDefaults(save) {
  const fresh = newSave({ seed: save.world?.seed ?? 'unknown', rolls: save.world?.rolls ?? {}, gameVersion: save.meta?.gameVersion });
  const merge = (target, defaults) => {
    for (const [k, v] of Object.entries(defaults)) {
      if (!(k in target)) target[k] = structuredClone(v);
      else if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') merge(target[k], v);
    }
  };
  merge(save, fresh);
  return save;
}
