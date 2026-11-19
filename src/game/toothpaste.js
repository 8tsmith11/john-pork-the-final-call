// "Toothpaste" (Manuel's own request): once Manuel has the white splotches (level 6, the gonman's stage two),
// every few minutes, if Michael is standing near him, Michael asks about them, Manuel says "Hmmmm. Toothpaste?"
// and Michael doesn't buy it. Bubbles only; works with humans or the AI on either. Trevor never takes part
// (his floor: no crude or sexual humor on his character). The host picks the moment so every screen agrees.
export const MICHAEL_TOOTHPASTE = true;   // Michael only asks and doubts; BagelMeister can turn it off if Michael objects

export const TOOTHPASTE_TALK = {
  ask: ['Manuel. What\'s that white stuff on your shirt?', 'Manuel, you\'ve got something... white. On you.'],
  answer: 'Hmmmm. Toothpaste?',
  doubt: ['Sure, sure...', 'Sure. Sure sure sure.'],
};

const NEAR = 80;   // px

export class ToothpasteTalk {
  constructor(scene) {
    this.s = scene;
    this.next = scene.time.now + 120000 + Math.random() * 120000;   // checks start 2-4 minutes in
    this.n = 0;
  }

  update(snap) {
    const s = this.s, now = s.time.now;
    if (!MICHAEL_TOOTHPASTE || s.mode === 'client' || s.dlg || s.menu || now < this.next) return;
    if ((s.save?.party?.manuel?.level ?? 1) < 6) { this.next = now + 30000; return; }
    const manuel = snap?.players?.find((p) => p.c === 'manuel' && !p.dn && !p.zz);
    const michael = snap?.players?.find((p) => p.c === 'michael' && !p.dn && !p.zz);
    if (!manuel || !michael || Math.hypot(manuel.x - michael.x, manuel.y - michael.y) > NEAR) { this.next = now + 8000; return; }
    this.next = now + 240000 + Math.random() * 240000;               // then every 4-8 minutes
    const n = (this.n += 1);
    this._send({ t: 'toothpaste', manuel: manuel.id, michael: michael.id, ask: TOOTHPASTE_TALK.ask[(n - 1) % 2], doubt: TOOTHPASTE_TALK.doubt[(n - 1) % 2] });
  }

  _send(msg) { if (this.s.mode === 'host') this.s.net.broadcast(msg); this._play(msg); }
  onClientMsg(msg) { if (msg.t !== 'toothpaste') return false; this._play(msg); return true; }

  _play(msg) {
    const s = this.s, say = (id, line) => { if (!s.dlg) { s._barkQuietUntil = 0; s._bark(id, line); } };
    say(msg.michael, msg.ask);
    s.time.delayedCall(2600, () => say(msg.manuel, TOOTHPASTE_TALK.answer));
    s.time.delayedCall(5200, () => say(msg.michael, msg.doubt));
  }
}
