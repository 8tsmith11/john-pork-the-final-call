// The assembly rules (docs/design/12-engineering-balance.md, section 4). Pure functions: the bench UI shows what
// they return before anything is spent, the host builds with them, and tests pin them down.
//   build = { frame, power, payload, control } (part ids from src/content/parts.js), plus `tol` once printed.
import { FRAMES, POWER, PAYLOADS, CONTROLS, HANDLING } from '../content/parts.js';
import { Rng } from './rng.js';

export const COOLDOWN_FLOOR = 0.6;   // tolerances never take a cooldown below 60% of its base (section 2)
export const TOL = { cooldown: 0.06, effect: 0.06 };   // seeded tolerance, +/- this fraction

/** Can this build be made? { ok, reasons[] } in plain words for the bench. */
export function legality(build, known = () => true) {
  const f = FRAMES[build.frame], pw = POWER[build.power], pl = PAYLOADS[build.payload], c = CONTROLS[build.control], reasons = [];
  if (!f) reasons.push('needs a frame'); if (!pw) reasons.push('needs power'); if (!pl) reasons.push('needs a payload'); if (!c) reasons.push('needs a control board');
  for (const id of [build.frame, build.power, build.payload, build.control]) {
    const part = FRAMES[id] ?? POWER[id] ?? PAYLOADS[id] ?? CONTROLS[id];
    if (part?.schematic && !known(part.schematic)) reasons.push(`${part.name}: no schematic yet`);
  }
  if (f && pl && !f.mounts.includes(pl.mount)) reasons.push(`${pl.name} doesn't fit a ${f.name}`);
  if (f && pw && pl && pw.weight + pl.weight > f.capacity) reasons.push(`too heavy for a ${f.name} (${pw.weight + pl.weight}/${f.capacity})`);
  return { ok: !reasons.length, reasons };
}

/** The seeded tolerance a printed build carries (world seed + recipe + how many were printed): same on every screen. */
export function rollTolerance(seed, build, count = 0) {
  const r = new Rng(`${seed}:build:${build.frame}:${build.power}:${build.payload}:${build.control}:${count}`);
  const t = (k) => Math.round((r.next() * 2 - 1) * TOL[k] * 1000) / 1000;
  return { cooldown: t('cooldown'), effect: t('effect') };
}

/** Everything the bench shows before printing, and what the sim uses after. */
export function buildStats(build) {
  const f = FRAMES[build.frame], pw = POWER[build.power], pl = PAYLOADS[build.payload], c = CONTROLS[build.control];
  if (!f || !pw || !pl || !c) return null;
  const tol = build.tol ?? { cooldown: 0, effect: 0 }, base = pl.cost / pw.rate;
  const load = (pw.weight + pl.weight) / f.capacity, h = HANDLING[f.handling];
  return {
    kind: pl.kind,
    cooldown: Math.round(Math.max(base * COOLDOWN_FLOOR, base * (1 + tol.cooldown)) * 10) / 10,
    charges: Math.max(1, Math.floor(pw.capacity / pl.cost)),
    effect: Math.round(pl.base * (1 + tol.effect) * (1 + c.precision) * 10) / 10,
    aim: Math.round((h.aim + (load > 0.75 ? 0.1 : 0)) * 100) / 100,
    slow: Math.round((h.slow + (load > 0.75 ? 0.1 : 0)) * 100) / 100,
    load: Math.round(load * 100) / 100,
    glitch: c.glitch, never: !!pw.never,
  };
}

/** Control wear: an auto-written board's glitch chance after `uses` (it grows until serviced, capped). */
export const glitchChance = (build, uses = 0) => {
  const c = CONTROLS[build.control];
  return c ? Math.min(c.maxGlitch, c.glitch + c.wear * uses) : 0;
};
/** One use: does it glitch? A glitch costs the use or delays it; it never does anything worse (section 4). */
export const glitches = (build, uses, roll = Math.random()) => roll < glitchChance(build, uses);

/** Materials to print it (frame + power + payload parts + control). */
export function materials(build) {
  const out = {};
  const add = (cost) => { for (const [k, v] of Object.entries(cost ?? {})) out[k] = (out[k] ?? 0) + v; };
  add(FRAMES[build.frame]?.cost); add(POWER[build.power]?.cost); add(PAYLOADS[build.payload]?.parts); add(CONTROLS[build.control]?.cost);
  return out;
}
