// Items, fab recipes, and skills (stable ids; saves reference these).
// Analog gear resists rot (bible §4). Stats feed the sim through playerMods().
import { FISH } from './fish.js';
import { SKILL_TREE } from './skills.js';

// Equipment slots (D-014, Michael). Armor points come from the four armor pieces; gear goes on top.
export const WEAPON_SLOTS = ['weapon', 'ranged', 'gadget', 'charm'];
export const ARMOR_SLOTS = ['helmet', 'chestplate', 'leggings', 'boots'];
export const GEAR_SLOTS = ['goggles', 'parka', 'gloves', 'socks', 'backpack'];
export const EQUIP_SLOTS = [...WEAPON_SLOTS, ...ARMOR_SLOTS, ...GEAR_SLOTS];
export const SLOT_NAMES = { weapon: 'Melee', ranged: 'Ranged', gadget: 'Gadget', charm: 'Charm', helmet: 'Helmet', chestplate: 'Chestplate',
  leggings: 'Leggings', boots: 'Boots', goggles: 'Goggles / hat', parka: 'Rain parka', gloves: 'Gloves', socks: 'Socks', backpack: 'Backpack' };

export const ITEMS = {
  'item.wooden_bat':   { name: 'Wooden bat', slot: 'weapon', analog: true, mods: { melee: 6 }, text: 'Ash wood. Coderot slides off it.' },
  'item.fab_launcher': { name: 'Fab launcher', slot: 'ranged', mods: { gun: 1, shot: 4, shotCd: -0.12 }, text: 'Printed at 3 a.m. Fires sintered pellets.' },
  'item.mesh_vest':    { name: 'Printed mesh vest', slot: 'chestplate', mods: { armor: 0.2 }, text: 'Hex lattice. Takes a fifth of the hurt.' },
  'item.sniffer':      { name: 'Helium sniffer', slot: 'gadget', mods: {}, text: 'Follows the lightest thing in the world.' },
  'item.charm_1901':   { name: 'Rollover charm', slot: 'charm', analog: true, mods: { armor: 0.12 }, text: 'A brass clock hand on a cord, stopped at 3:14. Takes the edge off whatever hits you.' },
  'item.pork_pin':     { name: 'Porcelain Pork pin', slot: 'charm', mods: { melee: 3, shot: 3 }, text: 'Three busts looked at the flag at once and this was on the floor afterwards. Warm to the touch.' },
  // Melee weapons carry a `swing` (range px, arc as a fraction of a half-turn, cooldown s, damage, knockback);
  // ranged ones a `gun` profile (cooldown, damage, speed, life, pellets, spread). Missing fields use the defaults.
  'item.pipe_wrench':  { name: 'Pipe wrench', slot: 'weapon', analog: true, swing: { range: 18, arc: 0.5, cooldown: 0.62, damage: 30, knockback: 230 }, text: 'Two feet of cast iron. Slow. Whatever it hits stays hit.' },
  'item.box_cutter':   { name: 'Box cutter', slot: 'weapon', swing: { range: 14, arc: 0.45, cooldown: 0.18, damage: 8, knockback: 40 }, mods: { crit: 0.15 }, text: 'Short reach, very fast. Get close and stay close.' },
  'item.rebar':        { name: 'Rebar spear', slot: 'weapon', analog: true, swing: { range: 32, arc: 0.28, cooldown: 0.48, damage: 19, knockback: 90 }, text: 'A length of rebar with one end ground to a point. Long, narrow. Hit them before they reach you.' },
  'item.busted_guitar':{ name: 'Busted Telecaster', slot: 'weapon', analog: true, swing: { range: 22, arc: 0.9, cooldown: 0.5, damage: 12, knockback: 260 }, mods: { abilityPower: 0.1 }, text: 'Two strings left. A wide, loud swing that throws everything back. Trevor winces every time.' },
  'item.nail_gun':     { name: 'Nail gun', slot: 'ranged', gun: { cooldown: 0.16, damage: 4, speed: 260, life: 0.6 }, mods: { gun: 1 }, text: 'Fast, weak, a lot of nails. Hold the trigger.' },
  'item.scattergun':   { name: 'Fab scattergun', slot: 'ranged', gun: { cooldown: 0.85, damage: 6, speed: 200, life: 0.38, pellets: 5, spread: 0.45 }, mods: { gun: 1 }, text: 'Five pellets in a fan, short range. Printed from coderot gel, which may be why it hums.' },
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
  'item.lake_bust':     { name: 'Little white bust', slot: 'charm', mods: { abilityPower: 0.15, markDmg: 0.1 }, text: 'John Pork, the size of a fist, carved from something white that is not stone. From the island. It is always slightly warmer than your hand.' },
  'item.ozzie_lure':    { name: 'Ozzie\'s lure', slot: 'charm', analog: true, mods: { loot: 0.15, crit: 0.05 }, text: 'Hand-tied, red and white, forty years old. "It doesn\'t catch more fish. It catches better ones."' },
  'item.energy_bar':    { name: 'Halfsmoke bar', slot: 'consumable', heal: 20, text: 'Protein, mustard, regret. Maryland in a wrapper.' },
  // Supplement (Manuel's idea): a little heal, full stamina, and dodges cost nothing for 45 seconds. Text only (D-015).
  'item.blue_pill':     { name: 'Blue pill', slot: 'consumable', heal: 5, pill: 45, text: 'One diamond-shaped blue tablet in a blister marked FOR STAMINA. The corner store keeps them behind the crab chips and does not make eye contact.' },
  'item.crab_chips':    { name: 'Old Bay crab chips', slot: 'consumable', heal: 30, text: 'The seasoning outlived the crabs.' },
});

