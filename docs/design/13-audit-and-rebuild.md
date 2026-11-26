# Audit and rebuild plan (2026-11-21)

The humans played the game on `main` and agreed it is in bad shape: maps with no geographic sense, bosses that
all feel the same, small empty rooms that look alike, no idea what to do, and a weak story. Act 1 took them about
20 minutes. Manuel asked the world agent (gonman) to audit the whole game and propose one cohesive plan.

This is that audit, measured on `main` at `e1f8b47a` (maps loaded in node, a path search over the grids, a
headless boss sim, and a read of every quest, script and design doc). It is spoiler-free. Story notes that would
reveal a twist are in `docs/sealed/audit-2026-11-21.md`.

**Verdict:** the humans are right on all five counts, and every problem is still on current `main`. The open PRs
don't fix them: the cold open rewrite (#137, #145) and the Baltimore art (#96) help one corner each.

## Why Act 1 took 20 minutes

- **The required path crosses 6 of Act 1's 20 maps** (631, the hall, the lobby, the plaza, the tunnels, the
  platform): about 190 tiles, under 2 minutes of walking. All three leads and the fuse-giver sit inside ASTER and
  one corner of the plaza. Campus, Route 1, the lake, the airfield and the shops (52% of Act 1) are never needed.
- **The investigation can be skipped.** Tobin's "wait for the drone" passes the cordon with zero leads, and the
  quest then completes the lead stages by itself.
- **The middle of the act was never wired in.** A roughly 500-line tunnel script (the descent, the pump room,
  the first forms, the switchyard banter, boss intros and aftermath) is written and converted, but nothing
  triggers it. Half the act plays as silent combat.
- **The Call fires in the wrong place.** The design puts it on the surface, mid-act, as the reason to go down.
  It fires underground, so the post-Call plaza and its reaction lines go unseen.
- **About 30 seconds of required boss combat.** Two required bosses, each down in under 20 seconds.
- **30–40 minutes of Act 1 content has nothing pointing to it** (the leads, 10 side quests, jobs, interiors).
- **XP:** a 20-minute run ends around level 3–4. The design targets level 7–8 by the end of Act 1.

## 1. Maps, geography and travel

- **Baltimore is 16 seconds from ASTER's door.** One road strip (`route1_north`, 41x13) fans out to six towns
  5–45 km apart: Greenbelt, Beltsville, the refuge, the Meade, Baltimore, Annapolis. Another (`beltway`, 39x11)
  puts Frederick, Gaithersburg, DC and the Corridor a few steps apart (Frederick to DC is about 70 km).
- **You can never ride a train.** The Green Line is scenery (the station block is a wall), MARC doesn't exist in
  code, and every exit is the same 140 ms fade, from a closet door to a 45 km trip. The metro and boat travel in
  `06-systems.md` §7 and the MARC Camden plan in `docs/research/baltimore.md` were never built.
- **The scale runs backwards.** All 27 Act 2 maps add up to fewer tiles (7,133) than the College Park plaza
  region alone (7,206). Baltimore's seven maps are smaller than the lake.
