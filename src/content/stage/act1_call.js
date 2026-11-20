// Act 1, the Call (hub #48). Staged when the party reaches the tunnels, before the phone takes over the screen
// (WorldScene._hackCall) and the scene's host-synced ANSWER / DECLINE choice. Wordless: the party freezes,
// looks at their phones, then at each other. Positions are relative, so it plays wherever they stand.
export default {
  id: 'act1_call',
  map: 'tunnel_1',
  cast: { michael: {}, trevor: {}, manuel: {} },
  steps: [
    { shake: 0.002, dur: 0.5 },
    { together: [{ emote: 'michael', icon: '!' }, { emote: 'trevor', icon: '!' }, { emote: 'manuel', icon: '!' }] },
    { cam: 'cast', zoom: 1.3, dur: 0.8 },
    { together: [{ face: 'michael', dir: 'down' }, { face: 'trevor', dir: 'down' }, { face: 'manuel', dir: 'down' }] },   // every phone at once
    { wait: 0.7 },
    { together: [{ face: 'manuel', dir: 'trevor' }, { face: 'trevor', dir: 'michael' }, { face: 'michael', dir: 'manuel' }] },
    { emote: 'manuel', icon: '?' },
    { emote: 'michael', icon: 'sweat' },
    { wait: 0.4 },
  ],
};
