// Under College Park: the Green Line maintenance tunnels and the dead platform.
// The tunnel is a main line with branches: a pump room (north-west), a flooded bay (south), the
// switchyard (centre), a northern bypass, and a signal room (south-east). Painted with rectangles.
import { makeMap } from './build.js';

const W = 66, H = 28;
const g = Array.from({ length: H }, () => Array(W).fill('#'));
const R = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j]?.[i] !== undefined) g[j][i] = ch; };

R(1, 11, 64, 5, ':'); R(1, 13, 64, 1, 'h');                                   // the main line, west to east
R(13, 5, 3, 6, ':'); R(7, 2, 14, 4, ':');                                     // north-west: stairs up to the pump room
R(24, 16, 3, 6, ':'); R(18, 21, 16, 5, ':'); R(19, 23, 9, 3, '~');             // south: the flooded bay
R(33, 6, 14, 16, ':'); R(33, 8, 14, 1, 'h'); R(33, 18, 14, 1, 'h');            // the switchyard: three lines cross here
for (const [x, y] of [[36, 10], [43, 10], [36, 16], [43, 16]]) R(x, y, 1, 1, '|');
R(40, 2, 3, 4, ':'); R(40, 2, 18, 3, ':'); R(55, 2, 3, 9, ':');                // the northern bypass, rejoining at the east end
R(51, 16, 3, 6, ':'); R(47, 21, 12, 5, ':');                                   // south-east: the signal room

const lamp = (x, y, text) => ({ id: `obj.worklamp_${x}_${y}`, art: 'obj.worklamp', x, y, label: 'Work lamp', light: 0.7, text });

