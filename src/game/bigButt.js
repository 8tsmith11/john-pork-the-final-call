// Manuel's butt is sometimes particularly large, for no reason (Manuel's own request, his character only;
// clothed and cartoonish per D-015). Every few minutes the host picks a moment; for half a minute or so
// every screen draws Manuel with a bigger behind, then it goes back. Works with a human or the AI on Manuel.
import { wearTexture } from './render/wearables.js';

export const BUTT_LINES = ['Why are my pants tight all of a sudden.', 'Leg day. I did not do leg day.', 'Nobody say anything.'];

export class BigButt {
  constructor(scene) {
    this.s = scene;
    this.next = scene.time.now + 150000 + Math.random() * 150000;   // first one 2.5-5 minutes in
    this.until = 0; this.who = null; this.n = 0;
  }

  update(snap) {
    const s = this.s, now = s.time.now;
    if (s.mode !== 'client' && now > this.next && !s.dlg) {
      const manuel = snap?.players?.find((p) => p.c === 'manuel' && !p.dn);
      if (manuel) {
        this.next = now + 180000 + Math.random() * 240000;            // then every 3-7 minutes
        const n = (this.n += 1), line = n % 3 === 1 ? BUTT_LINES[Math.floor(n / 3) % BUTT_LINES.length] : null;
        this._send({ t: 'butt', id: manuel.id, ms: 25000 + Math.random() * 20000, line });
      }
    }
    this._draw(now);
  }

  _send(msg) { if (this.s.mode === 'host') this.s.net.broadcast(msg); this._start(msg); }
  onClientMsg(msg) { if (msg.t !== 'butt') return false; this._start(msg); return true; }

  _start(msg) {
    const s = this.s;
    this.who = msg.id; this.until = s.time.now + msg.ms;
    if (msg.line) s.time.delayedCall(1500, () => { if (!s.dlg) { s._barkQuietUntil = 0; s._bark(msg.id, msg.line); } });
  }

  _draw(now) {
    const s = this.s, body = this.who && s.sprites?.get(this.who);
    const on = !!body && now < this.until && body.texture?.key === 'manuel';
    if (!on) { if (this.img) this.img.setVisible(false); return; }
    const key = wearTexture(s, 'manuel', 'fx.bigbutt'); if (!key) return;
    if (!this.img || !this.img.active) this.img = s.add.image(0, 0, key);
    const f = body.frame?.name, o = this.img;
    if (f != null && o.texture.has(f) && o.frame?.name !== f) o.setFrame(f);
    o.setOrigin(body.originX, body.originY).setPosition(body.x, body.y).setFlipX(body.flipX).setAngle(body.angle)
      .setScale(body.scaleX, body.scaleY).setAlpha(body.alpha).setVisible(body.visible && o.texture.has(f)).setDepth(body.depth + 0.005);
  }
}
