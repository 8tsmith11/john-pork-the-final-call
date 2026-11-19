// Quests as data. Hooks for writers (no engine code needed):
//   giver: npc id · ask: flag set when you first talk to the giver (with `pitch` as their line)
//   give: { item, flag, refuse }  → talking to the giver while carrying `item` hands it over, sets flag
//   inspect: { obj, flag, text }  → examining `obj` while the quest is active sets flag (appends text)
//   report: { needs, flag }       → talking to the giver after `needs` is set sets flag
// Quests as data. Stages complete when their `done(flags, save)` test passes; the engine checks each
// second, advances, toasts, and pays rewards. Side quests start when `start` passes (usually a flag
// set by talking to the giver). Writers (gonman / docs/design/05-quests.md) extend this table.

export const QUESTS = [
  {
    id: 'main.balloon', why: "Someone forced the front door tonight and took Manuel's orange balloon from his closet. Find out who, and get it back.", title: 'The balloon', main: true, act: 1,
    stages: [
      { text: 'Check Manuel\'s closet.', done: (f) => f['act1.balloon.noticedGone'] },
      { text: 'Look at the front door.', done: (f) => f['act1.clue.lockForced'] },
      // Clear next steps (Trevor): name the places and people, and say how many leads are enough.
      { text: 'Ask around the ASTER lobby. Somebody saw something at 3 a.m.', done: (f) => Object.keys(f).some((k) => k.startsWith('met.npc.') || k.startsWith('act1.halvard') || k.startsWith('act1.leadC') || k.startsWith('act1.leadA')) },
      { text: 'Run down two leads: Halvard under the metro stairs, the lobby camera footage, or the helium trail (print a sniffer at Fab #1).', done: (f) => [f['act1.halvard.met'], f['act1.leadC.done'], f['act1.leadA.done']].filter(Boolean).length >= 2 || f['act1.cordon.passed'] || f['act1.beat.call'] },
      { text: 'Get past the abatement cordon at the storm grate in the plaza.', done: (f) => f['act1.cordon.passed'] || f['act1.beat.call'] },
      { text: 'Get through the Green Line tunnels: set the switchyard levers right.', done: (f) => f['act1.switchyard.solved'] },
      { text: 'Reach the dead platform.', done: (f) => f['act1.boss.defeated'] || f['act1.complete'] },
    ],
    reward: { xp: 60 },
  },
  {
    id: 'side.soup', why: "He sits by the stairwell all night. If anyone heard the door at three a.m., it was him.", title: 'Soup on the landing', giver: 'npc.409', act: 1,
    ask: 'q.soup.asked', start: (f) => f['q.soup.asked'],
    give: { item: 'item.mate_flask', flag: 'q.soup.given', refuse: '"Still cold."' },
    pitch: 'Four-oh-nine has been sitting on the stairwell landing with a bowl of soup going cold for an hour. "Mine\'s cold. Everything up here goes cold. You got anything hot?"',
    stages: [
      { text: 'Bring Four-oh-nine something hot (a mate thermos from the fab or the mate station).', done: (f) => f['q.soup.given'] },
    ],
    reward: { money: 15, xp: 25, line: 'He wraps both hands around it and doesn\'t drink it for a while. "My wife used to do this." Then he tells you the stairwell door has been propped open at three a.m. twice this week, and he didn\'t prop it.' },
  },
  {
    id: 'side.van', why: "An abatement van with a sniffer mast, parked outside your building tonight. It might be looking for the same thing you are.", title: 'What the van wants', giver: 'npc.dez', act: 1,
    ask: 'q.van.asked', start: (f) => f['q.van.asked'],
    inspect: { obj: 'obj.van', flag: 'q.van.seen', text: 'The mast is turning slowly, like it\'s sniffing. Dez will want to hear about this.' },
    report: { needs: 'q.van.seen', flag: 'q.van.reported' },
    pitch: 'Dez, half asleep against the mailboxes: "White van out front since four. No plates. Mast on the roof. Go look at it for me, I\'m not getting up."',
    stages: [
      { text: 'Look at the abatement van in College Park.', done: (f) => f['q.van.seen'] },
      { text: 'Tell Dez what you saw.', done: (f) => f['q.van.reported'] },
    ],
    reward: { money: 10, xp: 30, line: '"Helium sniffer. That\'s what the mast is." He finally sits up. "Somebody\'s looking for the same thing you are. And they get paid more."' },
  },
  // ---- Side quests around ASTER and College Park (level design / cast: docs/design/04-cast.md) ----
  {
    id: 'side.signin', why: "Whoever came in at three a.m. might be in that book.", title: 'Forty names', giver: 'npc.doorman', act: 1,
    ask: 'q.signin.asked', start: (f) => f['q.signin.asked'],
    inspect: { obj: 'obj.security_desk', flag: 'q.signin.read', text: 'You read down the column. Forty entries, forty different hands, one name: FENWICK. He has been signing himself in.' },
    report: { needs: 'q.signin.read', flag: 'q.signin.told' },
    pitch: '"The sign-in book. The last forty entries are one name. I would like a resident to read it, because I am not certain I am permitted to notice."',
    stages: [
      { text: 'Read the sign-in book at the security desk.', done: (f) => f['q.signin.read'] },
      { text: 'Tell Fenwick whose name it is.', done: (f) => f['q.signin.told'] },
    ],
    reward: { money: 10, xp: 30, line: '"I see." He is still for a while. "I do not have a room here. I have a desk. I believe I wanted to see how it looked."' },
  },
  {
    id: 'side.yardline', why: "You have to get through the switchyard anyway, and nobody alive knows it better than Pell.", title: 'A line that isn\'t his', giver: 'npc.pell', act: 1,
    ask: 'q.yard.asked', start: (f) => f['q.yard.asked'],
    inspect: { obj: 'obj.yard_map', flag: 'q.yard.seen', text: 'One line has been added in a different pen. It runs from the yard to a place the tunnel does not go.' },
    report: { needs: 'q.yard.seen', flag: 'q.yard.told' },
    pitch: '"There\'s a diagram of the yard down there with my corrections on it. Forty-one years of them. If you\'re going anyway, tell me whether anybody has added a line that isn\'t mine."',
    stages: [
      { text: 'Find the yard diagram in the Green Line switchyard.', done: (f) => f['q.yard.seen'] },
      { text: 'Tell Arthur Pell about the extra line.', done: (f) => f['q.yard.told'] },
    ],
    reward: { money: 20, xp: 40, line: '"That isn\'t mine." He does the sum twice on the slide rule. "That\'s where track four went. They told us it was filled in."' },
  },
  {
    id: 'side.chips', why: "Mrs. Okafor has watched ASTER's doors longer than anyone. Worth being on her good side.", title: 'Not dinner', giver: 'npc.okafor', act: 1,
    ask: 'q.chips.asked', start: (f) => f['q.chips.asked'],
    give: { item: 'item.crab_chips', flag: 'q.chips.given', refuse: '"That is dinner. I said not dinner."' },
    pitch: '"Three generations upstairs arguing about dinner. Bring me something that is not dinner. The corner store has them. Red bag."',
    stages: [
      { text: 'Bring Mrs. Okafor a bag of crab chips from the corner store.', done: (f) => f['q.chips.given'] },
    ],
    reward: { money: 12, xp: 20, line: 'She opens the bag, takes one, and hands you the rest. "My husband hated these. Forty years. I am only now finding out I like them."' },
  },
  {
    id: 'side.glasses', why: "Mina notices who stops showing up. She might notice other things, too.", title: 'The man on the bench', giver: 'npc.mina', act: 1,
    ask: 'q.glasses.asked', start: (f) => f['q.glasses.asked'],
    inspect: { obj: 'obj.plaza_bench_b', flag: 'q.glasses.seen', text: 'The transit pass has a name and a door on it: PELL, A. ASTER 305.' },
    report: { needs: 'q.glasses.seen', flag: 'q.glasses.told' },
    pitch: '"A man sat on that bench every night for a year and listened. He hasn\'t been in a week, and he left his glasses. Look for me. I can\'t leave the pitch."',
    stages: [
      { text: 'Look at what was left on the plaza bench.', done: (f) => f['q.glasses.seen'] },
      { text: 'Tell Mina who he is.', done: (f) => f['q.glasses.told'] },
    ],
    reward: { money: 8, xp: 25, line: '"The engineer. Huh." She plays four bars of something slow. "Tell him I do requests. Tell him I\'d do that one."' },
  },
  {
    id: 'side.board', why: "Big Ray keeps the scooters running, and you'll want one that does.", title: 'The red one', giver: 'npc.ray', act: 1,
    ask: 'q.board.asked', start: (f) => f['q.board.asked'],
    give: { item: 'item.mat_circuit', flag: 'q.board.given', refuse: '"That\'s not a board. I\'ll know a board."' },
    pitch: '"Charger board\'s cooked on the red one. Bring me a circuit board and I\'ll make it worth the walk."',
    stages: [
      { text: 'Bring Big Ray a circuit board.', done: (f) => f['q.board.given'] },
    ],
    reward: { money: 30, xp: 25, line: 'He turns it over under the lamp. "That\'s a 245 lab board. I can tell by the solder. Somebody was angry."' },
  },
];

