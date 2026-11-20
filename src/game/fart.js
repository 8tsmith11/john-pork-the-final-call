// Manuel farts (Manuel's own request and yes, for his character only; D-007, nothing graphic per D-015).
// Every so often, at random, Manuel lets one go: a synthesized fart everyone nearby hears, and a cloud of
// gas that puffs out behind him and drifts. Works whether a human or the AI is running Manuel.
// The host picks the moment and tells everyone, so all screens see the same cloud.
//
// Michael never sniffs or likes it (Michael, 2026-11-20: removed). He only complains, like the bystanders.
import { audioOut } from '../audio/audio.js';

// Michael only complains: an ordinary roommate reaction. BagelMeister can turn it off if Michael objects.
export const MICHAEL_FART_COMPLAIN = true;

const NEAR = 56;                          // px: Michael this close gets the cloud round his head
export const FART_LINES = {
  manuel: ['That was the mate.', 'Nobody saw that.', 'The gonman is lighter now.', 'Che. Sorry. Not sorry.'],
  // Sometimes (about 1 in 4) Manuel follows up, a few seconds later, with second thoughts.
  complain: ['Manuel. Window. Now.', 'Why is it always when I\'m standing next to you?', 'My eyes are watering, Manuel.', 'That went right into my hat.', 'Manuelita would never.'],
  oops: ['Wait. I might have pooped my pants.', 'Okay. That one had weight to it.', 'Nobody look at me for a minute.'],
};

export class Fart {
  constructor(scene) {
    this.s = scene;
    this.next = scene.time.now + 90000 + Math.random() * 60000;     // first one 1.5-2.5 minutes in (Manuel: more often)
    this.n = 0;
  }

  update(snap) {
    const s = this.s;
    if (s.mode === 'client' || s.dlg || s.menu || s.time.now < this.next) return;
    const manuel = snap.players.find((p) => p.c === 'manuel' && !p.dn && !p.zz);
    if (!manuel) return;
    // Aimed at Michael (Manuel: "manuels farts to michael"): once one is due, it waits up to a minute for Michael to be close.
    const near = snap.players.find((p) => p.c === 'michael' && !p.dn && !p.zz && Math.hypot(p.x - manuel.x, p.y - manuel.y) <= NEAR);
    this.due ??= s.time.now;
    if (!near && snap.players.some((p) => p.c === 'michael' && !p.dn) && s.time.now - this.due < 60000) return;
    this.due = null;
    this.next = s.time.now + 90000 + Math.random() * 90000;       // then every 1.5-3 minutes
    const complain = MICHAEL_FART_COMPLAIN ? near : null;
    const n = (this.n = this.n + 1);
    const oops = Math.random() < 0.25 ? FART_LINES.oops[(n - 1) % FART_LINES.oops.length] : null;
    this._send({ t: 'fart', id: manuel.id, by: complain ? complain.id : null, line: FART_LINES.manuel[(n - 1) % FART_LINES.manuel.length],
      reply: complain ? FART_LINES.complain[(n - 1) % FART_LINES.complain.length] : null, oops });
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
    const c = msg.by ? s.sprites?.get(msg.by) : null;
    this._cloud(a, c);
    s.npcLife?.onFart(a.x, a.y - 6);
    s.crowd?.onFart?.(a.x, a.y);   // bystanders lean away and complain (src/game/npcLife.js)
    s.time.delayedCall(700, () => { s._barkQuietUntil = 0; s._bark(msg.id, msg.line); });
    if (msg.by && msg.reply) s.time.delayedCall(3600, () => { if (!s.dlg) { s._barkQuietUntil = 0; s._bark(msg.by, msg.reply); } });   // Michael complains
    if (msg.oops) s.time.delayedCall(msg.by ? 6600 : 4200, () => { if (!s.dlg) { s._barkQuietUntil = 0; s._bark(msg.id, msg.oops); } });
  }

  // The gas, drawn out so it reads (Manuel, 2026-11-19: "last longer so they are noticeable"): pale puffs out from
  // behind him, swelling, hanging there for a few seconds. If Michael is close and complains (c), the cloud drifts
  // to his head and hangs round it while he coughs.
  _cloud(a, c) {
    const s = this.s, behind = a.flipX ? 1 : -1, x0 = a.x + behind * 4, y0 = a.y - 6, to = c?.active ? c : null;
    const say = (who, txt, at) => s.time.delayedCall(at, () => {
      if (!who.active) return;
      const t = s.add.text(who.x + 8, who.y - 22, txt, { fontFamily: 'monospace', fontSize: '5px', color: '#b7c48a', stroke: '#0b0d16', strokeThickness: 2 }).setOrigin(0.5).setDepth(7001);
      s.tweens.add({ targets: t, y: t.y - 8, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
    });
    for (let i = 0; i < 11; i++) {
      const puff = s.add.circle(x0, y0, 2 + (i % 3), 0xb7c48a, 0.6).setDepth(a.y + 1);
      const dx = behind * (6 + i * 2.5) + (Math.random() * 8 - 4), dy = -3 - i * 1.6;
      s.tweens.add({ targets: puff, x: x0 + dx, y: y0 + dy, scale: 2.6, alpha: 0.45, duration: 700 + i * 80, delay: i * 70, ease: 'Sine.easeOut',
        onComplete: () => {
          if (!to?.active) {   // nobody close: it hangs in the air, wobbling, then thins out
            s.tweens.add({ targets: puff, x: puff.x + (Math.random() * 6 - 3), y: puff.y - 3, duration: 900, yoyo: true, repeat: 1,
              onComplete: () => s.tweens.add({ targets: puff, alpha: 0, scale: 3.4, y: puff.y - 10, duration: 1400, onComplete: () => puff.destroy() }) });
            return;
          }
          const hx = to.x + (to.flipX ? -2 : 2), hy = to.y - 16;
          s.tweens.add({ targets: puff, x: hx + (Math.random() * 14 - 7), y: hy + (Math.random() * 8 - 4), scale: 2, alpha: 0.5, duration: 1000, ease: 'Sine.easeInOut',   // round his head
            onComplete: () => s.tweens.add({ targets: puff, x: puff.x + (Math.random() * 6 - 3), duration: 500, yoyo: true, repeat: 2,
              onComplete: () => s.tweens.add({ targets: puff, alpha: 0, scale: 3, y: puff.y - 8, duration: 1000, onComplete: () => puff.destroy() }) }) });
        } });
    }
    for (let i = 0; i < 5; i++) {                                        // wavy stink lines over the cloud
      const w = s.add.text(x0 + behind * (6 + i * 4), y0 - 6, '~', { fontFamily: 'monospace', fontSize: '7px', color: '#b7c48a' }).setOrigin(0.5).setDepth(7000).setAlpha(0);
      s.tweens.add({ targets: w, alpha: 0.9, y: w.y - 12, duration: 900, delay: 250 + i * 220, hold: 500, yoyo: true, onComplete: () => w.destroy() });
    }
    if (c?.active && to === c) { say(c, '*cough*', 1700); say(c, '*cough cough*', 2500); }
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
