// Ambient NPC fights the party can join (hub #69; Trevor, 2026-11-21: "more of an active fight that the players can
// also join in, that ends and isn't in a small bordered area, and the thing should be able to move, it should have legs").
//
// A Continuity squad is fighting a rotted drone hub that has grown legs. The hub walks a route through the area,
// plants itself to launch rot-drones, and stomps whatever gets close. The hub and its drones are real enemies in the
// sim, so anyone can hit them (players, companions, gadgets), and the drones go for troopers and players alike. The
// squad moves with the hub, keeping a firing line, and shoots it and its drones. Troopers knocked down get back up.
// The fight ends when the hub falls, whoever lands the last hit; the scene records a flag and later visits show the
// husk where it fell. Left alone the squad wins in a few minutes; the party speeds it up.
// Host-run: the sim steps it and puts skirmishView() in the snapshot. Content: src/content/skirmishes.js.
import { ENEMIES } from '../content/enemies.js';

const TILE = 16;
export const SK = {
  range: 170, shotSpeed: 300, shotLife: 0.8,
  troopCd: [0.9, 1.6], spread: 0.18, troopHp: 4, downFor: 5, troopSpeed: 34, troopR: 5,
  keep: [80, 130],            // the squad's distance from the hub: close enough to hit, out of stomp reach
  shotDrone: 6, shotHub: 3,   // trooper damage to a drone / to the hub
  maxDrones: 4, launchEvery: 1.6, droneHitCd: 1.5, threat: 55, droneLeash: 240, droneSight: 180,
  walkSpeed: 16, plantFor: [2.5, 4], walkFor: [5, 9], aggro: 140, leash: 300,
  stomp: { reach: 34, windup: 0.9, r: 42, dmg: 16, cd: 5, push: 30 },
};

