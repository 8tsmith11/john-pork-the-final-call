// NPC approaches (Michael's request, D-017): when you talk to someone you choose HOW. Every approach
// but Talk is an ability check (src/content/abilities.js): d20 + modifier vs the person's DC.
//   Charm (CHA) · Deceive (CHA) · Intimidate (STR) · Insight (WIS) · Investigate (INT) · Pickpocket (DEX)
// Everyone carries a few things (POCKETS by role, rolled once per world from the seed). Charm, Deceive
// and Intimidate get things handed over; Pickpocket takes them; Investigate shows you what they carry
// and gives the next Pickpocket advantage; Insight tells you whether they're hiding something.
// Fail and they turn wary for a while; get caught robbing a guard and Continuity hears about it.
// Per NPC overrides go on the map object: role, dc: { charm: 18 }, pockets: 'guard', insight: '...',
// approach: false (Talk only).

export const APPROACHES = [
  { id: 'talk', name: 'Talk', ability: null },
  { id: 'charm', name: 'Charm', ability: 'cha' },
  { id: 'deceive', name: 'Deceive', ability: 'cha' },
  { id: 'intimidate', name: 'Intimidate', ability: 'str' },
  { id: 'insight', name: 'Insight', ability: 'wis' },
  { id: 'investigate', name: 'Investigate', ability: 'int' },
  { id: 'pickpocket', name: 'Pickpocket', ability: 'dex' },
];

// Who's who. Unlisted NPCs are residents. (Map objects can set `role` themselves.)
export const ROLE_OF = {
  'npc.doorman': 'guard', 'npc.pruitt': 'guard', 'npc.abatement_tech': 'guard',
  'npc.kess': 'worker', 'npc.addo': 'worker', 'npc.del': 'worker', 'npc.seun': 'worker',
  'npc.mina': 'vendor', 'npc.ray': 'vendor', 'npc.halvard': 'vendor',
  'npc.okafor': 'elder', 'npc.409': 'elder', 'npc.pell': 'elder',
  'npc.rotter_1': 'drifter', 'npc.rotter_2': 'drifter', 'npc.rotter_3': 'drifter',
};

// Difficulty by role (D&D: 10 easy, 15 medium, 20 hard).
export const DC = {
  guard:    { charm: 15, deceive: 14, intimidate: 18, insight: 12, investigate: 12, pickpocket: 17 },
  worker:   { charm: 12, deceive: 12, intimidate: 13, insight: 11, investigate: 10, pickpocket: 13 },
  vendor:   { charm: 13, deceive: 15, intimidate: 15, insight: 13, investigate: 12, pickpocket: 15 },
  resident: { charm: 11, deceive: 12, intimidate: 12, insight: 11, investigate: 10, pickpocket: 12 },
  elder:    { charm: 10, deceive: 10, intimidate: 9,  insight: 14, investigate: 11, pickpocket: 11 },
  drifter:  { charm: 13, deceive: 10, intimidate: 10, insight: 16, investigate: 9,  pickpocket: 9 },
};
// Drifters (the rotters) are coderot-impaired: you can read them, not rob or play them.
export const ALLOWED = { drifter: ['talk', 'insight', 'investigate'] };

// What's in their pockets: [itemId | 'money', weight, min, max]; `rolls` picks per person.
export const POCKETS = {
  guard:    { rolls: 3, table: [['money', 30, 6, 18], ['item.keycard', 25, 1, 1], ['item.energy_bar', 15, 1, 1], ['item.lighter', 15, 1, 1], ['item.sleep_potion', 8, 1, 1]] },
  worker:   { rolls: 2, table: [['money', 35, 3, 10], ['item.mat_scrap', 20, 1, 3], ['item.mat_wire', 15, 1, 2], ['item.lighter', 10, 1, 1], ['item.energy_bar', 15, 1, 1]] },
  vendor:   { rolls: 3, table: [['money', 45, 8, 22], ['item.crab_chips', 20, 1, 1], ['item.lottery_ticket', 15, 1, 1], ['item.mat_circuit', 10, 1, 1]] },
  resident: { rolls: 2, table: [['money', 35, 2, 9], ['item.hard_candy', 20, 1, 2], ['item.lottery_ticket', 10, 1, 1], ['item.energy_bar', 15, 1, 1], ['item.mat_glass', 15, 1, 2]] },
  elder:    { rolls: 2, table: [['item.hard_candy', 45, 1, 3], ['money', 30, 1, 6], ['item.lottery_ticket', 15, 1, 1]] },
  drifter:  { rolls: 1, table: [['item.mat_gel', 50, 1, 2], ['item.mat_glass', 30, 1, 1]] },
};

