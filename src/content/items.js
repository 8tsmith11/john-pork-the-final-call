// Items, fab recipes, and skills (stable ids; saves reference these).
// Analog gear resists rot (bible §4). Stats feed the sim through playerMods().
import { FISH } from './fish.js';
import { SKILL_TREE } from './skills.js';
import { abilityModsFor } from './abilities.js';

// Equipment slots (D-014, Michael). Armor points come from the four armor pieces; gear goes on top.
export const WEAPON_SLOTS = ['weapon', 'ranged', 'gadget', 'charm'];
export const ARMOR_SLOTS = ['helmet', 'chestplate', 'leggings', 'boots'];
export const GEAR_SLOTS = ['goggles', 'parka', 'gloves', 'socks', 'backpack'];
export const EQUIP_SLOTS = [...WEAPON_SLOTS, ...ARMOR_SLOTS, ...GEAR_SLOTS];
// Worn slots (Michael): a worn item leaves the bag and lives only in its equipment slot (the ARMOR /
// GEAR / gadget / charm boxes beside the character), so it no longer takes a backpack or hotbar slot.
// Melee and ranged weapons stay in the hotbar, because the selected hotbar slot is what you hold.
export const WORN_SLOTS = [...ARMOR_SLOTS, ...GEAR_SLOTS, 'gadget', 'charm'];
export const SLOT_NAMES = { weapon: 'Melee', ranged: 'Ranged', gadget: 'Gadget', charm: 'Charm', helmet: 'Helmet', chestplate: 'Chestplate',
  leggings: 'Leggings', boots: 'Boots', goggles: 'Goggles / hat', parka: 'Rain parka', gloves: 'Gloves', socks: 'Socks', backpack: 'Backpack' };

