// Enemy kinds (stable ids; referenced by maps and saves). Coderot villains are generated from
// these bases plus seeded tables (src/content/rotVillains.js, later).
export const ENEMIES = {
  'enemy.rotling': {
    name: 'Rotling', hp: 26, speed: 46, damage: 9, radius: 6, xp: 6,
    ai: 'chase', touchCooldown: 0.8, color: 0x7fb069,
    lore: 'A knot of rotted firmware that found a body in the trash. It still thinks it is a delivery drone.',
  },
  'enemy.spitter': {
    name: 'Glitch Spitter', hp: 20, speed: 30, damage: 7, radius: 6, xp: 8,
    ai: 'kite', range: 90, fireCooldown: 1.6, shotSpeed: 95, color: 0xb3589c,
    lore: 'It spits corrupted packets. They sting like static and smell like burnt sugar.',
  },
};
