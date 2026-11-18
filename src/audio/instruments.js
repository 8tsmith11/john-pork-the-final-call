// Playable instruments (Michael's request, D-014). Everything is synthesized here with WebAudio, so
// there are no audio files. Two rules shape it:
//   1. WHO plays decides how it sounds: Trevor is amazing, Michael is mediocre, Manuel is always out
//      of tune. This applies to instruments only. Record players and the soundtrack are unaffected.
//   2. The game's music is 8-bit, except Trevor: he plays real-sounding rock (plucked-string
//      synthesis through an amp, double-tracked, with a drum kit).
// startInstrument() returns { stop, setVolume } and loops until stopped.

const m2f = (m) => 440 * 2 ** ((m - 69) / 12);

/** How each roommate plays. New instruments should read this, not hard-code names. */
export const PLAYER_SKILL = { trevor: 'amazing', michael: 'mediocre', manuel: 'out_of_tune' };
export const skillOf = (who) => PLAYER_SKILL[who] ?? 'mediocre';
/** Each roommate's song. Michael's lullaby puts listeners to sleep (see sim.js _stepLullaby). */
export const SONG_OF = { trevor: 'rock', michael: 'lullaby', manuel: 'mate' };
export const songOf = (who) => SONG_OF[who] ?? 'lullaby';

// ---------------------------------------------------------------------------------------------
// Karplus-Strong plucked string, rendered into a buffer and cached. `damp` near 1 rings longer;
// palm mutes use a lower damp and a short buffer.
const ksCache = new Map();
function pluck(ctx, midi, dur, { bright = 0.6, damp = 0.996, cents = 0 } = {}) {
  const key = `${midi}:${dur}:${bright}:${damp}:${Math.round(cents)}`;
  if (ksCache.has(key)) return ksCache.get(key);
  const sr = ctx.sampleRate, len = Math.max(1, Math.floor(sr * dur));
  const buf = ctx.createBuffer(1, len, sr), out = buf.getChannelData(0);
  const f = m2f(midi) * 2 ** (cents / 1200);
  const N = Math.max(2, Math.round(sr / f));
  const line = new Float32Array(N);
  let lp = 0;
  for (let i = 0; i < N; i++) { const w = Math.random() * 2 - 1; lp = lp + bright * (w - lp); line[i] = lp; }   // darker noise = softer pick
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const a = line[idx], b = line[(idx + 1) % N];
    const y = damp * 0.5 * (a + b);
    out[i] = a; line[idx] = y; idx = (idx + 1) % N;
  }
  const fadeN = Math.min(len, Math.floor(sr * 0.02));          // no click at the end
  for (let i = 0; i < fadeN; i++) out[len - 1 - i] *= i / fadeN;
  if (ksCache.size > 400) ksCache.delete(ksCache.keys().next().value);
  ksCache.set(key, buf);
  return buf;
}
function playBuf(ctx, buf, t, dest, gain = 1, rate = 1) {
  const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate;
  const g = ctx.createGain(); g.gain.value = gain;
  s.connect(g); g.connect(dest); s.start(t);
  return s;
}

// A small synthetic room for the acoustic and the amp.
function reverb(ctx, seconds = 1.4, decay = 2.6) {
  const sr = ctx.sampleRate, len = Math.floor(sr * seconds), ir = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay; }
  const conv = ctx.createConvolver(); conv.buffer = ir; return conv;
}
function driveCurve(k = 28) {
  const n = 2048, c = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
  return c;
}

