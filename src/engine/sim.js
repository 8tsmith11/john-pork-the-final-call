// Authoritative simulation: pure JS, no Phaser, so the host can run it and node can test it.
// The host steps the Sim with every player's latest input; clients render snapshots.

export const TILE = 16;
export const MOVE = { speed: 72, dodgeSpeed: 230, dodgeTime: 0.22, dodgeCooldown: 0.55, iframes: 0.22 };
const HALF_W = 5, HALF_H = 4; // feet hitbox (characters are 16x24; collide at the feet)

export function emptyInput() {
  return { mx: 0, my: 0, aim: 0, dodge: false, attack: false, interact: false };
}

export class Sim {
  constructor(map) {
    this.map = map;          // { w, h, solid(tx, ty) -> bool, spawns: [{x,y}] }
    this.players = new Map(); // id -> player
    this.tick = 0;
  }

  addPlayer(id, character) {
    const spawn = this.map.spawns[this.players.size % this.map.spawns.length];
    this.players.set(id, {
      id, character, x: spawn.x, y: spawn.y, vx: 0, vy: 0,
      facing: 'down', aim: 0, moving: false,
      dodgeT: 0, dodgeCd: 0, dodgeDx: 0, dodgeDy: 0, iframes: 0,
    });
  }

  removePlayer(id) { this.players.delete(id); }

  step(dt, inputs) {
    this.tick++;
    for (const p of this.players.values()) {
      const inp = inputs.get(p.id) || emptyInput();
      let { mx, my } = inp;
      const len = Math.hypot(mx, my);
      if (len > 1) { mx /= len; my /= len; } // diagonals aren't faster
      p.aim = inp.aim;
      p.dodgeCd = Math.max(0, p.dodgeCd - dt);
      p.iframes = Math.max(0, p.iframes - dt);

      if (inp.dodge && p.dodgeT <= 0 && p.dodgeCd <= 0) {
        // Dodge toward movement, or toward the aim if standing still.
        const dx = len > 0.1 ? mx : Math.cos(p.aim), dy = len > 0.1 ? my : Math.sin(p.aim);
        const dl = Math.hypot(dx, dy) || 1;
        p.dodgeDx = dx / dl; p.dodgeDy = dy / dl;
        p.dodgeT = MOVE.dodgeTime; p.dodgeCd = MOVE.dodgeCooldown; p.iframes = MOVE.iframes;
      }

      if (p.dodgeT > 0) {
        p.dodgeT -= dt;
        p.vx = p.dodgeDx * MOVE.dodgeSpeed; p.vy = p.dodgeDy * MOVE.dodgeSpeed;
      } else {
        p.vx = mx * MOVE.speed; p.vy = my * MOVE.speed;
      }
      p.moving = Math.hypot(p.vx, p.vy) > 1;
      this._moveAxis(p, p.vx * dt, 0);
      this._moveAxis(p, 0, p.vy * dt);

      // Facing follows the aim (4 directions), so sprites face where you point.
      const a = p.aim;
      p.facing = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? (Math.cos(a) > 0 ? 'right' : 'left') : (Math.sin(a) > 0 ? 'down' : 'up');
    }
  }

  _moveAxis(p, dx, dy) {
    const nx = p.x + dx, ny = p.y + dy;
    if (!this._hits(nx, ny)) { p.x = nx; p.y = ny; }
  }

  _hits(x, y) {
    const x0 = Math.floor((x - HALF_W) / TILE), x1 = Math.floor((x + HALF_W - 0.01) / TILE);
    const y0 = Math.floor((y - HALF_H) / TILE), y1 = Math.floor((y + HALF_H - 0.01) / TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.map.solid(tx, ty)) return true;
    return false;
  }

  /** Compact snapshot for the network and for rendering. */
  snapshot() {
    return {
      tick: this.tick,
      players: [...this.players.values()].map((p) => ({
        id: p.id, c: p.character, x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10,
        f: p.facing, m: p.moving, d: p.dodgeT > 0, a: Math.round(p.aim * 100) / 100,
      })),
    };
  }
}
