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
// The host picks the moment and tells everyone, so every screen sees the same, with humans or the AI on either
// roommate. Never during dialogue, cutscenes, menus, transitions or close to a fight.
// Lines are English; Spanish is in src/content/lines_es.js.
import { crushTier } from './crush.js';
import { audioOut } from '../audio/audio.js';
import { esLine } from '../content/lines_es.js';

// [tier, line]: a line joins the pool once the story reaches its tier (crushTier: 0 before the Call .. 4 Act 3).
export const RAPPORT_LINES = {
  after: [   // Manuel
    [0, 'Team spirit.'], [0, 'Good game. In advance.'],
    [1, 'That\'s for luck.'], [1, 'Aster pro. Go.'],
    [2, 'You had something there. It\'s gone now.'], [2, 'Don\'t look at me like that. Walk.'],
    [3, 'Habit. Bad habit. Great habit.'], [3, 'Somebody had to.'],
    [4, 'I\'m not even sorry anymore.'], [4, 'That one was from the gonman.'],
  ],
  reply: [   // Michael
    [0, 'Manuel!'], [1, 'Every time.'], [2, 'In front of everybody?'], [3, '...Thank you?'], [4, 'Do that again. No. Don\'t. ...Do it.'],
  ],
  aside: [   // Manuel
    [0, 'Heeyyyyyyyy, Michael. Nice shoes. ...Anyway.'],
    [0, 'Your laces are untied. They\'re not. I just looked. kk, moving on.'],
    [1, 'What size are you? No reason. kk.'],
    [1, 'Michael has very balanced feet. For walking. That\'s all I\'m saying.'],
    [2, 'Those shoes are wasted on you. The arch, Michael. The arch.'],
    [2, 'Don\'t take your shoes off down here. ...Or do. kk. The balloon.'],
    [3, 'If your feet hurt after this. I\'m just saying. I have hands.'],
    [3, 'Socks off at home. House rule. My rule. New rule.'],
    [4, 'I\'ve thought about your feet more than 245 lab. That\'s a lot.'],
    [4, 'I\'m going to say something about your feet. ...No. Next time.'],
  ],
  pop: '*slap*',
};

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
    const manuel = up('manuel'), michael = up('michael');
    if (!manuel || !michael) return;
    const d = Math.hypot(manuel.x - michael.x, manuel.y - michael.y);
    if ((snap.enemies ?? []).some((e) => Math.hypot(e.x - manuel.x, e.y - manuel.y) < FIGHT_NEAR || Math.hypot(e.x - michael.x, e.y - michael.y) < FIGHT_NEAR)) return;
    const tier = crushTier(s.save);
    if (now >= this.next.nudge && d <= CLOSE) {
      this.next.nudge = now + gap(tier); this.next.aside = Math.max(this.next.aside, now + 20000);
      const n = (this.n.nudge += 1);
      return this._send({ t: 'rapport', from: manuel.id, to: michael.id, la: n % 2 ? pick(RAPPORT_LINES.after, tier, n >> 1) : null, lb: n % 3 ? null : pick(RAPPORT_LINES.reply, tier, n) });
    }
    if (now >= this.next.aside && d <= NEAR) {
      this.next.aside = now + gap(tier); this.next.nudge = Math.max(this.next.nudge, now + 20000);
      const n = this.n.aside++;
      return this._send({ t: 'rapport', k: 'aside', from: manuel.id, la: pick(RAPPORT_LINES.aside, tier, n) });
    }
  }

  _send(msg) { if (this.s.mode === 'host') this.s.net.broadcast(msg); this._show(msg); }
  onClientMsg(msg) { if (msg.t !== 'rapport') return false; this._show(msg); return true; }

  _show(msg) {
    const s = this.s, say = (id, line, ms) => line && s.time.delayedCall(ms, () => { if (!s.dlg) { s._barkQuietUntil = 0; s._bark(id, line); } });
    if (msg.k === 'aside') return say(msg.from, msg.la, 0);
    this._nudge(msg.from, msg.to);
    say(msg.from, msg.la, 900);
    say(msg.to, msg.lb, 2800);
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
      const pop = s.add.text(b.x, b.y - 26, esLine(RAPPORT_LINES.pop), { fontFamily: 'monospace', fontSize: '6px', color: '#ffd166', stroke: '#0b0d16', strokeThickness: 2 }).setOrigin(0.5).setDepth(7001);
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
