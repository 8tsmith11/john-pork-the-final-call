// Romance at runtime (D-014). Content and numbers: src/content/romance.js.
//   - Places Trevor's and Manuel's dates on their maps, and runs each date when her roommate talks
//     to her (the scene plays on everyone's screen through scene.shared).
//   - Counts date two's kills (on the host, which sees every sim event once), and watches for date
//     four's song (on the roommate's own screen).
//   - Once she's with the party she walks beside her roommate, and the host gives every player near
//     her the buff.
//   - Manuelita joins when the story sets REUNITED_FLAG; her reunion plays once, shared.
//   - The guitars start on their stands in 631, not in anyone's bag (src/game/guitarStands.js).
// Debug: ?romance=debug reunites Manuelita and hands every roommate flowers, chocolates and a guitar.
import * as W from '../engine/wallet.js';
import { MAPS } from '../content/maps/index.js';
import { ITEMS, SHOPS, playerMods, heldWeapon } from '../content/items.js';
import * as Inv from '../engine/inventory.js';
import { isAi } from '../engine/companion.js';
import { TILE } from '../engine/sim.js';
import { audioOut } from '../audio/audio.js';
import { PARTNERS, REUNITED_FLAG, STAGE, FIGHT_KILLS, SONG_SECONDS, SONG_RANGE, flagOf, stageOf, together, ended, partnerView } from '../content/romance.js';

// Put the dates on their maps (once per page load).
for (const [id, P] of Object.entries(PARTNERS)) {
  const m = P.place && MAPS[P.place.map];
  if (m && !m.objects.some((o) => o.romance === id)) {
    m.objects.push({ id: `npc.${id}`, x: P.place.x, y: P.place.y, label: P.name, npc: true, romance: id, goneFlag: flagOf(id, 'gone') });
  }
}

const NOT_YOURS = {
  brooke: { michael: '"You\'re sweet. I\'m waiting on the tall one who talks about bearings."', manuel: '"No. But tell your friend his posture is very good."' },
  ines: { michael: '"You\'re the one with the girlfriend. Go call her."', trevor: '"I\'m waiting for the one who noticed my roofline."' },
};

export class Romance {
  constructor(scene) {
    this.s = scene;
    this.followers = new Map();   // partner id -> { x, y, im }
    this.spots = new Map();       // partner id -> image at her map spot
    this.songT = 0;
    this._applied = new Map();    // host: player id -> aura key last applied
    if (scene.mode !== 'client') {
      this._debug();
      scene.time.addEvent({ delay: 500, loop: true, callback: () => this._aura() });
      if (scene.mode === 'host') scene.time.addEvent({ delay: 2000, loop: true, callback: () => this._broadcastFlags() });
    }
  }

  get flags() { return this.s.save.flags; }

  _debug() {
    const q = new URLSearchParams(globalThis.location?.search ?? '').get('romance');
    if (q !== 'debug') return;
    const s = this.s;
    this.flags[REUNITED_FLAG] = true;
    for (const c of Object.values(s.save.party)) for (const id of ['item.flowers', 'item.chocolates', 'item.guitar_acoustic']) if (!Inv.has(c, id)) Inv.add(c, id, id === 'item.guitar_acoustic' ? 1 : 2);
    s._syncParty?.();
    globalThis.__romance = this;
  }

  // ---- talking to her ----------------------------------------------------------------------
  /** Interaction hook. Returns true if it handled `near`. */
  interact(near) {
    const id = near.romance, P = id && PARTNERS[id];
    if (!P) return false;
    const s = this.s, f = this.flags, me = s.character;
    if (f[flagOf(id, 'gone')]) { s._say(`${partnerView(f, id).name} is with you now.`); return true; }
    if (me !== P.for) {
      // Nobody plays her roommate: he steps up and courts her himself, and you watch (Trevor).
      if (s.mode !== 'client' && s.actsFor?.(P.for)) return this._aiCourt(id, P);
      s._say(`${P.name.toUpperCase()}\n${NOT_YOURS[id]?.[me] ?? '"I\'m waiting for someone."'}`); return true;
    }
    const stage = stageOf(f, id), c = s.save.party[me];
    let node;
    if (stage === STAGE.MEET) node = 'meet';
    else if (stage === STAGE.FLOWERS) node = this._take(c, 'item.flowers') ? 'flowers' : 'wait_flowers';
    else if (stage === STAGE.FIGHT) node = Number(f[flagOf(id, 'kills')] ?? 0) >= FIGHT_KILLS ? 'fight_done' : 'wait_fight';
    else if (stage === STAGE.CHOCOLATES) node = this._take(c, 'item.chocolates') ? 'chocolates' : 'wait_chocolates';
    else node = 'wait_song';
    s.shared.start(P.scene, node);
    return true;
  }

