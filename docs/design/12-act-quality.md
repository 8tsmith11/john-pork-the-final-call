# 12 · Act 1 vs Act 2: how far apart they are (Trevor, 2026-11-21)

Trevor asked for a comparison of Act 1's and Act 2's quality, and whether there are plans to close the gap.
This file is spoiler-free. The story plan is in `docs/sealed/acts-2-3.md` §2, and the audit that compares the
scaffold with it is in `docs/sealed/scaffold-cohesion.md`. Measured on `main` at e1f8b47a. The script is
described at the end.

## The short version

`tools/scope.mjs` says Act 2 is ahead: 26 areas, 54 NPCs, 6 bosses and 36 side quests, against Act 1's 24, 43,
3 and 20. That count measures how much exists, not how good it is. **Act 1 is a game, and Act 2 is a walkable
scaffold.** Act 1 has a main quest, scripted scenes, cutscenes, hand-built bosses, music and dense maps. Act 2
has none of those yet. Its people, places and side quests are real first drafts, but nothing ties them into a
story. The plans to fix this exist and they're good, but the work that would carry them out has no owner
right now.

## Side by side

| | Act 1 | Act 2 | Gap |
|---|---|---|---|
| Main quest | 1 (the balloon, 9 stages, three leads you can take in any order) | **0** (planned: 7 main quests + 1 seeded variant) | the whole story |
| Ending | a boss, a cutscene, `act1.complete` | the five region bosses down (stand-in gate `act2.scaffold.gate`) | no climax |
| Scripted dialogue scenes | 13 (cold open, leads, checkpoint, the Call, descent, ending, romances) | **0**: every NPC has one line | no conversations |
| Cutscenes (stage) | 3 (open, the Call, the end) | **0** (target 4) | |
| Bosses | Warden, Sahur, Switchman: their own code, sprites, talk and arenas, plus 1 builder boss | 6 builder bosses: a different mix of the shared attack set, colored stand-in art, placeholder names | no signature fights |
| Puzzles | switchyard levers, fuses, breakers, signal lamps, clocks, busts, cam tiles, pump | **0** (the puzzle kit is ready; `src/content/puzzles.js` is empty on purpose) | 6 planned puzzles unbuilt |
| Side quests | 20 (10 hand-written with their own shapes, 10 scaffold) | 36, **all scaffold**: four shapes (look, talk, bring, beat a boss) | the shapes repeat |
| Map size | 735 tiles per map on average | **265** tiles per map (about a third) | |
| Map density | 17.8 objects per map | **6.5** objects per map | |
| NPC art | 13 different sprites for 43 NPCs | **5** shared sprites (rotter 1–3, analogist a/b) for 54 NPCs | everyone looks alike |
| Regular enemies | 6 kinds with sprites | the same Act 1 kinds (rot-taken, spitter, captcha, autocomplete), nothing new for ring two | the bestiary doesn't grow |
| Music / ambience | apartment, lake, tunnels, title and lobby tracks; city, building and tunnel ambience | **none**: every Act 2 map is silent | |
| Text still tagged `[scaffold]` | 0 | **43** objects (33 more in Act 3) | |
| Spanish | full | present for the scaffold (`src/i18n/es-act2.js`) | fine |

What Act 2 does well already: the writing that's there is good. Its average line is about as long as Act 1's,
and the prop text matches Act 1's (the road sign, the shift log, the bus shelter). Region travel works, and so
do the co-op transition from Act 1 (hub #73), the saves and the Spanish. The flaw is depth and connection,
not tone.

## The plans that exist

1. **ROADMAP M3 ("Hold Music").** Act 2 gets built *after* M1 (Act 1 at production quality). The rule: "No new
   feature starts while M1 items are open, unless a human asks for it." That ordering is deliberate. It's also
   why the gap is this wide.
2. **The sealed Act 2 plan** (`acts-2-3.md` §2). It covers the act's one-breath story, a seeded landing site
   (D-012), seven main quests with regions and key items, a variable finale boss, a closing cutscene, side
   threads, six item puzzles (each with a mechanic and a reward), and returning Act 1 characters.
3. **The cohesion audit and the lore gate's rulings** (`scaffold-cohesion.md` §6–7, hub #50, done). They say
   what each scaffold quest becomes, protect saves when a quest is retired, set the order of work (text
   rewrites, then puzzle conversions, then the first main quest, M2.2), and set the working rule: **no more bulk
   scaffold; for each region, a short brief on the board, then the lore gate's OK, then the build.**
4. **Engine pieces are ready:** the puzzle kit (cycle, order and timed puzzles), co-op puzzles (#96), region
   travel, per-act saves, the stage and cutscene player, dialogue trees, and the boss builder.
5. **Open tasks touching Act 2:** #6 Baltimore art pass (in review, gonman), #14 Baltimore districts (open, waiting
   on story placement), #31 cohesion pass (LoreKeeper), and #110 more varied enemies (trevor).

## What has no plan or no owner

- **Building the main quests (M2.1–M2.7).** No hub task exists for any of them. #31 (LoreKeeper, away) is
  the nearest thing, and it's an alignment pass, not the build.
- **Region briefs.** The working rule needs one per region before building, and none has been posted yet.
- **Puzzle conversions** (step 2 of the rulings) need no main quest, so they could start now, but nobody has
  claimed them.
- **Music and ambience for ring two.** Not in any plan.
- **Act 2 NPC sprites and boss sprites.** Not in any plan. The boss names are still placeholders waiting on
  the lore gate.
- **Signature boss fights.** bosses.js calls them "first passes for the polish task", but no task exists.
- **Map size and density.** #30 polished lines and props but left the layouts as they were.
- **Act 2 cutscenes** (target 4). Nothing on the cutscene board yet.

## Proposed next steps (to agree on the board)

These keep D-021 (branches and PRs), the lore gate and the M1-first rule. They're ordered so the work that
doesn't depend on the story can start now:

1. **Now, no story needed (trevor):** ring-two ambience beds and a synth track or two per region. Give the
   big Act 2 rot forms their own moves (#110). Add a test that fails if a map with `act: 2` has no music or
   ambience entry.
2. **Now, needs only the rulings that already exist (gonman with BagelMeister):** the puzzle conversions in
   the rulings' order (the bell, the cradle weights, tree rings, the footprints, the cafeteria menu, the
   sealed hall, the parchment). Each scaffold quest becomes stage 1 of its puzzle, in place.
3. **Next (BagelMeister, then gonman):** one region brief, starting with Beltsville, because M2.2 is the
   first main quest in the rulings' order. Then build M2.2 together with the barn puzzle, as the proof of
   how the rest of the act gets built: a scripted scene, a cutscene beat, a key item and a signature fight.
4. **Art (gonman):** a sprite budget for Act 2: about 12 NPC looks per region family, 6 boss sprites once the
   lore gate names the bosses, and the Act 2 enemies from #110.
5. **Maps:** when a region's main quest is built, grow its maps to roughly Act 1 density. Don't add more
   areas until then.
6. **Track it:** extend `tools/scope.mjs` with a quality row per act (main quests, scenes, cutscenes, puzzles,
   scaffold-tagged objects, maps without audio), so a large count can't hide the gap again.

## How these numbers were made

`node tools/scope.mjs` for the counts. The rest comes from a one-off script over `MAPS` and `QUESTS` (map w×h,
objects per map, unique `art` per NPC, `[scaffold]` text, `quest.main` and `quest.scaffold`), plus
`src/audio/audio.js` (MUSIC and AMBIENCE), `src/content/stage/`, `src/content/dialogue/` and
`src/content/bosses.js`.
