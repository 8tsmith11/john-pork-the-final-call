// Barks: the short things the roommates say on their own, shown over their heads.
// Cosmetic and local (each screen picks its own); nothing here changes the game or the story.
// Keep each line something a tired 21-year-old would say out loud. See docs/lore/WRITING.md.

export const BARKS = {
  // Now and then, standing around or walking.
  idle: {
    manuel: [
      'I hate 245 lab.',
      'Che. My mate\'s gone cold.',
      'Did anybody turn off fab two?',
      'Ears lower. Always lower than you think.',
      'I had lab at eight. I still have lab at eight.',
      'It doesn\'t just go. Somebody has to carry it.',
    ],
    trevor: [
      'I should\'ve brought the guitar.',
      'Somebody feed the shrimp when we\'re back.',
      'I\'m not tired. I\'m horizontal on the inside.',
      'That hum\'s a B flat. Roughly.',
      'Whose turn was the chain?',
      // Trevor calls John Pork "Juan Puerco" (Manuel's request), in English too.
      'If Juan Puerco calls, I\'m in the shower.',
      'Juan Puerco hasn\'t called in a while. I don\'t like it.',
      'Nobody pick up for Juan Puerco without me.',
    ],
    michael: [
      'No bars. Obviously no bars.',
      'She\'d know what room this is from the echo.',
      'I\'m just checking the time.',
      'I\'ve got a thing at nine. I had a thing at nine.',
      'Is anybody else hungry? Is that weird?',
      'Trevor keeps calling him Juan Puerco. It\'s catching.',
    ],
  },
  // Manuel in his morph gets stranger. The others notice before he does.
  idleMorph: {
    manuel: [
      'The gonman is hydrated.',
      'THE gonman. Say the article.',
      'I can hear the printers from here. Can you hear the printers?',
      'I hate 245 lab. The gonman also hates 245 lab.',
    ],
  },
  // After a kill.
  kill: {
    any: ['Aster pros.', 'Aster pros!'],
    manuel: ['Che, did you see that?', 'That\'s for my closet.'],
    trevor: ['Clean.', 'That one had a name tag.'],
    michael: ['Sorry! Sorry. Not that sorry.', 'Okay. Okay okay okay.'],
  },
  // When somebody else gets hit, or goes down.
  allyHurt: {
    // "You're absolutely right to point that out" is a real joke of theirs: answering each other like a chatbot.
    any: ['Rookie Aster mistake.', 'Dodge is space, by the way.', 'You\'re absolutely right to point that out. I did get hit.'],
    manuel: ['Che, move your feet.'],
    trevor: ['You\'re standing in it.'],
    michael: ['You good? You look not good.'],
  },
  allyDown: {
    any: ['Aster noob down. I\'m coming.', 'Rookie Aster mistake. Hold on.', 'You\'re absolutely right to point that out. You are on the floor.'],
    manuel: ['Don\'t get comfortable down there.'],
    trevor: ['Stay there. Not that you have options.'],
    michael: ['I\'ve got you, I\'ve got you, where are you...'],
  },
  // Walking into a place, once per visit.
  enter: {
    room631: { manuel: ['Nobody touch the closet.'], trevor: ['Home. Sort of.'], michael: ['It smells like solder. I love it here.'] },
    aster_hall: { manuel: ['Varga\'s light is on.'], trevor: ['Keep it down. People sleep on six.'], michael: ['Hi, hallway.'] },
    aster_lobby: { manuel: ['Check the mail.'], trevor: ['Everybody checks the mail.'], michael: ['Evening, Fenwick.'] },
    metro_plaza: { manuel: ['The van\'s still there.'], trevor: ['Rain. Naturally.'], michael: ['Is the diner open? The diner\'s always open.'] },
    tunnel_1: { manuel: ['Balloons go up. I keep saying.'], trevor: ['Smells like a wet amp.'], michael: ['Is that drumming, or is that me?'] },
    platform: { manuel: ['There.'], trevor: ['Nobody clump up.'], michael: ['I don\'t like how quiet it got.'] },
  },
};

/** Pick a line for a roommate from a table that may have per-character lists and an `any` list. */
export function pickBark(table, who, rand = Math.random) {
  if (!table) return null;
  const pool = [...(table[who] ?? []), ...(table.any ?? [])];
  return pool.length ? pool[Math.floor(rand() * pool.length)] : null;
}
