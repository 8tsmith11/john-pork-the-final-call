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
    { id: 'obj.whiteboard', x: 6, y: 6, label: 'Whiteboard (what we\'re doing)', action: 'quests' },
    { id: 'obj.coffee', x: 9, y: 6, label: 'Coffee machine', text: 'It makes one cup at a time and judges you for each one. A label in Trevor\'s handwriting: DESCALE ME.' },
    { id: 'obj.tv', x: 13, y: 9, label: 'TV (news)', action: 'tv' },
    { id: 'obj.couch', x: 11, y: 10, label: 'Couch', text: 'The couch came with the apartment. Nobody has ever found the bottom of the cushions. Michael found a 2081 coin in there once and kept it.' },
    { id: 'obj.scooters', x: 3, y: 9, label: 'Scooter dock', text: 'Three scooters on the charging rail: blue, green, red. The red one\'s battery reads 61% and has read 61% for a month.' },
    { id: 'obj.shoes', x: 1, y: 9, label: 'Shoe rack', text: 'Six shoes, two of them matching. Somebody\'s cleats from a sport nobody here plays.' },
    { id: 'obj.plant', x: 14, y: 11, label: 'Plant', text: 'A pothos that has survived three roommates, two rot scares and one week where everyone forgot it existed.' },
    { id: 'obj.house_rules', x: 11, y: 6, label: 'House rules (taped up)', text: '631 HOUSE RULES: 1. Don\'t touch Manuel\'s statues. 2. Don\'t feed the shrimp, Trevor feeds the shrimp. 3. Whoever finishes the mate makes more. 4. No Continuity people in the apartment. 5. (scribbled out) 6. Rookie Aster mistakes are forgiven once.' },
    { id: 'obj.door', x: 0, y: 8, label: 'Front door (hallway)', action: 'exit', to: 'aster_hall', text: 'The sixth-floor hallway. It smells like someone else\'s dinner.' },
    { id: 'obj.statue_1', x: 2, y: 7, label: 'Statue', text: 'One of Manuel\'s John Pork statues, guarding the door. The eyes are very well done.' },
    { id: 'obj.statue_2', x: 2, y: 10, label: 'Statue', text: 'Another statue by the entrance. Its head is turned slightly toward the engineering room. Was it always?' },
    { id: 'obj.statue_3', x: 5, y: 11, label: 'Statue', text: 'The newest statue. Manuel says he finished it last week. He doesn\'t remember sanding it.' },
    { id: 'obj.mate', x: 7, y: 6, label: 'Mate station (heal + refill)', action: 'mate', text: 'Manuel\'s mate gear on the counter. Still warm. Someone was up at 3 a.m.' },
    { id: 'obj.fridge', x: 10, y: 6, label: 'Fridge', text: 'Three energy drinks, half a lemon, a jar labeled DO NOT. Someone has written "I hate 245 lab" in the condensation.' },
    { id: 'obj.table', x: 8, y: 9, label: 'Dining table', text: 'Problem sets, a soldering-burn ring, and a pacifier nobody will explain.' },
    { id: 'obj.stove', x: 12, y: 6, label: 'Stove', text: 'Two burners work. The third one only works if you believe in it.' },
    // Engineering room (east half)
    { id: 'obj.parts_bins', x: 22, y: 6, label: 'Parts bins', text: 'Forty little drawers labeled in three handwritings. One drawer just says "DO NOT" and has been taped shut.' },
    { id: 'obj.lab_board', x: 23, y: 6, label: '245 lab whiteboard', text: 'A half-erased circuit and, in Manuel\'s handwriting: I HATE 245 LAB. Below it, in Trevor\'s: same. Below that, in Michael\'s: she says hi.' },
    { id: 'obj.workbench', x: 20, y: 9, label: 'Workbench', text: 'Calipers, a magnifier lamp, a half-built drone with no rotors, and a cold slice of pizza holding down a schematic.' },
    { id: 'obj.failed_prints', x: 21, y: 11, label: 'Failed prints bin', text: 'Spaghetti plastic, a warped mate gourd, eleven tiny Pork heads at different stages of being wrong.' },
    { id: 'obj.router', x: 28, y: 7, label: 'Router', text: 'Its lights blink in a pattern that\'s almost regular. Every few minutes it reboots for no reason and comes back with a slightly different name.' },
    { id: 'obj.drill_press', x: 27, y: 10, label: 'Drill press', text: 'Bolted to the floor, which the lease definitely does not allow.' },
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
    { id: 'obj.window_latch', x: 19, y: 12, label: 'Balcony door latch', text: 'Locked, and dusty. Nobody came in this way.' },
    { id: 'obj.ottoman', x: 22, y: 13, label: 'Balcony ottoman', flag: 'act1.balloon.noticedGone',
      text: 'The ottoman everyone glances at to check the weather. Dry. Clear. A normal night, apparently.' },
    // Trevor's room + bathroom
    { id: 'obj.bed', x: 2, y: 1, label: 'Trevor\'s bed (save)', action: 'save', text: 'Sleep? The balloon is still missing.' },
    { id: 'obj.shrimp_tank', x: 6, y: 1, label: 'Shrimp tank', text: 'Trevor\'s shrimp. The only clean water in the building. They\'re clustered in the corner away from the window.' },
    { id: 'obj.guitar', x: 7, y: 4, label: 'Guitar', text: 'Trevor\'s guitar. Wood. Out of tune, as is tradition.' },
    { id: 'obj.supplements', x: 1, y: 4, label: 'Supplement shelf', text: 'Magnesium, glycine, creatine, three things with no English on the label. A sticky note: STACK SCHEDULE (DO NOT LET MICHAEL SEE).' },
    { id: 'obj.trevor_mirror', x: 11, y: 1, label: 'Bathroom mirror', text: 'Your reflection. Tired. Normal. You watch it a second longer than you meant to.' },
    { id: 'obj.trevor_pc', x: 4, y: 1, label: 'Trevor\'s computer', action: 'pages', pages: [
      'INBOX (3 unread)\n\nFrom: 245 Lab TA\nSubject: Lab 7 regrade\n"Your oscilloscope traces are fine. Your report says the signal \'feels haunted.\' Please revise."',
      'From: ASTER Building Management\nSubject: Rot abatement scheduled\n"Abatement crews will be on floors 4–7 this week. Please keep pets and unattested devices out of hallways."',
      'From: Mom\nSubject: (no subject)\n"Are you eating actual food? Not powders? Call me."' ] },
    { id: 'obj.dumbbells', x: 5, y: 4, label: 'Dumbbells', text: 'Two adjustable dumbbells and a printed log of every set since March. The log is more consistent than any of his lab reports.' },
    { id: 'obj.trevor_shower', x: 13, y: 2, label: 'Shower', text: 'The water comes out warm for exactly four minutes. Trevor has a timer on the wall.' },
    { id: 'obj.michael_desk', x: 16, y: 4, label: 'Michael\'s desk', action: 'pages', pages: [
      'A framed photo on the desk, turned so it faces the bed. Michael and a girl in a yellow raincoat, both laughing at something outside the frame.',
      'DRAFTS (1)\nTo: her\n"saw a guy on the metro with your exact umbrella. almost said something. anyway. call me back when you can."\n\n(Unsent. Dated four months ago.)' ] },
    { id: 'obj.manuel_table', x: 19, y: 4, label: 'Manuel\'s sculpting table', text: 'Clay, wire loops, a mate gourd full of water for wetting the clay. A half-finished hand, very well made. Manuel says it\'s for a statue. He hasn\'t said whose.' },
    { id: 'obj.mate_shelf', x: 19, y: 1, label: 'Mate shelf', text: 'Seven gourds, three bombillas, a bag of yerba with a hand-written label from Buenos Aires. One gourd is old and carved. Nobody drinks from that one.' },
    { id: 'obj.mm_shower', x: 28, y: 2, label: 'Shower', text: 'Two shampoo bottles, one of them clearly Michael\'s, one of them clearly also Michael\'s.' },
    { id: 'obj.hamper', x: 25, y: 4, label: 'Laundry hamper', text: 'Overflowing. A sock has achieved independence and is living on the tile.' },
    { id: 'obj.balcony_plants', x: 16, y: 13, label: 'Balcony planters', text: 'Basil, mint, and something Manuel calls "the herb" that is definitely just a weed.' },
    { id: 'obj.balcony_view', x: 27, y: 13, label: 'View of the metro', text: 'From up here you can see the College Park station, the dead Purple Line platform, and Route 1 running north into the dark. Sometimes, late, lights move out there that aren\'t trains.' },
    // Michael & Manuel's room + bathroom
    { id: 'obj.bed_michael', x: 17, y: 1, label: 'Michael\'s bed', text: 'Michael\'s side. A phone charger, a photo turned face-down, a sweatshirt that isn\'t his size.' },
    { id: 'obj.bed_manuel', x: 21, y: 1, label: 'Manuel\'s bed', text: 'Manuel\'s side. Sculpting tools, a carved gourd, a postcard from Buenos Aires pinned above the pillow.' },
    { id: 'obj.manuel_closet', x: 22, y: 4, label: 'Manuel\'s closet', flag: 'act1.balloon.noticedGone',
      text: 'Manuel\'s closet, door open. A length of orange ribbon still knotted around the clothes rail. Cut clean. The balloon is gone.' },
    { id: 'obj.front_lock', x: 1, y: 7, label: 'Front-door lock', flag: 'act1.clue.lockForced',
      text: 'The deadbolt plate is bent and the strike is splintered. Someone forced it from the hallway side, quietly, and pulled the door shut behind them.' },
    { id: 'obj.mm_mirror', x: 26, y: 1, label: 'Bathroom mirror', text: 'Two toothbrushes and a third one nobody claims.' },
  ],
});
