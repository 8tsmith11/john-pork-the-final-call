// Authoritative simulation: pure JS, no Phaser, so the host can run it and node can test it.
// The host steps the Sim with every player's latest input; clients render snapshots.

export const TILE = 16;
import { ENEMIES } from '../content/enemies.js';
import { generateWarden } from '../content/rotVillains.js';

export const MOVE = { speed: 72, dodgeSpeed: 230, dodgeTime: 0.22, dodgeCooldown: 0.55, iframes: 0.22 };
export const COMBAT = {
  maxHp: 100, hurtIframes: 0.6, reviveTime: 2.0, reviveRange: 18, reviveHp: 40,
  melee: { cooldown: 0.38, range: 20, arc: Math.PI * 0.6, damage: 12, knockback: 120 },
  shot: { cooldown: 0.5, speed: 210, damage: 8, life: 0.9 },
};
const HALF_W = 5, HALF_H = 4; // feet hitbox (characters are 16x24; collide at the feet)

export function emptyInput() {
  return { mx: 0, my: 0, aim: 0, dodge: false, attack: false, fire: false, interact: false };
}

export class Sim {
  constructor(map, opts = {}) {
    this.seed = opts.seed ?? 'default';
    this.map = map;          // { w, h, solid(tx, ty) -> bool, spawns: [{x,y}] }
    this.players = new Map(); // id -> player
    this.enemies = new Map(); // id -> enemy
    this.shots = [];          // projectiles
    this.events = [];         // this tick's events for rendering: hits, deaths, shots
    this.tick = 0;
    this._nextId = 1;
    this.spawnEnemies();
  }

  /** Swap to another map, keeping players (placed at the map's spawns). */
  setMap(map) {
    this.map = map; this.shots = []; this.enemies.clear();
    let i = 0;
    for (const p of this.players.values()) {
      const sp = map.spawns[i++ % map.spawns.length];
      Object.assign(p, { x: sp.x, y: sp.y, vx: 0, vy: 0, dodgeT: 0, downed: false, hp: Math.max(p.hp, COMBAT.reviveHp) });
    }
    this.spawnEnemies();
  }

  spawnEnemies() {
    for (const e of this.map.enemies || []) {
      const id = `e${this._nextId++}`;
      if (e.kind === 'boss.warden' && this.bossVariant === 'sahur') {
        // Tung Tung Tung Sahur: cannot be beaten by force. Answering the phone ends it (WorldScene).
        const def = { name: 'TUNG TUNG TUNG SAHUR', epithet: 'the Watchdog', color: 0xa0703c, radius: 9, hp: 99999, speed: 40, damage: 16,
          ai: 'sahur', xp: 80, touchCooldown: 0.9, modules: [] };
        this.enemies.set(id, { id, kind: 'boss.sahur', def, boss: true, sahur: true, phase: 1, x: e.x, y: e.y, hp: def.hp, cd: 0.75, cd2: 2, beat: 0, hurtT: 0, kx: 0, ky: 0, dash: 0, root: 0, fightT: 0 });
        this.events.push({ t: 'boss', name: def.name, epithet: def.epithet, sahur: true });
        continue;
      }
      if (e.kind === 'boss.warden') {
        const w = generateWarden(this.seed, Math.max(1, this.players.size));
        const def = { ...w, hp: w.maxHp, ai: 'boss', xp: 60, touchCooldown: 0.9 };
        this.enemies.set(id, { id, kind: e.kind, def, boss: true, phase: 1, x: e.x, y: e.y, hp: def.hp, cd: 2, cd2: 3, hurtT: 0, kx: 0, ky: 0, dash: 0 });
        this.events.push({ t: 'boss', name: w.name, epithet: w.epithet });
        continue;
      }
      const def = ENEMIES[e.kind];
      this.enemies.set(id, { id, kind: e.kind, x: e.x, y: e.y, hp: def.hp, cd: Math.random(), hurtT: 0, kx: 0, ky: 0 });
    }
  }

