// Room states: a map whose things and mood change with the story, without special cases in the scene.
//   object  hideAfter: 'flag'   gone once the flag is set (taken, broken, moved away)
//           showAfter: 'flag'   only there once the flag is set
//   map     moods: [{ flag, unless?, dark?, lightsOff?, heat?, burn?: [tx, ty] }]
//           while `flag` is set and `unless` isn't: a darker room (dark: the darkness floor), lit things off (only
//           people and exits still glow), a heat shimmer, a scorch on the floor at burn.
// mapView() is what the scene and the sim use in place of the raw map, on host and guests alike (both read the same
// synced flags), so everyone sees the same room.

const has = (flags, k) => !!(k && flags?.[k]);

/** The map as it stands for these flags: the same map when nothing is flagged, else a view with its own object list. */
export function mapView(map, flags = {}) {
  if (!map?.objects) return map;
  const keep = (o) => !(o.hideAfter && has(flags, o.hideAfter)) && !(o.showAfter && !has(flags, o.showAfter));
  if (map.objects.every(keep)) return map;
  const v = Object.create(map);   // everything else (tiles, solid(), doors, spawns) comes from the map itself
  v.objects = map.objects.filter(keep);
  return v;
}

/** The room's mood for these flags: { dark, lightsOff, heat, burn } (dark null when no mood sets it). */
export function roomMood(map, flags = {}) {
  const out = { dark: null, lightsOff: false, heat: false, burn: null };
  for (const m of map?.moods ?? []) {
    if (!has(flags, m.flag) || has(flags, m.unless)) continue;
    if (m.dark != null) out.dark = Math.max(out.dark ?? 0, m.dark);
    out.lightsOff ||= !!m.lightsOff; out.heat ||= !!m.heat;
    if (m.burn) out.burn = m.burn;
  }
  return out;
}
