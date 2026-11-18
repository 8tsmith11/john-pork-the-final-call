// Room 631, ASTER (the base).
//   Top-left: Trevor's room + his bathroom.  Top-right: Michael & Manuel's shared room + bathroom.
//   Middle: one big room. West half = kitchen/dining (the apartment entrance and the statues),
//   east half = the engineering room (fabs, bench gear, the flag on the wall), with the balcony
//   opening off it to the south.
import { makeMap } from './build.js';

const LAYOUT = [
  '##############################',   // 0
  '#.......#wwwww##.......#wwwww#',   // 1  Trevor room | Trevor bath || M&M room | M&M bath
  '#.......#wwwww##.......#wwwww#',   // 2
  '#..............#..............#'.slice(0, 30),
  '#.......#wwwww##.......#wwwww#',   // 4
  '####.###########.....#########',   // 5  doors into the middle room
  '#kkkkkkkkkkkkkkeeeeeeeeeeeeee#',   // 6
  '#kkkkkkkkkkkkkkeeeeeeeeeeeeee#',   // 7
  '.kkkkkkkkkkkkkkeeeeeeeeeeeeee#',   // 8  apartment entrance (west wall)
  '#kkkkkkkkkkkkkkeeeeeeeeeeeeee#',   // 9
  '#kkkkkkkkkkkkkkeeeeeeeeeeeeee#',   // 10
  '#kkkkkkkkkkkkkkeeeeeeeeeeeeee#',   // 11
  '################===....===####',   // 12 balcony opening off the engineering room
  '###############bbbbbbbbbbbbbb#',   // 13 balcony
  '##############################',   // 14
];
// Row 3: doorways between each bedroom and its bathroom; the two suites are separate.
LAYOUT[3] = '#' + '.'.repeat(7) + 'w'.repeat(6) + '##' + '.'.repeat(7) + 'w'.repeat(6) + '#';
LAYOUT[5] = '####.#################.#######';

