// Sealed (hub task #67; docs/sealed/roommate-surprises.md).
import { crushTier } from './crush.js';

export const HOST_PICK_KEY = 'L';
const COOLDOWN = 3000;

/** What can play right now: [{ id, fire }]. */
export function pickOptions(s, snap) {
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
  if (d <= 72 && s.gags?.next && 'sg' in s.gags.next) out.push({ id: 'sg', fire: () => { s.gags.next.sg = 0; } });
  if (d <= 20 && s.crush && s.save && crushTier(s.save) >= 2) out.push({ id: 'g', fire: () => { s.crush.nextGesture = 0; } });
  return out;
}

export class HostPick {
  constructor(scene) {
    this.s = scene; this.until = 0;
    scene.input?.keyboard?.on(`keydown-${HOST_PICK_KEY}`, () => {
      if (scene.dlg || scene.menu) return;
      if (scene.mode === 'client') scene.net.send({ t: 'hp' }); else this.press();
    });
  }

  /** Host: pick one and bring it on. Returns its id, or null. */
  press(snap = this.s._lastRendered, rnd = Math.random) {
    const s = this.s, now = s.time.now;
    if (now < this.until) return null;
    const list = pickOptions(s, snap);
    if (!list.length) return null;
    const g = list[Math.floor(rnd() * list.length)];
    this.until = now + COOLDOWN;
    g.fire();
    return g.id;
  }
}
