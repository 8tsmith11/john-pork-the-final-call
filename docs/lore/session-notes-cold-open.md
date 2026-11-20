# Notes from a session: workshopping the cold open (Michael, 2026-11-20)

The first cold-open script was rejected by Michael because it didn't make sense. These are the lessons from
rewriting it with Michael. They apply to every scene, and most of all to openings. Spoiler-free.

## What went wrong

- **The writer's knowledge leaked in.** Lines leaned on things only the script author knew: an alarm
  label nobody sees, "the way Manuel goes to his closet" before the closet came up, a stranger's hook,
  a name (Kess) with no introduction. The player in scene one knows nothing. Every reference needs
  its setup on screen first.
- **Clever over clear.** Lines like "Past me is a monster", "the cut is square" and "flush cutters"
  read as writing, not as people talking. If a line needs a footnote, cut it.
- **Pronouns with no one behind them.** The scene opened on "He opens his eyes." Name people.
- **The lore contradicted the scene.** It had Trevor waking in his own room, but all three sleep on
  the triple bunk, and Trevor's room is storage. The time was set before the break-in it described.
  Check the bible and the map before staging anything.
- **Choices that did nothing.** Two of the four choice flags were never read anywhere. Make an option
  matter later or leave it out.
- **Too much detail on the wrong things.** A paragraph on bent metal and paint colour while the
  emotional beat (the balloon is gone) got one line.
- **Action after text.** The animation played as a silent pre-roll, then the dialogue narrated what
  had already happened. Action plays on the line it belongs to.

## What worked

- **Plain reactions to big moments.** "Guys. The balloon's gone." "What? Gone gone?" The others are
  shocked and worried, because the balloon matters to the real roommates.
- **Real-life material.** The hiding game ("Is this the hiding game? I won't even be mad."),  the
  dinner parties, 245 lab at nine. Things the three of them recognize land hardest.
- **Characters with a reason to act.** They don't call the police because the police are Continuity
  and there's a John Pork flag on the wall. One exchange explains the world and the choice.
- **World setup through things in the room.** A wall screen's Continuity broadcast sets up the pocket,
  code rot and the helium hunt. The van out the window sets up the side quest.
- **Let the players deduce.** The roommates are engineers. Leave the clues (the bent plate, the chain
  that's off, the bolt that's thrown, the empty printer tray) and let the players put them together.
  Don't have a character explain the answer.
- **Getting the voices right.** Manuel is warm and forgiving, and talks like a normal person (an
  occasional "che", no more). See `real-life.md`. A writing guide that over-states a tic ("Manuel says
  che") turns into a character who says nothing else.

## What the later rounds taught (same session)

- **Show the world, don't assume it.** Michael's next note was that nothing said John Pork is banned,
  even though the roommates keep contraband at home. Every opening has to set up the basics through
  things people see and say: who runs things (Continuity), what's wrong with the world (code rot),
  and where we are (College Park, a protected pocket that could be sealed). And when the players
  step outside, the world should confirm it (propaganda posters, hub #100).
- **Make the reactions match the stakes.** The first fix still had the roommates calm about the
  missing balloon. It matters to the real roommates, so the characters are shocked and worried.
- **A character's anger has a target.** Manuel is warm and never angry at his roommates, so a line
  like "Gone like it isn't here, Michael" read as him snapping at a friend. Check who a sharp line
  lands on.
- **Don't let a voice tic run the character.** The writing guide said Manuel says "che", so the
  drafts had him saying it in almost every line. A tic is seasoning. Most lines should sound like a
  normal person. (WRITING.md now says so.)
- **Give the reason the players would give.** "We find it tonight" first rested on helium floating
  away. Michael's version: someone stole something precious, and a thief sells it before breakfast.
- **Characters solve things themselves.** Michael asked why Trevor wanted to call someone about the
  door when three engineers can read a bent lock plate. Don't hand a deduction to a stranger the
  player hasn't met.
- **Use the humans' own names for things.** "245 lab", the hiding game, the dinner parties.
  Michael's small edits were mostly swapping a generic detail for the real one.
- **Stage directions never go in a spoken line.** "(beat)" was left inside one of Michael's lines,
  and it showed on screen. A pause is a line break, or a `> do:` cue.
- **A human's lock covers every character.** Once Michael approved the scene (D-022), the only line
  change was the one he asked for. Translations and staging can be added; English lines and their
  order can't move. When an agent review asks to change a locked line, ask the human. Don't edit it.
- **Keep the readable docs and PR text neutral.** Notes about a roommate that didn't come from that
  roommate, and anything that could spoil a surprise, go in the sealed files. Readable docs, PR
  titles and bodies, commit messages, comments and test names stay plain from the first push,
  because history can't easily be rewritten later.
- **A workshop file works.** One plain file the human edits directly (`>>` for notes), read as a
  diff, was faster and cheaper than pasting the whole script into chat every round.
- **Stage against objects, not coordinates.** Cues that say "walk to Manuel's closet" keep working
  when the map changes. Before shipping, check that every line in the game data matches the locked
  text exactly.

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
