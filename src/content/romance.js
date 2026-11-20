// Romance (D-014, Michael's request). Each roommate has someone. Once she's with the party she walks
// beside her roommate and buffs every player near her. Michael's girlfriend, Manuelita, gives the
// strongest buffs and needs no courting: she joins when the story reunites them (the story sets
// REUNITED_FLAG). Trevor and Manuel court theirs over four dates: flowers, a fight she gets to
// watch, chocolates, then a song played to her on a guitar. The last scene of each courtship plays
// on every roommate's screen (src/game/sharedEvent.js).
//
// Flags live under act1.romance.* so co-op clients can send them to the host (it only accepts act*
// and dlg.* keys). Dialogue is ROT13-sealed in src/content/dialogue/act1/romance_*.js
// (tools/romance/seal.py encodes and decodes it).
import { QUESTS } from './quests.js';

const rot13 = (s) => s.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13) % 26) + (c <= 'Z' ? 65 : 97)));

export const REUNITED_FLAG = 'act1.romance.manuelita.reunited';

// Buffs are playerMods keys (src/content/items.js) and apply to every player within `radius` px.
export const PARTNERS = {
  manuelita: {
    name: 'Manuelita', for: 'michael', art: 'npc.manuelita', scene: 'romance_manuelita', courted: false, radius: 80,
    buff: { melee: 8, shot: 6, armor: 0.15, speed: 0.12, staRegen: 0.5, crit: 0.08 },
    buffText: '+damage, +armor, +speed, +stamina, +crit',
  },
  brooke: {
    name: 'Brooke', for: 'trevor', art: 'npc.brooke', scene: 'romance_trevor', courted: true, radius: 64,
    buff: { melee: 4, shot: 3, armor: 0.06, speed: 0.05 },
    buffText: '+damage, +armor, +speed',
    place: { map: 'metro_plaza', x: 51, y: 18 },
  },
  ines: {
    name: 'Inés', for: 'manuel', art: 'npc.ines', scene: 'romance_manuel', courted: true, radius: 64,
    buff: { melee: 3, shot: 4, armor: 0.05, crit: 0.05 },
    buffText: '+damage, +armor, +crit',
    place: { map: 'metro_plaza', x: 28, y: 16 },
    // Her two sealed looks: a sealed scene sets act1.romance.ines.form; the values are ROT13 here too.
    forms: { [rot13('shyy')]: 'npc.ines_a', [rot13('cbccrq')]: 'npc.ines_b' }, formFx: rot13('cbccrq'),
  },
};

/** Courting stages, by flag value act1.romance.<id>.stage. */
export const STAGE = { MEET: 0, FLOWERS: 1, FIGHT: 2, CHOCOLATES: 3, SONG: 4, TOGETHER: 5 };
export const FIGHT_KILLS = 6;        // date two: coderot things she watches you clear
export const SONG_SECONDS = 6;       // date four: play to her, close by, this long
export const SONG_RANGE = 48;

export const flagOf = (id, key) => `act1.romance.${id}.${key}`;
export const stageOf = (flags, id) => Number(flags[flagOf(id, 'stage')] ?? 0) || 0;
// A sealed scene can set act1.romance.<id>.left: she is then neither at her spot nor with the party.
export const ended = (flags, id) => !!flags[flagOf(id, 'left')];
export const together = (flags, id) => !ended(flags, id)
  && (PARTNERS[id].courted ? stageOf(flags, id) >= STAGE.TOGETHER : !!flags[REUNITED_FLAG]);
export const formOf = (flags, id) => flags[flagOf(id, 'form')] ?? null;

/** Name, sprite and buff for a partner right now. */
export function partnerView(flags, id) {
  const P = PARTNERS[id], form = formOf(flags, id);
  return { name: P.name, art: P.forms?.[form] ?? P.art, buff: P.buff, buffText: P.buffText, radius: P.radius };
}

// Courtships show in the quest journal (titles stay spoiler-free).
const courtQuest = (id, P, who) => ({
  id: `romance.${id}`, title: `${P.name}`, act: 1,
  start: (f) => stageOf(f, id) >= STAGE.FLOWERS,
  stages: [
    { text: `${who}: bring ${P.name} flowers (the corner store sells them).`, done: (f) => stageOf(f, id) >= STAGE.FIGHT },
    { text: `${who}: clear out ${FIGHT_KILLS} coderot things, then go back to ${P.name}.`, done: (f) => stageOf(f, id) >= STAGE.CHOCOLATES },
    { text: `${who}: bring ${P.name} chocolates.`, done: (f) => stageOf(f, id) >= STAGE.SONG },
    { text: `${who}: play ${P.name} a song on a guitar, close by.`, done: (f) => stageOf(f, id) >= STAGE.TOGETHER },
  ],
  reward: { xp: 40 },
});
for (const [id, P] of Object.entries(PARTNERS)) {
  if (P.courted && !QUESTS.some((q) => q.id === `romance.${id}`)) QUESTS.push(courtQuest(id, P, P.for[0].toUpperCase() + P.for.slice(1)));
}
