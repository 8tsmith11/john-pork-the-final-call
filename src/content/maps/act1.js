// Act 1 maps beyond Room 631 (placeholder layouts; gonman's tiles replace the colors).
// Object text here is placeholder world text; the script (task #6) replaces it.
import { makeMap } from './build.js';

export const tunnel1 = makeMap({
  id: 'tunnel_1', name: 'Green Line maintenance tunnel',
  layout: [
    '##################################################',
    '#::::::::::::::######::::::::::::::::::::::::::::#',
    '#::::::::::::::######::::::::::::::######::::::::#',
    '#tttttttttttttttttttttttttttttttttttt######tttttt#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::######::::::::::::::######::::::::::::::#',
    '#::::::::######::::::::::::::######::::::::::::::#',
    '##################################################',
  ],
  spawns: [[2, 1], [2, 2], [3, 1]],
  enemies: [
    ['enemy.rotling', 12, 4], ['enemy.rotling', 14, 1], ['enemy.spitter', 22, 2],
    ['enemy.rotling', 27, 5], ['enemy.rotling', 30, 1], ['enemy.spitter', 38, 4], ['enemy.rotling', 44, 2],
  ],
  objects: [
    { id: 'obj.tunnel_up', x: 1, y: 4, label: 'Ladder up', action: 'exit', to: 'metro_plaza', text: 'Back to the plaza.' },
    { id: 'obj.tunnel_on', x: 48, y: 4, label: 'Toward the platform', action: 'exit', to: 'platform', requiresClear: true,
      text: 'The tunnel opens onto a platform nobody has used in decades. The drumming stops. Something else is here.' },
  ],
});

export const platform = makeMap({
  id: 'platform', name: 'The dead platform beneath College Park',
  layout: [
    '##############################',
    '#::::::::::::::::::::::::::::#',
    '#::::|::::::::::::::::::|::::#',
    '#::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::#',
    '#::::|::::::::::::::::::|::::#',
    '#::::::::::::::::::::::::::::#',
    '#tttttttttttttttttttttttttttt#',
    '##############################',
  ],
  spawns: [[3, 4], [3, 5], [4, 4]],
  enemies: [['boss.warden', 20, 4]],
  objects: [
    { id: 'obj.platform_back', x: 1, y: 3, label: 'Back into the tunnel', action: 'exit', to: 'tunnel_1', text: 'Back the way you came.' },
  ],
});
