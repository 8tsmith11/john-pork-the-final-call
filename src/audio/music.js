// Synthesized music: a tiny step sequencer over WebAudio. No audio files and no licences: every
// song is the note data in this file, so it can be read, edited and reviewed like any other content.
//
// A song is { bpm, bars, tracks }. Each track has a timbre and a list of notes [bar, step, midi, length],
// with 16 steps to a bar. Songs loop. Notes are scheduled a little ahead of the audio clock.

const m2f = (m) => 440 * 2 ** ((m - 69) / 12);

// Chord helpers: MIDI numbers
const CH = {
  Dmaj7: [50, 57, 61, 66], Bm7: [47, 54, 57, 62], Gmaj7: [43, 50, 54, 59], A7sus: [45, 52, 55, 62],
  Am: [45, 52, 57, 60], F: [41, 48, 53, 57], C: [48, 55, 60, 64], G: [43, 50, 55, 59], Em: [40, 47, 52, 55],
};
const arp = (bar, chord, steps) => steps.map((s, i) => [bar, s, chord[(i % 3) + 1] + 12, 3]);
const bass = (bar, chord, steps = [0, 8]) => steps.map((s) => [bar, s, chord[0] - 12, 7]);
const pad = (bar, chord) => chord.slice(1).map((n) => [bar, 0, n, 16]);

// ROOM 631, late at night: warm, slow, unhurried. Electric-piano arpeggios in D over a soft bass,
// a five-note tune that comes in on the second half and never quite resolves.
const apartment = (() => {
  const prog = ['Dmaj7', 'Bm7', 'Gmaj7', 'A7sus', 'Dmaj7', 'Bm7', 'Gmaj7', 'A7sus'].map((k) => CH[k]);
  const keys = [], low = [], hold = [];
  prog.forEach((c, b) => { keys.push(...arp(b, c, [0, 3, 6, 10, 13])); low.push(...bass(b, c)); hold.push(...pad(b, c)); });
  const tune = [[4, 0, 78, 6], [4, 8, 76, 4], [4, 12, 74, 4], [5, 0, 73, 10], [6, 4, 71, 4], [6, 8, 74, 6], [7, 0, 76, 12]];
  return { bpm: 68, bars: 8, tracks: [
    { wave: 'triangle', gain: 0.10, attack: 0.01, release: 0.5, notes: keys },
    { wave: 'sine', gain: 0.16, attack: 0.03, release: 0.6, notes: low },
    { wave: 'sine', gain: 0.035, attack: 0.6, release: 1.2, notes: hold },
    { wave: 'sine', gain: 0.08, attack: 0.02, release: 0.9, notes: tune },
  ] };
})();

// THE TITLE: a phone ringing in an empty room. Two high notes, twice, the way a ringtone goes;
// under it a slow minor progression; and a line that falls a little further each time round.
const title = (() => {
  const prog = ['Am', 'F', 'C', 'G', 'Am', 'F', 'Em', 'Em'].map((k) => CH[k]);
  const hold = [], low = [], ringNotes = [];
  prog.forEach((c, b) => { hold.push(...pad(b, c)); low.push(...bass(b, c, [0])); });
  for (const b of [0, 4]) for (const s of [0, 1, 2, 3, 6, 7, 8, 9]) ringNotes.push([b, s, s % 2 ? 91 : 88, 1]);
  const fall = [[1, 0, 76, 8], [1, 8, 72, 8], [2, 0, 74, 8], [2, 8, 71, 8], [3, 0, 72, 16],
                [5, 0, 76, 8], [5, 8, 72, 8], [6, 0, 71, 8], [6, 8, 67, 8], [7, 0, 64, 16]];
  return { bpm: 60, bars: 8, tracks: [
    { wave: 'sine', gain: 0.05, attack: 0.8, release: 1.6, notes: hold },
    { wave: 'triangle', gain: 0.14, attack: 0.05, release: 1.4, notes: low },
    { wave: 'square', gain: 0.022, attack: 0.002, release: 0.08, notes: ringNotes },
    { wave: 'triangle', gain: 0.09, attack: 0.04, release: 1.0, notes: fall },
  ] };
})();