// Instruments and gifts (D-014, Michael). Use an instrument from the hotbar to play it; how it
// sounds depends on who plays (src/audio/instruments.js). Gifts are for courting (src/content/romance.js).
Object.assign(ITEMS, {
  'item.guitar_electric': { name: 'Electric guitar', slot: 'instrument', instrument: 'electric', text: 'A sunburst solid-body with a coiled cable and a battery amp the size of a lunchbox. Use it to play. It sounds like whoever is holding it.' },
  'item.guitar_acoustic': { name: 'Acoustic guitar', slot: 'instrument', instrument: 'acoustic', analog: true, text: 'Spruce top, a crack under the bridge that someone glued with care. Use it to play. It sounds like whoever is holding it.' },
  'item.flowers':         { name: 'Flowers', slot: 'gift', stack: 8, text: 'Grocery-store tulips in cellophane. A little wilted, which is the most honest a flower gets in 2098.' },
  'item.chocolates':      { name: 'Chocolates', slot: 'gift', stack: 8, text: 'A heart-shaped box. Real cocoa, the label says, in a font that is trying very hard.' },
});

// Ordinary armor and gear for the new slots (anyone can wear these).
Object.assign(ITEMS, {
  'item.bike_helmet':   { name: 'Bike helmet', slot: 'helmet', mods: { armor: 0.05 }, text: 'Foam and a cracked shell. Someone wrote SLOW DOWN on the back in marker.' },
  'item.hardhat':       { name: 'Hard hat', slot: 'helmet', mods: { armor: 0.08, speed: -0.02 }, text: 'Yellow, dented, heavy. The sticker says the last inspection was in 2081.' },
  'item.work_pants':    { name: 'Double-knee work pants', slot: 'leggings', analog: true, mods: { armor: 0.06 }, text: 'Canvas so stiff it stands up on its own.' },
  'item.steel_toes':    { name: 'Steel-toe boots', slot: 'boots', analog: true, mods: { armor: 0.05, speed: -0.03, dashHit: 4 }, text: 'Heavy. Your dodge hits whatever it runs into.' },
  'item.sneakers':      { name: 'Running sneakers', slot: 'boots', mods: { speed: 0.07 }, text: 'Bright soles, no armor at all. You will get places.' },
  'item.welding_goggles': { name: 'Welding goggles', slot: 'goggles', mods: { crit: 0.05 }, text: 'Everything looks dimmer except the weak spots.' },
  'item.rain_parka':    { name: 'Yellow rain parka', slot: 'parka', mods: { armor: 0.03, staRegen: 0.1 }, text: 'Dry is a kind of stamina.' },
  'item.work_gloves':   { name: 'Work gloves', slot: 'gloves', analog: true, mods: { melee: 2 }, text: 'Leather palms, split at one thumb.' },
  'item.wool_socks':    { name: 'Wool socks', slot: 'socks', analog: true, mods: { sta: 10 }, text: 'Thick enough to change your shoe size.' },
  // Backpacks: futuristic, and every one costs you something.
  'item.pack_coolant':  { name: 'Coolant-loop pack', slot: 'backpack', mods: { staRegen: 0.4, speed: -0.06 }, text: 'A closed loop of chilled gel along your spine. You recover fast, and you carry a fridge. +stamina regen, -speed.' },
  'item.pack_drone':    { name: 'Drone cradle', slot: 'backpack', mods: { markDmg: 0.15, abilityPower: 0.1, armor: -0.05 }, text: 'A palm-sized drone rides in it and paints everything that moves. Its hum draws them to you. +marked damage, +ability power, -armor.' },
  'item.pack_capacitor': { name: 'Capacitor pack', slot: 'backpack', mods: { melee: 5, maxHp: -15 }, text: 'Dumps a charge into every swing. The battery bleeds into you a little. +melee, -max HP.' },
});

