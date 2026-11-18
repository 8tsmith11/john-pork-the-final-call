// Authoritative simulation: pure JS, no Phaser, so the host can run it and node can test it.
// The host steps the Sim with every player's latest input; clients render snapshots.

export const TILE = 16;
import { ENEMIES } from '../content/enemies.js';
import { generateWarden, rollVariant, TRAITS } from '../content/rotVillains.js';

export const MOVE = { speed: 72, dodgeSpeed: 230, dodgeTime: 0.22, dodgeCooldown: 0.35, iframes: 0.22,
  stamina: 100, dashCost: 34, staminaRegen: 18, regenDelay: 0.9 };  // ~3 dashes, then a slow refill
export const COMBAT = {
  maxHp: 100, hurtIframes: 0.6, reviveTime: 4.0, reviveRange: 18, reviveHp: 40,
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
    this.killed = opts.killed ?? new Set();   // spawn keys of enemies already dead in this world
    this.map = map;          // { w, h, solid(tx, ty) -> bool, spawns: [{x,y}] }
    this.players = new Map(); // id -> player
    this.enemies = new Map(); // id -> enemy
    this.shots = [];          // projectiles
    this.hazards = [];        // lingering rot pools: {x, y, r, ttl, dps}
    this.events = [];         // this tick's events for rendering: hits, deaths, shots
    this.tick = 0;
    this._nextId = 1;
    this.spawnEnemies();
  }

  /** Swap to another map, keeping players (placed at the map's spawns). */
  /** Swap maps. `fromId` = the map we came from: players arrive beside the exit that leads back there. */
  setMap(map, fromId = null) {
    this.map = map; this.shots = []; this.hazards = []; this.enemies.clear();
    const back = fromId && map.objects.find((o) => o.action === 'exit' && o.to === fromId);
    let arrivals = map.spawns;
    if (back) {
      const around = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [0, 2], [1, -1], [-1, -1], [2, 0], [-2, 0]];
      const free = around.map(([dx, dy]) => [back.x + dx, back.y + dy]).filter(([x, y]) => !map.solid(x, y));
      if (free.length) arrivals = free.map(([x, y]) => ({ x: x * TILE + 8, y: y * TILE + 8 }));
    }
    let i = 0;
    for (const p of this.players.values()) {
      const sp = arrivals[i++ % arrivals.length];
      Object.assign(p, { x: sp.x, y: sp.y, vx: 0, vy: 0, dodgeT: 0, downed: false, waitExit: null, riding: map.outdoor ? p.riding : false, hp: Math.max(p.hp, COMBAT.reviveHp) });
    }
    this.spawnEnemies();
  }

  spawnEnemies() {
    for (const [i, e] of (this.map.enemies || []).entries()) {
      const spawnKey = `${this.map.id}#${i}`;               // stable: the world remembers who you killed
      if (this.killed?.has(spawnKey)) continue;
      const id = `e${this._nextId++}`;
      if (e.kind === 'boss.warden' && this.bossVariant === 'sahur') {
        // Tung Tung Tung Sahur: cannot be beaten by force. Answering the phone ends it (WorldScene).
        const def = { name: 'TUNG TUNG TUNG SAHUR', epithet: 'the Watchdog', color: 0xa0703c, radius: 9, hp: 99999, speed: 40, damage: 16,
          ai: 'sahur', xp: 80, touchCooldown: 0.9, modules: [] };
        this.enemies.set(id, { id, spawnKey, kind: 'boss.sahur', def, boss: true, sahur: true, phase: 1, x: e.x, y: e.y, hp: def.hp, cd: 0.75, cd2: 2, beat: 0, hurtT: 0, kx: 0, ky: 0, dash: 0, root: 0, fightT: 0 });
        this.events.push({ t: 'boss', name: def.name, epithet: def.epithet, sahur: true });
        continue;
      }
      if (e.kind === 'boss.warden') {
        const w = generateWarden(this.seed, Math.max(1, this.players.size));
        const def = { ...w, hp: w.maxHp, ai: 'boss', xp: 60, touchCooldown: 0.9 };
        this.enemies.set(id, { id, spawnKey, kind: e.kind, def, boss: true, phase: 1, x: e.x, y: e.y, hp: def.hp, cd: 2, cd2: 3, hurtT: 0, kx: 0, ky: 0, dash: 0 });
        this.events.push({ t: 'boss', name: w.name, epithet: w.epithet });
        continue;
      }
      const base = ENEMIES[e.kind], v = rollVariant(this.seed, spawnKey, e.kind), tr = TRAITS[v.trait];
      const def = { ...base, hp: Math.round(base.hp * tr.hp), speed: base.speed * tr.speed, armor: tr.armor ?? 0, color: v.tint, vname: v.name, trait: v.trait };
      this.enemies.set(id, { id, spawnKey, kind: e.kind, def, x: e.x, y: e.y, hp: def.hp, cd: Math.random(), hurtT: 0, kx: 0, ky: 0 });
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
      hp: COMBAT.maxHp, downed: false, reviveT: 0, meleeCd: 0, shotCd: 0, swingT: 0, sta: MOVE.stamina, staT: 0,
      mods: { melee: 0, shot: 0, shotCd: 0, armor: 0, maxHp: 0, iframes: 0, dodgeCd: 0, revive: 0, gun: 0 },
    });
  }

  /** Gear/skill modifiers from the save (src/content/items.js playerMods). */
  setMods(id, mods) { const p = this.players.get(id); if (p) { const full = p.hp >= this.maxHp(p); p.mods = mods; if (full) p.hp = this.maxHp(p); } }
  maxHp(p) { return COMBAT.maxHp + (p.mods?.maxHp ?? 0); }
  /** Electric scooter: fast travel outdoors. Can't fight or dash while riding; a hit knocks you off. */
  toggleScooter(id, allowed) {
    const p = this.players.get(id); if (!p || p.downed) return false;
    if (p.riding) { p.riding = false; this.events.push({ t: 'scooter', id, on: false }); return true; }
    if (!allowed) return false;
    p.riding = true; this.events.push({ t: 'scooter', id, on: true }); return true;
  }

  /** Morph stage 1 (biohack form): stronger and faster, but takes more damage. */
  toggleMorph(id, allowed) { const p = this.players.get(id); if (p && allowed && !p.downed) { p.morphed = !p.morphed; this.events.push({ t: 'morph', id, on: p.morphed }); } }
  heal(id, n) { const p = this.players.get(id); if (p && !p.downed) p.hp = Math.min(this.maxHp(p), p.hp + n); }

  removePlayer(id) { this.players.delete(id); }

  /** Co-op doors: park a player at an exit. Returns true when every standing player is parked at it. */
  waitAtExit(id, exitId, dx, dy) {
    const p = this.players.get(id); if (!p || p.waitExit === exitId) return this.allWaiting(exitId);
    Object.assign(p, { waitExit: exitId, waitDx: dx, waitDy: dy, waitTick: this.tick });
    return this.allWaiting(exitId);
  }
  allWaiting(exitId) { const up = [...this.players.values()].filter((p) => !p.downed); return up.length > 0 && up.every((p) => p.waitExit === exitId); }
  clearWaiting() { for (const p of this.players.values()) p.waitExit = null; }

  step(dt, inputs) {
    this.tick++;
    this.events = [];
    for (const p of this.players.values()) {
      const inp = inputs.get(p.id) || emptyInput();
      p.meleeCd = Math.max(0, p.meleeCd - dt); p.shotCd = Math.max(0, p.shotCd - dt); p.swingT = Math.max(0, p.swingT - dt);
      if (p.downed) { p.vx = p.vy = 0; p.moving = false; continue; }
      if (p.waitExit) {
        // Parked inside a doorway, waiting for the party. Any movement that isn't into the door steps back out.
        p.vx = p.vy = 0; p.moving = false;
        const intoDoor = (inp.mx || 0) * p.waitDx + (inp.my || 0) * p.waitDy > 0;
        if ((inp.mx || inp.my) && !intoDoor && this.tick - p.waitTick > 12) { p.waitExit = null; this.events.push({ t: 'unwait', id: p.id }); }
        continue;
      }
      let { mx, my } = inp;
      const len = Math.hypot(mx, my);
      if (len > 1) { mx /= len; my /= len; } // diagonals aren't faster
      p.aim = inp.aim;
      p.dodgeCd = Math.max(0, p.dodgeCd - dt);
      p.iframes = Math.max(0, p.iframes - dt);

      p.staT = Math.max(0, (p.staT ?? 0) - dt);
      if (p.staT <= 0) p.sta = Math.min(MOVE.stamina, (p.sta ?? MOVE.stamina) + MOVE.staminaRegen * dt);
      if (inp.dodge && !p.riding && p.dodgeT <= 0 && p.dodgeCd <= 0 && p.sta >= MOVE.dashCost) {
        p.sta -= MOVE.dashCost; p.staT = MOVE.regenDelay;
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
        if (p.riding) {
          // Scooter: faster, with a little momentum so it drifts into turns.
          const under = this.map.layout?.[Math.floor(p.y / TILE)]?.[Math.floor(p.x / TILE)];
          const grinding = under === 't' || under === 'h';          // rails: a hidden fast lane
          if (grinding && !p.grinding) this.events.push({ t: 'grind', id: p.id });
          p.grinding = grinding;
          const top = grinding ? 270 : 165, acc = grinding ? 4 : 6;
          p.vx += (mx * top - p.vx) * Math.min(1, acc * dt); p.vy += (my * top - p.vy) * Math.min(1, acc * dt);
          if (Math.hypot(p.vx, p.vy) > 2) { p.battery = Math.max(0, (p.battery ?? 100) - 2.2 * dt); if (p.battery <= 0) { p.riding = false; this.events.push({ t: 'scooter', id: p.id, on: false, dead: true }); } }
        } else {
          const spd = MOVE.speed * (p.morphed ? 1.15 : 1);
          p.vx = mx * spd; p.vy = my * spd;
        }
      }
      p.moving = Math.hypot(p.vx, p.vy) > 1;
      this._moveAxis(p, p.vx * dt, 0);
      this._moveAxis(p, 0, p.vy * dt);

      if (inp.attack && !p.riding && p.meleeCd <= 0 && p.dodgeT <= 0) this._melee(p);
      if (inp.fire && !p.riding && p.mods?.gun && p.shotCd <= 0 && p.dodgeT <= 0) this._fire(p);   // no gun, no shooting

      // Facing follows the walking direction; it only turns toward the cursor while firing a ranged
      // weapon. Standing still keeps the last facing.
      const toFacing = (x, y) => (Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up'));
      if (inp.fire && p.mods?.gun) p.facing = toFacing(Math.cos(p.aim), Math.sin(p.aim));
      else if (p.moving) p.facing = toFacing(p.vx, p.vy);
    }
    this._afterPlayers(dt);
  }

  _afterPlayers(dt) {
    this._stepDoors(dt);
    this._stepHazards(dt);
    this._stepEnemies(dt);
    this._stepShots(dt);
    this._stepRevives(dt);
  }

  // Doors swing shut behind you once nobody is standing in or right next to the doorway.
  _stepDoors(dt) {
    for (const d of this.map.doors?.values() ?? []) {
      if (!d.open) continue;
      const cx = d.x * TILE + 8, cy = d.y * TILE + 8;
      const near = [...this.players.values()].some((p) => Math.abs(p.x - cx) < 14 && Math.abs(p.y - cy) < 16);
      d.closeT = near ? 0.7 : (d.closeT ?? 0.7) - dt;
      if (d.closeT <= 0) { d.open = false; d.closeT = 0.7; this.events.push({ t: 'doorClose', id: d.id }); }
    }
  }

  _stepHazards(dt) {
    for (const h of this.hazards) {
      h.ttl -= dt;
      for (const p of this.players.values()) {
        if (p.downed || Math.hypot(p.x - h.x, p.y - h.y) > h.r) continue;
        if ((p._hazT = (p._hazT ?? 0) - dt) <= 0) { p._hazT = 0.5; const keep = p.iframes; p.iframes = 0; this._hurtPlayer(p, Math.round(h.dps * 0.5)); if (keep > p.iframes) p.iframes = keep; }
      }
    }
    this.hazards = this.hazards.filter((h) => h.ttl > 0);
  }

  _melee(p) {
    const m = COMBAT.melee;
    p.meleeCd = m.cooldown; p.swingT = 0.2;   // long enough for both attack frames (12 fps)
    this.events.push({ t: 'swing', id: p.id, a: p.aim });
    for (const e of this.enemies.values()) {
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
      const def = this._def(e);
      if (d > m.range + def.radius) continue;
      let da = Math.atan2(dy, dx) - p.aim; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) > m.arc / 2 && d > def.radius + 4) continue;
      this._hurtEnemy(e, Math.round((m.damage + (p.mods?.melee ?? 0)) * (p.morphed ? 1.3 : 1)), dx / (d || 1) * m.knockback, dy / (d || 1) * m.knockback, p.id);
    }
  }

  _fire(p) {
    const c = COMBAT.shot;
    p.shotCd = Math.max(0.15, c.cooldown + (p.mods?.shotCd ?? 0));
    this.shots.push({ x: p.x + Math.cos(p.aim) * 8, y: p.y - 6 + Math.sin(p.aim) * 8, vx: Math.cos(p.aim) * c.speed, vy: Math.sin(p.aim) * c.speed,
      life: c.life, dmg: Math.round((c.damage + (p.mods?.shot ?? 0)) * (p.morphed ? 1.3 : 1)), from: 'player', owner: p.id });
    this.events.push({ t: 'shot', id: p.id });
  }

  _hurtEnemy(e, dmg, kx, ky, by) {
    if (e.sahur) { dmg = 1; this.events.push({ t: 'thunk', x: e.x, y: e.y }); }
    else if (e.boss && e.state === 'vulnerable') dmg *= 2;
    if (e.def?.armor) dmg = Math.max(1, Math.round(dmg * (1 - e.def.armor)));
    if (e.def?.trait === 'blinker' && Math.random() < 0.35 && e.hp - dmg > 0) {
      const a = Math.random() * Math.PI * 2, nx = e.x + Math.cos(a) * 40, ny = e.y + Math.sin(a) * 40;
      if (!this._hitsBox(nx, ny, 6, 4)) { this.events.push({ t: 'blink', x: e.x, y: e.y }); e.x = nx; e.y = ny; }
    }
    e.hp -= dmg; e.hurtT = 0.12;
    if (e.boss) { kx *= 0.15; ky *= 0.15; const f = e.hp / e.def.hp; const ph = f < 0.33 ? 3 : f < 0.66 ? 2 : 1;
      if (ph !== e.phase) { e.phase = ph; this.events.push({ t: 'phase', phase: ph }); } }
    e.kx = kx; e.ky = ky;
    this.events.push({ t: 'hit', x: e.x, y: e.y, dmg, target: e.id, by });
    if (e.hp <= 0) {
      this.enemies.delete(e.id);
      if (e.spawnKey) this.killed?.add(e.spawnKey);
      if (e.def?.trait === 'splitter') for (let i = 0; i < 2; i++) { const nid = `e${this._nextId++}`; this.enemies.set(nid, { id: nid, kind: 'enemy.rotling', def: { ...ENEMIES['enemy.rotling'], hp: 8, speed: 60, radius: 4, color: e.def.color, vname: 'Fragment', trait: 'plain', xp: 2 }, x: e.x + (i ? 6 : -6), y: e.y, hp: 8, cd: 0.6, hurtT: 0, kx: 0, ky: 0 }); }
      if (e.def?.trait === 'puddler') this.hazards.push({ x: e.x, y: e.y, r: 14, ttl: 5, dps: 8 });
      this.events.push({ t: 'kill', x: e.x, y: e.y, kind: e.kind, by, xp: this._def(e).xp, boss: !!e.boss, key: e.spawnKey });
    }
  }

  _hurtPlayer(p, dmg) {
    if (p.downed || p.iframes > 0) return;
    dmg = Math.max(1, Math.round(dmg * (1 - (p.mods?.armor ?? 0)) * (p.morphed ? 1.2 : 1)));
    p.hp -= dmg; p.iframes = COMBAT.hurtIframes + (p.mods?.iframes ?? 0);
    if (p.riding) { p.riding = false; this.events.push({ t: 'scooter', id: p.id, on: false, knocked: true }); }
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

  // Boss AI: a readable state machine around seeded behavior modules.
  //   move → windup (telegraphed) → attack → [vulnerable after heavy attacks] → move
  // Phase 2 adds the second module and starts pooling rot in the arena; phase 3 (overload)
  // closes a rot ring around the arena and shortens windups.
  _stepBoss(e, def, dt) {
    e.cd2 = Math.max(0, e.cd2 - dt);
    e.vulnT = Math.max(0, (e.vulnT ?? 0) - dt);
    if (e.kx || e.ky) { this._moveBody(e, e.kx * dt, e.ky * dt, def.radius); e.kx *= 0.8; e.ky *= 0.8; }
    const [target, d] = this._nearestPlayer(e.x, e.y);
    if (!target) return;
    const ux = (target.x - e.x) / (d || 1), uy = (target.y - e.y) / (d || 1);
    const rage = e.phase === 3 ? 1.5 : e.phase === 2 ? 1.2 : 1;
    if (d < def.radius + 7 && e.cd2 <= 0 && e.state !== 'vulnerable') { this._hurtPlayer(target, def.damage); e.cd2 = def.touchCooldown; }

    // Phase-wide arena effects
    if (e.phase >= 2 && (e.poolT = (e.poolT ?? 0) - dt) <= 0) {
      e.poolT = e.phase === 3 ? 2.2 : 3.5;
      const p = [...this.players.values()].filter((q) => !q.downed);
      const victim = p[Math.floor(Math.random() * p.length)];
      if (victim) this.hazards.push({ x: victim.x + (Math.random() * 20 - 10), y: victim.y + (Math.random() * 20 - 10), r: 14, ttl: 6, dps: 10 });
    }
    if (e.phase === 3) {
      if (e.ringR == null) { e.ringR = Math.max(this.map.w, this.map.h) * TILE * 0.6; e.cx = (this.map.w * TILE) / 2; e.cy = (this.map.h * TILE) / 2; this.events.push({ t: 'overload' }); }
      e.ringR = Math.max(70, e.ringR - 6 * dt);
      for (const p of this.players.values()) if (!p.downed && Math.hypot(p.x - e.cx, p.y - e.cy) > e.ringR && (p._ringT = (p._ringT ?? 0) - dt) <= 0) { p._ringT = 0.6; this._hurtPlayer(p, 6); }
    }

    if (e.state === 'vulnerable') { if (e.vulnT <= 0) e.state = 'move'; return; }       // reeling: stands still
    if (e.state === 'windup') {
      e.windT -= dt;
      if (e.windT <= 0) this._bossAttack(e, def, target, ux, uy, rage);
      return;
    }
    if (e.state === 'dash') {
      e.dash -= dt; this._moveBody(e, e.dx * 220 * dt, e.dy * 220 * dt, def.radius);
      if (e.dash <= 0) { e.state = 'vulnerable'; e.vulnT = 1.6; this.events.push({ t: 'vuln', x: e.x, y: e.y }); }
      return;
    }
    if (e.state === 'beam') {
      e.beamT -= dt; e.beamA += e.beamDir * 1.6 * dt;
      if ((e.beamTick = (e.beamTick ?? 0) - dt) <= 0) { e.beamTick = 0.05; this.shots.push({ x: e.x, y: e.y - 8, vx: Math.cos(e.beamA) * 220, vy: Math.sin(e.beamA) * 220, life: 1.2, dmg: 7, from: 'enemy' }); }
      if (e.beamT <= 0) { e.state = 'vulnerable'; e.vulnT = 1.4; this.events.push({ t: 'vuln', x: e.x, y: e.y }); }
      return;
    }
    // move
    this._moveBody(e, ux * def.speed * rage * dt, uy * def.speed * rage * dt, def.radius);
    if (e.cd > 0) return;
    const mods = e.phase === 1 ? [def.modules[0]] : def.modules;
    const extra = e.phase >= 2 ? ['beam', 'puddle'] : [];
    e.next = [...mods, ...extra][Math.floor(Math.random() * (mods.length + extra.length))];
    e.state = 'windup'; e.windT = e.phase === 3 ? 0.45 : 0.75;
    e.aimA = Math.atan2(uy, ux);
    this.events.push({ t: 'tell', x: e.x, y: e.y, kind: e.next, a: e.aimA, dur: e.windT });
  }

  _bossAttack(e, def, target, ux, uy, rage) {
    const shoot = (ang, spd = 85) => this.shots.push({ x: e.x, y: e.y - 8, vx: Math.cos(ang) * spd * rage, vy: Math.sin(ang) * spd * rage, life: 3, dmg: 9, from: 'enemy' });
    const mod = e.next; e.state = 'move';
    if (mod === 'ring') { const n = e.phase === 3 ? 18 : 12; for (let i = 0; i < n; i++) shoot((i / n) * Math.PI * 2 + this.tick * 0.01); }
    if (mod === 'spray') { for (let i = -2; i <= 2; i++) shoot(e.aimA + i * 0.18, 110); }
    if (mod === 'charge') { e.state = 'dash'; e.dash = 0.5; e.dx = Math.cos(e.aimA); e.dy = Math.sin(e.aimA); }
    if (mod === 'beam') { e.state = 'beam'; e.beamT = 1.4; e.beamA = e.aimA - 0.9; e.beamDir = 1; }
    if (mod === 'puddle') { for (const p of this.players.values()) if (!p.downed) this.hazards.push({ x: p.x, y: p.y, r: 16, ttl: 5, dps: 12 }); }
    if (mod === 'summon' && this.enemies.size < 7) {
      for (let i = 0; i < 2; i++) { const id = `e${this._nextId++}`; this.enemies.set(id, { id, kind: 'enemy.rotling', x: e.x + (i ? 14 : -14), y: e.y + 10, hp: ENEMIES['enemy.rotling'].hp, cd: 1, hurtT: 0, kx: 0, ky: 0 }); }
    }
    if (mod === 'blink') {
      const ang = Math.random() * Math.PI * 2, nx = target.x + Math.cos(ang) * 60, ny = target.y + Math.sin(ang) * 60;
      if (!this._hitsBox(nx, ny, def.radius, def.radius * 0.7)) { this.events.push({ t: 'blink', x: e.x, y: e.y }); e.x = nx; e.y = ny; }
    }
    e.cd = (e.phase === 3 ? 1.0 : e.phase === 2 ? 1.4 : 1.9);
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
      if (e.sahur && e.fightT > 10) { this.enemies.delete(e.id); if (e.spawnKey) this.killed?.add(e.spawnKey); this.events.push({ t: 'kill', x: e.x, y: e.y, kind: e.kind, xp: 80, boss: true, sahurLeft: true }); return true; }
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
    if (!this._hits(nx, ny)) { p.x = nx; p.y = ny; return; }
    if (!dx && !dy) return;
    // Walking into a door opens it; walking into an exit (door, elevator, ladder) uses it.
    const tx = Math.floor((nx + Math.sign(dx) * HALF_W) / TILE), ty = Math.floor((ny + Math.sign(dy) * HALF_H) / TILE);
    const k = `${tx},${ty}`;
    const door = this.map.doors?.get(k);
    if (door && !door.open) { door.open = true; this.events.push({ t: 'door', id: door.id }); return; }
    if (this.map.blocked?.has(k)) {
      const ex = this.map.objects.find((o) => o.x === tx && o.y === ty && o.action === 'exit');
      if (ex) this.events.push({ t: 'bumpExit', id: ex.id, by: p.id, dx: Math.sign(dx), dy: Math.sign(dy) });
    }
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
        hp: Math.round(p.hp), mhp: this.maxHp(p), st: Math.round(p.sta ?? 100), w: p.waitExit || null, ri: !!p.riding, gr: !!(p.riding && p.grinding), bat: Math.round(p.battery ?? 100), dn: p.downed, rv: Math.round(p.reviveT * 10) / 10, sw: p.swingT > 0, iv: p.iframes > 0, mo: !!p.morphed,
      })),
      map: this.map.id,
      enemies: [...this.enemies.values()].map((e) => ({ id: e.id, k: e.kind, x: Math.round(e.x), y: Math.round(e.y), hp: e.hp, h: e.hurtT > 0,
        ...(e.def && !e.boss ? { vn: e.def.vname, tr: e.def.trait, c: e.def.color, mh: e.def.hp, r: e.def.radius } : {}),
        ...(e.boss ? { boss: { name: e.def.name, ep: e.def.epithet, max: e.def.hp, c: e.def.color, r: e.def.radius, ph: e.phase, st: e.state ?? 'move', sahur: !!e.sahur, ring: !!e.sahur && e.fightT > 10 } } : {}) })),
      hazards: this.hazards.map((h) => ({ x: Math.round(h.x), y: Math.round(h.y), r: h.r, t: Math.round(h.ttl * 10) / 10 })),
      ring: [...this.enemies.values()].find((e) => e.ringR != null)?.ringR ?? null,
      shots: this.shots.map((s) => ({ x: Math.round(s.x), y: Math.round(s.y), f: s.from === 'player' ? 1 : 0 })),
      events: this.events,
    };
  }
}
