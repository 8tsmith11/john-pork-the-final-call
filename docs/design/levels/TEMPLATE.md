# Level brainstorm template

Brainstorm a level here first (Trevor: "write levels as text grids... what key ideas are in each level, what makes
them unique"). The grid goes straight into the level builder (`fromGrid` in src/content/maps/builder.js), so a
brainstorm becomes a playable [SCAFFOLD] map in minutes. Copy this file to `docs/design/levels/<map_id>.md`.
Spoilers go in docs/sealed/, not here.

## <Level name> (`map_id`, act N, region)

**Key ideas (what makes it unique):** 2-4 bullets. The one thing you'll remember about this place; the
mechanic or twist it's built around; why a player would come back.
- …

**Purpose in the act:** what the player does here, what they get, where it leads.

**Grid** (tile legend: `#` wall, `.` floor, `,` asphalt, `g` grass, `~` water, `=` rail/glass, `T` tree, `m` stone,
`c` carpet, `:` tunnel floor, `t` track; things: `@` spawn, `E` enemy, `B` boss, `N` NPC, `D` exit/door,
`?` object or puzzle, `$` loot. Add your own letters in the legend below.)

```
##############
#@....?....E.#
#..######....#
#..#....#..N.#
#.......#....#
######DD######
```

**Legend:** `E` = enemy.rotling · `N` = npc.someone ("[scaffold] says hi") · `D` = exit to metro_plaza (walk-on)
· `?` = obj.crate (loot: parts)

**Encounters:** who fights where, and why it's interesting (cover, hazards, a choke, a timer).

**Secrets / side content:** at least one secret, one side quest or job, one person with a job (10-scope.md rule).

**Polish needs (for the [POLISH] task):** art to draw, writing to do, Spanish, sound.
