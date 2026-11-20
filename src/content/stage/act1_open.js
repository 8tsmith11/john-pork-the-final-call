// Act 1, the opening (hub #48; LoreKeeper's format split and critique). Staged before the opening scene's
// dialogue, which still carries every line and the evidence choices. Wordless on purpose: blocking, camera
// and emotes only, so the script is the one source for what's said. The camera lands on the two things the
// players then inspect themselves (critique 1): the closet first, then the front-door lock.
// Played by WorldScene: stage.after('act1_open', ...) when a world starts before the opening is done.
export default {
  id: 'act1_open',
  map: 'room631',
  cast: {
    trevor: { at: [2, 2], face: 'down' },     // his room, by the bed
    michael: { at: [12, 9], face: 'down' },   // the couch
    manuel: { at: [21, 8], face: 'down' },    // asleep at the bench
  },
  steps: [
    { fade: 'in', dur: 0.8 },
    { cam: 'trevor', zoom: 1.4, dur: 0.1 },
    { caption: '2:58 a.m.', es: '2:58 a. m.' },
    { emote: 'trevor', icon: 'angry' },        // the alarm he snoozed
    { walk: 'trevor', to: [6, 2] },
    { face: 'trevor', dir: 'up' },             // the shrimp first, before anything else
    { emote: 'trevor', icon: '...' },
    { cam: 'michael', zoom: 1.4, dur: 1.1 },
    { emote: 'michael', icon: '...' },
    { cam: 'manuel', zoom: 1.4, dur: 1.1 },
    { emote: 'manuel', icon: '...' },
    { walk: 'manuel', to: [[22, 7], [22, 6]] },   // to the closet, the way he does every morning
    { face: 'manuel', dir: 'up' },
    { cam: [22, 4], zoom: 1.7, dur: 1.2 },        // the closet
    { together: [{ emote: 'manuel', icon: '!' }, { shake: 0.003, dur: 0.3 }] },
    { wait: 0.8 },
    { together: [{ cam: [1, 8], zoom: 1.7, dur: 1.6 }, { walk: 'michael', to: [[12, 8], [2, 8]], speed: 56 }] },   // the front door
    { face: 'michael', dir: 'left' },
    { emote: 'michael', icon: '!' },
    { wait: 0.8 },
    { cam: 'cast', zoom: 1, dur: 1 },
  ],
};