export const tunnel1 = makeMap({
  id: 'tunnel_1', name: 'Green Line maintenance tunnels',
  layout: g.map((r) => r.join('')),
  spawns: [[3, 12], [3, 14], [4, 12]],
  enemies: [
    ['enemy.rotling', 24, 12], ['enemy.rotling', 20, 14], ['enemy.spitter', 28, 11],        // the main line (kept 17+ tiles from the ladder: John Pork's call plays on arrival, Trevor)
    ['enemy.rotling', 19, 2],                                                                // the pump room (far corner, out of reach of the ladder)
    ['enemy.rotling', 30, 22],                                                               // the flooded bay
    ['enemy.rot_taken', 38, 9], ['enemy.spitter', 44, 17], ['enemy.rot_taken', 40, 19],      // the switchyard: two later-stage cases
    ['enemy.spitter', 50, 3],                                                                // the bypass
    ['enemy.moth', 53, 23],                                                                  // the signal room: a Hold-Music Moth on its own
    ['enemy.autocomplete', 56, 12], ['enemy.spitter', 60, 14],                               // the approach
    // Harder road (task #33, Michael): code rot zombies all the way along, in small packs.
    ['enemy.rot_taken', 22, 13], ['enemy.rot_taken', 26, 14], ['enemy.rot_taken', 30, 12],   // the main line
    ['enemy.rot_taken', 28, 22],                                                             // the flooded bay
    ['enemy.rot_taken', 41, 12], ['enemy.rot_taken', 45, 12], ['enemy.rot_taken', 38, 15],   // the switchyard
    ['enemy.rot_taken', 45, 3], ['enemy.rot_taken', 53, 3],                                  // the bypass
    ['enemy.rot_taken', 50, 23], ['enemy.rot_taken', 57, 24],                                // the signal room
    ['enemy.rot_taken', 58, 13], ['enemy.rot_taken', 62, 12], ['enemy.rot_taken', 62, 14],   // the approach
  ],
  objects: [
    // Seeded loot in the side branches (trevor): exploring off the main line pays.
    { id: 'obj.crate_pump', art: 'obj.crate', x: 19, y: 5, label: 'Maintenance crate', loot: 'parts', text: 'A WMATA parts crate, lid wired shut with a twist tie.' },
    { id: 'obj.crate_bay', art: 'obj.crate', x: 32, y: 22, label: 'Crate on a pallet', loot: 'tools', text: 'Up on a pallet, above the old waterline. Somebody meant to come back for it.' },
    { id: 'obj.crate_signal', art: 'obj.toolbox', x: 56, y: 22, label: 'Signal tech\'s toolbox', loot: 'parts', text: 'A toolbox with a name stencilled on it and scraped off again.' },
    { id: 'obj.tunnel_up', x: 1, y: 12, label: 'Ladder up', action: 'exit', to: 'metro_plaza', text: 'Back up to the plaza.' },
    lamp(6, 11, 'A caged bulb on a hook. Somebody is still changing these.'),
    { id: 'obj.arrow_east', art: 'obj.graffiti', x: 9, y: 10, label: 'Chalk on the wall', text: 'An arrow pointing east: PLATFORM. Under it, newer: you\'ll hear it first.' },
    // Pump room
    lamp(8, 2, 'This one flickers in threes.'),
    { id: 'obj.pump', art: 'obj.degasser', x: 18, y: 2, label: 'Sump pump', text: 'Running. It has been keeping this tunnel dry since before any of you were born, and nobody has told it to stop.' },
    { id: 'obj.work_order', art: 'obj.board', x: 12, y: 1, label: 'Work order', text: 'GREEN LINE MAINTENANCE. REPLACE PUMP 3. Dated the week of the Call. Signed, countersigned, never done. In pencil: it still works. leave it.' },
    { id: 'obj.locker', art: 'obj.chute', x: 9, y: 4, label: 'Locker', text: 'A hard hat, a thermos, a paperback with the last third torn out. A wooden mallet, handle worn smooth.' },
    // Flooded bay
    lamp(24, 17, 'The light reaches the water and stops.'),
    { id: 'obj.sunk_vending', art: 'obj.vending', x: 21, y: 22, label: 'Vending machine', text: 'Half under. Still lit. Row C is full, down here.' },
    { id: 'obj.shoe', art: 'obj.lost_found', x: 31, y: 24, label: 'On the dry side', text: 'One child\'s shoe, a lunch tin, and a tally cut into the wall in fives. It stops at a hundred and forty.' },
    // Switchyard
    lamp(34, 6, 'Bright enough to read by.'), lamp(45, 20, 'The bulb hums at the same pitch as the rails.'),
    { id: 'obj.switch_a', art: 'none', lever: 'a', x: 35, y: 9, label: 'Switch lever A', text: 'A hand lever, greased. It throws the north line. Somebody uses it.' },
    { id: 'obj.switch_b', art: 'none', lever: 'b', x: 44, y: 14, label: 'Switch lever B', text: 'Rusted in place, pointing at the main line.' },
    { id: 'obj.switch_c', art: 'none', lever: 'c', x: 35, y: 19, label: 'Switch lever C', text: 'Thrown toward the south line. The south line ends in a wall.' },
    { id: 'obj.yard_map', art: 'obj.board', x: 39, y: 5, label: 'Yard diagram', text: 'A paper diagram of the switchyard, corrected in pen by a careful hand. Track numbers down the margin. One line has been added that the tunnel does not have.' },
    // Bypass
    lamp(48, 2, 'Someone has hung a paper lantern over the cage.'),
    { id: 'obj.not_that_way', art: 'obj.graffiti', x: 52, y: 1, label: 'Paint on the wall', text: 'NOT THAT WAY. An arrow points back the way you came. It is the same paint as the arrow that sent you here.' },
    // Signal room
    lamp(48, 21, 'Warm. Recently on.'),
    { id: 'obj.departures', art: 'obj.lobby_monitor', x: 53, y: 20, label: 'Departure board', light: 0.5, text: 'NEXT TRAIN: 1901. PLATFORM: —. Then the board corrects itself, apologises, and shows the same thing.' },
    { id: 'obj.ledger', art: 'obj.security_desk', x: 56, y: 24, label: 'A ledger on a desk', text: 'Names, in a formal hand, one line each, with a time beside every one. Thousands. The last entry is tonight\'s date and has no name yet.' },
    { id: 'obj.signal_chair', art: 'obj.bench', x: 49, y: 24, label: 'A chair', text: 'Wooden. Far too tall for anyone you know. The seat is worn.' },
    // Signal room: the gate's breaker panel (src/content/tunnelPuzzles.js)
    ...['1', '2', '3', '4'].map((k, i) => ({ id: `obj.breaker_${k}`, art: 'obj.breaker_dn', x: 55 + i, y: 21, label: `Breaker ${k}`, breaker: k, text: 'A heavy breaker on the gate panel, painted the yellow of things you are not supposed to touch.' })),
    // The approach
    lamp(60, 11, 'The last lamp. Past it, the dark has a shape.'),
    ...['1', '2', '3'].map((k, i) => ({ id: `obj.siglamp_${k}`, art: 'obj.siglamp_red', x: 59 + i * 2, y: 10, label: `Signal ${k}`, siglamp: k, text: 'A signal lamp on a bracket, with a lens wheel you can turn by hand.' })),
    { id: 'obj.tunnel_on', x: 64, y: 13, label: 'Toward the platform', action: 'exit', to: 'platform', requiresFlag: 'act1.tunnel.gate', lockedText: 'A rolling gate across the line, held three ways: the yard upstream, the power in the signal room, and the signals on this wall.',
      text: 'The tunnel opens onto a platform nobody has used in decades. The drumming stops. Something else is here.' },
  ],
});

