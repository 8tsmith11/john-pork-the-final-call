// Instruments in play (D-014). The host's sim owns WHO is playing (sim.setPlaying); every client
// makes the sound itself from the snapshot, louder the closer it is. Michael's lullaby puts players
// and enemies to sleep in the sim (sim._stepLullaby); map NPCs fall asleep here, on each screen,
// by the same rule (in range LULLABY.expose seconds → asleep LULLABY.sleep seconds).
import { ITEMS } from '../content/items.js';
import * as Inv from '../engine/inventory.js';
import { LULLABY, TILE } from '../engine/sim.js';
import { startInstrument, songOf } from '../audio/instruments.js';
import { audioOut, sfx } from '../audio/audio.js';

export class Performances {
  constructor(scene) {
    this.s = scene;
    this.live = new Map();       // player id -> { perf, key }
    this.labels = new Map();     // id -> Phaser.Text
    this.npcSleep = new Map();   // map object id -> { exposed, until }
  }

  /** Local player used an instrument item (hotbar or inventory). */
  use(itemId) {
    const s = this.s;
    if (s.mode === 'client') s.net.send({ t: 'play', id: itemId });
    else this.toggle(s.localId, s.character, itemId);
  }

  /** Host: start or stop `playerId` playing `itemId`. */
  toggle(playerId, char, itemId) {
    const s = this.s, sim = s.sim, p = sim?.players.get(playerId), def = ITEMS[itemId];
    if (!p || def?.slot !== 'instrument') return;
    if (!Inv.has(s.save.party[char], itemId)) return;
    if (p.playing) { sim.setPlaying(playerId, null); return; }
    if (p.riding) { this._tell(playerId, 'Not while riding.'); return; }
    sim.setPlaying(playerId, songOf(char), def.instrument);
    this._tell(playerId, `♪ ${def.name}: use it again to stop.`);
  }

  _tell(playerId, text) {
    const s = this.s;
    if (playerId === s.localId) s._toast(text);
    else s.net?.send?.(playerId, { t: 'say', text });
  }

  onHostMsg(peer, msg) {
    if (msg.t === 'potion') { this._throw(peer, this.s._charOf(peer), msg.id); return true; }
    if (msg.t !== 'play') return false;
    this.toggle(peer, this.s._charOf(peer), msg.id);
    return true;
  }

  // (Sleep toasts come from the snapshot's zz flag, which clients always see, rather than from
  // sim events, which a client can miss or see twice.)
  _sleepToast(me) {
    if (!me || !!me.zz === !!this._wasAsleep) return;
    this._wasAsleep = !!me.zz;
    this.s._toast(me.zz ? 'Zzz… you fell asleep.' : 'You wake up.');
  }

  // Mate caffeine, from the snapshot's mt (seconds left) and cr (crashing) flags, like the sleep toast.
  _mateToast(me) {
    if (!me) return;
    const st = me.mt > 0 ? 'up' : me.cr ? 'crash' : 'off', was = this._mateState ?? 'off';
    if (st === was) return;
    this._mateState = st;
    if (st === 'up') this.s._toast(`Caffeine kicks in. Faster, and stamina comes back quicker (${me.mt}s).`);
    else if (st === 'crash') this.s._toast('Mate crash. Your legs feel like wet clay (slower for a few seconds).');
    else if (was === 'crash') this.s._toast('The crash wears off.');
  }

  /** Local player threw a sleeping potion (hotbar or inventory). The host consumes it and splashes. */
  throwPotion(itemId) {
    const s = this.s;
    if (s.mode === 'client') { s.net.send({ t: 'potion', id: itemId }); return; }
    this._throw(s.localId, s.character, itemId);
  }
  _throw(playerId, char, itemId) {
    const s = this.s, c = s.save.party[char];
    if (!Inv.has(c, itemId)) return;
    if (!s.sim.throwPotion(playerId)) return;
    Inv.remove(c, itemId); s._syncParty();
  }
  /** Every screen: the splash, a glass smash, and NPCs in it fall asleep. */
  onEvent(ev) {
    if (ev.t !== 'potion') return;
    const s = this.s, key = `${ev.id}:${ev.x}:${ev.y}`;
    if (this._lastPotion === key && s.time.now - this._lastPotionAt < 500) return;
    this._lastPotion = key; this._lastPotionAt = s.time.now;
    for (const o of s.map.objects) if (o.npc && Math.hypot(o.x * TILE + 8 - ev.x, o.y * TILE + 8 - ev.y) <= ev.r) this.npcSleep.set(o.id, { exposed: 0, until: s.time.now + LULLABY.sleep * 1000, refresh: 0 });
    const g = s.add.graphics().setDepth(5003);
    const drops = Array.from({ length: 18 }, () => [Math.random() * Math.PI * 2, 0.4 + Math.random() * 0.6]);
    s.tweens.addCounter({ from: 0, to: 1, duration: 700, onUpdate: (tw) => {
      const k = tw.getValue(); g.clear();
      g.fillStyle(0x4f7fd0, 0.25 * (1 - k)).fillCircle(ev.x, ev.y, ev.r * k);
      for (const [a, f] of drops) g.fillStyle(0x3fd0d6, 1 - k).fillRect(ev.x + Math.cos(a) * ev.r * f * k, ev.y + Math.sin(a) * ev.r * f * k * 0.7, 2, 2);
    }, onComplete: () => g.destroy() });
    sfx('hit');
  }

