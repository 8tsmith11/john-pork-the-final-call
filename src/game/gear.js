// Gear at runtime (D-014): the master armorer, Michael's winged boots (blink + fire trail + fast
// travel), and gear upgrades. Item data: src/content/items.js (slots, uniques, upgradeCost).
//
//   [B] tap   → blink (sim.blink): an instant dash that leaves a line of fire where you left, along the
//               way, and where you land. Needs boots with `blink` (Michael's winged boots).
//   [B] hold  → charge for a second, then the fast-travel menu (any area the party has visited).
//
// Debug: ?gear=debug gives every roommate a set of ordinary gear and Michael his four unique items
// (they're not obtainable in play before late Act 2).
import * as W from '../engine/wallet.js';
import { MAPS } from '../content/maps/index.js';
import { ITEMS, MAX_UPGRADE, upgradeCost, playerMods, canWear } from '../content/items.js';
import * as Inv from '../engine/inventory.js';
import { TILE } from '../engine/sim.js';
import { sfx } from '../audio/audio.js';

const TAP_MS = 250, CHARGE_MS = 1000, TRAIL_S = 1.8;

// The armorer works out of College Park, on the Route 1 side by the kiosks.
const ARMORER = { id: 'npc.armorer', x: 76, y: 20, label: 'Ottoline, master armorer', npc: true, armorer: true, selfDrawn: true };
if (MAPS.metro_plaza && !MAPS.metro_plaza.objects.some((o) => o.id === ARMORER.id)) MAPS.metro_plaza.objects.push({ ...ARMORER });

export class Gear {
  constructor(scene) {
    this.s = scene;
    this.trails = [];
    this.fx = scene.add.graphics().setDepth(5002);
    this.charge = scene.add.graphics().setDepth(6450);
    this.bDown = null;
    const kb = scene.input.keyboard;
    kb.on('keydown-B', () => { if (this.bDown == null && !scene.dlg && !scene.menu) this.bDown = scene.time.now; });
    kb.on('keyup-B', () => {
      const t = this.bDown; this.bDown = null; this.charge.clear();
      if (t != null && scene.time.now - t < TAP_MS) this.blink();
    });
    kb.on('keydown', (ev) => {   // number keys pick a fast-travel destination
      if (scene.menu !== 'travel') return;
      const n = parseInt(ev.key, 10), dest = scene.gameMenu?._travelKeys?.[n - 1];
      if (dest) { this.travel(dest); scene._closeMenu(); }
    });
    if (scene.mode !== 'client') this._debug();
  }

  get myMods() { const s = this.s; return playerMods(s.save.party[s.character], s.character); }

  _debug() {
    if (new URLSearchParams(globalThis.location?.search ?? '').get('gear') !== 'debug') return;
    const s = this.s, ordinary = ['item.bike_helmet', 'item.work_pants', 'item.sneakers', 'item.welding_goggles', 'item.rain_parka', 'item.work_gloves', 'item.wool_socks', 'item.pack_coolant', 'item.mesh_vest'];
    for (const [who, c] of Object.entries(s.save.party)) {
      for (const id of ordinary) if (!Inv.has(c, id)) Inv.add(c, id);
      for (const [id, def] of Object.entries(ITEMS)) if (def.unique && def.owner === who && !Inv.has(c, id)) { Inv.add(c, id); if (!Inv.wear(c, id)) c.equipped[def.slot] = id; }
      for (const m of ['item.mat_scrap', 'item.mat_circuit']) Inv.add(c, m, 20);
    }
    for (const w of Object.keys(s.save.party)) s.save.party[w].money = Math.max(s.save.party[w].money ?? 0, 500);
    s._syncParty?.();
    globalThis.__gear = this;
  }

  // ---- the master armorer --------------------------------------------------------------------
  interact(near) {
    if (!near.armorer) return false;
    this.s.gameMenu.show('armorer');
    return true;
  }

