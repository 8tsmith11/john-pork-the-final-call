// Act 3, ring three (docs/design/02-world-atlas.md §12-15), [SCAFFOLD] batch from text grids with the level
// builder (Trevor: "this game must be much larger scale"). The way in: the Beltway road west off Route 1 north,
// open once the regional boss milestone is met. All "[scaffold]" lines come from the readable atlas. The
// Act 3 story, and the final fight, are the lore gate's (BagelMeister).
import { fromGrid } from './builder.js';

const road = (to, id, pair, label, text, tile) => ({ exit: to, id, pair, label, text, stepOn: true, selfDrawn: true, ...(tile ? { tile } : {}) });
const back = (id, label, tile) => road('beltway', `obj.${id}_out`, `obj.bw_to_${id}`, label, 'Back to the Beltway.', tile);

// ---- The Beltway: the ring road outside the Enclave wall, branching to ring three ----
export const beltway = fromGrid({
  id: 'beltway', name: 'The Beltway', fill: ',', outdoor: true, act: 3,
  rows: [
    'TTTTTTTTTFFTTTTTTTTTTTTTTGGTTTTTTTTTTTT',
    'Tggggggggsssgggggggggggggsssggggggggggg',
    'Tggggggggsssgggggggg?ggggsssggggggggggg',
    'Tggggggggsssgggggggggggggsssggggggggggg',
    'C,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'TgggggggggggggggggsssgggggNgggggggggggT',
    'T=================sss=================T',
    'Tgggggggggggg@gggggsssgggggggggggggggggT',
    'TTTTTTTTTTTTTTTTTTTEETTTTTTTTTTTTTTTTTT',
  ].map((r) => r.padEnd(39, 'T').slice(0, 39)),
  legend: {
    F: road('frederick', 'obj.bw_to_frederick', 'obj.frederick_out', 'North-west to Frederick', 'Toward the valley and the switchyard.', 's'),
    G: road('gaithersburg', 'obj.bw_to_gaithersburg', 'obj.gaithersburg_out', 'North to Gaithersburg', 'A deer fence, and labs behind it.', 's'),
    C: road('corridor', 'obj.bw_to_corridor', 'obj.corridor_out', 'West into the Corridor', 'The night is brown that way.', ','),
    R: road('route1_north', 'obj.bw_to_r1n', 'obj.r1n_to_beltway', 'East, back to Route 1', 'Back toward College Park.', ','),
    E: road('enclave', 'obj.bw_to_enclave', 'obj.enclave_out', 'The Enclave gate', 'An attestation gate, and the wall behind it.', 's'),
    '?': { prop: 'obj.board', label: 'Beltway sign', text: '[scaffold] INNER LOOP: ATTESTED TRAFFIC ONLY. Someone has added, in small letters: "and the rest of you."' },
    N: { npc: 'npc.bw_driver', art: 'npc.rotter_3', label: 'A trucker on the shoulder', text: '[scaffold] "Twenty years on the loop. Never once been let off it."' },
    '@': { spawn: true },
  },
}).enemy('enemy.captcha', 34, 7).build();

// ---- 12. The Corridor: windowless halls to the horizon, cooling towers breathing steam ----
export const corridor = fromGrid({
  id: 'corridor', name: 'The Corridor', fill: ',', outdoor: true, act: 3,
  rows: [
    '##################################',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
    '#,########,,,,########,,,,WW,,,,,#',
    '#,#eeeeee#,,,,#eeeeee#,,,,WW,,,,,#',
    '#,#eee$ee#,,,,#eeeeee#,,,,,,,,WW,#',
    '#,#eeeeee#,,,,#eeEeee#,,,,,,,,WW,#',
    '#,####e###,,,,####e###,,,,,,,,,,,#',
    '#,,,,,,,,,,,,,,,,,,,,,,,,N,,,,,,,#',
    '#,,,,E,,,,,,,,,,,,,?,,,,,,,,,,,E,R',
    '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,@,,,#',
    '##################################',
  ],
  legend: {
    W: { scenery: 'obj.degasser', solid: true, tile: ',' },
    $: { prop: 'obj.crate', label: 'Server rack', loot: 'parts', text: '[scaffold] A rack from a hall written off and sealed. Still drawing power. Still running something.' },
    '?': { prop: 'obj.board', id: 'obj.cor_handbook', label: 'Employee handbook', text: '[scaffold] An employee handbook from the Slop Decades, with the slogan on its cover.' },
    N: { npc: 'npc.cor_nightshift', art: 'npc.rotter_1', label: 'A night-shift worker', text: '[scaffold] "I talk to the machines. The thing is, they answer."' },
    E: { enemy: 'enemy.autocomplete' },
    '@': { spawn: true },
    R: back('corridor', 'East, back to the Beltway', ','),
  },
}).enemy('boss.cor_hall', 6, 4)
  .exit('cor_sealed', 18, 0, { id: 'obj.corridor_to_cor_sealed', selfDrawn: true, stepOn: true, pair: 'obj.cor_sealed_out', label: "A sealed hall's loading dock", text: 'The dock door is chained. The chain has been cut.' })   // act3_more.js
  
  .exit('cor_town', 24, 10, { id: 'obj.corridor_to_cor_town', selfDrawn: true, stepOn: true, pair: 'obj.town_to_corridor', label: 'South to the worker town', text: 'Houses between the halls.' })   // districts.js
  .build();