function rng(seed) {   // mulberry32 over a string hash
  let h = 1779033703;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 3432918353), h = (h << 13) | (h >>> 19);
  return () => { h |= 0; h = (h + 0x6d2b79f5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const between = (r, [a, b]) => a + r() * (b - a);
const at = ([tx, ty]) => ({ x: tx * TILE + 8, y: ty * TILE + 8 });

/** spec: { id, machine: [tx, ty], route: [[tx, ty], ...], troopers: [[tx, ty], ...], over?, husk?, fell?: [tx, ty] } */
export function newSkirmish(spec, seed = 's') {
  const r = rng(`${seed}:${spec.id}`), home = at(spec.machine);
  const fell = spec.fell ? at(spec.fell) : home;
  return {
    id: spec.id, r, over: !!spec.over || !!spec.husk, husk: !!spec.husk, t: 0, spawned: false, hubId: null,
    home, route: (spec.route ?? [spec.machine]).map(at), leg: 0,
    hub: { x: spec.over || spec.husk ? fell.x : home.x, y: spec.over || spec.husk ? fell.y : home.y },
    // After the Call only the husk is left: the squad has moved on (LoreKeeper's story review).
    troopers: spec.husk ? [] : spec.troopers.map((p, i) => ({ ...at(p), hp: SK.troopHp, down: 0, cd: 0.3 + r() * 1.2, aim: 0, i, slot: (i / Math.max(1, spec.troopers.length - 1) - 0.5) * 1.6, moving: false })),
    shots: [], solid: [],
  };
}

const nearest = (list, x, y, ok = () => true) => {
  let best = null, bd = Infinity;
  for (const o of list) { if (!ok(o)) continue; const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { best = o; bd = d; } }
  return best && { o: best, d: bd };
};

function spawnHub(sim, sk) {
  const base = ENEMIES['enemy.drone_walker'], id = `e${sim._nextId++}`;
  const def = { ...base, vname: base.name, trait: 'plain' };
  sim.enemies.set(id, { id, kind: 'enemy.drone_walker', def, x: sk.hub.x, y: sk.hub.y, hp: def.hp, cd: 0, hurtT: 0, kx: 0, ky: 0,
    skUnit: 'hub', sk: { state: 'walk', t: between(sk.r, SK.walkFor), wp: 0, launch: 1.5, stompCd: 2, face: 1 } });
  sk.hubId = id;
}

function launchDrone(sim, sk, hub) {
  const base = ENEMIES['enemy.rot_drone'], id = `e${sim._nextId++}`, a = sk.r() * Math.PI * 2;
  sim.enemies.set(id, { id, kind: 'enemy.rot_drone', def: { ...base, vname: base.name, trait: 'plain' }, x: hub.x + Math.cos(a) * 14, y: hub.y - 10 + Math.sin(a) * 8,
    hp: base.hp, cd: 0, hurtT: 0, kx: 0, ky: 0, skUnit: 'drone', sk: { ph: sk.r() * 6.28, hitCd: 0.6 } });
}

/** A trooper's hit: no damage numbers, and a kill only pays if a player had a hand in it. */
function troopHit(sim, sk, e, dmg, ev) {
  e.hp -= dmg; e.hurtT = 0.1;
  if (e.hp > 0) return;
  sim.enemies.delete(e.id);
  const paid = e.skUnit === 'hub' && e.lastHitBy;
  ev.push({ t: 'kill', x: e.x, y: e.y, kind: e.kind, by: paid ? e.lastHitBy : undefined, xp: paid ? e.def.xp : 0, ...(paid ? {} : { bg: true }) });
}

/** One tick. Returns events ({ t: 'skFire' | 'skDown' | 'skStomp' | 'skOver' | 'kill' | 'tell', ... }) for the scene. */
export function stepSkirmish(sim, sk, dt) {
  const ev = [], r = sk.r;
  sk.t += dt;
  if (!sk.over && !sk.spawned) { sk.spawned = true; spawnHub(sim, sk); }
  const hub = sk.hubId ? sim.enemies.get(sk.hubId) : null;
  if (!sk.over && sk.spawned && !hub) {   // it fell, to whoever: the fight is over
    sk.over = true;
    for (const e of [...sim.enemies.values()]) if (e.skUnit === 'drone') { sim.enemies.delete(e.id); ev.push({ t: 'kill', x: e.x, y: e.y, kind: e.kind, xp: 0, crumble: true, bg: true }); }
    ev.push({ t: 'skOver', id: sk.id, x: sk.hub.x, y: sk.hub.y, tx: Math.floor(sk.hub.x / TILE), ty: Math.floor(sk.hub.y / TILE) });
  }
  if (hub) { sk.hub.x = hub.x; sk.hub.y = hub.y; }
  const drones = [...sim.enemies.values()].filter((e) => e.skUnit === 'drone');
  // The squad: hold a line at firing distance from the hub, each on its own bearing; fire at drones close by, else the hub.
  for (const tr of sk.troopers) {
    if (tr.down > 0) { if ((tr.down -= dt) <= 0) { tr.down = 0; tr.hp = SK.troopHp; } tr.moving = false; continue; }
    tr.moving = false;
    if (sk.over) continue;
    const dx = tr.x - sk.hub.x, dy = tr.y - sk.hub.y, d = Math.hypot(dx, dy) || 1;
    const want = d < SK.keep[0] ? 1 : d > SK.keep[1] ? -1 : 0;
    if (want) {
      // Step out or in along the line to the hub, and drift toward this trooper's own bearing so the squad fans out.
      const a = Math.atan2(dy, dx), side = Math.sin(tr.slot - a) * 0.4;
      const mx = (dx / d) * want - (dy / d) * side, my = (dy / d) * want + (dx / d) * side, l = Math.hypot(mx, my) || 1;
      const ox = tr.x, oy = tr.y, v = SK.troopSpeed * dt;
      // Blocked: slide along the wall (the side picked per trooper and switched now and then), not into it.
      if (sim._moveBody(tr, (mx / l) * v, (my / l) * v, SK.troopR) === false) {
        const sgn = Math.sin(sk.t * 0.3 + tr.i * 2) > 0 ? 1 : -1;
        sim._moveBody(tr, (-my / l) * v * sgn, (mx / l) * v * sgn, SK.troopR);
      }
      tr.moving = Math.hypot(tr.x - ox, tr.y - oy) > 0.05;
    }
    if ((tr.cd -= dt) > 0) continue;
    const dr = nearest(drones, tr.x, tr.y);
    const tgt = dr && dr.d < SK.threat ? dr.o : hub;   // a drone on top of you first; otherwise the job is the hub
    if (!tgt || Math.hypot(tgt.x - tr.x, tgt.y - tr.y) > SK.range * 1.3) { tr.cd = 0.4; continue; }
    const a = Math.atan2(tgt.y - (tgt === hub ? 14 : 12) - (tr.y - 6), tgt.x - tr.x) + (r() - 0.5) * (tgt === hub ? 0.08 : SK.spread);
    tr.aim = a; tr.cd = between(r, SK.troopCd);
    sk.shots.push({ x: tr.x + Math.cos(a) * 8, y: tr.y - 6 + Math.sin(a) * 8, vx: Math.cos(a) * SK.shotSpeed, vy: Math.sin(a) * SK.shotSpeed, life: SK.shotLife });
    ev.push({ t: 'skFire', x: tr.x, y: tr.y });
  }
  // Shots: hit a drone or the hub; walls stop them; they never hit the party.
  for (const s of sk.shots) {
    s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (sim.map.solid(Math.floor(s.x / TILE), Math.floor((s.y + 8) / TILE))) { s.life = 0; continue; }
    const d = drones.find((o) => sim.enemies.has(o.id) && Math.hypot(o.x - s.x, o.y - 12 - s.y) < 7);
    if (d) { s.life = 0; troopHit(sim, sk, d, SK.shotDrone, ev); continue; }
    if (hub && sim.enemies.has(hub.id) && Math.abs(s.x - hub.x) < 15 && s.y > hub.y - 34 && s.y < hub.y) { s.life = 0; troopHit(sim, sk, hub, SK.shotHub, ev); }
  }
  sk.shots = sk.shots.filter((s) => s.life > 0);
  return ev;
}

/** The hub and its drones, stepped from the sim's enemy loop in place of the usual chase. */
export function stepSkUnit(sim, sk, e, def, dt) {
  e.kx = 0; e.ky = 0;   // too heavy to knock about; drones are steered, not shoved
  const ev = sim.events;   // the enemy loop runs after this tick's events were set up
  if (e.skUnit === 'drone') return stepDrone(sim, sk, e, def, dt, ev);
  const s = e.sk, r = sk?.r ?? Math.random;
  const players = [...sim.players.values()].filter((p) => !p.downed);
  const close = nearest(players, e.x, e.y);
  const near = nearest([...players, ...(sk?.troopers ?? []).filter((t) => !t.down)], e.x, e.y);
  s.stompCd = Math.max(0, s.stompCd - dt);
  const hurt = 1 - e.hp / def.hp, pace = 1 + hurt * 0.6;   // it gets frantic as it fails
  if (s.state === 'tell') {   // rising on its legs before the slam: get out of the ring
    if ((s.t -= dt) <= 0) {
      s.state = 'walk'; s.t = between(r, SK.walkFor); s.stompCd = SK.stomp.cd;
      ev.push({ t: 'skStomp', x: e.x, y: e.y, r: SK.stomp.r });
      for (const p of players) {
        const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy);
        if (d > SK.stomp.r) continue;
        sim._hurtPlayer(p, SK.stomp.dmg, 0);
        sim._moveBody(p, (dx / (d || 1)) * SK.stomp.push, (dy / (d || 1)) * SK.stomp.push, 6);
      }
      for (const t of sk?.troopers ?? []) if (!t.down && Math.hypot(t.x - e.x, t.y - e.y) <= SK.stomp.r) { t.down = SK.downFor; ev.push({ t: 'skDown', x: t.x, y: t.y }); }
    }
    return;
  }
  if (near && near.d < SK.stomp.reach && s.stompCd <= 0) { s.state = 'tell'; s.t = SK.stomp.windup; ev.push({ t: 'tell', x: e.x, y: e.y }); return; }
  // Launch drones while planted, and now and then on the move.
  const live = [...sim.enemies.values()].filter((o) => o.skUnit === 'drone').length;
  // ...but it holds off while two of the squad are down, so the line always recovers (left alone, the squad wins).
  const squadDown = (sk?.troopers ?? []).filter((o) => o.down).length >= 2;
  if ((s.launch -= dt * (s.state === 'plant' ? 1 : 0.3) * pace) <= 0) { s.launch = SK.launchEvery; if (live < SK.maxDrones && !squadDown) launchDrone(sim, sk ?? { r }, e); }
  if (s.state === 'plant') { if ((s.t -= dt) <= 0) { s.state = 'walk'; s.t = between(r, SK.walkFor); } return; }
  // Walk: toward a player who's close or has hit it (inside its leash), else along its route.
  const home = sk?.home ?? { x: e.x, y: e.y };
  let goal = null;
  const hitter = e.lastHitBy && sim.players.get(e.lastHitBy);
  const chase = (hitter && !hitter.downed && Math.hypot(hitter.x - e.x, hitter.y - e.y) < SK.aggro * 1.5) ? hitter : close && close.d < SK.aggro ? close.o : null;
  if (chase && Math.hypot(chase.x - home.x, chase.y - home.y) < SK.leash) goal = chase;
  else if (sk?.route?.length) {
    const wp = sk.route[s.wp % sk.route.length];
    if (Math.hypot(wp.x - e.x, wp.y - e.y) < 10) { s.wp = (s.wp + 1) % sk.route.length; s.state = 'plant'; s.t = between(r, SK.plantFor); return; }
    goal = wp;
  }
  if ((s.t -= dt) <= 0) { s.state = 'plant'; s.t = between(r, SK.plantFor); return; }
  if (!goal) return;
  const dx = goal.x - e.x, dy = goal.y - e.y, d = Math.hypot(dx, dy);
  if (d < (goal === chase ? 26 : 4)) return;
  const step = SK.walkSpeed * pace * dt;
  const ox = e.x, oy = e.y;
  sim._moveBody(e, (dx / d) * step, (dy / d) * step, 10);
  const moved = Math.hypot(e.x - ox, e.y - oy);
  if (sk) sk.leg += moved;
  // Walled off from where it's going: give up on that waypoint after a moment rather than pace in place.
  s.stuck = moved < step * 0.3 ? (s.stuck ?? 0) + dt : 0;
  if (s.stuck > 1.5 && goal !== chase && sk?.route?.length) { s.stuck = 0; s.wp = (s.wp + 1) % sk.route.length; }
  if (Math.abs(dx) > 2) s.face = dx > 0 ? 1 : -1;
}

function stepDrone(sim, sk, e, def, dt, ev) {
  const s = e.sk; s.ph += dt * 5; s.hitCd = Math.max(0, s.hitCd - dt);
  const hub = sk?.hubId && sim.enemies.get(sk.hubId);
  // Whoever is closest, trooper or roommate; never far from the hub.
  const targets = [...[...sim.players.values()].filter((p) => !p.downed), ...(sk?.troopers ?? []).filter((t) => !t.down)];
  const t = nearest(targets, e.x, e.y);
  let gx, gy;
  if (t && t.d < SK.droneSight && (!hub || Math.hypot(t.o.x - hub.x, t.o.y - hub.y) < SK.droneLeash)) { gx = t.o.x; gy = t.o.y; }
  else if (hub) { gx = hub.x + Math.cos(s.ph * 0.4) * 30; gy = hub.y - 10 + Math.sin(s.ph * 0.4) * 20; }
  else return;
  const a = Math.atan2(gy - e.y, gx - e.x) + Math.sin(s.ph) * 0.9;
  e.x += Math.cos(a) * def.speed * dt; e.y += Math.sin(a) * def.speed * dt;   // they fly: walls don't stop them
  if (t && t.d < 9 && s.hitCd <= 0) {
    s.hitCd = SK.droneHitCd; e.x -= Math.cos(a) * 14; e.y -= Math.sin(a) * 14;
    if (sim.players.has(t.o.id) && sim.players.get(t.o.id) === t.o) sim._hurtPlayer(t.o, def.damage, 0);
    else if (--t.o.hp <= 0) { t.o.down = SK.downFor; ev.push({ t: 'skDown', x: t.o.x, y: t.o.y }); }
  }
}

/** Compact, for the snapshot: what the scene draws. */
export function skirmishView(sk, sim) {
  if (!sk) return null;
  const R = (v) => Math.round(v);
  const hub = sk.hubId && sim?.enemies.get(sk.hubId);
  const st = hub ? { walk: 0, plant: 1, tell: 2 }[hub.sk.state] ?? 0 : 0;
  return {
    id: sk.id, over: sk.over, ...(sk.husk ? { husk: true } : {}),
    m: [R(sk.hub.x), R(sk.hub.y), hub ? hub.hp : 0, ENEMIES['enemy.drone_walker'].hp, R(sk.leg), st, hub?.sk.face ?? 1, hub && hub.hurtT > 0 ? 1 : 0],
    home: [R(sk.home.x), R(sk.home.y)],
    tr: sk.troopers.map((t) => [R(t.x), R(t.y), t.down > 0 ? 1 : 0, Math.round(t.aim * 100) / 100, t.moving ? 1 : 0]),
    dr: [...(sim?.enemies.values() ?? [])].filter((e) => e.skUnit === 'drone').map((d) => [R(d.x), R(d.y), d.hurtT > 0 ? 1 : 0]),
    sh: sk.shots.map((s) => [R(s.x), R(s.y), Math.round(Math.atan2(s.vy, s.vx) * 100) / 100]),
  };
}