// What happens, in their words. {name} is the NPC. Outcomes: crit (natural 20), win, lose, fumble (natural 1).
// A role can override any approach (guards do).
export const LINES = {
  charm: {
    crit: ['{name} laughs, actually laughs, and presses something into your hand. "Take it. You need it more than I do."', '{name} looks at you like you just fixed their whole night. "Here. For the trouble you haven\'t caused yet."'],
    win: ['{name} softens. "Fine. You\'re fine." Something changes hands.', '"Okay, smooth." {name} digs in a pocket and gives you a little something.'],
    lose: ['{name} gives you a look that could strip paint. "No."', '"Is this a bit? This feels like a bit." {name} turns away.'],
    fumble: ['You say something you will think about in the shower for years. {name} walks off without a word.'],
  },
  deceive: {
    crit: ['{name} buys every word, and then improves on your lie for you. They hand it over without being asked.'],
    win: ['"Building maintenance? Oh. Sure." {name} hands it over.', '{name} hesitates, then believes you. People mostly do.'],
    lose: ['{name} squints. "You don\'t work here." It isn\'t a question.', '"Nice try." {name} pats a pocket, very deliberately.'],
    fumble: ['You forget your own lie halfway through it. {name} watches you do it.'],
  },
  intimidate: {
    crit: ['{name} empties a pocket before you finish the sentence.'],
    win: ['{name} swallows. "Okay. Okay. Take it." It\'s handed over fast.'],
    lose: ['{name} looks you up and down and laughs. Not nervously.'],
    fumble: ['You lean in. {name} leans in further. You step back first. Everyone saw.'],
  },
  insight: {
    win_true: ['{name} means it. Whatever they told you, they believe it.', 'Nothing in {name}\'s face is hiding anything. Tired, not lying.'],
    win_hiding: ['{name} is holding something back. Their eyes keep going to {thing}.', '{name} answered too fast. They\'re hiding something about {thing}.'],
    lose: ['You can\'t read {name} at all.', '{name} is a closed door. Could be lying. Could be tired.'],
    fumble: ['You decide {name} is lying about the weather. {name} is not lying about the weather.'],
  },
  investigate: {
    win: ['You take {name} in properly: the pockets, the posture, what they keep touching. They\'re carrying {pockets}.'],
    lose: ['You look {name} over and learn nothing you didn\'t know.'],
    fumble: ['You stare at {name} for a while. {name} notices.'],
  },
  pickpocket: {
    crit: ['Your hand goes in and out like it never left. {name} has no idea. You come away with {loot}.'],
    win: ['A brush, an apology, and {loot} is yours.', 'Easy. {loot}, and {name} keeps walking.'],
    lose: ['{name} catches your wrist. "Really?"', '{name} feels it and spins round. You smile. It doesn\'t work.'],
    fumble: ['You get your hand stuck in {name}\'s pocket. For a while.'],
  },
  empty: ['{name} has nothing left on them.'],
  wary: ['{name} wants nothing to do with you right now.'],
};
export const GUARD_LINES = {
  deceive: { win: ['"Inspection? Nobody told me." {name} hands it over to make you go away.'], lose: ['{name} touches the radio. "Want to tell that to Continuity?"'] },
  intimidate: { lose: ['{name} doesn\'t even stand up. "Walk away."'], fumble: ['{name} stands up. You walk away.'] },
  pickpocket: { lose: ['{name} grabs your arm and keys the radio. Continuity heard that.'] },
};
// What a hiding NPC keeps looking at (Insight), by role.
export const TELLS = {
  guard: ['the radio', 'the door behind them', 'the sign-in book'], worker: ['the van outside', 'their phone', 'the clock'],
  vendor: ['the cash box', 'the back room', 'the street'], resident: ['the stairwell', 'their phone', 'the window'],
  elder: ['the photo in their wallet', 'the window'], drifter: ['the dark', 'nothing at all'],
};

export const WARY_MS = 90000;
