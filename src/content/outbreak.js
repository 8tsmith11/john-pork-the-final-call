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
    metro_plaza: [                                                  // gonman: the rot surfaces where people would be at night
      ['enemy.rotling', 36, 41], ['enemy.spitter', 42, 38], ['enemy.rotling', 47, 45],   // the parking lot
      ['enemy.rotling', 60, 22], ['enemy.rotling', 61, 44],                              // Route 1, both halves
      ['enemy.rotling', 24, 33], ['enemy.spitter', 72, 32],                              // the cross street
      ['enemy.rotling', 75, 10],                                                         // the east sidewalk by the shops
      // Further-gone forms after the Call (Trevor, 2026-11-23): a grafted in the lot, crawlers on Route 1, a sprawl
      // on the cross street, and a lace hulk walking the east sidewalk.
      ['enemy.rot_graft', 44, 42], ['enemy.rot_crawler', 59, 30], ['enemy.rot_crawler', 62, 36],
      ['enemy.rot_sprawl', 26, 30], ['enemy.rot_hulk', 73, 14],
      // Append only: metro_plaza#after.N killed keys must keep their meaning.
    ],
  },
};

export const phaseEnemies = (flags) => {
  const phase = outbreakPhase(flags), byMap = PHASE_SPAWNS[phase] ?? {};
  return Object.fromEntries(Object.entries(byMap).map(([id, list]) => [id, { phase, list }]));
};
