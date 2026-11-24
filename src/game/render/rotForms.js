// Code-drawn sprites for the code rot (src/content/enemies.js: the rot-taken, rotling and spitter redrawn scarier,
// and the further-gone forms: crawler, grafted, sprawl, hulk) until sheet art lands. Two frames each, so they move. Palette: rot magenta and violet, biotech green, riot-gear grey.
// rotFormTexture(scene, kind) returns a texture key (frames '0' and '1'), or null for kinds drawn elsewhere.

const ROT = 0xd417c8, ROT_D = 0x8a1585, VIOLET = 0x9b2fa8, SKIN = 0xc9a48f, SKIN_D = 0x8f6d5c, PALE = 0xd8cfc4;
const BONE = 0xe8e0d0, GREEN = 0x58c27a, GREEN_D = 0x2f7a4a, BARK = 0x5c4a32, STEEL = 0x6b6f86, STEEL_D = 0x3d4052, STEEL_L = 0x9aa0b8;
const BLACK = 0x15171f, HAZARD = 0xf2c94c, GLOW = 0xff4df0, OK = 0x7dff9b;

const SHIRT = 0x4a5266, SHIRT_D = 0x343a4c, PANTS = 0x262a35, HAIR = 0x2a2420, GREY = 0xb3a99f, GREY_D = 0x7d746c, RED_EYE = 0xff3b3b, CYAN = 0x3fd0d6;