QUESTS.push({
  id: 'side.lantern', why: "Ozzie has fished this lake for fifty-two years. Whatever goes into it, he's seen.", title: 'Something that glows', giver: 'npc.ozzie', act: 1,
  ask: 'q.lantern.asked', start: (f) => f['q.lantern.asked'],
  give: { item: 'item.fish_lantern', flag: 'q.lantern.given', refuse: '"Not that. The one with the light in it. You\'ll know."' },
  pitch: 'Ozzie taps the notebook without looking up. "Fifty-two years on this pier. Every fish in here, I\'ve had. Except one. Bass with a light in it. My wife saw one in \'61. I never have." He finally looks at you. "You got young eyes. Fish the lake."',
  stages: [{ text: 'Catch a lantern bass in Lake Artemesia and bring it to Ozzie on the south pier.', done: (f) => f['q.lantern.given'] }],
  reward: { money: 25, xp: 40, item: 'item.ozzie_lure', line: 'He holds it up to his face for a long time. The light moves under the scales. "Huh," he says. He writes in the notebook, one tally mark, very carefully. Then he lets it go off the end of the pier, and hands you a lure out of his hat.' },
});

// First weapon (Trevor: make it clear where it comes from). Starts after the cold open; done once anyone is armed.
QUESTS.push({
  id: 'side.armup', title: 'Something to swing', act: 1,
  why: "Coderot is loose in the building tonight, and none of you is holding so much as a wrench. The toolwall over the workbench in 631 has three pry bars.",
  start: (f) => f['act1.coldopen.done'] && !f['q.armed'],
  stages: [{ text: 'Take a pry bar from the toolwall in 631 (over the workbench).', done: (f) => f['q.armed'] }],
  reward: { line: 'Hotbar: 1-9 or the mouse wheel picks what\'s in your hand. Left click swings it.' },
});

