// Field guide: people and powers (Trevor: "put more things in the guide, like John Pork… info updates
// as the story goes on… give an image and description"). Each entry shows once its first stage's
// condition holds, and every later stage whose condition holds adds a line. Text only says what the
// player has already seen or heard on screen; story owners (gonman, BagelMeister) own the wording.
// cond: a flag name (truthy), or (flags) => bool. art: [texture, frame] or a plain texture key.
const declines = (f) => Number(f['act1.call.declines'] || 0);

export const GUIDE_PEOPLE = [
  {
    id: 'john_pork', name: 'John Pork', art: 'john-pork-call', fallbackArt: ['principals', 'pork_0'],
    stages: [
      // Known from the start: the roommates print his figurines and fly his flag (real-life lore).
      { cond: () => true, text: 'Everybody knows the name. Half the internet\'s legends, a face on a flag, and the reason there are pig-faced busts all over 631. Nobody you know has ever met him.' },
      { cond: 'act1.beat.call', text: 'Tonight his name took over every screen at once: JOHN PORK, calling.' },
      { cond: 'act1.call.answered', text: 'You answered. He knew Manuel\'s name, and he knew about the balloon.' },
      { cond: (f) => declines(f) >= 1 && !f['act1.call.answered'], text: 'You let it go. He left voicemails anyway, each one starting "Hey. It\'s John."' },
      { cond: 'act1.complete', text: 'At the dead platform he came in person, in a body that limps. He let the balloon go up into the sky, and said he\'d need it back before the end.' },
    ],
  },
  {
    id: 'continuity', name: 'Continuity', art: ['props', 'obj.lobby_monitor'],
    stages: [
      { cond: 'act1.aster.entered', text: 'The authority that runs things. Its drones scan you by name; its notices talk about tolerance and containment.' },
      { cond: 'act1.cordon.passed', text: 'Its abatement crews have the storm grate cordoned off tonight, and a review that could wall College Park in.' },
    ],
  },
  {
    id: 'halvard', name: 'Halvard', art: ['props', 'npc.halvard'],
    stages: [
      { cond: 'act1.halvard.met', text: 'Sells things under the metro stairs. Knows what everything is worth tonight, helium included.' },
      { cond: 'act1.halvard.sellerDescribed', text: 'Someone with a 631 fob came to his slot asking what helium was worth. "One of you, from 631. Or wearing your face."' },
    ],
  },
  {
    id: 'pruitt', name: 'Pruitt', art: ['props', 'npc.pruitt'],
    stages: [
      { cond: 'act1.aster.pruittWarned', text: 'Abatement, doing readings in ASTER. Says the code rot is coming up from under the station, and that he wrote the report that says a week.' },
    ],
  },
  {
    id: 'tobin', name: 'Tobin', art: ['props', 'npc.tobin'],
    stages: [
      { cond: (f) => f['met.npc.abatement_tech'] || f['act1.cordon.passed'], text: 'Abatement, nights. Handed a coat and a jar and told to keep everyone off the storm grate.' },
      { cond: 'act1.cordon.passed', text: 'You got past him. He\'ll remember how.' },
    ],
  },
  {
    id: 'warden', name: 'The Rot Warden', art: ['warden', 'warden_0'],
    stages: [
      { cond: (f) => f['act1.boss.defeated'] && f['act1.boss.kind'] !== 'sahur', text: 'What waited at the dead platform: the whole outbreak, standing up. You put it down.' },
    ],
  },
  {
    id: 'sahur', name: 'Tung Tung Tung Sahur', art: ['principals', 'sahur_0'],
    stages: [
      { cond: (f) => f['act1.boss.sahur'] || f['act1.sahur.seen'], text: 'Something that drums at three in the morning, under the city. It came when you wouldn\'t answer.' },
    ],
  },
];

export function guideText(entry, flags) {
  const ok = (c) => (typeof c === 'function' ? !!c(flags) : !!flags[c]);
  if (!entry.stages.length || !ok(entry.stages[0].cond)) return null;
  return entry.stages.filter((st) => ok(st.cond)).map((st) => st.text).join(' ');
}