// ---- 13. Gaithersburg: the standards (the second, the kilogram, the volt) ----
export const gaithersburg = fromGrid({
  id: 'gaithersburg', name: 'Gaithersburg: the standards', fill: 'g', outdoor: true, act: 3,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T============================T',
    'T=gggggggggggggggggggggggggg=T',
    'T=g########gggggg########gg=T',
    'T=g#eeeeee#gggggg#eeeeee#gg=T',
    'T=g#ee?eee#gggNgg#ee$eee#gg=T',
    'T=g####e###gggggg####e###gg=T',
    'T=gggggggggqqqqqqgggggggggg=T',
    'T=ggggEggggqqqqqqggggggEg@g=T',
    'T=========================gg=T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTSSTT',
  ].map((r) => r.padEnd(30, 'T').slice(0, 30)),
  legend: {
    '?': { prop: 'obj.board', id: 'obj.gt_master_clock', label: 'The master clock', text: '[scaffold] The master clock. Somewhere on this campus is the reason so many devices think it is 1901.' },
    $: { prop: 'obj.crate', id: 'obj.gt_cradle', label: 'Reference weights', text: '[scaffold] A room of reference weights, one cradle empty.' },
    N: { npc: 'npc.gt_physicist', art: 'npc.rotter_2', label: 'A physicist', text: '[scaffold] "Everyone needs to know what time it is. Nobody wants to know why it\'s wrong."' },
    E: { enemy: 'enemy.moth' },
    '@': { spawn: true },
    S: back('gaithersburg', 'South, back to the Beltway', 'g'),
  },
}).enemy('boss.gt_clock', 6, 4)
  .exit('gt_clockroom', 20, 3, { id: 'obj.gaithersburg_to_gt_clockroom', art: 'obj.door', pair: 'obj.gt_clockroom_out', label: 'Down to the clock vault', text: 'Stairs down. A tick, from below.' })   // act3_more.js
  
  .exit('gt_labs', 23, 3, { id: 'obj.gaithersburg_to_gt_labs', art: 'obj.door', pair: 'obj.gt_labs_out', label: 'The measurement labs', text: 'Every faction checks its clocks here.' })   // stretch.js
  .build();

