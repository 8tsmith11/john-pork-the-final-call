// Same five-tile radius as Performances' full-volume instrument range.
export const INSTRUMENT_RADIUS = 80;

/** Local listening state, derived from the same snapshot on host and clients. */
export function performanceMix(snap, localId) {
  const me = snap?.players?.find((p) => p.id === localId);
  const nearby = !!me && snap.players.some((p) => p.pl && !p.dn
    && Math.hypot(p.x - me.x, p.y - me.y) <= INSTRUMENT_RADIUS);
  const boss = !!snap?.enemies?.some((e) => e.boss && e.hp > 0);
  return { nearby, boss, background: nearby && !boss ? 0 : 1 };
}
