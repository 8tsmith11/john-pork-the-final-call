// The save file is a CONTRACT (docs/tech/PLAN.md §3, PROCESS.md "Saves are a contract").
// - Bump CURRENT_SCHEMA and append a migration whenever the shape changes.
// - Never reference content by index; always by stable string id.
// - Unknown keys are preserved so older builds don't wipe newer data.

import { BASE_SCORES } from '../../content/abilities.js';

export const FORMAT = 'jpfc-save';
export const SLOTS = 36;   // inventory slots per character: 0..8 hotbar, 9..35 backpack
export const HOTBAR = 9;
export const CURRENT_SCHEMA = 9;

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
  // 3 -> 4 (D-017): ability scores. Everyone starts at their base spread with the points they'd have
  // earned so far (2 per level above 1) unspent, to put where they like.
  3: (save) => {
    for (const [id, c] of Object.entries(save.party ?? {})) {
      c.abilities ??= { ...(BASE_SCORES[id] ?? {}) };
      c.abilityPoints ??= Math.max(0, ((c.level ?? 1) - 1) * 2);
    }
    save.schemaVersion = 4; return save;
  },
  // 4 -> 5: persistent per-roommate coderot exposure (0..100).
  4: (save) => {
    for (const c of Object.values(save.party ?? {})) c.rot ??= 0;
    save.schemaVersion = 5; return save;
  },
  // 5 -> 6 (Michael): worn armor and gear leave the bag; the equipment slot holds the item. Each
  // worn item's copy in the bag is taken out (melee and ranged weapons stay in the hotbar).
  5: (save) => {
    const WORN = ['helmet', 'chestplate', 'leggings', 'boots', 'goggles', 'parka', 'gloves', 'socks', 'backpack', 'gadget', 'charm'];
    for (const c of Object.values(save.party ?? {})) {
      const inv = Array.isArray(c.inventory) ? c.inventory : [];
      for (const sl of WORN) {
        const id = c.equipped?.[sl]; if (!id) continue;
        for (let i = inv.length - 1; i >= 0; i--) {
          const st = inv[i]; if (!st || st.id !== id) continue;
          st.qty -= 1; if (st.qty <= 0) inv[i] = null;
          break;
        }
      }
    }
    save.schemaVersion = 6; return save;
  },
  // 6 -> 7 (Trevor #515): money is per roommate. The old shared wallet is split evenly (the remainder goes to
  // the first roommate), and every roommate has a money field.
  6: (save) => {
    const ids = Object.keys(save.party ?? {}), total = save.world?.money ?? 0;
    const each = ids.length ? Math.floor(total / ids.length) : 0;
    ids.forEach((id, i) => { save.party[id].money = (save.party[id].money ?? 0) + each + (i === 0 ? total - each * ids.length : 0); });
    if (save.world) delete save.world.money;
    save.schemaVersion = 7; return save;
  },
  // 7 -> 8: weapon equipment entries were references to items in the bag.
  7: (save) => {
    for (const c of Object.values(save.party ?? {})) {
      if (!c.equipped) continue;
      delete c.equipped.weapon;
      delete c.equipped.ranged;
    }
    save.schemaVersion = 8; return save;
  },
  // 8 -> 9: keep access to the later maps without recording the Act 2 story as complete.
  8: (save) => {
    if (save.flags?.['act2.complete']) save.flags['act2.scaffold.gate'] = true;
    if (save.flags) delete save.flags['act2.complete'];
    save.schemaVersion = 9; return save;
  },
};

export function newCharacter(id) {
  return {
    id,
    level: 1, xp: 0, skillPoints: 0,
    skills: {},                 // { 'skill.id': rank }
    morph: { line: id, stage: 0 },
    hp: null,                   // null = full
    rot: 0,
    money: 25,                  // own wallet (schema 7, Trevor #515)
    inventory: new Array(SLOTS).fill(null),   // fixed slots: { id, qty } | null (engine/inventory.js)
    hotSel: 0,
    equipped: { gadget: null, charm: null,
      helmet: null, chestplate: null, leggings: null, boots: null,          // armor
      goggles: null, parka: null, gloves: null, socks: null, backpack: null }, // gear on top
    upgrades: {},               // { 'item.id': level } from the master armorer (0..5)
    abilities: { ...(BASE_SCORES[id] ?? {}) },   // D&D-style scores (content/abilities.js)
    abilityPoints: 0,
  };
}

export function newSave({ seed, rolls, gameVersion }) {
  return {
    format: FORMAT,
    schemaVersion: CURRENT_SCHEMA,
    savedAt: new Date().toISOString(),
    meta: { gameVersion, playtimeSec: 0, slotName: 'Room 631' },
    world: { seed, act: 1, area: 'room631', rolls },   // money is per roommate since schema 7 (party[who].money)
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
