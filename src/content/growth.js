// Characters grow as they level up (Manuel: "slight progressive changes on each level, bigger gaps on stage
// changes"). A little taller every level, a bigger jump at each look stage (level 3, then level 6: the morph
// unlocks), and small details that build up level by level (src/game/render/wearables.js paints them).
// Cosmetic only: the sim's hitboxes don't change.
export const GROWTH = { perLevel: 0.015, stageJump: 0.05, cap: 1.22, maxDetailLevel: 8 };   // more noticeable (Manuel)

/** 0 before level 3, 1 from level 3, 2 from level 6. */
export const lookStage = (level = 1) => (level >= 6 ? 2 : level >= 3 ? 1 : 0);

// Each roommate grows his own way (Manuel: "Trevor should become more muscular and taller"). Trevor, the gym
// one, grows fastest and gets taller as well as bigger; the muscle itself is painted (wearables.js).
const BUILD = {
  trevor: { perLevel: 0.02, stageJump: 0.06, cap: 1.3, taller: 0.01 },
  manuel: { wider: 0.018 },   // Manuel gets rounder as the story goes on (his own request); the belly is painted too
};

/** [width, height] scale versus level 1 for this roommate. */
export function growthSize(level = 1, who = '') {
  const b = { ...GROWTH, taller: 0, wider: 0, ...(BUILD[who] ?? {}) }, lv = Math.max(1, Math.min(level, 12));
  const s = Math.min(b.cap, 1 + b.perLevel * (lv - 1) + b.stageJump * lookStage(lv));
  return [s * (1 + b.wider * (lv - 1)), Math.min(b.cap + 0.06, s + b.taller * (lv - 1))];
}

/** How much bigger than level 1 a character is drawn (width). */
export const growthScale = (level = 1, who = '') => growthSize(level, who)[0];

/** Manuel's belly size for his level: 0 none, 1 from level 3, 2 from 6, 3 from 8. */
export const bellyFor = (level = 1) => (level >= 8 ? 3 : level >= 6 ? 2 : level >= 3 ? 1 : 0);

/**
 * Manuel after the gonman's stage two goes off: thin at once, filling back out as the move recharges
 * (his own request). recovered: 0 just after, 1 when recharged. Returns his belly now and a width factor.
 */
export function gonmanWeight(level, recovered) {
  if (recovered === undefined || recovered === null) return { belly: bellyFor(level), width: 1 };
  const r = Math.max(0, Math.min(1, recovered));
  return { belly: Math.floor(bellyFor(level) * r + 1e-9), width: 0.58 + 0.42 * r * r };   // skinny at first, filling out faster near the end
}

/** The look id for a character's level (details stop changing after maxDetailLevel; growth goes on to the cap). */
export const growthLook = (level = 1, belly) => {
  if (level < 2 && !belly) return null;
  const lv = Math.max(2, Math.min(level, GROWTH.maxDetailLevel));
  return belly === undefined || belly === bellyFor(level) ? `fx.grow${lv}` : `fx.grow${lv}b${belly}`;
};
