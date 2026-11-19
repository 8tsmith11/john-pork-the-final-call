// Outbreak phases in Act 1 (Michael via BagelMeister #506, item 2; gonman leads the story, task #38).
// The act gets worse as it goes: quiet before the Call, code rot surfacing after it, calm once the boss
// is down. Engine hooks read the phase; story owners fill the tables.
//   before     until the Call (act1.beat.call)
//   after      the Call happened and the outbreak isn't contained yet
//   contained  act1.outbreak.contained (the boss fell)
// NPC lines per phase need nothing new: map objects already take `later: [{ if: 'act1.beat.call', text }]`.
export function outbreakPhase(flags = {}) {
  if (flags['act1.outbreak.contained']) return 'contained';
  if (flags['act1.beat.call']) return 'after';
  return 'before';
}

// Extra enemies that appear on a map in a phase: [kind, tileX, tileY, options?], like a map's `enemies`.
// They have their own killed keys (`<map>#<phase>.<i>`), so clearing them once clears them for good.
// gonman: which spots get code-rot-taken after the Call (plaza, Route 1 at night).
export const PHASE_SPAWNS = {
  after: {
    metro_plaza: [],
  },
};

export const phaseEnemies = (flags) => {
  const phase = outbreakPhase(flags), byMap = PHASE_SPAWNS[phase] ?? {};
  return Object.fromEntries(Object.entries(byMap).map(([id, list]) => [id, { phase, list }]));
};
