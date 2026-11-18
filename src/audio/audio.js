// WebAudio: per-character "babble" voices for dialogue + a low ambient drone per area.
// No audio files needed. Real recorded/TTS voices can replace babble for act-ending cutscenes later.

let ctx = null, master = null, drone = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.25; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Voice timbres. Pork's is deliberately "hacked": low, detuned, a little broken.
const VOICES = {
  michael: { base: 210, spread: 40, wave: 'triangle' },
  trevor:  { base: 165, spread: 30, wave: 'triangle' },
  manuel:  { base: 190, spread: 55, wave: 'square' },
  halvard: { base: 120, spread: 20, wave: 'sawtooth' },
  pork:    { base: 95,  spread: 25, wave: 'sawtooth', glitch: true },
  'john pork': { base: 95, spread: 25, wave: 'sawtooth', glitch: true },
  sahur:   { base: 70,  spread: 6,  wave: 'sine', knock: true },
  default: { base: 150, spread: 35, wave: 'triangle' },
};

/** Babble a line: one blip per few characters, pitched per speaker. */
export function babble(who, text) {
  const a = ac(); if (!a || !text) return;
  const v = VOICES[(who || '').toLowerCase()] ?? VOICES.default;
  const n = Math.min(28, Math.ceil(text.length / 4));
  let t = a.currentTime + 0.02;
  for (let i = 0; i < n; i++) {
    const o = a.createOscillator(), g = a.createGain();
    o.type = v.wave;
    const f = v.base + (Math.random() * 2 - 1) * v.spread;
    o.frequency.setValueAtTime(f, t);
    if (v.glitch && Math.random() < 0.3) o.frequency.setValueAtTime(f * (Math.random() < 0.5 ? 0.5 : 2), t + 0.02);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v.knock ? 0.5 : 0.18, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + (v.knock ? 0.12 : 0.06));
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.14);
    t += v.knock ? 0.22 : 0.055 + Math.random() * 0.02;
  }
}

// Area moods: root note + interval, slowly beating. Rot areas detune harder.
const MOODS = {
  room631: [110, 1.5, 0.6], aster_hall: [98, 1.335, 1.2], metro_plaza: [82.4, 1.5, 2],
  tunnel_1: [55, 1.414, 3.5], platform: [49, 1.059, 6],
};

export function setArea(id) {
  const a = ac(); if (!a) return;
  if (drone) { const old = drone; old.g.gain.linearRampToValueAtTime(0, a.currentTime + 1.2); setTimeout(() => old.oscs.forEach((o) => o.stop()), 1400); drone = null; }
  const m = MOODS[id]; if (!m) return;
  const g = a.createGain(); g.gain.value = 0; g.connect(master);
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; lp.connect(g);
  const oscs = [m[0], m[0] * m[1], m[0] + m[2]].map((f, i) => {
    const o = a.createOscillator(); o.type = i === 1 ? 'triangle' : 'sine'; o.frequency.value = f; o.connect(lp); o.start(); return o;
  });
  g.gain.linearRampToValueAtTime(0.12, a.currentTime + 2);
  drone = { g, oscs };
}

export function sfx(kind) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
  const spec = { hit: [320, 120, 'square', 0.08], hurt: [140, 60, 'sawtooth', 0.15], shot: [700, 300, 'triangle', 0.05], kill: [500, 900, 'square', 0.12], swing: [260, 180, 'triangle', 0.05] }[kind];
  if (!spec) return;
  o.type = spec[2]; o.frequency.setValueAtTime(spec[0], t); o.frequency.exponentialRampToValueAtTime(spec[1], t + spec[3]);
  g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + spec[3]);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + spec[3] + 0.02);
}