// THE LOBBY (waiting for the others to join): the title's chords, lighter and moving, so waiting
// feels like something is about to start.
const lobby = (() => {
  const prog = ['Am', 'F', 'C', 'G'].map((k) => CH[k]);
  const keys = [], low = [];
  prog.forEach((c, b) => { keys.push(...arp(b, c, [0, 2, 4, 6, 8, 10, 12, 14])); low.push(...bass(b, c, [0, 6, 8, 14])); });
  return { bpm: 84, bars: 4, tracks: [
    { wave: 'triangle', gain: 0.08, attack: 0.005, release: 0.25, notes: keys },
    { wave: 'sine', gain: 0.15, attack: 0.01, release: 0.3, notes: low },
  ] };
})();

// LAKE ARTEMESIA, at night: barely music. Long held chords in G that swell and go, a low G that never
// moves, and single high notes dropped at uneven distances like rain landing on flat water. Nothing
// repeats inside the eight bars, so the loop point is hard to hear.
const lake = (() => {
  const prog = ['Gmaj7', 'Em', 'C', 'Gmaj7', 'Gmaj7', 'Em', 'C', 'A7sus'].map((k) => CH[k]);
  const hold = [], drone = [];
  prog.forEach((c, b) => { hold.push(...pad(b, c)); if (b % 2 === 0) drone.push([b, 0, 31, 32]); });
  const drops = [[0, 6, 83, 2], [1, 1, 79, 2], [1, 11, 86, 2], [2, 9, 76, 2], [3, 4, 81, 2], [3, 14, 74, 2],
                 [4, 7, 86, 2], [5, 2, 83, 2], [5, 13, 79, 2], [6, 10, 88, 2], [7, 5, 81, 2]];
  const answer = [[2, 0, 67, 12], [3, 0, 62, 14], [6, 0, 64, 12], [7, 0, 62, 16]];
  return { bpm: 50, bars: 8, tracks: [
    { wave: 'sine', gain: 0.04, attack: 1.4, release: 2.4, notes: hold },
    { wave: 'sine', gain: 0.10, attack: 1.0, release: 2.0, notes: drone },
    { wave: 'triangle', gain: 0.035, attack: 0.004, release: 0.9, notes: drops },
    { wave: 'sine', gain: 0.045, attack: 0.5, release: 1.8, notes: answer },
  ] };
})();

export const SONGS = { apartment, title, lobby, lake };

let playing = null;

/** Start a song by name on the given AudioContext, routed to `dest`. Returns { stop }. */
export function startSong(ctx, dest, name, volume = 1) {
  const song = SONGS[name];
  if (!song || !ctx) return null;
  stopSong();
  const out = ctx.createGain(); out.gain.value = 0;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;       // take the edge off
  const delay = ctx.createDelay(1); delay.delayTime.value = 60 / song.bpm * 0.75;
  const fb = ctx.createGain(); fb.gain.value = 0.22;                                          // a little room
  out.connect(lp); lp.connect(dest); lp.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(dest);
  out.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);

  const step = 60 / song.bpm / 4, loop = song.bars * 16 * step;
  let loopStart = ctx.currentTime + 0.1, done = new Set();
  const tick = () => {
    const now = ctx.currentTime, horizon = now + 0.35;
    if (now > loopStart + loop) { loopStart += loop; done = new Set(); }
    for (const [ti, tr] of song.tracks.entries()) for (const [ni, [bar, st, midi, len]] of tr.notes.entries()) {
      for (const base of [loopStart, loopStart + loop]) {
        const t = base + (bar * 16 + st) * step, key = `${base.toFixed(3)}:${ti}:${ni}`;
        if (t < now - 0.02 || t > horizon || done.has(key)) continue;
        done.add(key);
        const o = ctx.createOscillator(), g = ctx.createGain(), dur = len * step;
        o.type = tr.wave; o.frequency.value = m2f(midi);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(tr.gain, t + tr.attack);
        g.gain.setValueAtTime(tr.gain, t + Math.max(tr.attack, dur));
        g.gain.exponentialRampToValueAtTime(0.0005, t + Math.max(tr.attack, dur) + tr.release);
        o.connect(g); g.connect(out);
        o.start(t); o.stop(t + Math.max(tr.attack, dur) + tr.release + 0.05);
      }
    }
  };
  const timer = setInterval(tick, 100); tick();
  playing = { name, stop: () => {
    clearInterval(timer);
    out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(out.gain.value, ctx.currentTime);
    out.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
    setTimeout(() => { try { out.disconnect(); lp.disconnect(); delay.disconnect(); } catch {} }, 2500);
  } };
  return playing;
}

export function stopSong() { playing?.stop(); playing = null; }
export const currentSong = () => playing?.name ?? null;
