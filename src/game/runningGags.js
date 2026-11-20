// Running gags (Manuel: "increase the frequency of the random texts ... and add some of your own"). Small moments
// the host picks and tells everyone, so every screen sees the same; no input needed, and they work with humans or
// the AI on any roommate. Each stays inside its roommate's floor (docs/lore/roommates.md):
//   chat    The 245 lab group chat buzzes everyone's phone and somebody groans. Trevor only says he hates it.
//   abuela  Manuel gets a voice note from his abuela. Manuel's own character.
//   cmp     sealed (src/content/gags_sealed.js; what it is: docs/sealed/roommate-surprises.md).
// Lines are English; Spanish is in src/content/lines_es.js (the sealed ones carry their own).
import { esLine } from '../content/lines_es.js';
import { getLang } from '../i18n.js';
import SEALED from '../content/gags_sealed.js';

const rot13 = (s) => s.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13) % 26) + (c <= 'Z' ? 65 : 97)));
export const SEALED_LINES = JSON.parse(rot13(SEALED));
export const SEALED_GAG_ON = true;   // the owner of the character it touches can switch it off

export const GAG_LINES = {
  chat: {
    texts: ['245 LAB: Report due 9 a.m. Sections 3 through 7.', '245 LAB: Who has the oscilloscope? It is not in the cabinet.', '245 LAB: Reminder, there is a quiz on the quiz.', '245 LAB: TA office hours moved to 7 a.m. Saturday.', '245 LAB: Lab partner wants to "sync" at midnight.'],
    manuel: ['I hate 245 lab.', 'I hate 245 lab. Muting the chat.'],
    trevor: ['I also hate 245 lab.', 'Same. 245 lab.'],
    michael: ['I haven\'t started.', 'Who is still awake for this?'],
  },
  abuela: {
    toast: ['Manuel · voice note from Abuela (3:12)', 'Manuel · voice note from Abuela (5:40)', 'Manuel · voice note from Abuela (0:58)'],
    manuel: ['She says I look thin in my photos. She hasn\'t seen me lately.', 'Abuela says wear a jacket. Abuela, it\'s 2098.', 'Five minutes about the neighbor\'s dog. I love her.', 'She asks if the balloon still gets sun.', 'She says eat. I say I am eating. That is the problem.'],
  },
};

const pick = (list, n) => list[n % list.length];

export class RunningGags {
  constructor(scene) {
    this.s = scene;
    const now = scene.time.now;
    this.next = { chat: now + 120000 + Math.random() * 90000, abuela: now + 150000 + Math.random() * 120000, cmp: now + 90000 + Math.random() * 60000 };
    this.n = { chat: 0, abuela: 0, cmp: 0 };
  }

  update(snap) {
    const s = this.s, now = s.time.now;
    if (s.mode === 'client' || s.dlg || s.menu || !snap?.players) return;
    const manuel = snap.players.find((p) => p.c === 'manuel' && !p.dn && !p.zz), michael = snap.players.find((p) => p.c === 'michael' && !p.dn && !p.zz);
    if (SEALED_GAG_ON && manuel && michael && now > this.next.cmp && Math.hypot(manuel.x - michael.x, manuel.y - michael.y) <= 72) {
      this.next.cmp = now + 150000 + Math.random() * 150000;
      const n = this.n.cmp++;
      return this._send({ t: 'gag', k: 'cmp', a: michael.id, b: manuel.id, i: n % SEALED_LINES.compliments.length, r: Math.random() < 0.5 ? n % SEALED_LINES.replies.length : -1 });
    }
    if (now > this.next.chat) {
      this.next.chat = now + 240000 + Math.random() * 180000;
      const n = this.n.chat++, who = snap.players.filter((p) => !p.dn && GAG_LINES.chat[p.c]), p = who[n % Math.max(1, who.length)];
      return this._send({ t: 'gag', k: 'chat', text: pick(GAG_LINES.chat.texts, n), a: p?.id ?? null, la: p ? pick(GAG_LINES.chat[p.c], n) : null });
    }
    if (manuel && now > this.next.abuela) {
      this.next.abuela = now + 360000 + Math.random() * 240000;
      const n = this.n.abuela++;
      return this._send({ t: 'gag', k: 'abuela', text: pick(GAG_LINES.abuela.toast, n), a: manuel.id, la: pick(GAG_LINES.abuela.manuel, n) });
    }
  }

  _send(msg) { if (this.s.mode === 'host') this.s.net.broadcast(msg); this._show(msg); }
  onClientMsg(msg) { if (msg.t !== 'gag') return false; this._show(msg); return true; }

  _show(msg) {
    const s = this.s, say = (id, line, ms) => line && s.time.delayedCall(ms, () => { if (!s.dlg) { s._barkQuietUntil = 0; s._bark(id, line); } });
    if (msg.k === 'cmp') {
      const L = getLang() === 'es' ? 'es' : 'en', a = SEALED_LINES.compliments[msg.i], b = SEALED_LINES.replies[msg.r];
      say(msg.a, a?.[L], 200); say(msg.b, b?.[L], 3200);
    } else if (msg.k === 'chat' || msg.k === 'abuela') {
      s._toast?.(`☎ ${esLine(msg.text)}`);
      this._buzz(msg.k === 'abuela' ? [msg.a] : [...(s.sprites?.keys() ?? [])]);
      say(msg.a, msg.la, msg.k === 'abuela' ? 2400 : 1600);
    }
  }

  // "bzz" over each phone owner's head.
  _buzz(ids) {
    const s = this.s;
    for (const id of ids) {
      const p = s.sprites?.get(id); if (!p || !p.active) continue;
      const t = s.add.text(p.x + 7, p.y - 22, 'bzz', { fontFamily: 'monospace', fontSize: '5px', color: '#7fb069' }).setOrigin(0.5).setDepth(7100);
      s.tweens.add({ targets: t, x: t.x + 1, duration: 60, yoyo: true, repeat: 5, onComplete: () => s.tweens.add({ targets: t, alpha: 0, duration: 400, onComplete: () => t.destroy() }) });
    }
  }
}