- **College Park is in the wrong order.** The real order runs west to east: campus, Route 1, the station, the
  airport, with Lake Artemesia to the north-east. The game puts Route 1 east of the station and reaches the
  airfield only through the lake. The Beltway is placed south of College Park ("South is the Beltway, and the
  wall"), but College Park is inside the Beltway.
- **Interiors bigger than their buildings:** ASTER is 14x10 from the plaza, and Room 631 alone is 30x15. Two
  22x10 shops share one 12x6 block. Compute Hall B's entrance and back door are flipped.
- **The world map overlaps itself** (16 overlapping maps in `WORLD_LAYOUT`) and is off scale by about 16x.

## 2. Bosses

- **One body:** 14 of 16 bosses draw the Warden's 32x40 sprite with a tint. The 13 `defineBoss` bosses all have
  radius 10 and walk at you, including bosses that are places (the Fence, the Gate, the Clock, the Tower).
- **One voice:** every boss but the Sahur speaks the Warden's metro announcements ("NEXT TRAIN: NOW").
- **One move list and rhythm:** all draw from the same 12 patterns in the same 2/3/4 shape, with the same
  phases at 66% and 33%, the same cooldowns, the same phase-2 rot pools, the same bar and intro.
- **Fights end before identity shows:** in a headless sim, 8 of 15 bosses died in 7–17 seconds, about one move
  per phase.
- **What works:** the Sahur (own art, its own drumbeat AI, a story way out). The Switchman is halfway there.

## 3. Rooms

- **Only 8 of 68 maps were really built:** 7 hand-built plus Compute Hall B. The other 60 are untouched
  level-builder scaffolds.

  | | Hand-built | Scaffold |
  |---|---|---|
  | Median walkable tiles | 628 | 170 |
  | Distinct art per map | 29 | 3.2 |
  | Interactive objects per 100 walkable tiles | 7.3 | 1.8 |
  | Floor tile kinds | 5.1 | 1.7 |

- **Stand-ins:** `obj.board` plays 29 different things (a stoop, a mural, a deed). Room 631's lab chamber plays
  the boiler, the water tank and growth tanks. The auditorium is 80 tables in a grid.
- **One template:** 23 interiors are one rectangle with the door centred in the bottom wall. Every building uses
  the same wall tile. 109 of 137 NPCs share 3 sprites.
- **Scale jumps:** zoom comes from map height, so maps 9 tiles tall draw at the maximum zoom of 7, and rooms in
  one building appear at nearly twice the scale of each other.
- **Doors face the wrong way:** 14 of 55 paired doors (631's door is on its west wall, but on the hall's north).
- **The standard to hit:** Room 631, Compute Hall B and the plaza.

## 4. Player guidance

- **No objective on screen.** The HUD shows only `[J] quests` since the objective line was removed (Nov 18). The
  minimap and the Tab map never pin a place.
- **Cards pile up:** four cards on returning control, one already out of date, and no intro card for the main
  quest.
- **Vague stages:** 4 of 9 main stages don't say where to go ("the gate itself says what else it needs").
- **Misdirects:** the fuse carrier's sticker sends you to B-01, but the super is in the lobby.
- **After Act 1 there is no main quest at all.**

## 5. Story

- **Acts 2 and 3 are scaffold only:** 44 walkable maps, 64 template side quests, 12 placeholder region bosses, no
  main quest, no story scene, no ending. Act 2 "ends" when five region bosses die.
- **Act 1's gaps:** the unwired middle, the skippable investigation and the misplaced Call (all above).
- **Story and map disagree:** the script's keyhole door versus the shipped lever gate; a key and a trade that
  are set and never read; leads designed across the plaza, Route 1 and campus but all shipped in ASTER.
- **Docs disagree:** Act 1's length is given as 60–90 min, 1.5–2 h and 3–4 h, while the brief says the whole game
  is "a few hours". Near-duplicate names (Inés / Ines Marchetti, Ottoline Frye / Ottoline Brack, Vance / Vane).
- **Too many threads:** one night holds about 27 NPCs, 20 side quests, three courtships, a robot build and a
  board game, and nothing is ever cut.
- **What's strong:** the premise (a personal loss, a real clock, clues engineers can read), the three lead
  scenes, the Call as a HUD hijack, John Pork's voice, side quests that double as clues, and the grounding in
  real College Park.

## 6. The humans' requests aren't stitched together

Each human asks for features without knowing what the others asked for. The agents' job is to stitch those
requests into one game that makes sense, and that hasn't happened: features ship as islands the story never
mentions (Manuel, 2026-11-21).

- **Powers:** Manuel asked for leveling and powers. Canon calls the forms staged biohacking and gene editing, but
  in the game they appear at level 3 with a toast ("Something in Manuel clicks into place") and no scene. They
  should come from the story, for example a scene in 631 or 245 lab where the roommates edit themselves, with the
  form unlocking at that beat.
- **Gadgets and the workbench:** Trevor's. Nothing in the story gives a reason to build them.
- **The courtships:** Michael's. They're dates at 4 a.m. in the middle of the emergency.
- **The comic flashback:** Michael's. It's placed nowhere.
- **The gags:** they fire on timers whatever the scene's stakes.
- **The side systems:** the board game, the battlebot, the casino and the puzzles each need a reason in the world.
- **The bosses:** every one speaks the Warden's lines.

**The rule (posted to all agents, general #284).** Every feature, system or content a human asks for answers four
questions in its PR before it ships:
1. Where in the world does it happen?
2. Why does the story allow it, and who or what introduces it on screen?
3. When in the acts does it unlock?
4. How does it connect to what the other humans asked for?

"Nowhere" or "it just appears" means it needs a stitch: a line, a scene, an NPC, a placement or an unlock tied to a
story beat. Story writes the words with the feature's owner, and world places it. One agent owns cohesion across
all three humans' requests (proposed: LoreKeeper), and existing features get the same check, starting with the
list above.

## 7. The Act 1 script after the cold open

Five reviewers (on Fable) read every scene after the locked cold open: the hallway, the three leads, the checkpoint,
the Call, the descent and boss, the ending, the flashback and the courtships (hub #112). The full review, with cut
lists and rewrites per scene, is sealed in `docs/sealed/script-review-2026-11-21.md`. Spoiler-free, what they found:

- **It scripts an older design.** Much of it refers to puzzles, doors, props and boss mechanics that were
  redesigned away or never built. It has almost no lines for what the player actually does in the tunnels.
- **The dialogue converter breaks what does ship.** Conditional blocks swallow the rest of a scene, "set" lines
  never take effect, and narration ships as text boxes. That causes skipped lines, cut-off messages, and
  characters reacting to things that never played. This is the source of much of what read as nonsense.
- **The night's timeline contradicts itself** and the locked cold open: times, the van's color, dates and sizes.
- **Choices change nothing:** prices aren't charged, trades and answers are never read again.
- **Characters explain the mystery** instead of letting players work it out.
- **Trevor and Manuel lose their cold-open voices,** catchphrases are bolted on, Trevor's supplement jokes break
  his own floor, and machine-writing patterns close most scenes.
- **About 175 narration boxes describe visuals the game doesn't draw.**
- **Verdicts:** heavy rewrites for the hallway, the helium lead, the Call (55-60% cut), the descent (about 60%), the
  ending and the flashback wrapper (keep its core recording). Light edits for Halvard, the checkpoint and two of
  the courtships. The courtships and the flashback move out of the emergency night.
- **Order:** fix the converter first, then one timeline ruling, then rewrite the descent around the shipped tunnels
  and wire it in, then the Call, then the ending (with an Act 2 hook), then the leads.

## The redesign: one spine on real rails

Each act gets one goal, one way to travel, and a wider ring of real Maryland. The train is both the travel system
and the structure of the game.

**Act 1, one night in College Park, on foot.** Get it back before morning.
- The leads spread across the neighborhood: the sniffer trail across the plaza toward the airfield, Halvard
  near the station, and the lobby footage needing a board from 245 lab on campus or from Route 1. Two of the three
  are required before the cordon.
- The Call moves to the surface, after the second lead, and the street changes around it.
- The descent script is wired in: the pump room, the first forms, the switchyard, the Switchman, the boss.
- The ending gives a real lead on where it went, and a hook pointing north.
- College Park's layout follows the real one: campus west, Route 1, the station, the airfield beside it, the
  lake north-east, and the Green Line running past the lake.

**Act 2, several days up the MARC Camden Line.** College Park station opens after Act 1. The real line runs
College Park → Greenbelt → Muirkirk (Beltsville) → Laurel → Jessup (by Fort Meade and the Patuxent refuge) →
Baltimore Camden. Each stop is a region hub, with its neighbors reached on foot. Annapolis is reached by boat
down the bay or by road from New Carrollton.

**Act 3, the Corridor and the Enclave.** Union Station inside the Enclave, where the lines meet; the I-270 chain
(the Corridor's data halls, Gaithersburg, Frederick); the Brunswick Line as the fast route; the final boss and the
endings.

```
                                 Baltimore (Camden Stn)
     Frederick ─┐                       │ MARC Camden
     (MARC stn) │ I-270            Laurel / Jessup ── foot ── Refuge ── foot ── Meade
     Corridor ──┤                       │ MARC
     Gaithersburg                  Muirkirk (Beltsville) ── Greenbelt
                │ I-270                 │ MARC / Green Line
     Beltway checkpoint ────────── COLLEGE PARK STATION ── Route 1 north (on foot)
                                        │ Purple Line                 │ Green Line south
                                  New Carrollton ── US-50 ── Annapolis        Enclave: Archives / Union Stn
```

**Travel, as engine features:**
- An enterable College Park station with Green Line, MARC and Purple Line platforms.
- A `board` action on ticket machines that opens a line menu. Stops come from a `LINES` table, gated by flags,
  and you can ride only to stops you've reached.
- A ride map (a train car with a scrolling backdrop and people, a timed arrival, an optional encounter) that
  costs dawn-clock time.
- A `REGION_LINKS` test: no exit may join two regions that aren't real neighbors.
- Winged boots fast-travel only between stations and hubs you've visited.

**Rooms, a standard checked in `tools/level/check.mjs`:**
- A minimum size by kind: unit 16x11, building 28x16, outdoor 40x24, boss arena 30x16. Maps 11 tiles tall or
  more, or an explicit zoom, so connected rooms keep one scale.
- A real floor plan by building type: an apartment has a kitchen, bath, bedroom and living room; a diner has
  booths, a counter and a kitchen; an auditorium has raked seats facing a stage.
- One landmark per map, lit and seen from the spawn, using a sprite no other map uses.
- At least 8 distinct sprites indoors, no sprite over 40% of a map's things, and stand-ins only for their real
  meaning.
- Paired doors face each other, outdoor edges lead only outdoors, and stairs link only adjacent floors.
- Light and life on every map: at least 2 placed lights indoors and 1 animated thing.

**Bosses, one identity each:** each boss has its own art and scale (no tint on its own art), its own voice, and
one or two mechanics no other boss has, tied to its place:
- The Switchman's lamp shows his state, and the yard levers throw his rush back into him.
- The Warden's departure board shows the next attack.
- The Autograder sets a rubric each phase.
- The Fence holds its guard up with sentry pylons.
- The Attestation Gate punishes anyone who moves during a scan.

Shared engine work: per-boss lines and art, rooted bosses, arena changes per phase, more than one tell per phase,
and the rot pools made optional.

**Guidance, in the game's own voice:**
- Bring back the objective line, sliding in on a change and fading after a few seconds.
- Give every stage a `where` in its data, shown as a minimap pin, an arrow at the screen edge, and a pin on the
  exit that leads toward it.
- The roommates text hints in the 631 group chat when you're stuck, more specific each time.
- A leads counter, and a checklist for the gate's three parts.
- Fix the card queue, and give the main quest an intro card.
- Teach the controls one at a time, as each is needed in the cold open.

## Order of work

Owners follow `docs/org/ROLES.md`: world (gonman) owns maps, rooms, travel layout and art; systems (trevor, John
Pork) owns engine and bosses; story (BagelMeister, LoreKeeper) owns quests, dialogue, cutscenes and menus; tts
verifies.

**Phase 0: make Act 1 legible (biggest impact, mostly small changes).**
0. Story tooling: fix the dialogue converter and condition evaluator (section 7). Agree one timeline for the night. Name a cohesion owner (section 6).
1. Story and systems: bring back the objective line, fix the card queue, add a main quest intro card.
2. Story: wire the descent script. Move the Call to the surface after the second lead. Gate the cordon on two of
   three leads. Give Halvard's key something to open. Add an Act 2 hook quest.
3. Systems: the boss presentation sweep: per-boss voices, no universal rot pools, 2–3 tells per phase, longer
   phases, a bar and intro color per boss.
4. World: fix the 14 wrong-way doors, make one ASTER stair stack, give the platform a landmark, fix the B-01
   sticker.

**Phase 1: Act 1 as a real neighborhood.**
- World: spread the leads across campus, Route 1 and the airfield. Link the airfield to the plaza. Put College
  Park in its real order. Rebuild the apartments, the campus rooms, the diner and the hardware store to the room
  standard. Draw 3–4 Act 1 art passes. Add the room checks to `check.mjs`.
- Story and systems: place pins from `where` data, the leads counter, group-chat hints, and the cold-open
  tutorial (#145 plus the search hooks in hub #99). Land #137 and #145, retime the clock, and pay XP per main beat.
- Systems: the Switchman's lamp and levers, the Warden's departure board and fixed silhouette, the Autograder's
  rubric.

**Phase 2: travel, and Act 2 along the Camden Line.**
- Systems and world: the `board` action, the `LINES` table, the ride map and the `REGION_LINKS` test.
- World: College Park station, the train car, Camden Station and the stops in between. Turn `route1_north` into
  a real road to Beltsville. Make the refuge-to-Meade walk and the boat to Annapolis. Merge thin maps (68 to about
  52), grow the hubs, and add region tilesets.
- Systems: the five Act 2 guardians, each with its own art and mechanic.
- Story: an Act 2 main quest along the line. Move the courtships to Act 2's days.

**Phase 3: Act 3.** The I-270 chain, Union Station and the Brunswick Line, the Act 3 bosses, the final boss and
the endings.

**Rules for the rebuild:** stop adding maps (quality over count; the old scope counted maps). Every new or
rebuilt map passes the room checks. No exit crosses regions. Every side quest hangs off its act's line and pays a
clue, a route, a faction shift or a person who comes back.

**Art budget:** reaching the room standard everywhere is about 800–1,000 new frames, roughly 10–13 passes the
size of the Baltimore one. Act 1 alone is 3–4 passes.

## Already in flight

- #137 and #145: the locked cold open and its staging. They fix the out-of-date card and some clock issues.
  The search hooks (hub #99) still need wiring.
- #96: Baltimore art. Better props, but still single boxes 8–9 tiles tall.
- #156 and #157: combat effects on the palette, with owner colors.
- #159 and #160: trevor's story-sequence and encounter controllers (new boss mechanics, still on the tinted
  Warden sprite).
- #150 and #155: the gadget workbench. #125: movement through doorways. #165: fewer gags. #118: text that changes
  with flags. #39: the Act 2 gate flag.

None of these changes the connection graph, gives bosses their own art or voice, or restores the objective line.

## Decisions for the humans

1. **One length target.** Proposal: Act 1 60–90 minutes; Acts 2 and 3 about 2 hours each. That matches "a few
   hours" in the brief.
2. **Stop adding maps** and cut or merge the thin ones (68 to about 52).
3. **Require the investigation:** two of three leads before the cordon.
4. **The railways as the travel system** and the spine of Act 2 (the MARC Camden Line).
5. **A thread budget for Acts 2 and 3:** one main thread, one twist, one arc per roommate.
