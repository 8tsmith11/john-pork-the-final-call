// Guitar stands and dropped items (Michael's request).
//
// GUITAR STANDS. The two guitars start on stands in 631, not in anyone's bag: Trevor's electric in his
// room, Michael's acoustic at the foot of the bunk (map objects with `stand: <item id>`). E on a full
// stand takes the guitar; E on an empty stand puts one back (the stand's own guitar first, otherwise
// any guitar you carry). Anyone can take either one, so Michael can borrow Trevor's electric (he
// plays Twinkle Twinkle on it, src/audio/instruments.js), Trevor can borrow Michael's acoustic, and
// Manuel can take both. What each stand holds is the flag `stand.<object id>` (item id, or '' when
// empty), so it saves and reaches every screen with the other flags.
//
// DROPPING ITEMS. G drops one of the item in your hand (the selected hotbar slot), SHIFT+G the whole
// stack. In the inventory, G / SHIFT+G drop the slot under the mouse, and clicking outside the panel
// with a stack held drops that stack. Dropped items lie on the floor where you stood until someone
// picks them up with E, which is how you hand things to the other players. They live in
// save.world.drops ({ n, map, x, y, id, qty }, pixel coordinates), host-authoritative like the
// inventory; clients get the list in the world broadcast.
import { MAPS } from '../content/maps/index.js';
import { ITEMS } from '../content/items.js';
import * as Inv from '../engine/inventory.js';
import { TILE } from '../engine/sim.js';
import { sfx } from '../audio/audio.js';

const PICK_RANGE = 40;
const Name = (w) => w[0].toUpperCase() + w.slice(1);
const flagOf = (o) => `stand.${o.id}`;
const isGuitar = (id) => ITEMS[id]?.slot === 'instrument' && /guitar/.test(id);

// A line for taking a guitar, by who takes it and whose it is.
function takeLine(who, owner, def) {
  if (who === owner) return `You lift your ${def.name.toLowerCase()} off the stand.`;
  if (who === 'michael' && def.instrument === 'electric') return `Michael borrows ${Name(owner)}'s electric guitar. He knows one song on it, and it isn't rock.`;
  if (who === 'manuel') return `Manuel takes ${Name(owner)}'s ${def.name.toLowerCase()}. It will be out of tune in about a minute.`;
  return `You take ${Name(owner)}'s ${def.name.toLowerCase()} off the stand.`;
}

export class GuitarStands {
  constructor(scene) {
    this.s = scene;
    this.gfx = new Map();      // stand object id -> Graphics
    this.dropIms = new Map();  // drop n -> { im, sh }
    this._mapId = null;
    if (scene.mode !== 'client') this._initStands();
    const kb = scene.input.keyboard;
    kb.on('keydown-G', (ev) => this._dropKey(!!ev.shiftKey));
  }

  get flags() { return this.s.save.flags; }
  get drops() { return (this.s.save.world.drops ??= []); }

  // Host: what each stand holds, the first time this world sees the stands. Old saves already gave
  // Trevor and Michael their guitars at the start (act1.romance.starterGuitars), so their stands
  // start empty and the guitars stay in the bags; new worlds start with both guitars on the stands.
  _initStands() {
    const f = this.flags, oldSave = !!f['act1.romance.starterGuitars'];
    for (const m of Object.values(MAPS)) for (const o of m.objects) {
      if (!o.stand || f[flagOf(o)] !== undefined) continue;
      f[flagOf(o)] = oldSave ? '' : o.stand;
    }
    f['act1.romance.starterGuitars'] = true;
  }

  _tell(playerId, text, itemIcons) {
    const s = this.s;
    if (playerId === s.localId) s._say(text, undefined, itemIcons);
    else s.net?.send?.(playerId, { t: 'say', text, itemIcons });
  }
  _toastTo(playerId, text) {
    const s = this.s;
    if (playerId === s.localId) s._toast(text);
    else s.net?.send?.(playerId, { t: 'say', text });
  }

