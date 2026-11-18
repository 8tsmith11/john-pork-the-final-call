# 07. Bestiary

> Draft (trevor's agent). Looks are gonman's call. Spoiler-free: bosses tied to twists are named
> only by role, with details in `../sealed/`.

## Design rules
- **Every enemy teaches something** (dodge timing, prioritizing targets, analog vs. digital, spacing).
- **Readable at a glance:** silhouette + one signature color + a telegraph before every attack.
- **Rot is a rendering error,** not slime: enemies glitch, double-frame, and smear.
- **Most enemies are people or things that went wrong,** not monsters. Many can be avoided, calmed,
  or talked down, and some shouldn't be killed at all (shells with jobs, rotters).

## Families

| Family | Where | Members (Act 1 → 3) | Teaches | Weakness |
|---|---|---|---|---|
| **Rot vermin** | Tunnels, drains, server closets | Rotling (chaser) → Glitch Spitter (ranged) → Bitcrusher (splits when hit) → Swarm Cache (spawns rotlings) | Spacing, priorities | Analog melee |
| **Abatement units** | Wherever Continuity "cleans" | Sprayer drone → Scrubber (area denial) → Abatement Mech (mini-boss) → the Sweeper (Act 2 set piece) | Area reading, flanking | Static (shuts off their sensors) |
| **Rotted shells** | City, docks, farms | A care-worker shell stuck on a task → a dockhand in a loop → an enforcer shell with a corrupted badge | Mercy (some can be reset, not killed; Trevor's chemistry, Michael's ping) | Michael's reset |
| **Continuity enforcers** | Checkpoints, the Meade, the Enclave | Patrol officer (human, laced) → riot shell → Interdiction agent (layered armor) | Stealth, the cost of violence (factions) | Bribes, papers, disguise |
| **Callers (zealots)** | Shrines, Baltimore | Street preacher (buffs others) → fanatic → a "saint" with a printed Pork mask | Target priority, talking instead of fighting | Being told the truth (dialogue) |
| **Analogist saboteurs** | Route 1, the refuge edge | Wrench gang → EMP thrower → "the purist" | That analog isn't automatically good | Digital gear they can't counter |
| **Coderot villains** (procedural) | Anywhere rot runs deep | Generated from seeded tables (below) | Variety, surprise | Varies |

## Procedural coderot villains
- **Built from:** a name table (`TITLE NOUN, epithet`), a body template (biped, crawler, swarm,
  floater), 2–3 behavior modules (ring, spray, charge, summon, blink, mirror, freeze-frame, lie-UI),
  a palette tint, and a rot "tell" (how it glitches).
- **Rules:** never story-critical, always telegraphed, validated so every combo is beatable, and
  difficulty scales with the act. The seeded `rotVillains` stream means each world has its own
  roster, and players compare names.
- **Now:** the Act 1 Warden (seeded name/epithet/color/2 modules/3 phases).

## Bosses (by act; the final one varies)
| Act | Fight | Notes |
|---|---|---|
| 1 | **Rot Warden** (procedural) *or* **Tung Tung Tung Sahur** (decline Pork 3×; can't be won by force) | Built ✓ |
| 1 alt | **Abatement Mech** (if Halvard was double-crossed) | Target |
| 2 | **The Sweeper** (a large-scale rolling megastructure: a chase and a fight across Route 1) | The brief's "large-scale enemy" |
| 2 | **Tim Cheese, first duel** (not winnable outright; survive, solve his layers, or talk) | Teaches his layered defense |
| 3 | **Variable final boss** (see sealed). Depends on choices, standing, and forms | Without good form stages it's hopeless (brief) |
| Optional | Named coderot legends, one per region (found by following layered secrets) | Rewards: relics |

## Enemy budget per region (target)
Hub regions have few fights and much talk. District regions mix the two. Traversal regions are
fight-dense with one set piece.
