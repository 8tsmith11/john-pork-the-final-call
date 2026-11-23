// Act 3 sub-areas (Trevor: "this game must be much larger scale"). Layouts from the scaffold batch, built from text
// grids with the level builder, from the atlas's "To find" and "People" (docs/design/02-world-atlas.md); lines, prop
// art and a small find per area from the polish pass (hub #30, gonman). Spanish: src/i18n/es-act3.js. The finds are
// listed sealed in docs/sealed/secrets-later-acts.md (open it with
// python3 tools/spoilers/seal.py open docs/sealed/secrets-later-acts.md). Named characters (the Meade's people, the
// Director) are deliberately not placed: that's the lore gate's.
import { fromGrid } from './builder.js';

const out = (to, id, label, road = false) => ({ exit: to, id: `obj.${id}_out`, pair: `obj.${to}_to_${id}`, ...(road ? { selfDrawn: true } : { art: 'obj.door' }), label, stepOn: true, text: 'Back outside.' });

// ---- The Corridor: a sealed hall, written off, still drawing power, still running something ----
export const corSealed = fromGrid({
  id: 'cor_sealed', name: 'A sealed hall', fill: 'e', act: 3,
  rows: [
    '##############################',
    '#eeeeeeeeeeeeeeeeeeeeeeeeeeee#',
    '#e$$$$$$$$ee$$$$$$$$ee$$$$$ee#',
    '#eeeeeeeeeeeeeeeeeeeeeeeeeeee#',
    '#e$$$$$$$$ee$$$$$$$$ee$$$$$ee#',
    '#eeeEeeeeeeeeeeeEeeeeeeeeeE?e#',
    '#e$$$$$$$$ee$$$$$$$$ee$$$$$ee#',
    '#eeeeeeeeeeeFe@eeeeeeeeeeeeee#',
    '##############DD##############',
  ],
  legend: {
    $: { scenery: 'obj.server_rack', solid: true, tile: 'e' },   // the rows of racks, still running
    '?': { prop: 'obj.utilitybox', id: 'obj.cor_meters', label: 'Water meters',
      text: 'A bank of water meters on the end wall, where the cooling loop comes in from the river main: brass dials under glass, one for each row of racks, the glass fogged from inside. Under each, a valve wheel, chained open.' },
    // By the dock door, the whole hall's length from the meters and their guardian.
    F: { prop: 'obj.fridge', id: 'obj.cor_chiller', label: 'Chiller by the dock door', grant: 'item.pack_coolant',
      text: 'A white chiller by the dock door, stenciled HOT AISLE: WEAR A LOOP. Inside, the coolant-loop packs the crews wore between the racks, still cold: the hall was written off with the power on, and the chiller never noticed. One pack is left. You take it.',
      doneText: 'The chiller hums away, cold, with nothing left in it.' },
    E: { enemy: 'enemy.autocomplete' },
    '@': { spawn: true },
    D: out('corridor', 'cor_sealed', 'Back out the loading dock'),
  },
})
  // Region guardian (optional): at the far end of the hall, by the meters it guards.
  .enemy('boss.cor_hall', 27, 3)
  // The sealed-hall puzzle (src/content/puzzles.js, cor_meters): a valve wheel at the end of each row of racks,
  // on the end wall with the meters and their guardian, and what is left of the loop plan.
  .prop('obj.valve_wheel', 28, 2, { id: 'obj.cor_valve_top', label: 'Valve wheel, top row',
    text: 'The valve wheel for the top row of racks, where the river main comes through the wall. Its chain has been cut and hung back up to look whole. Three stops are cast into the collar: I, II, III.' })
  .prop('obj.valve_wheel', 28, 4, { id: 'obj.cor_valve_mid', label: 'Valve wheel, middle row',
    text: 'The valve wheel for the middle row of racks. The paint on the spokes is worn through where hands go, and nowhere else. Three stops are cast into the collar: I, II, III.' })
  .prop('obj.valve_wheel', 28, 6, { id: 'obj.cor_valve_low', label: 'Valve wheel, bottom row',
    text: 'The valve wheel for the bottom row of racks. A second pipe leaves it through the floor, as wide as the one coming in. Three stops are cast into the collar: I, II, III.' })
  .prop('obj.room_sign', 24, 7, { id: 'obj.cor_loop_plan', label: 'Cooling-loop plan',
    text: 'A cooling-loop plan stenciled on the wall, most of it flaked off. What is left: the river main coming in at the top row, a return leaving from the bottom, and a key in the corner. I, TO RACKS. II, ON TO THE NEXT ROW. III, RETURN. Beside the top valve somebody has drawn the water as a small fish, heading down.' })
  .build();

