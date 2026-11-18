// Cyberpunk layer: neon signs, holo ads, coloured light, drones with searchlights, steam, cables.
// Data: src/content/maps/dressing.js. Everything here is cosmetic and local to each screen.
//
// Lighting note: the darkness layer is drawn by the UI camera after the world, so coloured light
// can't live in the world. We keep a second screen-space render texture (`glow`, ADD blend) that is
// redrawn every frame from world positions, the same way the darkness layer erases its light pools.
import { DRESSING } from '../../content/maps/dressing.js';
import { VIEW } from '../../view.js';

const TILE = 16;

export class Neon {
  constructor(scene) {
    this.scene = scene;
    this.objs = [];
    this.glowRT = scene.add.renderTexture(0, 0, VIEW.w, VIEW.h).setOrigin(0, 0).setScrollFactor(0).setDepth(8002).setBlendMode('ADD');
    this.L = scene.make.image({ key: 'light', add: false });
  }

  destroy() { for (const o of this.objs) o.destroy?.(); this.objs = []; this.drones = []; this.signs = []; this.holos = []; this.vents = []; }

  build(map) {
    this.destroy();
    const s = this.scene, d = DRESSING[map.id] ?? {};
    this.map = map; this.d = d; this.signs = []; this.holos = []; this.drones = []; this.vents = [];
    this.glows = (d.glow ?? []).map((g) => ({ x: g.x * TILE + 8, y: g.y * TILE + 8, color: g.color, r: g.r ?? 1 }));
    for (const n of d.neon ?? []) {
      const t = s.add.text(n.x * TILE, n.y * TILE + 4, n.text, { fontFamily: '"Pixelify Sans", monospace', fontSize: `${n.size ?? 7}px`, color: '#ffffff', heading: true })
        .setOrigin(0, 0.5).setTint(n.color).setDepth(n.y * TILE + 30);
      t.setShadow(0, 0, '#' + n.color.toString(16).padStart(6, '0'), 4, false, true);
      const sign = { t, n, on: true, cx: n.x * TILE + t.width / 2, cy: n.y * TILE + 4 };
      this.objs.push(t);
      if (d.wet) {   // a smeared reflection on the wet street below the sign
        const r = s.add.text(n.x * TILE, n.y * TILE + 22, n.text, { fontFamily: '"Pixelify Sans", monospace', fontSize: `${n.size ?? 7}px`, color: '#ffffff', heading: true })
          .setOrigin(0, 0.5).setTint(n.color).setAlpha(0.18).setScale(1, -1.6).setDepth(2).setBlendMode('ADD');
        sign.r = r; this.objs.push(r);
      }
      this.signs.push(sign);
    }
    for (const h of d.holo ?? []) {
      const x = h.x * TILE, y = h.y * TILE, w = h.w * TILE, hh = h.h * TILE;
      const g = s.add.graphics().setDepth(y + hh + 20).setBlendMode('ADD');
      const t = s.add.text(x + w / 2, y + hh / 2, h.lines[0], { fontFamily: '"Pixelify Sans", monospace', fontSize: '6px', color: '#ffffff', align: 'center', heading: true })
        .setOrigin(0.5).setTint(h.color).setDepth(y + hh + 21);
      this.holos.push({ h, g, t, x, y, w, hh, i: 0, at: 0 }); this.objs.push(g, t);
    }
    for (const v of d.vent ?? []) this.vents.push({ x: v.x * TILE + 8, y: v.y * TILE + 8, acc: Math.random() });
    if (d.cables?.length) {
      const g = s.add.graphics().setDepth(9999 * TILE);
      for (const [x1, y1, x2, y2, sag] of d.cables) {
        g.lineStyle(1, 0x0d0b1a, 0.9);
        const pts = []; for (let i = 0; i <= 16; i++) { const k = i / 16; pts.push({ x: (x1 + (x2 - x1) * k) * TILE, y: (y1 + (y2 - y1) * k) * TILE + Math.sin(Math.PI * k) * sag * TILE }); }
        g.strokePoints(pts);
        g.lineStyle(1, 0x332e57, 0.6); g.strokePoints(pts.map((p) => ({ x: p.x, y: p.y + 1 })));
      }
      this.objs.push(g);
    }
    const nd = map.outdoor ? (d.drones ?? 0) : 0;
    for (let i = 0; i < nd; i++) this._spawnDrone(i * 0.5);
  }

