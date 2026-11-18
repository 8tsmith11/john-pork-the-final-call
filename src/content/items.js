// Items, fab recipes, and skills (stable ids; saves reference these).
// Analog gear resists rot (bible §4). Stats feed the sim through playerMods().

export const ITEMS = {
  'item.wooden_bat':   { name: 'Wooden bat', slot: 'weapon', analog: true, mods: { melee: 6 }, text: 'Ash wood. The rot slides off it.' },
  'item.fab_launcher': { name: 'Fab launcher', slot: 'weapon', mods: { shot: 4, shotCd: -0.12 }, text: 'Printed at 3 a.m. Fires sintered pellets.' },
  'item.mesh_vest':    { name: 'Printed mesh vest', slot: 'armor', mods: { armor: 0.2 }, text: 'Hex lattice. Takes a fifth of the hurt.' },
  'item.sniffer':      { name: 'Helium sniffer', slot: 'gadget', mods: {}, text: 'Follows the lightest thing in the world.' },
  'item.mate_flask':   { name: 'Mate thermos', slot: 'consumable', heal: 45, text: 'Manuel would want you to have it. He would also want it back.' },
};

export const RECIPES = [
  { item: 'item.wooden_bat', scrap: 6 },
  { item: 'item.fab_launcher', scrap: 10 },
  { item: 'item.mesh_vest', scrap: 12 },
  { item: 'item.sniffer', scrap: 4 },
  { item: 'item.mate_flask', scrap: 3 },
];

export const SKILLS = {
  michael: [
    { id: 'skill.michael.signal', name: 'Signal', text: '+3 shot damage per rank', max: 3, mods: { shot: 3 } },
    { id: 'skill.michael.luck', name: 'Lover\'s Luck', text: '+0.15 s hurt invulnerability per rank', max: 3, mods: { iframes: 0.15 } },
    { id: 'skill.michael.hands', name: 'Quick Hands', text: 'Fire 10% faster per rank', max: 3, mods: { shotCd: -0.05 } },
  ],
  trevor: [
    { id: 'skill.trevor.stack', name: 'Stack', text: '+15 max HP per rank (supplements)', max: 3, mods: { maxHp: 15 } },
    { id: 'skill.trevor.lungs', name: 'Iron Lungs', text: 'Dodge recovers 12% faster per rank', max: 3, mods: { dodgeCd: -0.07 } },
    { id: 'skill.trevor.riff', name: 'Riff', text: '+3 melee damage per rank', max: 3, mods: { melee: 3 } },
  ],
  manuel: [
    { id: 'skill.manuel.break', name: 'Mate Break', text: 'Revive teammates 25% faster per rank', max: 3, mods: { revive: 0.25 } },
    { id: 'skill.manuel.eye', name: 'Sculptor\'s Eye', text: '+4 melee damage per rank', max: 3, mods: { melee: 4 } },
    { id: 'skill.manuel.gon', name: 'gonman', text: 'Toughen up: -8% damage taken per rank', max: 3, mods: { armor: 0.08 } },
  ],
};

/** Sum gear + skill modifiers for one character in the save. */
export function playerMods(char, charId) {
  const m = { melee: 0, shot: 0, shotCd: 0, armor: 0, maxHp: 0, iframes: 0, dodgeCd: 0, revive: 0 };
  const add = (mods, k = 1) => { for (const [key, v] of Object.entries(mods || {})) m[key] = (m[key] ?? 0) + v * k; };
  for (const id of Object.values(char.equipped || {})) if (id) add(ITEMS[id]?.mods);
  for (const s of SKILLS[charId] || []) add(s.mods, char.skills?.[s.id] ?? 0);
  m.armor = Math.min(0.6, m.armor);
  return m;
}
