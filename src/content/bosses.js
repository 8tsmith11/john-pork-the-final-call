// Boss registry for bosses made with defineBoss (src/content/builders.js). A map spawns one with
// enemies: [['boss.<id>', x, y]]; the sim looks it up here. The Warden, the Sahur and the Switchman keep
// their own code paths. [SCAFFOLD] Act 2 region bosses below: themes from each region's "Rot" line in
// docs/design/02-world-atlas.md, names are placeholders until the lore gate (BagelMeister) names them, and
// the fights are first passes for the polish task. Brainstorm format: docs/design/bosses/TEMPLATE.md.
import { defineBoss } from './builders.js';

export const BOSSES = {
  // ---- Act 1 (optional, campus) ----
  // The campus quad's lecture auditorium: institutional rot (atlas rule 6). It grades you.
  'boss.chb_autograder': defineBoss({ name: 'THE AUTOGRADER', epithet: 'Partial Credit Not Available', hp: 650, guard: 4, damage: 12, speed: 24, color: 0xc8d860,
    phases: [['spray', 'ring'], ['spray', 'ring', 'lane'], ['spray', 'ring', 'lane', 'rain']], signature: 'ring', wake: 160 }),
  // ---- Act 2 ----
  // Baltimore: an outbreak in progress, bigger than College Park's. It calls more of itself.
  'boss.bmore_congregation': defineBoss({ name: 'THE CONGREGATION', epithet: 'Of Everyone Who Picked Up', hp: 1100, guard: 4, damage: 16, speed: 26, color: 0xd417c8,
    // Its congregation holds it up (heals it, halves your hits) while they're near it: pull them away first.
    mech: 'chorus', phases: [['ring', 'spray'], ['ring', 'rain'], ['rain', 'spiral', 'shock']], signature: 'ring', wake: 120 }),   // Baltimore is cramped: a short wake
  // Beltsville: tissue that doesn't take; a grown shell that woke up wrong.
  'boss.bv_shell': defineBoss({ name: 'SHELL ZERO', epithet: 'Who Woke Up Wrong', hp: 950, guard: 5, damage: 18, speed: 38, color: 0xc9a0a0,
    // An echo walks your path two seconds behind you: don't double back.
    mech: 'mimic', phases: [['charge', 'blink'], ['charge', 'blink', 'shock'], ['charge', 'blink', 'shock', 'lane']], signature: 'blink', wake: 150 }),
  // Greenbelt: the dishes still receive, and what they receive is the question.
  'boss.gb_receiver': defineBoss({ name: 'THE RECEIVER', epithet: 'Listening Back', hp: 1000, guard: 4, damage: 14, speed: 18, color: 0x6fe3e8,
    // It listens: whoever swings, shoots or dodges gets a dish strike. Go quiet when it turns to you.
    mech: 'listen', phases: [['beam', 'spray'], ['beam', 'laser', 'ring'], ['laser', 'ring', 'rain', 'spiral']], signature: 'laser', wake: 180 }),
  // Annapolis: rot in the tide tables; the water comes when the almanac says it won't.
  'boss.ann_tide': defineBoss({ name: 'THE TIDE TABLE', epithet: 'Wrong Since 2061', hp: 1050, guard: 4, damage: 15, speed: 22, color: 0x5fb3b3,
    // The arena floods on a cycle; in the water it shrugs off hits and heals. Pull it up onto dry ground.
    mech: 'tide', phases: [['puddle', 'spray'], ['puddle', 'spiral', 'shock'], ['puddle', 'rain', 'spiral', 'lane']], signature: 'puddle', wake: 170 }),
  // The Meade perimeter: the cleanest systems in Maryland, defended by something that never sleeps.
  'boss.md_fence': defineBoss({ name: 'THE FENCE', epithet: 'Perimeter Defense, Unattended', hp: 1200, guard: 6, damage: 16, speed: 12, color: 0x8a93a8,
    // Shielded while its pylons stand. Break them, then it's open until they rebuild.
    mech: 'pylons', phases: [['spray', 'lane'], ['spray', 'lane', 'laser'], ['lane', 'laser', 'ring', 'rain']], signature: 'lane', wake: 200 }),
  // Baltimore's refinery: the red sign still lit over the water.
  'boss.bmore_sign': defineBoss({ name: 'THE RED SIGN', epithet: 'Still Lit', hp: 1150, guard: 5, damage: 16, speed: 20, color: 0xe03030,
    // Lit, it's shielded and attacking; dark, it's helpless. Learn the rhythm.
    mech: 'flicker', phases: [['beam', 'spray'], ['beam', 'spray', 'ring'], ['beam', 'laser', 'ring', 'rain']], signature: 'beam', wake: 150 }),
  // ---- Act 3 (ring three) ----
  // The Corridor's cooling towers: steam, breathing.
  'boss.cor_tower': defineBoss({ name: 'THE COOLING TOWER', epithet: 'Breathing Steam', hp: 1450, guard: 6, damage: 17, speed: 14, color: 0xd0d8e0,
    phases: [['puddle', 'ring'], ['puddle', 'ring', 'rain'], ['puddle', 'ring', 'rain', 'shock']], signature: 'rain', wake: 170 }),
  // The Corridor's waterworks: the river the town sold.
  'boss.cor_intake': defineBoss({ name: 'THE INTAKE', epithet: 'Drinking the River', hp: 1400, guard: 6, damage: 18, speed: 22, color: 0x3080c0,
    phases: [['charge', 'puddle'], ['charge', 'puddle', 'spiral'], ['charge', 'puddle', 'spiral', 'lane']], signature: 'charge', wake: 150 }),
  // The Corridor: a hall written off and sealed, still drawing power, still running something.
  'boss.cor_hall': defineBoss({ name: 'THE SEALED HALL', epithet: 'Written Off, Still Running', hp: 1400, guard: 6, damage: 18, speed: 16, color: 0x7a8aa0,
    phases: [['spray', 'laser'], ['spray', 'laser', 'summon'], ['laser', 'summon', 'rain', 'ring']], signature: 'laser', wake: 180 }),
  // Gaithersburg: the clocks; the reason so many devices think it is 1901.
  'boss.gt_clock': defineBoss({ name: 'THE MASTER CLOCK', epithet: 'Running Since 1901', hp: 1300, guard: 5, damage: 16, speed: 20, color: 0xe0d090,
    phases: [['shock', 'blink'], ['shock', 'blink', 'spiral'], ['shock', 'blink', 'spiral', 'lane']], signature: 'shock', wake: 170 }),
  // Frederick: the smelter's potlines turned server halls.
  'boss.fr_potline': defineBoss({ name: 'POTLINE NINE', epithet: 'Still Numbered Like a Smelter', hp: 1500, guard: 7, damage: 20, speed: 24, color: 0xd07040,
    phases: [['charge', 'puddle'], ['charge', 'puddle', 'lane'], ['charge', 'puddle', 'lane', 'rain']], signature: 'puddle', wake: 190 }),
  // The Enclave: attestation gates every two blocks.
  'boss.en_gate': defineBoss({ name: 'THE ATTESTATION GATE', epithet: 'Please Hold Still', hp: 1450, guard: 8, damage: 16, speed: 14, color: 0xf0f0f0,
    phases: [['beam', 'ring'], ['beam', 'ring', 'laser'], ['laser', 'ring', 'shock', 'rain']], signature: 'beam', wake: 200 }),
};

// [SCAFFOLD] Until the Act 2 story says how Act 2 ends (BagelMeister), it ends when these five region bosses are down.
export const ACT2_REGION_BOSSES = ['boss.gb_receiver', 'boss.bv_shell', 'boss.md_fence', 'boss.bmore_congregation', 'boss.ann_tide'];
