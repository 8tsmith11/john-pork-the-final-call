// College Park at street level: one large outdoor hub (id metro_plaza, kept for saves and triggers).
// Districts: ASTER's forecourt (north-west), the metro plaza (centre), Route 1 and its shops (east),
// the unused Purple Line track, the campus edge (south-west), a dead parking lot (south), and the
// Paint Branch trail (south-east). The layout is painted with rectangles so it stays editable.
import { makeMap } from './build.js';

const W = 84, H = 52;
const g = Array.from({ length: H }, () => Array(W).fill('g'));
const R = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j]?.[i] !== undefined) g[j][i] = ch; };

// Streets
R(1, 30, 82, 1, 's'); R(1, 31, 82, 4, ','); R(1, 35, 82, 1, 's');           // the cross street
R(56, 1, 2, 50, 's'); R(58, 1, 6, 50, ','); R(64, 1, 2, 50, 's');           // Route 1, north to south
R(56, 31, 10, 4, ',');                                                      // the intersection
R(1, 28, 55, 2, 'h');                                                       // the Purple Line that never opened

// The metro plaza
R(22, 10, 32, 18, 'p');
for (const [x, y] of [[26, 14], [34, 14], [42, 14], [50, 14], [26, 22], [34, 22], [42, 22], [50, 22]]) R(x, y, 1, 1, '|');
R(32, 3, 14, 6, '#'); R(36, 9, 6, 1, 'p');                                  // the station building and its steps
R(23, 24, 8, 2, '#');                                                       // the row of shuttered stalls

// ASTER and its forecourt
R(4, 3, 14, 10, '#'); R(4, 13, 14, 4, 'p'); R(18, 14, 4, 2, 's');
R(2, 19, 16, 1, '='); R(2, 20, 18, 7, 'g');                                 // a railed strip of garden

// East of Route 1: the diner, the alley, the scooter yard, a shuttered block
R(66, 3, 14, 6, '#'); R(66, 9, 16, 3, ','); R(66, 12, 14, 6, '#'); R(66, 18, 14, 4, 'p');
R(66, 23, 12, 6, '#'); R(80, 3, 2, 27, ',');

// South-west: the campus edge
R(2, 36, 26, 1, '#'); R(12, 36, 3, 1, 's'); R(12, 37, 3, 9, 's'); R(10, 40, 7, 4, 'p'); R(4, 46, 20, 4, '#');

// South: the dead parking lot
R(30, 37, 24, 12, ',');

// South-east: Paint Branch and the trail to the lake
for (let y = 36; y < 51; y++) { const x = 72 + Math.round(3 * Math.sin(y / 3)); R(x, y, 2, 1, '~'); }
R(66, 40, 17, 1, 's');
for (let x = 66; x < 83; x++) if (g[40][x] === 's' && (g[39][x] === '~' || g[41][x] === '~')) g[40][x] = 'b';
for (let x = 68; x < 80; x++) if (g[39][x] === '~' && g[41][x] === '~') g[40][x] = 'b';

// Trees: scattered through whatever is still grass, kept off paths
for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
  if (g[y][x] !== 'g' || (x * 7 + y * 13) % 9 !== 0) continue;
  const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => g[y + dy][x + dx] === 'g' || g[y + dy][x + dx] === 'T');
  if (open) g[y][x] = 'T';
}
// A wall of trees around the edge of the map
R(0, 0, W, 1, 'T'); R(0, H - 1, W, 1, 'T'); R(0, 0, 1, H, 'T'); R(W - 1, 0, 1, H, 'T');
// ...with the roads running out through it
R(58, 0, 6, 1, ','); R(58, H - 1, 6, 1, ','); R(0, 31, 1, 4, ','); R(W - 1, 40, 1, 1, 's');

const PERSON = ['npc.rotter_2', 'npc.rotter_1', 'npc.rotter_3'];

