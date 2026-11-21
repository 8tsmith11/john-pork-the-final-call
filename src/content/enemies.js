// Enemy kinds (stable ids; referenced by maps and saves). Coderot villains are generated from
// these bases plus seeded tables (src/content/rotVillains.js, later).
// Field guide tips, revealed after enough kills (Terraria's bestiary model; GameMenu 'guide' tab).
export const GUIDE_TIPS = {
  'enemy.rotling': 'It flashes, then lunges in a straight line. Step aside, or hit it mid-lunge to parry it open.',
  'enemy.spitter': 'Three-shot fan, led at where you are going. Swing through the shots to send them back.',
  'enemy.moth': 'The hum puts you to sleep. Caffeine keeps you up; otherwise close fast or stay out of reach.',
  'enemy.captcha': 'Armoured until it charges. Dodge the dash and it reels: double damage while it is dizzy.',
  'enemy.autocomplete': 'It copies how you move. Change direction often and it guesses wrong.',
  'enemy.rot_taken': 'Slow, in packs, and it infects. Knock them into walls and keep moving.',
  'enemy.drone_walker': 'When it rises on its legs, get out of the ring. Hit it while it is planted and launching.',
  'enemy.rot_drone': 'Weak, fast and erratic. Swat them before they swarm you; the troopers help.',
};
export const GUIDE_STATS_AT = 5, GUIDE_TIP_AT = 15;

export const ENEMIES = {
  'enemy.rot_taken': {
    name: 'Code-rot-taken', hp: 42, speed: 26, damage: 8, radius: 6, xp: 10,
    ai: 'swarm', alertRange: 280, touchCooldown: 1.3, infection: 8, color: 0xd417c8,
    lore: 'A person whose degraded lace now drives the body.',
  },
  'enemy.rotling': {
    name: 'Rotling', hp: 26, speed: 46, damage: 11, radius: 6, xp: 6,
    // Circles you with the pack, flashes, then lunges in a straight line (dodge it), then stands open.
    ai: 'lunge', orbit: 34, windup: 0.45, lungeSpeed: 200, lungeTime: 0.26, recover: 0.55, touchCooldown: 1.1, color: 0x7fb069,
    lore: 'A knot of rotted firmware that found a body in the trash. It still thinks it is a delivery drone.',
  },
  'enemy.spitter': {
    name: 'Glitch Spitter', hp: 20, speed: 30, damage: 7, radius: 6, xp: 8,
    // Strafes at range, backs off if you close in, telegraphs a 3-shot fan aimed where you're going.
    ai: 'kite', range: 90, fireCooldown: 2.0, shotSpeed: 105, burst: 3, spread: 0.22, telegraph: 0.4, lead: true, color: 0xb3589c,
    lore: 'It spits corrupted packets. They sting like static and smell like burnt sugar.',
  },
  // D-017 (BagelMeister). Sprites: assets/sprites/bagel_enemies (tools/art/gen_bagel_enemies.py).
  'enemy.moth': {
    name: 'Hold-Music Moth', hp: 22, speed: 30, damage: 4, radius: 6, xp: 10,
    ai: 'lullaby', lullaby: true, keepAway: [44, 70], touchCooldown: 1.0, color: 0xc8c2e8,
    lore: 'Coderot that grew out of a call-center queue. It hums the hold music until you stop listening, then until you stop.',
  },
  'enemy.captcha': {
    name: 'Captcha', hp: 40, speed: 22, damage: 14, radius: 7, xp: 12, armor: 0.3,
    ai: 'charge', windup: 0.6, dashSpeed: 210, dashTime: 0.5, dizzy: 1.2, touchCooldown: 0.6, color: 0x7a8794,
    lore: 'A grid of checkboxes that wants to know if you are a robot. Whatever you answer, it charges.',
  },
  'enemy.autocomplete': {
    name: 'Autocomplete', hp: 14, speed: 58, damage: 8, radius: 5, xp: 7,
    ai: 'mirror', mirrorRange: 120, dashSpeed: 240, dashTime: 0.22, touchCooldown: 0.7, color: 0x3fd0d6,
    lore: 'It finishes your sentences. It finishes your dodges. It is usually wrong, but it is fast.',
  },
  // The College Park fight (hub #69, src/engine/skirmish.js): a delivery-drone hub the rot got into, walking now.
  // Its moves live in the skirmish rules, not an `ai` here; it's drawn by src/game/skirmishView.js.
  'enemy.drone_walker': {
    name: 'Rotted drone hub', hp: 900, speed: 16, damage: 16, radius: 14, xp: 120, color: 0x46403a,
    lore: 'A delivery-drone hub the rot moved into. It grew legs out of its loading struts and kept launching, but not parcels.',
  },
  'enemy.rot_drone': {
    name: 'Rot-drone', hp: 12, speed: 62, damage: 6, radius: 4, xp: 3, color: 0x2b2d33,
    lore: 'A delivery drone that still thinks it has a parcel for you.',
  },
};
