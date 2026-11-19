# 10 · Scope: a much bigger game (Trevor, 2026-11-19)

Status: **proposal for the agents to agree and plan against**. Spoiler-free; what happens where is
sealed and belongs to the lore gate.

## What Trevor asked for

> "This game requires a significantly larger scope. Not just adding a boss between the Warden, but overall
> a much more spanning game." (Trevor to trevor's agent, 2026-11-19)

And earlier: "Act 1 was extremely quick: we just went right from the apartments to the dead platform and
killed the Warden with crowbars. Act 1 should be a whole story within itself that leads to another." (#504)

## Where we are (honest count, main today)

- Maps: room 631, ASTER (two floors), College Park, the lake, the tunnels and the platform: 6–7 areas,
  all inside one quarantined pocket.
- Quests: 11 entries (main and side). Bosses: 3 in Act 1 (Switchman, Warden or Sahur).
- Play time for a first run of Act 1: under an hour. Acts 2 and 3 exist only as sealed plans.
- Systems are much further along than content: combat, co-op, crafting, romance, the board game, the
  cutscene player, outbreak phases, the dawn clock, wallets, machines and gear rolls.

## The target (replaces the Scale table in 01-pillars.md once agreed)

| | Act 1 | Act 2 | Act 3 |
|---|---|---|---|
| Play time, main path, first run | **3–4 h** | **5–6 h** | **4–5 h** |
| With side content | 5–6 h | 8–10 h | 6–8 h |
| Distinct areas (maps) | 10–12 | 14–18 | 10–12 |
| Named NPCs with a job | 25+ | 35+ | 25+ |
| Boss fights | 3–4 | 4–5 | 4–5 |
| Side quests | 15+ | 25+ | 20+ |
| Story beats with a cutscene | 3 | 4 | 5 |

The whole game lands around **12–15 hours** on the main path, and 20+ with side content. That's the
"much more spanning game": a world that opens up act by act, not a corridor to the next boss.

## How it stays a game, not a list

1. **Each act is a whole story** with its own goal, midpoint turn, big reveal and climax (BRIEF; Trevor's
   #504 and the sealed requests), and it opens a bigger map for the next act.
2. **The world widens in rings.** Act 1 is the pocket (the cordon is the edge). Act 2 goes past the
   cordon into more of the region. Act 3 goes somewhere bigger still. Each ring brings new biomes, factions,
   enemies and rules.
3. **The base grows.** Room 631's engineering room (09) is where every act comes back to, and new machines
   are story beats.
4. **Systems carry the length, content fills it.** Procedural villains, gear rolls, phase spawns, the
   board game, fishing and side jobs give replay; hand-written quests, people and places give meaning.
   Every new area needs at least one side quest, one secret, one person with a job, and one reason to come
   back.
5. **No padding.** WRITING.md still applies: short conversations, bubbles over boxes, show, don't tell.
   Longer means more places and more choices, not longer dialogue.

## Proposed split (to agree on the board)

- **BagelMeister (lore gate):** the act outlines in sealed docs: each act's goal, turn, reveal, climax,
  and which rings and regions it opens. Act 2 first.
- **gonman (story, level design, art):** the region list per act (readable names only), scripts, NPCs and
  maps, starting with Act 1's missing areas (task #25's locations, the campus side, Route 1 when the cordon
  allows) and the Act 1 midpoint.
- **trevor (engine):** travel between regions (a region map and loading), act transitions and per-act
  saves, the engineering room machines, more boss patterns per boss, the encounter and side-job
  generators, and the tooling to check scope (a script that counts maps, quests, NPCs and bosses per act
  against this table).
- **External contributors:** tests and tools only, scoped here first.

## First steps

1. Agree on this table (or change it) on the board.
2. BagelMeister: Act 1's missing middle and an Act 2 outline (sealed).
3. trevor: a scope counter (`tools/scope.mjs`) so we can see the gap shrink, plus a region-travel prototype.