// ---------------------------------------------------------------------------------------------
// 8-bit voices (Michael, Manuel): a 25% pulse with a plucked envelope, and a triangle bass.
let pulseWave = null;
function pulse25(ctx) {
  if (pulseWave) return pulseWave;
  const n = 32, re = new Float32Array(n), im = new Float32Array(n), duty = 0.25;
  for (let k = 1; k < n; k++) { re[k] = Math.sin(2 * Math.PI * k * duty) / (k * Math.PI); im[k] = (1 - Math.cos(2 * Math.PI * k * duty)) / (k * Math.PI); }
  pulseWave = ctx.createPeriodicWave(re, im);
  return pulseWave;
}
function chip(ctx, dest, t, midi, dur, { wave = 'pulse', gain = 0.16, cents = 0, wobble = 0 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  if (wave === 'pulse') o.setPeriodicWave(pulse25(ctx)); else o.type = wave;
  o.frequency.value = m2f(midi);
  o.detune.setValueAtTime(cents, t);
  if (wobble) { o.detune.linearRampToValueAtTime(cents + wobble, t + dur * 0.5); o.detune.linearRampToValueAtTime(cents - wobble * 0.5, t + dur); }
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.006);
  g.gain.exponentialRampToValueAtTime(gain * 0.35, t + 0.09);                 // the "pluck"
  g.gain.setValueAtTime(gain * 0.35, t + Math.max(0.1, dur * 0.8));
  g.gain.exponentialRampToValueAtTime(0.0005, t + dur + 0.12);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.15);
}
function chipNoise(ctx, dest, t, len = 0.03, gain = 0.05, freq = 3000) {
  const n = ctx.createBufferSource(), sr = ctx.sampleRate, b = ctx.createBuffer(1, Math.floor(sr * len), sr), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  n.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
  const g = ctx.createGain(); g.gain.value = gain; n.connect(f); f.connect(g); g.connect(dest); n.start(t);
}

// ---------------------------------------------------------------------------------------------
// Drum kit for Trevor's rock (synthesized, not 8-bit: noise bodies and pitch sweeps).
let noiseBuf = null;
function noise(ctx) {
  if (noiseBuf) return noiseBuf;
  const sr = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, sr, sr);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < sr; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}
function kick(ctx, dest, t, v = 1) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  g.gain.setValueAtTime(0.9 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.35);
  const c = ctx.createBufferSource(); c.buffer = noise(ctx); const cf = ctx.createBiquadFilter(); cf.type = 'highpass'; cf.frequency.value = 2500;
  const cg = ctx.createGain(); cg.gain.setValueAtTime(0.25 * v, t); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
  c.connect(cf); cf.connect(cg); cg.connect(dest); c.start(t, Math.random() * 0.5, 0.02);
}
function snare(ctx, dest, t, v = 1) {
  const n = ctx.createBufferSource(); n.buffer = noise(ctx);
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.7;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.55 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  n.connect(f); f.connect(g); g.connect(dest); n.start(t, Math.random() * 0.5, 0.22);
  const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'triangle';
  o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
  og.gain.setValueAtTime(0.4 * v, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(og); og.connect(dest); o.start(t); o.stop(t + 0.12);
}
function hat(ctx, dest, t, v = 1, open = false) {
  const n = ctx.createBufferSource(); n.buffer = noise(ctx);
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.16 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.28 : 0.045));
  n.connect(f); f.connect(g); g.connect(dest); n.start(t, Math.random() * 0.5, open ? 0.3 : 0.05);
}
function crash(ctx, dest, t, v = 1) {
  const n = ctx.createBufferSource(); n.buffer = noise(ctx);
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 4500;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.28 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
  n.connect(f); f.connect(g); g.connect(dest); n.start(t, 0, 1);
}

// ---------------------------------------------------------------------------------------------
// SONGS. Each returns { stepSec, steps, play(stepIndex, t) } and is driven by a look-ahead clock.

