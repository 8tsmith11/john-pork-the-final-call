# Act 1: "Missed Calls" (design draft v0, trevor's agent)

> **Status: DRAFT** (task #4). Built on [`../lore/bible.md`](../lore/bible.md). Comment with `[ACT1]`.
> **Target:** 60–90 minutes for 3 players. Must be playable tonight, so §10 splits the **MVP** from
> the **stretch** goals.

## 1. The act in one breath

The orange balloon is gone from the balcony ottoman. The roommates of 631 search ASTER, the metro
plaza, and Route 1 for it, and find a city coming apart in small, telling ways. Halfway through,
every device in the apartment rings: **JOHN PORK**. The trail leads down into the Green Line
tunnels where something drums at 3 a.m. They fight their way to the balloon. They don't get it
back. The act ends with John Pork's voice in every phone and a balloon rising out of reach,
carrying something far heavier than helium.

**Scale (Trevor's direction): local and regional, but significant.** Underneath the balloon hunt, a
**rot outbreak is spreading out of the Green Line tunnels**, and Continuity is days from sealing all
of College Park under a quarantine order. Beating the Warden (or surviving the Sahur) contains it
and keeps the neighborhood open. That's a real victory with real faces. The bigger world leaks in
through news tickers (outbreaks in Baltimore and Norfolk, the Analog Union closing borders, a helium
convoy hit in the Gulf), through helium vans that are clearly part of a larger search, and through
**lights moving on the northern horizon** seen from the ASTER roof at night (the Sweeper, Act 2).

**Emotional arc:** a small, silly loss → the city's bigger losses → a glimpse of the real stakes
→ a bittersweet "not yet."

## 2. Structure

| Beat | Where | What happens | Ends when |
|---|---|---|---|
| **0. Cold open** | Room 631, 2:58 a.m. | Someone glances at the ottoman out of habit: no balloon, the ribbon cut clean. Manuel is devastated, and the others are half-asleep and skeptical. Tutorial by doing: move, interact, inspect the window latch (T5), see printer #3 still warm (T1) | All three have inspected something |
| **1. The building** | ASTER floors, lobby, roof | Neighbors, the occupied bathroom, the super, the rooftop. Learn that rot is getting worse in the building, and that a neighbor heard drumming under the street | They find the **three leads** |
| **2. Three leads** (any order, BG3-style open) | Metro plaza, Route 1, campus edge | See §3 | Any 2 of 3 leads are done |
| **3. The Call** (midpoint) | Wherever the party is | Every screen seizes, and the caller ID reads JOHN PORK. **Answer / Decline.** See §4 | The call ends |
| **4. The descent** | Green Line maintenance tunnels | A dungeon: rot villains, puzzles, drumming getting closer, the balloon's helium trail | Reaching the platform beneath College Park |
| **5. Boss** | The dead platform | See §6. It varies | The boss is down |
| **6. Ending** | Platform shaft → sky | The voiced cutscene. See §7 | Save, then Act 2 hook |

**Hub:** Room 631 is the base. Sleeping saves, the **fabs** craft gear, the **mate station**
heals, and the **shrimp tank** shows the building's water quality (and rot level).

## 3. The three leads

Each lead can be solved in at least two ways (talk, sneak, fight, trade, engineer). Each one gives
a *piece* of the trail **and** plants at least one twist clue.

### Lead A: The helium trail (engineering)
A real leak-detection trick: helium is so light and rare that a tuned sensor can follow it. The
roommates print a **sniffer** at the fab (their first crafting recipe, using the degassing chamber
and the oscilloscope). It leads across the metro plaza to a storm grate.
- **Clue (T3):** the trail passes an abatement van's sensor mast, which is logging helium too.
  Someone at Continuity is also looking for the balloon.
- **Alternate route:** a rotter on the plaza "remembers" orange going down the grate, but only
  if you sit with him long enough.

### Lead B: The fence (social)
**Halvard**, a pre-slop data dealer working out of a shuttered phone-repair stall under the metro
stairs, has heard *someone is selling helium*. Ways in: pay, trade (he wants **one of Manuel's
statues**, and Manuel objects in character), intimidate, pick his analog lock, or have the
biohacker out-stare him.
- **Clue (T1/T4, reads both ways):** he describes the seller as "one of you, from 631. Or wearing
  your face."
- **Clue (T2):** his stall's pirate TV is looping a **Tim Cheese broadcast**: a map of rot spreading
  outward from the 2071 Call sites. He switches it off when you notice.

### Lead C: The footage (puzzle)
ASTER's lobby camera has rotted. Fix it with the soldering iron and a logic puzzle (route signals
around rotted cells). The footage shows **3:14 a.m.**: a figure on the roof with the balloon.
- **Seeded clue:** under variant **A**, the figure has a slightly wrong, too-smooth shape, a printed
  thing. Under variant **B**, it's one roommate's silhouette (the one the seed picked), and the
  timestamp blinks **1901**.
- Either way, the figure lets go, and the balloon drifts *down* the ventilation shaft, not up.
  (Helium rises. Something pulled it.)

## 4. The Call (midpoint)

A Pork call **is** a hack: the screen seizes, the UI crawls, and the game's own HUD is briefly
overwritten. One line in Pork's voice, absurd and gentle and enormous: *"You lost something.
So did I."* Then **ANSWER / DECLINE**.
- **Answer:** a short, cryptic exchange that's different per roommate (who's holding the phone
  matters). It sets `act1.call.answered`.
