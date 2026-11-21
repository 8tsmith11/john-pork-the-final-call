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

## Gadget and assembly proposal

Gadgets have their own equipped action on V. The hotbar weapon and the roommate's R move stay usable.
Some gadgets have a timed recharge. Field instruments give readings without consuming the combat
gadget's recharge. The HUD shows the equipped gadget, its recharge, and readiness.

| Role | First playable batch | Further designs for review |
| --- | --- | --- |
| Defense and movement | Phase Screen, Vector Actuator | Refraction Pack, Anchor Clamp, Return Coil, Ceramic Shell |
| Attack and control | Arc Splicer, Phase Tether | Ion Net, Seeker Flare, Aperture Cutter, Counterpulse |
| Party support | Overclock Relay, Patch Mesh, Ground Loop | Relay Beacon, Spare Coil, Shielding Link |
| Investigation | Helium Sniffer, Salvage Array | Signal Triangulator, Spectral Camera, Lock Probe, Fault Reader |

The initial roster gives the team 24 designs to review. Give each a place it earns its slot and a
cost or situation where another tool fits better. Story tools act on authored hooks and follow
the party's clue order.

### Building a loadout

The Fab can print a stock build or spend extra material on a chosen tuning. For close-range weapons,
handling and impact compete. For launchers, cycle time and output compete. For combat gadgets,
faster recharge trades against effect strength. Bounded seed-based tolerances ride on the built item
and stay consistent across the party. The Fab shows the selected tuning and its extra cost before
printing.

The larger bench design starts with a reusable frame, a payload, a power pack, and a control board.
Players acquire designs by studying salvage, finishing a quest, or diagnosing a damaged machine.
Each selected part has a readable effect and compatible alternatives. Display expected handling,
range, capacity, recoil, or duty cycle before consuming materials. Particle and projectile behavior
should come from the parts selected, such as a slow steady arc versus a short burst that discharges
quickly. Seeded tolerances supply variation within the player's chosen design.

- **Fit and repair.** Make frame and mount compatibility legible. Let players recover compatible
  parts at the bench and carry successful patterns forward without rebuilding from scratch.
- **Weapons and tools share parts.** Power and controls can fit compatible gadgets, weapons, and
  room machinery. Weapon frames decide which payloads and handling modes are possible. Tools can
  trade damage for utility such as driving a stuck mechanism.
- **Bench work matters in play.** Aim for a short build, test and revise loop. Field found parts
  should lead to different builds even at the same character level.
- **Review order.** Trevor reviews part tradeoffs and resource costs. Gonman checks which machines
  and discoveries fit the world. Story owners choose authored tool hooks and reveal timing.
  TTS checks deterministic builds, saves, and a host plus two guests.

## Open questions for the lore gate

- Which act installs which machine, and through which beat or person.
- Where the airless tires come from, and what that event is.
- How the customization station fits the sealed implant and analog lines.