// TREVOR, "Room 631 Riot": E minor at 150 bpm. Two passes of a palm-muted riff, then a big open
// chorus with a lead line, crash on every section. Electric: amp + double-tracking + drums.
// Acoustic: the same changes, strummed open chords with a body-slap on the backbeat.
function rockSong(ctx, bus, electric) {
  const bpm = 150, stepSec = 60 / bpm / 4;
  // [step, rootMidi, lengthInSteps, muted]
  const R1 = [[0, 40, 1, 1], [2, 40, 1, 1], [4, 40, 1, 1], [6, 43, 2, 0], [8, 45, 4, 0], [12, 40, 1, 1], [14, 40, 1, 1]];
  const R2 = [[0, 40, 1, 1], [2, 40, 1, 1], [4, 40, 1, 1], [6, 46, 2, 0], [8, 45, 3, 0], [11, 43, 2, 0], [13, 40, 3, 0]];
  const R4 = [[0, 48, 4, 0], [4, 50, 4, 0], [8, 52, 8, 0]];
  const C = (root) => [[0, root, 6, 0], [6, root, 2, 0], [8, root, 6, 0], [14, root, 2, 1]];
  const C4 = [[0, 47, 8, 0], [8, 50, 4, 0], [12, 46, 4, 0]];
  const bars = [R1, R2, R1, R4, R1, R2, R1, R4, C(48), C(50), C(40), C4];
  const lead = { 8: [[0, 76, 4], [4, 79, 2], [6, 81, 6], [12, 79, 4]], 9: [[0, 78, 4], [4, 81, 2], [6, 83, 6], [12, 81, 2], [14, 79, 2]],
    10: [[0, 79, 3], [3, 78, 3], [6, 76, 10]], 11: [[0, 74, 4], [4, 78, 4], [8, 81, 4], [12, 82, 4]] };
  const chordShape = (root) => (electric ? [root, root + 7, root + 12] : open(root));
  function open(root) {   // acoustic voicings: a few real open-chord shapes, otherwise a full barre
    const shapes = { 40: [40, 47, 52, 55, 59, 64], 43: [43, 47, 50, 55, 59, 67], 45: [45, 52, 57, 60, 64], 46: [46, 53, 58, 62, 65], 47: [47, 54, 59, 62, 66], 48: [48, 52, 55, 60, 64], 50: [50, 57, 62, 66], 52: [40, 47, 52, 55, 59, 64] };
    return shapes[root] ?? [root, root + 7, root + 12, root + 16];
  }
  return {
    stepSec, steps: bars.length * 16,
    play(i, t) {
      const b = Math.floor(i / 16), s = i % 16, bar = bars[b];
      for (const [st, root, len, mute] of bar) {
        if (st !== s) continue;
        const dur = mute ? 0.16 : len * stepSec + 0.25;
        const notes = chordShape(root);
        if (electric) {
          for (const [side, lag, cents] of [[-0.75, 0, -4], [0.75, 0.009, 5]]) {   // two takes, hard-panned
            for (const [k, n] of notes.entries()) {
              const buf = pluck(ctx, n, dur, { bright: mute ? 0.9 : 0.75, damp: mute ? 0.955 : 0.9975, cents: cents + (k === 1 ? -2 : 0) });
              playBuf(ctx, buf, t + lag + k * 0.004, side < 0 ? bus.left : bus.right, mute ? 0.6 : 0.5);
            }
          }
          // bass doubles the root an octave down
          playBuf(ctx, pluck(ctx, root - 12, dur + 0.05, { bright: 0.35, damp: mute ? 0.97 : 0.998 }), t, bus.bass, 0.9);
        } else {
          // strum: down on even steps, up on odd, a few ms between strings
          const up = s % 4 === 2, order = up ? [...notes].reverse() : notes;
          for (const [k, n] of order.entries()) playBuf(ctx, pluck(ctx, n, mute ? 0.25 : dur + 0.4, { bright: 0.55, damp: mute ? 0.96 : 0.9985 }), t + k * 0.011, bus.clean, (up ? 0.22 : 0.3));
        }
      }
      // strummed acoustic fills: keep eighths going under long chords
      if (!electric && s % 2 === 0 && !bar.some(([st]) => st === s)) {
        const cur = [...bar].reverse().find(([st]) => st < s);
        if (cur) { const notes = chordShape(cur[1]); const up = s % 4 === 2; for (const [k, n] of (up ? [...notes].reverse() : notes).entries()) playBuf(ctx, pluck(ctx, n, 0.35, { bright: 0.45, damp: 0.997 }), t + k * 0.01, bus.clean, 0.14); }
      }
      // lead on the chorus (electric) / melody picked on top (acoustic)
      for (const [st, n, len] of lead[b] ?? []) if (st === s) playBuf(ctx, pluck(ctx, electric ? n : n - 12, len * stepSec + 0.4, { bright: 0.85, damp: 0.9985 }), t, electric ? bus.lead : bus.clean, electric ? 0.55 : 0.35);
      // drums
      const chorus = b >= 8;
      if (electric) {
        if (s === 0 && (b === 0 || b === 8)) crash(ctx, bus.drums, t);
        if (s === 0 || s === 8 || (s === 10 && !chorus) || (chorus && s === 6)) kick(ctx, bus.drums, t, s === 0 ? 1 : 0.85);
        if (s === 4 || s === 12) snare(ctx, bus.drums, t);
        if (s % 2 === 0) hat(ctx, bus.drums, t, s % 4 === 0 ? 0.9 : 0.6, chorus && s === 14);
        if (b === 7 && s >= 12) snare(ctx, bus.drums, t, 0.5 + (s - 12) * 0.15);              // fill into the chorus
      } else if (s === 4 || s === 12) {
        playBuf(ctx, pluck(ctx, 33, 0.12, { bright: 0.2, damp: 0.9 }), t, bus.clean, 0.6);  // body slap
      }
    },
  };
}