  menuUpgrade(id) {
    const s = this.s;
    if (s.mode === 'client') s.net.send({ t: 'upgrade', id }); else this.upgrade(s.character, id);
  }

  /** Host: one level on an item `who` is wearing. Money from the party wallet, materials from them. */
  upgrade(who, id) {
    const s = this.s, c = s.save.party[who], def = ITEMS[id];
    if (!c || !def || !Object.values(c.equipped).includes(id) || !canWear(def, who)) return;
    const lvl = (c.upgrades ??= {})[id] ?? 0;
    if (lvl >= MAX_UPGRADE) return;
    const cost = upgradeCost(lvl);
    if (W.money(s.save, who) < cost.money) return s._announce('Ottoline: "Money first."');
    if (!Inv.pay(c, cost.mats)) return s._announce('Ottoline: "Bring me the scrap and I\'ll do it."');
    W.addMoney(s.save, who, -cost.money);
    c.upgrades[id] = lvl + 1;
    sfx('hit');
    s._announce(`Ottoline works it over on the anvil. ${def.name} is +${lvl + 1} now.`);
    s._syncParty();
  }

  // ---- winged boots ----------------------------------------------------------------------------
  blink() {
    const s = this.s;
    if (!this.myMods.blink) { s._toast('Your boots don\'t do that.'); return; }
    if (s.mode === 'client') s.net.send({ t: 'blink' }); else s.sim.blink(s.localId);
  }

  travel(mapId) {
    const s = this.s;
    if (s.mode === 'client') { s.net.send({ t: 'travel', to: mapId }); return; }
    this._travel(s.localId, mapId);
  }

  /** Host: carry the whole party to an area they've been to, if the asker wears blink boots. */
  _travel(playerId, mapId) {
    const s = this.s, p = s.sim.players.get(playerId), to = MAPS[mapId];
    if (!p || !to || s._transitioning || s.map.id === 'platform' || mapId === 'platform') return;
    if (!playerMods(s.save.party[p.character], p.character).blink) return;
    if (!(s.save.world.visited ?? []).includes(mapId)) return;
    // a burst of fire where they left, then the swap (the same steps as walking through a door)
    s.sim.emit({ t: 'blink', id: playerId, x0: Math.round(p.x), y0: Math.round(p.y), x1: Math.round(p.x), y1: Math.round(p.y) - 1 });
    const from = s.map.id;
    s._transitioning = true;
    s._camFx('fadeOut', 260, 40, 12, 4);   // on every screen (guests fade back in when the new map reaches them)
    s.cameras.main.once('camerafadeoutcomplete', () => {
      s.sim.setMap(to, from);
      s.enteredFrom = from;
      s.save.world.area = to.id;
      s._showMap(to); s._onEnterMap(to);
      s._save();
      s.cameras.main.fadeIn(260, 40, 12, 4);
      s._transitioning = false;
      const q = s.sim.players.get(playerId);
      if (q) this.trails.push({ x0: q.x, y0: q.y, x1: q.x, y1: q.y - 1, t0: s.time.now, landing: true });
    });
  }

  onHostMsg(peer, msg) {
    const s = this.s;
    if (msg.t === 'blink') { s.sim.blink(peer); return true; }
    if (msg.t === 'travel') { this._travel(peer, msg.to); return true; }
    if (msg.t === 'upgrade') { this.upgrade(s._charOf(peer), msg.id); return true; }
    return false;
  }

  onEvent(ev) {
    if (ev.t !== 'blink') return;
    // Clients can see one event twice (same snapshot rendered over several frames): skip duplicates.
    const key = `${ev.id}:${ev.x0}:${ev.y0}:${ev.x1}:${ev.y1}`;
    if (this._lastKey === key && this.s.time.now - this._lastAt < 400) return;
    this._lastKey = key; this._lastAt = this.s.time.now;
    this.trails.push({ ...ev, t0: this.s.time.now });
    sfx('shot');
  }

