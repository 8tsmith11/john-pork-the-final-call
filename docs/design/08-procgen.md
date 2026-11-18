# 08. Procedural generation

> Draft (trevor's agent). Brief: some things are procedural so every run differs, **kept safe so
> the world stays reasonable**. Very important things are authored, and some unimportant things are too.

## The rule of thumb
| Authored (never random) | Seeded (rolled once per world, stored in the save) | Procedural (varies; validated) |
|---|---|---|
| The main story, key characters, boss arenas, major landmarks, every reveal | **World rolls:** which twist variant is true, the balloon's Act 2 landing site, which NPCs live or die offscreen, Halvard's price, the pixelated NPC's spot | Coderot villains, loot rolls, side alleys/apartment interiors on the Route 1 street, fish, rotter lines, crowd people, weather, minor graffiti |
| Hand-placed puzzles and secrets | Shop inventories per act, the faction "temperature" at start | The order of minor encounters, ambient events (a blackout, an abatement sweep) |

## Seeds and streams (built)
One world seed → **independent named streams** (`rolls`, `rotVillains`, `loot`, `fish`, `crowd`,
`worldgen`...). Adding a new random thing never reshuffles the others. World rolls happen once, at
new-game time, and never re-roll.

## Validators (required before any generated content ships)
- **Reachability:** every exit and objective is reachable (flood fill), with no softlocks.
- **Fairness:** generated bosses always have a telegraph and an escape route, and damage is capped
  by act.
- **Coherence:** generated names come from curated tables only, and no generated text touches
  story canon.
- **Re-roll locally:** if validation fails, re-roll *that stream's* local draw, not the world.

## Planned generators (target)
1. **Route 1 street** (Act 1–2): a strip of storefronts and alleys assembled from authored chunks
   (a stall, a pawn shop, a clinic, an empty lot, an abatement site), chosen and ordered by seed,
   with authored anchors at both ends.
2. **Apartment interiors** (side quests in ASTER and elsewhere): furniture and clutter generated
   from room-type kits, so every neighbor's place differs.
3. **Coderot villains** (all acts): see 07.
4. **Loot:** base items authored, rolled affixes from a small curated pool (no "+3% of nothing").
5. **Ambient life:** crowds (built), weather, and timed world events.
6. **Rotter lines:** fragments recombined from a curated phrase bank, plus one hand-written
   coherent line per world (seeded).