  _spawnDrone(delayFrac = 0) {
    const s = this.scene, W = this.map.w * TILE, H = this.map.h * TILE;
    const ltr = Math.random() < 0.5, y = H * (0.15 + Math.random() * 0.6);
    const body = s.add.container(ltr ? -40 : W + 40, y).setDepth(9999 * TILE + 5);
    const g = s.add.graphics();
    g.fillStyle(0x17142b).fillRect(-5, -2, 10, 4).fillStyle(0x332e57).fillRect(-7, -3, 3, 1).fillRect(4, -3, 3, 1).fillStyle(0x7a8794).fillRect(-1, 2, 2, 1);
    const blink = s.add.rectangle(ltr ? 4 : -4, -1, 1, 1, 0xd42a3c);
    body.add([g, blink]); this.objs.push(body);
    this.drones.push({ body, blink, vx: (ltr ? 1 : -1) * (26 + Math.random() * 14), sweep: Math.random() * 6, t: -delayFrac * 12, W });
  }

  update(dt, cam) {
    if (!this.map) return;
    const now = this.scene.time.now / 1000;
    for (const sg of this.signs) {
      const f = sg.n.flicker ?? 0.01;
      if (Math.random() < f * dt * 60 * 0.15) sg.on = !sg.on || Math.random() < 0.7;
      const a = sg.on ? 0.92 + Math.sin(now * 9 + sg.cx) * 0.06 : 0.18;
      sg.t.setAlpha(a); if (sg.r) sg.r.setAlpha(a * 0.2);
    }
    for (const h of this.holos) {
      if (now - h.at > 1.6) { h.at = now; h.i = (h.i + 1) % h.h.lines.length; h.t.setText(h.h.lines[h.i] || ' '); }
      const glitch = Math.random() < 0.03;
      h.g.clear().fillStyle(h.h.color, glitch ? 0.22 : 0.1).fillRect(h.x, h.y, h.w, h.hh).lineStyle(1, h.h.color, 0.5).strokeRect(h.x + 0.5, h.y + 0.5, h.w - 1, h.hh - 1);
      for (let yy = h.y + ((now * 12) % 3); yy < h.y + h.hh; yy += 3) h.g.fillStyle(h.h.color, 0.08).fillRect(h.x, yy, h.w, 1);
      h.t.setX(h.x + h.w / 2 + (glitch ? (Math.random() * 4 - 2) : 0)).setAlpha(glitch ? 0.5 : 0.95);
    }
    for (const v of this.vents) {
      v.acc += dt * 2.2;
      while (v.acc > 1) {
        v.acc -= 1;
        const p = this.scene.add.circle(v.x + Math.random() * 6 - 3, v.y, 2 + Math.random() * 2, 0xbfc8d0, 0.18).setDepth(v.y + 40);
        this.scene.tweens.add({ targets: p, y: v.y - 18 - Math.random() * 10, x: p.x + 6, scale: 3, alpha: 0, duration: 1800, onComplete: () => p.destroy() });
      }
    }
    for (const dr of this.drones) {
      dr.t += dt; if (dr.t < 0) continue;
      dr.body.x += dr.vx * dt; dr.body.y += Math.sin(dr.t * 1.3) * 0.15;
      dr.blink.setVisible(Math.floor(now * 3) % 2 === 0);
      if (dr.body.x < -60 || dr.body.x > dr.W + 60) { dr.body.destroy(); this.drones.splice(this.drones.indexOf(dr), 1); this._spawnDrone(Math.random()); break; }
    }
    this._drawGlow(cam);
  }

  // Coloured light, screen-space, additive.
  _drawGlow(cam) {
    const rt = this.glowRT, L = this.L, z = (this.scene.worldZoom ?? VIEW.zoom) / VIEW.zoom, v = cam.worldView;
    rt.clear();
    const put = (x, y, color, sc, a) => {
      const sx = (x - v.x) * z, sy = (y - v.y) * z;
      if (sx < -80 || sy < -80 || sx > VIEW.w + 80 || sy > VIEW.h + 80) return;
      L.setScale(sc * z).setTint(color).setAlpha(a); rt.draw(L, sx, sy);
    };
    for (const g of this.glows) put(g.x, g.y, g.color, g.r, 0.32);
    for (const sg of this.signs) if (sg.on) put(sg.cx, sg.cy, sg.n.color, 0.75, 0.3);
    for (const h of this.holos) put(h.x + h.w / 2, h.y + h.hh / 2, h.h.color, 0.8, 0.22);
    for (const dr of this.drones) {
      if (dr.t < 0) continue;
      // the searchlight: a cold pool on the ground below and ahead, sweeping
      const gx = dr.body.x + Math.sin(dr.t * 0.9 + dr.sweep) * 30, gy = dr.body.y + 30 + Math.cos(dr.t * 0.7) * 10;
      put(gx, gy, 0xbfe8ff, 0.7, 0.4);
      this.spot = { x: gx, y: gy };
    }
  }

  /** World points the darkness layer should also open up (drone searchlights). */
  lightPoints() { return this.drones.filter((d) => d.t >= 0).map((d) => ({ x: d.body.x + Math.sin(d.t * 0.9 + d.sweep) * 30, y: d.body.y + 30 + Math.cos(d.t * 0.7) * 10, r: 0.6 })); }
}