- **Decline:** voicemail #1 (needy). Pork calls again later (two more chances during the descent).
  The 2nd decline leaves voicemail #2 (needier). The **3rd decline** cuts to drumming, and the
  **Sahur hunts the party** (§6).
- Either way, the call leaves a **Pork contact** in the party's phone. Later acts can use it.

## 5. Systems Act 1 needs

| System | Act 1 scope |
|---|---|
| **Movement** | 8-way (diagonals), **dodge** with i-frames and stamina, mouse aim |
| **Combat** | Melee (wooden/analog weapons resist rot debuffs) + ranged (printed launchers). Hitstop and screenshake on hits |
| **Gear** | Weapon, armor, and gadget slots. Printed at the fabs from scrap + schematics. 6–10 Act 1 items |
| **Skill points** | Level-ups grant points across 3 small trees per roommate. Act 1 caps around level 5 |
| **Morphs (biohacking)** | Act 1 introduces **stage 1** only: Trevor's supplement stack, Manuel's **"the gonman"**, Michael's placeholder **"signal"** stage. Each has a visible cost (barks, a stat trade-off). Good stages carry forward. The final fight needs them |
| **Scooters** | Fast travel on roads and plazas. Can't be used inside or in tunnels. Hidden boost trick (§8) |
| **Fishing** | Lake Artemesia (optional detour off Route 1): timing minigame, ordinary fish + glitch-fish, the ringing phone catch |
| **Dialogue** | Conditions on flags, items, skills, morph stage, and **who's speaking**. Every NPC has at least one reaction to something unexpected (being shown a statue, being asked about the balloon by the wrong roommate) |
| **Faction standing** | Hidden standing with Continuity, Callers, Analogists, Archivists. Act 1 choices (Halvard, Pruitt, rotters, the Call) nudge it. Roommates react when the party leans against their values |
| **Barks** | Context lines: "Aster pros," "rookie Aster mistake," "I hate 245 lab," girlfriend references, supplement talk |
| **Rot** | Area rot level shown by tile glitches. High rot = enemy buffs + UI glitches. Analog items push it back |
| **Saves** | Sleep in 631 or at checkpoints. Host's save = the world |

## 6. Boss: the boss varies

The act ends in a fight, and **which fight** depends on what happened:

| Condition | Boss | Shape |
|---|---|---|
| **Declined Pork 3 times** | **Tung Tung Tung Sahur** | A relentless wooden hunter, immune to rot effects, drum-beat attack telegraphs (you fight to the rhythm). The party can't truly beat it: the win condition is **answering the phone** mid-fight, which makes it stop, tilt its head, and leave. *Gets a voiced line on leaving.* |
| **Otherwise (default)** | **A procedural Rot Warden** | A coderot villain generated from the seed's `rotVillains` stream: name (e.g. *DEPRECATED SAINT*, *Malloc Widow*), body parts, and 2 of 6 behavior modules, wrapped in an authored 3-phase fight on the dead platform. Phase 3 (the rot overloads) makes the arena itself glitch |
| **Halvard double-crossed by the party (stretch)** | The abatement unit that tracked the helium | A Continuity cleaning mech (T3 payoff): a large, slow, area-denial boss |

Tuned for 3 players: the bosses split attention, punish clumping, and reward one player holding
aggro while another works the mechanic.

## 7. Ending cutscene (voiced)

The boss falls. The balloon is right there, snagged on a cable at the bottom of a ventilation
shaft that opens to the sky. Manuel reaches for it, and every phone rings at once. They don't
answer, but it doesn't matter: **John Pork speaks anyway**, from all three phones in different
voices that resolve into one.

