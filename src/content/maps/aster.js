// ASTER interiors: the sixth floor and the lobby. Room 631 is in room631.js.
// Route: 631 -> sixth floor -> stairs or elevator -> lobby -> the street.
import { makeMap } from './build.js';

const DOOR = 'obj.door';   // shared drawing for apartment doors (see the `art` field)

export const asterHall = makeMap({
  id: 'aster_hall', name: 'ASTER, 6th floor',
  propScale: 1.25,
  layout: [
    '############################################',   // 0
    '#:::########################################',   // 1  stairwell (west)
    '#:::########################################',   // 2  north apartments: doors sit in this wall
    '#:::cccccccccccccccccccccccccccccccccccccc=#',   // 3  the corridor; a window at the east end
    '#:::cccccccccccccccccccccccccccccccccccccc=#',   // 4
    '####cccccccccccccccccccccccccccccccccccccc=#',   // 5
    '#################kkkkkk###########cccccc####',   // 6  south apartments; laundry room; elevator alcove
    '#################kkkkkk###########cccccc####',   // 7
    '#################kkkkkk###########cccccc####',   // 8
    '############################################',   // 9
  ],
  spawns: [[6, 3], [7, 4], [8, 3]],
  objects: [
    // North side
    { id: 'obj.door_631', art: DOOR, x: 6, y: 2, label: 'Room 631', action: 'exit', to: 'room631', text: 'Home.' },
    { id: 'obj.door_633', art: DOOR, x: 11, y: 2, label: 'Mrs. Varga', npc: true, age: 'adult', talk: 'aster:varga_talk' },
    { id: 'obj.graffiti', x: 15, y: 2, label: 'Graffiti', text: 'Three hands, three paints: FREE JOHN PORK. JUSTICE FOR JOHN PORK. TIM CHEESE WILL PAY. Someone has crossed out the first one, then uncrossed it.' },
    { id: 'obj.door_635', art: DOOR, x: 19, y: 2, label: '635', text: 'Six locks. Five are decorative. You have never worked out which.' },
    { id: 'obj.newsletter', art: 'obj.board', x: 23, y: 2, label: 'Tenant board', text: 'THE ASTER LETTER. Bake sale. Boiler schedule. Lost: one grey cat, answers to nothing. The issue for the month of the Call is missing. The next one starts mid-sentence.' },
    { id: 'obj.door_637', art: DOOR, x: 27, y: 2, label: '637', text: 'Someone is practicing scales on something with strings. They are getting worse.' },
    { id: 'obj.bathroom', x: 31, y: 2, label: 'Bathroom (occupied)', text: '"One minute!"', knock: true },
    { id: 'obj.clock_6f', x: 35, y: 2, label: 'Hallway clock', text: 'It reads 19:01. It has read 19:01 since you moved in.' },
    { id: 'obj.chute', x: 39, y: 2, label: 'Trash chute', text: 'It goes down eleven floors. Things come back up sometimes. Nobody talks about that either.' },
    // South side
    { id: 'obj.door_632', art: DOOR, x: 6, y: 6, label: '632', text: 'A child\'s drawing taped at child height: three stick figures and a fourth, taller, with a round head.' },
    { id: 'obj.door_634', art: DOOR, x: 11, y: 6, label: '634', text: 'Vacant since spring. The peephole has been painted over from the inside.' },
    { id: 'obj.door_636', art: DOOR, x: 27, y: 6, label: '636', text: 'A delivery box, unopened, addressed to the previous tenant. And the one before.' },
    { id: 'obj.door_638', art: DOOR, x: 31, y: 6, label: '638', text: 'Television through the door. "Citizens, things are stable." Then the same sentence again, slightly different.' },
    // People on six
    { id: 'npc.pell', eggOk: true, later: [{ if: "act1.cordon.passed", text: "\"You went down. I can tell by your knees.\" Pell taps the wall with one knuckle. \"Tell me if the yard still smells of ozone. I'd like one thing down there to be the same.\"" }, { if: "act1.complete", text: "\"Was the east gate rolled open?\" He nods before you answer. \"Then somebody remembered how.\"" }], x: 19, y: 7, label: 'Arthur Pell', npc: true, age: 'adult', talk: 'aster:pell_talk' },
    { id: 'npc.409', eggOk: true, later: [{ if: "act1.beat.call", text: "His phone is face up on the step, dark. \"Mine rang too. I haven't paid for a plan since my wife. It rang anyway.\"" }, { if: "act1.complete", text: "\"Door stayed shut last night. First time this week.\" He has a fresh bowl. \"I sat here and watched it stay shut.\"" }], x: 2, y: 3, label: 'Four-oh-nine', npc: true, age: 'adult', text: 'A man on the landing, his soup going cold. "Please hold. Your call is. Please hold." He says it kindly, like he said it for years.' },
    // Stairwell
    { id: 'obj.stairs_6f', art: 'obj.stairs', x: 2, y: 1, label: 'Stairs down', action: 'exit', to: 'aster_lobby', text: 'Six flights. Somebody has numbered the steps in chalk and lost count at 71.' },
    { id: 'obj.extinguisher', x: 1, y: 4, label: 'Fire extinguisher', text: 'Inspected 2071. The tag has been initialed every year since by the same hand.' },
    // Laundry room
    { id: 'obj.washer_1', art: 'obj.washer', x: 17, y: 8, label: 'Washer', text: 'Mid-cycle. It has been mid-cycle since Tuesday.' },
    { id: 'obj.washer_2', art: 'obj.washer', x: 18, y: 8, label: 'Washer', text: 'Empty except for one sock. There is always one sock.' },
    { id: 'obj.dryer', art: 'obj.washer', x: 22, y: 8, label: 'Dryer', text: 'Warm. The lint trap has a rookie Aster mistake written in it with a finger.' },
    { id: 'obj.folding_table', art: 'obj.table', x: 20, y: 6, label: 'Folding table', text: 'A page of sums in a careful hand. Track numbers down the margin.' },
    // Elevator alcove
    { id: 'obj.elevator', x: 37, y: 8, label: 'Elevator', action: 'exit', to: 'aster_lobby', text: 'The elevator thinks about it, then goes down.' },
    { id: 'obj.plant_6f', art: 'obj.plant', x: 34, y: 6, label: 'Plant', text: 'Plastic. Someone waters it anyway. It is doing well.' },
    { id: 'obj.window_6f', x: 42, y: 4, label: 'Window, facing north', text: 'Route 1 running north into the dark. Past the last streetlight, low on the horizon, lights are moving. Slowly. All in the same direction.' },
  ],
});

