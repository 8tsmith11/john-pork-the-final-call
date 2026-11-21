// Cinematic scores: one-shot, timed music for painted cutscenes (src/game/render/cinePaint.js). Like music.js it
// is all synthesis (no audio files, no licences): drums, brass, strings, a choir and noise, scheduled on a
// timeline in seconds so it lines up with the shots. Routed straight to the speakers under the Music setting.
import * as Settings from '../settings.js';

const m2f = (m) => 440 * 2 ** ((m - 69) / 12);

function kit(ctx, out) {
  const noiseBuf = (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const env = (g, t, a, peak, hold, rel) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.setValueAtTime(peak, t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel); };
  return {
    // a big low drum: a falling sine with a thump of noise
    drum(t, f0 = 70, gain = 0.9, decay = 0.9) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(f0 * 2.2, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.55, t + decay * 0.7);
      env(g, t, 0.004, gain, 0.02, decay); o.connect(g); g.connect(out); o.start(t); o.stop(t + decay + 0.1);
      const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), ng = ctx.createGain();
      n.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = 180; f.Q.value = 0.9;
      env(ng, t, 0.002, gain * 0.5, 0.01, 0.18); n.connect(f); f.connect(ng); ng.connect(out); n.start(t); n.stop(t + 0.3);
    },
    tom(t, f0 = 120, gain = 0.4) { this.drum(t, f0, gain, 0.35); },
    snare(t, gain = 0.25) {
      const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 1400; env(g, t, 0.002, gain, 0.01, 0.14);
      n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + 0.2);
    },
    // brass: two detuned saws through a filter that opens as the note swells
    brass(t, midi, dur, gain = 0.12) {
      const f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(2200, t + Math.min(0.6, dur * 0.5)); f.Q.value = 2;
      env(g, t, 0.12, gain, Math.max(0, dur - 0.3), 0.5); f.connect(g); g.connect(out);
      for (const det of [-7, 7]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = m2f(midi); o.detune.value = det; o.connect(f); o.start(t); o.stop(t + dur + 0.6); }
    },
    // strings: three detuned saws, slow attack, soft top
    strings(t, midi, dur, gain = 0.05) {
      const f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'lowpass'; f.frequency.value = 1700; env(g, t, Math.min(1.2, dur * 0.4), gain, Math.max(0, dur - 1), 1.2); f.connect(g); g.connect(out);
      for (const det of [-11, 0, 11]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = m2f(midi); o.detune.value = det; o.connect(f); o.start(t); o.stop(t + dur + 1.3); }
    },
    // a choir 'ah': sine and triangle with a slow vibrato
    choir(t, midi, dur, gain = 0.05) {
      const g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5; lg.gain.value = 6; lfo.connect(lg);
      env(g, t, Math.min(1.5, dur * 0.5), gain, Math.max(0, dur - 1.5), 1.5); g.connect(out);
      for (const w of ['sine', 'triangle']) { const o = ctx.createOscillator(); o.type = w; o.frequency.value = m2f(midi); lg.connect(o.detune); o.connect(g); o.start(t); o.stop(t + dur + 1.6); }
      lfo.start(t); lfo.stop(t + dur + 1.6);
    },
    // a rising rush of noise into a hit
    riser(t, dur, gain = 0.18) {
      const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noiseBuf; n.loop = true; f.type = 'bandpass'; f.Q.value = 1.4;
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(6000, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + dur);
      g.gain.setValueAtTime(0.0001, t + dur + 0.02);
      n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + dur + 0.05);
    },
    crash(t, gain = 0.4) {
      const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 3000; env(g, t, 0.003, gain, 0.05, 2.2);
      n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + 2.4);
    },
  };
}

// Scores: (k, T) => schedules notes, T = start time. Times below are seconds from the start.
const SCORES = {
  // A long build into one hit (timings: the sealed shot list).
  descent(k, T) {
    const D = 38, A = 45, F = 41, C = 48, Bb = 46;   // D minor
    k.strings(T + 0, D, 13, 0.05); k.strings(T + 0, D + 12, 13, 0.035);
    k.choir(T + 2, 81, 6, 0.03); k.choir(T + 6, 86, 7, 0.03); k.choir(T + 9, 84, 4, 0.025);
    k.strings(T + 9, A + 12, 4, 0.04);
    for (const s of [13.0, 13.9, 14.8]) k.drum(T + s, 55, 1.0, 1.4);
    k.brass(T + 14.8, D, 1.6, 0.08);
    const chords = [[D, A], [Bb, F], [F, C], [C, 52]];
    for (let i = 0; i < 9 / 0.25; i++) {
      const t = T + 16 + i * 0.25;
      if (i % 4 === 0) k.drum(t, 60, 0.7, 0.6); else if (i % 2 === 0) k.tom(t, 110, 0.3); else k.tom(t, 150, 0.18);
      if (i % 8 === 6) k.snare(t, 0.2);
    }
    chords.forEach(([a, b], i) => { const t = T + 16 + i * 2.25; k.brass(t, a, 2.1, 0.11); k.brass(t, b, 2.1, 0.08); k.brass(t, a - 12, 2.1, 0.07); });
    [62, 64, 65, 67, 69, 72].forEach((m, i) => k.strings(T + 16.5 + i * 1.4, m, 1.6, 0.045));
    k.choir(T + 20, 74, 5, 0.05); k.choir(T + 20, 77, 5, 0.04);
    for (let i = 0; i < 7 / 0.125; i++) { const t = T + 25 + i * 0.125; if (i % 4 === 0) k.drum(t, 60, 0.75, 0.5); else k.tom(t, 130 + (i % 3) * 20, 0.16 + i * 0.002); if (i > 40) k.snare(t, 0.12 + (i - 40) * 0.01); }
    [[D, A], [Bb, F], [C, 55], [A, 52]].forEach(([a, b], i) => { const t = T + 25 + i * 1.75; k.brass(t, a + 12, 1.7, 0.1); k.brass(t, b + 12, 1.7, 0.08); k.brass(t, a, 1.7, 0.09); });
    k.strings(T + 25, 74, 7, 0.05); k.strings(T + 25, 81, 7, 0.04); k.choir(T + 25, 86, 7, 0.06);
    k.riser(T + 28, 4, 0.2);
    k.drum(T + 32, 40, 1.2, 2.4); k.drum(T + 32.02, 70, 0.9, 1.2); k.crash(T + 32, 0.5); k.brass(T + 32, D - 12, 1.2, 0.12);
  },
};

/** Play a score now. Returns { stop } (a fade-out). Silent if there's no audio or the Music setting is off. */
export function playScore(ctx, name) {
  const s = SCORES[name];
  if (!ctx || !s) return { stop() {} };
  const out = ctx.createGain(), comp = ctx.createDynamicsCompressor();
  out.gain.value = 0.9 * (Settings.get?.('music') ?? 1);
  out.connect(comp); comp.connect(ctx.destination);
  s(kit(ctx, out), ctx.currentTime + 0.05);
  return { stop() { const t = ctx.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + 0.8); setTimeout(() => { try { comp.disconnect(); } catch {} }, 1200); } };
}
export const SCORE_NAMES = Object.keys(SCORES);
