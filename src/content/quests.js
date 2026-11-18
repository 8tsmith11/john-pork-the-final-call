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
    id: 'main.balloon', title: 'The balloon', main: true, act: 1,
    stages: [
      { text: 'Check Manuel\'s closet.', done: (f) => f['act1.balloon.noticedGone'] },
      { text: 'Look at the front door.', done: (f) => f['act1.clue.lockForced'] },
      { text: 'Ask around ASTER and the College Park plaza. Someone saw something.', done: (f) => Object.keys(f).some((k) => k.startsWith('act1.halvard') || k.startsWith('act1.leadC') || k.startsWith('act1.leadA')) },
      { text: 'Follow the trail: Halvard under the metro stairs, the lobby camera, the helium.', done: (f) => f['act1.beat.call'] },
      { text: 'Get through the Green Line tunnels. The switchyard is set wrong.', done: (f) => f['act1.switchyard.solved'] },
      { text: 'Reach the dead platform.', done: (f) => f['act1.boss.defeated'] || f['act1.complete'] },
    ],
    reward: { xp: 60 },
  },
  {
    id: 'side.soup', title: 'Soup on the landing', giver: 'npc.409', act: 1,
    ask: 'q.soup.asked', start: (f) => f['q.soup.asked'],
    give: { item: 'item.mate_flask', flag: 'q.soup.given', refuse: '"Still cold."' },
    pitch: 'Four-oh-nine has been sitting on the stairwell landing with a bowl of soup going cold for an hour. "Mine\'s cold. Everything up here goes cold. You got anything hot?"',
    stages: [
      { text: 'Bring Four-oh-nine something hot (a mate thermos from the fab or the mate station).', done: (f) => f['q.soup.given'] },
    ],
    reward: { scrap: 6, xp: 25, line: 'He wraps both hands around it and doesn\'t drink it for a while. "My wife used to do this." Then he tells you the stairwell door has been propped open at three a.m. twice this week, and he didn\'t prop it.' },
  },
  {
    id: 'side.van', title: 'What the van wants', giver: 'npc.dez', act: 1,
    ask: 'q.van.asked', start: (f) => f['q.van.asked'],
    inspect: { obj: 'obj.van', flag: 'q.van.seen', text: 'The mast is turning slowly, like it\'s sniffing. Dez will want to hear about this.' },
    report: { needs: 'q.van.seen', flag: 'q.van.reported' },
    pitch: 'Dez, half asleep against the mailboxes: "White van out front since four. No plates. Mast on the roof. Go look at it for me, I\'m not getting up."',
    stages: [
      { text: 'Look at the abatement van in College Park.', done: (f) => f['q.van.seen'] },
      { text: 'Tell Dez what you saw.', done: (f) => f['q.van.reported'] },
    ],
    reward: { scrap: 4, xp: 30, line: '"Helium sniffer. That\'s what the mast is." He finally sits up. "Somebody\'s looking for the same thing you are. And they get paid more."' },
  },
];

export function questState(save) {
  const s = (save.world.quests ??= {});
  for (const q of QUESTS) s[q.id] ??= { stage: 0, started: !!q.main, done: false };
  return s;
}
