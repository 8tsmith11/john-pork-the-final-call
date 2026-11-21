// Act 1, the ending (hub #48). Staged on the dead platform after the boss falls, while the stranger climbs down
// (WorldScene._playEnding draws him), before the ending scene. That scene keeps its voice, its choice and the
// save handoff to Act 2 untouched. Wordless: a beat of quiet, then everyone turns to the one coming down.
export default {
  id: 'act1_end',
  map: 'platform',
  cast: { michael: {}, trevor: {}, manuel: {} },
  steps: [
    { wait: 0.8 },
    { cam: 'cast', zoom: 1.2, dur: 1.2 },
    { together: [{ emote: 'michael', icon: '...' }, { emote: 'trevor', icon: '...' }, { emote: 'manuel', icon: '...' }] },
    { together: [{ face: 'michael', dir: 'right' }, { face: 'trevor', dir: 'right' }, { face: 'manuel', dir: 'right' }] },
    { emote: 'manuel', icon: '!' },
    { wait: 1.2 },
    { cam: 'cast', zoom: 1, dur: 0.8 },
  ],
};
