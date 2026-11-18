// Act 1 maps beyond Room 631 (placeholder layouts; gonman's tiles replace the colors).
// Object text here is placeholder world text; the script (task #6) replaces it.
import { makeMap } from './build.js';

export const asterHall = makeMap({
  id: 'aster_hall', name: 'ASTER, 6th floor',
  layout: [
    '##############################',
    '#............................#',
    '#............................#',
    '#............................#',
    '##############################',
  ],
  spawns: [[2, 2], [3, 2], [2, 3]],
  objects: [
    { id: 'obj.door_631', x: 1, y: 1, label: 'Room 631', action: 'exit', to: 'room631', text: 'Home.' },
    { id: 'obj.bathroom', x: 10, y: 1, label: 'Bathroom (occupied)', text: '"One minute!"', knock: true },
    { id: 'obj.graffiti', x: 15, y: 1, label: 'Graffiti', text: 'Three hands, three paints: FREE JOHN PORK. JUSTICE FOR JOHN PORK. TIM CHEESE WILL PAY. Someone has crossed out the first one, then uncrossed it.' },
    { id: 'obj.lobby_monitor', x: 24, y: 1, label: 'Security monitor (rotted)', talk: 'lead_c_footage' },
    { id: 'obj.clock_6f', x: 20, y: 1, label: 'Hallway clock', text: 'It reads 19:01. It has read 19:01 since you moved in.' },
    { id: 'obj.elevator', x: 28, y: 2, label: 'Elevator', action: 'exit', to: 'metro_plaza', text: 'The elevator thinks about it, then goes down.' },
  ],
});

export const metroPlaza = makeMap({
  id: 'metro_plaza', name: 'College Park metro plaza',
  layout: [
    '########################################',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,,,,,|,,,,,,,,,,,|,,,,,,,,,,,|,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#gggg,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,gggg#',
    '#gggg,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,gggg#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,,,,,|,,,,,,,,,,,|,,,,,,,,,,,|,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '########################################',
  ],
  spawns: [[3, 2], [4, 2], [3, 3]],
  objects: [
    { id: 'obj.aster_door', x: 2, y: 1, label: 'ASTER lobby', action: 'exit', to: 'aster_hall', text: 'Back up to the sixth floor.' },
    { id: 'npc.rotter_1', x: 12, y: 6, label: 'Rotter', npc: true, text: 'code rot. code rot. code rot.' },
    { id: 'npc.rotter_2', x: 25, y: 2, label: 'Rotter', npc: true, text: 'code rot. no one can code faster than. code rot.' },
    { id: 'npc.rotter_3', x: 33, y: 8, label: 'Rotter (looks at you differently)', npc: true,
      text: 'code rot. code rot. ...I used to be someone\'s favorite person. code rot.' },
    { id: 'npc.halvard', x: 6, y: 8, label: 'Shuttered phone-repair stall', npc: true, talk: 'lead_b_halvard' },
    { id: 'obj.billboard', x: 20, y: 1, label: 'Billboard', text: 'A Slop Decades billboard, peeling: "AT THE END OF THE DAY, NO ONE CAN CODE FASTER THAN AI."' },
    { id: 'obj.purple_sign', x: 30, y: 1, label: 'Purple Line sign', text: 'PURPLE LINE: OPENING SOON.' },
    { id: 'obj.grate', x: 36, y: 9, label: 'Storm grate', action: 'exit', floor: true, to: 'tunnel_1', text: 'The grate lifts. Somewhere below, very faintly, something is drumming.' },
  ],
});

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
  objects: [],
});