  /** True if a map NPC is asleep on this screen (talking to them just shows that). */
  asleep(obj) { return (this.npcSleep.get(obj.id)?.until ?? 0) > this.s.time.now; }

  update(snap, dt) {
    const s = this.s, now = s.time.now;
    const me = snap.players.find((p) => p.id === s.localId) ?? snap.players[0];
    if (snap.map !== this._mapId) { this._mapId = snap.map; this.onMap(); }
    this._sleepToast(snap.players.find((p) => p.id === s.localId));
    this._mateToast(snap.players.find((p) => p.id === s.localId));
    // --- sound ---
    const seen = new Set();
    for (const p of snap.players) {
      if (!p.pl || p.dn) continue;
      const key = `${p.c}:${p.in}`;
      seen.add(p.id);
      let cur = this.live.get(p.id);
      if (cur && cur.key !== key) { cur.perf?.stop(); this.live.delete(p.id); cur = null; }
      if (!cur) {
        const out = audioOut();
        cur = { key, perf: out ? startInstrument(out.ctx, out.dest, { who: p.c, instrument: p.in, volume: 0 }) : null };
        this.live.set(p.id, cur);
      }
      const d = me ? Math.hypot(p.x - me.x, p.y - me.y) : 0;
      cur.perf?.setVolume(d <= 80 ? 1.6 : Math.max(0.15, 1.6 * (1 - (d - 80) / 340)));
    }
    for (const [id, cur] of this.live) if (!seen.has(id)) { cur.perf?.stop(); this.live.delete(id); }
    // Hold-Music Moths hum the lullaby too: the nearest one, quiet, louder as you close in.
    const moth = me && (snap.enemies ?? []).filter((e) => e.sg).map((e) => [e, Math.hypot(e.x - me.x, e.y - me.y)]).sort((a, b) => a[1] - b[1])[0];
    if (moth && moth[1] < 220) {
      if (!this.mothPerf) { const out = audioOut(); this.mothPerf = out ? startInstrument(out.ctx, out.dest, { who: 'moth', instrument: 'electric', volume: 0 }) : null; }
      this.mothPerf?.setVolume(Math.max(0.1, 1.1 * (1 - moth[1] / 220)));
    } else if (this.mothPerf) { this.mothPerf.stop(); this.mothPerf = null; }

    // --- map NPCs fall asleep to the lullaby ---
    const singers = snap.players.filter((p) => p.pl === 'lullaby' && !p.dn);
    for (const o of s.map.objects) {
      if (!o.npc) continue;
      const st = this.npcSleep.get(o.id) ?? { exposed: 0, until: 0, refresh: 0 };
      const ox = o.x * TILE + 8, oy = o.y * TILE + 8;
      const near = singers.some((p) => Math.hypot(p.x - ox, p.y - oy) <= LULLABY.range);   // Michael's 8 tiles
      if (st.until > now) {   // asleep: the timer resets every second while the lullaby is still in range
        st.refresh = near ? st.refresh + dt : 0;
        if (st.refresh >= 1) { st.refresh = 0; st.until = now + LULLABY.sleep * 1000; }
        this.npcSleep.set(o.id, st); continue;
      }
      st.exposed = near ? st.exposed + dt : 0;
      if (st.exposed >= LULLABY.expose) { st.exposed = 0; st.until = now + LULLABY.sleep * 1000; }
      this.npcSleep.set(o.id, st);
    }

    // --- ♪ over players who are playing, Zz over anyone asleep ---
    const want = new Map();
    const bob = Math.sin(now / 220) * 1.5;
    for (const p of snap.players) {
      if (p.zz) want.set(p.id, ['z Z', p.x, p.y - 30 + bob, '#9aa3c7']);
      else if (p.mt > 0) want.set(p.id, [`MATE ${p.mt}`, p.x, p.y - 30 + bob, '#c8e619']);
      else if (p.cr) want.set(p.id, ['crash…', p.x, p.y - 30 + bob, '#8a8f7a']);
      else if (p.pl) want.set(p.id, [p.pl === 'lullaby' ? '♪ ♫' : '♫ ♪', p.x, p.y - 30 + bob, p.c === 'manuel' ? '#c8e619' : '#ffb347']);
    }
    for (const e of snap.enemies ?? []) if (e.zz) want.set(`e:${e.id}`, ['z Z', e.x, e.y - 18 + bob, '#9aa3c7']); else if (e.sg) want.set(`e:${e.id}`, ['♪', e.x + 6, e.y - 16 + bob, '#c8c2e8']);
    for (const o of s.map.objects) if (o.npc && this.asleep(o)) want.set(`o:${o.id}`, ['z Z', o.x * TILE + 8, o.y * TILE - 8 + bob, '#9aa3c7']);
    for (const [id, [text, x, y, color]] of want) {
      let t = this.labels.get(id);
      if (!t) { t = s.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '8px' }).setOrigin(0.5, 1).setDepth(6400); this.labels.set(id, t); }
      t.setText(text).setColor(color).setPosition(Math.round(x), Math.round(y)).setVisible(true);
    }
    for (const [id, t] of this.labels) if (!want.has(id)) { t.destroy(); this.labels.delete(id); }
  }

  /** New map: NPC sleep is per map. */
  onMap() { this.npcSleep.clear(); for (const t of this.labels.values()) t.destroy(); this.labels.clear(); }

  destroy() { for (const cur of this.live.values()) cur.perf?.stop(); this.live.clear(); this.mothPerf?.stop(); }
}