export const room631 = makeMap({
  id: 'room631',
  name: 'Room 631, ASTER',
  layout: LAYOUT,
  spawns: [[5, 8], [7, 9], [9, 8]],
  objects: [
    // Interior doors (closed until opened)
    { id: 'door.trevor_room', x: 4, y: 5, label: 'Trevor\'s door', door: true },
    { id: 'door.mm_room', x: 22, y: 5, label: 'Michael & Manuel\'s door', door: true },
    { id: 'door.trevor_bath', x: 8, y: 3, label: 'Bathroom door', door: true },
    { id: 'door.mm_bath', x: 23, y: 3, label: 'Bathroom door', door: true },
    // Kitchen / dining (west half)
    { id: 'obj.door', x: 0, y: 8, label: 'Front door (hallway)', action: 'exit', to: 'aster_hall', text: 'The sixth-floor hallway. It smells like someone else\'s dinner.' },
    { id: 'obj.statue_1', x: 2, y: 6, label: 'Statue', text: 'One of Manuel\'s John Pork statues, guarding the door. The eyes are very well done.' },
    { id: 'obj.statue_2', x: 2, y: 10, label: 'Statue', text: 'Another statue by the entrance. Its head is turned slightly toward the engineering room. Was it always?' },
    { id: 'obj.statue_3', x: 3, y: 11, label: 'Statue', text: 'The newest statue. Manuel says he finished it last week. He doesn\'t remember sanding it.' },
    { id: 'obj.mate', x: 7, y: 6, label: 'Mate station', text: 'Manuel\'s mate gear on the counter. Still warm. Someone was up at 3 a.m.' },
    { id: 'obj.fridge', x: 10, y: 6, label: 'Fridge', text: 'Three energy drinks, half a lemon, a jar labeled DO NOT. Someone has written "I hate 245 lab" in the condensation.' },
    { id: 'obj.table', x: 8, y: 9, label: 'Dining table', text: 'Problem sets, a soldering-burn ring, and a pacifier nobody will explain.' },
    { id: 'obj.stove', x: 12, y: 6, label: 'Stove', text: 'Two burners work. The third one only works if you believe in it.' },
    // Engineering room (east half)
    { id: 'obj.pork_flag', x: 26, y: 5, label: 'John Pork flag', text: 'The flag on the engineering-room wall. Contraband since 2071. Someone ironed it once, which is the most domestic thing anyone in 631 has ever done.' },
    { id: 'obj.printer_1', x: 16, y: 6, label: 'Fab #1 (print a helium sniffer)', talk: 'lead_a_helium' },
    { id: 'obj.printer_2', x: 18, y: 6, label: 'Fab #2 (print gear)', action: 'fab', text: '' },
    { id: 'obj.printer_3', x: 20, y: 6, label: 'Fab #3', flag: 'act1.clue.printer3Warm',
      text: 'Fab #3. Warm. The job queue lists one print. Nobody here submitted it.' },
    { id: 'obj.oscilloscope', x: 25, y: 6, label: 'Oscilloscope', text: 'A live trace, faint and regular. Like a heartbeat. Or a drum.' },
    { id: 'obj.microscope', x: 27, y: 7, label: 'Microscope', text: 'A slide still clipped in: a sliver of orange latex. Manuel was looking at the balloon.' },
    { id: 'obj.degasser', x: 28, y: 9, label: 'Degassing chamber', text: 'The vacuum chamber for resin. The gauge needle twitches when nobody is near it.' },
    { id: 'obj.solder', x: 24, y: 10, label: 'Soldering station', text: 'Iron still in its stand. Drills, flux, a half-built sensor board.' },
    { id: 'obj.dehumidifier', x: 17, y: 11, label: 'Dehumidifier', text: 'Running full blast. The printers hate humidity. So does Manuel.' },
    // Balcony
    { id: 'obj.window_latch', x: 19, y: 12, label: 'Balcony door latch', flag: 'act1.clue.latchInside', text: 'The balcony latch. It was opened from the inside.' },
    { id: 'obj.ottoman', x: 22, y: 13, label: 'Balcony ottoman', flag: 'act1.balloon.noticedGone',
      text: 'The ottoman everyone glances at to check the weather. The ribbon is still tied to the leg. It was cut clean.' },
    // Trevor's room + bathroom
    { id: 'obj.bed', x: 2, y: 1, label: 'Trevor\'s bed (save)', action: 'save', text: 'Sleep? The balloon is still missing.' },
    { id: 'obj.shrimp_tank', x: 6, y: 1, label: 'Shrimp tank', text: 'Trevor\'s shrimp. The only clean water in the building. They\'re clustered in the corner away from the window.' },
    { id: 'obj.guitar', x: 7, y: 4, label: 'Guitar', text: 'Trevor\'s guitar. Wood. Out of tune, as is tradition.' },
    { id: 'obj.supplements', x: 1, y: 4, label: 'Supplement shelf', text: 'Magnesium, glycine, creatine, three things with no English on the label. A sticky note: STACK SCHEDULE (DO NOT LET MICHAEL SEE).' },
    { id: 'obj.trevor_mirror', x: 11, y: 1, label: 'Bathroom mirror', text: 'Your reflection. Tired. Normal. You watch it a second longer than you meant to.' },
    // Michael & Manuel's room + bathroom
    { id: 'obj.bed_michael', x: 17, y: 1, label: 'Michael\'s bed', text: 'Michael\'s side. A phone charger, a photo turned face-down, a sweatshirt that isn\'t his size.' },
    { id: 'obj.bed_manuel', x: 21, y: 1, label: 'Manuel\'s bed', text: 'Manuel\'s side. Sculpting tools, a carved gourd, a postcard from Buenos Aires pinned above the pillow.' },
    { id: 'obj.mm_mirror', x: 26, y: 1, label: 'Bathroom mirror', text: 'Two toothbrushes and a third one nobody claims.' },
  ],
});