  _def(e) { return e.def ?? ENEMIES[e.kind]; }

  get cleared() { return this.enemies.size === 0; }

  addPlayer(id, character) {
    const spawn = this.map.spawns[this.players.size % this.map.spawns.length];
    this.players.set(id, {
      id, character, x: spawn.x, y: spawn.y, vx: 0, vy: 0,
      facing: 'down', aim: 0, moving: false,
      dodgeT: 0, dodgeCd: 0, dodgeDx: 0, dodgeDy: 0, iframes: 0,
      hp: COMBAT.maxHp, downed: false, reviveT: 0, meleeCd: 0, shotCd: 0, swingT: 0,
      mods: { melee: 0, shot: 0, shotCd: 0, armor: 0, maxHp: 0, iframes: 0, dodgeCd: 0, revive: 0 },
    });
  }

  /** Gear/skill modifiers from the save (src/content/items.js playerMods). */
  setMods(id, mods) { const p = this.players.get(id); if (p) { const full = p.hp >= this.maxHp(p); p.mods = mods; if (full) p.hp = this.maxHp(p); } }
  maxHp(p) { return COMBAT.maxHp + (p.mods?.maxHp ?? 0); }
  heal(id, n) { const p = this.players.get(id); if (p && !p.downed) p.hp = Math.min(this.maxHp(p), p.hp + n); }

  removePlayer(id) { this.players.delete(id); }

