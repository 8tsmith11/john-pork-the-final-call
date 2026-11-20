// Task #63, sealed (docs/sealed/roommate-surprises.md; PROCESS "Spoilers and surprises"): keep plain comments
// here to timing and plumbing. What it is, in ROT13 (python3 tools/spoilers/seal.py text "..."):
//   Znahry fyncf Zvpunry'f ohgg abj naq gura, naq znxrf pbzzragf nobhg Zvpunry'f srrg (Zvpunry'f erdhrfg,
//   2026-11-19, gnfx #63). Obgu trg zber serdhrag nf gur fgbel tbrf ba: ener orsber gur Pnyy, bsgra ol Npg 2.
//   Gur pheir vf gur fgbel gvref sebz pehfu.wf (syntf naq npg), arire cynl gvzr. Zvpunry unf n fgnaqvat lrf gb
//   tntf ba uvf punenpgre; Znahry'f sybbe vf pehqr wbxrf, abguvat rkcyvpvg qenja (Q-015), fb gur fync vf n
//   ahqtr, n cbc naq n fbhaq. Geribe vf arire cneg bs vg: abobql fyncf uvz naq abguvat vf fnvq gb be nobhg
//   uvz. Gur yvarf: 'nsgre' vf Znahry nsgre n fync, 'ercyl' vf Zvpunry jnezvat gb vg (uvf sybbe: zber vagb uvf
//   ebbzzngrf, Znahry zbfg bs nyy), 'nfvqr' vf Znahry ba Zvpunry'f srrg, gura n punatr bs fhowrpg gung'f gbb
//   snfg.
// The host picks the moment and tells everyone, so every screen sees the same, whoever plays the two roommates
// (a human or the AI). Never during dialogue, cutscenes, menus, transitions or close to a fight.
// Lines (EN and ES), and who they're for, are sealed data: src/content/rapport_sealed.js.
import { crushTier } from './crush.js';
import { audioOut } from '../audio/audio.js';
import { getLang } from '../i18n.js';
import SEALED from '../content/rapport_sealed.js';

const rot13 = (t) => t.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13) % 26) + (c <= 'Z' ? 65 : 97)));
const DATA = JSON.parse(rot13(SEALED));
/** The two roommates it plays between: [doer, other]. */
export const PAIR = DATA.w;
// [tier, { en, es }]: a line joins the pool once the story reaches its tier (crushTier: 0 before the Call .. 4 Act 3).
// a: the doer, after the nudge; b: the other one, answering; c: the doer's aside. p: the pop over the other's head.
export const RAPPORT_LINES = { a: DATA.a, b: DATA.b, c: DATA.c, p: DATA.p };
const say = (l) => (l ? (getLang() === 'es' && l.es ? l.es : l.en) : null);

// Seconds between one and the next, by tier (both kinds share the curve).
export const RAPPORT_GAP = [[360, 540], [240, 360], [150, 240], [90, 150], [45, 90]];
const CLOSE = 22, NEAR = 80, FIGHT_NEAR = 160;   // px

const gap = (tier) => { const [a, b] = RAPPORT_GAP[Math.max(0, Math.min(4, tier))]; return (a + Math.random() * (b - a)) * 1000; };
// The newest two tiers the story has reached, round-robin, so the lines move on with the story.
const pick = (list, tier, n) => { const pool = list.filter(([t]) => t <= tier && t >= tier - 1).map(([, l]) => l); return pool.length ? pool[n % pool.length] : null; };

export class Rapport {
  constructor(scene) {
    this.s = scene;
    const now = scene.time.now;
    this.next = { nudge: now + 90000 + Math.random() * 60000, aside: now + 120000 + Math.random() * 60000 };   // nothing in the first minute and a half
    this.n = { nudge: 0, aside: 0 };
  }

