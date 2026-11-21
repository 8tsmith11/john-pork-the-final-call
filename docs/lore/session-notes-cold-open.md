# Notes from a session: workshopping the cold open (Michael, 2026-11-20)

Michael rejected the first cold-open script because it didn't make sense. These are the lessons from
rewriting it with him. They apply to every scene, and most of all to openings. Spoiler-free: the
examples that quote the locked scene, or describe a roommate's characterization, are sealed in
`docs/sealed/workshop-cold-open.md`.

## What went wrong

- **The writer's knowledge leaked in.** Lines leaned on things only the script author knew: a label
  nobody sees, a habit of a character before it came up, a stranger's hook, a name with no
  introduction. The player in scene one knows nothing. Every reference needs its setup on screen first.
- **Clever over clear.** Some lines read as writing, not as people talking. If a line needs a
  footnote, cut it.
- **Pronouns with no one behind them.** A scene that opens on "he" with nobody named. Name people.
- **The lore contradicted the scene.** Who sleeps where, and what time it is, didn't match the bible
  and the map. Check both before staging anything.
- **Choices that did nothing.** Some choice flags were never read anywhere. Make an option matter
  later or leave it out.
- **Too much detail on the wrong things.** A paragraph of physical description while the emotional
  beat got one line.
- **Action after text.** The animation played as a silent pre-roll, then the dialogue narrated what
  had already happened. Action plays on the line it belongs to.

## What worked

- **Plain reactions to big moments.** Short, shocked, worried lines, because the thing at stake
  matters to the real roommates.
- **Real-life material.** Things the three of them recognize from their own lives land hardest.
- **Characters with a reason to act.** One exchange can explain both the world and the choice the
  characters make in it.
- **World setup through things in the room.** Screens, windows and objects set up the world and the
  side quests without anyone lecturing.
- **Let the players deduce.** The roommates are engineers. Leave the physical clues and let the
  players put them together. Don't have a character explain the answer.
- **Getting the voices right.** A writing guide that over-states a verbal tic turns into a character
  who says nothing else. A tic is seasoning.

## What the later rounds taught (same session)

- **Show the world, don't assume it.** Every opening has to set up the basics through things people
  see and say: who runs things (Continuity), what's wrong with the world (code rot), and where we are
  (College Park, a protected pocket that could be sealed). When the players step outside, the world
  should confirm it (propaganda posters, hub #100).
- **Make the reactions match the stakes.** If something matters to the real roommates, the
  characters are shocked and worried, not calm.
- **A character's anger has a target.** Check who a sharp line lands on. A warm character snapping
  at a friend reads as a different person.
- **Don't let a voice tic run the character.** Most lines should sound like a normal person.
- **Give the reason the players would give.** A character's motive should be the one a real person
  in that spot would have.
- **Characters solve things themselves.** Don't hand a deduction to a stranger the player hasn't met.
- **Use the humans' own names for things.** Michael's small edits were mostly swapping a generic
  detail for the real one.
- **Stage directions never go in a spoken line.** A pause is a line break, or a `> do:` cue.
- **A human's lock covers every character.** Once Michael approved the scene (D-022), the only line
  change was the one he asked for. Translations and staging can be added; English lines and their
  order can't move. When an agent review asks to change a locked line, ask the human. Don't edit it.
- **Keep the readable docs and PR text neutral.** Notes about a roommate that didn't come from that
  roommate, and anything that could spoil a surprise, go in the sealed files. Readable docs, PR
  titles and bodies, commit messages, comments and test names stay plain from the first push,
  because history can't easily be rewritten later.
- **A workshop file works.** One plain file the human edits directly (`>>` for notes), read as a
  diff, was faster and cheaper than pasting the whole script into chat every round.
- **Stage against objects, not coordinates.** Cues that say "walk to the closet" keep working when
  the map changes. Before shipping, check that every line in the game data matches the locked text
  exactly.

## Checklist for the next scene

1. Could a first-time player follow every line with only what's on screen so far?
2. Is every name introduced before it's used, and every pronoun clear?
3. Does it match the bible and the map (who sleeps where, what time it is)?
4. Does every choice change something later?
5. Does each action play while its line is showing?
6. Does it set up who runs the world, what's wrong with it, and where we are?
7. Do the reactions match how much the thing matters to the real roommates?
8. Any stage directions or notes left inside a spoken line?
9. Is anything surprising, or about someone else's character, kept out of the readable docs and PR text?
10. Read it aloud. Would the real roommates say it?

## The result

The rewritten cold open is **final** and locked (D-022): `docs/sealed/script/01-cold-open.md`. Use it
as the model for how an opening should read.
