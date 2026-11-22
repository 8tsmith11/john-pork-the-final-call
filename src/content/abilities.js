// Ability scores, D&D style (Michael's request, D-017). Six scores per roommate; each gives a
// modifier = floor((score - 10) / 2), so 10-11 is +0, 14 is +2, 8 is -1. Modifiers feed the sim through
// playerMods (src/content/items.js) and ability checks (d20 + modifier vs a difficulty, DC).
// Every level gives ability points (src/content/progression.js: one, two on every fifth level). Raising a score
// costs more the higher it is (raiseCost), up to MAX_SCORE (Trevor: "maxed out str after just switchman").

export const ABILITIES = {
  str: { name: 'Strength', short: 'STR', does: 'melee damage, knockback · Intimidate' },
  dex: { name: 'Dexterity', short: 'DEX', does: 'speed, ranged damage, dodge, crit · Pickpocket' },
  con: { name: 'Constitution', short: 'CON', does: 'max HP, stamina' },
  int: { name: 'Intelligence', short: 'INT', does: 'ability power, loot · Investigate' },
  wis: { name: 'Wisdom', short: 'WIS', does: 'ability cooldown, revive speed · Insight' },
  cha: { name: 'Charisma', short: 'CHA', does: 'shop prices · Charm, Deceive' },
};
export const ABILITY_KEYS = Object.keys(ABILITIES);
export const POINTS_PER_LEVEL = 1;   // kept for old readers; the real rule is progression.abilityPointsAt
export const MAX_SCORE = 26;
/** Points to raise a score by one from `score`: 1 up to 15, 2 up to 18, 3 up to 22, 4 after (14 to 20 costs 13). */
export const raiseCost = (score) => (score < 15 ? 1 : score < 18 ? 2 : score < 22 ? 3 : 4);

// Starting spreads (each sums to 68) drawn from who they are: Trevor lifts and plays guitar; Manuel
// is the engineer who sculpts at 3 a.m.; Michael talks to everyone and reads the signal.
export const BASE_SCORES = {
  trevor:  { str: 14, dex: 11, con: 13, int: 10, wis: 9,  cha: 11 },
  manuel:  { str: 10, dex: 12, con: 12, int: 14, wis: 11, cha: 9 },
  michael: { str: 9,  dex: 13, con: 10, int: 11, wis: 11, cha: 14 },
};

export const modOf = (score) => Math.floor(((score ?? 10) - 10) / 2);
export const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);
export const scoresOf = (char, charId) => ({ ...(BASE_SCORES[charId] ?? {}), ...(char?.abilities ?? {}) });

/** What the scores add to playerMods. Negative modifiers take away. */
export function abilityModsFor(char, charId) {
  const s = scoresOf(char, charId), m = (k) => modOf(s[k]);
  return {
    melee: 2 * m('str'), knock: 0.05 * m('str'),
    speed: 0.03 * m('dex'), shot: m('dex'), dodgeCd: -0.02 * m('dex'), crit: 0.01 * m('dex'),
    maxHp: 6 * m('con'), sta: 5 * m('con'),
    abilityPower: 0.05 * m('int'), loot: 0.03 * m('int'),
    skillCd: 0.03 * m('wis'), revive: 0.08 * m('wis'),
    haggle: 0.03 * m('cha'),
  };
}

/** An ability check: d20 + modifier vs dc. `adv` rolls twice and keeps the higher. `bonus` is a flat extra (checkBonus). */
export function check(char, charId, key, dc, { adv = false, rand = Math.random, bonus = 0 } = {}) {
  const d = () => 1 + Math.floor(rand() * 20);
  const roll = adv ? Math.max(d(), d()) : d();
  const mod = modOf(scoresOf(char, charId)[key]), total = roll + mod + bonus;
  return { key, roll, mod, bonus, total, dc, nat20: roll === 20, nat1: roll === 1, success: roll === 20 || (roll !== 1 && total >= dc) };
}

/** The party's standing bonus to every check: +1 once the reference weights balance (src/content/puzzles.js, gt_cradle). */
export const checkBonus = (flags) => (flags?.['pz.gt_cradle.solved'] ? 1 : 0);
