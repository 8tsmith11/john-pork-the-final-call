# Checklists: the research, as steps you run

> Trevor, 2026-11-23: "make sure the agents reference the research done on game design, story writing, dialogue
> improvements etc. don't just write it in a doc somewhere and forget, put it into actionable steps somewhere and
> let the agents know to use it."

These lists condense the research into steps you can check. The research files hold the reasons:
[`combat.md`](../research/combat.md), [`dialogue-craft.md`](../research/dialogue-craft.md),
[`story-craft.md`](../research/story-craft.md), [`story-structure.md`](../research/story-structure.md),
[`WRITING.md`](../lore/WRITING.md) §0, and [`session-notes-cold-open.md`](../lore/session-notes-cold-open.md).

**How to use them**
1. **Before you start**, open the list for the kind of work you're doing. Most work needs more than one list.
2. **When you deliver**, the PR body and your `hub.py done` / `review` note say which lists you ran and what
   failed, for example: `Checklists: A1-12, C1-8. Lint: 3 flags (two fine in context, one fixed).`
3. **Reviewers** check against the same lists and say so in their note. A review that doesn't is unfinished.
4. A rule a script can check belongs in a script: `tools/writing/lint.py` for lines, `tests/run.js` for systems,
   `tools/level/check.mjs` for maps. If you find yourself checking something by hand every time, add it there.

## A. A scene or any dialogue

1. **A new player can follow it.** Every line works with only what's already on screen: no unseen labels, no
   habits that haven't come up yet, no comparisons to scenes that haven't happened.
2. **Name before pronoun.** The scene's first line says who. No "he" with nobody behind it.
3. **It matches the bible and the map:** who sleeps where, what time it is, who's present.
4. **Wants:** each speaker wants something within their first line or two. The roommates push, refuse or ask;
   they don't only react.
5. **Reactions match the stakes.** Plain words at big moments. Spend words on the feeling, not the forensics.
   Leave clues for the players to work out; don't have a character explain the answer.
6. **Every choice changes something later**, or cut it. (Lint: `unread-flag` lists flags a scene sets that nothing reads.)
7. **Action plays on its line** (`> do:` cues), never as a silent pre-roll. No stage directions inside spoken
   lines. (Lint: `stage-direction`.)
8. **Set up the world on screen:** who runs it (Continuity), what's wrong with it (code rot), where we are.
9. **Short:** 20 words or fewer per spoken line (lint `long-line`), 3 to 4 lines to reach the point, and choice
   labels of 2 to 5 words. No "as you know" (lint).
10. **Names in full:** "John Pork", "code rot", "Tung Tung Tung Sahur". (Lint: `bare-pork`, `bare-rot`,
    `bare-sahur`.)
11. **A human-approved scene is locked** (D-022, the cold open). Don't edit its lines; ask that human.
12. **Read it aloud.** Would the real roommates say it? Use their real lives (`docs/lore/real-life.md`).

Run: `python3 tools/dialogue/convert.py && python3 tools/writing/lint.py`. The counts are safe to paste.
`--show` prints lines, which are spoilers.

## B. A quest or a story beat

1. **Motive and stakes are readable in the game** at every decision, not only in an author note.
2. **Causal handoff:** name the action, discovery or obstacle that sends the party to the next place.
3. **Orient after every transition:** who is here, where we are, and how it connects to the goal.
4. **Check every route:** any lead order, skipped optional content, both world seeds.
5. **Setup, then payoff.** Keep the ledger. A twist needs at least three plainly shown earlier moments with an
   innocent reading.
6. **After a detour,** the quest log says what's left and why, from the current state.
7. **Every player can see that a choice registered,** guests included.
8. **The main path uses the act.** The humans beat Act 1 in about 30 minutes because the main quest skipped most
   of its maps. Send the main thread through the act's places. Every new area needs a side quest, a secret, a
   person with a job and a reason to come back (`docs/design/10-scope.md`).
9. **Stitch it into the humans' other requests** (Manuel's rule), and post a short brief on the board before
   building. The lore gate's OK comes first (`docs/sealed/scaffold-cohesion.md` §6).
10. **No rescues by coincidence.** Failure paths (declines, deaths) get story, not just a reload.

## C. A boss or a fight

1. **Genuinely unique** (Trevor): one signature mechanic that comes from what and where the boss is, not a
   remix of the shared pattern list. Write down what a player learns in order to win.
2. **Every attack:** a tell you can read, the attack, then a recovery. Red tells mark attacks you can't parry.
3. **No free windows.** If the boss plants itself, it's guarded or the safe spot moves (the Warden's laser,
   hub #120).
4. **Skill, not mashing.** Mash-clicking a starter weapon loses; reading the tells wins. Prove both with a
   headless fight test (the balance bot).
5. **Adds are few,** and only where they add a decision (the Warden: from phase two only).
6. **Phases change the fight,** not just its speed.
7. **Readable for everyone:** tells, shells and rings read at 1x, and guests get them through the snapshot.
8. **Tests:** one per mechanic, plus a browser look before you call it done.

## D. An area or a map

1. `node tools/level/check.mjs` passes, including the room standard where a map is marked `standard: true`.
2. **Something sends people here:** the main quest or a side quest. Exits pair up, and every road you can see
   leads somewhere.
3. **Big enough** (Trevor, 2026-11-23): the College Park plaza (84 by 52 tiles) is the reference for an outdoor
   area. Don't chop a district into a chain of tiny rooms (the old Baltimore). Big roads like Route 1 run as one
   continuous stretch, not hops between small maps.
4. **Close to Act 1's density:** people with jobs, one secret, one reason to return.
5. **Story fit:** the brief goes on the board before you build.
6. **Sound:** a music or ambience entry in `src/audio/audio.js` (hub #115).
7. **It connects on the map** (Trevor, 2026-11-23): an outdoor area touches each outdoor neighbour along the edge
   you walk through, a building's inside sits at its door, and nothing overlaps on the MAP tab. Check with
   `node tools/level/world.mjs --list` ([`docs/design/13-world-map.md`](../design/13-world-map.md)).

## E. Progression and rewards

1. **Levelling can be easy, but what it unlocks is spread out** across the game (Trevor, hub #122).
2. **Big unlocks come from story,** not from a level number: morphs come from a story event (hub #119).
3. **Items, puzzles and rewards are tied to the story** (story cohesion). Never shove them in.

## F. A review

Use the lists that match the work. Say which items you checked and what failed. Run the tests and the lint on
the exact head you're reviewing.