export const asterLobby = makeMap({
  id: 'aster_lobby', name: 'ASTER, lobby',
  propScale: 1.25,
  layout: [
    '####################################',   // 0  north wall: mailboxes, directory, office, clock
    '#:::#mmmmmmmmmmmmmmmmmmmmmmmmmm#mmm#',   // 1  stairwell (west), elevator alcove (east)
    '#:::#mmmmmmmmmmmmmmmmmmmmmmmmmm#mmm#',   // 2
    '#:::mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 3
    '#:::mmmmm|mmmmmmmmmmmmmmmm|mmmmmmmm#',   // 4
    '####mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 5
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 6  the desk sits mid-room
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 7
    '#mmmmmmmm|mmmmmmuuuummmmmm|mmmmmmmm#',   // 8  a runner from the doors to the desk
    '#cccccccmmmmmmmmuuuummmmmmmmccccccc#',   // 9  seating on carpet, either side
    '#cccccccmmmmmmmmuuuummmmmmmmccccccc#',   // 10
    '#cccccccmmmmmmmmuuuummmmmmmmccccccc#',   // 11
    '#######==========mm==========#######',   // 12 street glass; the doorway is exactly the doors' width
    '#################,,#################',   // 13 the doors (glass on both sides, no open patch)
    '####################################',   // 14
  ],
  spawns: [[17, 10], [18, 10], [17, 9]],
  objects: [
    { id: 'obj.lobby_stairs', art: 'obj.stairs', x: 2, y: 1, label: 'Stairs up', action: 'exit', to: 'aster_hall', text: 'Six flights up.' },
    { id: 'obj.lobby_elevator', art: 'obj.elevator', x: 33, y: 1, label: 'Elevator', light: 0.6, action: 'exit', to: 'aster_hall', text: '"Sixth floor," the elevator says. "Sorry. Sorry. Sixth."' },
    { id: 'obj.mailboxes', x: 7, y: 0, label: 'Mailboxes', text: 'A wall of brass doors. 631 has a flyer for a dentist none of you have been to. 409 is stuffed full and nobody has emptied it.' },
    { id: 'obj.directory', x: 12, y: 0, label: 'Building directory', text: 'White letters pushed into black felt. Enough have fallen that the list reads like a ransom note. B-01 SUPER ... KESSEL, L.' },
    { id: 'obj.super_door', art: DOOR, x: 17, y: 0, label: 'Super\'s office', text: 'Locked. A paper sign, in marker: BACK WHEN IT\'S FIXED.' },
    { id: 'obj.lobby_clock', art: 'obj.clock_6f', x: 22, y: 0, label: 'Lobby clock', text: '19:01. The second hand ticks forward, then slips back a tick.' },
    { id: 'obj.vending', x: 27, y: 1, label: 'Vending machine', light: 0.6, text: 'It hums. Row C has been empty for a year. It takes your coin and considers you.' },
    { id: 'obj.lobby_camera', x: 30, y: 0, label: 'Lobby camera', text: 'The red light is on. It is recording. Not tonight, by the look of the monitor, but it is recording.' },
    { id: 'obj.security_desk', x: 17, y: 6, label: 'Security desk', text: 'A sign-in book. The last forty entries are the same name in forty different hands.' },
    { id: 'obj.lobby_monitor', x: 18, y: 6, label: 'Security monitor (rotted)', talk: 'lead_c_footage', puzzle: 'pipes', solvedFlag: 'act1.leadC.repaired' },
    { id: 'npc.kess', eggOk: true, x: 18, y: 2, label: 'Kess', npc: true, age: 'adult', talk: 'aster:kess_talk', later: [
      { if: 'act1.beat.call', text: 'Kess has the lobby door off its hinges and laid across two chairs. "Your lock\'s a cheap one. When you\'re back I\'ll put a real one on. Bring me the old plate, I want to see the marks."' },
      { if: 'act1.complete', text: 'A new deadbolt in a paper bag, with 631 written on it in marker. "Tomorrow. I\'m off tonight." She is not off tonight.' },
    ] },
    { id: 'npc.seun', eggOk: true, x: 30, y: 10, label: 'Seun', npc: true, age: 'adult', text: 'A care worker in scrubs, a glyph at her collar. "Mrs. Varga asks about you three. I tell her you are eating. Are you eating?"' },
    { id: 'npc.dez', eggOk: true, x: 9, y: 2, label: 'Dez', npc: true, age: 'adult', talk: 'aster:dez_talk', later: [
      { if: 'act1.beat.call', text: 'Still against the mailboxes. "Your phone did a thing earlier. Whole lobby heard it." A long pause. "I\'m not asking."' },
      { if: 'act1.cordon.passed', text: '"Somebody said you went down the grate." He looks at your shoes. "Huh. You did."' },
      { if: 'act1.complete', text: 'Dez sits up, which for Dez is a lot. "Drumming stopped about an hour ago. I noticed because I could hear the fridge again."' },
    ] },
    { id: 'npc.doorman', eggOk: true, later: [{ if: "act1.beat.call", text: "\"Every screen in the lobby said one name for a minute. I wrote it in the book.\" Fenwick squares the pen to the page. \"It felt rude to leave it out.\"" }, { if: "act1.complete", text: "\"You three came up the stairs at dawn smelling like a pump room. I signed you in. All three.\" He turns the book so you can see. \"I counted twice.\"" }], x: 16, y: 5, label: 'Fenwick', npc: true, age: 'adult', talk: 'aster:fenwick_talk' },
    // Second pass: what a lobby has. Each seat faces something; each light has a reason to be on.
    { id: 'obj.armchair_w1', art: 'obj.chair', x: 2, y: 11, label: 'Armchair', text: 'The one nearest the door. Whoever is waiting for someone sits here.' },
    { id: 'obj.table_w', art: 'obj.table', x: 4, y: 9, label: 'Low table', text: 'Three magazines, all the same issue. The crossword is done in every one, differently.' },
    { id: 'obj.armchair_e1', art: 'obj.chair', x: 33, y: 11, label: 'Armchair', text: 'Seun\'s coat is over the back. She will be back for it.' },
    { id: 'obj.table_e', art: 'obj.table', x: 29, y: 9, label: 'Low table', text: 'A chessboard, mid-game. Kess plays the night shift by leaving one move a day.' },
    { id: 'obj.parcels', art: 'obj.crate', x: 5, y: 1, label: 'Parcel shelf', text: 'Packages by floor. Six is empty. Somebody on four is being sent the same box every week.' },
    { id: 'obj.desk_lamp', art: 'obj.nightstand', x: 19, y: 6, label: 'Desk lamp', light: 0.8, text: 'Fenwick does not need the lamp. He leaves it on for whoever comes in.' },
    { id: 'obj.exit_light_w', art: 'obj.worklamp', x: 15, y: 12, label: 'Door light', light: 0.7, text: 'A caged light over the street doors. Moths.' },
    { id: 'obj.exit_light_e', art: 'obj.worklamp', x: 20, y: 12, label: 'Door light', light: 0.7, text: 'This one buzzes. The other one doesn\'t.' },
    { id: 'obj.wet_floor', art: 'obj.board', x: 14, y: 9, label: 'Sign', text: 'CAUTION: WET FLOOR. It has stood here through two droughts.' },
    { id: 'obj.plant_w', art: 'obj.plant', x: 1, y: 9, label: 'Plant', text: 'Real, this one. It leans toward the street doors.' },
    { id: 'obj.bench_w', art: 'obj.bench', x: 3, y: 10, label: 'Bench', text: 'Somebody has carved ASTER PROS into the armrest. Somebody else has carved NOOBS under it. Same knife.' },
    { id: 'obj.old_phone', x: 7, y: 11, label: 'A phone, face up', light: 0.35, text: '' },   // egg, see docs/SECRETS.md
    { id: 'obj.lost_found', loot: 'lost', x: 5, y: 11, label: 'Lost and found', text: 'A box that is never emptied. One glove. A pacifier. A phone, face down, that you decide not to turn over.' },
    { id: 'obj.plant_e', art: 'obj.plant', x: 34, y: 9, label: 'Plant', text: 'Dead for years. Still in the watering rota.' },
    { id: 'obj.bench_e', art: 'obj.bench', x: 31, y: 10, label: 'Bench', text: 'Warm, as if someone just stood up.' },
    { id: 'obj.notice', art: 'obj.board', x: 34, y: 5, label: 'Abatement notice', action: 'pages', pages: [
      'CONTINUITY AUTHORITY: ROUTINE ABATEMENT IN YOUR AREA. Residents may notice vans. Residents need not notice anything else.',
      'REMINDER. Display of the designated likeness (JP-1) in any medium is an offence: flags, figures, drawings, and descriptions sufficient to identify.\n\nThe notice then describes him, for four lines, so that you will know what not to display.',
      'Somebody has added, in biro, at the bottom: he called my mother in \'71. she still sets a place.' ] },
    { id: 'obj.street_doors', x: 17, y: 13, w: 2, label: 'Street doors', action: 'exit', floor: true, stepOn: true, to: 'metro_plaza', text: 'Out into the plaza. Sodium light and wet concrete.' },
  ],
});
