// Items, fab recipes, and skills (stable ids; saves reference these).
// Analog gear resists rot (bible §4). Stats feed the sim through playerMods().
import { FISH } from './fish.js';
import { SKILL_TREE } from './skills.js';

export const ITEMS = {
  'item.wooden_bat':   { name: 'Wooden bat', slot: 'weapon', analog: true, mods: { melee: 6 }, text: 'Ash wood. Coderot slides off it.' },
  'item.fab_launcher': { name: 'Fab launcher', slot: 'ranged', mods: { gun: 1, shot: 4, shotCd: -0.12 }, text: 'Printed at 3 a.m. Fires sintered pellets.' },
  'item.mesh_vest':    { name: 'Printed mesh vest', slot: 'armor', mods: { armor: 0.2 }, text: 'Hex lattice. Takes a fifth of the hurt.' },
  'item.sniffer':      { name: 'Helium sniffer', slot: 'gadget', mods: {}, text: 'Follows the lightest thing in the world.' },
  'item.charm_1901':   { name: 'Rollover charm', slot: 'charm', analog: true, mods: { armor: 0.12 }, text: 'A brass clock hand on a cord, stopped at 3:14. Takes the edge off whatever hits you.' },
  'item.pork_pin':     { name: 'Porcelain Pork pin', slot: 'charm', mods: { melee: 3, shot: 3 }, text: 'Three busts looked at the flag at once and this was on the floor afterwards. Warm to the touch.' },
  'item.mate_flask':   { name: 'Mate thermos', slot: 'consumable', heal: 45, text: 'Manuel would want you to have it. He would also want it back.' },
};

Object.assign(ITEMS, FISH);   // catches are items too

// Materials (human request: "different materials"). They drop from coderot things, vending
// machines, and the world; the fab prints from them. Money is the currency; these are not.
export const MATERIALS = {
  'item.mat_scrap':   { name: 'Scrap metal', slot: 'material', text: 'Bent brackets, bolts, a hinge. The fab eats it.' },
  'item.mat_wire':    { name: 'Copper wire', slot: 'material', text: 'Stripped out of something that used to talk.' },
  'item.mat_plastic': { name: 'Plastic pellets', slot: 'material', text: 'Ground-up packaging. Feedstock for the printer.' },
  'item.mat_cloth':   { name: 'Cloth', slot: 'material', text: 'Ripstop, denim, a T-shirt from a 5K nobody remembers running.' },
  'item.mat_circuit': { name: 'Circuit board', slot: 'material', text: 'Green, scorched at one corner. Some of the chips still answer.' },
  'item.mat_cell':    { name: 'Battery cell', slot: 'material', text: 'A fat lithium cylinder. Keep it away from the shrimp.' },
  'item.mat_gel':     { name: 'Coderot gel', slot: 'material', text: 'What\'s left when a coderot thing stops. It shimmers a frame behind itself.' },
  'item.mat_glass':   { name: 'Glass shard', slot: 'material', text: 'Phone screen, mostly. Your face looks back, slightly late.' },
};
Object.assign(ITEMS, MATERIALS);

// Bought, not printed.
Object.assign(ITEMS, {
  'item.scooter':       { name: 'Scooter', slot: 'key', text: 'Used, cracked deck. [Q] to ride outdoors. Rails are faster than they look.' },
  'item.scooter_hicap': { name: 'Hi-cap battery', slot: 'key', text: 'Doubles your scooter\'s range. Bolts under the deck.' },
  'item.energy_bar':    { name: 'Halfsmoke bar', slot: 'consumable', heal: 20, text: 'Protein, mustard, regret. Maryland in a wrapper.' },
  'item.crab_chips':    { name: 'Old Bay crab chips', slot: 'consumable', heal: 30, text: 'The seasoning outlived the crabs.' },
});

// The fab prints from materials (cost = { materialId: qty }).
export const RECIPES = [
  { item: 'item.mate_flask',   cost: { 'item.mat_plastic': 2, 'item.mat_scrap': 1 } },
  { item: 'item.wooden_bat',   cost: { 'item.mat_scrap': 3, 'item.mat_cloth': 1 } },
  { item: 'item.sniffer',      cost: { 'item.mat_circuit': 1, 'item.mat_wire': 2 } },
  { item: 'item.mesh_vest',    cost: { 'item.mat_plastic': 4, 'item.mat_cloth': 3, 'item.mat_wire': 1 } },
  { item: 'item.fab_launcher', cost: { 'item.mat_scrap': 4, 'item.mat_circuit': 2, 'item.mat_cell': 1, 'item.mat_gel': 2 } },
];

// What things drop. Money is shared by the party; materials go to whoever got the kill.
export const DROPS = {
  default: { money: [2, 5], mats: [['item.mat_gel', 40], ['item.mat_scrap', 25], ['item.mat_wire', 15], ['item.mat_plastic', 10], ['item.mat_glass', 10]] },
  boss:    { money: [40, 60], mats: [['item.mat_gel', 100], ['item.mat_circuit', 100], ['item.mat_cell', 100]] },
};

// Shops: what's on the shelf and for how much ($).
export const SHOPS = {
  scooters: { title: 'DELROY\'S WHEELS', lines: ['Used scooters, fair prices, no questions.', 'Batteries charged while you wait. Mostly.'],
    stock: [
      { item: 'item.scooter', price: 90, once: true },
      { item: 'item.scooter_hicap', price: 140, once: true, needs: 'item.scooter' },
      { item: 'item.mat_cell', price: 12 },
      { item: 'item.mat_wire', price: 4 },
      { item: 'item.mat_circuit', price: 15 },
    ] },
  corner: { title: 'CORNER STORE', lines: ['Open twenty-four hours. The register is older than you.'],
    stock: [
      { item: 'item.energy_bar', price: 6 },
      { item: 'item.crab_chips', price: 10 },
      { item: 'item.mate_flask', price: 14 },
      { item: 'item.mat_plastic', price: 3 },
      { item: 'item.mat_cloth', price: 3 },
    ] },
};

// Skill trees live in ./skills.js (SKILL_TREE). SKILLS is kept as an alias of each tree's node list.
export const SKILLS = Object.fromEntries(Object.entries(SKILL_TREE).map(([k, t]) => [k, t.nodes]));

/** Sum gear + skill modifiers for one character in the save. */
export function playerMods(char, charId) {
  const m = { melee: 0, shot: 0, shotCd: 0, armor: 0, maxHp: 0, iframes: 0, dodgeCd: 0, revive: 0, gun: 0,
    speed: 0, sta: 0, staRegen: 0, dashHit: 0, crit: 0, lifesteal: 0, loot: 0, haggle: 0, skillCd: 0, abilityPower: 0, markDmg: 0, secondWind: 0, decoys: 0, reviveHeal: 0 };
  const add = (mods, k = 1) => { for (const [key, v] of Object.entries(mods || {})) m[key] = (m[key] ?? 0) + v * k; };
  for (const id of Object.values(char.equipped || {})) if (id) add(ITEMS[id]?.mods);
  for (const s of SKILLS[charId] || []) add(s.mods, char.skills?.[s.id] ?? 0);
  m.armor = Math.min(0.6, m.armor); m.skillCd = Math.min(0.6, m.skillCd); m.haggle = Math.min(0.4, m.haggle);
  return m;
}