QUESTS.push({
  id: 'side.bot', title: 'Get it running', act: 1, owner: 'trevor',   // personal: only Trevor's journal, popups and reward
  why: "Trevor builds combat robots. The wedge bot in his room just needs parts, and a robot that rams coderot on its own is worth a lot tonight.",
  start: (f) => f['q.bot.looked'],
  stages: [
    { text: 'Print a drive module, a spinner bar and a control board at the fab.', done: (f, save) => ['item.bot_drive', 'item.bot_weapon', 'item.bot_brain'].every((id) => Object.values(save.party).some((c) => (c.inventory || []).some((x) => x && x.id === id))) || f['q.bot.built'] },
    { text: 'Install the parts on the combat robot in Trevor\'s room.', done: (f) => f['q.bot.built'] },
  ],
  reward: { xp: 40, line: 'The bot twitches, spins its bar up to a whine, and rolls off the desk on its own. It parks itself at your heel and waits.' },
});

// A quest with `owner` is personal: only that roommate sees it and gets its reward. Others are shared.
// `humans` (optional): roommates played by a person. An AI roommate's personal quest shows for everyone.
export const questVisible = (q, who, humans = null) => !q.owner || q.owner === who || (humans && !humans.has(q.owner));

export function questState(save) {
  const s = (save.world.quests ??= {});
  for (const q of QUESTS) s[q.id] ??= { stage: 0, started: !!q.main, done: false };
  return s;
}