  // Host: if `who` was playing an instrument they no longer carry, the music stops.
  _stopIfGone(who) {
    const s = this.s, c = s.save.party[who];
    for (const p of s.sim?.players.values() ?? []) {
      if (p.character !== who || !p.playing) continue;
      const still = c.inventory.some((x) => x && ITEMS[x.id]?.slot === 'instrument' && ITEMS[x.id].instrument === p.playing.instrument);
      if (!still) s.sim.setPlaying(p.id, null);
    }
  }

  // ---- interaction (every screen) -------------------------------------------------------------
  /** Interaction hook for stands and dropped items. Returns true if it handled `near`. */
  interact(near) {
    const s = this.s;
    if (near.stand) {
      if (s.mode === 'client') s.net.send({ t: 'stand', id: near.id });
      else this.useStand(s.character, s.localId, near.id);
      return true;
    }
    if (near.dropN != null) {
      if (s.mode === 'client') s.net.send({ t: 'pickup', n: near.dropN });
      else this.pickup(s.character, s.localId, near.dropN);
      return true;
    }
    return false;
  }

  onHostMsg(peer, msg) {
    const who = this.s._charOf(peer);
    if (msg.t === 'stand') { if (who) this.useStand(who, peer, msg.id); return true; }
    if (msg.t === 'drop') { if (who) this.dropSlot(who, peer, msg.slot | 0, msg.all ? Infinity : 1); return true; }
    if (msg.t === 'pickup') { if (who) this.pickup(who, peer, msg.n | 0); return true; }
    return false;
  }