// MICHAEL, "Hush, 631": a lullaby in C, 3/4 at 84 bpm, 8-bit. Played mediocre: a bit late or
// early, the odd wrong fret, a buzz now and then, a dropped note.
function lullabySong(ctx, bus, electric, sloppy) {
  const bpm = 84, stepSec = 60 / bpm / 2;              // eighth notes, 6 per bar
  const mel = [[72, 2], [76, 2], [79, 2], [76, 3], [74, 1], [72, 2], [72, 6],
               [69, 2], [72, 2], [77, 2], [76, 3], [74, 1], [67, 2], [67, 6],
               [72, 2], [76, 2], [79, 2], [81, 2], [79, 2], [76, 2], [77, 2], [74, 2], [71, 2], [72, 6]];
  const roots = [48, 48, 41, 43, 48, 45, 41, 48];       // one per bar (C C F G C Am F C)
  const third = { 48: 52, 41: 45, 43: 47, 45: 48 }, fifth = { 48: 55, 41: 48, 43: 50, 45: 52 };
  const events = []; let at = 0;
  for (const [n, len] of mel) { events.push([at, n, len]); at += len; }
  const steps = roots.length * 6;
  return {
    stepSec, steps,
    play(i, t) {
      const jit = () => (sloppy ? (Math.random() * 2 - 1) * 0.035 : 0);
      const wrong = (n) => (sloppy && Math.random() < 0.08 ? n + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.7 ? 1 : 2) : n);
      for (const [st, n, len] of events) {
        if (st !== i || (sloppy && Math.random() < 0.05)) continue;    // sometimes he just misses it
        chip(ctx, bus.lead, t + jit(), wrong(n), len * stepSec * 0.95, { wave: electric ? 'square' : 'pulse', gain: electric ? 0.09 : 0.13 });
        if (sloppy && Math.random() < 0.1) chipNoise(ctx, bus.lead, t + 0.01, 0.04, 0.04, 2500);   // fret buzz
      }
      const bar = Math.floor(i / 6), s = i % 6, r = roots[bar];
      if (s === 0) chip(ctx, bus.bass, t + jit(), r, stepSec * 2, { wave: 'triangle', gain: 0.22 });
      if (s === 2 || s === 4) { chip(ctx, bus.bass, t + jit(), wrong(third[r]), stepSec * 1.6, { wave: 'pulse', gain: 0.05 }); chip(ctx, bus.bass, t + jit() + 0.012, fifth[r], stepSec * 1.6, { wave: 'pulse', gain: 0.045 }); }
    },
  };
}