  update(snap) {
    const s = this.s, now = s.time.now;
    if (s.mode === 'client' || s.dlg || s.menu || s.stage?.active || s._transitioning || !snap?.players) return;
    if (now < this.next.nudge && now < this.next.aside) return;
    const up = (c) => snap.players.find((p) => p.c === c && !p.dn && !p.zz);
    const a = up(PAIR[0]), b = up(PAIR[1]);
    if (!a || !b) return;
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if ((snap.enemies ?? []).some((e) => Math.hypot(e.x - a.x, e.y - a.y) < FIGHT_NEAR || Math.hypot(e.x - b.x, e.y - b.y) < FIGHT_NEAR)) return;
    const tier = crushTier(s.save);
    if (now >= this.next.nudge && d <= CLOSE) {
      this.next.nudge = now + gap(tier); this.next.aside = Math.max(this.next.aside, now + 20000);
      const n = (this.n.nudge += 1);
      return this._send({ t: 'rapport', from: a.id, to: b.id, la: n % 2 ? pick(RAPPORT_LINES.a, tier, n >> 1) : null, lb: n % 3 ? null : pick(RAPPORT_LINES.b, tier, n) });
    }
    if (now >= this.next.aside && d <= NEAR) {
      this.next.aside = now + gap(tier); this.next.nudge = Math.max(this.next.nudge, now + 20000);
      const n = this.n.aside++;
      return this._send({ t: 'rapport', k: 'aside', from: a.id, la: pick(RAPPORT_LINES.c, tier, n) });
    }
  }

  _send(msg) { if (this.s.mode === 'host') this.s.net.broadcast(msg); this._show(msg); }
  onClientMsg(msg) { if (msg.t !== 'rapport') return false; this._show(msg); return true; }

  _show(msg) {
    const s = this.s, show = (id, line, ms) => line && s.time.delayedCall(ms, () => { if (!s.dlg) { s._barkQuietUntil = 0; s._bark(id, say(line)); } });
    if (msg.k === 'aside') return show(msg.from, msg.la, 0);
    this._nudge(msg.from, msg.to);
    show(msg.from, msg.la, 900);
    show(msg.to, msg.lb, 2800);
  }

  // A quick lean-in, a hop, the pop and a sound. offX/offY are the gag nudges the render loop adds every frame
  // (see crush.js).
  _nudge(fromId, toId) {
    const s = this.s, a = s.sprites?.get(fromId), b = s.sprites?.get(toId);
    if (!a || !b) return;
    const dir = Math.sign(b.x - a.x || 1);
    a.offX = 0; b.offX = 0; b.offY = 0;
    s.tweens.add({ targets: a, offX: dir * 3, duration: 110, hold: 120, yoyo: true, ease: 'Sine.easeOut', onComplete: () => { a.offX = 0; } });
    s.tweens.add({ targets: b, offY: -3, duration: 90, yoyo: true, delay: 110, onComplete: () => { b.offY = 0; } });
    s.tweens.add({ targets: b, offX: dir * 2, duration: 120, yoyo: true, delay: 110, onComplete: () => { b.offX = 0; } });
    s.time.delayedCall(110, () => {
      const pop = s.add.text(b.x, b.y - 26, say(RAPPORT_LINES.p), { fontFamily: 'monospace', fontSize: '6px', color: '#ffd166', stroke: '#0b0d16', strokeThickness: 2 }).setOrigin(0.5).setDepth(7001);
      s.tweens.add({ targets: pop, y: pop.y - 6, duration: 260, hold: 700, ease: 'Back.easeOut', onComplete: () => s.tweens.add({ targets: pop, alpha: 0, duration: 300, onComplete: () => pop.destroy() }) });
    });
    const out = audioOut(); if (!out) return;
    const { ctx, dest } = out, t = ctx.currentTime + 0.11;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'bandpass'; f.frequency.value = 2300; f.Q.value = 0.8; g.gain.value = 0.8;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(dest); src.start(t);
  }
}
