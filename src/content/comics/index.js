// Comic triggers: play a comic once per world when a story flag is set (host and solo; everyone sees
// it). Placement is the story section's call (the Lore Keeper): add { id, flag, tag?, map? } here.
//   id    a comic in this folder          flag  the story flag that starts it
//   tag   only the pages with this tag    map   only on this map
// Played comics are remembered in the save as comic.<id>[.<tag>].played. Keep ids, tags and flags
// generic: no spoilers (PROCESS, "Spoilers and surprises"). To try one without placing it: ?comic=<id>.
export const COMIC_TRIGGERS = [];