// UNIQUE ITEMS: four per roommate, and they only work for their owner (owner-only mods and equip).
// Each roommate has one special armor piece (special: true); the rest are gear. They are NOT obtainable
// before late Act 2: they're found through quests or level design (src: 'late-act2' etc. is a note
// for level design, not code). ?gear=debug hands them out for testing.
// Trevor's and Manuel's come from what their players ask for (board #150); the rest from backstory.
Object.assign(ITEMS, {
  'item.winged_boots':  { name: 'Winged boots', slot: 'boots', owner: 'michael', unique: true, special: true, src: 'late-act2', blink: true,
    mods: { armor: 0.1, speed: 0.6 }, text: 'Little white wings at the ankles that never stop twitching. Incredibly fast. [B] blinks you forward in a line of fire; hold [B] to fast travel.' },
  'item.cowboy_hat':    { name: 'Cowboy hat', slot: 'goggles', owner: 'michael', unique: true, src: 'act3',
    mods: { crit: 0.1, markDmg: 0.2, haggle: 0.15 }, text: 'Tennessee straw, sweat-stained, ironic until it isn\'t. Michael squints under it and hits what he pings. Shopkeepers trust it.' },
  'item.smoky_socks':   { name: 'Smoky Mountain socks', slot: 'socks', owner: 'michael', unique: true, src: 'act3',
    mods: { sta: 30, staRegen: 0.3, dodgeCd: -0.1 }, text: 'Hand-knit by somebody\'s grandmother back home. You could hike to Gatlinburg in these. More stamina, faster dodges.' },
  'item.signal_gloves': { name: 'Signal gloves', slot: 'gloves', owner: 'michael', unique: true, src: 'act3',
    mods: { abilityPower: 0.25, skillCd: 0.15 }, text: 'His lace runs out to his fingertips through these. Ping reaches further and comes back sooner.' },
});

