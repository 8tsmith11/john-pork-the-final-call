// The customization station's rules (task #40): mods slot into sockets on weapons and armor, and come back out.
// A piece in the bag keeps its mods on the bag slot ({ id, qty, socketed: [...] }); a worn piece keeps them in
// char.socketed[slot] (inventory.wear/unwear carry them across). Weapons stay in the bag while held. Pure; the host
// applies these in co-op. Implant mods wait on the story (how the station fits the implant and analog lines).
import { ITEMS, socketsFor } from '../content/items.js';
import * as Inv from './inventory.js';

/** ref: { bag: index } for a piece in the bag (held weapons included), or { worn: slot } for worn armor. */
function target(c, ref) {
  if (ref?.bag != null) {
    const s = c.inventory?.[ref.bag]; if (!s) return null;
    return { def: ITEMS[s.id], list: () => s.socketed ?? [], set: (l) => { if (l.length) s.socketed = l; else delete s.socketed; } };
  }
  if (ref?.worn) {
    const id = c.equipped?.[ref.worn]; if (!id) return null;
    return { def: ITEMS[id], list: () => c.socketed?.[ref.worn] ?? [], set: (l) => { c.socketed ??= {}; if (l.length) c.socketed[ref.worn] = l; else delete c.socketed[ref.worn]; } };
  }
  return null;
}

export const socketInfo = (c, ref) => { const t = target(c, ref); return t ? { def: t.def, size: socketsFor(t.def), mods: [...t.list()] } : null; };

export function canInsert(c, ref, modId) {
  const t = target(c, ref), mod = ITEMS[modId];
  if (!t || !mod || mod.slot !== 'mod' || Inv.count(c, modId) < 1) return false;
  if (!mod.fits?.includes(t.def?.slot)) return false;
  if (ref.bag != null && (c.inventory[ref.bag]?.qty ?? 0) > 1) return false;   // one piece at a time
  return t.list().filter(Boolean).length < socketsFor(t.def);
}
export function insert(c, ref, modId) {
  if (!canInsert(c, ref, modId)) return false;
  const t = target(c, ref);
  Inv.remove(c, modId, 1);   // only mod stacks change, so the target piece's slot stays put
  t.set([...t.list().filter(Boolean), modId]);
  return true;
}
export function extract(c, ref, k) {
  const t = target(c, ref); if (!t) return false;
  const l = [...t.list()], id = l[k]; if (!id) return false;
  if (Inv.add(c, id) > 0) return false;   // no room in the bag
  l.splice(k, 1); t.set(l);
  return true;
}