  // An AI-controlled roommate courts his date himself: his own items (he buys flowers or chocolates
  // from the shared wallet if he has none), his own song, his own choices. The scene is spoken as him.
  _aiCourt(id, P) {
    const s = this.s, f = this.flags, who = P.for, Who = who[0].toUpperCase() + who.slice(1), c = s.save.party[who];
    const stage = stageOf(f, id);
    const get = (item) => {
      if (Inv.has(c, item)) return true;
      const st = Object.values(SHOPS).flatMap((sh) => sh.stock).find((x) => x.item === item); if (!st) return false;
      const price = s.priceFor ? s.priceFor(who, st.price) : st.price;
      if (W.money(s.save, who) < price) { s._say(`${Who}: "I need ${ITEMS[item].name.toLowerCase()} first, and we're broke."`); return false; }
      W.addMoney(s.save, who, -price); Inv.add(c, item); s._syncParty(); s._toast(`${Who} buys ${ITEMS[item].name.toLowerCase()} (-$${price})`);
      return true;
    };
    const run = (node, onDone) => {
      s._speakerOverride = who; s._aiDecider = who;
      s.shared.start(P.scene, node, () => { s._speakerOverride = null; s._aiDecider = null; onDone?.(); });
    };
    if (stage === STAGE.SONG) {
      if (P.place?.map !== s.map.id) return s._say(`${Who} wants to play for her where they met.`), true;
      s._toast(`${Who} plays for ${P.name}…`);
      this.s.time.delayedCall(SONG_SECONDS * 1000, () => run('finale', () => { s._flag(flagOf(id, 'gone'), true); if (!ended(this.flags, id)) s._toast(`♥ ${partnerView(this.flags, id).name} walks with ${Who} now.`); }));
      return true;
    }
    let node;
    if (stage === STAGE.MEET) node = 'meet';
    else if (stage === STAGE.FLOWERS) node = get('item.flowers') && this._take(c, 'item.flowers') ? 'flowers' : 'wait_flowers';
    else if (stage === STAGE.FIGHT) node = Number(f[flagOf(id, 'kills')] ?? 0) >= FIGHT_KILLS ? 'fight_done' : 'wait_fight';
    else if (stage === STAGE.CHOCOLATES) node = get('item.chocolates') && this._take(c, 'item.chocolates') ? 'chocolates' : 'wait_chocolates';
    else node = 'wait_song';
    run(node);
    return true;
  }

  _take(c, itemId) {
    const s = this.s;
    if (!Inv.has(c, itemId)) return false;
    if (s.mode === 'client') { s.net.send({ t: 'romanceTake', item: itemId }); Inv.remove(c, itemId); }
    else { Inv.remove(c, itemId); s._syncParty(); }
    return true;
  }

  onHostMsg(peer, msg) {
    if (msg.t !== 'romanceTake') return false;
    const c = this.s.save.party[this.s._charOf(peer)];
    if (c && ITEMS[msg.item]?.slot === 'gift') { Inv.remove(c, msg.item); this.s._syncParty(); }
    return true;
  }

  onClientMsg(msg) {
    if (msg.t !== 'romance') return false;
    Object.assign(this.flags, msg.flags);
    return true;
  }

