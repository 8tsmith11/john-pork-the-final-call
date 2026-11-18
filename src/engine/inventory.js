// Slot inventory (human request: "an actual inventory grid with items like Minecraft, and a hotbar").
// Each character's `inventory` is a fixed array of SLOTS entries, each `{ id, qty }` or null.
// Slots 0..8 are the hotbar; 9..35 the backpack grid. Pure JS (Node-tested).
import { ITEMS } from '../content/items.js';

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
  for (const it of items) add(c, it.id, it.qty ?? 1);
  return c.inventory;
}

/** Add n of id; fills existing stacks first, then the first empty slot (hotbar first). Returns leftover. */
export function add(c, id, n = 1) {
  const inv = c.inventory, max = stackOf(id);
  for (let i = 0; i < SLOTS && n > 0; i++) {
    const s = inv[i];
    if (s && s.id === id && s.qty < max) { const k = Math.min(n, max - s.qty); s.qty += k; n -= k; }
  }
  for (let i = 0; i < SLOTS && n > 0; i++) {
    if (!inv[i]) { const k = Math.min(n, max); inv[i] = { id, qty: k }; n -= k; }
  }
  return n;
}

export function count(c, id) { return c.inventory.reduce((t, s) => t + (s && s.id === id ? s.qty : 0), 0); }
export const has = (c, id) => count(c, id) > 0;
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