// Each form: [width, height, paint(px, frame)]. px(x, y, w, h, color). Feet sit on the bottom row.
const FORMS = {
  // The code-rot-taken (Trevor, 2026-11-23: "they look like kids atm"): an adult, taller than the roommates, hunched,
  // head hanging forward and to one side, jaw slack, arms too long. The lace shows through the skin in rot magenta.
  'enemy.rot_taken': [16, 28, (px, f) => {
    const s = f ? 1 : 0;
    px(5, 20, 3, 7, PANTS); px(9, 20, 3, 6 + s, PANTS); px(5, 27, 3, 1, GREY_D); px(9, 26 + s, 3, 1, GREY_D);   // one leg drags
    px(4, 11, 9, 9, SHIRT); px(4, 11, 9, 1, SHIRT_D); px(5, 19, 2, 1, SHIRT); px(9, 19, 3, 1, SHIRT_D);       // hunched torso, a ragged hem
    px(5, 14, 2, 3, GREY); px(5, 15, 1, 2, ROT); px(10, 12, 2, 4, GREY); px(11, 12, 1, 4, ROT);              // skin through the tears, lace under it
    px(8, 9, 3, 3, GREY); px(10, 10, 1, 1, GLOW);                                                            // the neck forward, the port lit
    px(7, 2, 6, 7, GREY); px(7, 2, 6, 1, HAIR); px(12, 3, 1, 3, HAIR); px(7, 8, 6, 1, GREY_D);               // the head, hanging low and tilted
    px(8, 4, 1, 2, BLACK); px(11, 4, 1, 2, BLACK); px(11, 4, 1, 1, GLOW); px(9, 3, 1, 3, ROT);               // sunken eyes, one lit; a vein
    px(8, 6, 3, 4, BLACK); px(8, 6, 1, 1, BONE); px(10, 6, 1, 1, BONE); px(9, 10, 1, 1, ROT_D);              // the jaw hanging open, drool
    px(2, 11, 2, 10, GREY); px(1, 21, 1, 3, GREY_D); px(3, 21, 1, 3, GREY_D);                                // an arm down past the knee, long fingers
    if (s) { px(13, 10, 3, 2, GREY); px(15, 8, 1, 3, GREY_D); } else { px(13, 11, 2, 7, GREY); px(14, 18, 1, 3, GREY_D); }   // the other one reaching
  }],
  // The rotling: rotted firmware in whatever body it found in the trash. A bag of parts on wire legs, one red lens,
  // a broken drone rotor still turning on its back, and a human hand hanging out of it.
  'enemy.rotling': [16, 14, (px, f) => {
    const s = f ? 1 : 0;
    px(3, 4, 10, 6, 0x2a2d38); px(4, 5, 8, 4, 0x3a3e4c); px(5, 3, 6, 1, 0x2a2d38);
    px(6, 5, 3, 3, 0x7a0f1f); px(7, 6, 1, 1, RED_EYE); px(6, 5, 1, 1, BONE);                                 // the lens
    px(8, 1, 1, 3, STEEL); if (s) px(4, 1, 9, 1, STEEL_L); else px(6, 0, 5, 1, STEEL_L);                     // the rotor, turning
    px(11, 8, 3, 2, SKIN); px(13, 10, 1, 2, SKIN_D); px(12, 10, 1, 1, SKIN_D);                                // the hand
    px(2, 10, 1, 3 + s, STEEL_D); px(4, 10, 1, 4 - s, STEEL_D); px(9, 10, 1, 3 + s, STEEL_D); px(11, 10, 1, 4 - s, STEEL_D);   // wire legs
    px(1, 12 + s, 1, 1, STEEL_D); px(5, 6, 1, 1, ROT); px(10, 9, 1, 1, ROT_D);
  }],
  // The glitch spitter: a person whose jaw split down the middle; corrupted packets glow in the throat.
  'enemy.spitter': [16, 26, (px, f) => {
    const s = f ? 1 : 0;
    px(5, 19, 2, 7, PANTS); px(9, 19, 2, 6 + s, PANTS);
    px(4, 9, 8, 11, 0x3b2a4a); px(4, 9, 8, 1, 0x2a1d36); px(3, 18, 10, 2, 0x3b2a4a);                        // a long coat
    px(5, 12, 6, 2, GREY); px(4, 12, 1, 4, GREY); px(11, 12, 1, 4, GREY);                                    // arms wrapped round the middle
    px(5, 1, 6, 6, GREY); px(5, 1, 6, 1, HAIR); px(6, 3, 1, 1, BLACK); px(9, 3, 1, 1, GLOW);
    px(7, 4, 2, 6, BLACK); px(6, 6, 1, 3, GREY); px(9, 6, 1, 3, GREY);                                       // the face split, the halves hanging
    px(7, 6 + s, 1, 1, CYAN); px(8, 8 - s, 1, 1, ROT); px(7, 9, 1, 1, GLOW);                                 // packets in the throat
    px(6, 7, 1, 1, BONE); px(9, 7, 1, 1, BONE);
  }],
  'enemy.rot_crawler': [12, 10, (px, f) => {
    // A hand gone feral: a palm with a lace node for a heart, running on its fingers.
    const lift = f ? 1 : 0;
    px(3, 3, 6, 4, SKIN); px(4, 3, 4, 1, PALE); px(5, 4, 2, 2, ROT); px(5, 4, 1, 1, GLOW);
    px(1, 6 - lift, 2, 1, SKIN_D); px(0, 7 - lift, 1, 3, SKIN_D);           // fingers as legs, alternating
    px(9, 6 - (1 - lift), 2, 1, SKIN_D); px(11, 7 - (1 - lift), 1, 3, SKIN_D);
    px(3, 7, 1, 3 - lift, SKIN_D); px(8, 7, 1, 2 + lift, SKIN_D); px(6, 7, 1, 3, SKIN_D);
    px(2, 2, 1, 1, ROT_D); px(9, 2, 1, 1, ROT_D); px(4, 1, 1, 1, ROT); px(8, 1, 1, 1, ROT);   // glitch flecks
  }],
  'enemy.rot_graft': [16, 20, (px, f) => {
    // A person overgrown by their implant: bark-skin patches, a cable arm, a status light that still says OK.
    const step = f ? 1 : 0;
    px(5, 16, 2, 4 - step, BLACK); px(9, 16, 2, 3 + step, BLACK);              // legs
    px(4, 8, 8, 8, 0x4a5a48); px(4, 9, 3, 4, BARK); px(9, 12, 3, 3, BARK);   // torso, bark growth
    px(6, 10, 2, 2, GREEN); px(7, 10, 1, 1, OK);                               // the implant's status light
    px(5, 3, 6, 5, SKIN_D); px(5, 3, 3, 3, BARK); px(9, 5, 1, 1, GLOW);        // half the face taken by bark
    px(11, 2, 2, 2, GREEN_D); px(12, 0, 1, 2, GREEN);                          // a growth breaking out of the skull
    px(2, 9, 2, 6, SKIN_D); px(1, 14, 2, 2, SKIN_D);                           // the human arm
    // The cable arm: thick, wet, reaching, its tip twitching between frames.
    px(12, 9, 2, 2, GREEN_D); px(13, 11, 2, 2, GREEN_D); px(14, 13, 2, 3, GREEN); px(15 - step, 16, 1, 2, GREEN); px(13, 12, 1, 1, GREEN);
  }],
  'enemy.rot_sprawl': [24, 22, (px, f) => {
    // Several people folded into one heaving mass: three faces, too many legs, lace veins over all of it.
    const heave = f ? 1 : 0;
    px(3, 6 + heave, 18, 11 - heave, VIOLET); px(5, 4 + heave, 14, 3, VIOLET); px(2, 9, 2, 6, VIOLET); px(20, 8, 2, 7, VIOLET);
    px(4, 7 + heave, 4, 4, PALE); px(5, 8 + heave, 1, 1, BLACK); px(7, 8 + heave, 1, 1, BLACK); px(5, 10 + heave, 2, 1, ROT_D);   // face 1
    px(10, 3 + heave, 4, 4, SKIN); px(11, 4 + heave, 1, 1, GLOW); px(13, 4 + heave, 1, 1, BLACK); px(11, 6 + heave, 2, 1, BLACK);  // face 2, one eye lit
    px(15, 9, 4, 4, SKIN_D); px(16, 10, 2, 1, BLACK); px(16, 12, 2, 1, BONE);                                                     // face 3, teeth
    px(8, 11, 8, 1, ROT); px(6, 13, 1, 3, ROT); px(12, 12, 1, 4, ROT); px(17, 6, 1, 3, ROT); px(9, 7, 1, 2, ROT);                  // lace veins
    // Legs of different people, out of step.
    px(4, 17, 2, 5 - heave, SKIN_D); px(8, 17, 2, 4 + heave, BLACK); px(12, 17, 2, 5, SKIN_D); px(16, 17, 2, 4 + (1 - heave), BLACK); px(19, 16, 2, 5 - heave, SKIN);
    px(0, 11 + heave, 2, 2, SKIN); px(22, 10 - heave, 2, 2, SKIN);                                                                // arms out of the sides
  }],
  'enemy.rot_hulk': [32, 32, (px, f) => {
    // A riot exoskeleton the rot moved into: plates and hazard stripes, swollen flesh between them, a cracked visor.
    const sway = f ? 1 : 0;
    px(7, 25, 6, 7, STEEL_D); px(19, 25, 6, 7, STEEL_D); px(7, 30, 7, 2, BLACK); px(18, 30, 7, 2, BLACK);   // legs and feet
    px(6, 9, 20, 16, STEEL); px(7, 10, 18, 2, STEEL_L); px(6, 22, 20, 2, HAZARD); px(8, 22, 2, 2, BLACK); px(14, 22, 2, 2, BLACK); px(20, 22, 2, 2, BLACK);
    px(9, 14, 5, 6, ROT_D); px(10, 15, 3, 4, ROT); px(18, 13, 4, 4, VIOLET); px(15, 18, 3, 3, ROT);        // flesh bulging through the plates
    px(11, 2, 10, 8, STEEL_D); px(12, 4, 8, 3, BLACK); px(13, 5, 3, 1, GLOW); px(18, 4, 1, 3, STEEL_L);    // helmet, visor glow, a crack
    px(20, 1, 3, 3, ROT_D);                                                                               // the rot breaking out of the helmet
    // Arms: huge, the right one a hydraulic ram, the left gone to flesh at the wrist.
    px(0, 10 + sway, 6, 12, STEEL_D); px(1, 22 + sway, 5, 5, VIOLET); px(1, 26 + sway, 2, 2, BONE); px(4, 26 + sway, 2, 2, BONE);
    px(26, 10 - sway, 6, 10, STEEL_D); px(27, 20 - sway, 4, 4, STEEL_L); px(28, 24 - sway, 3, 3, BLACK);
    px(2, 12 + sway, 2, 1, HAZARD); px(28, 12 - sway, 2, 1, HAZARD);
  }],
};

/** The texture key for a code-drawn rot form, made on first use; null if this kind isn't one of them. */
export function rotFormTexture(scene, kind) {
  const form = FORMS[kind]; if (!form) return null;
  const key = `rotform:${kind}`;
  if (scene.textures.exists(key)) return key;
  const [w, h, paint] = form;
  const g = scene.make.graphics({ add: false });
  for (let f = 0; f < 2; f++) paint((x, y, ww, hh, c) => g.fillStyle(c, 1).fillRect(x + f * w, y, ww, hh), f);
  g.generateTexture(key, w * 2, h); g.destroy();
  const tex = scene.textures.get(key);
  tex.add('0', 0, 0, 0, w, h); tex.add('1', 0, w, 0, w, h);
  return key;
}

export const ROT_FORMS = Object.keys(FORMS);
