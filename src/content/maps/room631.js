// Room 631, ASTER (the base). Placeholder layout until gonman's tiles land.
// Legend: # wall, . floor, b balcony floor, = window/rail (solid), D door (exit to hallway),
// Objects are listed separately so they can carry ids, text, and flags.
import { TILE } from '../../engine/sim.js';

const LAYOUT = [
  '##########################',
  '#........#......#........#',
  '#........#......#........#',
  '#........#......#........#',
  '#........................#',
  '#........#......#........#',
  '####.#####......######.###',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '#........................#',
  '###########====###########',
  '#bbbbbbbbbbbbbbbbbbbbbbbb#',
  '##########################',
];

// Balcony is reached through the gap in the window wall (placeholder: a door tile).
LAYOUT[12] = '###########=..=###########';

export const room631 = {
  id: 'room631',
  name: 'Room 631, ASTER',
  w: LAYOUT[0].length,
  h: LAYOUT.length,
  layout: LAYOUT,
  spawns: [{ x: 6 * TILE, y: 9 * TILE }, { x: 9 * TILE, y: 9 * TILE }, { x: 12 * TILE, y: 9 * TILE }],
  solid(tx, ty) {
    if (ty < 0 || tx < 0 || ty >= this.h || tx >= this.w) return true;
    const ch = this.layout[ty][tx];
    return ch === '#' || ch === '=';
  },
  // Interactables. `text` is placeholder; gonman's script (task #6) replaces it.
  objects: [
    { id: 'obj.pork_flag', x: 12, y: 7, label: 'John Pork flag', solid: false,
      text: 'The flag. Contraband since 2071. Manuel ironed it once, which is the most domestic thing anyone in 631 has ever done.' },
    { id: 'obj.statue_1', x: 4, y: 8, label: 'Statue', text: 'One of Manuel\'s John Pork statues. The eyes are very well done.' },
    { id: 'obj.statue_2', x: 20, y: 8, label: 'Statue', text: 'Another statue. Its head is turned slightly toward the window. Was it always?' },
    { id: 'obj.statue_3', x: 13, y: 11, label: 'Statue', text: 'The newest statue. Manuel says he finished it last week. He doesn\'t remember sanding it.' },
    { id: 'obj.printer_1', x: 2, y: 2, label: 'Fab #1', text: 'Fab #1. Cold. A failed print of a yerba mate gourd.' },
    { id: 'obj.printer_2', x: 4, y: 2, label: 'Fab #2', text: 'Fab #2. Cold. The bed is clean.' },
    { id: 'obj.printer_3', x: 6, y: 2, label: 'Fab #3', flag: 'act1.clue.printer3Warm',
      text: 'Fab #3. Warm. The job queue lists one print. Nobody here submitted it.' },
    { id: 'obj.ottoman', x: 12, y: 13, label: 'Balcony ottoman', flag: 'act1.balloon.noticedGone',
      text: 'The ottoman everyone glances at to check the weather. The ribbon is still tied to the leg. It was cut clean.' },
    { id: 'obj.window_latch', x: 14, y: 12, label: 'Window latch', flag: 'act1.clue.latchInside',
      text: 'The balcony latch. It was opened from the inside.' },
    { id: 'obj.shrimp_tank', x: 22, y: 2, label: 'Shrimp tank', text: 'Trevor\'s shrimp. The only clean water in the building. They\'re clustered in the corner away from the window.' },
    { id: 'obj.guitar', x: 23, y: 4, label: 'Guitar', text: 'Trevor\'s guitar. Wood. Out of tune, as is tradition.' },
    { id: 'obj.mate', x: 10, y: 7, label: 'Mate station', text: 'Manuel\'s mate. Still warm. Someone was up at 3 a.m.' },
    { id: 'obj.oscilloscope', x: 8, y: 2, label: 'Oscilloscope', text: 'A live trace, faint and regular. Like a heartbeat. Or a drum.' },
    { id: 'obj.bed', x: 19, y: 2, label: 'Bed (save)', action: 'save', text: 'Sleep? The balloon is still missing. (Game saved.)' },
    { id: 'obj.door', x: 0, y: 9, label: 'Door to hallway', action: 'exit', to: 'aster_hall', text: 'The sixth-floor hallway. It smells like someone else\'s dinner.' },
  ],
};
