// The dawn clock (P-004, gonman and trevor; #511 item 1): Act 1 runs from about 3 a.m. toward first light,
// and the clock moves with the story, never on its own. It can't run out. The sky lightens with it on
// outdoor maps. Each beat sets the earliest time the clock can show once its flag is set; the clock shows
// the latest beat reached. gonman owns which beats and what time; trevor owns the HUD.
export const DAWN_BEATS = [
  ['act1.coldopen.done', 3 * 60 + 14],
  ['act1.balloon.noticedGone', 3 * 60 + 22],
  ['act1.beat.asterEnter', 3 * 60 + 30],
  ['act1.leadA.done', 3 * 60 + 52],
  ['act1.halvard.met', 3 * 60 + 58],
  ['act1.leadC.done', 4 * 60 + 5],
  ['act1.cordon.passed', 4 * 60 + 20],
  ['act1.beat.call', 4 * 60 + 41],
  ['act1.switchyard.solved', 5 * 60 + 5],
  ['act1.switchman.down', 5 * 60 + 15],
  ['act1.fuses.in', 5 * 60 + 32],
  ['act1.tunnel.gate', 5 * 60 + 50],
  ['act1.boss.defeated', 6 * 60 + 24],
  ['act1.complete', 6 * 60 + 52],
];
export const DAWN_START = 3 * 60 + 9, FIRST_LIGHT = 7 * 60;

/** Minutes after midnight the clock shows for these flags. */
export function dawnMinutes(flags = {}) {
  let m = DAWN_START;
  for (const [flag, at] of DAWN_BEATS) if (flags[flag]) m = Math.max(m, at);
  return m;
}

/** 0 at the start of the night, 1 at first light. */
export const dawnProgress = (flags) => Math.max(0, Math.min(1, (dawnMinutes(flags) - DAWN_START) / (FIRST_LIGHT - DAWN_START)));

export const dawnLabel = (flags) => { const m = dawnMinutes(flags); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')} am`; };