const PW = 44, PH = 18;
const p = Array.from({ length: PH }, () => Array(PW).fill('#'));
const P = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (p[j]?.[i] !== undefined) p[j][i] = ch; };
P(1, 2, 42, 11, 'm');                                                          // the platform
P(1, 13, 42, 1, 'p');                                                          // the edge strip
P(1, 14, 42, 3, 'h');                                                          // the trackbed
for (const x of [7, 15, 28, 36]) { P(x, 4, 1, 1, '|'); P(x, 10, 1, 1, '|'); }
P(19, 1, 6, 1, ':');                                                           // the shaft at the back, open to the sky

export const platform = makeMap({
  id: 'platform', name: 'The dead platform beneath College Park',
  layout: p.map((r) => r.join('')),
  spawns: [[3, 7], [3, 8], [4, 7]],
  enemies: [['boss.warden', 30, 7]],
  objects: [
    { id: 'obj.platform_back', art: 'obj.tunnel_on', x: 1, y: 7, label: 'Back into the tunnel', action: 'exit', to: 'tunnel_1', text: 'Back the way you came.' },
    { id: 'obj.platform_sign', art: 'obj.purple_sign', x: 11, y: 2, label: 'Station sign', text: 'COLLEGE PARK. Someone has scratched out U OF MD and written nothing in its place.' },
    { id: 'obj.platform_bench_w', art: 'obj.bench', x: 10, y: 11, label: 'Bench', text: 'A newspaper, folded to the crossword. Half done. The date is the morning of the Call.' },
    { id: 'obj.platform_bench_e', art: 'obj.bench', x: 33, y: 11, label: 'Bench', text: 'A coat, laid out as if for someone to come back to.' },
    { id: 'obj.platform_clock', art: 'obj.clock_6f', x: 21, y: 2, label: 'Platform clock', light: 0.4, text: '19:01. This one is right twice a day and knows it.' },
    { id: 'obj.platform_lamp_w', art: 'obj.worklamp', x: 5, y: 2, label: 'Lamp', light: 0.8, text: 'Still burning.' },
    { id: 'obj.platform_lamp_e', art: 'obj.worklamp', x: 38, y: 2, label: 'Lamp', light: 0.8, text: 'Still burning.' },
    { id: 'obj.shaft', art: 'obj.tunnel_up', x: 22, y: 1, label: 'Ventilation shaft', light: 0.9, text: 'A shaft up to the street, and past the street, the sky. Rain comes down it. A cable hangs in the middle.' },
  ],
});
