// Barks: the short things the roommates say on their own, shown over their heads.
// Cosmetic and local (each screen picks its own); nothing here changes the game or the story.
// Keep each line something a tired 21-year-old would say out loud. See docs/lore/WRITING.md.

export const BARKS = {
  // The running joke (Manuel: "I hate 245 lab" more often). One idle line in five comes from here. Trevor's is the
  // whiteboard's "same"; Michael hates it too, warmly.
  lab245: {
    manuel: ['I hate 245 lab.', 'Still hate 245 lab. Checked again.', 'They should close 245 lab. For safety.', 'In my next life I skip 245 lab.'],
    trevor: ['I also hate 245 lab, eh?', '245 lab took my whole weekend, eh. Missed the game and everything.', 'Same, eh. Aboot 245 lab.'],
    michael: ['I hate 245 lab, and I love everybody here.', 'Who designed 245 lab? I want a word.', 'I haven\'t started the 245 report. I haven\'t started the last one.'],
  },
  // Now and then, standing around or walking.
  idle: {
    manuel: [
      'I hate 245 lab.',
      'Che. My mate\'s gone cold.',
      'Did anybody turn off fab two?',
      'Ears lower. Always lower than you think.',
      'I had lab at eight. I still have lab at eight.',
      'It doesn\'t just go. Somebody has to carry it.',
      "If anyone asks, I was never here.",
      "My feet are wet. My soul is wet.",
      "I need mate. Medically.",
      "I can smell the diner from here. Cruel.",
      "Who walks this slow? Oh. Me.",
      "After this I sleep for three days.",
    ],
    trevor: [
      'I should\'ve brought the guitar, eh?',
      'Somebody feed the shrimp when we\'re back at the hoose, eh?',
      'I\'m not tired, eh. I\'m horizontal on the inside, eh.',
      'That hum\'s a B flat, eh. Roughly, eh.',
      'Whose turn was the chain, eh?',
      "My step count is going to be insane, eh. Like a double shift at the rink.",
      "I left a benchmark running, eh. Soary, laptop.",
      "If the stack wears off, just carry me, eh?",
      "Rain is just the sky debugging, eh.",
      "Nobody tell my mom where I am, eh. She'll call my aunt in Tranna.",
    ],
    michael: [
      'No bars. Obviously no bars.',
      'She\'d know what room this is from the echo.',
      'I\'m just checking the time.',
      'I\'ve got a thing at nine. I had a thing at nine.',
      'Is anybody else hungry? Is that weird?',
      "Do you think the shrimp miss us?",
      "I would kill for a bagel right now.",
      "If I die, delete my search history.",
      "My phone says 2%. It always says 2%.",
      "I should text her. I won't. But I should.",
      "We're the good guys, right?",
    ],
  },
  // Rare idle lines (about one idle bark in eight): Trevor's nicknames for John Pork, Juan Puerco or Juan
  // Cerdo (Manuel's idea; Trevor: "sometimes, only rarely"), and Michael noticing.
  idleRare: {
    trevor: [
      'If Juan Puerco calls, I\'m in the shower, eh?',
      'Juan Puerco hasn\'t called in a while, eh. I don\'t like it, eh.',
      'Nobody pick up for Juan Cerdo without me, eh?',
    ],
    michael: ['Trevor keeps calling him Juan Puerco. It\'s catching.'],
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
    trevor: ['Clean, eh. Top shelf.', 'That one had a name tag, eh. Soary, buddy.'],
    michael: ['Sorry! Sorry. Not that sorry.', 'Okay. Okay okay okay.'],
  },
  // When somebody else gets hit, or goes down.
  allyHurt: {
    // "You're absolutely right to point that out" is a real joke of theirs: answering each other like a chatbot.
    any: ['Rookie Aster mistake.', 'Dodge is space, by the way.', 'You\'re absolutely right to point that out. I did get hit.'],
    manuel: ['Che, move your feet.'],
    trevor: ['You\'re standing in it, eh. Hoser.'],
    michael: ['You good? You look not good.'],
  },
  allyDown: {
    any: ['Aster noob down. I\'m coming.', 'Rookie Aster mistake. Hold on.', 'You\'re absolutely right to point that out. You are on the floor.'],
    manuel: ['Don\'t get comfortable down there.'],
    trevor: ['Stay there, eh. Not that you have options, eh.'],
    michael: ['I\'ve got you, I\'ve got you, where are you...'],
  },
  // Manuel, getting rounder as he levels (level 3 on). His own line first.
  rounder: { manuel: ['I have to stop going to the dining hall.', 'The dining hall has a waffle machine now. That\'s the problem.', 'These pants shrank. In the wash. All of them.'] },
  // Manuel, from the gonman's stage two on (level 6): the white splotches on his clothes. Manuel's own request.
  toothpaste: { manuel: ['It\'s toothpaste.', 'That\'s toothpaste. I brush very hard.', 'Toothpaste. Don\'t ask about the angle.'] },
  // Places inside a big map (landscape pass): walking into one gets a one-liner, once per visit.
  // at: [x, y, w, h] in tiles. Bubbles, not boxes (Manuel: they keep the game moving).
  zones: {
    metro_plaza: [
      { at: [36, 16, 6, 6], manuel: ["Throw a coin. For the balloon."], trevor: ["That pump stopped before we were born, eh. Look at the water, eh."], michael: ["I'm making a wish. Don't ask."] },
      { at: [30, 37, 24, 12], manuel: ["Somebody lives in that car. Respect."], trevor: ["Those four are always here, eh. Always, eh."], michael: ["Don't make eye contact with the rice guy."] },
      { at: [66, 9, 12, 3], manuel: ["If they had medialunas I would live here."], trevor: ["Their coffee is technically coffee, eh. Not a double-double, but."], michael: ["Pancakes after? Please?"] },
      { at: [2, 37, 26, 9], manuel: ["There it is. The building where I suffer."], trevor: ["Rub the turtle, eh. It's science, eh."], michael: ["Campus at night is creepy."] },
      { at: [66, 18, 14, 4], manuel: ["Ours are better. Ours just don't have tires."], trevor: ["Ray will try to sell us a scooter, eh. Ray always tries, eh."], michael: ["I want the red one."] },
      { at: [1, 28, 55, 2], manuel: ["Don't step on the rail. Just in case."], trevor: ["They built the whole line and never ran a train, eh."], michael: ["Purple Line, opening soon. Any decade now."] },
      { at: [44, 20, 9, 8], manuel: ["Act normal. Normal."], trevor: ["Don't say helium near the van, eh."], michael: ["Hi! We're just walking!"] },
      { at: [66, 38, 17, 5], manuel: ["Smells like the river back home. Worse."], trevor: ["Ozzie's at the lake, eh. Ozzie is always at the lake, like it's frozen over, eh."], michael: ["Is that a frog? That's a frog."] },
    ],
  },
  // Walking into a place, once per visit.
  enter: {
    room631: { manuel: ['Nobody touch the closet.'], trevor: ['Home, eh. Sort of. The hoose.'], michael: ['It smells like solder. I love it here.'] },
    aster_hall: { manuel: ['Varga\'s light is on.'], trevor: ['Keep it down, eh. People sleep on six, eh.'], michael: ['Hi, hallway.'] },
    aster_lobby: { manuel: ['Check the mail.'], trevor: ['Everybody checks the mail, eh.'], michael: ['Evening, Fenwick.'] },
    metro_plaza: { manuel: ['The van\'s still there.'], trevor: ['Rain, eh. Naturally.'], michael: ['Is the diner open? The diner\'s always open.'] },
    tunnel_1: { manuel: ['Balloons go up. I keep saying.'], trevor: ['Smells like a wet amp, eh. Or a hockey bag.'], michael: ['Is that drumming, or is that me?'] },
    platform: { manuel: ['There.'], trevor: ['Nobody clump up, eh. Spread out like a power play.'], michael: ['I don\'t like how quiet it got.'] },
  },
};

/** Pick a line for a roommate from a table that may have per-character lists and an `any` list. */
export function pickBark(table, who, rand = Math.random) {
  if (!table) return null;
  const pool = [...(table[who] ?? []), ...(table.any ?? [])];
  return pool.length ? pool[Math.floor(rand() * pool.length)] : null;
}