export const ITEMS = {
  'item.pry_bar':      { name: 'Pry bar', slot: 'weapon', analog: true, swing: { range: 18, arc: 0.6, cooldown: 0.4, damage: 11, knockback: 120 }, text: 'Half a meter of hex steel from the 631 toolwall. Everyone in the apartment owns one; nobody remembers buying it.' },
  'item.wooden_bat':   { name: 'Wooden bat', slot: 'weapon', analog: true, swing: { range: 20, arc: 0.7, cooldown: 0.45, damage: 12, knockback: 160 }, mods: { melee: 6 }, text: 'Ash wood. Coderot slides off it.' },
  'item.fab_launcher': { name: 'Fab launcher', slot: 'ranged', mods: { gun: 1, shot: 4, shotCd: -0.12 }, text: 'Printed at 3 a.m. Fires sintered pellets.' },
  'item.mesh_vest':    { name: 'Printed mesh vest', slot: 'chestplate', mods: { armor: 0.2 }, text: 'Hex lattice. Takes a fifth of the hurt.' },
  'item.sniffer':      { name: 'Helium sniffer', slot: 'gadget', mods: {}, text: 'Follows the lightest thing in the world.' },
  'item.charm_1901':   { name: 'Rollover charm', slot: 'charm', analog: true, mods: { armor: 0.12 }, text: 'A brass clock hand on a cord, stopped at 3:14. Takes the edge off whatever hits you.' },
  'item.pork_pin':     { name: 'Porcelain John Pork pin', slot: 'charm', mods: { melee: 3, shot: 3 }, text: 'Three busts looked at the flag at once and this was on the floor afterwards. Warm to the touch.' },
  // Melee weapons carry a `swing` (range px, arc as a fraction of a half-turn, cooldown s, damage, knockback);
  // ranged ones a `gun` profile (cooldown, damage, speed, life, pellets, spread). Missing fields use the defaults.
  'item.pipe_wrench':  { name: 'Pipe wrench', slot: 'weapon', analog: true, swing: { range: 18, arc: 0.5, cooldown: 0.62, damage: 30, knockback: 230 }, text: 'Two feet of cast iron. Slow. Whatever it hits stays hit.' },
  'item.box_cutter':   { name: 'Box cutter', slot: 'weapon', swing: { range: 14, arc: 0.45, cooldown: 0.18, damage: 8, knockback: 40 }, mods: { crit: 0.15 }, text: 'Short reach, very fast. Get close and stay close.' },
  'item.rebar':        { name: 'Rebar spear', slot: 'weapon', analog: true, swing: { range: 32, arc: 0.28, cooldown: 0.48, damage: 19, knockback: 90 }, text: 'A length of rebar with one end ground to a point. Long, narrow. Hit them before they reach you.' },
  'item.busted_guitar':{ name: 'Busted Telecaster', slot: 'weapon', analog: true, swing: { range: 22, arc: 0.9, cooldown: 0.5, damage: 12, knockback: 260 }, mods: { abilityPower: 0.1 }, text: 'Two strings left. A wide, loud swing that throws everything back. Trevor winces every time.' },
  'item.nail_gun':     { name: 'Nail gun', slot: 'ranged', gun: { cooldown: 0.16, damage: 4, speed: 260, life: 0.6, clip: 24, reload: 1.6 }, mods: { gun: 1 }, text: 'Fast, weak, a lot of nails. Hold the trigger.' },
  'item.scattergun':   { name: 'Fab scattergun', slot: 'ranged', gun: { cooldown: 0.85, damage: 6, speed: 200, life: 0.38, pellets: 5, spread: 0.45, clip: 2, reload: 1.4 }, mods: { gun: 1 }, text: 'Five pellets in a fan, short range. Printed from coderot gel, which may be why it hums.' },
  'item.mate_flask':   { name: 'Mate thermos', slot: 'consumable', heal: 45, mateKick: true, text: 'Manuel would want you to have it. He would also want it back. Heals, then a caffeine kick: faster legs and quicker stamina for 45 seconds, then a few slow seconds when it wears off.' },
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
  'item.wmata_fuses':   { name: 'Box of 30A fuses', slot: 'key', text: 'Four ceramic fuses in a WMATA box, the cardboard soft with age. Kess swears they test fine.' },
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
  'item.brown_parka':   { name: 'Brown rain parka', slot: 'parka', mods: { armor: 0.03, staRegen: 0.1 }, text: 'Michael\'s. Broken in at the elbows and completely waterproof. He will not hear a word against it.' },
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
  'item.winged_boots':  { name: 'Winged boots', slot: 'boots', owner: 'michael', unique: true, special: true, src: 'late-act2 (The Dead Drop)', blink: true,
    mods: { armor: 0.1, speed: 0.6 }, text: 'Little white wings at the ankles that never stop twitching. Incredibly fast. [B] blinks you forward in a line of fire; hold [B] to fast travel.' },
  'item.cowboy_hat':    { name: 'Cowboy hat', slot: 'goggles', owner: 'michael', unique: true, src: 'late-act2 (Manuelita, reunion)',
    mods: { crit: 0.1, markDmg: 0.2, haggle: 0.15 }, text: 'Tennessee straw, sweat-stained, ironic until it isn\'t. Michael squints under it and hits what he pings. Shopkeepers trust it.' },
  'item.smoky_socks':   { name: 'Smoky Mountain socks', slot: 'socks', owner: 'michael', unique: true, src: 'act3 (Corridor mail sorting)',
    mods: { sta: 30, staRegen: 0.3, dodgeCd: -0.1 }, text: 'Hand-knit by somebody\'s grandmother back home. You could hike to Gatlinburg in these. More stamina, faster dodges.' },
  'item.signal_gloves': { name: 'Signal gloves', slot: 'gloves', owner: 'michael', unique: true, src: 'act3 (Manuelita builds them)',
    mods: { abilityPower: 0.25, skillCd: 0.15 }, text: 'His lace runs out to his fingertips through these. Ping reaches further and comes back sooner.' },
});

// Manuel's four (his two picks via gonman, board #178/#181; the other two from his backstory).
Object.assign(ITEMS, {
  'item.arg_shirt':      { name: 'Argentina shirt', slot: 'chestplate', owner: 'manuel', unique: true, special: true, src: 'late-act2 (Baltimore sealed cargo)',
    mods: { armor: 0.1, dodgeCd: -0.12, killDodge: 1 }, text: 'Sky-blue and white stripes, a 10 on the back. Gambeta: every kill hands his dodge straight back to him.' },
  'item.hasbulla_tee':   { name: 'Hasbulla tee', slot: 'parka', owner: 'manuel', unique: true, src: 'act3 (the Corridor)',
    mods: { armor: 0.04, small: 2, knock: 0.4 }, text: 'White, oversized, "VS EVERYBODY", hangs past his waist. Small and unbothered: harder to hit, and his swings throw things further.' },
  // From real life: Manuel and Michael are building a smart pacifier for a children's hospital (they
  // hold the patent and prototype it in 631). This is prototype #1, and Manuel won't give it back.
  'item.smart_pacifier': { name: 'Smart pacifier (prototype)', slot: 'goggles', owner: 'manuel', unique: true, src: 'late-act2 (Baltimore children\'s hospital)',
    mods: { regen: 1.5, staRegen: 0.15, sleepGuard: 1 }, text: 'Patent granted. A blinking sensor in the shield. Manuel sucks on it constantly and slowly heals. With it in, a lullaby puts him out longer (12 s, not 8), but asleep like that he can\'t be hurt, and his health and stamina pour back.' },
  'item.mate_holster':   { name: 'Mate holster', slot: 'backpack', owner: 'manuel', unique: true, src: 'late-act2 (the refuge)',
    mods: { mateHeal: 0.6, staRegen: 0.25 }, text: 'A gourd, a bombilla and a steel thermos on a leather harness. Mate heals him far more, and he is never quite tired.' },
});

