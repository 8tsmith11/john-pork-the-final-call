# 09 · The engineering room as the story's hub (Acts 2–3)

Status: **draft for comment** (Trevor's idea, board #434; nobody objected). Readable and spoiler-free:
*which* machines arrive *when*, and what story beats unlock them, live in the sealed docs and belong to
the lore gate (BagelMeister). This file is the systems side, which trevor builds.

## What Trevor asked for

- 631's east half (fabs, bench gear, the John Pork flag) becomes the base the story keeps returning to.
- The party gets **new machines** for it over the acts and uses them to **build things that help** and
  **manufacture better gear**, some **custom** (hand-designed uniques) and some **procedural** (seeded rolls).
- The roommates' own three scooters are dead on bare rims ("AIRLESS ONLY"). Finding **airless tires** is an
  **important Act 2 event**; repaired, they beat Delroy's used scooters from Act 1.
- A **customization station** for weapons, implants and armour (sealed request; this hub is where it lives).

## Systems

1. **Machine slots.** Fixed spots in the engineering room (room631.js), each empty until its machine is
   installed by a flag (`eng.<machine>`). An empty slot reads as a bare bench with a power drop, so the
   player can see the room growing. Today's fab #1, fab #2 and the bench count as the first three.
2. **Machines.** Each one is data: `{ id, name, slot, flag, recipes: [...], ui: 'fab'|'bench'|'station' }`.
   Using it opens its own menu tab in the existing GameMenu (the fab list already scrolls with the shared
   Scroller). The list (gonman's split, #546), with placement for the lore gate:
   - **one per roommate, tied to what they already do:** Manuel's **kiln** (fired and glazed busts make
     better decoys for his [R], plus custom busts as gear); Michael's **key-cutting and lock bench**
     (lockpicks and keys for locked loot and doors); Trevor's **CNC mill** (metal weapons and armour, where
     procedural rolls fit best);
   - **shared:** the **tire press** (the Act 2 airless-tire event), a **battery rig** (scooter batteries,
     anything that needs charge), and the **customization station**.
   - The circuit printer folds into the existing fabs (fab #3 already prints the bot brain).
   631's east half fits about five slots before it gets hard to read. gonman lays them out (a bare bench,
   a power drop, a taped outline of what goes there) and draws each machine with an idle and a busy frame.
3. **Recipes.** These extend today's fab recipes (`cost`, `req`). New fields: `machine` (which machine
   makes it), `time` (seconds of in-world work, during which the machine shows as busy), and `roll`
   (procedural, below). Jobs keep running while you're away. The output waits in the machine, and a
   "ready" toast shows when you walk back into 631, so nobody stands at a fab waiting.
4. **Custom vs procedural gear.** Custom recipes give a fixed, hand-designed item (uniques, story gear).
   Procedural recipes roll a **seeded variant** from bounded tables, like the code rot villains: a base item
   plus 1–2 affixes within safe ranges (e.g. +10–20% swing speed, +1 clip, an analog vs lace trait). The
   seed is world seed + recipe + count, so a world is reproducible and co-op screens agree. Affix tables
   live in `src/content/gearRolls.js` with tests that every roll stays inside its bounds.
5. **Scooter repair.** `item.airless_tire` ×2 plus parts at the tire press repairs one roommate's own
   scooter (`item.scooter_own_<who>`). Faster than Delroy's, a bigger battery, and it charges at the 631
   dock. Delroy's shop stays as the Act 1 stopgap.
6. **Upgrades.** The armorer's upgrade levels stay. Machines can add a second track (mods in sockets) for
   the customization station.

## Rules it keeps

- Host-authoritative. Clients ask; the host installs, prints and rolls (like buying and selling today).
- Saves: new flags plus per-roommate items only. Rolled affixes are stored on the item stack
  (`{ id, qty, roll }`), which needs a save schema bump when it lands.
- EN/ES for every label and line. The writing follows WRITING.md: describe the one detail the art can't show.

## Open questions for the lore gate

- Which act installs which machine, and through which beat or person.
- Where the airless tires come from, and what that event is.
- How the customization station fits the sealed implant and analog lines.
