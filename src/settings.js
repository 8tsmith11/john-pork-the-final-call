// Player settings (task #31), stored per browser like the language: volumes, screen shake, text speed.
// Everything reads through get(); set() saves and tells listeners (audio re-applies its volumes).
const KEY = 'jpfc.settings';
// The background soundtrack starts muted (Michael, 2026-11-19); instruments, effects and voices don't.
// Turn it back up under Settings; that choice is kept. MUSIC_OFF_V mutes it once for players whose saved
// settings predate the change.
const MUSIC_OFF_V = 2;
const DEFAULTS = { music: 0, sfx: 1, voice: 1, shake: true, textSpeed: 'normal', v: MUSIC_OFF_V };
let s = { ...DEFAULTS };
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  s = { ...DEFAULTS, ...saved };
  if ((saved.v ?? 0) < MUSIC_OFF_V) { s.music = 0; s.v = MUSIC_OFF_V; localStorage.setItem(KEY, JSON.stringify(s)); }
} catch { /* private window: defaults */ }
const listeners = new Set();

export const get = (k) => s[k];
export function set(k, v) {
  s[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* fine */ }
  for (const fn of listeners) fn(k, v);
}
export const onChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

// Characters per second for the dialogue typewriter.
export const TEXT_SPEEDS = { slow: 30, normal: 55, fast: 110, instant: 100000 };
export const VOLUME_STEPS = [1, 0.75, 0.5, 0.25, 0];
export const nextVolume = (v) => VOLUME_STEPS[(VOLUME_STEPS.indexOf(v) + 1) % VOLUME_STEPS.length] ?? 1;
export const nextSpeed = (v) => { const k = Object.keys(TEXT_SPEEDS); return k[(k.indexOf(v) + 1) % k.length]; };
