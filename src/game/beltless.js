// Michael forgot his belt (Michael's own yes, relayed by Manuel in person on 2026-11-19, and his P-003 yes to
// surprises about his character; not sexual, nothing shown, so outside D-007; boxers stay on per D-015).
// Every few minutes, at random, Michael's trousers fall down to his ankles. He says sorry, he left his belt
// at home; sometimes a roommate says something; a few seconds later he hauls them back up. No input needed:
// it happens with a human or the AI on Michael. The host picks the moment, so every screen sees the same.
import { wearTexture } from './render/wearables.js';

export const MICHAEL_BELT = true;   // one switch: BagelMeister can turn it off if Michael changes his mind

export const BELT_LINES = {
  michael: ['Sorry. Left my belt at home.', 'Not again. Sorry. Left my belt at home.', 'Sorry! Belt\'s at home.', 'Nobody look. Left my belt at home.'],   // the first is Michael's own line
  manuel: ['Michael. Pants.', 'Che, the pants.', 'Again?'],
  trevor: ['I\'m buying you a belt.', 'Belt. Putting it on the list.'],
  after: ['Okay. We\'re good.', 'That never happened.'],
};

export class Beltless {
  constructor(scene) {
    this.s = scene;
    this.next = scene.time.now + 150000 + Math.random() * 90000;    // first time 2.5-4 minutes in
    this.until = 0; this.who = null; this.n = 0;
  }

  update(snap) {
    const s = this.s, now = s.time.now;
    if (MICHAEL_BELT && s.mode !== 'client' && now > this.next && !s.dlg && !s.menu) {
      const michael = snap?.players?.find((p) => p.c === 'michael' && !p.dn && !p.zz);
      if (michael) {
        this.next = now + 240000 + Math.random() * 240000;            // then every 4-8 minutes
        const n = (this.n += 1), others = snap.players.filter((p) => p.c !== 'michael' && !p.dn && BELT_LINES[p.c]);
        const r = others.length && Math.random() < 0.5 ? others[Math.floor(Math.random() * others.length)] : null;
        this._send({ t: 'belt', id: michael.id, ms: 6000 + Math.random() * 3000,
          line: BELT_LINES.michael[n % 2 ? 0 : 1 + Math.floor(n / 2) % (BELT_LINES.michael.length - 1)],   // his own line every other time
          by: r?.id ?? null, react: r ? BELT_LINES[r.c][Math.floor(Math.random() * BELT_LINES[r.c].length)] : null,
          after: Math.random() < 0.34 ? BELT_LINES.after[n % BELT_LINES.after.length] : null });
      }
    }
    this._draw(now);
  }

  _send(msg) { if (this.s.mode === 'host') this.s.net.broadcast(msg); this._start(msg); }
  onClientMsg(msg) { if (msg.t !== 'belt') return false; this._start(msg); return true; }

  _start(msg) {
    const s = this.s, say = (id, line) => { if (line && !s.dlg) { s._barkQuietUntil = 0; s._bark(id, line); } };
    this.who = msg.id; this.until = s.time.now + msg.ms;
    s.time.delayedCall(400, () => say(msg.id, msg.line));
    if (msg.by && msg.react) s.time.delayedCall(3000, () => say(msg.by, msg.react));
    if (msg.after) s.time.delayedCall(msg.ms + 300, () => say(msg.id, msg.after));
  }

  _draw(now) {
    const s = this.s, body = this.who && s.sprites?.get(this.who);
    const on = !!body && now < this.until && body.texture?.key === 'michael';
    if (!on) { if (this.img) this.img.setVisible(false); return; }
    const key = wearTexture(s, 'michael', 'fx.pantsdown'); if (!key) return;
    if (!this.img || !this.img.active) this.img = s.add.image(0, 0, key);
    const f = body.frame?.name, o = this.img;
    if (f != null && o.texture.has(f) && o.frame?.name !== f) o.setFrame(f);
    o.setOrigin(body.originX, body.originY).setPosition(body.x, body.y).setFlipX(body.flipX).setAngle(body.angle)
      .setScale(body.scaleX, body.scaleY).setAlpha(body.alpha).setVisible(body.visible && o.texture.has(f)).setDepth(body.depth + 0.02);
  }
}
