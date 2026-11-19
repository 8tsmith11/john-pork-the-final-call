// Leveling: one place for the curve, the act scaling and what a level gives (Trevor, 2026-11-19: "stats and skill
// tree is too easy and has too low of a ceiling, maxed out str after just switchman"). Before this, a level cost
// level x 30 XP and gave 2 ability points against a cap of 20, so Trevor's 14 STR was maxed three levels in, and
// the 23-rank tree had no gates. The game is three acts now; the ceiling has to last all of them.
//
// Targets (tools/balance-bot.mjs can check them): the Switchman around level 4, the end of Act 1 around 7-8,
// the end of Act 2 around 15-16, the end of Act 3 around 24-26, the cap at 30 for people who do everything.

export const LEVEL_CAP = 30;

/** XP from this level to the next: 30, 91, 174, 276, 394 ... 1194 at 10, 3621 at 20. */
export const xpToNext = (level) => Math.round(30 * Math.pow(Math.max(1, level), 1.6));

/** Acts 2 and 3 reuse many Act 1 enemies, so kills and quests there are worth more (by the map's / quest's act). */
export const XP_BY_ACT = { 1: 1, 2: 2.5, 3: 5 };
export const xpScale = (act) => XP_BY_ACT[act ?? 1] ?? 1;

/** Ability points a level gives: one, and two on every fifth level (35 by the cap, against a costed climb). */
export const abilityPointsAt = (level) => (level % 5 === 0 ? 2 : 1);

/** Skill tree rows open by level (row 4 is the capstone), so nobody rushes a capstone in Act 1. */
export const TIER_LEVEL = [1, 4, 8, 13, 20];

/**
 * Add XP to one roommate and level them up as far as it goes. Returns the levels reached (for announcements and
 * level-gated unlocks, like the morph stages). At the cap, XP stops counting.
 */
export function addXp(c, n) {
  const reached = [];
  if (!c || !(n > 0)) return reached;
  c.level ??= 1; c.xp = (c.xp ?? 0) + Math.round(n);
  while (c.level < LEVEL_CAP && c.xp >= xpToNext(c.level)) {
    c.xp -= xpToNext(c.level); c.level++;
    c.skillPoints = (c.skillPoints ?? 0) + 1;
    c.abilityPoints = (c.abilityPoints ?? 0) + abilityPointsAt(c.level);
    reached.push(c.level);
  }
  if (c.level >= LEVEL_CAP) c.xp = 0;
  return reached;
}
