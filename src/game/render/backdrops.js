// Side-view backdrops for cinematics (CinematicScene). Placeholders drawn in code, in layers, so the
// camera can pan with parallax; real painted art can replace any layer later by texture key
// (assets/cine/<backdrop>_<layer>.png, loaded if present). Coordinates are view units (480x270).
// Each backdrop returns [{ key, factor }] from far (factor small, moves little) to near.
const W = 720, H = 270;   // wider than the view so pans have room

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function layer(scene, key, draw) {
  if (scene.textures.exists(key)) return key;     // painted art (or an earlier build) wins
  const g = scene.make.graphics({ add: false });
  draw(g);
  g.generateTexture(key, W, H); g.destroy();
  return key;
}

function gradient(g, top, bottom, y0 = 0, y1 = H) {
  const a = Phaser.Display.Color.IntegerToColor(top), b = Phaser.Display.Color.IntegerToColor(bottom);
  for (let y = y0; y < y1; y += 2) {
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, y1 - y0, y - y0);
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1).fillRect(0, y, W, 2);
  }
}

function towers(g, r, { base, minH, maxH, color, lit, litChance, wMin = 18, wMax = 46 }) {
  for (let x = -10; x < W;) {
    const w = wMin + Math.floor(r() * (wMax - wMin)), h = minH + Math.floor(r() * (maxH - minH));
    g.fillStyle(color, 1).fillRect(x, base - h, w, h + (H - base));
    for (let wy = base - h + 5; wy < base - 4; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 5) {
      if (r() < litChance) g.fillStyle(lit, 0.55 + r() * 0.45).fillRect(wx, wy, 2, 3);
    }
    if (r() < 0.25) g.fillStyle(0xff4d6d, 1).fillRect(x + (w >> 1), base - h - 3, 1, 3);   // antenna light
    x += w + Math.floor(r() * 4);
  }
}

export const BACKDROPS = {
  // College Park at night, 2098: drone lights over the towers, the street in front.
  skyline_night(scene) {
    const r = rng(631);
    return [
      { factor: 0.1, key: layer(scene, 'cine_sky_night', (g) => { gradient(g, 0x070914, 0x2a1f3d); for (let i = 0; i < 90; i++) g.fillStyle(0xffffff, 0.3 + r() * 0.7).fillRect(Math.floor(r() * W), Math.floor(r() * 150), 1, 1); g.fillStyle(0xf2e6c9, 1).fillCircle(560, 52, 13); g.fillStyle(0x070914, 1).fillCircle(566, 48, 12); }) },
      { factor: 0.3, key: layer(scene, 'cine_towers_far', (g) => towers(g, r, { base: 200, minH: 60, maxH: 140, color: 0x161a2e, lit: 0x6fe3e8, litChance: 0.12 })) },
      { factor: 0.6, key: layer(scene, 'cine_towers_near', (g) => towers(g, r, { base: 222, minH: 40, maxH: 110, color: 0x0e1120, lit: 0xffd27f, litChance: 0.2, wMin: 30, wMax: 70 })) },
      { factor: 1, key: layer(scene, 'cine_street', (g) => {
        g.fillStyle(0x1b1d27, 1).fillRect(0, 222, W, 48);
        g.fillStyle(0x2c2f3d, 1).fillRect(0, 222, W, 3);
        for (let x = 10; x < W; x += 40) g.fillStyle(0x5a5d6b, 1).fillRect(x, 246, 18, 2);
        for (let x = 60; x < W; x += 160) { g.fillStyle(0x3a3d4b, 1).fillRect(x, 160, 2, 62); g.fillStyle(0xffe08a, 1).fillRect(x - 4, 158, 10, 3); g.fillStyle(0xffe08a, 0.08).fillTriangle(x + 1, 161, x - 24, 222, x + 26, 222); }
      }) },
    ];
  },
  // Green Line tunnels: arches receding, rails, one work light.
  tunnel(scene) {
    return [
      { factor: 0.2, key: layer(scene, 'cine_tunnel_back', (g) => { gradient(g, 0x05060a, 0x111520); for (let x = 0; x < W; x += 90) { g.lineStyle(6, 0x1c2130, 1).strokeEllipse(x + 45, 150, 120, 200); } }) },
      { factor: 0.6, key: layer(scene, 'cine_tunnel_mid', (g) => { for (let x = 20; x < W; x += 140) { g.fillStyle(0x232838, 1).fillRect(x, 40, 16, 190); g.fillStyle(0x7fb069, 0.5).fillRect(x + 3, 120, 10, 2); } }) },
      { factor: 1, key: layer(scene, 'cine_tunnel_floor', (g) => {
        g.fillStyle(0x15171f, 1).fillRect(0, 214, W, 56);
        for (let x = 0; x < W; x += 12) g.fillStyle(0x3b2f26, 1).fillRect(x, 236, 8, 4);
        g.fillStyle(0x8a8f9a, 1).fillRect(0, 232, W, 2).fillRect(0, 244, W, 2);
        g.fillStyle(0xffd27f, 1).fillRect(400, 60, 8, 4); g.fillStyle(0xffd27f, 0.07).fillTriangle(404, 64, 330, 214, 480, 214);
      }) },
    ];
  },
  // Plain black: title cards, phone screens, voice-only beats.
  black(scene) { return [{ factor: 0, key: layer(scene, 'cine_black', (g) => g.fillStyle(0x000000, 1).fillRect(0, 0, W, H)) }]; },
};
export const BACKDROP_W = W;