// ---- Gaithersburg: the clock vault (a clock in a glass column; a logbook of leap seconds) ----
export const gtClockroom = fromGrid({
  id: 'gt_clockroom', name: 'The clock vault', fill: 'e', act: 3,
  rows: [
    '#############R########',
    '#eeeeeeeeeeeeeeeeeeee#',
    '#eeeeeeeeCCeeeeeeeeee#',
    '#eeeeeeeeCCeeeeeeeLee#',
    '#eeeeeeeeeeeeeeeeeeee#',
    '#eeeEeeeeeNeeeeeeEeee#',
    '#eeeeeeeee@eeeeeeeeee#',
    '##########DD##########',
  ],
  legend: {
    C: { scenery: 'obj.degasser', solid: true, tile: 'e' },   // the vault's own clock: a fountain clock in its glass column
    L: { prop: 'obj.security_desk', id: 'obj.gt_leapseconds', label: 'Leap-second logbook',
      text: 'The leap-second log, a ledger on the desk beside the clock. Every second the world was ever asked to wait is entered by hand, with the date and two sets of initials, in fountain pen and the same neat hand for decades, until the last line.' },
    N: { npc: 'npc.gt_timekeeper', art: 'npc.rotter_1', label: 'A timekeeper',
      text: '"Wipe your feet." He doesn\'t look up from the clock. "The floor is level to a millimeter and I\'d like it to stay that way. Every faction in the country sets its watch by this room. That\'s why the shooting stops at the fence."' },
    // Hung on the back wall, east of the clock.
    R: { prop: 'obj.clock_6f', id: 'obj.gt_retired_clocks', tile: '#', label: 'Retired clocks', action: 'pages', pages: [
      'A pegboard on the back wall, hung with clocks taken out of service, each one stopped and tagged in manila. The first, a quartz wall clock: RETIRED 2038. REASON: believes it is 1901.',
      'A steel wristwatch on a cracked strap: RETIRED 2052. REASON: owner retired. It is still running. Somebody has added in pencil: STILL THE BEST ONE IN HERE. Somebody else has crossed it out.',
      'A kitchen timer shaped like a tomato: NEVER IN SERVICE. REASON: a joke. The tag has been written on in three different pens, arguing about whether it counts.',
      'A plastic stopwatch on a lanyard, tagged in big capitals: MINE, DO NOT RETIRE. REASON: it beats the master clock. Under that, in the neat hand: NOTED.',
    ] },
    E: { enemy: 'enemy.moth' },
    '@': { spawn: true },
    D: out('gaithersburg', 'gt_clockroom', 'Back up to the lab'),
  },
}).build();

// ---- Frederick: the switchyard, like a steel forest, mountains behind ----
export const frSwitchyard = fromGrid({
  id: 'fr_switchyard', name: 'The switchyard', fill: ',', outdoor: true, act: 3,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'T,PP,PP,PP,PP,PP,PP,PP,PP,PP,,,T',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,H,?,,T',
    'T,ss,ss,ss,,,,,,,,,ss,ss,ss,,,,T',
    'T,,,,,,,,,,,E,,,,,,,,,,,,,,,,,,T',
    'T,ss,ss,ss,,,,,,,,,ss,ss,ss,,E,T',
    'D,,@,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    P: { scenery: 'obj.zip_anchor', solid: true, tile: ',' },    // the back row: line poles, the steel forest
    s: { scenery: 'obj.utilitybox', solid: true, tile: ',' },    // switchgear in rows
    '?': { prop: 'obj.cordon_booth', id: 'obj.fr_dashboard_room', label: 'A control hut',
      text: 'A cinder-block control hut at the far end of the yard, one window, the door held open with a brick. Inside, a long desk faces a wall of screens.' },
    // Against the hut wall, beside its door.
    H: { prop: 'obj.failed_prints', id: 'obj.fr_scrap_tub', label: 'Scrap tub', loot: 'parts',
      text: 'A galvanized tub against the hut wall with SCRAP painted on the side, heaped with what came off the switchgear: cracked porcelain insulators, and under them, coils of cable stripped down to the copper.' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    D: { ...out('frederick', 'fr_switchyard', 'Back to town', true), tile: ',' },
  },
}).build();

