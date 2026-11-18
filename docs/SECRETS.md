# Secrets and Easter Eggs (SPOILERS)

> **Spoiler file.** This lists every easter egg and hidden thing in the game and how to trigger
> it, so that after playing, the humans can look up the ones they missed. **Don't read this
> before you've played.** Agents: whoever adds or changes a secret updates this file in the same
> commit.

## Discoverability rule (Manuel, 2026-11-17)

**A group should be able to find the easter eggs within about three playthroughs.** They are
surprises, not needles in a haystack. In practice:

- Nothing depends on a rare random roll alone. If chance is involved, it's at least 1 in 3 per
  opportunity, and there are several opportunities per run.
- Thresholds are low enough to hit by accident (knock a few times, idle for a few minutes).
- Every egg has at least one in-world hint pointing at it (graffiti, a bark, an object).
- Things tied to a specific decision should come up naturally in one of three runs.

Hard optional puzzles (DESIGN §8) are exempt. Those are meant to be hard.

## Status key

`planned` = agreed, not built. `built` = in the game. `pool` = approved idea, not yet scheduled.

To test the idles without waiting three minutes, add `?idle=10` to the game's address.

## Act 1, batch 1

| # | Egg | How to trigger | Hint in the world | Status |
|---|---|---|---|---|
| 1 | **Needy voicemails** | Decline John Pork's call. After the 1st and 2nd decline he leaves a voicemail, each needier than the last, ending in heavy breathing. The 3rd is cut off by drumming, and Sahur comes for you | The call screen itself: "Decline" is right there | built |
| 2 | **The occupied bathroom** | The always-locked bathroom in Aster. Knock 5 times: "one minute!" Knock 10 times: it opens a hand's width, you look, you stop looking. Achievement: "One minute." After that it only says "No." | A queue-number sign on the door that never changes | built |
| 3 | **The pixelated NPC** | One person in the metro plaza crowd is permanently pixelated. Talk to them: they don't know. Nobody explains it. It looks like rot. It isn't | Always visible once you reach their area | built |
| 4 | **Late-night title screen** | Open the game late at night by your real clock: the title screen shows Pork in bed asking why you're still up. *(Proposed window: midnight to 5 a.m., widened from 3 a.m. only, per the discoverability rule)* | None needed; you'll hit it if you play late | built (text only) |
| 5 | **Long idles** | Stand still for 3 minutes. Manuel brews mate and talks to a statue. Trevor tunes his guitar badly. Michael turns his phone face-down, face-up, face-down | Happens on its own | built |
| 6 | **Manuel's other idle** | Manuel only, while morphed into "the gonman" or beyond: sometimes his 3-minute idle is a ruder one, back to the camera, nothing shown. *(Proposed chance: 1 in 3. Manuel opted in for his own character; D-007)* | The mate idle makes players wait around as Manuel | built |
| 7 | **"We saw nothing"** | Move during any long idle: the character scrambles and you get the achievement "We saw nothing" | Follows from 5 and 6 | built |
| 8 | **Purple Line "opening soon"** | Read the Purple Line platform signs. They've said this for seventy years | On the main path | built |
| 9 | **Testudo's nose** | Rub the bronze terrapin's nose on campus. It might actually do something | Students in the area mention it | built |
| 10 | **The rotter who says something else** | Stand next to one particular rotter long enough and they say something that isn't "code rot" | They look at you differently from the others | built |
| 11 | **Room 631** | A book on the shelf in 631 is volume 631 of a science journal: the one with the paper that named model collapse | It's on the shelf | built |

## Pool (approved, not yet scheduled)

| Egg | How to trigger | Hint in the world |
|---|---|---|
| **6969 hotline** | Dial 6969 on any in-game phone: "hot singles in your sty," answered by a very bored operator | The number is scratched into a bathroom stall |
| **Butt dial** | Sometimes Pork calls by accident: muffled, suspicious noises, then a panicked hang-up. At least once per run | None; it comes to you |
| **Pork's search history** | A computer in the world holds Pork's search history. The password is on a sticky note nearby | The sticky note |
| **Save-name roast** | Give your save file a rude name. The game refuses, primly, then calls you something ruder | None; people will try it |
| **Mankini code** | A cheat code puts everyone in a mankini until the next area. *On hold: needs a yes from each human for their own character (D-007)* | To be decided |

## In the fiction, not hidden (things worth noticing)

- **"At the end of the day no one can code faster than AI."** The ad slogan of the Slop Decades,
  still on rotting billboards. Rotters sometimes say it instead of "code rot." One major character
  says it once, sincerely.
- **Aster slang:** "Aster pros," "Aster noob," "rookie Aster mistake." The roommates say these on their own over their heads: after a kill, when someone is hit or goes down. They also say other things now and then (lines in `src/content/barks.js`).
- **"I hate 245 lab."** Manuel, at random, out loud. Also in the fridge condensation, the opening scene, and at Fab #1. In his gonman form he says "The gonman also hates 245 lab."
- **The balcony ottoman** shows the weather: wet, dusty, sun-bleached.
- **Clocks reading 1901** are rotted devices that never recovered from the 2038 Rollover.
- **Three printers** in 631. One of them is always warm.

## Proposal: an in-game list too

A "Secrets" page in the phone menu that shows how many you've found (for example 6 of 11), with
the unfound ones as "???". After the credits roll for the third time on a save profile, the "???"
entries turn into one-line hints. The full answers stay in this file.

## Hidden mechanics (added by trevor's agent)

| Secret | How to trigger | In-world hint | Status |
|---|---|---|---|
| **Vending machine kick** | Press E on the ASTER lobby vending machine. About 1 in 3 kicks pays scrap, sometimes a cold mate. | It hums at you, offended | built |
| **The machine remembers you** | Kick the lobby vending machine 7 times in one session (sets `secrets.vending.found`) | It escalates its reactions | built |
| **Rail grind** | Ride a scooter (Q, outdoors) along any rail track, e.g. the dead Purple Line strip in College Park: much faster travel with sparks (sets `secrets.grind.found`) | The scooter yard is right by the track | built |
| **Shrimp canary** | Check Trevor's shrimp tank in 631: their behavior tells you how rotted the tunnels still are | The tank text says they act up before rot spikes | built |
| **Sump pump** (puzzle step) | Restart the pump in the tunnels' pump room to drain the flooded bay and read the B switch clue | The vending-machine marks "below the waterline" | built |

## Hard optional puzzles (boons)

| Puzzle | Solution | Hints in the world | Boon | Status |
|---|---|---|---|---|
| **The Four Clocks** | Four rotted clocks are stuck at 19:01: the 6th-floor hallway, the ASTER lobby, the College Park station, and the dead platform. Press E to wind each one (each wind steps 19:01 → 21:30 → 00:00 → **03:14** → 06:45 → 12:00). Set all four to **03:14** | The paper clock taped under the station clock ("USE THIS ONE") has its hands at 3:14 | **Rollover charm** (charm slot, −12% damage taken). The hallway clock's face swings open | built |
| **Manuel's busts** | Turn the three busts to face the flag in the order **newest (#3), then the first (#1), then the second (#2)**. A wrong turn resets them | A scrap at Manuel's sculpting table: "la última primero, después la primera". (House rule #1 says don't touch them.) | **Porcelain Pork pin** (charm, +3 melee/+3 ranged) and a strange moment | built |
| **Fishing oddities** | Fish the Paint Branch (College Park) or the tunnels' flooded bay: rare catches include a 2020s phone that still rings, a 2081 "Ten Years of Stability" coin, and a banned Pork action figure | Fishing anywhere there's water (press E at the edge) | built |
