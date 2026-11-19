// WebAudio: per-character "babble" voices for dialogue and combat sfx; CC0 area music via <audio> (see CREDITS.md).
// No audio files needed. Real recorded/TTS voices can replace babble for act-ending cutscenes later.

import { startSong, stopSong, currentSong, SONGS } from './music.js';
import { performanceMix } from './performanceMix.js';

let ctx = null, master = null, background = null, drone = null;
const MUTED = typeof location !== 'undefined' && new URLSearchParams(location.search).has('mute');
let mix = { nearby: false, boss: false, background: 1 }, voiceDucked = false;
const mediaVolumes = new Map();

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.25;
    // ?mute in the URL: everything still runs, nothing reaches the speakers (for testing next to people).
    const out = ctx.createGain(); out.gain.value = MUTED ? 0 : 1; master.connect(out); out.connect(ctx.destination);
    background = ctx.createGain(); background.gain.value = mix.background; background.connect(master);
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
  // 'synth:<name>' plays a song from music.js (composed in-repo, no file); anything else is a file path.
  room631: 'synth:apartment', aster_hall: null, aster_lobby: null,
  title: 'synth:title', lobby: 'synth:lobby',
  lake: 'synth:lake',  // barely music: held chords in G and single notes like rain on flat water
  metro_plaza: null,   // the plaza gets a synthesized city soundscape instead of music
  tunnel_1: 'assets/audio/tunnel_claimed_by_the_void.ogg', platform: 'assets/audio/tunnel_claimed_by_the_void.ogg',
};
const MUSIC_VOL = 0.35;
let track = null, trackSrc = null;

function fade(el, to, ms, done) {
  const from = mediaVolumes.get(el) ?? el.volume, t0 = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    mediaVolumes.set(el, from + (to - from) * k);
    el.volume = mediaVolumes.get(el) * mix.background * (voiceDucked ? 0.2 : 1);
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
  const bus = a.createGain(); bus.gain.value = 0; bus.connect(background);
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
  const bus = a.createGain(); bus.gain.value = 0; bus.connect(background);
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
  setInstrumentFocus(null, null); // do not carry a previous map's performers into another scene
  if (amb && amb.id !== id) { amb.handle?.stop(); amb = null; }
  if (AMBIENCE[id] && !amb) amb = { id, handle: AMBIENCE[id]() };
  const src = MUSIC[id];
  if (src === trackSrc) return;
  if (track) { const old = track; fade(old, 0, 1200, () => { old.pause(); mediaVolumes.delete(old); }); }
  track = null; trackSrc = src ?? null;
  if (!src?.startsWith('synth:')) stopSong();
  if (!src) return;
  if (src.startsWith('synth:')) {
    const name = src.slice(6);
    const begin = () => { const a = ac(); if (a && currentSong() !== name && trackSrc === src) startSong(a, background, name, 1.4); };
    begin();
    // Browsers hold audio until the first click or key; start then if we couldn't start now.
    if (!ctx || ctx.state !== 'running') { window.addEventListener('pointerdown', begin, { once: true }); window.addEventListener('keydown', begin, { once: true }); }
    return;
  }
  const el = new Audio(src); el.muted = MUTED;
  el.loop = true; el.volume = 0;
  mediaVolumes.set(el, 0);
  el.play().then(() => fade(el, MUSIC_VOL, 1500)).catch(() => {
    // Autoplay blocked until the player interacts: start on the next click/key.
    const resume = () => { el.play().then(() => fade(el, MUSIC_VOL, 1500)).catch(() => {}); };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
  });
  track = el;
}

/** Duck the game's music and ambience under a voice recording (voice cameos), and bring it back. */
export function setMusicDuck(on) {
  voiceDucked = !!on;
  const a = ac();
  if (a && master) master.gain.setTargetAtTime(on ? 0.06 : 0.25, a.currentTime, 0.25);
  applyMediaMix();
}

function applyMediaMix() {
  for (const [el, volume] of mediaVolumes) el.volume = volume * mix.background * (voiceDucked ? 0.2 : 1);
}

/** Nearby performances take over the score/ambience, while a live boss keeps its score audible.
 * Instruments and combat/voice cues stay on the master bus and are never muted here.
 * Performances already gives every overlapping performer within 80 px the same 1.6 gain.
 */
export function setInstrumentFocus(snap, localId) {
  const next = performanceMix(snap, localId);
  if (next.background === mix.background) { mix = next; return; }
  mix = next;
  if (ctx && background) background.gain.setTargetAtTime(mix.background, ctx.currentTime, 0.04);
  applyMediaMix();
}

/** The shared AudioContext and master bus, for other modules that make sound (instruments). */
export function audioOut() { const a = ac(); return a ? { ctx: a, dest: master } : null; }

export function sfx(kind) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
  const spec = { hit: [320, 120, 'square', 0.08], hurt: [140, 60, 'sawtooth', 0.15], shot: [700, 300, 'triangle', 0.05], kill: [500, 900, 'square', 0.12], swing: [260, 180, 'triangle', 0.05] }[kind];
  if (!spec) return;
  o.type = spec[2]; o.frequency.setValueAtTime(spec[0], t); o.frequency.exponentialRampToValueAtTime(spec[1], t + spec[3]);
  g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + spec[3]);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + spec[3] + 0.02);
}

/** A phone ringing (US two-tone ring cadence), `times` rings. */
export function ring(times = 2) {
  const c = ac(); if (!c) return;
  for (let r = 0; r < times; r++) {
    const t0 = c.currentTime + r * 3;
    for (const f of [440, 480]) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.07, t0 + 0.02); g.gain.setValueAtTime(0.07, t0 + 1.9); g.gain.linearRampToValueAtTime(0, t0 + 2);
      o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 2.05);
    }
  }
}

// Spoken voices for act-ending cutscenes (brief: "a post fight cutscene with voices"), using the
// browser's built-in speech synthesis. Each character gets a stable voice, pitch and pace.
const VOICE_STYLE = {
  pork: { pitch: 0.55, rate: 0.82, pref: /male|daniel|fred|alex|david|en-gb/i },
  'john pork': { pitch: 0.55, rate: 0.82, pref: /male|daniel|fred|alex|david|en-gb/i },
  trevor: { pitch: 0.95, rate: 1.0, pref: /male|tom|aaron|en-us/i },
  michael: { pitch: 1.1, rate: 1.05, pref: /male|en-us/i },
  manuel: { pitch: 1.0, rate: 1.02, pref: /es|spanish|diego|jorge|male/i },
  sahur: { pitch: 0.3, rate: 0.7, pref: /male/i },
};
export function canSpeak() { return typeof window !== 'undefined' && 'speechSynthesis' in window; }
export function speak(who, text) {
  if (!canSpeak() || !text) return false;
  const synth = window.speechSynthesis; synth.cancel();
  const st = VOICE_STYLE[(who || '').toLowerCase()] ?? { pitch: 1, rate: 1, pref: /en/i };
  const u = new SpeechSynthesisUtterance(text.replace(/\*[^*]+\*/g, ''));
  const voices = synth.getVoices();
  u.voice = voices.find((v) => st.pref.test(`${v.name} ${v.lang}`) && /en|es/i.test(v.lang)) ?? voices.find((v) => /en/i.test(v.lang)) ?? null;
  u.pitch = st.pitch; u.rate = st.rate; u.volume = 0.9;
  synth.speak(u);
  return true;
}
export function hush() { if (canSpeak()) window.speechSynthesis.cancel(); }
