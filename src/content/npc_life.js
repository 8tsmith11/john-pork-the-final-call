// How the named NPCs behave when nobody is talking to them (src/game/npcLife.js), and the short lines
// they throw at you when you walk up. Manuel: "more variability in looks, reactions and how they act",
// and "make the dialogues fun". Moods: 'pace' (shifts weight side to side), 'fidget' (little hops and
// turns), 'nod' (keeps nodding off), 'still' (barely moves, turns to look). Lines are cosmetic and local;
// nothing here changes the story. Spanish lives in src/content/lines_es.js (a test checks every line).
export const NPC_LIFE = {
  'npc.doorman': { mood: 'nod', hi: ['Sign in. Or don\'t. I\'ll write you down anyway.', 'Evening. It\'s always evening in here.', 'Wipe your feet. On the outside.'] },
  'npc.dez': { mood: 'fidget', hi: ['Sup.', 'I\'m not loitering. I\'m leaning.', 'You guys smell like stairs.'] },
  'npc.kess': { mood: 'fidget', hi: ['Don\'t touch the door. It\'s off.', 'Got a stripped screw? I collect them.', 'Your hinges are a cry for help.'] },
  'npc.seun': { mood: 'pace', hi: ['Have you eaten? Lie to me if you have to.', 'Mrs. Varga says hi. She said it to the wall, but I\'m passing it on.'] },
  'npc.409': { mood: 'still', hi: ['Please hold.', 'Your call is important. To someone.', 'Soup\'s cold. It\'s fine. I\'m on hold anyway.'] },
  'npc.pell': { mood: 'still', hi: ['Knees. I\'m reading your knees.', 'Stairs again? Your shins will thank you in forty years.'] },
  'npc.okafor': { mood: 'nod', hi: ['Sit. You look like a draft.', 'My grandson is upstairs arguing with a toaster. The toaster is winning.'] },
  'npc.mina': { mood: 'pace', hi: ['Tip jar\'s the hat. Not this hat.', 'I take requests. Not that one.'] },
  'npc.ray': { mood: 'fidget', hi: ['That scooter of yours is crying.', 'Running rich, all three of you.', 'If it rattles, it\'s fine. If it stops rattling, run.'] },
  'npc.cal': { mood: 'pace', hi: ['Can I count on your vote? For anything?', 'Smile. You\'re on my flyer now.', 'Engineering! I love engineering. What is it?'] },
  'npc.halvard': { mood: 'still', hi: ['Looking or buying? Looking costs too.', 'Don\'t touch the merchandise. Don\'t touch the air near it.'] },
  'npc.pruitt': { mood: 'pace', hi: ['Don\'t step on the readings.', 'If anyone asks, I\'m on a break. I am always on a break.'] },
  'npc.abatement_tech': { mood: 'fidget', hi: ['Nobody past the tape. That includes me.', 'They gave me a jar. Nobody said what goes in the jar.'] },
  'npc.ozzie': { mood: 'nod', hi: ['Shh. They can hear you through the water.', 'Nothing\'s biting. Nothing\'s been biting since 2071.'] },
  'npc.rotter_1': { mood: 'fidget', hi: ['next train. next train.'] },
  'npc.rotter_3': { mood: 'still', hi: ['...you look like someone.'] },
};

// When Manuel's gas cloud drifts past an NPC (src/game/fart.js).
export const NPC_FART = {
  any: ['Oh, come ON.', 'Was that the drain?', 'Somebody call abatement.', 'That\'s a code violation.', 'My eyes. My actual eyes.'],
  'npc.doorman': ['I\'m logging that.'],
  'npc.409': ['Please hold your breath.'],
  'npc.pruitt': ['That\'s going in the report.'],
  'npc.ray': ['You\'re running rich, buddy.'],
  'npc.cal': ['I\'ll... still take your vote.'],
};
