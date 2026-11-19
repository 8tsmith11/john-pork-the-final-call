// Characters grow as they level up (Manuel: "slight progressive changes on each level, bigger gaps on stage
// changes"). A little taller every level, a bigger jump at each look stage (level 3, then level 6: the morph
// unlocks), and small details that build up level by level (src/game/render/wearables.js paints them).
// Cosmetic only: the sim's hitboxes don't change.
export const GROWTH = { perLevel: 0.01, stageJump: 0.035, cap: 1.15, maxDetailLevel: 8 };

/** 0 before level 3, 1 from level 3, 2 from level 6. */
export const lookStage = (level = 1) => (level >= 6 ? 2 : level >= 3 ? 1 : 0);

/** How much bigger than level 1 a character is drawn. */
export const growthScale = (level = 1) => Math.min(GROWTH.cap, 1 + GROWTH.perLevel * (Math.max(1, level) - 1) + GROWTH.stageJump * lookStage(level));

/** The look id for a character's level (details stop changing after maxDetailLevel; growth goes on to the cap). */
export const growthLook = (level = 1) => (level >= 2 ? `fx.grow${Math.min(level, GROWTH.maxDetailLevel)}` : null);