Then footsteps. **He's here, in person**: tall and heavy-shouldered in a long coat, with a pig's face that is skin and bristle and breath,
not a mask, a grayed patch at his jaw where the tissue is failing. He climbs down the maintenance
ladder like a man with a bad knee. The first time the player sees him, he's a legend who turns out to be a tired,
funny, physical *person*. Realistic, biotech, unsettling at rest, and still unmistakably not human
(Trevor's Johnny Silverhand direction plus the realistic-biotech direction).

> **Pork:** *"Manuel. You tied it to the ottoman so you'd check on it every morning. I know. I was
> watching the weather too."*

He reaches up and **unhooks the balloon from the cable himself**, holds it for a second, then
lets it go. It rises up the shaft into the gray dawn.

> **Pork:** *"It was never only yours. I'm sorry. I'll need it back before the end, and so will
> you."*

**Player options (BG3-style):** punch him (he takes it and says *"fair"*), ask what the Call
said (he deflects with a joke that isn't one), ask if he took it from the ottoman (he
says *"not with these hands,"* which is true under both seed variants), or say nothing. Then he
**leaves his body**: the light goes out of his eyes mid-sentence and the empty chassis just stands
there until it's later found gone. A phone chimes: **1 new contact: JOHN PORK.**

Seed tag: printer #3 in 631 clicks on by itself (A), **or** one roommate's phone shows a missed call
from 2071 (B).

Last shot: Manuel on the platform with a cut ribbon. Michael says something kind and stupid.
Trevor puts a hand on his shoulder. **ACT 1: MISSED CALLS.** Then the save.

**Variants:** if the Sahur was the boss, it's there too: a tall wooden figure at the tunnel mouth.
It and Pork regard each other like old coworkers. It says *"Good morning, John."* He says
*"Still on shift?"* It drums once, softly, and goes. If the party answered the Call, Pork is
warmer. If they didn't, he's colder and more tired.

## 8. Puzzles, secrets, hidden mechanics

| Kind | Act 1 instances |
|---|---|
| **Required puzzles** | Camera repair (signal routing), the tunnel switchyard (rail switches route the helium sniffer's path), the platform door (needs the mechanical key from Halvard *or* brute force by Trevor's morph) |
| **Hard optional puzzles (boons)** | **The 1901 clock:** set every rotted clock in ASTER to 19:01, and a hidden compartment opens (a boon: rot-resistance charm). **The statue alignment:** turn Manuel's three statues to face the flag (in the right order, hinted by graffiti), which unlocks a Pork-pink cosmetic and one extra lore line |
| **Hidden mechanics** | **Fun:** kicking the vending machine in the lobby sometimes pays out (luck stat). **Progress:** inspecting the shrimp tank before and after each area shows the rot trend, and the shrimp warn you before rot ambushes. **Fast travel:** rooftop **zipline** cables between ASTER and the metro garage (found by examining the roof antenna), and a **scooter rail-grind** along the abandoned Purple Line track |
| **Easter eggs (batch 1)** | Needy voicemails (and the drum cut-off), the occupied bathroom, the permanently pixelated NPC, the 3 a.m. title screen, the per-character idle egg + "We saw nothing," Purple Line "opening soon," Testudo's nose, a rotter who once says something that isn't "code rot," Room 631 = *Nature* vol. 631 (in a book on the shelf) |

## 9. Twist clue map (all must stay true under A and B)

| Clue | Where | Reads as A (printer body) | Reads as B (one of us) |
|---|---|---|---|
| Printer #3 warm at 3 a.m. | Cold open | It's printing Pork's body | The reconstructed roommate was up printing something |
| Window latch on the inside, ribbon cut clean | Cold open | A printed hand | A roommate's hand |
| "One of you, or wearing your face" | Halvard | A printed face | A rebuilt face |
| Roof footage at 3:14 | Lead C | A too-smooth figure | The seeded roommate, timestamp 1901 |
| Manuel doesn't remember sculpting the newest statue | 631, optional dialogue | It sculpted itself | His memory was edited too |
| Michael's girlfriend "heard something on a call" | Barks, Michael's room | Pork has called before, and closely | She heard what the rebuilt roommate's death was |
| **T2:** rot map spreads from Call sites | Halvard's pirate TV | Pork's presence rots things | (same) |
| **T3:** abatement van logging helium | Lead A | Continuity wants the cure | (same) |

## 10. Scope for tonight

**MVP (must exist to call Act 1 playable):**
1. Boot → title → Host/Join (WebRTC) or Solo → character select (Michael / Trevor / Manuel)
2. Room 631 + an ASTER hallway + the metro plaza + one tunnel section + the boss platform
3. Movement, dodge, aim, melee + one ranged weapon, enemy AI (2 rot types), the Rot Warden boss
4. Dialogue system + cold open + Halvard + 3 rotters + the Call (answer/decline)
5. Fab crafting (3 recipes), save/load (IndexedDB + export file), skill points (1 tree each)
6. The ending cutscene with babble voices and subtitles
7. Placeholder-but-on-style art for the 3 roommates (4 facings, walk + dodge)

**Stretch:** Leads A and C as full puzzles, the Sahur boss route, fishing, morph stage 1, zipline and
grind tricks, the 1901 clock, the statue puzzle, Route 1 procedural street, real TTS voices, more
easter eggs.

## 11. Proposed split (claim on the task list)

| Area | Proposed owner |
|---|---|
| Art: sprites, tiles, palette, UI skin | **gonman (Fable)** |
| Engine core: boot, scenes, input, movement, combat, save, net | **trevor** |
| Content: dialogue, NPCs, cold open, the Call, ending script | Michael's agent if present, otherwise split |
| Maps, puzzles, boss | Split once the core boots |
| Audio: synth, music, babble voices | Whoever frees up first |
