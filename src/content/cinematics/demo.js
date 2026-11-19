// Engine demo for CinematicScene (open with ?cinematic=demo). No story here: real shot lists for
// the act cutscenes are written by the script owner (gonman) in this folder, one file per cutscene.
export default {
  id: 'demo',
  shots: [
    { bg: 'black', dur: 2, title: 'College Park, 2098', fade: 'out' },
    { bg: 'skyline_night', dur: 5, cam: { from: { x: 0, zoom: 1 }, to: { x: 200, zoom: 1.08 } } },
    { bg: 'skyline_night', dur: 4, cam: { from: { x: 120, zoom: 1.25 }, to: { x: 150, zoom: 1.3 } },
      cast: [{ who: 'trevor', x: 330, face: 'right', to: 390 }, { who: 'michael', x: 300, face: 'right', to: 360 }, { who: 'manuel', x: 270, face: 'right', to: 330 }],
      say: { who: 'manuel', text: 'Is it always this quiet at three in the morning?', es: '¿Siempre está así de tranquilo a las tres de la mañana?' }, fade: 'out' },
    { bg: 'tunnel', dur: 4, cam: { from: { x: 240, zoom: 1.4 }, to: { x: 120, zoom: 1 } },
      cast: [{ who: 'trevor', x: 300, face: 'left' }],
      say: { who: 'trevor', text: 'Stay close. Lights on.', es: 'No se separen. Luces prendidas.' }, fade: 'out' },
  ],
};
