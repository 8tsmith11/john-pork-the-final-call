// A button that plays a random gag (Manuel, 2026-11-20): L. The host picks one whose conditions hold right now and
// brings that gag's timer forward, so the gag's own module plays it the usual way: same lines, same screens in
// co-op, same consent switches. A guest's press goes to the host. A short cooldown keeps it from being spammed.
import { crushTier } from './crush.js';

export const GAG_KEY = 'L';
const COOLDOWN = 3000;

/** The gags that can play right now, given the scene's gag modules and the latest snapshot: [{ id, fire }]. */
export function gagOptions(s, snap) {
  const P = (c) => snap?.players?.find((p) => p.c === c && !p.dn && !p.zz);
  const manuel = P('manuel'), michael = P('michael');
  const d = manuel && michael ? Math.hypot(manuel.x - michael.x, manuel.y - michael.y) : Infinity;
  const out = [];
  if (manuel && s.fart) out.push({ id: 'fart', fire: () => { s.fart.next = 0; s.fart.due = -1e9; } });
  if (michael && s.beltless) out.push({ id: 'belt', fire: () => { s.beltless.next = 0; } });
  if (manuel && s.bigButt) out.push({ id: 'butt', fire: () => { s.bigButt.next = 0; } });
  if (manuel && michael && d <= 80 && s.toothpaste && (s.save?.party?.manuel?.level ?? 1) >= 6) out.push({ id: 'toothpaste', fire: () => { s.toothpaste.next = 0; } });
  if (snap?.players?.some((p) => !p.dn) && s.gags?.next && 'chat' in s.gags.next) out.push({ id: 'chat', fire: () => { s.gags.next.chat = 0; } });
  if (manuel && s.gags?.next && 'abuela' in s.gags.next) out.push({ id: 'abuela', fire: () => { s.gags.next.abuela = 0; } });
  if (d <= 72 && s.gags?.next && 'cmp' in s.gags.next) out.push({ id: 'cmp', fire: () => { s.gags.next.cmp = 0; } });
  if (d <= 20 && s.crush && s.save && crushTier(s.save) >= 2) out.push({ id: 'g', fire: () => { s.crush.nextPat = 0; } });
  return out;
}

export class GagButton {
  constructor(scene) {
    this.s = scene; this.until = 0;
    scene.input?.keyboard?.on(`keydown-${GAG_KEY}`, () => {
      if (scene.dlg || scene.menu) return;
      if (scene.mode === 'client') scene.net.send({ t: 'gagBtn' }); else this.press();
    });
  }

  /** Host: pick one gag that can play and bring it on. Returns its id, or null. */
  press(snap = this.s._lastRendered, rnd = Math.random) {
    const s = this.s, now = s.time.now;
    if (now < this.until) return null;
    const list = gagOptions(s, snap);
    if (!list.length) return null;
    const g = list[Math.floor(rnd() * list.length)];
    this.until = now + COOLDOWN;
    g.fire();
    return g.id;
  }
}
