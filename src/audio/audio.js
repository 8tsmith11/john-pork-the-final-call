// WebAudio: per-character "babble" voices for dialogue and combat sfx; CC0 area music via <audio> (see CREDITS.md).
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

// Area music: CC0 tracks (see CREDITS.md), looped, crossfaded on area change.
const MUSIC = {
  room631: 'assets/audio/apartment_chill_lofi.ogg', aster_hall: 'assets/audio/apartment_chill_lofi.ogg',
  metro_plaza: null,   // the plaza gets a synthesized city soundscape instead of music
  tunnel_1: 'assets/audio/tunnel_claimed_by_the_void.ogg', platform: 'assets/audio/tunnel_claimed_by_the_void.ogg',
};
const MUSIC_VOL = 0.35;
let track = null, trackSrc = null;

function fade(el, to, ms, done) {
  const from = el.volume, t0 = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    el.volume = from + (to - from) * k;
    if (k < 1) requestAnimationFrame(step); else done?.();
  };
  step();
}

// ---------- synthesized soundscapes (no files, no licenses) ----------
let amb = null;
function noiseBuffer(a, kind) {
  const len = a.sampleRate * 4, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = kind === 'brown' ? (last + 0.02 * w) / 1.02 : w; d[i] = kind === 'brown' ? last * 3.5 : w; }
  return buf;
}
function loopNoise(a, kind, filterType, freq, gain, dest) {
  const src = a.createBufferSource(); src.buffer = noiseBuffer(a, kind); src.loop = true;
  const f = a.createBiquadFilter(); f.type = filterType; f.frequency.value = freq;
  const g = a.createGain(); g.gain.value = gain;
  src.connect(f); f.connect(g); g.connect(dest); src.start();
  return { src, g };
}
function startCity() {
  const a = ac(); if (!a) return null;
  const bus = a.createGain(); bus.gain.value = 0; bus.connect(master);
  const parts = [
    loopNoise(a, 'brown', 'lowpass', 180, 0.5, bus),     // traffic rumble
    loopNoise(a, 'white', 'highpass', 4500, 0.06, bus),  // rain hiss
    loopNoise(a, 'white', 'bandpass', 900, 0.025, bus),  // crowd murmur bed
  ];
  bus.gain.linearRampToValueAtTime(0.9, a.currentTime + 2);
  const timers = [];
  const event = () => {
    const t = a.currentTime, r = Math.random();
    const o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(bus);
    if (r < 0.45) {        // distant car horn
      o.type = 'square'; o.frequency.value = 330 + Math.random() * 120;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.025, t + 0.02); g.gain.setValueAtTime(0.025, t + 0.25); g.gain.linearRampToValueAtTime(0, t + 0.35);
      o.start(t); o.stop(t + 0.4);
    } else if (r < 0.6) {  // far siren sweep
      o.type = 'sine'; o.frequency.setValueAtTime(600, t);
      for (let i = 0; i < 4; i++) { o.frequency.linearRampToValueAtTime(950, t + i * 1.2 + 0.6); o.frequency.linearRampToValueAtTime(600, t + i * 1.2 + 1.2); }
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.012, t + 1); g.gain.linearRampToValueAtTime(0, t + 5);
      o.start(t); o.stop(t + 5);
    } else {               // a passing car (doppler-ish whoosh)
      o.disconnect(); const n = loopNoise(a, 'white', 'bandpass', 500, 0, bus);
      n.g.gain.setValueAtTime(0, t); n.g.gain.linearRampToValueAtTime(0.07, t + 1.2); n.g.gain.linearRampToValueAtTime(0, t + 2.6);
      setTimeout(() => n.src.stop(), 2800);
    }
    timers.push(setTimeout(event, 2500 + Math.random() * 6000));
  };
  timers.push(setTimeout(event, 1500));
  return { stop() { bus.gain.linearRampToValueAtTime(0, a.currentTime + 1); timers.forEach(clearTimeout); setTimeout(() => parts.forEach((p) => p.src.stop()), 1200); } };
}
// Quieter beds under the music: the building's hum, the tunnels' drips and electrical drone.
function startBed(kind) {
  const a = ac(); if (!a) return null;
  const bus = a.createGain(); bus.gain.value = 0; bus.connect(master);
  const parts = [];
  const hum = a.createOscillator(); hum.type = 'sine'; hum.frequency.value = kind === 'tunnel' ? 50 : 60;
  const hg = a.createGain(); hg.gain.value = kind === 'tunnel' ? 0.05 : 0.025; hum.connect(hg); hg.connect(bus); hum.start();
  parts.push({ src: hum });
  parts.push(loopNoise(a, 'brown', 'lowpass', kind === 'tunnel' ? 120 : 300, kind === 'tunnel' ? 0.25 : 0.08, bus));
  bus.gain.linearRampToValueAtTime(0.8, a.currentTime + 2);
  const timers = [];
  const drip = () => {
    const t = a.currentTime, o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(1400 + Math.random() * 900, t); o.frequency.exponentialRampToValueAtTime(400, t + 0.08);
    g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.25);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.3);
    timers.push(setTimeout(drip, 700 + Math.random() * 2600));
  };
  if (kind === 'tunnel') timers.push(setTimeout(drip, 800));
  return { stop() { bus.gain.linearRampToValueAtTime(0, a.currentTime + 1); timers.forEach(clearTimeout); setTimeout(() => parts.forEach((x) => x.src.stop()), 1200); } };
}
const AMBIENCE = { metro_plaza: startCity, aster_hall: () => startBed('building'), tunnel_1: () => startBed('tunnel'), platform: () => startBed('tunnel') };

export function setArea(id) {
  if (amb && amb.id !== id) { amb.handle?.stop(); amb = null; }
  if (AMBIENCE[id] && !amb) amb = { id, handle: AMBIENCE[id]() };
  const src = MUSIC[id];
  if (src === trackSrc) return;
  if (track) { const old = track; fade(old, 0, 1200, () => old.pause()); }
  track = null; trackSrc = src ?? null;
  if (!src) return;
  const el = new Audio(src);
  el.loop = true; el.volume = 0;
  el.play().then(() => fade(el, MUSIC_VOL, 1500)).catch(() => {
    // Autoplay blocked until the player interacts: start on the next click/key.
    const resume = () => { el.play().then(() => fade(el, MUSIC_VOL, 1500)).catch(() => {}); };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
  });
  track = el;
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
