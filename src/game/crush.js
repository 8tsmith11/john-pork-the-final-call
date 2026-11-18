// Michael's crush (D-016): as the story moves on, Michael gets progressively more into his roommates,
// Manuel most of all. Every so often, when Michael is near one of them, he says one line from the
// highest tier he's unlocked; each line plays once per world, ever, and sometimes they answer.
// The host picks the moment and line and tells everyone, so all screens see the same thing.
//
// The butt pat is OFF until Manuel says yes (D-007: a roommate's likeness in anything sexual needs that
// person's own yes). gonman sets MANUEL_SAYS_YES once Manuel has answered.
import CRUSH from '../content/crush.js';
import { audioOut } from '../audio/audio.js';

export const MANUEL_SAYS_YES = false;

const rot13 = (s) => s.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13) % 26) + (c <= 'Z' ? 65 : 97)));
const DATA = JSON.parse(rot13(CRUSH));
const NEAR = 80, PAT_NEAR = 20;

/** How far along Michael is: 0 (none yet) .. 4. */
export function crushTier(save) {
  const f = save.flags, act = save.world?.act ?? 1;
  if (act >= 3) return 4;
  if (act >= 2 || f['act1.boss.defeated'] || f['act1.complete']) return 3;
  if (f['act1.switchyard.solved']) return 2;
  if (f['act1.beat.call']) return 1;
  return 0;
}

export class Crush {
  constructor(scene) {
    this.s = scene;
    this.next = scene.time.now + 45000;
    this.nextPat = scene.time.now + 120000;
  }

  get used() { return (this.s.save.flags['act1.crush.used'] ??= []); }

  update(snap) {
    const s = this.s;
    if (s.mode === 'client' || s.dlg || s.menu) return;
    const now = s.time.now, tier = crushTier(s.save);
    if (!tier) return;
    const michael = snap.players.find((p) => p.c === 'michael' && !p.dn && !p.zz);
    if (!michael) return;
    const near = (c, r) => snap.players.find((p) => p.c === c && !p.dn && Math.hypot(p.x - michael.x, p.y - michael.y) <= r);

    if (now > this.next) {
      this.next = now + 70000 + Math.random() * 70000;
      // the highest tier first, never a line twice
      const open = DATA.lines.map((l, i) => ({ ...l, i })).filter((l) => l.tier <= tier && !this.used.includes(l.i) && near(l.to, NEAR));
      const top = Math.max(...open.map((l) => l.tier));
      const pick = open.filter((l) => l.tier === top)[0];
      if (pick) {
        this.used.push(pick.i);
        const target = near(pick.to, NEAR);
        this._send({ t: 'crush', id: michael.id, text: pick.text, replyId: pick.reply ? target.id : null, reply: pick.reply });
      }
    }

    if (MANUEL_SAYS_YES && tier >= 2 && now > this.nextPat) {
      const manuel = near('manuel', PAT_NEAR);
      if (manuel) {
        this.nextPat = now + 150000 + Math.random() * 150000;
        const n = (s.save.flags['act1.crush.pats'] = (s.save.flags['act1.crush.pats'] ?? 0) + 1);
        this._send({ t: 'crush', id: michael.id, pat: manuel.id, replyId: manuel.id, reply: DATA.patReplies[(n - 1) % DATA.patReplies.length] });
      }
    }
  }

  _send(msg) {
    if (this.s.mode === 'host') this.s.net.broadcast(msg);
    this._show(msg);
  }

  onClientMsg(msg) { if (msg.t !== 'crush') return false; this._show(msg); return true; }

  _show(msg) {
    const s = this.s;
    if (msg.text) { s._barkQuietUntil = 0; s._bark(msg.id, msg.text); }
    if (msg.pat) this._pat(msg.id, msg.pat);
    if (msg.reply && msg.replyId) s.time.delayedCall(msg.pat ? 900 : 3200, () => { s._barkQuietUntil = 0; s._bark(msg.replyId, msg.reply); });
  }

  // A quick pat: Michael bumps toward Manuel, a slap, a heart.
  _pat(fromId, toId) {
    const s = this.s, a = s.sprites?.get(fromId), b = s.sprites?.get(toId);
    if (!a || !b) return;
    s.tweens.add({ targets: a, x: a.x + Math.sign(b.x - a.x || 1) * 3, yoyo: true, duration: 90 });
    s.tweens.add({ targets: b, y: b.y - 2, yoyo: true, duration: 80, delay: 90 });
    const h = s.add.text(b.x, b.y - 26, '♥', { fontFamily: 'monospace', fontSize: '8px', color: '#f2a6b8' }).setOrigin(0.5).setDepth(7000);
    s.tweens.add({ targets: h, y: h.y - 10, alpha: 0, duration: 900, onComplete: () => h.destroy() });
    const out = audioOut(); if (!out) return;
    const { ctx, dest } = out, t = ctx.currentTime + 0.09, n = ctx.createBufferSource(), buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; const g = ctx.createGain(); g.gain.value = 0.7;
    n.buffer = buf; n.connect(f); f.connect(g); g.connect(dest); n.start(t);
  }
}
