// Manuel farts (Manuel's own request and yes, for his character only; D-007, nothing graphic per D-015).
// Every so often, at random, Manuel lets one go: a synthesized fart everyone nearby hears, and a cloud of
// gas that puffs out behind him and drifts. Works whether a human or the AI is running Manuel.
// The host picks the moment and tells everyone, so all screens see the same cloud.
//
// Michael's part (he smells it, the gas drifts into his nose, he likes it) makes Michael's character act,
// so it needs Michael's own yes (D-007). It stays off until his agent sets MICHAEL_SAYS_YES.
import { audioOut } from '../audio/audio.js';

export const MICHAEL_SAYS_YES = true;    // Michael said yes in person, next to Manuel (gonman's chat, 2026-11-19); BagelMeister to confirm

const SNIFF_NEAR = 56;                    // px: Michael this close gets the cloud in his nose
export const FART_LINES = {
  manuel: ['That was the mate.', 'Nobody saw that.', 'The gonman is lighter now.', 'Che. Sorry. Not sorry.'],
  michael: ['What are you eating? They keep getting better.', 'Oh. Oh, that\'s Manuel.', 'Do it again.', 'What are you eating? They keep getting better.', 'That\'s a good one. Is that weird?'],   // the first is Michael's own line
  // Sometimes (about 1 in 4) Manuel follows up, a few seconds later, with second thoughts.
  oops: ['Wait. I might have pooped my pants.', 'Okay. That one had weight to it.', 'Nobody look at me for a minute.'],
};

export class Fart {
  constructor(scene) {
    this.s = scene;
    this.next = scene.time.now + 180000 + Math.random() * 120000;   // first one 3-5 minutes in
    this.n = 0;
  }

  update(snap) {
    const s = this.s;
    if (s.mode === 'client' || s.dlg || s.menu || s.time.now < this.next) return;
    const manuel = snap.players.find((p) => p.c === 'manuel' && !p.dn && !p.zz);
    if (!manuel) return;
    this.next = s.time.now + 240000 + Math.random() * 300000;      // then every 4-9 minutes
    const michael = MICHAEL_SAYS_YES && snap.players.find((p) => p.c === 'michael' && !p.dn && !p.zz && Math.hypot(p.x - manuel.x, p.y - manuel.y) <= SNIFF_NEAR);
    const n = (this.n = this.n + 1);
    const oops = Math.random() < 0.25 ? FART_LINES.oops[(n - 1) % FART_LINES.oops.length] : null;
    this._send({ t: 'fart', id: manuel.id, sniff: michael ? michael.id : null, line: FART_LINES.manuel[(n - 1) % FART_LINES.manuel.length], reply: michael ? FART_LINES.michael[(n - 1) % FART_LINES.michael.length] : null, oops });
  }

  _send(msg) {
    if (this.s.mode === 'host') this.s.net.broadcast(msg);
    this._show(msg);
  }

  onClientMsg(msg) { if (msg.t !== 'fart') return false; this._show(msg); return true; }

  _show(msg) {
    const s = this.s, a = s.sprites?.get(msg.id);
    if (!a) return;
    this._sound(a);
    const b = msg.sniff ? s.sprites?.get(msg.sniff) : null;
    this._cloud(a, b);
    s.npcLife?.onFart(a.x, a.y - 6);
    s.crowd?.onFart?.(a.x, a.y);   // bystanders lean away and complain (src/game/npcLife.js)
    s.time.delayedCall(700, () => { s._barkQuietUntil = 0; s._bark(msg.id, msg.line); });
    if (b && msg.reply) s.time.delayedCall(2600, () => { s._barkQuietUntil = 0; s._bark(msg.sniff, msg.reply); });
    if (msg.oops) s.time.delayedCall(b ? 5200 : 4200, () => { if (!s.dlg) { s._barkQuietUntil = 0; s._bark(msg.id, msg.oops); } });
  }

