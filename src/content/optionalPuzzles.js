// Hard optional puzzles with boons (brief: "hard puzzles that are optional that give various boons").
// Spoiler list for humans: docs/SECRETS.md.

// ---- The Four Clocks -------------------------------------------------------------------------
// Four rotted clocks are stuck at 19:01 in four places. The paper clock taped under the station clock
// says the right time ("USE THIS ONE"). Wind all four to it and the hallway clock's face swings open.
export const CLOCKS = ['obj.clock_6f', 'obj.lobby_clock', 'obj.plaza_clock', 'obj.platform_clock'];
export const CLOCK_TIMES = ['19:01', '21:30', '00:00', '03:14', '06:45', '12:00'];   // winding steps
export const CLOCK_ANSWER = '03:14';
export const PAPER_CLOCK_NOTE = '\n\nThe paper clock taped underneath has its hands drawn at 3:14.';

export function clockTime(flags, id) { return CLOCK_TIMES[(flags[`puz.clock.${id}`] ?? 0) % CLOCK_TIMES.length]; }
export function clocksSolved(flags) { return CLOCKS.every((id) => clockTime(flags, id) === CLOCK_ANSWER); }

// ---- Manuel's busts ---------------------------------------------------------------------------
// Turn the three busts to face the flag, in the order on the scrap at Manuel's table:
// "la última primero, después la primera" (the last first, then the first) → newest, first, second.
export const BUST_ORDER = ['obj.statue_3', 'obj.statue_1', 'obj.statue_2'];
export const BUST_HINT = '\n\nUnder the clay tools, a scrap of paper in Manuel\'s hand: "para que miren la bandera: la última primero, después la primera." (So they look at the flag: the last first, then the first.)';