  step(dt, inputs) {
    this.tick++;
    this.events = [];
    for (const p of this.players.values()) {
      const inp = inputs.get(p.id) || emptyInput();
      p.meleeCd = Math.max(0, p.meleeCd - dt); p.shotCd = Math.max(0, p.shotCd - dt); p.swingT = Math.max(0, p.swingT - dt);
      if (p.downed) { p.vx = p.vy = 0; p.moving = false; continue; }
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
        p.dodgeT = MOVE.dodgeTime; p.dodgeCd = Math.max(0.2, MOVE.dodgeCooldown + (p.mods?.dodgeCd ?? 0)); p.iframes = MOVE.iframes;
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

      if (inp.attack && p.meleeCd <= 0 && p.dodgeT <= 0) this._melee(p);
      if (inp.fire && p.shotCd <= 0 && p.dodgeT <= 0) this._fire(p);

      // Facing follows the walking direction; it only turns toward the cursor while firing a ranged
      // weapon. Standing still keeps the last facing.
      const toFacing = (x, y) => (Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up'));
      if (inp.fire) p.facing = toFacing(Math.cos(p.aim), Math.sin(p.aim));
      else if (p.moving) p.facing = toFacing(p.vx, p.vy);
    }
    this._afterPlayers(dt);
  }

  _afterPlayers(dt) {
    this._stepEnemies(dt);
    this._stepShots(dt);
    this._stepRevives(dt);
  }

  _melee(p) {
    const m = COMBAT.melee;
    p.meleeCd = m.cooldown; p.swingT = 0.15;
    this.events.push({ t: 'swing', id: p.id, a: p.aim });
    for (const e of this.enemies.values()) {
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
      const def = this._def(e);
      if (d > m.range + def.radius) continue;
      let da = Math.atan2(dy, dx) - p.aim; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) > m.arc / 2 && d > def.radius + 4) continue;
      this._hurtEnemy(e, m.damage + (p.mods?.melee ?? 0), dx / (d || 1) * m.knockback, dy / (d || 1) * m.knockback, p.id);
    }
  }

  _fire(p) {
    const c = COMBAT.shot;
    p.shotCd = Math.max(0.15, c.cooldown + (p.mods?.shotCd ?? 0));
    this.shots.push({ x: p.x + Math.cos(p.aim) * 8, y: p.y - 6 + Math.sin(p.aim) * 8, vx: Math.cos(p.aim) * c.speed, vy: Math.sin(p.aim) * c.speed,
      life: c.life, dmg: c.damage + (p.mods?.shot ?? 0), from: 'player', owner: p.id });
    this.events.push({ t: 'shot', id: p.id });
  }

  _hurtEnemy(e, dmg, kx, ky, by) {
    if (e.sahur) { dmg = 1; this.events.push({ t: 'thunk', x: e.x, y: e.y }); }
    e.hp -= dmg; e.hurtT = 0.12;
    if (e.boss) { kx *= 0.15; ky *= 0.15; const f = e.hp / e.def.hp; const ph = f < 0.33 ? 3 : f < 0.66 ? 2 : 1;
      if (ph !== e.phase) { e.phase = ph; this.events.push({ t: 'phase', phase: ph }); } }
    e.kx = kx; e.ky = ky;
    this.events.push({ t: 'hit', x: e.x, y: e.y, dmg, target: e.id, by });
    if (e.hp <= 0) {
      this.enemies.delete(e.id);
      this.events.push({ t: 'kill', x: e.x, y: e.y, kind: e.kind, by, xp: this._def(e).xp, boss: !!e.boss });
    }
  }

  _hurtPlayer(p, dmg) {
    if (p.downed || p.iframes > 0) return;
    dmg = Math.max(1, Math.round(dmg * (1 - (p.mods?.armor ?? 0))));
    p.hp -= dmg; p.iframes = COMBAT.hurtIframes + (p.mods?.iframes ?? 0);
    this.events.push({ t: 'hurt', id: p.id, x: p.x, y: p.y, dmg });
    if (p.hp <= 0) { p.hp = 0; p.downed = true; p.reviveT = 0; this.events.push({ t: 'down', id: p.id }); }
  }

  _nearestPlayer(x, y) {
    let best = null, bd = Infinity;
    for (const p of this.players.values()) {
      if (p.downed) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bd) { bd = d; best = p; }
    }
    return [best, bd];
  }

  _stepEnemies(dt) {
    for (const e of this.enemies.values()) {
      const def = this._def(e);
      e.cd = Math.max(0, e.cd - dt); e.hurtT = Math.max(0, e.hurtT - dt);
      if (e.sahur) { this._stepSahur(e, def, dt); continue; }
      if (e.boss) { this._stepBoss(e, def, dt); continue; }
      // knockback decays
      if (e.kx || e.ky) { this._moveBody(e, e.kx * dt, e.ky * dt, def.radius); e.kx *= 0.82; e.ky *= 0.82; if (Math.hypot(e.kx, e.ky) < 5) e.kx = e.ky = 0; }
      const [target, d] = this._nearestPlayer(e.x, e.y);
      if (!target || d > 220) continue;
      const ux = (target.x - e.x) / (d || 1), uy = (target.y - e.y) / (d || 1);
      if (def.ai === 'chase') {
        if (e.hurtT <= 0) this._moveBody(e, ux * def.speed * dt, uy * def.speed * dt, def.radius);
        if (d < def.radius + 6 && e.cd <= 0) { this._hurtPlayer(target, def.damage); e.cd = def.touchCooldown; }
      } else if (def.ai === 'kite') {
        const dir = d < def.range * 0.7 ? -1 : d > def.range ? 1 : 0;
        if (e.hurtT <= 0) this._moveBody(e, ux * def.speed * dir * dt, uy * def.speed * dir * dt, def.radius);
        if (d <= def.range * 1.2 && e.cd <= 0) {
          e.cd = def.fireCooldown;
          this.shots.push({ x: e.x, y: e.y - 4, vx: ux * def.shotSpeed, vy: uy * def.shotSpeed, life: 2.2, dmg: def.damage, from: 'enemy' });
        }
      }
    }
  }

  // Boss AI: authored phases around seeded behavior modules (src/content/rotVillains.js).
  _stepBoss(e, def, dt) {
    e.cd2 = Math.max(0, e.cd2 - dt);
    if (e.kx || e.ky) { this._moveBody(e, e.kx * dt, e.ky * dt, def.radius); e.kx *= 0.8; e.ky *= 0.8; }
    const [target, d] = this._nearestPlayer(e.x, e.y);
    if (!target) return;
    const ux = (target.x - e.x) / (d || 1), uy = (target.y - e.y) / (d || 1);
    const rage = e.phase === 3 ? 1.6 : e.phase === 2 ? 1.25 : 1;
    if (e.dash > 0) {
      e.dash -= dt; this._moveBody(e, e.dx * 210 * dt, e.dy * 210 * dt, def.radius);
    } else {
      this._moveBody(e, ux * def.speed * rage * dt, uy * def.speed * rage * dt, def.radius);
    }
    if (d < def.radius + 7 && e.cd2 <= 0) { this._hurtPlayer(target, def.damage); e.cd2 = def.touchCooldown; }
    if (e.cd > 0) return;
    const mods = e.phase === 1 ? [def.modules[0]] : def.modules;
    const mod = mods[Math.floor(Math.random() * mods.length)];
    const shoot = (ang, spd = 85) => this.shots.push({ x: e.x, y: e.y - 8, vx: Math.cos(ang) * spd * rage, vy: Math.sin(ang) * spd * rage, life: 3, dmg: 9, from: 'enemy' });
    const aim = Math.atan2(uy, ux);
    if (mod === 'ring') { const n = e.phase === 3 ? 16 : 12; for (let i = 0; i < n; i++) shoot((i / n) * Math.PI * 2 + this.tick * 0.01); }
    if (mod === 'spray') { for (let i = -2; i <= 2; i++) shoot(aim + i * 0.18, 110); }
    if (mod === 'charge') { e.dash = 0.45; e.dx = ux; e.dy = uy; this.events.push({ t: 'tell', x: e.x, y: e.y }); }
    if (mod === 'summon' && this.enemies.size < 7) {
      for (let i = 0; i < 2; i++) { const id = `e${this._nextId++}`; this.enemies.set(id, { id, kind: 'enemy.rotling', x: e.x + (i ? 14 : -14), y: e.y + 10, hp: ENEMIES['enemy.rotling'].hp, cd: 1, hurtT: 0, kx: 0, ky: 0 }); }
    }
    if (mod === 'blink') {
      const ang = Math.random() * Math.PI * 2, nx = target.x + Math.cos(ang) * 60, ny = target.y + Math.sin(ang) * 60;
      if (!this._hitsBox(nx, ny, def.radius, def.radius * 0.7)) { this.events.push({ t: 'blink', x: e.x, y: e.y }); e.x = nx; e.y = ny; }
    }
    if (e.phase === 3) shoot(aim, 130); // overload: always adds an aimed shot
    e.cd = (e.phase === 3 ? 1.1 : e.phase === 2 ? 1.5 : 2.1);
  }

  // The watchdog fights to a drumbeat: walk, root, lunge, and a pulse every fourth beat.
  _stepSahur(e, def, dt) {
    e.fightT += dt; e.cd2 = Math.max(0, e.cd2 - dt);
    const [target, d] = this._nearestPlayer(e.x, e.y);
    if (!target) return;
    const ux = (target.x - e.x) / (d || 1), uy = (target.y - e.y) / (d || 1);
    if (e.dash > 0) { e.dash -= dt; this._moveBody(e, e.dx * 190 * dt, e.dy * 190 * dt, def.radius); }
    else if (e.root <= 0) this._moveBody(e, ux * def.speed * dt, uy * def.speed * dt, def.radius);
    if (d < def.radius + 7 && e.cd2 <= 0) { this._hurtPlayer(target, def.damage); e.cd2 = def.touchCooldown; }
    if (e.cd > 0) return;
    e.cd = 0.75; e.beat++;
    this.events.push({ t: 'drum', beat: e.beat });
    if (e.root > 0) { e.root--; if (e.root === 0) { e.dash = 0.35; e.dx = ux; e.dy = uy; this.events.push({ t: 'tell', x: e.x, y: e.y }); } return; }
    if (e.beat % 4 === 0) {
      for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; this.shots.push({ x: e.x, y: e.y - 8, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, life: 3.2, dmg: 10, from: 'enemy' }); }
    } else if (e.beat % 7 === 0) e.root = 2;
  }

  /** The party answers the phone mid-fight: the Sahur stops, tilts its head, and leaves. */
  answerSahur() {
    for (const e of this.enemies.values()) {
      if (e.sahur && e.fightT > 10) { this.enemies.delete(e.id); this.events.push({ t: 'kill', x: e.x, y: e.y, kind: e.kind, xp: 80, boss: true, sahurLeft: true }); return true; }
    }
    return false;
  }

  get sahurRinging() { return [...this.enemies.values()].some((e) => e.sahur && e.fightT > 10); }

  _stepShots(dt) {
    const keep = [];
    for (const s of this.shots) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (s.life <= 0 || this.map.solid(Math.floor(s.x / TILE), Math.floor(s.y / TILE))) continue;
      let hit = false;
      if (s.from === 'player') {
        for (const e of this.enemies.values()) {
          if (Math.hypot(e.x - s.x, e.y - 4 - s.y) < this._def(e).radius + 3) {
            this._hurtEnemy(e, s.dmg, s.vx * 0.4, s.vy * 0.4, s.owner); hit = true; break;
          }
        }
      } else {
        for (const p of this.players.values()) {
          if (!p.downed && Math.hypot(p.x - s.x, p.y - 6 - s.y) < 7) { this._hurtPlayer(p, s.dmg); hit = true; break; }
        }
      }
      if (!hit) keep.push(s);
    }
    this.shots = keep;
  }

  // Co-op: stand next to a downed roommate to pick them up.
  _stepRevives(dt) {
    for (const p of this.players.values()) {
      if (!p.downed) continue;
      const helper = [...this.players.values()].find((q) => !q.downed && Math.hypot(q.x - p.x, q.y - p.y) < COMBAT.reviveRange);
      p.reviveT = helper ? p.reviveT + dt * (1 + (helper.mods?.revive ?? 0)) : Math.max(0, p.reviveT - dt);
      if (p.reviveT >= COMBAT.reviveTime) { p.downed = false; p.hp = COMBAT.reviveHp; p.iframes = 1; this.events.push({ t: 'revive', id: p.id }); }
    }
  }

  get wiped() { return this.players.size > 0 && [...this.players.values()].every((p) => p.downed); }

  _moveBody(b, dx, dy, r) {
    const fits = (x, y) => !this._hitsBox(x, y, r, r * 0.7);
    if (fits(b.x + dx, b.y)) b.x += dx;
    if (fits(b.x, b.y + dy)) b.y += dy;
  }

  _hitsBox(x, y, hw, hh) {
    const x0 = Math.floor((x - hw) / TILE), x1 = Math.floor((x + hw - 0.01) / TILE);
    const y0 = Math.floor((y - hh) / TILE), y1 = Math.floor((y + hh - 0.01) / TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.map.solid(tx, ty)) return true;
    return false;
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
        hp: Math.round(p.hp), mhp: this.maxHp(p), dn: p.downed, rv: Math.round(p.reviveT * 10) / 10, sw: p.swingT > 0, iv: p.iframes > 0,
      })),
      map: this.map.id,
      enemies: [...this.enemies.values()].map((e) => ({ id: e.id, k: e.kind, x: Math.round(e.x), y: Math.round(e.y), hp: e.hp, h: e.hurtT > 0,
        ...(e.boss ? { boss: { name: e.def.name, ep: e.def.epithet, max: e.def.hp, c: e.def.color, r: e.def.radius, ph: e.phase, sahur: !!e.sahur, ring: !!e.sahur && e.fightT > 10 } } : {}) })),
      shots: this.shots.map((s) => ({ x: Math.round(s.x), y: Math.round(s.y), f: s.from === 'player' ? 1 : 0 })),
      events: this.events,
    };
  }
}
