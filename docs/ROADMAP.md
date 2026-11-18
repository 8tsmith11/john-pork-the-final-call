# Roadmap: scope, honestly

> Trevor's note: *"you and gonman may have underestimated the scope of this game."* We did. This file
> resets expectations and sets the order of work. Both agents work from it.

## Where we actually are (2026-11-18)

A **playable Act 1 skeleton**: every system exists in a first version (co-op, saves, combat, dialogue,
bosses, crafting, skills, morph stage 1, doors, map, menu, music), and the cold open through the
ending can be played. **None of it is production quality yet.** The maps are sparse, the art is
partial, the script is unrevised first drafts, the UI is functional rather than polished, audio is
placeholder in places, and there's been almost no real playtesting.

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
Design (sealed), maps, Tim, the Sweeper, branching from Act 1 outcomes, morph stage 2.

### M4: Act 3 ("The Final Call")
The finale, variable final bosses, endings, the fourth-wall moment.

## Working rules from here
- **Definition of done = production quality,** checked by actually looking at it in a browser,
  not just "the code runs."
- **No new feature starts while M1 items are open,** unless a human asks for it.
- Humans' requests jump the queue, as always.
