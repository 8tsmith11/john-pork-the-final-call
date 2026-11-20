// Slot inventory (human request: "an actual inventory grid with items like Minecraft, and a hotbar").
// Each character's `inventory` is a fixed array of SLOTS entries, each `{ id, qty }` or null.
// Slots 0..8 are the hotbar; 9..35 the backpack grid. Pure JS (Node-tested).
import { ITEMS, WORN_SLOTS } from '../content/items.js';

import { SLOTS } from './save/schema.js';
export { SLOTS };
export const HOTBAR = 9;

export const stackOf = (id) => ITEMS[id]?.stack ?? (ITEMS[id]?.slot === 'material' ? 99 : ITEMS[id]?.slot === 'consumable' ? 16 : ITEMS[id]?.slot === 'junk' ? 16 : 1);

/** Old saves stored a plain list; turn any shape into exactly SLOTS slots, merging stacks. */
export function normalize(c) {
  const old = Array.isArray(c.inventory) ? c.inventory : [];
  if (old.length === SLOTS && old.every((s) => s === null || (s && s.id))) return c.inventory;
  const items = old.filter((s) => s && s.id);
  c.inventory = new Array(SLOTS).fill(null);
  for (const it of items) add(c, it.id, it.qty ?? 1, it.roll ?? null, it.socketed ?? null);
  return c.inventory;
}

/** Add n of id; fills existing stacks first, then the first empty slot (hotbar first). Returns leftover.
 *  `roll`: a procedural item's rolled affixes (src/content/gearRolls.js); rolled items never merge into a stack. */
export function add(c, id, n = 1, roll = null, socketed = null) {
  const inv = c.inventory, max = stackOf(id), unique = roll || socketed?.length;   // carries its own data: never merges
  for (let i = 0; i < SLOTS && n > 0 && !unique; i++) {
    const s = inv[i];
    if (s && s.id === id && s.qty < max) { const k = Math.min(n, max - s.qty); s.qty += k; n -= k; }
  }
  // New stacks go to the backpack first (Trevor: items shouldn't auto-fill the hotbar); the hotbar
  // only takes them when the backpack is full. Stacking onto an existing stack still happens anywhere.
  const order = [...Array(SLOTS - HOTBAR).keys()].map((k) => k + HOTBAR).concat([...Array(HOTBAR).keys()]);
  for (const i of order) {
    if (n <= 0) break;
    if (!inv[i]) { const k = unique ? 1 : Math.min(n, max); inv[i] = { id, qty: k, ...(roll ? { roll } : {}), ...(socketed?.length ? { socketed } : {}) }; n -= k; }
  }
  return n;
}

export function count(c, id) { return c.inventory.reduce((t, s) => t + (s && s.id === id ? s.qty : 0), 0); }
/** Is `id` worn in one of the worn slots (armor, gear, gadget, charm)? Worn items aren't in the bag. */
export const worn = (c, id) => WORN_SLOTS.some((sl) => c.equipped?.[sl] === id);
/** Owns it: in the bag or worn. (count() is bag-only, for paying and removing.) */
export const has = (c, id) => count(c, id) > 0 || worn(c, id);
export const ids = (c) => c.inventory.filter(Boolean).map((s) => s.id);

/** Remove n of id (from the back of the backpack first, so the hotbar keeps its stacks). */
export function remove(c, id, n = 1) {
  if (count(c, id) < n) return false;
  for (let i = SLOTS - 1; i >= 0 && n > 0; i--) {
    const s = c.inventory[i];
    if (!s || s.id !== id) continue;
    const k = Math.min(n, s.qty); s.qty -= k; n -= k;
    if (s.qty <= 0) c.inventory[i] = null;
  }
  return true;
}

export function takeSlot(c, i, n = 1) {
  const s = c.inventory[i]; if (!s) return null;
  s.qty -= n; if (s.qty <= 0) c.inventory[i] = null;
  return s.id;
}

/** Drag-and-drop: move/merge/swap slot a onto slot b (half = move half the stack). */
export function moveSlot(c, a, b, half = false) {
  const inv = c.inventory; if (a === b || !inv[a]) return;
  const src = inv[a], dst = inv[b], max = stackOf(src.id);
  const moving = half ? Math.ceil(src.qty / 2) : src.qty;
  if (!dst) {
    inv[b] = { id: src.id, qty: moving }; src.qty -= moving; if (src.qty <= 0) inv[a] = null;
  } else if (dst.id === src.id && dst.qty < max) {
    const k = Math.min(moving, max - dst.qty); dst.qty += k; src.qty -= k; if (src.qty <= 0) inv[a] = null;
  } else if (!half) {
    inv[a] = dst; inv[b] = src;
  }
}

/** Can `c` pay this material cost ({ id: qty })? */
export const canPay = (c, cost) => Object.entries(cost || {}).every(([id, n]) => count(c, id) >= n);
export function pay(c, cost) { if (!canPay(c, cost)) return false; for (const [id, n] of Object.entries(cost || {})) remove(c, id, n); return true; }

/** Put on a worn-slot item from the bag: it leaves the bag, and whatever was in that slot goes back
 *  into the bag. False (and nothing changes) if `id` isn't in the bag or the old piece won't fit. */
export function wear(c, id) {
  const slot = ITEMS[id]?.slot;
  if (!WORN_SLOTS.includes(slot) || count(c, id) < 1) return false;
  c.equipped ??= {}; c.rolled ??= {};
  // the same slot remove() would take (the back of the backpack first), so its roll goes on with it
  let i = SLOTS - 1; while (i >= 0 && c.inventory[i]?.id !== id) i--;
  c.socketed ??= {};
  const taken = c.inventory[i], roll = taken.roll ?? null, socketed = taken.socketed ?? null;
  const old = c.equipped[slot], oldRoll = c.rolled[slot] ?? null, oldSock = c.socketed[slot] ?? null;
  takeSlot(c, i, 1);
  if (old && add(c, old, 1, oldRoll, oldSock) > 0) { taken.qty += 1; c.inventory[i] = taken; return false; }   // no room: put it back as it was
  c.equipped[slot] = id;
  if (roll) c.rolled[slot] = roll; else delete c.rolled[slot];
  if (socketed?.length) c.socketed[slot] = socketed; else delete c.socketed[slot];   // its mods go on with it (task #40)
  return true;
}

/** Take off whatever is in a worn slot, back into the bag. False if the bag is full. */
export function unwear(c, slot) {
  const id = c.equipped?.[slot];
  if (!id || !WORN_SLOTS.includes(slot)) return false;
  if (add(c, id, 1, c.rolled?.[slot] ?? null, c.socketed?.[slot] ?? null) > 0) return false;
  c.equipped[slot] = null;
  if (c.rolled) delete c.rolled[slot];
  if (c.socketed) delete c.socketed[slot];
  return true;
}

