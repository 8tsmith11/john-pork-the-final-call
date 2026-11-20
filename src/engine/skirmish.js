// Ambient NPC-vs-NPC fights, for worldbuilding (hub #69, Trevor: "a scene where we see npcs fighting each other").
// A squad holds a firing line against a rotted machine that keeps launching rot-drones at them. The party can watch
// from the tape but can't join in or get hurt: these units live outside the combat sim. Nobody dies either. A trooper
// a drone gets to goes down for a few seconds and gets back up. When the machine falls the fight is over for good
// (the scene records a flag) and later visits show the burned husk with the squad standing down.
// Pure rules, host-run; the sim steps it and puts skirmishView() in the snapshot. Content: src/content/skirmishes.js.

const TILE = 16;
export const SK = {
  range: 170, shotSpeed: 280, shotDmg: 1,
  troopCd: [0.9, 1.7], spread: 0.2, troopHp: 3, downFor: 5,
  droneHp: 2, droneSpeed: 70, maxDrones: 5, spawnEvery: 2.2, droneHitCd: 1.2,
  machineHp: 200, machineR: 14, droneR: 5,
};

function rng(seed) {   // mulberry32 over a string hash
  let h = 1779033703;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 3432918353), h = (h << 13) | (h >>> 19);
  return () => { h |= 0; h = (h + 0x6d2b79f5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** spec: { id, area: [tx, ty, tw, th], machine: [tx, ty], troopers: [[tx, ty], ...], over?: bool } */
export function newSkirmish(spec, seed = 's') {
  const r = rng(`${seed}:${spec.id}`), at = ([tx, ty]) => ({ x: tx * TILE + 8, y: ty * TILE + 8 });
  const [ax, ay, aw, ah] = spec.area;
  return {
    id: spec.id, r, over: !!spec.over, t: 0, spawnT: 1.5,
    box: { x0: ax * TILE, y0: ay * TILE, x1: (ax + aw) * TILE, y1: (ay + ah) * TILE },
    machine: { ...at(spec.machine), hp: spec.over ? 0 : SK.machineHp, max: SK.machineHp },
    troopers: spec.troopers.map((p, i) => ({ ...at(p), hp: SK.troopHp, down: 0, cd: 0.3 + r() * 1.2, aim: Math.PI, i })),
    drones: [], shots: [],
    // The hub's footprint is solid while it's on the map, burning or burned out (gonman): three tiles wide, two deep.
    solid: [-1, 0, 1].flatMap((dx) => [-1, 0].map((dy) => `${spec.machine[0] + dx},${spec.machine[1] + dy}`)),
  };
}

const near = (list, x, y, ok = () => true) => {
  let best = null, bd = Infinity;
  for (const o of list) { if (!ok(o)) continue; const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { best = o; bd = d; } }
  return best && { o: best, d: bd };
};

/** One tick. Returns events ({ t: 'skFire' | 'skDown' | 'skOver', ... }) for the scene. */
export function stepSkirmish(sk, dt) {
  const ev = [], r = sk.r, m = sk.machine, b = sk.box;
  sk.t += dt;
  // The machine launches drones while it stands.
  // ...and holds off while two of the squad are down, so the line always recovers (it's scenery, not a coin flip).
  if (!sk.over && (sk.spawnT -= dt) <= 0 && sk.drones.length < SK.maxDrones && sk.troopers.filter((o) => o.down).length < 2) {
    sk.spawnT = SK.spawnEvery * (0.7 + r() * 0.6) * (1 + sk.drones.length * 0.35);   // slower with more already out
    const a = Math.PI + (r() - 0.5) * 1.6;   // out toward the line (the squad stands to the machine's west)
    sk.drones.push({ x: m.x + Math.cos(a) * 16, y: m.y + Math.sin(a) * 16, hp: SK.droneHp, ph: r() * 6.28, hitCd: 0 });
  }
  // Troopers: fire at the nearest drone in range, else at the machine. Down ones count back up.
  for (const tr of sk.troopers) {
    if (tr.down > 0) { if ((tr.down -= dt) <= 0) { tr.down = 0; tr.hp = SK.troopHp; } continue; }
    if (sk.over) continue;
    if ((tr.cd -= dt) > 0) continue;
    // Every third shot goes into the hub whatever is coming (the squad's job is the hub, not the drones).
    const d = near(sk.drones, tr.x, tr.y), tgt = d && d.d < SK.range && (tr.n = (tr.n ?? 0) + 1) % 3 ? d.o : m;
    const a = Math.atan2(tgt.y - (tgt === m ? tr.y + 8 : tr.y), tgt.x - tr.x) + (r() - 0.5) * (tgt === m ? 0.12 : SK.spread);   // drones are hard to hit
    tr.aim = a; tr.cd = SK.troopCd[0] + r() * (SK.troopCd[1] - SK.troopCd[0]);
    sk.shots.push({ x: tr.x + Math.cos(a) * 8, y: tr.y - 6 + Math.sin(a) * 8, vx: Math.cos(a) * SK.shotSpeed, vy: Math.sin(a) * SK.shotSpeed, life: 1.2 });
    ev.push({ t: 'skFire', x: tr.x, y: tr.y });
  }
  // Drones: weave toward the nearest standing trooper; a touch knocks them down and the drone bounces off.
  for (const dr of sk.drones) {
    dr.ph += dt * 5; dr.hitCd = Math.max(0, dr.hitCd - dt);
    const t = near(sk.troopers, dr.x, dr.y, (o) => !o.down);
    if (t) {
      const a = Math.atan2(t.o.y - dr.y, t.o.x - dr.x) + Math.sin(dr.ph) * 0.9;
      dr.x += Math.cos(a) * SK.droneSpeed * dt; dr.y += Math.sin(a) * SK.droneSpeed * dt;
      if (t.d < 9 && dr.hitCd <= 0) {
        dr.hitCd = SK.droneHitCd; dr.x -= Math.cos(a) * 14; dr.y -= Math.sin(a) * 14;
        if (--t.o.hp <= 0) { t.o.down = SK.downFor; ev.push({ t: 'skDown', x: t.o.x, y: t.o.y }); }
      }
    }
    dr.x = Math.max(b.x0 + 4, Math.min(b.x1 - 4, dr.x)); dr.y = Math.max(b.y0 + 4, Math.min(b.y1 - 4, dr.y));
  }
  // Shots: hit a drone or the machine, else fly out.
  for (const s of sk.shots) {
    s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    const dr = sk.drones.find((o) => o.hp > 0 && Math.hypot(o.x - s.x, o.y - s.y) < SK.droneR + 2);
    if (dr) { dr.hp -= SK.shotDmg; s.life = 0; if (dr.hp <= 0) ev.push({ t: 'skPop', x: dr.x, y: dr.y }); continue; }
    if (!sk.over && Math.hypot(m.x - s.x, m.y - 8 - s.y) < SK.machineR) {
      s.life = 0; m.hp = Math.max(0, m.hp - SK.shotDmg);
      if (m.hp === 0) { sk.over = true; ev.push({ t: 'skOver', id: sk.id, x: m.x, y: m.y }); }
    }
    if (s.x < b.x0 || s.x > b.x1 || s.y < b.y0 || s.y > b.y1) s.life = 0;   // nothing leaves the tape (gonman: stray shots near Mrs. Okafor)
  }
  sk.shots = sk.shots.filter((s) => s.life > 0);
  sk.drones = sk.over ? [] : sk.drones.filter((o) => o.hp > 0);   // the hub's fall takes its drones down with it
  return ev;
}

/** Compact, for the snapshot: what the scene draws. */
export function skirmishView(sk) {
  if (!sk) return null;
  const R = (v) => Math.round(v);
  return {
    id: sk.id, over: sk.over, box: [sk.box.x0, sk.box.y0, sk.box.x1, sk.box.y1],
    m: [R(sk.machine.x), R(sk.machine.y), sk.machine.hp, sk.machine.max],
    tr: sk.troopers.map((t) => [R(t.x), R(t.y), t.down > 0 ? 1 : 0, Math.round(t.aim * 100) / 100]),
    dr: sk.drones.map((d) => [R(d.x), R(d.y)]),
    sh: sk.shots.map((s) => [R(s.x), R(s.y), Math.round(Math.atan2(s.vy, s.vx) * 100) / 100]),
  };
}
