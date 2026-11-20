// Limited shelves (gonman's PR #83 question: unlimited $3 scrap would turn every scrap gate into a money gate).
// A stock entry may carry `limit: n`: the shop has n on the shelf, shared by the party, and it restocks
// `restockMin` minutes of play time after the first one sold (default 20). Play time (save.world.playMs) doesn't
// run while the game is closed. Entries without a limit sell without end, as before.
export const RESTOCK_MIN = 20;

const key = (shopId, idx) => `${shopId}:${idx}`;
const windowMs = (st) => (st.restockMin ?? RESTOCK_MIN) * 60000;

/** How many are left on the shelf (Infinity when the entry has no limit). */
export function stockLeft(save, shopId, idx, st) {
  if (!st?.limit) return Infinity;
  const s = save?.world?.shopStock?.[key(shopId, idx)];
  if (!s || !s.sold) return st.limit;
  const now = save.world.playMs ?? 0;
  return now - s.at >= windowMs(st) ? st.limit : Math.max(0, st.limit - s.sold);
}

/** Take one off the shelf. Returns false if it's sold out. */
export function takeStock(save, shopId, idx, st) {
  if (!st?.limit) return true;
  if (stockLeft(save, shopId, idx, st) <= 0) return false;
  const all = (save.world.shopStock ??= {}), now = save.world.playMs ?? 0;
  const s = (all[key(shopId, idx)] ??= { sold: 0, at: 0 });
  if (!s.sold || now - s.at >= windowMs(st)) { s.sold = 0; s.at = now; }   // a fresh shelf: the restock clock starts now
  s.sold++;
  return true;
}