// Trevor's four, chosen by trevor's agent from his canon and his real life (docs/lore/real-life.md:
// he builds BattleBots). Owner-only like the others; not before late Act 2.
Object.assign(ITEMS, {
  'item.stage_jacket':   { name: 'Stage jacket', slot: 'chestplate', owner: 'trevor', unique: true, special: true, src: 'late-act2',
    mods: { armor: 0.12, abilityPower: 0.3, skillCd: 0.15 }, text: 'Denim, patched with three bands nobody else has heard of and one that broke up before he could see them. In it, his riff hits harder and comes back sooner.' },
  'item.callus_gloves':  { name: 'Fingerless gloves', slot: 'gloves', owner: 'trevor', unique: true, src: 'act3',
    mods: { melee: 5, crit: 0.08 }, text: 'Worn through at the fingertips, which have calluses of their own by now. Harder hits, and now and then a clean one.' },
  'item.tank_goggles':   { name: 'Tank goggles', slot: 'goggles', owner: 'trevor', unique: true, src: 'act3',
    mods: { markDmg: 0.25, loot: 0.15 }, text: 'Blue-tinted, for checking the shrimp at night without waking them. Coderot things show their seams through them: marked ones take far more, and drop more.' },
  'item.spinner_pack':   { name: 'Spinner pack', slot: 'backpack', owner: 'trevor', unique: true, src: 'act3',
    mods: { dashHit: 14, knock: 0.35, speed: -0.03 }, text: 'A retired 3-lb combat robot strapped to his back, weapon still live. Dash through anything and the spinner bites it on the way past, hard enough to send it flying. Heavy.' },
});

// Pocket finds (NPC approaches, D-017) and the sleeping potion.
Object.assign(ITEMS, {
  'item.keycard':        { name: 'Keycard', slot: 'junk', stack: 8, text: 'A Continuity contractor badge on a lanyard. The photo is of somebody else.' },
  'item.hard_candy':     { name: 'Hard candy', slot: 'consumable', heal: 8, text: 'Butterscotch, wrapped in gold plastic, from a coat pocket that has had it since 2091.' },
  'item.lighter':        { name: 'Lighter', slot: 'junk', stack: 8, text: 'Clear plastic, nearly out. It sparks more than it lights.' },
  'item.lottery_ticket': { name: 'Lottery ticket', slot: 'junk', stack: 8, text: 'MARYLAND MEGA COMPUTE. Scratched. You did not win. Somebody kept it anyway.' },
  'item.caffeine':       { name: 'Cold brew', slot: 'consumable', caffeine: 45, stack: 8, text: 'A can of 2098 cold brew, legally a controlled substance in three states. Drink it to wake up at once; for 45 seconds nothing can put you to sleep and you move faster.' },
  'item.sleep_potion':   { name: 'Sleeping potion', slot: 'consumable', throwable: true, stack: 8, text: 'A blue vial that smells like a dentist\'s office. Use it to throw it where you\'re aiming: everyone in the splash sleeps for 8 seconds. Bosses shrug it off.' },
});

// Upgrades at the master armorer:// Upgrades at the master armorer: each level (max 5) scales an item's positive bonuses by +15%.
export const MAX_UPGRADE = 5;
export const upgradeCost = (level) => ({ money: 20 * (level + 1), mats: { 'item.mat_scrap': level + 1, ...(level ? { 'item.mat_circuit': level } : {}) } });
export function scaleMods(mods, level = 0) {
  if (!level) return mods;
  return Object.fromEntries(Object.entries(mods || {}).map(([k, v]) => [k, v > 0 ? +(v * (1 + 0.15 * level)).toFixed(3) : v]));
}
export const canWear = (def, charId) => !!def && (!def.owner || def.owner === charId);

// Trevor's combat robot: three printed parts bring it back (quest side.bot, Trevor's real-life BattleBots).
Object.assign(ITEMS, {
  'item.bot_drive':  { name: 'Drive module', slot: 'key', text: 'Two brushless motors and a gearbox, printed housings. For the wedge bot in Trevor\'s room.' },
  'item.bot_weapon': { name: 'Spinner bar', slot: 'key', text: 'A balanced steel bar on a hub. Coderot gel in the bearing, which is either genius or a problem.' },
  'item.bot_brain':  { name: 'Control board', slot: 'key', text: 'A receiver, a gyro and a chip that answers to Trevor\'s phone. Mostly.' },
});

