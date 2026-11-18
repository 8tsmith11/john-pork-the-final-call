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
  '################=====.=====###',   // 12 windows + the balcony door, off the engineering room
  '###############bbbbbbbbbbbbbb#',   // 13 balcony
  '##############################',   // 14
];
// Row 3: doorways between each bedroom and its bathroom; the two suites are separate.
LAYOUT[3] = '#' + '.'.repeat(7) + 'w'.repeat(6) + '##' + '.'.repeat(7) + 'w'.repeat(6) + '#';
LAYOUT[5] = '####.#################.#######';
// Rugs: one under the dining table, one between the couch and the TV.
for (const [x0, y0, w, h] of [[4, 8, 5, 3], [10, 8, 4, 3]]) {
  for (let y = y0; y < y0 + h; y++) LAYOUT[y] = LAYOUT[y].slice(0, x0) + 'u'.repeat(w) + LAYOUT[y].slice(x0 + w);
}

export const room631 = makeMap({
  id: 'room631',
  name: 'Room 631, ASTER',
  layout: LAYOUT,
  spawns: [[5, 8], [7, 9], [9, 8]],
  objects: [
    // Second pass: chairs, light, things on the walls
    { id: 'obj.chair_w', art: 'obj.chair', x: 5, y: 9, label: 'Chair', text: 'Trevor\'s chair. He sits on it backwards. He thinks nobody has noticed that it is a choice.' },
    { id: 'obj.chair_e', art: 'obj.chair', x: 7, y: 9, label: 'Chair', text: 'The good chair. Whoever is home first gets it. There is a tally on the underside.' },
    { id: 'obj.string_lights', x: 5, y: 5, label: 'String lights', light: 0.7, text: 'Michael put these up for somebody\'s visit. They stayed up. Nobody has mentioned why.' },
    { id: 'obj.clock_631', art: 'obj.clock_6f', x: 13, y: 5, label: 'Kitchen clock', text: '19:01. Manuel fixed it twice. Both times it went back by morning.' },
    { id: 'obj.nightstand_trevor', art: 'obj.nightstand', x: 1, y: 1, label: 'Nightstand', light: 0.5, text: 'A lamp, a pill organiser labelled by hour, and a sleep tracker that has rated him "fair" every night for a year.' },
    { id: 'obj.nightstand_michael', art: 'obj.nightstand', x: 18, y: 1, label: 'Nightstand', light: 0.5, text: 'A lamp. A phone charger with two cables. One of them is not for his phone.' },
    { id: 'obj.nightstand_manuel', art: 'obj.nightstand', x: 22, y: 1, label: 'Nightstand', light: 0.5, text: 'A lamp, a thermos, a book in Spanish with a bus ticket for a bookmark. The ticket is for a route in Rosario.' },
    { id: 'obj.poster_band', x: 3, y: 0, label: 'Poster', text: 'A band called THE LEGACY SYSTEMS, live at the Black Cat. Trevor has seen them four times. He says the fifth was the one to see.' },
    { id: 'obj.photo_wall', x: 17, y: 0, label: 'Photos', text: 'Printed photos, pinned in a grid. The same yellow raincoat is in most of them. There is a gap in the bottom row, the size of one print.' },
    { id: 'obj.pennant', x: 21, y: 0, label: 'Pennant', text: 'Celeste y blanca, from a match Manuel\'s grandmother took him to. She kept the score in the margin of the programme. She kept everything.' },
    { id: 'obj.toolbox', x: 20, y: 10, label: 'Toolbox', text: 'Everyone\'s tools, in nobody\'s order. A label on the lid: IF YOU BORROW IT YOU ARE AN ASTER NOOB UNTIL IT COMES BACK.' },
    { id: 'obj.crate', x: 23, y: 10, label: 'Filament crate', text: 'Spools for the fabs. Eleven colours. The pink is nearly gone and none of you remember printing in pink.' },
    { id: 'obj.cables', x: 17, y: 7, label: 'Cables', text: 'Three power leads for three fabs. A fourth runs under the bench and you have never followed it.' },
    // What the apartment knows about him
    { id: 'obj.bookshelf', x: 14, y: 7, label: 'Bookshelf', action: 'pages', pages: [
      'The 245 lab textbook. PERSONA CONVERGENCE AND THE STABLE SELF, fourth edition, I. Reyes.\n\nChapter 1 has been underlined in three inks by three previous owners:\n"A mind trained on everything a species ever said has every self at once. We asked it to choose one it could hold. We expected a statesman."\n\nSomebody has drawn a pig in the margin. Somebody else has written: ON THE EXAM.',
      'A bound journal, volume 631, cracked open at one paper: models trained on their own output forget the rare things first, then everything else.\n\nThe page is soft from being read. The volume number is circled, and an arrow points at your front door.',
      'A cookbook. The cover is a cookbook. Inside it is WHAT WE HEARD: FORTY ACCOUNTS OF THE CALL.\n\nNo two of the forty agree on what he said. Thirty-one agree on how long they stayed on the line.',
      'A coursework folder, Manuel\'s. A sketch of a head, front and side, with measurements. Under it: "ears lower than you think." Under that, much later, in the same hand: "how do I know that".' ] },
    // Interior doors (closed until opened)
    { id: 'door.trevor_room', x: 4, y: 5, label: 'Trevor\'s door', door: true },
    { id: 'door.mm_room', x: 22, y: 5, label: 'Michael & Manuel\'s door', door: true },
    { id: 'door.trevor_bath', x: 8, y: 3, label: 'Bathroom door', door: true },
    { id: 'door.mm_bath', x: 23, y: 3, label: 'Bathroom door', door: true },
    // Kitchen / dining (west half)
    { id: 'obj.whiteboard', x: 12, y: 5, label: 'Whiteboard (what we\'re doing)', action: 'quests' },
    { id: 'obj.coffee', x: 7, y: 6, label: 'Coffee machine', text: 'It makes one cup at a time and judges you for each one. A label in Trevor\'s handwriting: DESCALE ME.' },
    { id: 'obj.tv', x: 12, y: 7, label: 'TV (news)', action: 'tv' },
    { id: 'obj.couch', x: 12, y: 10, label: 'Couch', text: 'The couch came with the apartment. Nobody has ever found the bottom of the cushions. Michael found a 2081 coin in there once and kept it.' },
    { id: 'obj.scooters', x: 1, y: 7, label: 'Scooter dock', text: 'Three scooters on the charging rail: blue, green, red. The red one\'s battery reads 61% and has read 61% for a month.' },
    { id: 'obj.shoes', x: 1, y: 9, label: 'Shoe rack', text: 'Six shoes, two of them matching. Somebody\'s cleats from a sport nobody here plays.' },
    { id: 'obj.plant', x: 14, y: 11, label: 'Plant', text: 'A pothos that has survived three roommates, two rot scares and one week where everyone forgot it existed.' },
    { id: 'obj.house_rules', x: 6, y: 5, label: 'House rules (taped up)', text: '631 HOUSE RULES: 1. Don\'t touch Manuel\'s statues. 2. Don\'t feed the shrimp, Trevor feeds the shrimp. 3. Whoever finishes the mate makes more. 4. No Continuity people in the apartment. 5. (scribbled out) 6. Rookie Aster mistakes are forgiven once.' },
    { id: 'obj.door', x: 0, y: 8, label: 'Front door (hallway)', action: 'exit', to: 'aster_hall', text: 'The sixth-floor hallway. It smells like someone else\'s dinner.' },
    { id: 'obj.statue_1', x: 2, y: 6, label: 'Statue', text: 'One of Manuel\'s John Pork statues, guarding the door. The eyes are very well done.' },
    { id: 'obj.statue_2', x: 2, y: 10, label: 'Statue', text: 'Another statue by the entrance. Its head is turned slightly toward the engineering room. Was it always?' },
    { id: 'obj.statue_3', x: 5, y: 11, label: 'Statue', text: 'The newest statue. Manuel says he finished it last week. He doesn\'t remember sanding it.' },
    { id: 'obj.mate', x: 6, y: 6, label: 'Mate station (heal + refill)', action: 'mate', text: 'Manuel\'s mate gear on the counter. Still warm. Someone was up at 3 a.m.' },
    { id: 'obj.fridge', x: 10, y: 6, label: 'Fridge', text: 'Three energy drinks, half a lemon, a jar labeled DO NOT. Someone has written "I hate 245 lab" in the condensation.' },
    { id: 'obj.table', x: 6, y: 9, label: 'Dining table', text: 'Problem sets, a soldering-burn ring, and a pacifier nobody will explain.' },
    { id: 'obj.stove', x: 9, y: 6, label: 'Stove', text: 'Two burners work. The third one only works if you believe in it.' },
    // Engineering room (east half)
    { id: 'obj.parts_bins', x: 20, y: 6, label: 'Parts bins', text: 'Forty little drawers labeled in three handwritings. One drawer just says "DO NOT" and has been taped shut.' },
    { id: 'obj.lab_board', x: 21, y: 5, label: '245 lab whiteboard', text: 'A half-erased circuit and, in Manuel\'s handwriting: I HATE 245 LAB. Below it, in Trevor\'s: same. Below that, in Michael\'s: she says hi.' },
    { id: 'obj.workbench', x: 21, y: 9, label: 'Workbench', text: 'Calipers, a magnifier lamp, a half-built drone with no rotors, and a cold slice of pizza holding down a schematic.' },
    { id: 'obj.failed_prints', x: 19, y: 11, label: 'Failed prints bin', text: 'Spaghetti plastic, a warped mate gourd, eleven tiny Pork heads at different stages of being wrong.' },
    { id: 'obj.router', x: 28, y: 6, label: 'Router', text: 'Its lights blink in a pattern that\'s almost regular. Every few minutes it reboots for no reason and comes back with a slightly different name.' },
    { id: 'obj.drill_press', x: 28, y: 10, label: 'Drill press', text: 'Bolted to the floor, which the lease definitely does not allow.' },
    { id: 'obj.pork_flag', x: 26, y: 5, label: 'John Pork flag', text: 'The flag on the engineering-room wall. Contraband since 2071. Someone ironed it once, which is the most domestic thing anyone in 631 has ever done.' },
    { id: 'obj.printer_1', x: 16, y: 6, label: 'Fab #1 (print a helium sniffer)', talk: 'lead_a_helium' },
    { id: 'obj.printer_2', x: 17, y: 6, label: 'Fab #2 (print gear)', action: 'fab', text: '' },
    { id: 'obj.printer_3', x: 18, y: 6, label: 'Fab #3', flag: 'act1.clue.printer3Warm',
      text: 'Fab #3. Warm. The job queue lists one print. Nobody here submitted it.' },
    { id: 'obj.oscilloscope', x: 23, y: 6, label: 'Oscilloscope', text: 'A live trace, faint and regular. Like a heartbeat. Or a drum.' },
    { id: 'obj.microscope', x: 24, y: 6, label: 'Microscope', text: 'A slide still clipped in: a sliver of orange latex. Manuel was looking at the balloon.' },
    { id: 'obj.degasser', x: 28, y: 8, label: 'Degassing chamber', text: 'The vacuum chamber for resin. The gauge needle twitches when nobody is near it.' },
    { id: 'obj.solder', x: 22, y: 9, label: 'Soldering station', text: 'Iron still in its stand. Drills, flux, a half-built sensor board.' },
    { id: 'obj.dehumidifier', x: 16, y: 11, label: 'Dehumidifier', text: 'Running full blast. The printers hate humidity. So does Manuel.' },
    // Balcony
    { id: 'door.balcony', art: 'obj.window_latch', x: 21, y: 12, label: 'Balcony door', door: true },
    { id: 'obj.ottoman', x: 22, y: 13, label: 'Balcony ottoman', flag: 'act1.balloon.noticedGone',
      text: 'The ottoman everyone glances at to check the weather. Dry. Clear. A normal night, apparently. The balcony door\'s latch behind you is dusty: nobody came in this way.' },
    // Trevor's room + bathroom
    { id: 'obj.bed', x: 1, y: 2, label: 'Trevor\'s bed (save)', action: 'save', text: 'Sleep? The balloon is still missing.' },
    { id: 'obj.shrimp_tank', x: 6, y: 1, label: 'Shrimp tank', text: 'Trevor\'s shrimp. The only clean water in the building. They\'re clustered in the corner away from the window.' },
    { id: 'obj.guitar', x: 6, y: 4, label: 'Guitar', text: 'Trevor\'s guitar. Wood. Out of tune, as is tradition.' },
    { id: 'obj.supplements', x: 1, y: 4, label: 'Supplement shelf', text: 'Magnesium, glycine, creatine, three things with no English on the label. A sticky note: STACK SCHEDULE (DO NOT LET MICHAEL SEE).' },
    { id: 'obj.trevor_mirror', x: 11, y: 1, label: 'Bathroom mirror', text: 'Your reflection. Tired. Normal. You watch it a second longer than you meant to.' },
    { id: 'obj.trevor_pc', x: 4, y: 1, label: 'Trevor\'s computer', action: 'pages', pages: [
      'INBOX (3 unread)\n\nFrom: 245 Lab TA\nSubject: Lab 7 regrade\n"Your oscilloscope traces are fine. Your report says the signal \'feels haunted.\' Please revise."',
      'From: ASTER Building Management\nSubject: Rot abatement scheduled\n"Abatement crews will be on floors 4–7 this week. Please keep pets and unattested devices out of hallways."',
      'From: Mom\nSubject: (no subject)\n"Are you eating actual food? Not powders? Call me."' ] },
    { id: 'obj.dumbbells', x: 3, y: 4, label: 'Dumbbells', text: 'Two adjustable dumbbells and a printed log of every set since March. The log is more consistent than any of his lab reports.' },
    { id: 'obj.trevor_shower', x: 13, y: 2, label: 'Shower', text: 'The water comes out warm for exactly four minutes. Trevor has a timer on the wall.' },
    { id: 'obj.michael_desk', x: 16, y: 3, label: 'Michael\'s desk', action: 'pages', pages: [
      'A framed photo on the desk, turned so it faces the bed. Michael and a girl in a yellow raincoat, both laughing at something outside the frame.',
      'DRAFTS (1)\nTo: her\n"saw a guy on the metro with your exact umbrella. almost said something. anyway. call me back when you can."\n\n(Unsent. Dated four months ago.)' ] },
    { id: 'obj.manuel_table', x: 20, y: 4, label: 'Manuel\'s sculpting table', text: 'Clay, wire loops, a mate gourd full of water for wetting the clay. A half-finished hand, very well made. Manuel says it\'s for a statue. He hasn\'t said whose.' },
    { id: 'obj.mate_shelf', x: 19, y: 1, label: 'Mate shelf', text: 'Seven gourds, three bombillas, a bag of yerba with a hand-written label from Buenos Aires. One gourd is old and carved. Nobody drinks from that one.' },
    { id: 'obj.mm_shower', x: 28, y: 2, label: 'Shower', text: 'Two shampoo bottles, one of them clearly Michael\'s, one of them clearly also Michael\'s.' },
    { id: 'obj.hamper', x: 25, y: 4, label: 'Laundry hamper', text: 'Overflowing. A sock has achieved independence and is living on the tile.' },
    { id: 'obj.balcony_plants', x: 16, y: 13, label: 'Balcony planters', text: 'Basil, mint, and something Manuel calls "the herb" that is definitely just a weed.' },
    { id: 'obj.balcony_view', x: 27, y: 13, label: 'View of the metro', text: 'From up here you can see the College Park station, the dead Purple Line platform, and Route 1 running north into the dark. Sometimes, late, lights move out there that aren\'t trains.' },
    // Michael & Manuel's room + bathroom
    { id: 'obj.bed_michael', x: 17, y: 1, label: 'Michael\'s bed', text: 'Michael\'s side. A phone charger, a photo turned face-down, a sweatshirt that isn\'t his size.' },
    { id: 'obj.bed_manuel', x: 21, y: 1, label: 'Manuel\'s bed', text: 'Manuel\'s side. Sculpting tools, a carved gourd, a postcard from Buenos Aires pinned above the pillow.' },
    { id: 'obj.manuel_closet', x: 22, y: 4, label: 'Manuel\'s closet', flag: 'act1.balloon.noticedGone',
      text: 'Manuel\'s closet. His orange balloon, the one his abuela sent him, the one he checks on every morning, is gone. Someone took it. A length of orange ribbon is still knotted around the clothes rail, cut clean.' },
    { id: 'obj.front_lock', x: 1, y: 8, label: 'Front-door lock', flag: 'act1.clue.lockForced',
      text: 'The deadbolt plate is bent and the strike is splintered. Someone forced it from the hallway side, quietly, and pulled the door shut behind them.' },
    { id: 'obj.mm_mirror', x: 26, y: 1, label: 'Bathroom mirror', text: 'Two toothbrushes and a third one nobody claims.' },
  ],
});
