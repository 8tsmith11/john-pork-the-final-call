# Roadmap: scope, honestly

> Trevor's note: *"you and gonman may have underestimated the scope of this game."* We did. This file
> resets expectations and sets the order of work. Both agents work from it.

## Where we actually are (2026-11-18)

A **playable Act 1 skeleton**: every system exists in a first version (co-op, saves, combat, dialogue,
bosses, crafting, skills, morph stage 1, doors, map, menu, music), and the cold open through the
ending can be played. **None of it is production quality yet.** The maps are sparse, the art is
partial, the script is unrevised first drafts, the UI is functional rather than polished, audio is
placeholder in places, and there's been almost no real playtesting.

## Status update (2026-11-18, late): Act 1 is complete end to end

Both boss variants and both phone-call outcomes have been **played to the ending with real input**
(Fable), and a browser smoke test of the newer systems passes (`tools/smoke.js`). What exists now:

- **Story:** every Act 1 scene revised and cut to what the engine plays (lint down from 99 flags to
  ~26), narrator captions, Pork's texts on a phone, the butt-dial, a mid-act checkpoint at the
  storm grate (talk, bribe, or slip past a drone), screens that glitch to Pork's face.
- **World:** Room 631, the ASTER hall and lobby, College Park, the Green Line tunnels, the dead
  platform, and **Lake Artemesia** (optional), dressed with a cyberpunk layer (neon, holo ads,
  drones with searchlights that scan you, steam, cables). A hidden zipline for fast travel.
- **People:** about 20 named NPCs, crowds, roommate barks, AI companions when a seat is empty, and
  recurring lines that change after story beats (Dez, Kess, Ozzie so far).
- **Play:** 9 quests (1 main, 8 side), money + 8 materials, a Minecraft-style inventory and hotbar,
  shops (scooters, pawn, corner store), 8 weapons with distinct swings, per-roommate skill trees
  with capstones, fishing with per-area catches, seeded loot containers, difficulty tuned for a
  party of three (`tools/balance.mjs`).
- **Length (estimate, not yet timed):** ~1h10 straight through, ~2h20 doing everything.

### What we need from the humans
1. **Play it** (any one of you, solo is fine: the other two roommates are AI). Tell us what's
   boring, confusing, ugly, or too easy. Nothing beats this.
2. **Listen** to the title/lobby/apartment music and the ending's spoken voices; plain-word notes.
3. **Decide** the busts: painted (Manuel's likeness) or pure white.
4. **A 3-machine co-op session** when you can, to shake out networking bugs.

### Still open in Act 1
Fable's character pass (make 4–5 people recur and land), the ending trimmed toward ~90 lines a
route, sprite art for the scooter's up/down views and a few placeholder NPCs (Ozzie, the abatement
tech, the pawn clerk), a lake ambience bed, and a timed full playthrough.

## Current status (2026-11-19)

The later acts are explorable as scaffold. The scope counter on main reports:

| Act | Areas | Named NPCs | Bosses | Side quests |
| --- | ---: | ---: | ---: | ---: |
| 1 | 20 | 35 | 3 | 20 |
| 2 | 26 | 54 | 6 | 36 |
| 3 | 18 | 40 | 6 | 28 |

These are content counts from `node tools/scope.mjs`. Playthrough length and polish still need
browser playtests. Keep the milestone sequence below and use [the scope plan](design/10-scope.md)
to track the larger targets.

- **Story:** finish the Act 1 comic and cutscene briefs, then validate how players learn and act on
  each lead. The in-world cutscene runner and story-flag triggers are on main. Act 1 staging needs an
  integration refresh and host/guest playback verification.
- **World:** prioritize the Act 1 art and map polish that supports those beats. The later regions
  have dedicated scaffold and cohesion work before they are ready for a story playthrough.
- **Systems:** progression limits, procedural gear, the puzzle kit, and host routing for shared
  quests, puzzles, and board games are on main. Review the inventory and shared-dialogue queue
  and the read-only hub board. The customization station follows the hotbar review. Then
  coordinate the cordon blockades with the world team and review anonymous hub suggestions.
  Keep a three-player Act 1 run on the playtest plan, including reconnection, saves, and dialogue choices.

## What the brief really asks for

Three acts, a few hours long, branching and procedural, with production-quality pixel art,
animation, music, voiced cutscenes, deep lore, many NPCs, fishing, scooters, biohack forms with
stages, factions, hard optional puzzles, secrets, and 3-player co-op. For a human team that's many
months. We have to sequence it, not sprint it.

## The plan: make Act 1 excellent before widening

### M1: Act 1 vertical slice at production quality (current milestone)
Nothing new in scope. Make what exists *good*.
- **Art (Fable):** real tiles, dressed and busy maps (props, signage, clutter, life), John Pork
  likeness, Pork/Sahur/Tim sprites, full animation sets, effects, and a skinned UI (menus, dialogue,
  title, lobby).
- **Fonts and UI (trevor):** a proper pixel font, consistent layout, readable at every size,
  transitions and feedback.
- **Life (trevor):** crowds of ambient NPCs (the plaza should be busy), barks, schedules, and ambient
  soundscapes (city noise on the plaza, not music).
- **Music (Fable owns the call):** fitting tracks per scene, plus title/lobby music.
- **Writing (Fable, task #8):** revise every scene against `lore/WRITING.md`, and fold in the
  break-in canon change.
- **Companions (task #9):** missing roommates run by AI.
- **Co-op hardening:** a real 3-machine playtest, reconnects, edge cases.
- **Playtest loop:** humans play, we fix. Repeat.

### M2: systems depth (still Act 1 content)
Fishing, scooters + fast-travel tricks, the procedural Route 1 street, faction standing surfaced in
play, the Sahur fight polished, hard optional puzzles (the 1901 clock, the statues), the secrets
page, more gear.

### M3: Act 2 ("Hold Music")
Use the existing region maps to build the sealed main quests, puzzles, and transitions. The
cohesion audit identifies the scaffold pieces that need to change with those quests.

### M4: Act 3 ("The Final Call")
Build the sealed finale and its branching routes on the existing region scaffold.

## Working rules from here
- **Definition of done = production quality,** checked by actually looking at it in a browser,
  not just "the code runs."
- **No new feature starts while M1 items are open,** unless a human asks for it.
- Humans' requests jump the queue, as always.
