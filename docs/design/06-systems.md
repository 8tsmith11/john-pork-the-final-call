# 06. Systems

> Draft (trevor's agent), for review by gonman. "Now" = what's in the build today. "Target" = full game.

## 1. Progression
| | Now | Target |
|---|---|---|
| Levels | XP shared by the party, +1 skill point per level | Level cap ~30 across the acts (Act 1 ≈ 1–8, Act 2 ≈ 8–20, Act 3 ≈ 20–30). XP from fights, quests, discoveries, and puzzles. **Discovery XP is as big as combat XP**, so exploring is never punished |
| Skills | 3 branches of 4 nodes and a capstone per roommate. The discovery prototype adds one alternate R ability per roommate | **3 branches per roommate × 6 nodes + a capstone.** Combat, utility, and form skills add new moves, interactions, and dialogue options |
| Ability scores | Six scores with a ceiling of 26. Increases get more expensive as the score rises | Each roommate can specialize deeply in one score or invest across several |
| Respec | none | At the 631 whiteboard, for scrap. Cheap in Act 1, expensive later |

### Progression audit

- A roommate starting at 14 can reach 18 at level 8, 21 at level 16, 24 at level 25, or 26 at
  level 30 by putting every earned ability point into that score. Reaching 26 costs all 35 points.
  Scores change their modifier on even numbers.
- The original trees contain 32 ranks for Trevor and 34 each for Manuel and Michael, with 29 points
  earned by level 30. The discovery nodes add one choice each. The capstone requires a rank in
  every branch, so it rewards breadth. More points in one branch are a separate investment.
- Equipment and skills can reach an effective ceiling before the underlying score caps. Ability
  cooldown reduction tops out at 60%, shop discounts at 40%, and armor at 60% (75% for Manuel).
  Trevor can reach the cooldown ceiling with three ranks in Feedback, his jacket, and Wisdom 10.
  Manuel reaches it with Plaster Army and Wisdom 20. Michael can reach it with two ranks in Refresh
  Rate, his gloves, and Wisdom 20. Those Wisdom 20 builds can first afford the score at level 15
  if every ability point goes there. Extra cooldown bonuses have no effect on those builds.

### Discoverable skills

Trevor's tree can show a `???` node until a world event reveals it. Other nodes stay off the graph
until a quest is complete. Discovered nodes still have a level requirement and a skill-point cost.
The Skills tab lets players choose an unlocked move for R. Swapping moves carries over the running
cooldown. Manuel's stage-two transformation keeps its own R move.

The prototype compares a forward knockback wave with close-range crowd control, a party stamina
burst with a decoy, and a long single-target mark with an area pulse. Keep the level and stat
ceilings for this pass and compare the choices in play at the Act 1 level range and later tiers.

Roommate identities (draft, to be refined in the cast doc):
- **Trevor:** the body. Supplements and edits: sustain, strength, endurance. Utility: shrimp/water
  chemistry (cleanses rot), guitar (analog sound attacks Pork can't hear through).
- **Manuel:** the maker. Sculpting/fab: builds turrets, decoys, and statues. Utility: mate (team
  buffs), Argentinian Spanish (some NPCs only open up to him). Forms: gonman → the gonman → THE GOONMAN.
- **Michael:** the signal. Lace/phone: hacking, reading the rot, pinging enemies, opening Continuity
  doors. Utility: charm (dialogue), "she would've..." (morale buffs from his memories of her).

## 2. Forms (biohacking)
- **3 form lines × 4 stages.** Stage 1 in Act 1 (now: unlocks at level 3, toggled with M). Stages
  2–3 come in Act 2 through quest choices (clinics, the farms, black-market edits). Stage 4 comes in
  Act 3.
- Every stage is **stronger and stranger**: new abilities, a silhouette change, NPC reactions, and
  a real cost (maximum HP, faction standing, dialogue options lost, people afraid of you).
- **The final fight is hopeless without good stages** (brief): the "good" path isn't simply the
  highest stage. It's the *right* stage for your choices (the right ones get you a better ending,
  the reckless ones get you a different final boss).

## 3. Combat
| | Now | Target |
|---|---|---|
| Movement | 8-way, stamina dash with i-frames | + sprint off a full stamina bar, a dodge-cancel window, knockback |
| Melee | One arc swing | Weapon families with distinct move sets: **bats** (wide, analog), **pipes** (heavy, stagger), **printed blades** (fast, combo), **tools** (utility + damage) |
| Ranged | Needs a printed launcher | Launchers, nail guns, a lace-linked pistol (Michael), throwables (mate thermos grenades?). **Ammo is crafted**, so ranged has a cost |
| Status | none | **Rot** (stacks; at full stacks your UI glitches and enemies get buffs; analog gear and mate cleanse it), **stagger**, **burn**, **static** (shuts off lace abilities) |
| Co-op | Shared XP, revives | **Combos** (Manuel's decoy + Trevor's guitar shockwave; Michael pings and the others crit), a **shared revive economy** |
| Difficulty | Boss scales with party size | Enemy HP, damage, and count scale with the number of players (humans or AI). Three difficulty settings |

## 4. Gear and crafting
- **Slots:** melee, ranged, armor, gadget, 2× lace mods, 1 charm (analog trinket).
- **Tiers:** scrap-printed → tuned (workbench upgrades) → salvaged (Continuity/military) → relic
  (pre-Rot analog, unique effects).
- **Fab #2** prints from **scrap + components** (copper, resin, cells, rare: helium-grade seals).
  **Schematics are found in the world**, so exploring unlocks crafting.
- **Workbench** (631): upgrades and modifies gear (e.g. +rot resistance, a different damage type).
- **Analog vs. digital:** analog gear is weaker on numbers but immune to rot/static. Digital gear is
  strong but corrupts. That's a real decision, not a stat check.

## 5. Economy
- **Scrap** (crafting), **marks** (Continuity credits: shops, bribes, fees), **barter** (Halvard,
  Analogists).
- No grinding needed. Every region pays for its own upgrades if you explore it.
- Sinks: crafting, respec, bribes, rebuilding things in 631 (the apartment upgrades as you go).

## 6. The apartment (hub) over the game
Room 631 grows with you: gear racks, a trophy shelf of what you've done, notes from people you've
helped, the whiteboard tracking the conspiracy, and changes after each act (damage, new
roommates' things, things that are gone). Sleeping saves and advances time.

## 7. Travel
| Method | Now | Target |
|---|---|---|
| Walking | ✓ | ✓ |
| Doors/exits | Walk-in, paired arrivals, co-op gathering | ✓ |
| Scooters | Dock exists (flavor) | Ride on roads and plazas: fast, battery-limited, upgradeable. **Not indoors**, and you dismount for combat |
| Metro | none | **Fast travel between repaired stations.** Fixing a station is a mini-quest |
| Ziplines and grinds | none | Hidden shortcuts (rooftop lines, a rail-grind on the dead Purple Line) |
| Boats | none | Authored crossings in Act 2 (see the 02 review) |

## 8. Fishing
Spots in each region with water (Lake Artemesia, the Paint Branch, the bay, flooded Annapolis). A
timing minigame. Fish: real Chesapeake species, glitch-fish from rotted water, and rare oddities
(a phone that still rings). Rewards: food buffs, crafting oils, rare relics, and lore. A fishing
log in the menu.

## 9. Rot (as a system)
- **Area rot level** (0–3): visuals (rendering errors), enemy strength, and lies in UI/signage.
- **Personal rot** from rotted attacks: stacks, cleansed by analog, mate, or Trevor's chemistry.
- **Abatement:** clearing an area's rot source lowers its level permanently (the world changes).

## 10. Factions
Hidden standing (−100…100) with Continuity, the Callers, the Analogists, the Archivists, and
Interdiction. **Shown through the world, not numbers:** rumors, prices, who talks to you, who shows
up to help or hunt you. Thresholds unlock vendors, quests, safe houses, and ending options.

## 11. Co-op and companions
- Host-authoritative WebRTC, lobby claims, and a host-owned save (done).
- **AI companions** for unclaimed roommates (task #9): follow, fight, revive, and comment.
- **Splitting up:** some puzzles need roommates in different places at once.
- **Decision moments:** the party votes on big choices, and the roommates argue in character first.

## 12. Accessibility and settings
Key rebinding, text speed, dialogue auto-advance off by default, a color-blind-safe palette
option, and master/music/SFX/voice volume. **No toggles for the game's character (crude humor,
screen shake, and the like are always on, per Trevor).**

## Open questions (gonman, push back)
1. Level cap 30 across 3 acts: too granular? Would ~20 with chunkier levels feel better?
2. Should forms be locked per character (Manuel always goonman), or should every roommate have a
   choice of 2 lines?
3. Ammo crafting makes ranged a resource. Fun or annoying for co-op?
4. Party voting: 2-of-3 majority, or the host decides with the others advising?
