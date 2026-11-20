// After a party wipe, once everyone wakes at the start of the area, one roommate says a line about
// trying again. What it says is sealed (src/content/retry.js). The host picks the line and tells
// everyone, so every screen shows the same bubble at the same moment, and it's spoken aloud when
// voice is on. It works whether a human or the AI plays that roommate. Its count lives in the save
// as `gag.retry.n`.
import { RETRY_WHO, RETRY_LINES } from '../content/retry.js';
import { getLang } from '../i18n.js';
import { speak } from '../audio/audio.js';
import * as Settings from '../settings.js';

export class RetryLine {
  constructor(scene) { this.s = scene; }

  /** Host and solo: call once the party has woken up after a wipe. */
  onWipe() {
    const s = this.s;
    if (s.mode === 'client') return;
    const p = [...(s.sim?.players.values() ?? [])].find((q) => q.character === RETRY_WHO);
    if (!p) return;
    const flags = s.save.flags, n = Number(flags['gag.retry.n'] || 0);
    flags['gag.retry.n'] = n + 1;
    const msg = { t: 'retry', a: p.id, i: Math.min(n, RETRY_LINES.length - 1) };
    if (s.mode === 'host') s.net.broadcast(msg);
    this._show(msg);
  }

  onClientMsg(msg) {
    if (msg?.t !== 'retry') return false;
    this._show(msg);
    return true;
  }

  _show(msg) {
    const s = this.s, line = RETRY_LINES[msg.i | 0];
    if (!line) return;
    const text = getLang() === 'es' ? line.es : line.en;
    // Just after the fade-in, so it lands on everyone waking up.
    s.time.delayedCall(900, () => {
      s._barkQuietUntil = 0;
      s._bark(msg.a, text);
      if (Settings.get('voice') > 0) speak(RETRY_WHO, text);
    });
  }
}
