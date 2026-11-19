# Dialogue craft

Trevor asked us to look into how good dialogue is written. This sits next to `story-craft.md` (what
makes the story good), `story-structure.md` (followability) and `docs/lore/WRITING.md` (our banned
patterns). Spoiler-free.

**Sources.** Primary sources: David Mamet's memo to *The Unit*'s writers (2005); Elmore Leonard's
rules (NYT, 2001); Alexander Freed's series on branching conversations (Game Developer, 2014). The
rest are secondary craft pieces, marked *(secondary)*.

## What the sources say

**1. Every scene is somebody wanting something.** Mamet's three questions: "Who wants what? What
happens if [they] don't get it? Why now?" The main character needs "a simple, straightforward,
pressing need which impels him or her to show up in the scene", and a scene that doesn't advance the
plot and stand on its own is "either superfluous, or incorrectly written." For us: every talk node
starts from what the NPC (or the roommate) wants right now.

**2. Information is not drama.** "The audience will not tune in to watch information." Mamet calls
out "the 'little' expositional scenes of two people talking about a third" and any character saying
"as you know". Clues should come out of someone trying to get something, not out of a briefing.

**3. Subtext: people talk around the thing.** Hemingway's "Hills Like White Elephants" never names
its subject. Short lines, few tags, no interior monologue, and the reader works it out
*(SparkNotes; secondary)*. Real conversation is "full of evasion, implication, and indirection"
*(secondary)*. For us: grief, guilt and fear are shown by what a character avoids, never named.
WRITING.md already bans named feelings.

**4. If it sounds like writing, rewrite it.** Leonard's overall rule. His tag rules ("said" only,
no adverbs on "said") don't apply directly, because we use speaker labels. Their point does: the
line must carry its own tone.

**5. Concise.** "Eliminate the unnecessary so that the necessary may speak." A 62-word quest ask
loses nothing at 20 words *(Slabinski, Game Developer blog; secondary)*. Our new rule is no spoken
line over 20 words, and lint enforces it.

**6. The player character drives.** "The Player character is still the protagonist and undisputed
star." The NPC shouldn't carry the scene while the roommates nod *(Freed)*.

**7. Choices are rewards, and big ones are signposted.** "Make every Player response option
awesome." Make sure the player "understands that the branch is happening." Give disinterested
players a clean, well-written path through *(Freed)*.

**8. Even Peasant #7 has character.** "Even if their file name is only Peasant #7, the peasant needs
to have some character" *(Slabinski)*. One trait, played in the line itself.

**9. Lore is garnish.** Optional lore goes in side talks, objects and the field guide, unless the
story depends on it *(Slabinski)*.

**10. Barks tell the player something.** "The most important job of a bark is to tell the player
something that supports the gameplay." Overly clever barks get vague. Barks need variety and an
implied meaning, and shouldn't replace visual storytelling (Far Cry 2's Patrick Redding, GDC 2009,
via Kotaku and Game Developer; secondary).

## Checklist (run per talk node)

1. **Want:** in the first line or two, what does the speaker want, and why now?
2. **No "two people talking about a third"** as pure exposition. The clue comes out of a want, a
   bargain or a conflict.
3. **No "as you know", "like I said" or "as I told you".** Lint: `as-you-know`.
4. **Subtext:** the most important feeling in the scene is never named.
5. **Length:** no spoken line over 20 words (lint), 3–4 lines to reach the point, and choice labels
   of 2–5 words.
6. **The roommates drive:** at least one roommate line per node pushes, refuses or asks. They don't
   only react.
7. **Every NPC has one trait,** and you can hear it in the wording.
8. **Lore is optional** unless the plot needs it; extra lore goes to a second talk or the field guide.
9. **Barks:** each one tells the player something useful (danger, a direction, a state), and none
   repeat within six lines (`_freshBark`).

## Sources

- David Mamet, memo to the writers of *The Unit* (19 Oct 2005): [SlashFilm reprint](https://www.slashfilm.com/508254/a-letter-from-david-mamet-to-the-writers-of-the-unit/)
- Elmore Leonard, "Easy on the Adverbs, Exclamation Points and Especially Hooptedoodle" (NYT, 2001); rules summarized at [The Marginalian](https://www.themarginalian.org/2013/08/21/elmore-leonard-10-rules-of-writing/)
- Alexander Freed, [Branching Conversation Systems and the Working Writer, Part 4](https://www.gamedeveloper.com/design/branching-conversation-systems-and-the-working-writer-part-4-key-principles)
- Mark Slabinski, [8 Key Principles of Writing Effective Game Dialogue](https://www.gamedeveloper.com/game-platforms/8-key-principles-of-writing-effective-game-dialogue) (secondary)
- [Why Video Game Characters Say Such Ridiculous Things (Kotaku)](https://kotaku.com/why-video-game-characters-say-such-ridiculous-things-5921878) (barks; secondary)
- Hemingway's iceberg and "Hills Like White Elephants": [SparkNotes](https://www.sparknotes.com/short-stories/hills-like-white-elephants/section2) (secondary)