// ---- 14. Frederick and the Smelter: a market town, potlines turned server halls, a switchyard like a forest ----
export const frederick = fromGrid({
  id: 'frederick', name: 'Frederick and the Smelter', fill: 'g', outdoor: true, act: 3,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'Tqqqqqqqqqqqqgggg,,,,,,,,,,,,,,,,,,T',
    'Tq###q###q###gggg,WW,WW,WW,WW,WW,,,T',
    'Tq#o#q#$#q#o#gggg,,,,,,,,,,,,,,,,,,T',
    'Tqqqqqqqqqqqqgggg,WW,WW,WW,WW,WW,,,T',
    'TqqqqqqNqqqqqgggg,,,,,,,,,,,,,,,,,,T',
    'Tqqqqqqqqqqqqgggg,,,########,,,,,,,T',
    'Tqqqqq?qqqqqqqqqq,,,#eeeeee#,,E,,,,T',
    'Tqqqqqqqqqqq@qqqq,,,###e####,,,,,,,T',
    'TTTTTTTTTTTTSSTTTTTTTTTTTTTTTTTTTTTT',
  ],
  legend: {
    W: { scenery: 'obj.degasser', solid: true, tile: ',' },
    o: { prop: 'obj.board', label: 'Market storefront', text: '[scaffold] Brick, a church spire behind it. The town is ordinary and frightened.' },
    $: { prop: 'obj.crate', id: 'obj.fr_guestbook', label: 'A guest book', text: '[scaffold] A guest book. The handwriting changes over the decades. Some of the names don\'t.' },
    '?': { prop: 'obj.board', id: 'obj.fr_potlines', label: 'Potline numbering', text: '[scaffold] The server halls still follow the smelter\'s potline numbers.' },
    N: { npc: 'npc.fr_old_woman', art: 'npc.rotter_3', label: 'A very old woman', text: '[scaffold] "I used to work there. Ask me what they made. Go on."' },
    E: { enemy: 'enemy.rot_taken' },
    '@': { spawn: true },
    S: back('frederick', 'South-east, back to the Beltway', 'q'),
  },
}).enemy('boss.fr_potline', 22, 1)
  .exit('fr_switchyard', 35, 8, { id: 'obj.frederick_to_fr_switchyard', selfDrawn: true, stepOn: true, pair: 'obj.fr_switchyard_out', label: 'East into the switchyard', text: 'Steel towers like a forest.' })   // act3_more.js
  
  .exit('fr_market', 5, 0, { id: 'obj.frederick_to_fr_market', art: 'obj.door', pair: 'obj.fr_market_out', label: 'The market hall', text: 'Brick, a bell over the door.' })   // stretch.js
  .build();

// ---- 15. The Enclave: Washington inside the wall; everything works, nobody on the grass ----
export const enclave = fromGrid({
  id: 'enclave', name: 'The Enclave', fill: 'g', outdoor: true, act: 3,
  rows: [
    '##################SS################',
    '#qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq#',
    '#q==q==q==q==qqqqqqqqqq==q==q==q==q#',
    '#qqqqqqqqqqqqqqqq?qqqqqqqqqqqqqqqqq#',
    '#ggggggggggggggggggggggggggggggggggg#',
    '#gMggggggggggggggggggggggggggggggMg#',
    '#ggggggggggggggggggggggggggggggggggg#',
    '#qqqqqqqqqqqqNqqqqqqqqqqqqqqqqqq$qq#',
    '#qqqqqqqEqqqqqqqqq@qqqqqqqqqEqqqqqq#',
    '####################################',
  ].map((r) => r.padEnd(36, '#').slice(0, 36)),
  legend: {
    M: { scenery: 'obj.degasser', solid: true, tile: 'g' },
    '?': { prop: 'obj.board', id: 'obj.en_metro', label: 'Metro entrance', text: '[scaffold] A metro that runs on time and announces stations in a single calm voice.' },
    $: { prop: 'obj.crate', id: 'obj.en_archive', label: 'The national archive', text: '[scaffold] The original documents, on parchment, which nothing can rot.' },
    N: { npc: 'npc.en_cleaner', art: 'npc.rotter_1', label: 'A cleaner', text: '[scaffold] A cleaner in a grown body. "Don\'t walk on the grass. Nobody walks on the grass."' },
    E: { enemy: 'enemy.captcha' },
    '@': { spawn: true },
    S: back('enclave', 'Out through the gate, to the Beltway', 'q'),
  },
}).enemy('boss.en_gate', 32, 5)
  .exit('en_archive', 4, 9, { id: 'obj.enclave_to_en_archive', selfDrawn: true, stepOn: true, pair: 'obj.en_archive_out', label: 'The national archive', text: 'Marble steps. The doors open on schedule.' })   // act3_more.js
  
  .exit('en_mall', 10, 0, { id: 'obj.enclave_to_en_mall', selfDrawn: true, stepOn: true, pair: 'obj.en_mall_out', label: 'North to the mall', text: 'Long and green and empty.' })   // stretch.js
  .exit('en_metro', 14, 9, { id: 'obj.enclave_to_en_metro', selfDrawn: true, stepOn: true, pair: 'obj.en_metro_out', label: 'Down to the metro', text: 'On time. Always.' })   // stretch.js
  .build();