export const metroPlaza = makeMap({
  id: 'metro_plaza', name: 'College Park',
  outdoor: true,
  // Who's here, and why (see src/game/crowd.js).
  crowd: [
    { mode: 'wait', at: [37, 10], n: 3, face: [38, 8] },                    // a queue at the closed metro gates
    { mode: 'talk', at: [33, 15] },                                        // two people talking by a pillar
    { mode: 'walk', path: [[23, 12], [38, 18], [52, 12]], n: 2 },           // crossing the plaza
    { mode: 'walk', path: [[57, 4], [57, 28], [57, 46]], n: 2 },            // the west sidewalk of Route 1
    { mode: 'walk', path: [[65, 46], [65, 22], [65, 4]], n: 2 },            // and the east one
    { mode: 'walk', path: [[4, 30], [30, 30], [54, 30]], n: 2 },            // along the cross street
    { mode: 'wait', at: [70, 20], n: 2, face: [70, 19] },                   // waiting on Big Ray
  ],
  layout: g.map((r) => r.join('')),
  spawns: [[10, 14], [11, 14], [9, 15]],
  objects: [
    // ASTER
    { id: 'obj.aster_door', art: 'obj.street_doors', x: 10, y: 12, label: 'ASTER lobby', action: 'exit', to: 'aster_lobby', text: 'Back into the lobby.' },
    { id: 'obj.aster_sign', art: 'obj.purple_sign', x: 5, y: 13, label: 'ASTER', text: 'A S T E R, in letters a metre high. The T flickers. Residents have stopped seeing it.' },
    { id: 'npc.okafor', x: 9, y: 23, label: 'Mrs. Okafor', npc: true, text: 'Three generations are arguing on the third floor and she has come down here to let them. "Sit." You sit. "Your friend with the hair. He is making those heads again?" She nods as if you answered. "Good. Somebody should."' },
    { id: 'obj.garden_bench', art: 'obj.bench', x: 8, y: 22, label: 'Bench', text: 'A brass plate: FOR THE NIGHT SHIFT. No name. Somebody polishes it.' },
    // The plaza
    { id: 'obj.station_entrance', art: 'obj.tunnel_on', x: 38, y: 8, label: 'Metro entrance', text: 'The gates are down for the night. The departure board behind them lists a train to a station that was never built.' },
    { id: 'npc.mina', art: PERSON[0], x: 41, y: 10, label: 'Mina', npc: true, text: '"I do requests. I don\'t do the one everybody asks for." She retunes something wooden that was not out of tune.' },
    { id: 'npc.rotter_1', x: 30, y: 18, label: 'Rotter', npc: true, text: 'coderot. coderot. coderot.' },
    { id: 'npc.halvard', x: 26, y: 26, label: 'Halvard', npc: true, talk: 'lead_b_halvard', doneFlag: 'act1.halvard.sellerDescribed', doneText: 'The shutter comes up two inches. Halvard\'s eye, then the television behind him, then the shutter again.\n\n"You paid for one rumor. That was it."' },
    { id: 'obj.purple_sign', x: 40, y: 27, label: 'Purple Line sign', text: 'PURPLE LINE: OPENING SOON.' },
    { id: 'obj.plaza_clock', art: 'obj.clock_6f', x: 46, y: 9, label: 'Station clock', text: '19:01. Under it, somebody has taped a paper clock with the right time and a note: USE THIS ONE.' },
    { id: 'obj.van', x: 45, y: 20, label: 'Abatement van', text: 'White, unmarked except for a mast on the roof. The mast is turning. It is pointed at the ground.' },
    { id: 'npc.pruitt', x: 46, y: 19, label: 'Supervisor Pruitt', npc: true, talk: 'aster:pruitt_talk' },
    { id: 'npc.addo', art: PERSON[1], x: 47, y: 21, label: 'Addo', npc: true, text: '"Mast\'s reading light. Something light. Lighter than it should be down there." He seems pleased that somebody asked.' },
    { id: 'npc.del', art: PERSON[0], x: 44, y: 21, label: 'Del', npc: true, text: '"Fourteen hours. Fourteen. You know what the rate is after twelve? Same as before twelve."' },
    { id: 'npc.rotter_3', x: 49, y: 26, label: 'Rotter (looks at you differently)', npc: true, text: 'coderot. coderot. ...I used to be someone\'s favorite person. coderot.' },
    { id: 'obj.grate', x: 51, y: 26, label: 'Storm grate', action: 'exit', floor: true, to: 'tunnel_1', text: 'The grate lifts. Somewhere below, very faintly, something is drumming.' },
    // Light: lamps along the streets, neon where somebody is selling something
    ...[[57, 5], [57, 17], [57, 27], [57, 38], [57, 47], [64, 11], [64, 22], [64, 37], [64, 46], [8, 30], [22, 30], [38, 30], [50, 30], [14, 35], [44, 35], [18, 15], [5, 16]]
      .map(([x, y]) => ({ id: `obj.lamp_${x}_${y}`, art: 'obj.streetlamp', x, y, label: 'Streetlamp', light: 0.9, text: 'Sodium orange. Moths, and something that is not a moth.' })),
    { id: 'obj.neon_diner', art: 'obj.neon', x: 74, y: 8, label: 'Neon sign', light: 1.2, text: 'EAT. The A has been out so long the regulars call it the Et.' },
    { id: 'obj.neon_stalls', art: 'obj.neon', x: 29, y: 25, label: 'Neon sign', light: 1.1, text: 'PHONES FIXED · UNLOCKED · FORGOTTEN. The last word was added by hand.' },
    { id: 'obj.neon_yard', art: 'obj.neon', x: 67, y: 17, label: 'Neon sign', light: 1.0, text: 'RAY\'S. The apostrophe is a different colour. It was a gift.' },
    // The plaza's furniture: where people wait, and what they wait under
    { id: 'obj.shelter', x: 30, y: 12, label: 'Bus shelter', light: 0.6, text: 'A timetable behind cracked plastic. Every bus is listed as DUE.' },
    { id: 'obj.plaza_bench_a', art: 'obj.bench', x: 37, y: 17, label: 'Bench', text: 'Two benches facing each other across four metres of paving, like an argument nobody finished.' },
    { id: 'obj.plaza_bench_b', art: 'obj.bench', x: 37, y: 20, label: 'Bench', text: 'A paper cup, a transit pass, a pair of reading glasses. Whoever it was meant to come back.' },
    { id: 'obj.planter_a', art: 'obj.planter', x: 31, y: 19, label: 'Planter', text: 'The city stopped planting these. Somebody else started.' },
    { id: 'obj.planter_b', art: 'obj.planter', x: 46, y: 16, label: 'Planter', text: 'Tomatoes. In a metro plaza. They are doing very well.' },
    { id: 'obj.planter_c', art: 'obj.planter', x: 24, y: 20, label: 'Planter', text: 'Empty except for a single orange ribbon, tied to a stake.' },
    { id: 'obj.kiosk', x: 48, y: 11, label: 'News kiosk', light: 0.8, action: 'tv', text: 'Headlines.' },
    { id: 'obj.station_light', art: 'obj.worklamp', x: 36, y: 8, label: 'Station light', light: 1.0, text: 'The entrance is lit all night. Nothing has come out of it since midnight.' },
    // Route 1
    { id: 'obj.billboard', x: 65, y: 20, label: 'Billboard', text: 'A Slop Decades billboard, peeling: "AT THE END OF THE DAY, NO ONE CAN CODE FASTER THAN AI."' },
    { id: 'npc.rotter_2', x: 57, y: 8, label: 'Rotter', npc: true, text: 'coderot. no one can code faster than. coderot.' },
    { id: 'obj.route1_north', art: 'obj.board', x: 61, y: 1, label: 'Route 1, north', action: 'exit', text: 'Abatement tape across both lanes, and a van with its lights off. North is closed tonight.' },
    { id: 'obj.route1_south', art: 'obj.board', x: 61, y: 50, label: 'Route 1, south', action: 'exit', text: 'South is the Beltway, and the wall. You don\'t have the papers. Nobody you know has the papers.' },
    { id: 'npc.ines', art: PERSON[2], x: 65, y: 14, label: 'Ines', npc: true, text: '"Lake\'s eleven minutes on foot. Campus is six. The Beltway is as far as you can get before somebody asks who you are."' },
    { id: 'obj.map_cart', art: 'obj.cart', x: 65, y: 15, label: 'Map cart', text: 'Paper maps, hand-corrected. A sign: IF YOU FIND AN ERROR I WILL PAY YOU FOR IT.' },
    { id: 'obj.diner_door', art: 'obj.door', x: 72, y: 8, label: 'The diner', text: 'Open. It is always open. Through the glass, a cook calls an order to an empty room and plates it.' },
    { id: 'obj.diner_menu', art: 'obj.board', x: 69, y: 8, label: 'Menu', text: 'Chalk. One item has been crossed out and rewritten so many times the board is worn pale there.' },
    { id: 'npc.ray', art: PERSON[1], x: 70, y: 19, label: 'Big Ray', npc: true, text: '"Scooter\'s fine. You\'re running rich. Sleep, eat something that was alive, come back."' },
    { id: 'obj.scooters', x: 74, y: 19, label: 'Scooter rack', text: 'Three used scooters, chained, each with a price tag written on tape. Delroy\'s kiosk takes cash.' },
    { id: 'obj.shop_scooters', art: 'obj.kiosk', x: 71, y: 18, label: 'Delroy\'s Wheels', action: 'shop', shop: 'scooters', light: 0.7 },
    { id: 'obj.shop_corner', art: 'obj.vending', x: 77, y: 9, label: 'Corner store', action: 'shop', shop: 'corner', light: 0.6 },
    { id: 'obj.shop_window', art: 'obj.lobby_monitor', x: 66, y: 25, label: 'Shop window', light: 0.6, text: 'A window of dead screens, price tags still on. One comes on as you pass.\n\nA street camera, this street. A big man in a long coat, from behind, walking north with a bad knee. The timestamp is now.\n\nYou look north. Nobody.' },
    // The alley
    { id: 'obj.dumpster', x: 81, y: 12, label: 'Dumpster', text: 'Abatement tags on the lid. Inside, a hundred phones, screens up, all showing 19:01.' },
    { id: 'obj.alley_graffiti', art: 'obj.graffiti', x: 80, y: 20, label: 'Scratched into the brick', text: 'FOR A GOOD TIME DIAL 6969. Under it, in a different hand: he does pick up.' },
    { id: 'obj.alley_door', art: 'obj.door', x: 79, y: 5, label: 'Steel door', text: 'No handle on this side. A paper sign: DELIVERIES RING TWICE. There is no bell.' },
    // The campus edge
    { id: 'obj.campus_gate', art: 'obj.purple_sign', x: 11, y: 36, label: 'Campus gate', text: 'UNIVERSITY OF MARYLAND, A CAMPUS OF THE CONTINUITY AUTHORITY. Compute apprentices: your hours have been adjusted.' },
    { id: 'obj.testudo', x: 13, y: 41, label: 'Testudo', flag: 'secrets.testudo.found', text: 'The bronze terrapin. Its nose is worn gold by a century of hands. You rub it.\n\nNothing happens. Then your lace reports full signal for one second, for the first time this year.' },
    { id: 'npc.cal', art: PERSON[0], x: 16, y: 39, label: 'Cal Rourke', npc: true, text: '"Engineering, right? All three of you. I never forget a major." He has a table, a banner, and a pen he would like you to hold.' },
    // Easter egg (docs/SECRETS.md): he sings a different country's anthem every time you talk to him. He has no name, on purpose.
    { id: 'npc.anthem', x: 18, y: 42, label: 'Student at attention', npc: true, action: 'pages', flag: 'secrets.anthem.found', pages: [
      'A big second-year in a compute hoodie stands at attention by the gate, bowl cut, glasses, one hand on his chest, a stuffed squirrel under the other arm. He is singing the anthem of Uruguay. He does all eleven verses.\n\n"Greatest nation on earth," he says after. He has never been.',
      'Today it is Kazakhstan. He holds the last note until a window closes somewhere.\n\n"I would die for the steppe." He adjusts his glasses. "My mother calls from Chengdu every Sunday and asks which country it is this week. I tell her to stand up first."',
      'Nepal. He sings it at the sky.\n\n"Only flag in the world with five sides. That takes conviction. Rectangles are for countries that gave up."',
      'He lifts the squirrel\'s paw into a salute for you.\n\n"General Nutsworth. Decorated in four republics. He outranks you, and he outranks Cal."',
      'Finland, with his eyes shut. A tear gets under the glasses.\n\n"Don\'t talk during Finland."',
      'Paraguay. Between verses: "I have a 245 lab due at nine." He checks nothing and starts the next verse. "Paraguay first."',
      'He is humming something you half know and he stops when he sees you listening.\n\n"That one\'s Maryland\'s. They retired it. I don\'t retire anthems."',
    ] },
    { id: 'obj.campus_door', art: 'obj.door', x: 14, y: 46, label: 'Compute Hall B', text: 'Badge reader. It knows you. It says your section is 245 and your section is late.' },
    // The parking lot
    { id: 'obj.dead_car_1', art: 'obj.car', x: 34, y: 40, label: 'Car', text: 'It still thinks it is driving. The dashboard shows a road in another state.' },
    { id: 'obj.dead_car_2', art: 'obj.car', x: 44, y: 45, label: 'Car', text: 'Somebody lives in this one. There are curtains. You knock on nothing and move on.' },
    { id: 'obj.payphone', x: 53, y: 36, label: 'Payphone', text: 'A payphone, older than the building behind it. No power to it. It rings once while you are looking at it.' },
    // Paint Branch
    { id: 'obj.bridge_log', art: 'obj.board', x: 69, y: 39, label: 'Fishing log', text: 'A waterproof book on a chain. Fifty years of strangers: date, catch, weather. The last page is tomorrow\'s date, already filled in.' },
    { id: 'obj.lake_trail', art: 'obj.purple_sign', x: 82, y: 39, label: 'Trail to Lake Artemesia', action: 'exit', to: 'lake', text: 'The trail goes on into the trees toward the lake.' },
  ],
});