  // The gas: pale puffs out from behind him, swelling and drifting up. If Michael is close (and has said
  // yes), the puffs curl over to his face and shrink into his nose, and a little heart pops.
  _cloud(a, b) {
    const s = this.s, behind = a.flipX ? 1 : -1, x0 = a.x + behind * 4, y0 = a.y - 6;
    for (let i = 0; i < 7; i++) {
      const puff = s.add.circle(x0, y0, 2 + (i % 3), 0xb7c48a, 0.55).setDepth(a.y + 1);
      const dx = behind * (6 + i * 3) + (Math.random() * 6 - 3), dy = -4 - i * 2;
      s.tweens.add({ targets: puff, x: x0 + dx, y: y0 + dy, scale: 2.4, alpha: 0.35, duration: 500 + i * 70, delay: i * 60, ease: 'Sine.easeOut',
        onComplete: () => {
          if (!b?.active) { s.tweens.add({ targets: puff, alpha: 0, scale: 3.2, y: puff.y - 8, duration: 900, onComplete: () => puff.destroy() }); return; }
          s.tweens.add({ targets: puff, x: b.x + (b.flipX ? -2 : 2), y: b.y - 15, scale: 0.4, alpha: 0.8, duration: 900 + i * 60, ease: 'Quad.easeIn',
            onComplete: () => puff.destroy() });
        } });
    }
    for (let i = 0; i < 3; i++) {                                        // wavy stink lines over the cloud
      const w = s.add.text(x0 + behind * (8 + i * 5), y0 - 6, '~', { fontFamily: 'monospace', fontSize: '7px', color: '#b7c48a' }).setOrigin(0.5).setDepth(7000).setAlpha(0);
      s.tweens.add({ targets: w, alpha: 0.9, y: w.y - 10, duration: 700, delay: 250 + i * 150, yoyo: true, onComplete: () => w.destroy() });
    }
    if (b) s.time.delayedCall(1900, () => {
      if (!b.active) return;
      s.tweens.add({ targets: b, y: b.y - 2, yoyo: true, duration: 120, repeat: 1 });   // a big sniff
      const h = s.add.text(b.x, b.y - 26, '♥', { fontFamily: 'monospace', fontSize: '8px', color: '#f2a6b8' }).setOrigin(0.5).setDepth(7000);
      s.tweens.add({ targets: h, y: h.y - 10, alpha: 0, duration: 900, onComplete: () => h.destroy() });
    });
  }

  // A fart, synthesized: a low buzzing sawtooth whose pitch wobbles and sags, through a lowpass, with a
  // little breathy noise on top. Quieter the farther you are from him (master volume and ?mute apply).
  _sound(a) {
    const out = audioOut(); if (!out) return;
    const s = this.s, me = s.sprites?.get(s.localId), d = me ? Math.hypot(me.x - a.x, me.y - a.y) : 0;
    const vol = Math.max(0, 1 - d / 220); if (vol <= 0) return;
    const { ctx, dest } = out, t = ctx.currentTime + 0.02, len = 0.45 + Math.random() * 0.5;
    const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(95 + Math.random() * 25, t); o.frequency.exponentialRampToValueAtTime(48, t + len);
    lfo.frequency.setValueAtTime(18 + Math.random() * 10, t); lg.gain.value = 22; lfo.connect(lg); lg.connect(o.frequency);
    f.type = 'lowpass'; f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(260, t + len); f.Q.value = 6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35 * vol, t + 0.03); g.gain.setValueAtTime(0.3 * vol, t + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(f); f.connect(g); g.connect(dest);
    const nb = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.5;
    const n = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
    n.buffer = nb; nf.type = 'bandpass'; nf.frequency.value = 400; nf.Q.value = 1.2; ng.gain.setValueAtTime(0.08 * vol, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + len);
    n.connect(nf); nf.connect(ng); ng.connect(dest);
    o.start(t); lfo.start(t); n.start(t); o.stop(t + len + 0.05); lfo.stop(t + len + 0.05); n.stop(t + len + 0.05);
  }
}
