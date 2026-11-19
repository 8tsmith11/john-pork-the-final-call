// Skill trees (human request: "more interesting skill tree"). One tree per roommate: three branches
// of four tiers that meet at a capstone. A node opens once every node in `req` has a rank.
// Effects are `mods` (per rank) read by the sim/WorldScene:
//   melee shot shotCd armor maxHp iframes dodgeCd revive    (stat bonuses, as before)
//   speed sta staRegen      move speed (fraction), max stamina, stamina regen (fraction)
//   dashHit                 dashing through coderot things hurts them (damage)
//   crit                    chance a melee hit does double damage
//   lifesteal               HP back on every kill
//   loot / haggle           extra material chance on kills / shop discount (fractions)
//   skillCd / abilityPower  ability cooldown cut / ability strength (fractions)
//   markDmg                 extra damage vs. pinged (marked) things (fraction)
//   secondWind              once per area, going down stands you back up at 30% HP
//   decoys                  Manuel drops this many extra busts
//   reviveHeal              HP a roommate you pick up gets on top of the usual
// Layout: col 0-2 (branch), row 0-3 (tier); the capstone sits at col 1, row 4.

import { TIER_LEVEL } from './progression.js';

export const SKILL_TREE = {
  trevor: {
    branches: ['LOUD', 'SCRAPPY', 'SHRIMP DAD'],
    nodes: [
      { id: 'tr.amp', col: 0, row: 0, name: 'Cheap Amp', max: 3, mods: { abilityPower: 0.2 }, text: 'Riff hits harder and wider. +20% per rank.' },
      { id: 'tr.feedback', col: 0, row: 1, name: 'Feedback', max: 2, req: ['tr.amp'], mods: { skillCd: 0.15 }, text: 'Riff comes back 15% sooner per rank.' },
      { id: 'tr.dropd', col: 0, row: 2, name: 'Drop D', max: 1, req: ['tr.feedback'], mods: { abilityPower: 0.5 }, text: 'Tune down. Riff stuns twice as long and knocks things into walls.' },
      { id: 'tr.noise', col: 0, row: 3, name: 'Noise Complaint', max: 1, req: ['tr.dropd'], mods: { markDmg: 0.25, abilityPower: 0.25 }, text: 'Things hit by a riff stay rattled: +25% damage against them.' },
      { id: 'tr.jab', col: 1, row: 0, name: 'Open Mic Jab', max: 3, mods: { melee: 3 }, text: '+3 melee damage per rank.' },
      { id: 'tr.lucky', col: 1, row: 1, name: 'Lucky Swing', max: 2, req: ['tr.jab'], mods: { crit: 0.12 }, text: '12% chance per rank for a hit to land twice as hard.' },
      { id: 'tr.mosh', col: 1, row: 2, name: 'Mosh', max: 2, req: ['tr.lucky'], mods: { dashHit: 8 }, text: 'Dashing through coderot things shoulders them for 8 damage per rank.' },
      { id: 'tr.stagedive', col: 1, row: 3, name: 'Stage Dive', max: 1, req: ['tr.mosh'], mods: { dodgeCd: -0.15, sta: 30 }, text: 'More dashes, faster: +30 stamina, shorter dash cooldown.' },
      { id: 'tr.tank', col: 2, row: 0, name: 'Tank Water', max: 3, mods: { maxHp: 12 }, text: '+12 max HP per rank. Changing forty gallons a week builds something.' },
      { id: 'tr.brine', col: 2, row: 1, name: 'Brine', max: 2, req: ['tr.tank'], mods: { lifesteal: 4 }, text: 'Heal 4 HP per rank every time something goes down.' },
      { id: 'tr.molt', col: 2, row: 2, name: 'Molt', max: 1, req: ['tr.brine'], mods: { secondWind: 1 }, text: 'Once per area, going down stands you back up at 30% HP. Shrimp do it all the time.' },
      { id: 'tr.colony', col: 2, row: 3, name: 'Colony', max: 1, req: ['tr.molt'], mods: { reviveHeal: 30, revive: 0.3 }, text: 'Pick roommates up faster, and they get up with +30 HP.' },
      { id: 'tr.encore', col: 1, row: 4, name: 'ENCORE', max: 1, req: ['tr.noise', 'tr.stagedive', 'tr.colony'], mods: { abilityPower: 0.6, skillCd: 0.25, melee: 6 }, text: 'Capstone. The whole set at once: riff power +60%, cooldown -25%, +6 melee.' },
    ],
  },
  manuel: {
    branches: ['THE STUDIO', 'MATE', 'THE GONMAN'],
    nodes: [
      { id: 'ma.clay', col: 0, row: 0, name: 'Wet Clay', max: 3, mods: { abilityPower: 0.25 }, text: 'Decoy busts last longer and soak more. +25% per rank.' },
      { id: 'ma.eye', col: 0, row: 1, name: 'Haggler\'s Eye', max: 2, req: ['ma.clay'], mods: { haggle: 0.1 }, text: 'Shops knock 10% off per rank. He knows what things cost to make.' },
      { id: 'ma.salvage', col: 0, row: 2, name: 'Salvage', max: 2, req: ['ma.eye'], mods: { loot: 0.25 }, text: '25% more materials per rank from coderot things.' },
      { id: 'ma.army', col: 0, row: 3, name: 'Plaster Army', max: 1, req: ['ma.salvage'], mods: { decoys: 1, skillCd: 0.2 }, text: 'Drop two busts at once, 20% more often.' },
      { id: 'ma.ronda', col: 1, row: 0, name: 'Ronda', max: 3, mods: { revive: 0.25 }, text: 'Pick roommates up 25% faster per rank.' },
      { id: 'ma.cebador', col: 1, row: 1, name: 'Cebador', max: 2, req: ['ma.ronda'], mods: { reviveHeal: 20 }, text: 'Whoever you pick up gets +20 HP per rank. Somebody has to pour.' },
      { id: 'ma.yerba', col: 1, row: 2, name: 'Strong Yerba', max: 2, req: ['ma.cebador'], mods: { staRegen: 0.3, sta: 15 }, text: '+15 stamina and 30% faster recovery per rank.' },
      { id: 'ma.termo', col: 1, row: 3, name: 'Bottomless Termo', max: 1, req: ['ma.yerba'], mods: { lifesteal: 5, secondWind: 1 }, text: 'Heal on every kill, and once per area get back up at 30%.' },
      { id: 'ma.hands', col: 2, row: 0, name: 'Sculptor\'s Hands', max: 3, mods: { melee: 4 }, text: '+4 melee damage per rank.' },
      { id: 'ma.shoulders', col: 2, row: 1, name: 'Shoulders', max: 2, req: ['ma.hands'], mods: { armor: 0.08 }, text: 'Take 8% less damage per rank.' },
      { id: 'ma.che', col: 2, row: 2, name: 'Che, Tranquilo', max: 2, req: ['ma.shoulders'], mods: { iframes: 0.15, maxHp: 10 }, text: '+10 max HP and a longer breather after each hit.' },
      { id: 'ma.wall', col: 2, row: 3, name: 'Load-Bearing', max: 1, req: ['ma.che'], mods: { armor: 0.12, crit: 0.1 }, text: '12% less damage, and 10% of your hits crack things in half.' },
      { id: 'ma.gonman', col: 1, row: 4, name: 'THE GONMAN', max: 1, req: ['ma.army', 'ma.termo', 'ma.wall'], mods: { melee: 8, armor: 0.1, decoys: 1, abilityPower: 0.5 }, text: 'Capstone. He is the gonman now: +8 melee, 10% armor, a third bust, stronger busts.' },
    ],
  },
  michael: {
    branches: ['SIGNAL', 'QUICKDRAW', 'LOVER\'S LUCK'],
    nodes: [
      { id: 'mi.ping', col: 0, row: 0, name: 'Wide Ping', max: 3, mods: { abilityPower: 0.25 }, text: 'Ping reaches further and marks for longer. +25% per rank.' },
      { id: 'mi.lock', col: 0, row: 1, name: 'Lock-On', max: 2, req: ['mi.ping'], mods: { markDmg: 0.25 }, text: 'Marked things take another 25% per rank.' },
      { id: 'mi.refresh', col: 0, row: 2, name: 'Refresh Rate', max: 2, req: ['mi.lock'], mods: { skillCd: 0.15 }, text: 'Ping comes back 15% sooner per rank.' },
      { id: 'mi.read', col: 0, row: 3, name: 'Read Receipts', max: 1, req: ['mi.refresh'], mods: { loot: 0.3, markDmg: 0.2 }, text: 'Marked things drop more, and take another 20%.' },
      { id: 'mi.signal', col: 1, row: 0, name: 'Clean Signal', max: 3, mods: { shot: 3 }, text: '+3 shot damage per rank (once you have a ranged weapon).' },
      { id: 'mi.hands', col: 1, row: 1, name: 'Quick Hands', max: 2, req: ['mi.signal'], mods: { shotCd: -0.05 }, text: 'Fire 10% faster per rank.' },
      { id: 'mi.flick', col: 1, row: 2, name: 'Flick', max: 2, req: ['mi.hands'], mods: { crit: 0.1, melee: 2 }, text: '10% crit chance and +2 melee per rank.' },
      { id: 'mi.deadeye', col: 1, row: 3, name: 'Deadeye', max: 1, req: ['mi.flick'], mods: { shot: 6, shotCd: -0.08 }, text: '+6 shot damage, and faster again.' },
      { id: 'mi.luck', col: 2, row: 0, name: 'Lover\'s Luck', max: 3, mods: { iframes: 0.12 }, text: 'A longer breather after each hit, per rank.' },
      { id: 'mi.feet', col: 2, row: 1, name: 'Light Feet', max: 2, req: ['mi.luck'], mods: { speed: 0.06, dodgeCd: -0.05 }, text: '6% faster on foot, quicker dashes, per rank.' },
      { id: 'mi.tango', col: 2, row: 2, name: 'Slipstream', max: 2, req: ['mi.feet'], mods: { dashHit: 6, sta: 15 }, text: 'Dash through things for 6 damage; +15 stamina per rank.' },
      { id: 'mi.call', col: 2, row: 3, name: 'She Picks Up', max: 1, req: ['mi.tango'], mods: { secondWind: 1, maxHp: 15 }, text: 'Once per area, going down stands you back up at 30%. +15 max HP.' },
      { id: 'mi.lace', col: 1, row: 4, name: 'FULL LACE', max: 1, req: ['mi.read', 'mi.deadeye', 'mi.call'], mods: { abilityPower: 0.6, markDmg: 0.4, speed: 0.08 }, text: 'Capstone. The lace stops asking permission: ping +60%, marked +40%, faster on your feet.' },
    ],
  },
};

// A deeper tree (Trevor: "too low of a ceiling"): first-row nodes go to 5 ranks and second-row nodes to 3, so a
// tree holds ~32 ranks against 29 points by the level cap. You can't take everything; rows open by level.
for (const t of Object.values(SKILL_TREE)) for (const n of t.nodes) { if (n.row === 0 && n.max === 3) n.max = 5; else if (n.row === 1 && n.max === 2) n.max = 3; }

export const skillNode = (who, id) => SKILL_TREE[who]?.nodes.find((n) => n.id === id);
/** A node opens when its prerequisites have a rank and the roommate is high enough level for its row. */
export const skillOpen = (who, char, n) => (char.level ?? 1) >= tierLevel(n) && (n.req || []).every((r) => (char.skills?.[r] ?? 0) > 0);
export const tierLevel = (n) => TIER_LEVEL[n.row] ?? 1;

/** Old flat skills (before the trees): refund their points so nobody loses progress. */
export function migrateSkills(char, who) {
  let refund = 0;
  for (const [id, r] of Object.entries(char.skills || {})) if (!skillNode(who, id)) { refund += r; delete char.skills[id]; }
  char.skillPoints = (char.skillPoints ?? 0) + refund;
  return refund;
}