  _broadcastFlags() {
    const flags = Object.fromEntries(Object.entries(this.flags).filter(([k]) => k.startsWith('act1.romance.')));
    this.s.net.broadcast({ t: 'romance', flags });
  }

  /** Host: date two counts kills by her roommate (any player id playing that character). */
  onEvent(ev, snap) {
    const s = this.s;
    if (s.mode === 'client' || ev.t !== 'kill' || !ev.by) return;
    const killer = snap.players.find((p) => p.id === ev.by);
    for (const [id, P] of Object.entries(PARTNERS)) {
      if (!P.courted || !killer || killer.c !== P.for || stageOf(this.flags, id) !== STAGE.FIGHT) continue;
      const k = flagOf(id, 'kills'), n = Number(this.flags[k] ?? 0) + 1;
      this.flags[k] = n;
      if (n === FIGHT_KILLS) s._announce?.(`${P.name} saw that. ${P.for[0].toUpperCase() + P.for.slice(1)}, go back to her.`);
    }
  }

  // ---- every frame -------------------------------------------------------------------------
  update(snap, dt) {
    const s = this.s, f = this.flags;
    if (snap.map !== this._mapId) { this._mapId = snap.map; this.onMap(); }
    const anim = Math.floor(s.time.now / 600) % 2 ? '#1' : '';
    const tex = s.textures.exists('romance') ? s.textures.get('romance') : null;
    const frame = (art) => (tex?.has(art + anim) ? art + anim : art);

    for (const [id, P] of Object.entries(PARTNERS)) {
      const view = partnerView(f, id);
      const form = f[flagOf(id, 'form')] ?? null;
      if ((this._forms ??= {})[id] !== undefined && this._forms[id] !== form && form === P.formFx) this._formFx();
      this._forms[id] = form;
      // At her spot on the map, until she's with the party.
      if (P.place && !together(f, id) && !ended(f, id) && P.place.map === s.map.id && tex) {
        let im = this.spots.get(id);
        if (!im) { im = s.add.image(P.place.x * TILE, P.place.y * TILE + TILE, 'romance', frame(view.art)).setOrigin(0, 1).setDepth(P.place.y * TILE + TILE - 4); this.spots.set(id, im); }
        im.setFrame(frame(view.art));
        const o = s.map.objects.find((x) => x.romance === id); if (o) o.label = view.name;
      } else if (this.spots.has(id)) { this.spots.get(id).destroy(); this.spots.delete(id); }

      // Walking with the party.
      const owner = together(f, id) && snap.players.find((p) => p.c === P.for && !p.dn) || together(f, id) && snap.players.find((p) => p.c === P.for);
      let fw = this.followers.get(id);
      if (!owner || !tex) { if (fw) { fw.im.destroy(); fw.tag.destroy(); this.followers.delete(id); } continue; }
      if (!fw) {
        fw = { x: owner.x - 14, y: owner.y + 2, im: s.add.image(0, 0, 'romance', frame(view.art)).setOrigin(0.5, 1),
          tag: s.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '6px', color: '#f2a6b8' }).setOrigin(0.5, 0).setDepth(6300) };
        this.followers.set(id, fw);
      }
      const side = ({ manuelita: -14, brooke: 14, ines: -14 })[id] ?? -14;
      const tx = owner.x + side, ty = owner.y + 3, d = Math.hypot(tx - fw.x, ty - fw.y);
      if (d > 220) { fw.x = tx; fw.y = ty; } else if (d > 6) { const k = Math.min(1, dt * 3.2); fw.x += (tx - fw.x) * k; fw.y += (ty - fw.y) * k; }
      fw.im.setFrame(frame(view.art)).setPosition(Math.round(fw.x), Math.round(fw.y) + 8).setDepth(fw.y + 8).setFlipX(owner.x < fw.x);
      fw.tag.setText(view.name).setPosition(Math.round(fw.x), Math.round(fw.y) + 9);
    }

    // (Active partner buffs are listed in the inventory panel: activeBuffs().)
    const me = snap.players.find((p) => p.id === s.localId);
    this._me = me;

    this._songDate(me, dt);
    this._reunion();
  }

  /** Partner buffs on the local player right now (shown in the inventory panel). */
  activeBuffs() { return this._me ? this._near(this._me) : []; }

  // The sound and shake for a sealed change of look (what it is: docs/sealed/roommate-surprises.md).
  _formFx() {
    const out = audioOut(); if (!out) return;
    const { ctx, dest } = out, t = ctx.currentTime, n = ctx.createBufferSource(), b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
    n.buffer = b; const g = ctx.createGain(); g.gain.value = 0.9; n.connect(g); g.connect(dest); n.start(t);
    const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    og.gain.setValueAtTime(0.4, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.15); o.connect(og); og.connect(dest); o.start(t); o.stop(t + 0.16);
    this.s.cameras.main.shake(120, 0.004);
  }

  _near(p) {
    const out = [];
    for (const [id, fw] of this.followers) { const v = partnerView(this.flags, id); if (Math.hypot(p.x - fw.x, p.y - fw.y) <= v.radius) out.push(v); }
    return out;
  }

  // Date four: her roommate plays to her, close by, for SONG_SECONDS. Checked on his own screen.
  _songDate(me, dt) {
    const s = this.s;
    if (!me || s.dlg) { this.songT = 0; return; }
    for (const [id, P] of Object.entries(PARTNERS)) {
      if (!P.courted || P.for !== s.character || stageOf(this.flags, id) !== STAGE.SONG || P.place?.map !== s.map.id) continue;
      const close = me.pl && Math.hypot(me.x - (P.place.x * TILE + 8), me.y - (P.place.y * TILE + 8)) <= SONG_RANGE;
      this.songT = close ? this.songT + dt : 0;
      if (this.songT >= SONG_SECONDS) {
        this.songT = 0;
        const stop = () => { if (s.mode === 'client') s.net.send({ t: 'play', id: this._playingItem() }); else s.sim.setPlaying(s.localId, null); };
        stop();
        s.shared.start(P.scene, 'finale', () => { s._flag(flagOf(id, 'gone'), true); if (!ended(this.flags, id)) s._toast(`♥ ${partnerView(this.flags, id).name} walks with ${P.for[0].toUpperCase() + P.for.slice(1)} now.`); });
      }
    }
  }

  _playingItem() {
    const c = this.s.save.party[this.s.character];
    return Inv.ids(c).find((i) => ITEMS[i]?.slot === 'instrument');
  }

  // Manuelita: once the story reunites her with Michael, her scene plays once, on Michael's screen
  // (or the host's, if nobody is playing Michael), shared with everyone.
  _reunion() {
    const s = this.s, f = this.flags;
    if (!f[REUNITED_FLAG] || f[flagOf('manuelita', 'met')] || s.dlg || this._reunionStarted) return;
    const humanMichael = s.mode === 'client' ? s.character === 'michael' : [...(s.sim?.players.values() ?? [])].some((p) => p.character === 'michael' && !String(p.id).startsWith('ai:'));
    const mine = s.character === 'michael' || (s.mode !== 'client' && !humanMichael);
    if (!mine) return;
    this._reunionStarted = true;
    s.shared.start('romance_manuelita', null, () => s._flag(flagOf('manuelita', 'met'), true));
  }

  // Host: every player near a partner gets her buff (gear/skill mods + aura).
  _aura() {
    const s = this.s, sim = s.sim;
    if (!sim) return;
    for (const p of sim.players.values()) {
      const near = this._near(p), key = near.map((v) => v.name).join('|');
      if (!key && !this._applied.get(p.id)) continue;
      const c = s.save.party[p.character];
      const mods = playerMods(c, p.character, heldWeapon(c, p.character, isAi(p.id)));
      for (const v of near) for (const [k, n] of Object.entries(v.buff)) mods[k] = (mods[k] ?? 0) + n;
      mods.armor = Math.min(0.6, mods.armor);
      sim.setMods(p.id, mods);
      this._applied.set(p.id, key);
    }
  }

  onMap() {
    for (const im of this.spots.values()) im.destroy();
    this.spots.clear();
  }
}
