// Cyberpunk dressing (human note: "the world doesn't feel very cyberpunk"). Overlay data per map,
// drawn by src/game/render/neon.js on top of the tile maps, so map files stay the level designer's.
// Coordinates are tiles. Colors are palette hexes (tools/art/palette.json) so it matches the art.
//   neon:   { x, y, text, color, size?, flicker? }        a neon sign (glows, flickers, reflects on wet ground)
//   holo:   { x, y, w, h, lines: [...], color }           a holo ad panel cycling lines, with scanlines + glitches
//   glow:   { x, y, color, r }                             a coloured light pool (no sprite)
//   vent:   { x, y }                                       street steam
//   cables: [[x1, y1, x2, y2, sag]]                        overhead cable runs (drawn above everyone)
//   drones: n                                              patrol drones crossing with searchlights (outdoor only)
const C = { cyan: 0x3fd0d6, magenta: 0xd417c8, pink: 0xe87a9c, lime: 0xc8e619, amber: 0xffa23a, red: 0xd42a3c, blue: 0x4f7fd0 };

export const DRESSING = {
  metro_plaza: {
    wet: true,
    drones: 2,
    neon: [
      { x: 68, y: 4, text: 'DINER · 24H', color: C.pink },
      { x: 67, y: 13, text: 'PAWN / BUY · SELL', color: C.amber, flicker: 0.04 },
      { x: 70, y: 17, text: "DELROY'S WHEELS", color: C.lime },
      { x: 67, y: 23, text: 'AUGMENT CLINIC · NO WAIT', color: C.cyan, size: 6 },
      { x: 33, y: 4, text: 'COLLEGE PARK · U OF MD', color: C.blue, size: 6 },
      { x: 23, y: 24, text: 'BOBA', color: C.magenta, flicker: 0.08 },
      { x: 27, y: 24, text: 'ABIERTO', color: C.red, flicker: 0.02 },
      { x: 7, y: 10, text: 'ASTER', color: C.cyan },
      { x: 67, y: 28, text: 'CHARGE · $2/HR', color: C.lime, size: 6 },
    ],
    holo: [
      { x: 38, y: 5, w: 7, h: 3, color: C.cyan, lines: ['CITIZENS,', 'THINGS ARE', 'STABLE.', '', 'CONTINUITY'] },
      { x: 5, y: 5, w: 5, h: 3, color: C.magenta, lines: ['LACE 9', 'FEEL', 'EVERYTHING', 'ONCE.'] },
      { x: 71, y: 25, w: 6, h: 3, color: C.amber, lines: ['NO ONE CAN', 'CODE FASTER', 'THAN AI', '(c) 2031'] },
    ],
    glow: [
      { x: 37, y: 9, color: C.cyan, r: 1.4 }, { x: 74, y: 19, color: C.lime, r: 0.9 }, { x: 72, y: 9, color: C.pink, r: 1.0 },
      { x: 25, y: 25, color: C.magenta, r: 0.9 }, { x: 70, y: 23, color: C.cyan, r: 0.9 },
    ],
    vent: [{ x: 40, y: 32 }, { x: 61, y: 20 }, { x: 15, y: 33 }, { x: 45, y: 26 }],
    cables: [[18, 12, 32, 6, 1.4], [46, 6, 66, 4, 1.6], [56, 10, 66, 13, 0.8], [20, 27, 55, 27, 2.2], [66, 19, 80, 17, 1]],
  },
  aster_lobby: {
    neon: [{ x: 13, y: 12, text: 'ASTER · RESIDENTS ONLY', color: C.cyan, size: 6 }],
    holo: [{ x: 23, y: 0, w: 4, h: 1, color: C.cyan, lines: ['PACKAGES: 0', 'STAY STABLE'] }],
    glow: [{ x: 17, y: 6, color: C.amber, r: 1.2 }, { x: 27, y: 2, color: C.cyan, r: 0.8 }, { x: 18, y: 12, color: C.amber, r: 1.0 }],
  },
  aster_hall: {
    glow: [{ x: 4, y: 2, color: C.magenta, r: 0.8 }],
  },
  room631: {
    glow: [{ x: 13, y: 8, color: C.cyan, r: 0.8 }, { x: 25, y: 6, color: C.magenta, r: 0.7 }],
  },
  tunnel_1: {
    neon: [{ x: 6, y: 2, text: 'GREEN LINE', color: C.lime, flicker: 0.12 }, { x: 40, y: 2, text: 'NO ENTRY · CONTINUITY', color: C.red, flicker: 0.1, size: 6 }],
    holo: [{ x: 20, y: 1, w: 5, h: 2, color: C.lime, lines: ['NEXT TRAIN', '-- MIN', 'NEXT TRAIN', 'NEXT TRAIN'] }],
    glow: [{ x: 33, y: 10, color: C.magenta, r: 1.2 }, { x: 54, y: 12, color: C.lime, r: 0.9 }],
    cables: [[2, 3, 30, 3, 0.8], [32, 3, 64, 3, 0.8]],
  },
  platform: {
    neon: [{ x: 18, y: 1, text: 'COLLEGE PARK', color: C.lime, flicker: 0.2 }],
    glow: [{ x: 22, y: 8, color: C.magenta, r: 1.6 }],
  },
};