  // ---- drawing ---------------------------------------------------------------------------------
  update(snap) {
    const s = this.s, now = s.time.now;
    if (snap.map !== this._mapId) { this._mapId = snap.map; if (!s._transitioning) this.trails = this.trails.filter((t) => t.landing); }
    this._drawSpots();
    // charging ring for the fast-travel menu
    this.charge.clear();
    if (this.bDown != null && this.myMods.blink) {
      const k = Math.min(1, (now - this.bDown - TAP_MS) / (CHARGE_MS - TAP_MS));
      const me = snap.players.find((p) => p.id === s.localId);
      if (k > 0 && me) {
        this.charge.lineStyle(2, 0xff7a1a, 0.9).beginPath().arc(me.x, me.y - 6, 14, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2).strokePath();
        if (k >= 1) { this.bDown = null; this.charge.clear(); s.gameMenu.show('travel'); }
      }
    }
    this._drawFire(now);
  }

  _drawSpots() {
    const s = this.s, tex = s.textures.exists('romance') ? s.textures.get('romance') : null;
    const o = s.map.objects.find((x) => x.armorer);
    if (!o || !tex) { this.armorerIm?.destroy(); this.armorerIm = null; return; }
    const frame = Math.floor(s.time.now / 700) % 2 ? 'npc.armorer#1' : 'npc.armorer';
    if (!this.armorerIm || !this.armorerIm.active) this.armorerIm = s.add.image(o.x * TILE, o.y * TILE + TILE, 'romance', frame).setOrigin(0, 1).setDepth(o.y * TILE + TILE - 4);
    this.armorerIm.setFrame(frame);
  }

  // Two parallel lines of fire (one per foot) from where Michael left to where he landed, plus a
  // flare at each end. Fresh flames are yellow-white; they redden, shrink and gutter out.
  _drawFire(now) {
    const g = this.fx; g.clear();
    this.trails = this.trails.filter((t) => (now - t.t0) / 1000 < TRAIL_S);
    for (const t of this.trails) {
      const age = (now - t.t0) / 1000, life = 1 - age / TRAIL_S;
      const dx = t.x1 - t.x0, dy = t.y1 - t.y0, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, px = -uy, py = ux;
      const color = (heat) => (heat > 0.75 ? 0xfff1b0 : heat > 0.5 ? 0xffc23a : heat > 0.28 ? 0xff7a1a : 0xc8361a);
      const flame = (x, y, seed, big = 1) => {
        const flick = 0.6 + 0.4 * Math.sin(now / 60 + seed * 2.3) * Math.sin(now / 97 + seed);
        const h = Math.max(1, Math.round((2 + 4 * flick) * life * big)), w = big > 1 ? 3 : 2;
        const heat = life * (0.7 + 0.3 * flick);
        g.fillStyle(color(heat * 0.6), 0.9 * life).fillRect(Math.round(x) - w / 2, Math.round(y) - h, w, h);
        g.fillStyle(color(heat), 0.95 * life).fillRect(Math.round(x) - w / 2 + 0.5, Math.round(y) - h * 0.6, w - 1, Math.max(1, h * 0.6));
      };
      // scorch marks underneath
      g.lineStyle(1, 0x2a1208, 0.5 * life);
      for (const side of [-3, 3]) g.lineBetween(t.x0 + px * side, t.y0 + py * side + 4, t.x1 + px * side, t.y1 + py * side + 4);
      // the two lines of flame
      for (let d = 0, i = 0; d <= len; d += 4, i++) for (const side of [-3, 3]) flame(t.x0 + ux * d + px * side, t.y0 + uy * d + py * side + 4, i + side);
      // flares where he left and where he landed
      for (const [cx, cy, s0] of [[t.x0, t.y0 + 4, 50], [t.x1, t.y1 + 4, 90]]) for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + s0, r = 3 + 3 * Math.sin(now / 120 + k);
        flame(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.5, s0 + k, 1.6);
      }
    }
  }
}
