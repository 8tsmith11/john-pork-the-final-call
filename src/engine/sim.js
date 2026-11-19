// Authoritative simulation: pure JS, no Phaser, so the host can run it and node can test it.
// The host steps the Sim with every player's latest input; clients render snapshots.

export const TILE = 16;
import { ENEMIES } from '../content/enemies.js';
import { generateWarden, rollVariant, TRAITS } from '../content/rotVillains.js';

export const MOVE = { speed: 72, dodgeSpeed: 230, dodgeTime: 0.22, dodgeCooldown: 0.35, iframes: 0.22,
  stamina: 100, dashCost: 34, staminaRegen: 18, regenDelay: 0.9 };  // ~3 dashes, then a slow refill
// Regular-enemy tuning for a party of three (see spawnEnemies). Measured with a headless bot run:
// before this the tunnel cleared in ~30 s with no knockdowns.
export const PARTY_SCALE = { hp: 2.3, dmg: 2.0 };   // raised from 1.7/1.3 (Trevor: harder); party runs now take real damage, solo needs gear
export const BLINK = { dist: 112, cooldown: 1.1 };   // winged boots (D-014)
// Michael's lullaby reaches 8 tiles; a Hold-Music Moth's hum reaches 4. Manuel is a baby: a lullaby
// puts him out for 12 s instead of 8. Caffeine (wiredT) makes anyone immune.
export const LULLABY = { range: 128, mothRange: 64, expose: 3, sleep: 8, babySleep: 12 };   // babySleep: Manuel with the smart pacifier in
// Combat feel (docs/research/combat.md): combo chain, deflects, perfect dodges, wall slams, hit-stop.
export const FEEL = { comboWindow: 0.55, finisherDmg: 1.6, finisherKnock: 1.8, finisherArc: 1.25,
  deflectDmg: 1.5, parryStun: 1.0, parryStop: 0.08, perfectWindow: 0.15, focusTime: 1.5, focusDmg: 1.5, slamSpeed: 140, slamDmg: 8, slamStun: 0.6, hitStop: 0.05 };
export const COMBAT = {
  maxHp: 100, hurtIframes: 0.6, reviveTime: 4.0, reviveRange: 18, reviveHp: 40,
  melee: { cooldown: 0.38, range: 20, arc: Math.PI * 0.6, damage: 12, knockback: 120 },
  shot: { cooldown: 0.5, speed: 210, damage: 8, life: 0.9 },
};
const HALF_W = 5, HALF_H = 4; // feet hitbox (characters are 16x24; collide at the feet)

