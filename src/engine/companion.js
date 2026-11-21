// AI companions (task 9, human request): roommates nobody is playing are still there, driven by
// this brain. Pure JS (no Phaser) so it runs in the host sim and in Node tests.
//
// Priorities, top first: get out of a rot pool -> dodge an incoming shot -> pick up a downed
// roommate -> fight what's attacking the party -> follow the nearest human. Movement uses a BFS
// over the tile grid (doors count as open, since walking into one opens it); exits are never
// targeted, so a companion can't drag the party through a door. Far behind (a scooter, a fade)
// it catches up by stepping in next to its leader off-screen.
import { emptyInput } from './sim.js';

const TILE = 16;
export const isAi = (id) => typeof id === 'string' && id.startsWith('ai:');

export class CompanionBrain {
  constructor(sim) { this.sim = sim; this.mem = new Map(); }

  inputs() {
    const out = new Map();
    for (const p of this.sim.players.values()) if (isAi(p.id)) out.set(p.id, this._think(p));
    return out;
  }

  _think(p) {
    const sim = this.sim, inp = emptyInput();
    if (p.downed || p.waitExit) return inp;
    const m = this.mem.get(p.id) ?? { path: null, goal: null, repath: 0, stuck: 0, lx: p.x, ly: p.y, skillT: 2 + Math.random() * 3 };
    this.mem.set(p.id, m);
    m.repath -= 1;
    const humans = [...sim.players.values()].filter((q) => !isAi(q.id));
    const leader = humans.filter((q) => !q.downed).sort((a, b) => dist(a, p) - dist(b, p))[0] ?? humans[0];

    // Catch up if left far behind (a scooter, or the map changed under us).
    if (leader && dist(leader, p) > 300) { this._teleportNear(p, leader); m.path = null; return inp; }

    // 1. Out of rot pools.
    const pool = sim.hazards.find((h) => dist(h, p) < h.r + 4);
    if (pool) { const a = Math.atan2(p.y - pool.y, p.x - pool.x); inp.mx = Math.cos(a); inp.my = Math.sin(a); return inp; }

    // 2. Dodge a shot that's about to hit (hostile shots have no owner player id).
    for (const s of sim.shots) {
      if (s.from !== 'enemy') continue;
      const d = Math.hypot(s.x - p.x, s.y - 6 - p.y);
      if (d < 34 && (s.vx * (p.x - s.x) + s.vy * (p.y - s.y)) > 0 && (p.sta ?? 0) > 40) {
        const sl = Math.hypot(s.vx, s.vy) || 1; inp.mx = -s.vy / sl; inp.my = s.vx / sl; inp.dodge = true; return inp;
      }
    }

    // 3. Revive a downed roommate.
    const down = [...sim.players.values()].filter((q) => q.downed).sort((a, b) => dist(a, p) - dist(b, p))[0];
    if (down) {
      if (dist(down, p) > 10) this._steer(p, m, down.x, down.y, inp);
      return inp;
    }

    // 4. Fight: enemies near the party (or chasing this companion).
    const anchor = leader ?? p;
    const foe = [...sim.enemies.values()].filter((e) => !e.dead && !e.pen && (e.hp ?? 1) > 0 && (dist(e, anchor) < 120 || dist(e, p) < 70))
      .sort((a, b) => dist(a, p) - dist(b, p))[0];
    if (foe) {
      const d = dist(foe, p), aim = Math.atan2(foe.y - p.y, foe.x - p.x);
      inp.aim = aim;
      const lowHp = p.hp < 0.3 * (sim.maxHp?.(p) ?? 100);
      if (lowHp && d < 40) { inp.mx = -Math.cos(aim); inp.my = -Math.sin(aim); return inp; } // back off, let the human tank
      if (d > 18) this._steer(p, m, foe.x, foe.y, inp);
      else { inp.attack = true; inp.mx = Math.cos(aim) * 0.2; inp.my = Math.sin(aim) * 0.2; }
      const crowd = [...sim.enemies.values()].filter((e) => !e.dead && !e.pen && dist(e, p) < 80).length;
      if ((m.skillT -= 1 / 60) <= 0 && (crowd >= 2 || foe.boss) && (p.skillCd ?? 0) <= 0) { inp.skill = true; m.skillT = 6 + Math.random() * 6; }
      return inp;
    }

    // 5. Follow, a little behind and to one side so the two companions don't stack.
    if (leader && !leader.downed) {
      const slot = [...sim.players.keys()].filter(isAi).indexOf(p.id);
      const back = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] }[leader.facing ?? 'down'];
      const side = slot === 0 ? 1 : -1;
      const gx = leader.x + back[0] * 18 + back[1] * 12 * side, gy = leader.y + back[1] * 18 + back[0] * 12 * side;
      if (Math.hypot(gx - p.x, gy - p.y) > (p.moving ? 10 : 28)) this._steer(p, m, gx, gy, inp);
    }
    return inp;
  }

  _steer(p, m, gx, gy, inp) {
    // Straight line when it's clear; otherwise BFS waypoints.
    if (this._clear(p.x, p.y, gx, gy)) { m.path = null; return aimAt(p, gx, gy, inp); }
    const gt = `${Math.floor(gx / TILE)},${Math.floor(gy / TILE)}`;
    if (!m.path || m.goal !== gt || m.repath <= 0) { m.path = this._bfs(p, gx, gy); m.goal = gt; m.repath = 20; }
    while (m.path?.length && Math.hypot(m.path[0][0] - p.x, m.path[0][1] - p.y) < 6) m.path.shift();
    if (m.path?.length) aimAt(p, m.path[0][0], m.path[0][1], inp);
    else aimAt(p, gx, gy, inp);
    // Unstick: if we haven't moved in a while, nudge sideways.
    if (Math.hypot(p.x - m.lx, p.y - m.ly) < 0.3) { if (++m.stuck > 20) { inp.mx = -inp.my; inp.my = inp.mx; m.repath = 0; m.stuck = 0; } } else m.stuck = 0;
    m.lx = p.x; m.ly = p.y;
  }

  _passable(tx, ty) {
    const map = this.sim.map, k = `${tx},${ty}`;
    if (map.blocked?.has(k)) return !!map.doors?.get(k);       // doors yes, exits no
    if (tx < 0 || ty < 0 || tx >= map.w || ty >= map.h) return false;
    return !map.solid(tx, ty) || !!map.doors?.get(k);
  }

  _clear(x0, y0, x1, y1) {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6);
    for (let i = 1; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
      for (const [ox, oy] of [[-5, -4], [5, -4], [-5, 4], [5, 4]]) {
        const tx = Math.floor((x + ox) / TILE), ty = Math.floor((y + oy) / TILE);
        if (this.sim.map.solid(tx, ty)) return false;
      }
    }
    return true;
  }

  _bfs(p, gx, gy) {
    const map = this.sim.map, W = map.w, H = map.h;
    const sx = Math.floor(p.x / TILE), sy = Math.floor(p.y / TILE), tx = Math.floor(gx / TILE), ty = Math.floor(gy / TILE);
    const prev = new Int32Array(W * H).fill(-2), q = [sy * W + sx];
    prev[sy * W + sx] = -1;
    let found = -1;
    for (let h = 0; h < q.length && q.length < 6000; h++) {
      const c = q[h], cx = c % W, cy = (c / W) | 0;
      if (cx === tx && cy === ty) { found = c; break; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy, ni = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || prev[ni] !== -2 || !this._passable(nx, ny)) continue;
        prev[ni] = c; q.push(ni);
      }
    }
    if (found < 0) return null;
    const path = [];
    for (let c = found; c >= 0 && prev[c] !== -1; c = prev[c]) path.unshift([(c % W) * TILE + 8, ((c / W) | 0) * TILE + 9]);
    return path;
  }

  _teleportNear(p, leader) {
    for (const [dx, dy] of [[0, 14], [14, 0], [-14, 0], [0, -14], [20, 14], [-20, 14]]) {
      const x = leader.x + dx, y = leader.y + dy;
      if (!this.sim._hits(x, y)) { p.x = x; p.y = y; p.vx = p.vy = 0; return; }
    }
    p.x = leader.x; p.y = leader.y;
  }
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function aimAt(p, x, y, inp) {
  const dx = x - p.x, dy = y - p.y, l = Math.hypot(dx, dy) || 1;
  inp.mx = dx / l; inp.my = dy / l; inp.aim = Math.atan2(dy, dx);
  return inp;
}
