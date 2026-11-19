// Characters grow as they level up (Manuel: "slight progressive changes on each level, bigger gaps on stage
// changes"). A little taller every level, a bigger jump at each look stage (level 3, then level 6: the morph
// unlocks), and small details that build up level by level (src/game/render/wearables.js paints them).
// Cosmetic only: the sim's hitboxes don't change.
export const GROWTH = { perLevel: 0.01, stageJump: 0.035, cap: 1.15, maxDetailLevel: 8 };

/** 0 before level 3, 1 from level 3, 2 from level 6. */
export const lookStage = (level = 1) => (level >= 6 ? 2 : level >= 3 ? 1 : 0);

// Each roommate grows his own way (Manuel: "Trevor should become more muscular and taller"). Trevor, the gym
// one, grows fastest and gets taller as well as bigger; the muscle itself is painted (wearables.js).
const BUILD = { trevor: { perLevel: 0.013, stageJump: 0.045, cap: 1.2, taller: 0.006 } };

/** [width, height] scale versus level 1 for this roommate. */
export function growthSize(level = 1, who = '') {
  const b = { ...GROWTH, taller: 0, ...(BUILD[who] ?? {}) }, lv = Math.max(1, level);
  const s = Math.min(b.cap, 1 + b.perLevel * (lv - 1) + b.stageJump * lookStage(lv));
  return [s, Math.min(b.cap + 0.06, s + b.taller * (lv - 1))];
}

/** How much bigger than level 1 a character is drawn (width). */
export const growthScale = (level = 1, who = '') => growthSize(level, who)[0];

/** The look id for a character's level (details stop changing after maxDetailLevel; growth goes on to the cap). */
export const growthLook = (level = 1) => (level >= 2 ? `fx.grow${Math.min(level, GROWTH.maxDetailLevel)}` : null);
