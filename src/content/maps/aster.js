// ASTER interiors: the sixth floor and the lobby. Room 631 is in room631.js.
// Route: 631 -> sixth floor -> stairs or elevator -> lobby -> the street.
import { makeMap } from './build.js';

const DOOR = 'obj.door';   // shared drawing for apartment doors (see the `art` field)

export const asterHall = makeMap({
  id: 'aster_hall', name: 'ASTER, 6th floor',
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
    { id: 'obj.door_633', art: DOOR, x: 11, y: 2, label: '633: Varga', text: 'Mrs. Varga\'s door. A mat that says WIPE. A strip of light underneath; she doesn\'t sleep.' },
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
    // Stairwell
    { id: 'obj.stairs_6f', art: 'obj.stairs', x: 2, y: 1, label: 'Stairs down', action: 'exit', to: 'aster_lobby', text: 'Six flights. Somebody has numbered the steps in chalk and lost count at 71.' },
    { id: 'obj.extinguisher', x: 1, y: 4, label: 'Fire extinguisher', text: 'Inspected 2071. The tag has been initialed every year since by the same hand.' },
    // Laundry room
    { id: 'obj.washer_1', art: 'obj.washer', x: 17, y: 8, label: 'Washer', text: 'Mid-cycle. It has been mid-cycle since Tuesday.' },
    { id: 'obj.washer_2', art: 'obj.washer', x: 18, y: 8, label: 'Washer', text: 'Empty except for one sock. There is always one sock.' },
    { id: 'obj.dryer', art: 'obj.washer', x: 22, y: 8, label: 'Dryer', text: 'Warm. The lint trap has a rookie Aster mistake written in it with a finger.' },
    { id: 'obj.folding_table', art: 'obj.table', x: 20, y: 6, label: 'Folding table', text: 'A slide rule, a pencil, and a page of sums in a careful hand. Track numbers down the margin.' },
    // Elevator alcove
    { id: 'obj.elevator', x: 37, y: 8, label: 'Elevator', action: 'exit', to: 'aster_lobby', text: 'The elevator thinks about it, then goes down.' },
    { id: 'obj.plant_6f', art: 'obj.plant', x: 34, y: 6, label: 'Plant', text: 'Plastic. Someone waters it anyway. It is doing well.' },
    { id: 'obj.window_6f', x: 42, y: 4, label: 'Window, facing north', text: 'Route 1 running north into the dark. Past the last streetlight, low on the horizon, lights are moving. Slowly. All in the same direction.' },
  ],
});

export const asterLobby = makeMap({
  id: 'aster_lobby', name: 'ASTER, lobby',
  layout: [
    '####################################',   // 0  north wall: mailboxes, directory, office, clock
    '#:::#mmmmmmmmmmmmmmmmmmmmmmmmmm#mmm#',   // 1  stairwell (west), elevator alcove (east)
    '#:::#mmmmmmmmmmmmmmmmmmmmmmmmmm#mmm#',   // 2
    '#:::mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 3
    '#:::mmmmm|mmmmmmmmmmmmmmmm|mmmmmmmm#',   // 4
    '####mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 5
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 6  the desk sits mid-room
    '#mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm#',   // 7
    '#mmmmmmmm|mmmmmmmmmmmmmmmm|mmmmmmmm#',   // 8
    '#cccccccmmmmmmmmmmmmmmmmmmmmccccccc#',   // 9  seating on carpet, either side
    '#cccccccmmmmmmmmmmmmmmmmmmmmccccccc#',   // 10
    '#cccccccmmmmmmmmmmmmmmmmmmmmccccccc#',   // 11
    '#######=========mmmm=========#######',   // 12 street glass with the doorway
    '################,,,,################',   // 13 the step outside
    '####################################',   // 14
  ],
  spawns: [[17, 10], [18, 10], [17, 9]],
  objects: [
    { id: 'obj.lobby_stairs', art: 'obj.stairs', x: 2, y: 1, label: 'Stairs up', action: 'exit', to: 'aster_hall', text: 'Six flights up.' },
    { id: 'obj.lobby_elevator', art: 'obj.elevator', x: 33, y: 1, label: 'Elevator', action: 'exit', to: 'aster_hall', text: '"Sixth floor," the elevator says. "Sorry. Sorry. Sixth."' },
    { id: 'obj.mailboxes', x: 7, y: 0, label: 'Mailboxes', text: 'A wall of brass doors. 631 has a flyer for a dentist none of you have been to. 409 is stuffed full and nobody has emptied it.' },
    { id: 'obj.directory', x: 12, y: 0, label: 'Building directory', text: 'White letters pushed into black felt. Enough have fallen that the list reads like a ransom note. B-01 SUPER ... KESSEL, L.' },
    { id: 'obj.super_door', art: DOOR, x: 17, y: 0, label: 'Super\'s office', text: 'Locked. A paper sign, in marker: BACK WHEN IT\'S FIXED.' },
    { id: 'obj.lobby_clock', art: 'obj.clock_6f', x: 22, y: 0, label: 'Lobby clock', text: '19:01. The second hand is moving. It is just not getting anywhere.' },
    { id: 'obj.vending', x: 27, y: 1, label: 'Vending machine', text: 'It hums. Row C has been empty for a year. It takes your coin and considers you.' },
    { id: 'obj.lobby_camera', x: 30, y: 0, label: 'Lobby camera', text: 'The red light is on. It is recording. Not tonight, by the look of the monitor, but it is recording.' },
    { id: 'obj.security_desk', x: 17, y: 6, label: 'Security desk', text: 'A sign-in book. The last forty entries are the same name in forty different hands.' },
    { id: 'obj.lobby_monitor', x: 18, y: 6, label: 'Security monitor (rotted)', talk: 'lead_c_footage', puzzle: 'pipes', solvedFlag: 'act1.leadC.repaired' },
    { id: 'npc.doorman', x: 16, y: 5, label: 'Doorman', npc: true, text: '"Good evening. You are residents. I am glad." A glyph at his collar, a certain stillness. "I did not see anyone come in. I would like to have."' },
    { id: 'obj.plant_w', art: 'obj.plant', x: 1, y: 9, label: 'Plant', text: 'Real, this one. It leans toward the street doors.' },
    { id: 'obj.bench_w', art: 'obj.bench', x: 3, y: 10, label: 'Bench', text: 'Somebody has carved ASTER PROS into the armrest. Somebody else has carved NOOBS under it. Same knife.' },
    { id: 'obj.lost_found', x: 5, y: 11, label: 'Lost and found', text: 'A box that is never emptied. One glove. A pacifier. A phone, face down, that you decide not to turn over.' },
    { id: 'obj.plant_e', art: 'obj.plant', x: 34, y: 9, label: 'Plant', text: 'Dead for years. Still in the watering rota.' },
    { id: 'obj.bench_e', art: 'obj.bench', x: 31, y: 10, label: 'Bench', text: 'Warm, as if someone just stood up.' },
    { id: 'obj.notice', art: 'obj.board', x: 34, y: 5, label: 'Abatement notice', text: 'CONTINUITY AUTHORITY: ROUTINE ABATEMENT IN YOUR AREA. Residents may notice vans. Residents need not notice anything else.' },
    { id: 'obj.street_doors', x: 17, y: 13, label: 'Street doors', action: 'exit', floor: true, to: 'metro_plaza', text: 'Out into the plaza. Sodium light and wet concrete.' },
  ],
});