export function emptyInput() {
  return { mx: 0, my: 0, aim: 0, dodge: false, attack: false, fire: false, interact: false, skill: false };
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
    this.decoys = [];         // Manuel's decoy busts: {x, y, ttl, hp}
    this.events = [];         // this tick's events for rendering: hits, deaths, shots
    this.tick = 0;
    this._nextId = 1;
    this.spawnEnemies();
  }

  /** Swap to another map, keeping players (placed at the map's spawns). */
  /** Swap maps. `fromId` = the map we came from: players arrive beside the exit that leads back there. */
  setMap(map, fromId = null) {
    this.map = map; this.shots = []; this.hazards = []; this.decoys = []; this.enemies.clear();
    for (const a of this.allies ?? []) a.relocate = true;
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
      Object.assign(p, { x: sp.x, y: sp.y, vx: 0, vy: 0, dodgeT: 0, downed: false, swUsed: false, waitExit: null, riding: map.outdoor ? p.riding : false, hp: Math.max(p.hp, COMBAT.reviveHp) });
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
      // The party is always three (AI companions fill empty seats), so regular enemies are tuned for three.
      const def = { ...base, hp: Math.round(base.hp * tr.hp * PARTY_SCALE.hp), damage: Math.round((base.damage ?? 0) * PARTY_SCALE.dmg), speed: base.speed * tr.speed, armor: tr.armor ?? 0, color: v.tint, vname: v.name, trait: v.trait };
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
    if (p.riding) { p.riding = false; this.emit({ t: 'scooter', id, on: false }); return true; }
    if (!allowed) return false;
    p.riding = true; p.playing = null; this.emit({ t: 'scooter', id, on: true }); return true;
  }

  /** Morph stage 1 (biohack form): stronger and faster, but takes more damage. */
  toggleMorph(id, allowed) { const p = this.players.get(id); if (p && allowed && !p.downed) { p.morphed = !p.morphed; this.emit({ t: 'morph', id, on: p.morphed }); } }
  /**
   * Instruments (D-014). song: 'rock' | 'lullaby' | 'mate', or null to stop. The sound is made on
   * every client from the snapshot; the sim only tracks who is playing and what it does.
   */
  setPlaying(id, song, instrument = 'acoustic') {
    const p = this.players.get(id); if (!p) return;
    if (!song || p.downed || p.riding || p.sleepT > 0) { if (p.playing) this.emit({ t: 'play', id, on: false }); p.playing = null; return; }
    p.playing = { song, instrument }; this.emit({ t: 'play', id, on: true, song, instrument });
  }

  // Michael's lullaby: any other player or (non-boss) enemy that stays within LULLABY.range of him
  // for LULLABY.expose seconds falls asleep for LULLABY.sleep seconds. Leaving the range resets it.
  // Sleepers still in range when a second passes get the full LULLABY.sleep again.
  _stepLullaby(dt) {
    const singers = [...[...this.players.values()].filter((p) => p.playing?.song === 'lullaby' && !p.downed), ...[...this.enemies.values()].filter((e) => this._def(e).lullaby && !(e.sleepT > 0))];
    const targets = [...[...this.players.values()].filter((p) => !p.downed && !(p.wiredT > 0)), ...[...this.enemies.values()].filter((e) => !e.boss && !e.sahur && !e.def?.lullaby)];
    // Manuel sleeps the longer LULLABY.babySleep only while wearing the smart pacifier (sleepGuard).
    const sleepFor = (t) => (t.character === 'manuel' && t.mods?.sleepGuard ? LULLABY.babySleep : LULLABY.sleep);
    for (const t of targets) {
      // enemy singers (moths) only sing players to sleep
      const near = singers.some((s) => s !== t && (!this.enemies.has(s.id) || this.players.has(t.id)) && Math.hypot(s.x - t.x, s.y - t.y) <= (this.enemies.has(s.id) ? LULLABY.mothRange : LULLABY.range));
      // Already asleep: while Michael keeps playing nearby, the sleep timer resets every second.
      if (t.sleepT > 0) {
        t.lullRefresh = near ? (t.lullRefresh ?? 0) + dt : 0;
        if (t.lullRefresh >= 1) { t.lullRefresh = 0; t.sleepT = Math.max(t.sleepT, sleepFor(t)); }
        continue;
      }
      t.lullT = near ? (t.lullT ?? 0) + dt : 0;
      if (t.lullT >= LULLABY.expose) {
        t.lullT = 0; t.sleepT = sleepFor(t);
        if (t.playing) t.playing = null;
        this.events.push({ t: 'sleep', id: t.id, enemy: this.enemies.has(t.id), x: Math.round(t.x), y: Math.round(t.y) });
      }
    }
  }
  /**
   * Winged boots (D-014): an instant dash up to BLINK.dist px, stopped by walls and doors. Goes the way
   * you're moving, or toward the aim when standing still. The renderer draws the fire line.
   */
  blink(id) {
    const p = this.players.get(id);
    if (!p || !p.mods?.blink || p.downed || p.riding || p.sleepT > 0 || p.waitExit || (p.blinkCd ?? 0) > 0) return false;
    const a = Math.hypot(p.vx, p.vy) > 1 ? Math.atan2(p.vy, p.vx) : p.aim;
    const x0 = p.x, y0 = p.y;
    let x = x0, y = y0;
    for (let d = 4; d <= BLINK.dist; d += 4) {
      const nx = x0 + Math.cos(a) * d, ny = y0 + Math.sin(a) * d;
      if (this._hits(nx, ny)) break;
      x = nx; y = ny;
    }
    if (Math.hypot(x - x0, y - y0) < 8) return false;
    Object.assign(p, { x, y, blinkCd: BLINK.cooldown, playing: null, iframes: Math.max(p.iframes, 0.25) });
    this.emit({ t: 'blink', id, x0: Math.round(x0), y0: Math.round(y0), x1: Math.round(x), y1: Math.round(y) });
    return true;
  }
  /** Sleeping potion (D-017): thrown up to 64 px along the aim; everyone in the splash sleeps. */
  throwPotion(id) {
    const p = this.players.get(id); if (!p || p.downed || p.sleepT > 0) return null;
    let x = p.x, y = p.y;
    for (let d = 4; d <= 64; d += 4) { const nx = p.x + Math.cos(p.aim) * d, ny = p.y + Math.sin(p.aim) * d; if (this.map.solid(Math.floor(nx / TILE), Math.floor(ny / TILE))) break; x = nx; y = ny; }
    const r = 36;
    for (const q of this.players.values()) if (q !== p && !q.downed && !(q.wiredT > 0) && Math.hypot(q.x - x, q.y - y) <= r) { q.sleepT = LULLABY.sleep; q.playing = null; }
    for (const e of this.enemies.values()) if (!e.boss && !e.sahur && Math.hypot(e.x - x, e.y - y) <= r) e.sleepT = LULLABY.sleep;
    this.emit({ t: 'potion', id, x: Math.round(x), y: Math.round(y), r });
    return { x, y, r };
  }
  /** Caffeine (D-017): wakes you now; for `secs` nothing puts you to sleep and you move 15% faster. */
  caffeinate(id, secs) { const p = this.players.get(id); if (!p || p.downed) return; p.sleepT = 0; p.lullT = 0; p.wiredT = secs; this.emit({ t: 'wired', id }); }
  heal(id, n) { const p = this.players.get(id); if (p && !p.downed) p.hp = Math.min(this.maxHp(p), p.hp + n); }

  removePlayer(id) { this.players.delete(id); }

  /** Co-op doors: park a player at an exit. Returns true when every standing player is parked at it. */
  waitAtExit(id, exitId, dx, dy) {
    const p = this.players.get(id); if (!p || p.waitExit === exitId) return this.allWaiting(exitId);
    Object.assign(p, { waitExit: exitId, waitDx: dx, waitDy: dy, waitTick: this.tick });
    return this.allWaiting(exitId);
  }
  // AI companions (ids 'ai:*') don't vote at doors; they're carried along with the party.
  allWaiting(exitId) { const up = [...this.players.values()].filter((p) => !p.downed && !String(p.id).startsWith('ai:')); return up.length > 0 && up.every((p) => p.waitExit === exitId); }
  clearWaiting() { for (const p of this.players.values()) p.waitExit = null; }

  /** Raise an event from outside step() (input handlers): it goes out with the next step's events. */
  emit(ev) { (this._pending ??= []).push(ev); }

  step(dt, inputs) {
    this.tick++;
    this.events = this._pending ?? []; this._pending = [];
    for (const p of this.players.values()) {
      const inp = inputs.get(p.id) || emptyInput();
      p.meleeCd = Math.max(0, p.meleeCd - dt); p.shotCd = Math.max(0, p.shotCd - dt); p.swingT = Math.max(0, p.swingT - dt);
      if (p.downed) { p.vx = p.vy = 0; p.moving = false; continue; }
      if (p.sleepT > 0) { if (p.mods?.sleepGuard) { p.hp = Math.min(this.maxHp(p), p.hp + 15 * dt); p.sta = Math.min(MOVE.stamina + (p.mods.sta ?? 0), (p.sta ?? 0) + 40 * dt); }
        p.sleepT = Math.max(0, p.sleepT - dt); p.vx = p.vy = 0; p.moving = false; if (p.sleepT <= 0) this.events.push({ t: 'wake', id: p.id }); continue; }
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
      p.iframes = Math.max(0, p.iframes - dt); if (p.focusT > 0) p.focusT = Math.max(0, p.focusT - dt);

      p.staT = Math.max(0, (p.staT ?? 0) - dt);
      p.pillT = Math.max(0, (p.pillT ?? 0) - dt);   // blue pill: dodges are free while this runs
      const staMax = MOVE.stamina + (p.mods?.sta ?? 0);
      if (p.staT <= 0) p.sta = Math.min(staMax, (p.sta ?? staMax) + MOVE.staminaRegen * (1 + (p.mods?.staRegen ?? 0)) * dt);
      if (inp.dodge && !p.riding && p.dodgeT <= 0 && p.dodgeCd <= 0 && p.sta >= MOVE.dashCost) {
        if (!(p.pillT > 0)) { p.sta -= MOVE.dashCost; p.staT = MOVE.regenDelay; }
        // Dodge toward movement, or toward the aim if standing still.
        const dx = len > 0.1 ? mx : Math.cos(p.aim), dy = len > 0.1 ? my : Math.sin(p.aim);
        const dl = Math.hypot(dx, dy) || 1;
        p.dodgeDx = dx / dl; p.dodgeDy = dy / dl;
        p.dashHits = new Set();
        p.dodgeStamp = this.tick; p.perfectDone = false; p.dodgeT = MOVE.dodgeTime; p.dodgeCd = Math.max(0.2, MOVE.dodgeCooldown + (p.mods?.dodgeCd ?? 0)); p.iframes = MOVE.iframes;
      }

      if (p.dodgeT > 0) {
        p.dodgeT -= dt;
        p.vx = p.dodgeDx * MOVE.dodgeSpeed; p.vy = p.dodgeDy * MOVE.dodgeSpeed;
        if (p.mods?.dashHit) for (const e of this.enemies.values()) {
          if (p.dashHits?.has(e.id) || Math.hypot(e.x - p.x, e.y - p.y) > 12 + this._def(e).radius) continue;
          p.dashHits?.add(e.id); this._hurtEnemy(e, p.mods.dashHit, p.dodgeDx * 160, p.dodgeDy * 160, p.id);
        }
      } else {
        if (p.riding) {
          // Scooter: faster, with a little momentum so it drifts into turns.
          const under = this.map.layout?.[Math.floor(p.y / TILE)]?.[Math.floor(p.x / TILE)];
          const grinding = under === 't' || under === 'h';          // rails: a hidden fast lane
          if (grinding && !p.grinding) this.events.push({ t: 'grind', id: p.id });
          p.grinding = grinding;
          const top = grinding ? 270 : 165, acc = grinding ? 4 : 6;
          p.vx += (mx * top - p.vx) * Math.min(1, acc * dt); p.vy += (my * top - p.vy) * Math.min(1, acc * dt);
          if (Math.hypot(p.vx, p.vy) > 2) { p.battery = Math.max(0, (p.battery ?? 100) - (p.hicap ? 1.1 : 2.2) * dt); if (p.battery <= 0) { p.riding = false; this.events.push({ t: 'scooter', id: p.id, on: false, dead: true }); } }
        } else {
          const spd = MOVE.speed * (p.morphed ? 1.15 : 1) * (1 + (p.mods?.speed ?? 0)) * (p.playing ? 0.5 : 1) * (p.wiredT > 0 ? 1.15 : 1);
          p.vx = mx * spd; p.vy = my * spd;
        }
      }
      p.moving = Math.hypot(p.vx, p.vy) > 1;
      this._moveAxis(p, p.vx * dt, 0);
      this._moveAxis(p, 0, p.vy * dt);

      p.skillCd = Math.max(0, (p.skillCd ?? 0) - dt);
      p.blinkCd = Math.max(0, (p.blinkCd ?? 0) - dt);
      if (p.wiredT > 0) p.wiredT = Math.max(0, p.wiredT - dt);
      if (p.mods?.regen && p.hp < this.maxHp(p)) p.hp = Math.min(this.maxHp(p), p.hp + p.mods.regen * dt);   // smart pacifier
      if (inp.skill && !p.riding && !p.playing && p.skillCd <= 0) this._ability(p);
      // Terraria-style: the attack button uses what's in hand. A melee weapon swings, a gun fires, anything
      // else is used by the scene (consumables etc.). No weapon in hand, no punch.
      const held = p.held ?? 'melee';
      if (inp.attack && held === 'melee' && p.mods?.swing && !p.riding && !p.playing && p.meleeCd <= 0 && p.dodgeT <= 0) this._melee(p);
      if (inp.attack && held === 'gun' && p.mods?.gun && !p.riding && !p.playing && p.shotCd <= 0 && p.dodgeT <= 0) this._fire(p);
      if (inp.fire && !p.riding && !p.playing && p.mods?.gun && p.shotCd <= 0 && p.dodgeT <= 0) this._fire(p);   // no gun, no shooting

      // Facing follows the walking direction; it only turns toward the cursor while firing a ranged
      // weapon. Standing still keeps the last facing.
      const toFacing = (x, y) => (Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up'));
      if (inp.fire && p.mods?.gun) p.facing = toFacing(Math.cos(p.aim), Math.sin(p.aim));
      else if (p.moving) p.facing = toFacing(p.vx, p.vy);
    }
    this._afterPlayers(dt);
  }

  // Allies: small companions that fight on their own (Trevor's combat robot). {x, y, hp, owner}
  addAlly(spec) {
    (this.allies ??= []).push({ hp: 40, maxHp: 40, cd: 0, st: 'follow', stT: 0, down: 0, vx: 0, vy: 0, ...spec });
  }

  _stepAllies(dt) {
    for (const a of this.allies ?? []) {
      const owner = this.players.get(a.owner) ?? [...this.players.values()][0]; if (!owner) continue;
      if (a.relocate) { a.relocate = false; a.x = owner.x - 12; a.y = owner.y + 10; if (this._hitsBox(a.x, a.y, 4, 3)) { a.x = owner.x; a.y = owner.y; } }
      if (a.down > 0) { a.down -= dt; if (a.down <= 0) { a.hp = a.maxHp; this.events.push({ t: 'allyUp', x: a.x, y: a.y }); } continue; }
      a.cd = Math.max(0, a.cd - dt); a.stT -= dt;
      if (Math.hypot(owner.x - a.x, owner.y - a.y) > 260) { a.x = owner.x + 10; a.y = owner.y + 8; a.st = 'follow'; }
      let foe = null, fd = 110;
      for (const e of this.enemies.values()) { if (e.sahur) continue; const d = Math.hypot(e.x - a.x, e.y - a.y); if (d < fd) { fd = d; foe = e; } }
      if (a.st === 'ram') {
        this._moveBody(a, a.dx * 230 * dt, a.dy * 230 * dt, 4);
        for (const e of this.enemies.values()) {
          if (a.hit?.has(e.id) || Math.hypot(e.x - a.x, e.y - a.y) > this._def(e).radius + 6) continue;
          (a.hit ??= new Set()).add(e.id);
          this._hurtEnemy(e, 14, a.dx * 200, a.dy * 200, a.owner);
        }
        if (a.stT <= 0) { a.st = 'follow'; a.cd = 1.4; }
      } else if (foe && a.cd <= 0) {
        const ux = (foe.x - a.x) / (fd || 1), uy = (foe.y - a.y) / (fd || 1);
        if (fd < 60) { a.st = 'ram'; a.stT = 0.3; a.dx = ux; a.dy = uy; a.hit = new Set(); this.events.push({ t: 'tell', x: a.x, y: a.y }); }
        else this._moveBody(a, ux * 90 * dt, uy * 90 * dt, 4);
      } else {
        const tx = owner.x - 14, ty = owner.y + 10, d = Math.hypot(tx - a.x, ty - a.y);
        if (d > 8) {
          const moved = this._moveBody(a, ((tx - a.x) / d) * Math.min(110, d * 3) * dt, ((ty - a.y) / d) * Math.min(110, d * 3) * dt, 4);
          // Snagged on furniture for a moment: it hops back to its owner's heel rather than grinding on a desk.
          a.stuck = moved || d < 24 ? 0 : (a.stuck ?? 0) + dt;
          if (a.stuck > 1.2) { a.stuck = 0; a.relocate = true; }
        }
      }
      // coderot things that touch it chew on it
      for (const e of this.enemies.values()) {
        if (Math.hypot(e.x - a.x, e.y - a.y) < this._def(e).radius + 5 && (e.cdAlly = (e.cdAlly ?? 0) - dt) <= 0) {
          e.cdAlly = 1; a.hp -= Math.round((this._def(e).damage ?? 6) * 0.6);
          if (a.hp <= 0) { a.hp = 0; a.down = 20; a.st = 'follow'; this.events.push({ t: 'allyDown', x: a.x, y: a.y }); break; }
        }
      }
    }
  }

  _afterPlayers(dt) {
    this._stepLullaby(dt);
    this._stepDecoys(dt);
    this._stepAllies(dt);
    this._stepDoors(dt);
    this._stepHazards(dt);
    if (this.hitStop > 0) this.hitStop = Math.max(0, this.hitStop - dt);
    else { this._stepEnemies(dt); this._stepShots(dt); }
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

  _stepDecoys(dt) {
    for (const dc of this.decoys) dc.ttl -= dt;
    this.decoys = this.decoys.filter((dc) => dc.ttl > 0 && dc.hp > 0);
    for (const e of this.enemies.values()) if (e.marked > 0) e.marked -= dt;
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

  // Signature abilities (R). Trevor: Riff · Manuel: Decoy Bust · Michael: Ping.
  _ability(p) {
    const ap = 1 + (p.mods?.abilityPower ?? 0), cdk = 1 - (p.mods?.skillCd ?? 0);
    if (p.character === 'trevor') {
      p.skillCd = 6 * cdk;
      const r = 46 * Math.min(1.8, Math.sqrt(ap));
      for (const e of this.enemies.values()) {
        const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
        if (d > r) continue;
        this._hurtEnemy(e, Math.round(6 * ap), (dx / (d || 1)) * 260 * Math.min(1.6, ap), (dy / (d || 1)) * 260 * Math.min(1.6, ap), p.id);
        if (this.enemies.has(e.id)) { e.hurtT = (e.boss ? 0.3 : 0.9) * Math.min(2.2, ap); if (p.mods?.markDmg) e.marked = Math.max(e.marked ?? 0, 3); }   // stunned (and rattled)
      }
      this.events.push({ t: 'riff', id: p.id, x: p.x, y: p.y, r });
    } else if (p.character === 'manuel') {
      p.skillCd = 10 * cdk;
      const n = 1 + (p.mods?.decoys ?? 0);
      for (let i = 0; i < n; i++) {
        const a = p.aim + (i - (n - 1) / 2) * 0.9;
        this.decoys.push({ x: p.x + Math.cos(a) * 14, y: p.y + Math.sin(a) * 14, ttl: 6 * ap, hp: Math.round(40 * ap) });
      }
      this.events.push({ t: 'decoy', id: p.id });
    } else {
      p.skillCd = 8 * cdk;
      for (const e of this.enemies.values()) if (Math.hypot(e.x - p.x, e.y - p.y) < 150 * Math.min(1.8, ap)) e.marked = 5 * ap;
      this.events.push({ t: 'ping', id: p.id, x: p.x, y: p.y });
    }
  }

  _melee(p) {
    const w = p.mods?.swing, base = w ? { ...COMBAT.melee, ...w, arc: Math.PI * (w.arc ?? 0.6) } : COMBAT.melee;
    // Combo: swings inside the window chain 1-2-3; the third is a heavy finisher.
    const now = this.tick * (1 / 60);
    p.combo = now - (p.lastSwingAt ?? -9) <= base.cooldown + FEEL.comboWindow ? ((p.combo ?? 0) % 3) + 1 : 1;
    p.lastSwingAt = now;
    const fin = p.combo === 3;
    const m = fin ? { ...base, damage: base.damage * FEEL.finisherDmg, knockback: base.knockback * FEEL.finisherKnock, arc: base.arc * FEEL.finisherArc } : base;
    const focus = p.focusT > 0; if (focus) p.focusT = 0;
    p.meleeCd = m.cooldown * (fin ? 1.25 : 1); p.swingT = 0.2;   // long enough for both attack frames (12 fps)
    this.events.push({ t: 'swing', id: p.id, a: p.aim, r: m.range, arc: m.arc, combo: p.combo });
    // Deflect: enemy shots inside the swing go back the way they came, as the player's.
    for (const s of this.shots) {
      if (s.from === 'player') continue;
      const dx = s.x - p.x, dy = s.y - (p.y - 6), d = Math.hypot(dx, dy);
      if (d > m.range + 8) continue;
      let da = Math.atan2(dy, dx) - p.aim; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) > m.arc / 2 + 0.3) continue;
      const sp = Math.hypot(s.vx, s.vy) * 1.2;
      Object.assign(s, { from: 'player', owner: p.id, vx: Math.cos(p.aim) * sp, vy: Math.sin(p.aim) * sp, dmg: Math.round(s.dmg * FEEL.deflectDmg), life: 1.6, rot: 0 });
      this.events.push({ t: 'deflect', x: s.x, y: s.y, by: p.id });
    }
    for (const e of this.enemies.values()) {
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
      const def = this._def(e);
      if (d > m.range + def.radius) continue;
      let da = Math.atan2(dy, dx) - p.aim; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) > m.arc / 2 && d > def.radius + 4) continue;
      // Clash parry (docs/research/combat.md): hitting an enemy while it's committed to its lunge or charge
      // cancels the attack, stuns it and grants Focus. Bosses and the Sahur can't be parried.
      if (!e.boss && !e.sahur && ((e.st === 'lunge' && !e.hitOnce) || (e.st === 'dash' && !e.hitOnce))) {
        e.hitOnce = true; e.st = def.ai === 'charge' ? 'dizzy' : 'recover'; e.stT = Math.max(e.stT ?? 0, FEEL.parryStun); e.stunT = FEEL.parryStun; e.parried = FEEL.parryStun;
        p.focusT = FEEL.focusTime; this.hitStop = FEEL.parryStop;
        this.events.push({ t: 'parry', x: e.x, y: e.y, by: p.id });
      }
      const crit = Math.random() < (p.mods?.crit ?? 0);
      if (crit) this.events.push({ t: 'crit', x: e.x, y: e.y });
      if (fin) this.hitStop = FEEL.hitStop;
      this._hurtEnemy(e, Math.round((m.damage + (p.mods?.melee ?? 0)) * (p.morphed ? 1.3 : 1) * (crit ? 2 : 1) * (focus ? FEEL.focusDmg : 1)), dx / (d || 1) * m.knockback * (1 + (p.mods?.knock ?? 0)), dy / (d || 1) * m.knockback * (1 + (p.mods?.knock ?? 0)), p.id);
    }
  }

  _fire(p) {
    const c = { ...COMBAT.shot, ...(p.mods?.gunStats ?? {}) }, n = c.pellets ?? 1;
    const focus = p.focusT > 0; if (focus) p.focusT = 0;
    p.shotCd = Math.max(0.12, c.cooldown + (p.mods?.shotCd ?? 0));
    for (let i = 0; i < n; i++) {
      const a = p.aim + (n > 1 ? (i / (n - 1) - 0.5) * (c.spread ?? 0.4) : 0);
      this.shots.push({ x: p.x + Math.cos(a) * 8, y: p.y - 6 + Math.sin(a) * 8, vx: Math.cos(a) * c.speed, vy: Math.sin(a) * c.speed,
        life: c.life, dmg: Math.round((c.damage + (p.mods?.shot ?? 0)) * (p.morphed ? 1.3 : 1) * (focus ? FEEL.focusDmg : 1)), from: 'player', owner: p.id });
    }
    this.events.push({ t: 'shot', id: p.id });
  }

  _hurtEnemy(e, dmg, kx, ky, by) {
    if (e.sahur) { dmg = 1; this.events.push({ t: 'thunk', x: e.x, y: e.y }); }
    else if (e.boss && e.state === 'vulnerable') dmg *= 2;
    if (this._def(e).armor && e.st !== 'dizzy') dmg = Math.max(1, Math.round(dmg * (1 - this._def(e).armor)));
    if (e.st === 'dizzy') dmg *= 2;   // a Captcha reeling after its charge
    else if (e.parried > 0) dmg *= 2;   // parried: open for a second
    if (e.marked > 0) dmg = Math.round(dmg * (1.5 + (this.players.get(by)?.mods?.markDmg ?? 0)));
    if (e.def?.trait === 'blinker' && Math.random() < 0.35 && e.hp - dmg > 0) {
      const a = Math.random() * Math.PI * 2, nx = e.x + Math.cos(a) * 40, ny = e.y + Math.sin(a) * 40;
      if (!this._hitsBox(nx, ny, 6, 4)) { this.events.push({ t: 'blink', x: e.x, y: e.y }); e.x = nx; e.y = ny; }
    }
    e.hp -= dmg; e.hurtT = 0.12;
    if (e.boss) { kx *= 0.15; ky *= 0.15; const f = e.hp / e.def.hp; const ph = f < 0.33 ? 3 : f < 0.66 ? 2 : 1;
      if (ph !== e.phase) { e.phase = ph; this.events.push({ t: 'phase', phase: ph }); } }
    e.kx = kx; e.ky = ky; if (by) e.lastHitBy = by;
    this.events.push({ t: 'hit', x: e.x, y: e.y, dmg, target: e.id, by });
    if (e.hp <= 0) {
      this.enemies.delete(e.id);
      if (e.spawnKey) this.killed?.add(e.spawnKey);
      if (e.def?.trait === 'splitter') for (let i = 0; i < 2; i++) { const nid = `e${this._nextId++}`; this.enemies.set(nid, { id: nid, kind: 'enemy.rotling', def: { ...ENEMIES['enemy.rotling'], hp: 8, speed: 60, radius: 4, color: e.def.color, vname: 'Fragment', trait: 'plain', xp: 2 }, x: e.x + (i ? 6 : -6), y: e.y, hp: 8, cd: 0.6, hurtT: 0, kx: 0, ky: 0 }); }
      if (e.def?.trait === 'puddler') this.hazards.push({ x: e.x, y: e.y, r: 14, ttl: 5, dps: 8 });
      this.events.push({ t: 'kill', x: e.x, y: e.y, kind: e.kind, by, xp: this._def(e).xp, boss: !!e.boss, key: e.spawnKey });
      const k = this.players.get(by);   // Argentina shirt (gambeta): a kill hands the dodge straight back
      if (k?.mods?.killDodge) { k.dodgeCd = 0; k.sta = Math.min(MOVE.stamina + (k.mods.sta ?? 0), (k.sta ?? 0) + MOVE.dashCost); }
    }
  }

  _hurtPlayer(p, dmg) {
    if (p.ttl !== undefined && p.hp !== undefined && !p.id) { p.hp -= dmg; return; }   // a decoy bust soaking a hit
    if (p.downed) return;
    if (p.iframes > 0) {
      // Perfect dodge: the hit came in the first moments of a dodge. Refund the dash, grant Focus.
      if (p.dodgeT > 0 && !p.perfectDone && (this.tick - (p.dodgeStamp ?? -99)) / 60 <= FEEL.perfectWindow && !(p.ttl !== undefined && !p.id)) {
        p.perfectDone = true; p.focusT = FEEL.focusTime; p.sta = Math.min(MOVE.stamina + (p.mods?.sta ?? 0), (p.sta ?? 0) + MOVE.dashCost);
        this.hitStop = FEEL.hitStop; this.events.push({ t: 'perfect', id: p.id, x: p.x, y: p.y });
      }
      return;
    }
    if (p.sleepT > 0 && p.mods?.sleepGuard) { this.events.push({ t: 'hit', x: p.x, y: p.y, dmg: 0, target: p.id }); return; }   // Manuel asleep on his pacifier: untouchable
    dmg = Math.max(1, Math.round(dmg * (1 - (p.mods?.armor ?? 0)) * (p.morphed ? 1.2 : 1)));
    p.hp -= dmg; p.iframes = COMBAT.hurtIframes + (p.mods?.iframes ?? 0);
    if (p.riding) { p.riding = false; this.events.push({ t: 'scooter', id: p.id, on: false, knocked: true }); }
    this.events.push({ t: 'hurt', id: p.id, x: p.x, y: p.y, dmg });
    if (p.hp <= 0 && p.mods?.secondWind && !p.swUsed) { p.swUsed = true; p.hp = Math.round(this.maxHp(p) * 0.3); p.iframes = 1.5; this.events.push({ t: 'secondwind', id: p.id, x: p.x, y: p.y }); return; }
    if (p.hp <= 0) { p.hp = 0; p.downed = true; p.reviveT = 0; this.events.push({ t: 'down', id: p.id }); }
  }

  _nearestPlayer(x, y) {
    let best = null, bd = Infinity;
    for (const dc of this.decoys) { const d = Math.hypot(dc.x - x, dc.y - y); if (d < 130 && d < bd) { bd = d; best = dc; } }
    if (best) return [best, bd];
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
      if (e.sleepT > 0) { e.sleepT = Math.max(0, e.sleepT - dt); continue; }
      // knockback decays
      if (e.kx || e.ky) {
        const speed = Math.hypot(e.kx, e.ky);
        if (this._moveBody(e, e.kx * dt, e.ky * dt, def.radius) === false && speed >= FEEL.slamSpeed && !e.slammed) {
          // Wall slam: knocked hard into a wall. Knockback is a weapon.
          e.slammed = true; e.kx = e.ky = 0; e.stunT = FEEL.slamStun; this.hitStop = FEEL.hitStop;
          this.events.push({ t: 'slam', x: e.x, y: e.y });
          this._hurtEnemy(e, FEEL.slamDmg, 0, 0, e.lastHitBy);
          if (!this.enemies.has(e.id)) continue;
        }
        e.kx *= 0.82; e.ky *= 0.82; if (Math.hypot(e.kx, e.ky) < 5) { e.kx = e.ky = 0; e.slammed = false; }
      }
      if (e.parried > 0) e.parried = Math.max(0, e.parried - dt);
      if (e.stunT > 0) { e.stunT = Math.max(0, e.stunT - dt); continue; }
      const [target, d] = this._nearestPlayer(e.x, e.y);
      if (!target || d > 220) continue;
      const ux = (target.x - e.x) / (d || 1), uy = (target.y - e.y) / (d || 1);
      if (def.ai === 'lullaby') {        // hover just out of reach, humming
        const [lo, hi] = def.keepAway ?? [44, 70], dir = d < lo ? -1 : d > hi ? 1 : 0;
        if (e.hurtT <= 0) this._moveBody(e, (ux * dir + uy * Math.sin(this.tick / 40) * 0.6) * def.speed * dt, (uy * dir - ux * Math.sin(this.tick / 40) * 0.6) * def.speed * dt, def.radius);
        if (d < def.radius + 6 - (target.mods?.small ?? 0) && e.cd <= 0) { this._hurtPlayer(target, def.damage); e.cd = def.touchCooldown; }
        continue;
      }
      if (def.ai === 'charge') {         // walk in, wind up, dash in a straight line, then reel
        e.st ??= 'walk'; e.stT = (e.stT ?? 0) - dt;
        if (e.st === 'walk') { if (e.hurtT <= 0) this._moveBody(e, ux * def.speed * dt, uy * def.speed * dt, def.radius); if (d < 80) { e.st = 'windup'; e.stT = def.windup; e.dx = ux; e.dy = uy; } }
        else if (e.st === 'windup') { if (e.stT <= 0) { e.st = 'dash'; e.stT = def.dashTime; e.hitOnce = false; } }
        else if (e.st === 'dash') {
          const blocked = this._moveBody(e, e.dx * def.dashSpeed * dt, e.dy * def.dashSpeed * dt, def.radius) === false;
          if (!e.hitOnce && d < def.radius + 7) { this._hurtPlayer(target, def.damage); e.hitOnce = true; }
          if (e.stT <= 0 || blocked) { e.st = 'dizzy'; e.stT = def.dizzy; }
        } else if (e.st === 'dizzy') { if (e.stT <= 0) e.st = 'walk'; }
        continue;
      }
      if (def.ai === 'mirror') {         // chase; when a player dodges nearby, dash the same way at them
        e.dashT = Math.max(0, (e.dashT ?? 0) - dt);
        const dodger = [...this.players.values()].find((p) => p.dodgeT > 0 && Math.hypot(p.x - e.x, p.y - e.y) < def.mirrorRange);
        if (dodger && !e.dashT && !e.mirrored?.has(dodger.dodgeStamp)) {
          (e.mirrored ??= new Set()).add(dodger.dodgeStamp);
          const tx = dodger.x + dodger.dodgeDx * 40, ty = dodger.y + dodger.dodgeDy * 40, dd = Math.hypot(tx - e.x, ty - e.y) || 1;
          e.dashT = def.dashTime; e.dx = (tx - e.x) / dd; e.dy = (ty - e.y) / dd;
        }
        if (e.dashT > 0) this._moveBody(e, e.dx * def.dashSpeed * dt, e.dy * def.dashSpeed * dt, def.radius);
        else if (e.hurtT <= 0) this._moveBody(e, ux * def.speed * dt, uy * def.speed * dt, def.radius);
        if (d < def.radius + 6 - (target.mods?.small ?? 0) && e.cd <= 0) { this._hurtPlayer(target, def.damage); e.cd = def.touchCooldown; }
        continue;
      }
      if (def.ai === 'lunge') {
        // Pack fighter: hold an orbit slot around the target, then take a turn (at most 2 at once).
        e.tgt = target.id; e.st ??= 'stalk'; e.stT = (e.stT ?? 0) - dt;
        if (e.st === 'stalk') {
          const slot = ((parseInt(String(e.id).replace(/\D/g, ''), 10) || 0) % 6) / 6 * Math.PI * 2 + this.tick / 400;
          const ox = target.x + Math.cos(slot) * def.orbit, oy = target.y + Math.sin(slot) * def.orbit;
          const mx = ox - e.x, my = oy - e.y, ml = Math.hypot(mx, my) || 1;
          if (e.hurtT <= 0 && ml > 3) this._moveBody(e, (mx / ml) * def.speed * dt, (my / ml) * def.speed * dt, def.radius);
          let busy = 0;
          for (const o of this.enemies.values()) if (o !== e && o.tgt === target.id && (o.st === 'windup' || o.st === 'lunge')) busy++;
          if (d < def.orbit + 16 && e.cd <= 0 && busy < 2 && e.hurtT <= 0) {
            e.st = 'windup'; e.stT = def.windup; e.dx = ux; e.dy = uy;
            this.events.push({ t: 'tell', x: e.x, y: e.y });
          }
        } else if (e.st === 'windup') {
          this._moveBody(e, -e.dx * 12 * dt, -e.dy * 12 * dt, def.radius);   // a small crouch back
          if (e.stT <= 0) { e.st = 'lunge'; e.stT = def.lungeTime; e.hitOnce = false; }
        } else if (e.st === 'lunge') {
          this._moveBody(e, e.dx * def.lungeSpeed * dt, e.dy * def.lungeSpeed * dt, def.radius);
          if (!e.hitOnce && d < def.radius + 7 - (target.mods?.small ?? 0)) { this._hurtPlayer(target, def.damage); e.hitOnce = true; }
          if (e.stT <= 0) { e.st = 'recover'; e.stT = def.recover; e.cd = def.touchCooldown + Math.random() * 0.6; }
        } else if (e.st === 'recover') {
          if (e.stT <= 0) e.st = 'stalk';
        }
        continue;
      }
      if (def.ai === 'chase') {
        if (e.hurtT <= 0) this._moveBody(e, ux * def.speed * dt, uy * def.speed * dt, def.radius);
        if (d < def.radius + 6 - (target.mods?.small ?? 0) && e.cd <= 0) { this._hurtPlayer(target, def.damage); e.cd = def.touchCooldown; }
      } else if (def.ai === 'kite') {
        // Keep the band: back off when you close in, close in when you're far, strafe sideways between.
        const dir = d < def.range * 0.6 ? -1 : d > def.range ? 1 : 0;
        const side = ((parseInt(String(e.id).replace(/\D/g, ''), 10) || 0) % 2 ? 1 : -1) * (Math.sin(this.tick / 90) > 0 ? 1 : -1);
        const sx = dir === 0 ? -uy * side * 0.8 : 0, sy = dir === 0 ? ux * side * 0.8 : 0;
        if (e.hurtT <= 0 && !(e.aimT > 0)) this._moveBody(e, (ux * dir + sx) * def.speed * dt, (uy * dir + sy) * def.speed * dt, def.radius);
        if (d <= def.range * 1.2 && e.cd <= 0 && !(e.aimT > 0)) { e.aimT = def.telegraph ?? 0.01; this.events.push({ t: 'tell', x: e.x, y: e.y }); }
        if (e.aimT > 0 && (e.aimT -= dt) <= 0) {
          e.aimT = 0; e.cd = def.fireCooldown;
          // Lead the target: aim where it will be when the shot arrives.
          const tt = d / def.shotSpeed, px = target.x + (def.lead ? (target.vx ?? 0) * tt : 0), py = target.y + (def.lead ? (target.vy ?? 0) * tt : 0);
          const base = Math.atan2(py - e.y, px - e.x), n = def.burst ?? 1;
          for (let i = 0; i < n; i++) {
            const a = base + (n > 1 ? (i - (n - 1) / 2) * (def.spread ?? 0.2) : 0);
            this.shots.push({ x: e.x, y: e.y - 4, vx: Math.cos(a) * def.shotSpeed, vy: Math.sin(a) * def.shotSpeed, life: 2.2, dmg: def.damage, from: 'enemy' });
          }
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
          if (!p.downed && Math.hypot(p.x - s.x, p.y - 6 - s.y) < 7 - (p.mods?.small ?? 0)) { this._hurtPlayer(p, s.dmg); hit = true; break; }
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
      if (p.reviveT >= COMBAT.reviveTime) { p.downed = false; p.hp = Math.min(this.maxHp(p), COMBAT.reviveHp + (helper?.mods?.reviveHeal ?? 0)); p.iframes = 1; this.events.push({ t: 'revive', id: p.id }); }
    }
  }

  get wiped() { return this.players.size > 0 && [...this.players.values()].every((p) => p.downed); }

  _moveBody(b, dx, dy, r) {
    const fits = (x, y) => !this._hitsBox(x, y, r, r * 0.7);
    let ok = true;
    if (fits(b.x + dx, b.y)) b.x += dx; else ok = false;
    if (fits(b.x, b.y + dy)) b.y += dy; else ok = false;
    return ok;   // false if a wall stopped it (a Captcha's charge ends there)
  }

  _hitsBox(x, y, hw, hh) {
    const x0 = Math.floor((x - hw) / TILE), x1 = Math.floor((x + hw - 0.01) / TILE);
    const y0 = Math.floor((y - hh) / TILE), y1 = Math.floor((y + hh - 0.01) / TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.map.solid(tx, ty)) return true;
    return false;
  }

  _moveAxis(p, dx, dy) {
    const nx = p.x + dx, ny = p.y + dy;
    if (!this._hits(nx, ny)) {
      p.x = nx; p.y = ny;
      // Walk-on exits marked `stepOn` (the lobby street doors; not the storm grate, which you could cross by accident): stepping on uses
      // it, like walking into any other door. Edge-triggered so standing there doesn't re-fire.
      const fk = `${Math.floor(nx / TILE)},${Math.floor(ny / TILE)}`;
      if (fk !== p.onTile) {
        p.onTile = fk;
        const fx = (this.map.floorExits ??= new Map(this.map.objects.filter((o) => o.action === 'exit' && o.floor && o.stepOn).map((o) => [`${o.x},${o.y}`, o]))).get(fk);
        if (fx && !String(p.id).startsWith('ai:')) this.events.push({ t: 'bumpExit', id: fx.id, by: p.id, dx: Math.sign(dx), dy: Math.sign(dy) });
      }
      return;
    }
    if (!dx && !dy) return;
    // Walking into a door opens it; walking into an exit (door, elevator, ladder) uses it.
    const tx = Math.floor((nx + Math.sign(dx) * HALF_W) / TILE), ty = Math.floor((ny + Math.sign(dy) * HALF_H) / TILE);
    const k = `${tx},${ty}`;
    const door = this.map.doors?.get(k);
    if (door && !door.open) { door.open = true; this.events.push({ t: 'door', id: door.id }); return; }
    if (this.map.blocked?.has(k)) {
      const ex = this.map.objects.find((o) => o.x === tx && o.y === ty && o.action === 'exit');
      if (ex && !String(p.id).startsWith('ai:')) this.events.push({ t: 'bumpExit', id: ex.id, by: p.id, dx: Math.sign(dx), dy: Math.sign(dy) });
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
        hp: Math.round(p.hp), mhp: this.maxHp(p), st: Math.round(p.sta ?? 100), sk: Math.round((p.skillCd ?? 0) * 10) / 10, w: p.waitExit || null, ri: !!p.riding, gr: !!(p.riding && p.grinding), bat: Math.round(p.battery ?? 100), dn: p.downed, rv: Math.round(p.reviveT * 10) / 10, sw: p.swingT > 0, iv: p.iframes > 0, mo: !!p.morphed, pl: p.playing?.song ?? null, in: p.playing?.instrument ?? null, zz: p.sleepT > 0, wd: p.wiredT > 0,
      })),
      map: this.map.id,
      enemies: [...this.enemies.values()].map((e) => ({ id: e.id, k: e.kind, x: Math.round(e.x), y: Math.round(e.y), hp: e.hp, h: e.hurtT > 0,
        mk: e.marked > 0, zz: e.sleepT > 0, sg: !!this._def(e).lullaby && !(e.sleepT > 0), st: e.st ?? null,
        ...(e.def && !e.boss ? { vn: e.def.vname, tr: e.def.trait, c: e.def.color, mh: e.def.hp, r: e.def.radius } : {}),
        ...(e.boss ? { boss: { name: e.def.name, ep: e.def.epithet, max: e.def.hp, c: e.def.color, r: e.def.radius, ph: e.phase, st: e.state ?? 'move', sahur: !!e.sahur, ring: !!e.sahur && e.fightT > 10 } } : {}) })),
      decoys: this.decoys.map((d) => ({ x: Math.round(d.x), y: Math.round(d.y) })),
      allies: (this.allies ?? []).map((a) => ({ x: Math.round(a.x), y: Math.round(a.y), hp: a.hp, mhp: a.maxHp, dn: a.down > 0, st: a.st })),
      hazards: this.hazards.map((h) => ({ x: Math.round(h.x), y: Math.round(h.y), r: h.r, t: Math.round(h.ttl * 10) / 10 })),
      ring: [...this.enemies.values()].find((e) => e.ringR != null)?.ringR ?? null,
      shots: this.shots.map((s) => ({ x: Math.round(s.x), y: Math.round(s.y), f: s.from === 'player' ? 1 : 0 })),
      events: this.events,
    };
  }
}