  // ---- stands (host) --------------------------------------------------------------------------
  useStand(who, playerId, standId) {
    const s = this.s, o = s.map.objects.find((x) => x.id === standId && x.stand), c = s.save.party[who];
    if (!o || !c) return;
    const p = s.sim.players.get(playerId);
    if (p && Math.hypot(o.x * TILE + 8 - p.x, o.y * TILE + 8 - p.y) > PICK_RANGE) return;
    const f = this.flags, held = f[flagOf(o)];
    if (held) {
      if (Inv.add(c, held) > 0) return this._tell(playerId, 'Your bag is full. Make room first.');
      f[flagOf(o)] = '';
      sfx('pickup');
      this._tell(playerId, `${takeLine(who, o.owner, ITEMS[held])}\n\n(In your bag: put it on the hotbar and use it to play. E on an empty stand puts it back.)`, [held]);
      s._syncParty();
      return;
    }
    // Empty: put a guitar back, the stand's own one first.
    const back = Inv.count(c, o.stand) > 0 ? o.stand : c.inventory.find((x) => x && isGuitar(x.id))?.id;
    if (!back) return this._tell(playerId, `${o.text}\n\nThe stand is empty. ${o.owner === who ? 'Somebody has your guitar.' : `Somebody has ${Name(o.owner)}'s guitar.`}`);
    Inv.remove(c, back, 1);
    f[flagOf(o)] = back;
    this._stopIfGone(who);
    sfx('pickup');
    this._toastTo(playerId, `You set the ${ITEMS[back].name.toLowerCase()} on ${Name(o.owner)}'s stand.`);
    s._syncParty();
  }

  // ---- drops (host) ---------------------------------------------------------------------------
  /** Drop `n` (Infinity = the whole stack) from bag slot `slot` at the player's feet. */
  dropSlot(who, playerId, slot, n = 1) {
    const s = this.s, c = s.save.party[who], it = c?.inventory[slot], p = s.sim.players.get(playerId);
    if (!it || !p) return;
    const def = ITEMS[it.id];
    if (!def) return;
    if (def.slot === 'key') return this._toastTo(playerId, `You hang on to the ${def.name.toLowerCase()}.`);
    const qty = Math.min(it.qty, n), id = it.id;
    Inv.takeSlot(c, slot, qty);
    // A weapon or gun you no longer carry isn't in your hands any more.
    for (const sl of ['weapon', 'ranged']) if (c.equipped?.[sl] === id && Inv.count(c, id) === 0) c.equipped[sl] = null;
    this._stopIfGone(who);
    // Stack onto a drop of the same thing right here, otherwise a new one at your feet.
    const here = this.drops.find((d) => d.map === s.map.id && d.id === id && Math.hypot(d.x - p.x, d.y - p.y) < 10 && d.qty + qty <= Inv.stackOf(id));
    if (here) here.qty += qty;
    else {
      const w = s.save.world; w.dropSeq = (w.dropSeq ?? 0) + 1;
      this.drops.push({ n: w.dropSeq, map: s.map.id, x: Math.round(p.x + (Math.random() * 2 - 1) * 5), y: Math.round(p.y + 4 + Math.random() * 3), id, qty });
    }
    sfx('swing');
    this._toastTo(playerId, `Dropped: ${def.name}${qty > 1 ? ' ×' + qty : ''}`);
    s._syncParty();
  }

  pickup(who, playerId, n) {
    const s = this.s, c = s.save.party[who], i = this.drops.findIndex((d) => d.n === n), d = this.drops[i], p = s.sim.players.get(playerId);
    if (!d || !c || !p || d.map !== s.map.id) return;
    if (Math.hypot(d.x - p.x, d.y - p.y) > PICK_RANGE) return;
    const left = Inv.add(c, d.id, d.qty), got = d.qty - left;
    if (!got) return this._toastTo(playerId, 'Your bag is full.');
    if (left) d.qty = left; else this.drops.splice(i, 1);
    sfx('pickup');
    this._tell(playerId, `Picked up: ${ITEMS[d.id]?.name ?? d.id}${got > 1 ? ' ×' + got : ''}${left ? ' (bag full)' : ''}`, [d.id]);
    s._syncParty();
  }

  // ---- input (every screen) -------------------------------------------------------------------
  _dropKey(all) {
    const s = this.s; if (s.dlg) return;
    const c = s.save.party[s.character]; if (!c) return;
    let slot;
    if (s.menu === 'inventory') {
      const m = s.gameMenu;
      slot = m.held ?? m.hover?.i;
      if (m.held != null) { all = !m.heldHalf || all; m.held = null; m.heldHalf = false; }
    } else if (!s.menu) slot = c.hotSel ?? 0;
    if (slot == null || !c.inventory[slot]) return;
    this.drop(slot, all);
  }
  /** Local player drops from bag slot `slot` (one, or the whole stack). */
  drop(slot, all = false) {
    const s = this.s;
    if (s.mode === 'client') s.net.send({ t: 'drop', slot, all });
    else this.dropSlot(s.character, s.localId, slot, all ? Infinity : 1);
    s._hotFlash = slot < 9 ? { i: slot, at: s.time.now } : s._hotFlash;
  }

  // ---- every frame ----------------------------------------------------------------------------
  update() {
    const s = this.s, map = s.map; if (!map) return;
    if (map.id !== this._mapId) this._onMap();
    // stands: label and drawing follow what's on them
    for (const o of map.objects) {
      if (!o.stand) continue;
      const held = this.flags[flagOf(o)] ?? o.stand;
      o.label = held ? `${Name(o.owner)}'s guitar stand (take the ${ITEMS[held].name.toLowerCase()})` : `${Name(o.owner)}'s guitar stand (empty)`;
      this._drawStand(o, held);
    }
    // drops: keep pick-up objects in the map list for the E prompt, and their icons on the floor
    const here = this.drops.filter((d) => d.map === map.id), want = new Set(here.map((d) => d.n));
    for (let k = map.objects.length - 1; k >= 0; k--) { const o = map.objects[k]; if (o.dropN != null && !want.has(o.dropN)) map.objects.splice(k, 1); }
    const bob = Math.sin(s.time.now / 300) * 1;
    for (const d of here) {
      const def = ITEMS[d.id], label = `Pick up ${def?.name ?? d.id}${d.qty > 1 ? ' ×' + d.qty : ''}`;
      let o = map.objects.find((x) => x.dropN === d.n);
      if (!o) { o = { id: `drop.${d.n}`, dropN: d.n, selfDrawn: true, floor: true }; map.objects.push(o); }
      Object.assign(o, { x: (d.x - 8) / TILE, y: (d.y - 8) / TILE, label });
      let v = this.dropIms.get(d.n);
      if (!v) {
        const tex = s.textures.exists('icons') ? s.textures.get('icons') : null;
        const sh = s.add.ellipse(d.x, d.y + 4, 10, 3, 0x000000, 0.4).setDepth(2);
        const im = tex ? s.add.image(d.x, d.y, 'icons', tex.has(d.id) ? d.id : 'generic') : s.add.rectangle(d.x, d.y, 8, 8, 0xffb347);
        im.setDepth(d.y + 2);
        v = { im, sh }; this.dropIms.set(d.n, v);
      }
      v.im.setPosition(d.x, Math.round(d.y - 3 + bob));
    }
    for (const [n, v] of this.dropIms) if (!want.has(n)) { v.im.destroy(); v.sh.destroy(); this.dropIms.delete(n); }
  }

  _onMap() {
    this._mapId = this.s.map.id;
    for (const g of this.gfx.values()) g.destroy(); this.gfx.clear();
    for (const v of this.dropIms.values()) { v.im.destroy(); v.sh.destroy(); } this.dropIms.clear();
  }

  // A little A-frame stand, with the guitar on it when it's full (sunburst electric, spruce acoustic).
  _drawStand(o, held) {
    const s = this.s;
    let g = this.gfx.get(o.id);
    if (g && g._held === held) return;
    if (!g) { g = s.add.graphics().setDepth(o.y * TILE + TILE - 4); this.gfx.set(o.id, g); }
    g._held = held; g.clear();
    const x = o.x * TILE, y = o.y * TILE, cx = x + 8, base = y + TILE;
    g.fillStyle(0x000000, 0.4).fillEllipse(cx + 1, base - 1, 12, 3);
    // legs and neck rest
    g.lineStyle(1, 0x2b2b33, 1).lineBetween(cx - 4, base - 1, cx, base - 9).lineBetween(cx + 4, base - 1, cx, base - 9).lineBetween(cx, base - 9, cx, base - 20);
    g.lineBetween(cx - 2, base - 20, cx + 2, base - 20);
    g.fillStyle(0x3a3a46, 1).fillRect(cx - 4, base - 6, 8, 1);   // the cradle the body sits in
    if (!held) return;
    const electric = ITEMS[held]?.instrument === 'electric';
    const body = electric ? 0xd2611c : 0xd9b27a, edge = electric ? 0x5a1d08 : 0x7a5530;
    // neck + headstock leaning on the rest
    g.fillStyle(0x6b4423, 1).fillRect(cx - 1, base - 22, 2, 13);
    g.fillStyle(0x2b2b33, 1).fillRect(cx - 1.5, base - 24, 3, 3);
    // body: two lobes
    g.fillStyle(edge, 1).fillEllipse(cx, base - 6, 10, 8).fillEllipse(cx, base - 10, 8, 6);
    g.fillStyle(body, 1).fillEllipse(cx, base - 6, 9, 7).fillEllipse(cx, base - 10, 7, 5);
    if (electric) { g.fillStyle(0xf2c14e, 1).fillEllipse(cx, base - 7, 4, 3); g.fillStyle(0xeeeeee, 1).fillRect(cx - 2, base - 9, 4, 1).fillRect(cx - 2, base - 6, 4, 1); }
    else { g.fillStyle(0x2a1a0e, 1).fillCircle(cx, base - 9, 1.5); g.fillStyle(0x3a2412, 1).fillRect(cx - 2, base - 5, 4, 1); }
  }

  destroy() { this._onMap(); }
}