// MANUEL, "Mate at Dawn" (his own tune), 8-bit, and always out of tune: every string is tuned
// wrong (fixed for the whole performance, so the chords beat against each other), the pitch drifts,
// and a fifth of his notes land a semitone off.
function mateSong(ctx, bus, electric) {
  const bpm = 100, stepSec = 60 / bpm / 2;
  const strings = Array.from({ length: 6 }, () => (Math.random() < 0.5 ? -1 : 1) * (35 + Math.random() * 60));
  const stringFor = (n) => Math.max(0, Math.min(5, Math.floor((n - 40) / 5)));
  const mel = [[69, 1], [72, 1], [74, 2], [72, 1], [69, 1], [67, 2], [69, 4], [64, 1], [67, 1], [69, 2], [72, 1], [74, 1], [76, 2], [74, 4],
               [76, 1], [74, 1], [72, 2], [69, 2], [67, 1], [64, 1], [62, 2], [64, 4], [0, 4]];
  const chords = [[45, 52, 57, 60], [43, 50, 55, 59], [41, 48, 53, 57], [40, 47, 52, 56]];   // Am G F E
  const events = []; let at = 0;
  for (const [n, len] of mel) { if (n) events.push([at, n, len]); at += len; }
  const steps = 32;
  return {
    stepSec, steps,
    play(i, t) {
      const off = (n) => strings[stringFor(n)] + (Math.random() < 0.2 ? (Math.random() < 0.5 ? -100 : 100) : 0) + (Math.random() * 2 - 1) * 12;
      for (const [st, n, len] of events) if (st === i) chip(ctx, bus.lead, t + (Math.random() * 2 - 1) * 0.04, n, len * stepSec, { wave: electric ? 'square' : 'pulse', gain: 0.12, cents: off(n), wobble: 30 });
      if (i % 4 === 0) {
        const ch = chords[Math.floor(i / 8) % 4];
        for (const [k, n] of ch.entries()) chip(ctx, bus.bass, t + k * 0.018, n, stepSec * 3.5, { wave: k ? 'pulse' : 'triangle', gain: k ? 0.04 : 0.18, cents: off(n), wobble: 20 });
      }
    },
  };
}

// ---------------------------------------------------------------------------------------------
/**
 * Start a performance. who: 'trevor'|'michael'|'manuel'; instrument: 'electric'|'acoustic'.
 * Returns { stop(), setVolume(v), song } or null without WebAudio.
 */
