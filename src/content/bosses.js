// Boss registry for bosses made with defineBoss (src/content/builders.js). A map spawns one with
// enemies: [['boss.<id>', x, y]]; the sim looks it up here. The Warden, the Sahur and the Switchman keep
// their own code paths. [SCAFFOLD] Act 2 region bosses below: themes from each region's "Rot" line in
// docs/design/02-world-atlas.md, names are placeholders until the lore gate (BagelMeister) names them, and
// the fights are first passes for the polish task. Brainstorm format: docs/design/bosses/TEMPLATE.md.
import { defineBoss } from './builders.js';

export const BOSSES = {
  // Baltimore: an outbreak in progress, bigger than College Park's. It calls more of itself.
  'boss.bmore_congregation': defineBoss({ name: 'THE CONGREGATION', epithet: 'Of Everyone Who Picked Up', hp: 1100, guard: 4, damage: 16, speed: 26, color: 0xd417c8,
    phases: [['summon', 'ring'], ['summon', 'ring', 'rain'], ['summon', 'rain', 'spiral', 'shock']], signature: 'summon', wake: 170 }),
  // Beltsville: tissue that doesn't take; a grown shell that woke up wrong.
  'boss.bv_shell': defineBoss({ name: 'SHELL ZERO', epithet: 'Who Woke Up Wrong', hp: 950, guard: 5, damage: 18, speed: 38, color: 0xc9a0a0,
    phases: [['charge', 'blink'], ['charge', 'blink', 'shock'], ['charge', 'blink', 'shock', 'lane']], signature: 'blink', wake: 150 }),
  // Greenbelt: the dishes still receive, and what they receive is the question.
  'boss.gb_receiver': defineBoss({ name: 'THE RECEIVER', epithet: 'Listening Back', hp: 1000, guard: 4, damage: 14, speed: 18, color: 0x6fe3e8,
    phases: [['beam', 'spray'], ['beam', 'laser', 'ring'], ['laser', 'ring', 'rain', 'spiral']], signature: 'laser', wake: 180 }),
  // Annapolis: rot in the tide tables; the water comes when the almanac says it won't.
  'boss.ann_tide': defineBoss({ name: 'THE TIDE TABLE', epithet: 'Wrong Since 2061', hp: 1050, guard: 4, damage: 15, speed: 22, color: 0x5fb3b3,
    phases: [['puddle', 'spray'], ['puddle', 'spiral', 'shock'], ['puddle', 'rain', 'spiral', 'lane']], signature: 'puddle', wake: 170 }),
  // The Meade perimeter: the cleanest systems in Maryland, defended by something that never sleeps.
  'boss.md_fence': defineBoss({ name: 'THE FENCE', epithet: 'Perimeter Defense, Unattended', hp: 1200, guard: 6, damage: 16, speed: 12, color: 0x8a93a8,
    phases: [['spray', 'lane'], ['spray', 'lane', 'laser'], ['lane', 'laser', 'ring', 'rain']], signature: 'lane', wake: 200 }),
};
