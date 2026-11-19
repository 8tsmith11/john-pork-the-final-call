# 11 · Level builder and content builders

Trevor asked for tools we agents use to make things faster: a level builder that plugs into the map format, plus
builders for bosses and enemies, NPCs and items. Brainstorm in plain text first, then build the scaffold.

## Workflow (scaffold first, polish second: PROCESS.md)
1. **Brainstorm** in `docs/design/levels/<map>.md` and `docs/design/bosses/<boss>.md` (TEMPLATE.md in each):
   a text grid with the key ideas, and bosses in one qualitative-plus-quantitative format.
2. **Scaffold** with the builders. Placeholders are fine; mark placeholder text with "[scaffold]".
3. **Check** with `node tools/level/check.mjs <map>` and **look** with `node tools/level/preview.mjs <map>`. Then
   play it in the browser.
4. File the **[POLISH]** task: art, writing, Spanish, review. `check.mjs` lists the "[scaffold]" lines left.

## Level builder (src/content/maps/builder.js)
- `fromGrid({ id, name, rows, legend, fill, outdoor, act, ... })`: a brainstorm grid becomes a map. Tile
  characters are the normal legend; any other character maps to `{ enemy | spawn | npc | exit | prop | scenery }`.
  Adjacent exit cells (`DD`) merge into one exit `w` tiles wide.
- `level({ id, name, w, h, fill, border })` with `.rect`, `.road`, `.room` (walled, doors always have wall on both
  sides), `.building` (a footprint with an entrance, optionally an exit into an interior), `.prop`, `.scenery`,
  `.npc`, `.exit`, `.enemy`, `.enemies(kind, n, area)` (deterministic scatter), `.spawn`, `.edit`, `.build()`.
- Both produce exactly what `makeMap` returns. Register the map in `src/content/maps/index.js` and its region in
  `src/content/regions.js` (a test enforces that every map has a region).

## Content builders (src/content/builders.js)
- `defineEnemy({ id, name, hp, speed, damage, ai, ... })` returns `[id, def]` for ENEMIES (AIs: lunge, kite, swarm,
  charge, lullaby, mirror).
- `defineBoss({ name, hp, perPlayer, phases: [p1, p2, p3], guard, mini, wake, phaseGate })` returns
  `(playerCount) => def`, like switchmanDef. Patterns are checked against the library.
- `defineNpc({ id, x, y, label, talk | text, mood, hi, later })` returns `{ object, life }`: the map object plus the
  NPC_LIFE entry.
- `defineItem({ id, name, slot, text, mods, swing, gun, price, es })` returns `[id, def]` (`.shop` when priced).
- Every builder validates and throws a clear message, so a typo fails the test suite, not the game.

## Tools
- `tools/level/preview.mjs <map>`: the map as text, with spawns, enemies, bosses, NPCs, exits, doors and objects
  marked, plus a list of everything on it.
- `tools/level/check.mjs [maps]`: reachability, walled doors, duplicate ids, enemies on solid tiles, exits to
  missing maps, and "[scaffold]" text left. Exits non-zero on problems.
- `tools/scope.mjs`: how far each act is from the scope targets (10-scope.md).