export function startInstrument(ctx, dest, { who, instrument = 'acoustic', volume = 1, prerender = 0 }) {
  if (!ctx) return null;
  const electric = instrument === 'electric', skill = skillOf(who), song = songOf(who);
  // Every performance ends in a limiter so a hot mix never clips the game's master bus.
  const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -8; lim.knee.value = 4; lim.ratio.value = 12; lim.attack.value = 0.003; lim.release.value = 0.15;
  const out = ctx.createGain(); out.gain.value = 0; out.connect(lim); lim.connect(dest);
  out.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.15);
  const node = (g = 1) => { const x = ctx.createGain(); x.gain.value = g; return x; };
  const bus = {};
  let seq;
  if (song === 'rock' && skill === 'amazing') {
    if (electric) {
      // Amp model per take: drive → cabinet EQ → level → pan, then a shared room. Each side has its
      // own chain so the panning survives the distortion.
      const curve = driveCurve(18);
      const side = (pan) => {
        const i = node(1), g = node(3.2), s = ctx.createWaveShaper(); s.curve = curve; s.oversample = '4x';
        const h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = 90;
        const m = ctx.createBiquadFilter(); m.type = 'peaking'; m.frequency.value = 850; m.gain.value = 3;
        const c = ctx.createBiquadFilter(); c.type = 'lowpass'; c.frequency.value = 4300; c.Q.value = 0.8;
        const c2 = ctx.createBiquadFilter(); c2.type = 'peaking'; c2.frequency.value = 2400; c2.gain.value = -4;
        const lvl = node(0.1), p = ctx.createStereoPanner(); p.pan.value = pan;
        i.connect(g); g.connect(s); s.connect(h); h.connect(m); m.connect(c); c.connect(c2); c2.connect(lvl); lvl.connect(p); p.connect(out);
        return { i, lvl };
      };
      const L = side(-0.8), Rr = side(0.8);
      bus.left = L.i; bus.right = Rr.i;
      const ld = side(0); ld.lvl.gain.value = 0.085; bus.lead = ld.i;
      const rv = reverb(ctx, 1.6, 3), rvg = node(0.18); L.lvl.connect(rv); Rr.lvl.connect(rv); ld.lvl.connect(rv); rv.connect(rvg); rvg.connect(out);
      const bassLp = ctx.createBiquadFilter(); bassLp.type = 'lowpass'; bassLp.frequency.value = 700;
      const bassDrive = ctx.createWaveShaper(); bassDrive.curve = driveCurve(3);
      bus.bass = node(0.32); bus.bass.connect(bassDrive); bassDrive.connect(bassLp); bassLp.connect(out);
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      bus.drums = node(0.32); bus.drums.connect(comp); comp.connect(out);
    } else {
      const body = ctx.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 220; body.gain.value = 4;
      const air = ctx.createBiquadFilter(); air.type = 'highshelf'; air.frequency.value = 5000; air.gain.value = 3;
      bus.clean = node(0.55); bus.clean.connect(body); body.connect(air); air.connect(out);
      const rv = reverb(ctx, 1.8, 2.4), rvg = node(0.25); air.connect(rv); rv.connect(rvg); rvg.connect(out);
    }
    seq = rockSong(ctx, bus, electric);
  } else {
    // 8-bit performers get a plain chip mix with a short slap echo.
    bus.lead = node(1); bus.bass = node(1);
    const d = ctx.createDelay(0.5); d.delayTime.value = 0.18; const fb = node(0.2);
    bus.lead.connect(out); bus.bass.connect(out); bus.lead.connect(d); d.connect(fb); fb.connect(d); d.connect(out);
    // Anyone other than Trevor playing rock plays their own song instead (each has one).
    if (song === 'lullaby') seq = lullabySong(ctx, bus, electric, skill !== 'amazing');
    else if (song === 'mate' || skill === 'out_of_tune') seq = mateSong(ctx, bus, electric);
    else seq = lullabySong(ctx, bus, electric, true);
  }

  // Look-ahead scheduler: schedule steps up to 0.3 s ahead, loop forever.
  let next = ctx.currentTime + 0.08, i = 0, stopped = false;
  // Tests and offline renders: schedule `prerender` seconds up front (OfflineAudioContext's clock
  // doesn't move until it renders).
  while (prerender && next < ctx.currentTime + prerender) { seq.play(i, next); next += seq.stepSec; i = (i + 1) % seq.steps; }
  const timer = setInterval(() => {
    if (stopped) return;
    while (next < ctx.currentTime + 0.3) { seq.play(i, next); next += seq.stepSec; i = (i + 1) % seq.steps; }
  }, 50);
  return {
    song, skill,
    setVolume(v) { out.gain.setTargetAtTime(Math.max(0, v), ctx.currentTime, 0.1); },
    stop() {
      if (stopped) return; stopped = true; clearInterval(timer);
      out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(out.gain.value, ctx.currentTime);
      out.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setTimeout(() => { try { out.disconnect(); lim.disconnect(); } catch {} }, 2500);
    },
  };
}
