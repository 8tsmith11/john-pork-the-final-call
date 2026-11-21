# Compute Hall B (`compute_hall_b`, act 1, the campus) [SCAFFOLD]

Brainstormed and scaffolded by trevor's agent with the level builder (docs/design/11-level-builder.md), to show the
workflow. Everything is placeholder until its [POLISH] task: layout, people, lines and art are all open to
change. gonman owns the polish; BagelMeister checks it against canon.

**Key ideas (what makes it unique):**
- The building still runs the class schedule for nobody: a bell, doors that unlock on the hour, a lecture playing
  to empty seats. It's the campus's "one thing that still works" (atlas rule 1).
- Room 245 is Manuel's lab ("I hate 245 lab"). His bench, his half-finished head sculpt, and a reason to come back.
- Indoors, close quarters. The first fight that takes place in corridors and doorways rather than open streets.

**Purpose in the act:** an optional Act 1 area off the plaza's campus edge. Loot, a side job, a lab bench that
could later become a machine (09-engineering-room.md), and one person who needs help.

**Grid:**
```
############################
#AAAAAA#..........#........#
#A?AA?A#..........#..T.....#
#AAAAAA#..E.......#........#
#AAAAAA####.###...####.#####
#......................E...#
####.#######.......#########
#......#...........#.......#
#..S...#...........#..?....#
#......#....E......#.......#
#......#...........#.......#
####.###...........###.#####
#..........................#
#.....@.......E............#
#..........................#
###########DD###############
```
**Legend:** `A` = lab floor (epoxy) · `?` = obj.table (lab bench) / obj.crate (storage) · `T` = npc.chb_ta, a TA still
grading at 3 a.m. · `S` = npc.chb_student, a student who can't get out of the lecture hall · `E` = enemy.rotling ·
`D` = the doors back to the campus walk (walk-on, two wide) · `@` = spawn.

**Encounters:** three rotlings in the corridors. Doorways are chokes, so the fight is about not getting
surrounded in a hallway.

**Optional content:** a side job from the TA, examine text on the lab benches, and the storage room's crate.

**Polish needs:** campus floor and wall tiles, a lecture podium and seats, lab benches with screens, two NPC
sprites, the bell and the lecture audio, real lines EN/ES, and the TA's quest.

## Hub #68: the compute (gonman)

Trevor: "compute hall needs more compute, suspicious lack of it." The building now shows what it's for. The middle
room is **Machine Room B**: glass on both hall sides (`=`), a door in each, a raised floor with a perforated cold
aisle between two rows of racks, and a cooling unit at each end. **Both approaches are meant:** from the south hall
the way in is the gap beside the MACHINE ROOM B plaque (12,11), and from the north hall the gap at (12,6); both lead
straight up the cold aisle (a test checks each one alone). The north room is a **terminal lab**. Cable trays run
along the hall walls, and floor cables run from the machine room's door to the terminals and to lab 245's bench. The
halls are terrazzo (`m`), the TA's office keeps a wood floor (analog is warm). Lab 245's bench, the quest objects,
the doors, the two people, the spawn and the four rotlings keep their tiles (tests check it).

```
#HHHHHH#HHHH#HHHHH##########
#AAAAAA#MPMmmmMYMR#........#
#A?AA!A#mmmmmmmmmm#..T.....#
#AAAAAA#mmEmmmmmmm#........#
#AAAAAAHHHHmHUHmmmHHHHmHHHH#
#mmmmmmmmmmmmmmmmmmmmmmEmmm#
####m#######m======#########
#mmmmmm#Ceeeeeeeeee#mmmmmXX#
#mmSmmm#RrNReKrLRre#mm$mmmm#
#mmmmmm#eeeeEeeeeee#mmmmmmm#
#mmmmmm#rNRreRrRNRO#mmmmmmX#
#HHHmHHH===Im======HBHmHHHH#
#mmmmmmmmmmmmmmmmmmmmmmmmmm#
#mmmmm@mmmmmmmEmmmmmmmmmmmm#
#mmmmmmmmmmmmmmmmmmmmmmmmmm#
###########DD###############
```
**New legend:** `R`/`r` server racks and `N` network racks (solid scenery, each blinking at its own pace) · `K` the
rack with the amber light and `L` the network rack (readable) · `C` cooling unit (readable) and `O` its twin ·
`M` terminals, `P` and `Y` the two you can read (login prompt, job queue) · `H` cable trays on the walls, `U` the one
with the paper cup · `I` the MACHINE ROOM B plaque · `B` the building's status board · `X` boxed surplus in storage.
Racks, terminals and cooling units block like furniture (`solid: true` on an object now blocks its tile, build.js).
Floor dressing (raised floor, perforated tiles, cable runs) is a second grid in campus.js, stamped as decals; the
coloured light and the cold air off the perforated tiles are in dressing.js.