// Upgrades at the master armorer: each level (max 5) scales an item's positive bonuses by +15%.
export const MAX_UPGRADE = 5;
export const upgradeCost = (level) => ({ money: 20 * (level + 1), mats: { 'item.mat_scrap': level + 1, ...(level ? { 'item.mat_circuit': level } : {}) } });
export function scaleMods(mods, level = 0) {
  if (!level) return mods;
  return Object.fromEntries(Object.entries(mods || {}).map(([k, v]) => [k, v > 0 ? +(v * (1 + 0.15 * level)).toFixed(3) : v]));
}
export const canWear = (def, charId) => !!def && (!def.owner || def.owner === charId);

// The fab prints from materials (cost = { materialId: qty }).
export const RECIPES = [
  { item: 'item.mate_flask',   cost: { 'item.mat_plastic': 2, 'item.mat_scrap': 1 } },
  { item: 'item.wooden_bat',   cost: { 'item.mat_scrap': 3, 'item.mat_cloth': 1 } },
  { item: 'item.sniffer',      cost: { 'item.mat_circuit': 1, 'item.mat_wire': 2 } },
  { item: 'item.mesh_vest',    cost: { 'item.mat_plastic': 4, 'item.mat_cloth': 3, 'item.mat_wire': 1 } },
  { item: 'item.rebar',        cost: { 'item.mat_scrap': 4 } },
  { item: 'item.nail_gun',     cost: { 'item.mat_scrap': 3, 'item.mat_circuit': 1, 'item.mat_cell': 1 } },
  { item: 'item.scattergun',   cost: { 'item.mat_scrap': 5, 'item.mat_plastic': 3, 'item.mat_cell': 1, 'item.mat_gel': 3 } },
  { item: 'item.bike_helmet',    cost: { 'item.mat_plastic': 3, 'item.mat_cloth': 1 } },
  { item: 'item.rain_parka',     cost: { 'item.mat_plastic': 3, 'item.mat_cloth': 2 } },
  { item: 'item.pack_coolant',   cost: { 'item.mat_gel': 3, 'item.mat_cell': 1, 'item.mat_cloth': 2 } },
  { item: 'item.pack_capacitor', cost: { 'item.mat_cell': 2, 'item.mat_circuit': 1, 'item.mat_wire': 2 } },
  { item: 'item.fab_launcher', cost: { 'item.mat_scrap': 4, 'item.mat_circuit': 2, 'item.mat_cell': 1, 'item.mat_gel': 2 } },
];

// What things drop. Money is shared by the party; materials go to whoever got the kill.
export const DROPS = {
  default: { money: [2, 5], mats: [['item.mat_gel', 40], ['item.mat_scrap', 25], ['item.mat_wire', 15], ['item.mat_plastic', 10], ['item.mat_glass', 10]] },
  boss:    { money: [40, 60], mats: [['item.mat_gel', 100], ['item.mat_circuit', 100], ['item.mat_cell', 100]] },
};

