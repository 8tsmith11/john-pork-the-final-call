// A held line: Code-rot pushing at a cordon checkpoint, and the checkpoint holding (Trevor: "like an invasion is
// being held off"). Each pen beyond a barrier is kept topped up from off the map with a mix of rot forms, which push at
// the barrier whatever the party does. Troopers fire tracers, auto turrets sweep, and riot robots standing in the pen
// mouth shove the front rank back. The defenders only ever shoot into their own pen, and pen enemies never reach the
// party. Kills give no XP or drops, so the line can't be farmed.
// Pure rules, host-run: the sim steps it and puts siegeView() in the snapshot. Content: PLAZA_SIEGE in src/content/cordon.js.
import { ENEMIES } from '../content/enemies.js';

const TILE = 16;
export const SIEGE = {
  trooper: { every: [0.9, 1.6], dmg: 10, hit: 0.75, range: 120 },
  turret: { every: [0.22, 0.32], dmg: 3, hit: 0.55, range: 96, burst: 6, rest: [1.2, 2.2], turn: 5 },
  robot: { every: [0.9, 1.4], dmg: 4, reach: 22, shove: 150 },
  refill: [0.5, 1.8],   // seconds between arrivals while a pen is under strength
  tracer: 0.12,
};

function rng(seed) {   // mulberry32 over a string hash (same as skirmish.js)
  let h = 1779033703;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 3432918353), h = (h << 13) | (h >>> 19);
  return () => { h |= 0; h = (h + 0x6d2b79f5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const between = (r, [a, b]) => a + r() * (b - a);
const FRONT = { down: [0, 1], up: [0, -1], right: [1, 0], left: [-1, 0] };

/** spec: { id, pens: [{ id, rect: [tx, ty, tw, th], front, keep, mix: [[kind, weight, max?]] }],
 *          defenders: [{ kind: 'trooper'|'turret'|'robot', at: [tx, ty], pen, drawn? }] } */
export function newSiege(spec, seed = 's') {
  const r = rng(`${seed}:${spec.id}`);
  const pens = spec.pens.map((p) => {
    const [tx, ty, tw, th] = p.rect;
    return { ...p, box: { x0: tx * TILE, y0: ty * TILE, x1: (tx + tw) * TILE, y1: (ty + th) * TILE }, dir: FRONT[p.front], t: 0, filled: false };
  });
  const defenders = spec.defenders.map((d, i) => {
    const [fx, fy] = pens.find((p) => p.id === d.pen)?.dir ?? [0, 1];
    // Everyone on the line faces the pen: against the direction the rot pushes.
    return { i, kind: d.kind, pen: d.pen, drawn: !!d.drawn, x: d.at[0] * TILE + 8, y: d.at[1] * TILE + 8,
      cd: r() * 1.2, aim: Math.atan2(-fy, -fx), shots: 0, flash: 0, shove: 0 };
  });
  return { id: spec.id, r, pens, defenders, tracers: [] };
}

function pick(r, mix, counts) {
  const ok = mix.filter(([kind, , max]) => max == null || (counts[kind] ?? 0) < max);
  let roll = r() * ok.reduce((t, [, w]) => t + w, 0);
  return (ok.find(([, w]) => (roll -= w) < 0) ?? ok[0])[0];
}

/** A pen enemy: plain stats (they're scenery with teeth), no XP, its pen and push direction. */
function arrive(sim, sg, pen, kind, anywhere) {
  const base = ENEMIES[kind], r = sg.r, rad = base.radius ?? 6, b = pen.box, [fx, fy] = pen.dir;
  // New arrivals come in at the back of the pen (from off the map); the first fill spreads them through it.
  const depth = anywhere ? r() : r() * 0.25;
  const along = (lo, hi) => lo + rad + r() * Math.max(0, hi - lo - rad * 2);
  const x = fx ? (fx > 0 ? b.x0 + rad + depth * (b.x1 - b.x0 - rad * 2) : b.x1 - rad - depth * (b.x1 - b.x0 - rad * 2)) : along(b.x0, b.x1);
  const y = fy ? (fy > 0 ? b.y0 + rad + depth * (b.y1 - b.y0 - rad * 2) : b.y1 - rad - depth * (b.y1 - b.y0 - rad * 2)) : along(b.y0, b.y1);
  const id = `e${sim._nextId++}`;
  const def = { ...base, xp: 0, vname: base.name, trait: 'plain' };
  sim.enemies.set(id, { id, kind, def, x, y, hp: def.hp, cd: r(), hurtT: 0, kx: 0, ky: 0, pen: pen.rect, siege: { pen: pen.id, fx, fy, ph: r() * 6.28 } });
  return id;
}

/** Hurt a pen enemy from the line (no 'hit' numbers: it's background fire). */
function strike(sim, e, dmg, kx = 0, ky = 0) {
  e.hp -= dmg; e.hurtT = 0.1; e.kx = (e.kx ?? 0) + kx; e.ky = (e.ky ?? 0) + ky;
  if (e.hp > 0) return false;
  sim.enemies.delete(e.id);
  sim.events.push({ t: 'kill', x: e.x, y: e.y, kind: e.kind, xp: 0, siege: true });
  return true;
}

/** The pen enemy's own move, instead of chasing a player: lean on the barrier as a crowd. */
export function siegeMove(sim, e, def, dt) {
  const s = e.siege;
  s.ph += dt * (1.5 + (def.radius ?? 6) * 0.05);
  let sx = 0, sy = 0;
  for (const o of sim.enemies.values()) {
    if (o === e || o.siege?.pen !== s.pen) continue;
    const dx = e.x - o.x, dy = e.y - o.y, dd = Math.hypot(dx, dy), min = (def.radius ?? 6) + (sim._def(o).radius ?? 6) + 1;
    if (dd > 0 && dd < min) { sx += dx / dd; sy += dy / dd; }
  }
  // Push toward the barrier, sway along it, and shoulder the others aside.
  const sway = Math.sin(s.ph) * 0.8, dx = s.fx + -s.fy * sway + sx * 0.9, dy = s.fy + s.fx * sway + sy * 0.9;
  const len = Math.max(1, Math.hypot(dx, dy));
  if (e.hurtT <= 0) sim._moveBody(e, dx / len * def.speed * dt, dy / len * def.speed * dt, def.radius);
}

/** One tick: refill the pens, then the line fires. Returns nothing; kills go out as sim events. */
export function stepSiege(sim, sg, dt) {
  const r = sg.r;
  const inPen = (pen) => [...sim.enemies.values()].filter((e) => e.siege?.pen === pen.id);
  for (const pen of sg.pens) {
    const here = inPen(pen), counts = {};
    for (const e of here) counts[e.kind] = (counts[e.kind] ?? 0) + 1;
    if (!pen.filled) {   // arriving at the map: the pen is already full
      pen.filled = true;
      for (let n = here.length; n < pen.keep; n++) { const k = pick(r, pen.mix, counts); counts[k] = (counts[k] ?? 0) + 1; arrive(sim, sg, pen, k, true); }
      pen.t = between(r, SIEGE.refill);
      continue;
    }
    if (here.length < pen.keep && (pen.t -= dt) <= 0) { arrive(sim, sg, pen, pick(r, pen.mix, counts)); pen.t = between(r, SIEGE.refill); }
  }
  sg.tracers = sg.tracers.filter((t) => (t.ttl -= dt) > 0);
  for (const d of sg.defenders) {
    d.flash = Math.max(0, d.flash - dt); d.shove = Math.max(0, d.shove - dt);
    const pen = sg.pens.find((p) => p.id === d.pen); if (!pen) continue;
    const rule = SIEGE[d.kind];
    // The closest thing pushing at the line: the front rank first.
    let tgt = null, best = Infinity;
    for (const e of sim.enemies.values()) {
      if (e.siege?.pen !== pen.id) continue;
      const dist = Math.hypot(e.x - d.x, e.y - d.y);
      if (dist < best) { best = dist; tgt = e; }
    }
    if (d.kind === 'turret' && tgt) {   // the barrel tracks, at a limited turn rate
      const want = Math.atan2(tgt.y - d.y, tgt.x - d.x);
      let diff = Math.atan2(Math.sin(want - d.aim), Math.cos(want - d.aim));
      d.aim += Math.max(-rule.turn * dt, Math.min(rule.turn * dt, diff));
    }
    if ((d.cd -= dt) > 0) continue;
    if (d.kind === 'robot') {
      d.cd = between(r, rule.every);
      if (!tgt || best > rule.reach) continue;
      // Shield first: everything in reach is thrown back toward the far end of the pen.
      d.shove = 0.25;
      for (const e of [...sim.enemies.values()]) {
        if (e.siege?.pen !== pen.id || Math.hypot(e.x - d.x, e.y - d.y) > rule.reach) continue;
        strike(sim, e, rule.dmg, -pen.dir[0] * rule.shove, -pen.dir[1] * rule.shove);
      }
      continue;
    }
    if (!tgt || best > rule.range) { d.cd = 0.3; continue; }
    if (d.kind === 'turret') {
      d.shots++;
      d.cd = d.shots % rule.burst ? between(r, rule.every) : between(r, rule.rest);
    } else {
      d.cd = between(r, rule.every);
      d.aim = Math.atan2(tgt.y - d.y, tgt.x - d.x);
    }
    d.flash = 0.06;
    const hit = r() < rule.hit, a = d.aim + (hit ? 0 : (r() - 0.5) * 0.5);
    const reach = hit ? best : best + 24;
    sg.tracers.push({ x1: d.x + Math.cos(a) * (d.kind === 'turret' ? 15 : 7), y1: d.y - (d.kind === 'turret' ? 3 : 6) + Math.sin(a) * (d.kind === 'turret' ? 15 : 7), x2: d.x + Math.cos(a) * reach, y2: d.y - 6 + Math.sin(a) * reach, k: d.kind === 'turret' ? 1 : 0, ttl: SIEGE.tracer });
    if (hit) strike(sim, tgt, rule.dmg, Math.cos(a) * 30, Math.sin(a) * 30);
  }
}

/** Compact, for the snapshot: the defenders (position, kind, aim, flash/shove) and live tracers. */
export function siegeView(sg) {
  if (!sg) return null;
  const R = (v) => Math.round(v), K = { trooper: 0, turret: 1, robot: 2 };
  return {
    d: sg.defenders.map((d) => [R(d.x), R(d.y), K[d.kind], Math.round(d.aim * 100) / 100, d.flash > 0 ? 1 : d.shove > 0 ? 2 : 0, d.drawn ? 1 : 0]),
    tr: sg.tracers.map((t) => [R(t.x1), R(t.y1), R(t.x2), R(t.y2), t.k]),
  };
}