// ---- The Enclave: the national archive (parchment, which nothing can rot) ----
// The way out is in the north wall: the Enclave's path to the archive leaves by its south edge, so you walk south in.
export const enArchive = fromGrid({
  id: 'en_archive', name: 'The national archive', fill: '.', act: 3,
  rows: [
    '###########DD###########',
    '#......................#',
    '#..==..==..P...==..==..#',
    '#......................#',
    '#..==..==......==..==..#',
    '#..........N.C.........#',
    '#.....E..........E.....#',
    '#..........@...........#',
    '########################',
  ],
  legend: {
    P: { prop: 'obj.wall_display', id: 'obj.en_parchment', label: 'The original documents',   // the low glass case
      text: 'The original documents in the middle of the hall, in a case of bronze and thick glass, lit low. A rope on posts keeps visitors an arm\'s length back, and they come up to it one at a time.' },
    N: { npc: 'npc.en_functionary', art: 'npc.rotter_2', label: 'A functionary',
      text: '"Attested visitors only." She doesn\'t look at your papers. She is squaring a stack of call slips that was square already. "You\'re attested, I\'m sure. Please don\'t tell me otherwise. There\'s a form for it, and it\'s very long."' },
    // The reading-room desk, beside the functionary.
    C: { prop: 'obj.table', id: 'obj.en_call_slips', label: 'Call slips', action: 'pages', pages: [
      'A tray of call slips on the reading-room desk, the requests visitors filled in today, in pencil. DOCUMENT: the originals. PURPOSE: checking. Most of them say checking.',
      'One is in a child\'s round letters. DOCUMENT: the one with all the names at the bottom. PURPOSE: school. The desk has initialed it and drawn a star.',
      'PURPOSE: my father says they aren\'t the same ones. Across it the desk has written ORIGINALS ON DISPLAY, and under that, in the visitor\'s pencil again: ok.',
      'DOCUMENT: anything. PURPOSE: it\'s warm in here. The desk has initialed that one too.',
    ] },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    D: out('enclave', 'en_archive', 'Back down the marble steps'),
  },
})
  // The parchment puzzle (src/content/puzzles.js, en_parchment): three addresses on lecterns, each with one
  // underlined quote and a stamp dial, and the tray of stamps kept with the originals.
  .prop('obj.flight_log', 10, 4, { id: 'obj.en_quote_wait', label: 'Lectern: an address on patience',
    text: 'A printed address on a lectern, one line underlined in archive pencil: "...the right of the people peaceably to wait." Beside the line is an empty box for a provenance stamp, and set into the lectern, a dial: A, B, C.' })
  .prop('obj.flight_log', 12, 4, { id: 'obj.en_quote_equal', label: 'Lectern: an address on equality',
    text: 'A printed address on a lectern, one line underlined in archive pencil: "...that all are created equal, pending attestation." Beside the line is an empty box for a provenance stamp, and set into the lectern, a dial: A, B, C.' })
  .prop('obj.flight_log', 14, 4, { id: 'obj.en_quote_union', label: 'Lectern: an address on union',
    text: 'A printed address on a lectern, one line underlined in archive pencil: "We the People, in order to form a more perfect Continuity..." Beside the line is an empty box for a provenance stamp, and set into the lectern, a dial: A, B, C.' })
  .prop('obj.key_jar', 13, 2, { id: 'obj.en_stamps', label: 'Provenance stamps',
    text: 'Three archive stamps in a felt tray beside the case, each on a chain to the document it vouches for. Stamp A hangs by the one with all the names at the bottom. Stamp B, by the long one that opens with the people. Stamp C, by the short list of what can\'t be taken away. A card in the tray: A QUOTATION BEARS THE STAMP OF ITS ORIGINAL.' })
  .build();

// ---- The Meade, inside (Act 3): black glass, analysts who haven't been home, a list on a wall ----
export const meadeInside = fromGrid({
  id: 'meade_inside', name: 'The Meade, inside', fill: 'e', act: 3,
  rows: [
    '############################',
    '#eeeeeeee#eeeeeeeee#eeeeeee#',
    '#e??e??ee#eeeeWeeee#eeQeeee#',
    '#eeeeeeee#eeeeeeeee#eeeeeee#',
    '#e??e??eeeeeeeeeeeeeeeeeeee#',
    '#eeeeeeee#eeeeeeeee#eeeeeee#',
    '#eeeEeeee#eeeeNeeee#eeeeEee#',
    '#eeeeeeeeeeeee@eeeeeeeeeeee#',
    '##############DD############',
  ],
  legend: {
    '?': { scenery: 'obj.table', solid: true, tile: 'e' },
    // The wall stays a stub: what the list says is the lore gate's to decide, so nobody gets close enough to read it.
    W: { prop: 'obj.photo_wall', id: 'obj.md_the_wall', label: 'The wall',
      text: 'A list runs the length of the wall, typed sheets pinned edge to edge. A line of yellow tape on the floor keeps everyone a long step back, too far to read a word of it.' },
    Q: { prop: 'obj.boxes', id: 'obj.md_intercepts', label: 'Intercepts',
      text: 'Archive boxes of intercepts at the back of the room: transcripts of calls in grey folders, each stamped with a date and a time to the second. Most are calls between phones that were switched off at the time.' },
    N: { npc: 'npc.md_analyst', art: 'npc.rotter_3', label: 'An analyst',
      text: '"Is it still raining out there?" There is a cot folded behind his chair and a toothbrush standing in his pen cup. "It was raining when I came in. I keep meaning to go and look."',
      later: [{ if: 'q.md_coffee.given', text: 'The cold brew can stands on his desk, rinsed out, with his pens in it now. "People come by to look at it," he says. "I tell them it\'s from outside."' }] },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    D: out('meade', 'meade_inside', 'Back out to the perimeter'),
  },
}).build();