// Searchable containers (procedural loot, seeded per world: the same save always finds the same
// things, a new world finds different ones). Each entry: [itemId | 'money', weight, min, max].
// A container rolls `rolls` times and is picked clean after.
export const LOOT = {
  tools:   { rolls: 2, table: [['item.mat_scrap', 40, 1, 3], ['item.mat_wire', 30, 1, 2], ['item.box_cutter', 4, 1, 1], ['money', 26, 2, 6], ['item.work_pants', 4, 1, 1], ['item.work_gloves', 4, 1, 1]] },
  parts:   { rolls: 2, table: [['item.mat_circuit', 35, 1, 1], ['item.mat_wire', 35, 1, 3], ['item.mat_cell', 15, 1, 1], ['item.mat_glass', 15, 1, 2]] },
  prints:  { rolls: 1, table: [['item.mat_plastic', 80, 2, 4], ['item.mat_scrap', 20, 1, 1]] },
  trash:   { rolls: 2, table: [['item.mat_glass', 30, 1, 3], ['item.mat_circuit', 15, 1, 1], ['item.mat_plastic', 25, 1, 2], ['money', 25, 1, 5], ['item.relic_coin', 5, 1, 1]] },
  lost:    { rolls: 2, table: [['item.mat_cloth', 45, 1, 2], ['money', 35, 3, 9], ['item.crab_chips', 15, 1, 1], ['item.relic_figure', 5, 1, 1]] },
  tackle:  { rolls: 2, table: [['item.mat_wire', 35, 1, 2], ['item.energy_bar', 25, 1, 1], ['money', 25, 2, 8], ['item.ozzie_lure', 3, 1, 1], ['item.mat_scrap', 12, 1, 2]] },
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
      { item: 'item.sneakers', price: 30 },
      { item: 'item.pack_drone', price: 120, once: true },
    ] },
  pawn: { title: 'PAWN · BUY / SELL', lines: ['Everything here used to belong to somebody. Wick, behind the glass, does not look up.', '"Buying or selling. I don\'t do looking."'],   // the shop header shows every line at once and fits two rows; keep it short
    stock: [
      { item: 'item.pipe_wrench', price: 30, once: true },
      { item: 'item.busted_guitar', price: 45, once: true },
      { item: 'item.guitar_acoustic', price: 60 },
      { item: 'item.guitar_electric', price: 85 },
      { item: 'item.box_cutter', price: 12, once: true },
      { item: 'item.hardhat', price: 18 },
      { item: 'item.steel_toes', price: 22 },
      { item: 'item.welding_goggles', price: 16 },
      { item: 'item.mat_glass', price: 2 },
    ] },
  corner: { title: 'CORNER STORE', lines: ['Open twenty-four hours. The register is older than you.'],
    stock: [
      { item: 'item.energy_bar', price: 6 },
      { item: 'item.crab_chips', price: 10 },
      { item: 'item.blue_pill', price: 9 },
      { item: 'item.mate_flask', price: 14 },
      { item: 'item.flowers', price: 8 },
      { item: 'item.chocolates', price: 12 },
      { item: 'item.mat_plastic', price: 3 },
      { item: 'item.mat_cloth', price: 3 },
      { item: 'item.work_gloves', price: 9 },
      { item: 'item.wool_socks', price: 7 },
    ] },
};

// Skill trees live in ./skills.js (SKILL_TREE). SKILLS is kept as an alias of each tree's node list.
export const SKILLS = Object.fromEntries(Object.entries(SKILL_TREE).map(([k, t]) => [k, t.nodes]));

/** Sum gear + skill modifiers for one character in the save. */
export function playerMods(char, charId) {
  const m = { melee: 0, shot: 0, shotCd: 0, armor: 0, maxHp: 0, iframes: 0, dodgeCd: 0, revive: 0, gun: 0,
    speed: 0, sta: 0, staRegen: 0, dashHit: 0, crit: 0, lifesteal: 0, loot: 0, haggle: 0, skillCd: 0, abilityPower: 0, markDmg: 0, secondWind: 0, decoys: 0, reviveHeal: 0 };
  const add = (mods, k = 1) => { for (const [key, v] of Object.entries(mods || {})) m[key] = (m[key] ?? 0) + v * k; };
  for (const id of Object.values(char.equipped || {})) {
    const def = id && ITEMS[id];
    if (!def || !canWear(def, charId)) continue;                     // unique items only work for their owner
    add(scaleMods(def.mods, char.upgrades?.[id] ?? 0));
    if (def.blink) m.blink = true;
  }
  m.swing = ITEMS[char.equipped?.weapon]?.swing ?? null;   // weapon profiles replace the defaults, they don't add
  m.gunStats = ITEMS[char.equipped?.ranged]?.gun ?? null;
  for (const s of SKILLS[charId] || []) add(s.mods, char.skills?.[s.id] ?? 0);
  m.armor = Math.min(0.6, m.armor); m.skillCd = Math.min(0.6, m.skillCd); m.haggle = Math.min(0.4, m.haggle);
  return m;
}
