// Engine demo for the in-world cutscene director (src/game/stage.js). Open with ?stage=demo.
// No story here: real cutscene scripts are placed by the Lore Keeper and written as sealed content.
export default {
  id: 'demo',
  cast: { michael: {}, trevor: {}, manuel: {} },
  steps: [
    { cam: 'cast', zoom: 1.25, dur: 1 },
    { emote: 'trevor', icon: '!' },
    { say: 'trevor', text: 'Did you hear that?', es: '¿Escucharon eso?' },
    { together: [{ face: 'michael', dir: 'trevor' }, { face: 'manuel', dir: 'trevor' }] },
    { emote: 'manuel', icon: '?' },
    { say: 'manuel', text: 'Hear what?', es: '¿Qué cosa?' },
    { together: [{ walk: 'trevor', by: [2, 0] }, { walk: 'michael', by: [1, 1] }] },
    { face: 'trevor', dir: 'manuel' },
    { shake: 0.004, dur: 0.4 },
    { emote: 'michael', icon: 'sweat' },
    { say: 'michael', text: 'That. Right there.', es: 'Eso. Justo ahí.' },
    { caption: 'Cutscene engine demo', es: 'Demo del motor de escenas' },
    { cam: 'cast', zoom: 1, dur: 0.8 },
  ],
};