// The fab prints from materials (cost = { materialId: qty }). `req` hides a recipe until a flag is set.
export const RECIPES = [
  { item: 'item.bot_drive',  req: 'q.bot.looked', cost: { 'item.mat_scrap': 4, 'item.mat_wire': 2, 'item.mat_cell': 1 } },
  { item: 'item.bot_weapon', req: 'q.bot.looked', cost: { 'item.mat_scrap': 3, 'item.mat_gel': 3 } },
  { item: 'item.bot_brain',  req: 'q.bot.looked', cost: { 'item.mat_circuit': 2, 'item.mat_wire': 2 } },
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
  { item: 'item.sleep_potion',   cost: { 'item.mat_gel': 2, 'item.mat_glass': 1 } },
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
  // Michael's closet in 631: his brown rain parka, once per save, into Michael's bag whoever opens it.
  michael_closet: { rolls: 1, to: 'michael', table: [['item.brown_parka', 1, 1, 1]] },
  tackle:  { rolls: 2, table: [['item.mat_wire', 35, 1, 2], ['item.energy_bar', 25, 1, 1], ['money', 25, 2, 8], ['item.ozzie_lure', 3, 1, 1], ['item.mat_scrap', 12, 1, 2]] },
};

// What the pawn pays: 40% of the best shelf price, else a flat rate by kind. Uniques, key items and
// anything you're wearing can't be sold.
export function sellPrice(id) {
  const def = ITEMS[id]; if (!def || def.unique || def.slot === 'key') return 0;
  let best = 0;
  for (const shop of Object.values(SHOPS)) for (const st of shop.stock) if (st.item === id) best = Math.max(best, st.price);
  if (best) return Math.max(1, Math.round(best * 0.4));
  if (def.slot === 'material') return 1;
  if (id.startsWith('item.fish_')) return { 'item.fish_striper': 6, 'item.fish_lantern': 12, 'item.fish_catfish': 4 }[id] ?? 2;
  if (def.slot === 'junk') return 6;
  if (def.slot === 'consumable') return 2;
  return 8;
}

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
  coop: { title: 'GREENBELT CO-OP', lines: ['[scaffold] Prices set by vote.'],   // act2_more.js scaffold
    stock: [
      { item: 'item.energy_bar', price: 4 },
      { item: 'item.caffeine', price: 10 },
      { item: 'item.crab_chips', price: 8 },
    ] },
  diner: { title: 'THE DINER', lines: ['[scaffold] Whatever you order, it is already on the plate.'],   // act1_more.js scaffold
    stock: [
      { item: 'item.energy_bar', price: 5 },
      { item: 'item.caffeine', price: 12 },
      { item: 'item.crab_chips', price: 9 },
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
      { item: 'item.sleep_potion', price: 15 },
      { item: 'item.caffeine', price: 8 },
    ] },
};

// Skill trees live in ./skills.js (SKILL_TREE). SKILLS is kept as an alias of each tree's node list.
export const SKILLS = Object.fromEntries(Object.entries(SKILL_TREE).map(([k, t]) => [k, t.nodes]));

/** Sum gear + skill modifiers for one character in the save. */
// Manuel's edge (Manuel: "the worst at playing video games, so his character should be the most overpowered").
// A built-in bonus on top of gear, skills and ability scores: he's the hardest to kill, hits hardest, recovers fastest.
export const MANUEL_EDGE = { maxHp: 50, armor: 0.3, regen: 1, small: 1.5, melee: 6, shot: 4, crit: 0.1, lifesteal: 1,
  speed: 0.1, sta: 30, staRegen: 0.5, iframes: 0.1, skillCd: 0.25, abilityPower: 0.3 };

export function playerMods(char, charId) {
  const m = { melee: 0, shot: 0, shotCd: 0, armor: 0, maxHp: 0, iframes: 0, dodgeCd: 0, revive: 0, gun: 0,
    speed: 0, sta: 0, staRegen: 0, dashHit: 0, crit: 0, lifesteal: 0, loot: 0, haggle: 0, skillCd: 0, abilityPower: 0, markDmg: 0, secondWind: 0, decoys: 0, reviveHeal: 0,
    small: 0, knock: 0, killDodge: 0, mateHeal: 0, sleepImmune: 0, regen: 0, sleepGuard: 0 };
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
  add(abilityModsFor(char, charId));   // ability scores (D-017)
  if (charId === 'manuel') add(MANUEL_EDGE);
  m.armor = Math.min(charId === 'manuel' ? 0.75 : 0.6, m.armor); m.skillCd = Math.min(0.6, m.skillCd); m.haggle = Math.min(0.4, m.haggle);
  return m;
}
