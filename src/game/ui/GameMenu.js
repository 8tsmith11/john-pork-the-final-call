// In-game menu: tabbed panel (INVENTORY · SKILLS · MAP · CONTROLS · SYSTEM) plus the FAB printer.
// Rebuilt from scratch on every refresh (cheap, and never shows stale state).
import { REGIONS, RINGS, regionState } from '../../content/regions.js';
import { ENEMIES, GUIDE_TIPS, GUIDE_STATS_AT, GUIDE_TIP_AT } from '../../content/enemies.js';
import { PARTY_SCALE, COMBAT } from '../../engine/sim.js';
import { VIEW } from '../../view.js';
import { getLang, setLang, LANG_LABEL } from '../../i18n.js';
import * as Settings from '../../settings.js';
import { sellPrice, ITEMS, RECIPES, SKILLS, SHOPS, playerMods, ARMOR_SLOTS, GEAR_SLOTS, WEAPON_SLOTS, SLOT_NAMES, MAX_UPGRADE, upgradeCost, scaleMods, canWear } from '../../content/items.js';
import { MAPS } from '../../content/maps/index.js';
import { GUIDE_PEOPLE, guideText } from '../../content/guide.js';
import { ABILITIES, ABILITY_KEYS, MAX_SCORE, modOf, fmtMod, scoresOf, raiseCost } from '../../content/abilities.js';
import { canPay, count, has, splitQuantity, worn } from '../../engine/inventory.js';
import { SKILL_TREE, skillOpen, tierLevel } from '../../content/skills.js';
import { ROOMMATES } from '../scenes/BootScene.js';
import { looksFor, wearTexture } from '../render/wearables.js';
import { QUESTS, questState, questVisible, questLeads } from '../../content/quests.js';
import { Scroller } from './scroll.js';
import { rolledName } from '../../content/gearRolls.js';

// One line of weapon stats for tooltips: melee hit, rate, dps, reach, arc, knockback; guns dmg×pellets, rate, clip, reload.
export function weaponStats(def, lvl = 0) {
  if (def?.slot === 'weapon') {
    const w = { ...COMBAT.melee, ...(def.swing ?? {}) }, bonus = scaleMods(def.mods, lvl)?.melee ?? 0;
    const hit = Math.round(w.damage + bonus), rate = 1 / w.cooldown, arc = (def.swing?.arc ?? 0.6);
    const kb = w.knockback >= 200 ? 'heavy' : w.knockback >= 110 ? 'medium' : 'light';
    return `hit ${hit} · ${rate.toFixed(1)}/s · ${Math.round(hit * rate)} dmg/s · reach ${w.range} · ${arc >= 0.7 ? 'wide' : arc <= 0.35 ? 'narrow' : 'normal'} arc · ${kb} knockback`;
  }
  if (def?.slot === 'ranged') {
    const g = { ...COMBAT.shot, ...(def.gun ?? {}) }, bonus = scaleMods(def.mods, lvl)?.shot ?? 0, n = g.pellets ?? 1;
    const dmg = Math.round(g.damage + bonus), rate = 1 / Math.max(0.12, g.cooldown + (scaleMods(def.mods, lvl)?.shotCd ?? 0));
    return `${n > 1 ? `${dmg}×${n}` : `dmg ${dmg}`} · ${rate.toFixed(1)} shots/s · clip ${g.clip} · reload ${g.reload}s`;
  }
  return null;
}

export const TABS = ['inventory', 'quests', 'guide', 'phone', 'skills', 'stats', 'map', 'controls', 'system'];
const TAB_LABEL = { inventory: 'INVENTORY', quests: 'QUESTS', guide: 'GUIDE', phone: 'PHONE', skills: 'SKILLS', stats: 'STATS', map: 'MAP', controls: 'CONTROLS', system: 'SYSTEM' };
const C = { panel: 0x0b0d16, edge: 0xf2a6b8, dim: 0x5d6487, text: '#e8e8f0', sub: '#9aa3c7', hi: '#ffb347', ok: '#7fb069', bad: '#d65db1' };
const F = (size = 8, color = C.text) => ({ fontFamily: 'monospace', fontSize: `${size}px`, color });
// Shop row labels (any item kind). Equipment slots themselves come from items.js (SLOT_NAMES).
const SLOT_LABEL = { ...SLOT_NAMES, instrument: 'Instrument', gift: 'Gift', material: 'Material' };
// Cut a line to fit `px` view pixels at monospace `size` (Text crops don't work at the 4x text resolution).
const fit = (str, px, size) => { const n = Math.floor(px / (size * 0.62)); return str.length > n ? str.slice(0, n - 1) + '…' : str; };
const SLOT_ABBR = { weapon: 'melee', ranged: 'ranged', gadget: 'gadget', charm: 'charm', helmet: 'head', chestplate: 'chest', leggings: 'legs', boots: 'boots', goggles: 'eyes', parka: 'coat', gloves: 'hands', socks: 'socks', backpack: 'pack' };
const MOD_NAME = { melee: 'melee', shot: 'shot dmg', shotCd: 'fire rate', armor: 'armor', maxHp: 'max HP', speed: 'speed', sta: 'stamina', staRegen: 'stamina regen', crit: 'crit', markDmg: 'marked dmg', abilityPower: 'ability', skillCd: 'ability cooldown', dodgeCd: 'dodge cooldown', haggle: 'prices', dashHit: 'dash hit', revive: 'revive speed', loot: 'loot' };
const PCT = new Set(['armor', 'speed', 'staRegen', 'crit', 'markDmg', 'abilityPower', 'skillCd', 'haggle', 'revive', 'loot']);
export const modText = (mods) => Object.entries(mods || {}).filter(([k]) => k !== 'gun').map(([k, v]) => `${MOD_NAME[k] ?? k} ${PCT.has(k) ? (v > 0 ? '+' : '') + Math.round(v * 100) + '%' : (v > 0 ? '+' : '') + (Math.abs(v) >= 1 ? Math.round(v) : v)}`).join('  ');

export class GameMenu {
  constructor(scene) {
    this.scene = scene;
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9600).setVisible(false);
    this.tab = null;
    this.box = { x: 40, y: 22, w: VIEW.w - 80, h: VIEW.h - 44 };
    this.scroller = new Scroller();
    this._wireScroll();
  }

  // Long lists scroll (src/game/ui/scroll.js): mouse wheel, W/S or arrows, the gamepad's d-pad or
  // left stick; ENTER / gamepad A picks the selected row. On the tabbed menu A/D still cycle tabs.
  _wireScroll() {
    const s = this.scene, live = () => this.tab && this.tab !== 'map' && !s.dlg;
    s.input.on('wheel', (p, objs, dx, dy) => { if (live() && dy && this.scroller.scroll(Math.sign(dy))) this.refresh(); });
    s.input.keyboard?.on('keydown', (ev) => {
      if (!live()) return;
      const k = ev.key, side = !TABS.includes(this.tab);
      const dy = k === 'ArrowUp' || k === 'w' || k === 'W' ? -1 : k === 'ArrowDown' || k === 's' || k === 'S' ? 1 : 0;
      const dx = !side ? 0 : k === 'ArrowLeft' || k === 'a' || k === 'A' ? -1 : k === 'ArrowRight' || k === 'd' || k === 'D' ? 1 : 0;
      if (dy || dx) { if (this.scroller.move(dy, dx)) this.refresh(); return; }
      if (k === 'Enter') this.scroller.pick();
    });
    const poll = () => this._pollPad();
    s.events.on('update', poll); s.events.once('shutdown', () => s.events.off('update', poll));
  }

  // Gamepad (standard mapping): d-pad / stick navigate with key repeat, A picks, B backs out,
  // LB/RB cycle tabs, START opens or closes the menu.
  _pollPad() {
    const pad = [...(navigator.getGamepads?.() ?? [])].find((p) => p?.connected); if (!pad) return;
    const s = this.scene, now = s.time.now, st = this._pad ??= { held: {}, next: {} };
    const btn = (i) => !!pad.buttons[i]?.pressed, ax = pad.axes ?? [];
    const edge = (name, on, repeat) => {
      const was = st.held[name]; st.held[name] = on;
      if (!on) return false;
      if (!was) { st.next[name] = now + 320; return true; }
      if (repeat && now >= st.next[name]) { st.next[name] = now + 90; return true; }
      return false;
    };
    const e = {
      up: edge('up', btn(12) || ax[1] < -0.5, true), down: edge('down', btn(13) || ax[1] > 0.5, true),
      left: edge('left', btn(14) || ax[0] < -0.5, true), right: edge('right', btn(15) || ax[0] > 0.5, true),
      a: edge('a', btn(0)), b: edge('b', btn(1)), lb: edge('lb', btn(4)), rb: edge('rb', btn(5)), start: edge('start', btn(9)),
    };
    if (s.dlg || !s.ready) return;
    if (e.start) { this.tab ? s._closeMenu() : this.show('inventory'); return; }
    if (!this.tab) return;
    if (e.b) { if (this.held != null) { this.held = null; this.refresh(); } else s._closeMenu(); return; }
    if (e.lb || e.rb) { this.cycle(e.rb ? 1 : -1); return; }
    const dy = e.up ? -1 : e.down ? 1 : 0, dx = e.left ? -1 : e.right ? 1 : 0;
    if (TABS.includes(this.tab) && dx) { this.cycle(dx); return; }
    if (this.tab === 'map') return;
    if ((dy || dx) && this.scroller.move(dy, dx)) this.refresh();
    if (e.a) this.scroller.pick();
  }

  get open() { return !!this.tab; }
  contains(x, y) { const b = this.box; return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
  show(tab) {
    const wasOpen = !!this.tab; this.tab = tab; this.refresh();
    if (!wasOpen) { this.root.setAlpha(0); this.scene.tweens.add({ targets: this.root, alpha: 1, duration: 140 }); }
  }
  close() { this.scroller.clear(); this.held = null; this.hover = null; this.skillHover = null; this.tab = null; this.root.removeAll(true); this.root.setVisible(false); }
  cycle(dir) { if (!TABS.includes(this.tab)) return; this.show(TABS[(TABS.indexOf(this.tab) + dir + TABS.length) % TABS.length]); }

  // ---- helpers ----
  _t(x, y, str, style, onClick) {
    const t = this.scene.add.text(x, y, str, style);
    if (onClick) t.setInteractive({ useHandCursor: true }).on('pointerdown', (p, lx, ly, ev) => { ev?.stopPropagation?.(); onClick(); })
      .on('pointerover', () => t.setAlpha(0.75)).on('pointerout', () => t.setAlpha(1));
    this.root.add(t); return t;
  }
  _g() { const g = this.scene.add.graphics(); this.root.add(g); return g; }

  refresh() {
    if (!this.tab) return;
    this.root.removeAll(true); this.tip = []; this.scroller.clear();
    this.root.setVisible(true);
    const b = this.box, g = this._g();
    g.fillStyle(0x000000, 0.45).fillRect(0, 0, VIEW.w, VIEW.h);                 // dim the world
    g.fillStyle(C.panel, 0.97).fillRoundedRect(b.x, b.y, b.w, b.h, 3).lineStyle(1, C.edge, 0.9).strokeRoundedRect(b.x, b.y, b.w, b.h, 3);
    if (this.tab === 'fab') return this._fab(g);
    if (this.tab?.startsWith('shop:')) return this._shop(g, this.tab.slice(5));
    if (this.tab === 'armorer') return this._armorer(g);
    if (this.tab?.startsWith('approach:')) return this.scene.approach?.draw(this, g);
    if (this.tab === 'travel') return this._travel(g);
    // tab bar
    let x = b.x + 8;
    for (const tab of TABS) {
      const on = tab === this.tab;
      const t = this._t(x, b.y + 6, TAB_LABEL[tab], F(8, on ? C.hi : C.sub), () => this.show(tab));
      if (on) g.fillStyle(0xffb347).fillRect(x, b.y + 16, t.width, 1);
      x += t.width + 12;
    }
    this._t(b.x + b.w - 8, b.y + 7, '[ESC]', F(6, C.sub)).setOrigin(1, 0);   // A/D cycles tabs (CONTROLS)
    g.lineStyle(1, C.dim, 0.6).lineBetween(b.x + 6, b.y + 20, b.x + b.w - 6, b.y + 20);
    this[`_${this.tab}`](g);
  }

  // ---- tabs ----
  // Minecraft-style grid: 27 backpack slots + the 9-slot hotbar, equipment beside the character.
  // Left click picks up or places a stack. Right click takes half of a stack, or uses a single item.
  // Shift+right click uses an item without splitting. Drop gear on an equipment slot to wear it.
  _inventory(g) {
    const s = this.scene, who = s.character, c = s.save.party[who], b = this.box;
    const mods = playerMods(c, who), inv = c.inventory ?? [];
    const S = 20, GAP = 2;
    // Paper doll: armor (left), the character (middle), gear and weapons (right). Unique items glow gold.
    g.fillStyle(0x151827).fillRoundedRect(b.x + 32, b.y + 28, 52, 108, 3);
    const spr = s.add.sprite(b.x + 58, b.y + 124, who).setOrigin(0.5, 1).setScale(3).play(`${who}_idle_down`);
    this.root.add(spr);
    // worn models (parkas) on the paper doll too, frame for frame
    for (const id of looksFor(c)) {
      const key = wearTexture(s, who, id); if (!key) continue;
      const o = s.add.image(spr.x, spr.y, key, spr.frame.name).setOrigin(0.5, 1).setScale(3);
      this.root.add(o);
      const follow = (anim, frame) => { if (o.active && o.texture.has(frame.textureFrame)) o.setFrame(frame.textureFrame); };
      spr.on('animationupdate', follow); o.once('destroy', () => spr.off('animationupdate', follow));
    }
    this._t(b.x + 58, b.y + 126, `${ROOMMATES[who].name}`, F(7, C.text)).setOrigin(0.5, 0);
    const slotBox = (slot, x, y) => {
      const id = c.equipped[slot], def = id && ITEMS[id], uniq = def?.unique, lvl = id ? c.upgrades?.[id] ?? 0 : 0;
      g.fillStyle(0x151827).fillRect(x, y, S, S).lineStyle(1, uniq ? 0xffd27f : id ? 0x7fb069 : C.dim, 0.9).strokeRect(x + 0.5, y + 0.5, S - 1, S - 1);
      if (id) { this._icon(x + S / 2, y + S / 2, id); if (lvl) this._t(x + S - 1, y + 1, `+${lvl}`, F(5, C.hi)).setOrigin(1, 0); }
      else this._t(x + S / 2, y + S / 2, SLOT_ABBR[slot], F(5, '#4a5175')).setOrigin(0.5);
      const z = s.add.zone(x, y, S, S).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => {
        if (this.held != null) { const it = inv[this.held]; if (it && ITEMS[it.id]?.slot === slot) s.menuUse(it.id); this.held = null; return this.refresh(); }
        if (id) s.menuUse(id);   // click a worn item to take it off
      });
      z.on('pointerover', () => { this.hover = id ? { id, roll: c.rolled?.[slot] ?? ((slot === 'weapon' || slot === 'ranged') ? c.inventory.find((x) => x?.id === id && x.roll)?.roll : null) } : { label: `${SLOT_NAMES[slot]} slot` }; this._drawTip(); });
      this.root.add(z);
    };
    const col = (slots, x, label) => { this._t(x + S / 2, b.y + 25, label, F(5, C.sub)).setOrigin(0.5, 1); slots.forEach((slot, k) => slotBox(slot, x, b.y + 28 + k * (S + GAP))); };
    col(ARMOR_SLOTS, b.x + 8, 'ARMOR');
    col(GEAR_SLOTS, b.x + 88, 'GEAR');
    col(WEAPON_SLOTS, b.x + 110, 'HANDS');
    // stats: armor points come from the four armor pieces
    const armorPts = Math.round(ARMOR_SLOTS.reduce((t, sl) => { const d = ITEMS[c.equipped[sl]]; return t + (canWear(d, who) ? scaleMods(d.mods, c.upgrades?.[d.id ?? c.equipped[sl]] ?? 0).armor ?? 0 : 0); }, 0) * 100);
    const stat = [`HP ${100 + (mods.maxHp || 0)}   Armor ${armorPts} pts (${Math.round((mods.armor || 0) * 100)}%)`, `Melee +${mods.melee}   Ranged ${mods.gun ? '+' + mods.shot : '-'}   Speed ${mods.speed >= 0 ? '+' : ''}${Math.round((mods.speed || 0) * 100)}%`, `$${c.money ?? 0}   XP ${c.xp}/${c.level * 30}   lv ${c.level}`];
    stat.forEach((line, k) => this._t(b.x + 8, b.y + 142 + k * 9, line, F(6, k === 2 ? C.hi : C.sub)));
    // Send money to a roommate (Trevor #515): $5 a click, from your own wallet.
    {
      let x = b.x + 8; const y = b.y + 142 + stat.length * 9;
      x += this._t(x, y, 'SEND $5 →', F(6, C.sub)).width + 4;
      for (const to of Object.keys(s.save.party)) {
        if (to === who) continue;
        x += this._t(x, y, to[0].toUpperCase() + to.slice(1), F(6, (c.money ?? 0) >= 1 ? C.hi : C.sub), () => s.menuSendMoney(to, 5)).width + 6;
      }
    }
    // BUFFS: what is boosting you right now beyond plain gear (partners nearby, unique items)
    const buffs = [...(s.romance?.activeBuffs?.() ?? []).map((v) => `♥ ${v.name}: ${v.buffText}`),
      ...Object.values(c.equipped).filter((id) => ITEMS[id]?.unique && canWear(ITEMS[id], who)).map((id) => `★ ${ITEMS[id].name}: ${modText(scaleMods(ITEMS[id].mods, c.upgrades?.[id] ?? 0))}`)];
    const BY = b.y + 181;   // below the send-money row
    this._t(b.x + 8, BY, 'BUFFS  (hover gear for details)', F(6, C.sub));
    const rows = Math.floor((b.h - 191) / 7);
    if (!buffs.length) this._t(b.x + 8, BY + 8, 'none right now', F(6, '#4a5175'));
    const BL = this.scroller.list('buffs', { n: buffs.length, per: rows, select: false });   // wheel / W-S scroll it
    buffs.slice(BL.first, BL.last).forEach((line, k) => this._t(b.x + 8, BY + 8 + k * 7, fit(line, 124, 5), F(5, '#f2a6b8')));
    this.scroller.bar(g, b.x + 133, BY + 10, rows * 7 - 4, BL);
    // grid + hotbar
    const gx = b.x + 140, gy = b.y + 36;
    const used = inv.slice(9).filter(Boolean).length;
    this._t(gx, gy - 4, `BACKPACK  ${used}/27  · worn gear sits in its slot, not here`, F(6, C.sub)).setOrigin(0, 1);
    const slotXY = (i) => i < 9 ? [gx + i * (S + GAP), gy + 3 * (S + GAP) + 10] : [gx + ((i - 9) % 9) * (S + GAP), gy + Math.floor((i - 9) / 9) * (S + GAP)];
    this._t(gx, gy + 3 * (S + GAP) + 6, 'HOTBAR  (keys 1-9)', F(6, C.sub)).setOrigin(0, 1);
    const eq = new Set(Object.values(c.equipped || {}));
    // Holding a stack? Click outside the panel to drop it on the floor (src/game/guitarStands.js).
    // The panel itself swallows clicks so a near miss on a slot doesn't drop anything.
    if (this.held != null) {
      const out = s.add.zone(0, 0, VIEW.w, VIEW.h).setOrigin(0).setInteractive();
      out.on('pointerdown', () => {
        const i = this.held, half = this.heldHalf;
        this.held = null; this.heldHalf = false;
        if (inv[i]) s.stands?.drop(i, !half, half);
        this.refresh();
      });
      const panel = s.add.zone(b.x, b.y, b.w, b.h).setOrigin(0).setInteractive();
      this.root.addAt(out, 1); this.root.addAt(panel, 2);   // right above the backdrop, under every slot and tab
      this._t(b.x + b.w / 2, b.y + b.h + 3, 'click outside to drop it', F(6, C.hi)).setOrigin(0.5, 0);
    }
    for (let i = 0; i < 36; i++) {
      const [x, y] = slotXY(i), it = inv[i], held = this.held === i;
      g.fillStyle(i < 9 ? 0x1a1d30 : 0x151827).fillRect(x, y, S, S);
      g.lineStyle(1, held ? 0xffb347 : it && eq.has(it.id) ? 0x7fb069 : C.dim, held ? 1 : 0.7).strokeRect(x + 0.5, y + 0.5, S - 1, S - 1);
      if (it) {
        this._icon(x + S / 2, y + S / 2, it.id).setAlpha(held ? 0.35 : 1);
        if (it.qty > 1) this._t(x + S - 1, y + S, `${it.qty}`, F(6, C.text)).setOrigin(1, 1);
      }
      const z = s.add.zone(x, y, S, S).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerdown', (p) => {
        const right = p.rightButtonDown?.() || p.button === 2;
        if (this.held != null) { s.menuMove(this.held, i, this.heldHalf); this.held = null; this.heldHalf = false; return this.refresh(); }
        if (!it) return;
        if (right && (p.event?.shiftKey || it.qty === 1)) { s.menuUseSlot(i); return this.refresh(); }
        this.held = i;
        this.heldHalf = right;
        this.refresh();
      });
      z.on('pointerover', () => { this.hover = it ? { id: it.id, qty: it.qty, i, roll: it.roll } : null; this._drawTip(); });
      this.root.add(z);
    }
    // the held stack follows the cursor
    if (this.held != null && inv[this.held]) {
      const stack = inv[this.held], qty = this.heldHalf ? splitQuantity(stack.qty) : stack.qty;
      const ghost = this._icon(0, 0, stack.id).setDepth(9700);
      const amount = qty > 1 ? this._t(0, 0, `${qty}`, F(6, C.text)).setOrigin(1, 1) : null;
      const follow = (p) => { ghost.setPosition(p.x / 4, p.y / 4); amount?.setPosition(ghost.x + 9, ghost.y + 9); };
      follow(s.input.activePointer);
      s.input.on('pointermove', follow); ghost.once('destroy', () => s.input.off('pointermove', follow));
    }
    // tooltip area
    this.tipY = gy + 4 * (S + GAP) + 16; this.tipX = gx; this.tipW = b.x + b.w - gx - 10;
    this._t(gx, b.y + b.h - 20, 'Right click: split · Shift+right click: use', F(6, C.sub));
    this._t(gx, b.y + b.h - 12, 'G: drop one · Shift+G: drop stack', F(6, C.sub));
    this._drawTip();
  }

  _icon(x, y, id) {
    const tex = this.scene.textures.get('icons'), img = this.scene.add.image(x, y, 'icons', tex.has(id) ? id : 'generic');
    this.root.add(img); return img;
  }

  _drawTip() {
    this.tip?.forEach((o) => o.destroy());
    this.tip = [];
    if (this.tab !== 'inventory' || this.tipY == null) return;
    const h = this.hover, x = this.tipX, y = this.tipY;
    if (!h) return;
    if (h.label) { this.tip.push(this._t(x, y, h.label, F(8, C.sub))); return; }
    const def = ITEMS[h.id]; if (!def) return;
    const kind = ({ weapon: 'Melee weapon', ranged: 'Ranged weapon', consumable: 'Food', material: 'Material', junk: 'Curio', key: 'Key item', instrument: 'Instrument (use to play)', gift: 'Gift' }[def.slot]
      ?? (ARMOR_SLOTS.includes(def.slot) ? `Armor · ${SLOT_NAMES[def.slot]}` : GEAR_SLOTS.includes(def.slot) ? `Gear · ${SLOT_NAMES[def.slot]}` : SLOT_NAMES[def.slot] ?? '')) + (def.unique ? ` · ${def.owner[0].toUpperCase() + def.owner.slice(1)} only${def.special ? ' · special armor' : ''}` : '');
    const lvl = this.scene.save.party[this.scene.character]?.upgrades?.[h.id] ?? 0;
    const stats = modText(scaleMods(def.mods, lvl));
    this.tip.push(this._t(x, y, `${rolledName(def.name, h.roll, getLang())}${lvl ? ` +${lvl}` : ''}${h.qty > 1 ? ' ×' + h.qty : ''}`, F(9, def.unique ? '#ffd27f' : h.roll ? '#c9a2ff' : C.hi)));
    this.tip.push(this._t(x, y + 11, `${kind}${def.heal ? `  · heals ${def.heal}` : ''}${stats ? '  · ' + stats : ''}${h.roll ? `  · rolled: ${modText(h.roll.mods)}` : ''}`, F(6, C.ok)));
    // Weapon stats (Trevor): what a hit or a shot actually does.
    const ws = weaponStats(def, lvl);
    let ty = y + 20;
    if (ws) { const t = this._t(x, ty, ws, { ...F(7, '#6fe3e8'), wordWrap: { width: this.tipW } }); this.tip.push(t); ty += t.height + 2; }
    this.tip.push(this._t(x, ty, def.text ?? '', { ...F(7, C.sub), wordWrap: { width: this.tipW } }));
  }

  _quests(g) {
    const s = this.scene, b = this.box, qs = questState(s.save);
    let y = b.y + 28;
    const show = QUESTS.filter((q) => (qs[q.id].started || qs[q.id].done) && questVisible(q, s.character)), bottom = b.y + b.h - 8;
    if (!show.length) this._t(b.x + 14, y, 'Nothing yet.', F(8, C.sub));
    const L = this.scroller.list('quests', { n: show.length, per: 0, select: false });
    let shown = 0;
    for (const q of show.slice(L.top)) {
      const st = qs[q.id], n0 = this.root.list.length;
      // Every quest looks the same (Trevor): no main/side markers or labels.
      this._t(b.x + 14, y, `${st.done ? '✓' : '·'} ${q.title}`, F(9, st.done ? C.ok : C.hi)); y += 12;
      if (!st.done) {
        const obj = this._t(b.x + 26, y, `→ ${q.stages[st.stage]?.text ?? ''}`, { ...F(7, '#6fe3e8'), wordWrap: { width: b.w - 50 } }); y += obj.height + 2;
        if (q.why) { const why = this._t(b.x + 26, y, q.why, { ...F(7, C.sub), wordWrap: { width: b.w - 50 } }); y += why.height + 6; } else y += 4;
        for (const lead of questLeads(q, s.save, s.character)) {
          const line = this._t(b.x + 26, y, `${lead.resolved ? '✓' : '·'} ${lead.text}`, { ...F(7, lead.resolved ? C.ok : C.text), wordWrap: { width: b.w - 50 } });
          y += line.height + 2;
        }
      }
      if (y - 4 > bottom && shown) { this.root.list.slice(n0).forEach((o) => o.destroy()); break; }   // doesn't fit: next page
      shown++;
      if (y > bottom - 10) break;
    }
    L.fit(shown, L.top + shown >= show.length);
    this.scroller.bar(g, b.x + b.w - 9, b.y + 30, b.h - 42, L, (x, yy, t) => this._t(x, yy, t, F(6, C.hi)));
  }

  // Skill tree: three branches of four tiers meeting at a capstone. Hover for details, click to learn.
  // The phone: recent calls (from what has happened) and the texts that have arrived.
  // Field guide, Terraria's bestiary: seen → name, picture and lore; 5 kills → stats; 15 → a tip.
  // People are listed once you've talked to them. Locked entries stay as "???".
  _guide(g) {
    const s = this.scene, b = this.box, gd = s.save.world.guide ?? { e: {}, n: {} }, f = s.save.flags;
    const kinds = Object.keys(ENEMIES), seen = kinds.filter((k) => gd.e?.[k]);
    // People: key characters first (John Pork from the start, Trevor's call), then everyone else you've met.
    const keyPeople = GUIDE_PEOPLE.map((p) => ({ ...p, text: guideText(p, f) })).filter((p) => p.text);
    const keyNames = new Set(keyPeople.map((p) => p.name.toLowerCase()));
    const met = Object.entries(gd.n ?? {}).filter(([, p]) => !keyNames.has(p.name.toLowerCase()));
    this.guideSel ??= keyPeople[0]?.id ?? kinds[0];
    const lx = b.x + 12, top = b.y + 28;
    let y = top;
    const row = (label, id, on, enabled = true) => {
      if (on) g.fillStyle(0x3a3150, 0.8).fillRect(lx - 3, y - 1, 112, 10);
      this._t(lx, y, label, F(7, enabled ? (on ? C.hi : C.text) : C.sub), enabled ? () => { this.guideSel = id; this.refresh(); } : null);
      y += 10;
    };
    this._t(lx, y, `PEOPLE  ${keyPeople.length + met.length}`, F(7, C.hi)); y += 11;
    for (const p of keyPeople) row(p.name, p.id, p.id === this.guideSel);
    for (const [id, p] of met.slice(0, 10)) row(p.name, id, id === this.guideSel);
    y += 5;
    this._t(lx, y, `CODE ROT  ${seen.length}/${kinds.length}`, F(7, C.hi)); y += 11;
    for (const k of kinds) { const e = gd.e?.[k]; row(e ? `${ENEMIES[k].name}${e.kills ? `  ×${e.kills}` : ''}` : '???', k, k === this.guideSel, !!e); }
    // detail pane: picture, name, description
    const dx = b.x + 140, dw = b.w - 152;
    g.lineStyle(1, C.dim, 0.5).lineBetween(dx - 8, top, dx - 8, b.y + b.h - 10);
    const pic = (art, fallback) => {
      const tryArt = (a) => {
        if (!a) return null;
        if (typeof a === 'string') return s.textures.exists(a) ? s.add.image(0, 0, a) : null;
        const [tex, frame] = a; return s.textures.exists(tex) && s.textures.get(tex).has(frame) ? s.add.image(0, 0, tex, frame) : null;
      };
      const im = tryArt(art) ?? tryArt(fallback);
      g.fillStyle(0x0b0d16).fillRect(dx, top, 52, 52).lineStyle(1, C.dim, 0.8).strokeRect(dx, top, 52, 52);
      if (im) { const k = Math.min(48 / im.width, 48 / im.height); im.setScale(k).setPosition(dx + 26, top + 26); this.root.add(im); }
      return !!im;
    };
    const head = (name, sub) => { this._t(dx + 60, top + 4, name, F(10, C.hi)); if (sub) this._t(dx + 60, top + 18, sub, F(6, C.sub)); };
    const body = (text, yy = top + 60) => this._t(dx, yy, text, { ...F(7, C.text), wordWrap: { width: dw } });
    const sel = this.guideSel, key = keyPeople.find((p) => p.id === sel), e = gd.e?.[sel], def = ENEMIES[sel], person = gd.n?.[sel];
    if (key) { pic(key.art, key.fallbackArt); head(key.name); body(key.text); }
    else if (def && e) {
      pic(['enemies', `${sel}_0`]) || g.fillStyle(def.color ?? 0xd65db1).fillCircle(dx + 26, top + 26, 12);
      head(def.name, `seen · ${e.kills} defeated`);
      const lore = body(def.lore ?? ''); let yy = top + 64 + lore.height;
      if (e.kills >= GUIDE_STATS_AT) {
        const hp = Math.round(def.hp * PARTY_SCALE.hp), dmg = Math.round((def.damage ?? 0) * PARTY_SCALE.dmg);
        this._t(dx, yy, `HP ${hp}   damage ${dmg}   speed ${def.speed}`, F(7, '#6fe3e8')); yy += 12;
      } else { this._t(dx, yy, `Stats: defeat ${GUIDE_STATS_AT - e.kills} more`, F(6, C.sub)); yy += 10; }
      if (e.kills >= GUIDE_TIP_AT && GUIDE_TIPS[sel]) this._t(dx, yy, `Tip: ${GUIDE_TIPS[sel]}`, { ...F(7, C.ok), wordWrap: { width: dw } });
      else if (GUIDE_TIPS[sel]) this._t(dx, yy, `Tip: defeat ${Math.max(0, GUIDE_TIP_AT - e.kills)} more`, F(6, C.sub));
    } else if (person) {
      // Anyone else you've talked to: their picture and how they first came across.
      const o = Object.values(MAPS).flatMap((m) => m.objects).find((x) => x.id === sel);
      pic(['props', o?.art ?? sel]);
      head(person.name, `Met: ${person.where}`);
      const desc = String(o?.pages?.[0] ?? o?.text ?? '').split('\n\n')[0];
      if (desc) body(desc);
    } else this._t(dx, top + 2, 'Pick an entry.', F(7, C.sub));
  }

  _phone(g) {
    const s = this.scene, b = this.box, f = s.save.flags;
    const px = b.x + 14, py = b.y + 28, pw = 150, ph = b.h - 40;
    g.fillStyle(0x10121e).fillRoundedRect(px, py, pw, ph, 6).lineStyle(1, 0x3a4060).strokeRoundedRect(px, py, pw, ph, 6);
    this._t(px + 8, py + 6, 'RECENTS', F(7, C.sub));
    const calls = [];
    if (f['act1.beat.call']) calls.push(['John Pork', f['act1.call.answered'] && !f['act1.beat.ring2'] ? 'answered' : Number(f['act1.call.declines'] || 0) >= 1 ? 'declined' : 'incoming']);
    if (f['act1.beat.ring2']) calls.push(['John Pork', f['act1.call.answered'] && !f['act1.beat.ring3'] ? 'answered' : 'declined']);
    if (f['act1.beat.ring3']) calls.push(['John Pork', f['act1.call.answered'] ? 'answered' : 'declined']);
    if (f['act1.beat.buttDial']) calls.push(['John Pork', f['act1.call.buttDialSpokeUp'] ? 'pocket dial (you spoke)' : 'pocket dial']);
    const vm = Number(f['act1.call.declines'] || 0);
    if (vm >= 1) calls.push(['Voicemail', `${Math.min(vm, 2)} from John Pork`]);
    for (const v of s.save.world.phone?.voicemails ?? []) calls.push([`Voicemail · ${v.from}`, '▶ play', () => s.cameos?.replay(v.id)]);   // voice cameos
    // Transcripts of every call (Trevor): click one to read it in the right-hand pane.
    const scripts = s.save.world.phone?.transcripts ?? [];
    scripts.forEach((t, i) => calls.push([t.title, '▤ transcript', () => { this._phoneView = i; this.refresh(); }]));
    if (!calls.length) this._t(px + 8, py + 18, 'No calls.', F(7, '#4a5175'));
    calls.slice(-8).reverse().forEach(([who, what, onClick], i) => {
      this._t(px + 8, py + 18 + i * 18, who, F(8, who === 'John Pork' ? '#e87a9c' : C.text));
      this._t(px + 8, py + 27 + i * 18, what, F(6, onClick ? C.hi : C.sub), onClick);
    });
    // messages
    const mx = px + pw + 12, mw = b.x + b.w - mx - 14;
    g.fillStyle(0x10121e).fillRoundedRect(mx, py, mw, ph, 6).lineStyle(1, 0x3a4060).strokeRoundedRect(mx, py, mw, ph, 6);
    const call = scripts[this._phoneView];
    if (call) {   // a call's transcript, newest lines at the bottom; click the header to go back to messages
      this._t(mx + 8, py + 6, `◂ ${call.title.toUpperCase()}`, F(7, C.hi), () => { this._phoneView = null; this.refresh(); });
      const out = [];
      for (const [who, text, picked] of call.lines) out.push(`${who ? `${who.toUpperCase()}: ` : ''}${picked ? `▸ ${text}` : text}`);
      const body = this._t(mx + 8, py + 18, '', { ...F(7, C.text), wordWrap: { width: mw - 16 }, lineSpacing: 1 });
      // Fit the newest lines that fit the pane.
      let lines = out.slice();
      body.setText(lines.join('\n'));
      while (lines.length > 1 && body.height > ph - 26) { lines.shift(); body.setText(['…', ...lines].join('\n')); }
      return;
    }
    this._t(mx + 8, py + 6, 'MESSAGES', F(7, C.sub));
    const texts = s.save.world.phone?.texts ?? [];
    if (!texts.length) this._t(mx + 8, py + 18, 'Nothing new.', F(7, '#4a5175'));
    let y = py + 20, shown = 0;
    const newest = [...texts].reverse(), L = this.scroller.list('phone', { n: newest.length, per: 0, select: false }), bottom = py + ph - 16;
    const bubbles = this._g();   // bubbles under their text; drawn per message so a cut one can go
    for (const t of newest.slice(L.top)) {
      const tt = this._t(mx + 14, y + 3, t.text, { ...F(7, '#fff0f4'), wordWrap: { width: mw - 40 } });
      if (y + tt.height + 6 > bottom && shown) { tt.destroy(); break; }
      bubbles.fillStyle(0x5a2a44, 0.9).fillRoundedRect(mx + 8, y, Math.min(mw - 20, tt.width + 14), tt.height + 6, 4);
      this.root.bringToTop(tt);
      y += tt.height + 10; shown++;
    }
    L.fit(shown, L.top + shown >= newest.length);
    this.scroller.bar(g, mx + mw - 7, py + 20, ph - 40, L, (x, yy, t) => this._t(x, yy, t, F(6, C.hi)));
    if (texts.length) this._t(mx + 8, py + ph - 12, `John Pork · ${texts.length} message${texts.length > 1 ? 's' : ''} · newest first`, F(6, C.sub));
  }

  _skills(g) {
    const s = this.scene, who = s.character, c = s.save.party[who], b = this.box, tree = SKILL_TREE[who];
    if (!tree) return;
    const tx = b.x + 10, colW = 92, nodeW = 84, nodeH = 22, rowY = (r) => b.y + 44 + r * 34, colX = (k) => tx + k * colW;
    const pts = c.skillPoints ?? 0;
    this._t(b.x + b.w - 10, b.y + 26, pts ? `◆ ${pts} point${pts === 1 ? '' : 's'} to spend` : 'level up for points', F(8, pts ? C.hi : C.sub)).setOrigin(1, 0);
    tree.branches.forEach((name, k) => this._t(colX(k) + nodeW / 2, b.y + 27, name, F(7, C.sub)).setOrigin(0.5, 0));
    const pos = (n) => ({ x: colX(n.col), y: rowY(n.row) });
    for (const n of tree.nodes) for (const r of n.req || []) {
      const p = tree.nodes.find((x) => x.id === r); if (!p) continue;
      const a = pos(p), z = pos(n), on = (c.skills[r] ?? 0) > 0;
      g.lineStyle(1, on ? 0xffb347 : 0x3a4060, on ? 0.9 : 0.8).lineBetween(a.x + nodeW / 2, a.y + nodeH, z.x + nodeW / 2, z.y);
    }
    for (const n of tree.nodes) {
      const { x, y } = pos(n), r = c.skills[n.id] ?? 0, open = skillOpen(who, c, n), maxed = r >= n.max;
      const canLearn = open && !maxed && pts > 0, cap = n.row === 4;
      const edge = maxed ? 0x7fb069 : r > 0 ? 0xffb347 : canLearn ? 0xe8e8f0 : 0x3a4060;
      g.fillStyle(r > 0 ? 0x1f2438 : open ? 0x171a2b : 0x0f111c).fillRoundedRect(x, y, nodeW, nodeH, cap ? 5 : 2);
      g.lineStyle(cap ? 2 : 1, edge, open ? 1 : 0.7).strokeRoundedRect(x, y, nodeW, nodeH, cap ? 5 : 2);
      this._t(x + 4, y + 2, n.name, F(n.name.length > 15 ? 6 : 7, open ? (maxed ? C.ok : C.text) : '#4a5175'));
      this._t(x + 4, y + 12, '■'.repeat(r) + '□'.repeat(n.max - r), F(6, r ? C.hi : '#4a5175'));
      const z = s.add.zone(x, y, nodeW, nodeH).setOrigin(0).setInteractive({ useHandCursor: canLearn });
      z.on('pointerover', () => { this.skillHover = n.id; this._skillTip(); });
      z.on('pointerdown', () => { if (canLearn) s.menuLearn(n.id); });
      this.root.add(z);
    }
    this.skillTip = { x: colX(3) + 4, y: b.y + 44, w: b.x + b.w - colX(3) - 14 };
    this._skillTip();
  }

  _skillTip() {
    this.tip?.forEach((o) => o.destroy()); this.tip = [];
    const s = this.scene, who = s.character, c = s.save.party[who], t = this.skillTip;
    const n = SKILL_TREE[who]?.nodes.find((x) => x.id === this.skillHover); if (!n || !t) return;
    const r = c.skills[n.id] ?? 0, open = skillOpen(who, c, n);
    const need = (n.req || []).filter((q) => !(c.skills[q] > 0)).map((q) => SKILL_TREE[who].nodes.find((x) => x.id === q)?.name);
    this.tip.push(this._t(t.x, t.y, n.name, { ...F(9, C.hi), wordWrap: { width: t.w } }));
    this.tip.push(this._t(t.x, t.y + 12, `rank ${r}/${n.max}`, F(7, r >= n.max ? C.ok : C.sub)));
    this.tip.push(this._t(t.x, t.y + 24, n.text, { ...F(7, C.text), wordWrap: { width: t.w } }));
    const lvNeed = tierLevel(n), lowLv = (c.level ?? 1) < lvNeed;
    const foot = r >= n.max ? 'Maxed.' : lowLv ? `Opens at level ${lvNeed}.` : !open ? `Needs: ${need.join(', ')}` : (c.skillPoints ?? 0) > 0 ? 'Click to learn (1 point).' : 'No points. Level up.';
    this.tip.push(this._t(t.x, t.y + 92, foot, { ...F(7, !open ? C.bad : C.ok), wordWrap: { width: t.w } }));
  }

  _map(g) {
    const s = this.scene, b = this.box;
    const vx = b.x + 10, vy = b.y + 26, vw = b.w - 20, vh = b.h - 44;
    // LOCAL (the area you're in) or WORLD (the regions in rings, docs/design/10-scope.md).
    for (const [mode, label, dx] of [['local', 'LOCAL', 74], ['world', 'WORLD', 40]]) {
      const on = (this.mapMode ?? 'local') === mode;
      this._t(b.x + b.w - dx, b.y + 26 - 9, label, F(7, on ? C.hi : C.sub), () => { this.mapMode = mode; this.refresh(); });
    }
    if (this.mapMode === 'world') return this._worldMap(g, vx, vy, vw, vh);
    if (!this.mapView) {
      const { x, y } = s.playerWorldTile();
      this.mapView = { cx: x, cy: y, zoom: 3 };
    }
    const labels = s.drawWorldMap(g, vx, vy, vw, vh, this.mapView);
    for (const l of labels) this._t(l.x, l.y, l.text, F(6, l.here ? C.hi : C.sub)).setOrigin(0.5, 1);
    this._t(vx, vy + vh + 4, 'drag to pan · wheel to zoom · C to center on you', F(7, C.sub));
    // Drag to pan
    const z = s.add.zone(vx, vy, vw, vh).setOrigin(0, 0).setInteractive({ draggable: false });
    z.on('pointerdown', (p) => { this._drag = { x: p.x, y: p.y, cx: this.mapView.cx, cy: this.mapView.cy }; });
    z.on('pointermove', (p) => {
      if (!this._drag || !p.isDown) return;
      const k = this.mapView.zoom * 4;   // screen px per tile (view zoom 4)
      this.mapView.cx = this._drag.cx - (p.x - this._drag.x) / k; this.mapView.cy = this._drag.cy - (p.y - this._drag.y) / k;
      this._redrawSoon();
    });
    z.on('pointerup', () => { this._drag = null; });
    this.root.add(z);
    if (!this._wheelHooked) {
      this._wheelHooked = true;
      s.input.on('wheel', (p, objs, dx, dy) => { if (this.tab !== 'map') return; this.mapView.zoom = Math.max(1, Math.min(8, this.mapView.zoom * (dy > 0 ? 0.8 : 1.25))); this.refresh(); });
      s.input.keyboard.on('keydown-C', () => { if (this.tab !== 'map') return; const { x, y } = s.playerWorldTile(); Object.assign(this.mapView, { cx: x, cy: y }); this.refresh(); });
    }
  }

  // The world view: three rings, one per act, with the regions placed roughly where they are. Here, open,
  // closed tonight (the cordon) and locked (a later act, shown as ???).
  _worldMap(g, vx, vy, vw, vh) {
    const s = this.scene, act = s.save.world.act ?? 1, mapId = s.map?.id, es = getLang() === 'es';
    const cx = vx + vw * 0.5, cy = vy + vh * 0.5, RX = vw * 0.98, RY = vh * 0.98;
    g.fillStyle(0x0b0d16, 1).fillRect(vx, vy, vw, vh);
    const COL = { here: 0xffb347, open: 0x7fb069, closed: 0xd65db1, locked: 0x3a4060 };
    for (const ring of RINGS) {
      const open = ring.act <= act;
      g.lineStyle(1, open ? 0x5d6487 : 0x2a2f45, open ? 0.9 : 0.6).strokeEllipse(cx, cy, RX * ring.r * 2, RY * ring.r * 2);
      this._t(cx, cy - RY * ring.r - 1, open ? (es ? ring.es : ring.name) : '???', F(6, open ? C.sub : '#3a4060')).setOrigin(0.5, 1);
    }
    // Each region sits on its ring, in the compass direction it lies from College Park (x/y in regions.js).
    for (const r of REGIONS) {
      const ring = RINGS.find((q) => q.ring === r.ring), ang = Math.atan2(r.y - 0.55, r.x - 0.5);
      const x = cx + Math.cos(ang) * RX * ring.r, y = cy + Math.sin(ang) * RY * ring.r;
      const st = regionState(r, act, mapId);
      g.fillStyle(COL[st], 1).fillCircle(x, y, st === 'here' ? 3.5 : 2.5);
      if (st === 'here') g.lineStyle(1, 0xffb347, 0.8).strokeCircle(x, y, 6);
      if (st === 'locked') continue;   // later acts: a dot only (the ring itself reads ???)
      const name = es ? r.shortEs : r.short, left = Math.cos(ang) < -0.2;
      this._t(x + (left ? -5 : 5), y, name, F(6, st === 'here' ? C.hi : st === 'locked' ? '#3a4060' : C.sub)).setOrigin(left ? 1 : 0, 0.5);
    }
    // Legend with the real colours.
    let lx = vx;
    for (const [st, en, esL] of [['here', 'here', 'aquí'], ['open', 'open', 'abierto'], ['closed', 'closed tonight', 'cerrado esta noche'], ['locked', 'later', 'más adelante']]) {
      g.fillStyle(COL[st], 1).fillCircle(lx + 3, vy + vh + 8, 2.5);
      lx += 9 + this._t(lx + 8, vy + vh + 4, es ? esL : en, F(7, C.sub)).width + 6;
    }
  }

  _redrawSoon() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = null; if (this.tab === 'map') this.refresh(); }); }

  _controls() {
    const b = this.box;
    const rows = [['Move', 'WASD / arrows (diagonals work)'], ['Dash', 'SPACE / SHIFT (uses stamina)'], ['Hit', 'Left click'],
      ['Shoot', 'Right click, once you have a ranged weapon'], ['Use / talk', 'E when close; walk into doors'], ['Dialogue', 'E (or SPACE) to continue; click or 1-6 to choose'],
      ['Menu', 'ESC   Inventory I   Quests J   Skills K   Map TAB'], ['Hotbar', '1-9 use or equip that slot'], ['Ability', 'R: Trevor Riff · Manuel Decoy Bust · Michael Ping'], ['Heal / Morph', 'H (mate thermos)   M (when unlocked)'], ['Scooter', 'Q outdoors, once you own one (Delroy\'s, on the plaza)'], ['Drop', 'G drops one of what\'s in hand, SHIFT+G the stack; E picks up'], ['Phone', 'F to answer when it rings']];
    rows.forEach(([k, v], i) => { this._t(b.x + 14, b.y + 30 + i * 14, k, F(8, C.hi)); this._t(b.x + 110, b.y + 30 + i * 14, v, F(8)); });
  }

  _system() {
    const s = this.scene, b = this.box;
    const items = s.mode === 'client'
      ? [['Resume', () => this.close()], ['Leave the game', () => s.menuQuit(false)]]
      : [['Resume', () => this.close()], ['Save now', () => { s._save(); this.close(); }], ['Export save file (.jpfc.json)', () => s.menuExport()], ['Save and quit to title', () => s.menuQuit(true)]];
    // Language (Trevor): English or Spanish. Switches at once; menus rebuild on refresh.
    items.push([`Language: ${LANG_LABEL[getLang()]}`, () => { setLang(getLang() === 'es' ? 'en' : 'es'); this.refresh(); s._refreshMenu?.(); }]);
    // Settings (task #31): click a row to cycle it. Stored per browser.
    const pct = (k) => `${Math.round(Settings.get(k) * 100)}%`;
    for (const [k, label] of [['music', 'Music'], ['sfx', 'Effects'], ['voice', 'Voices']]) items.push([`${label}: ${pct(k)}`, () => { Settings.set(k, Settings.nextVolume(Settings.get(k))); this.refresh(); }]);
    items.push([`Screen shake: ${Settings.get('shake') ? 'on' : 'off'}`, () => { Settings.set('shake', !Settings.get('shake')); this.refresh(); }]);
    items.push([`Text speed: ${Settings.get('textSpeed')}`, () => { Settings.set('textSpeed', Settings.nextSpeed(Settings.get('textSpeed'))); this.refresh(); }]);
    items.forEach(([label, fn], i) => this._t(b.x + 14, b.y + 32 + i * 18, `› ${label}`, F(9, i === 0 ? C.hi : C.text), fn));
    this._t(b.x + 14, b.y + b.h - 18, s.mode === 'client' ? 'The host keeps the save for everyone.' : `World "${s.save.world.seed}" · saved in this browser`, F(7, C.sub));
  }

  // ---- fab printer: prints from materials ----
  _fab(g) {
    const s = this.scene, b = this.box, c = s.save.party[s.character];
    this._t(b.x + 10, b.y + 7, 'FAB #2 · PRINT', F(9, C.hi));
    this._t(b.x + b.w - 10, b.y + 8, 'W/S A/D select · wheel scroll · ENTER print · [ESC] close', F(6, C.sub)).setOrigin(1, 0);
    const cw = 120, ch = 92, cols = 3, gap = 4, top = b.y + 22, per = Math.max(1, Math.floor((b.h - 36 + gap) / (ch + gap)));
    const avail = RECIPES.map((r, i) => [r, i]).filter(([r]) => !r.req || s.save.flags[r.req]);   // gated recipes stay hidden
    const L = this.scroller.list('fab', { n: avail.length, per, cols, onPick: (j) => { const [r, i] = avail[j] ?? []; if (r && canPay(c, r.cost)) s.menuCraft(i); } });
    this.scroller.bar(g, b.x + b.w - 8, top + 6, per * (ch + gap) - gap - 12, L, (x, y, t) => this._t(x, y, t, F(6, C.hi)));
    avail.forEach(([r, i], j) => {
      if (j < L.first || j >= L.last) return;
      const k = j - L.first, def = ITEMS[r.item], x = b.x + 12 + (k % cols) * (cw + 8), y = top + Math.floor(k / cols) * (ch + gap);
      const can = canPay(c, r.cost), owned = count(c, r.item) + (worn(c, r.item) ? 1 : 0), sel = j === L.sel;
      g.fillStyle(sel ? 0x23293f : can ? 0x1a2030 : 0x121521).fillRoundedRect(x, y, cw, ch, 3).lineStyle(sel ? 2 : 1, sel ? 0xe8e8f0 : can ? 0xffb347 : C.dim, sel || can ? 0.9 : 0.5).strokeRoundedRect(x, y, cw, ch, 3);
      const zc = s.add.zone(x, y, cw, ch).setOrigin(0).setInteractive(); zc.on('pointerdown', () => { if (L.sel !== j) { L.sel = j; this.refresh(); } }); this.root.add(zc);
      g.fillStyle(0x0b0d16).fillRect(x + 5, y + 5, 20, 20);
      this._icon(x + 15, y + 15, r.item);
      this._t(x + 30, y + 6, def.name, { ...F(def.name.length > 14 ? 7 : 8, can ? C.text : C.sub), wordWrap: { width: cw - 34 } });
      this._t(x + 30, y + 16, `${SLOT_LABEL[def.slot] ?? 'Food'}${owned ? ` · have ${owned}` : ''}`, F(6, owned ? C.ok : C.sub));
      this._t(x + 6, y + 29, def.text, { ...F(6, C.sub), wordWrap: { width: cw - 12 }, maxLines: 4 });
      // material cost row: icon + have/need
      Object.entries(r.cost).forEach(([mid, n], k) => {
        const have = count(c, mid), mx = x + 5 + k * 28, my = y + ch - 30;
        this._icon(mx + 5, my + 6, mid).setScale(0.62);
        this._t(mx + 11, my + 3, `${Math.min(have, 99)}/${n}`, F(6, have >= n ? C.ok : C.bad));
      });
      this._t(x + 6, y + ch - 13, can ? '› PRINT' : 'need materials', F(8, can ? C.hi : C.bad), can ? () => s.menuCraft(i) : null);
    });
    this._t(b.x + b.w - 12, b.y + b.h - 12, `${L.sel + 1}/${avail.length}`, F(6, C.sub)).setOrigin(1, 0);
    this._t(b.x + 12, b.y + b.h - 12, 'Materials drop from coderot things and turn up in the world. Shops sell some.', F(6, C.sub));
  }

  // ---- shops: buy with money ----
  // Two panes: a compact list on the left, everything about the selected item on the right (full
  // text, what it does, how it compares with what you're wearing). The pawn also buys.
  _shop(g, id) {
    const s = this.scene, b = this.box, who = s.character, c = s.save.party[who], shop = SHOPS[id]; if (!shop) return;
    const money = s.save.party[s.character]?.money ?? 0, canSell = id === 'pawn';
    if (this._shopFor !== id) { this._shopFor = id; this.shopMode = 'buy'; this.scroller.reset('shop'); }
    this._t(b.x + 10, b.y + 6, shop.title, F(10, C.hi));
    this._t(b.x + b.w - 10, b.y + 6, `$${money}   [ESC] close`, F(9, C.hi)).setOrigin(1, 0);
    this._t(b.x + 10, b.y + 19, shop.lines.join(' '), { ...F(7, C.sub), wordWrap: { width: b.w - 20 }, maxLines: 2 });
    let ty = b.y + 40;
    if (canSell) {
      for (const [mode, label] of [['buy', 'BUY'], ['sell', 'SELL']]) {
        const on = this.shopMode === mode, tx = b.x + 12 + (mode === 'sell' ? 44 : 0);
        const t = this._t(tx, ty, label, F(8, on ? C.hi : C.sub), () => { if (this.shopMode !== mode) this.scroller.reset('shop'); this.shopMode = mode; this.refresh(); });
        if (on) g.fillStyle(0xffb347).fillRect(tx, ty + 10, t.width, 1);
      }
      ty += 14;
    }
    // rows: buy = the shelf; sell = your bag (one row per stack)
    const rows = this.shopMode === 'sell'
      ? c.inventory.map((it, slot) => it && { id: it.id, qty: it.qty, slot, price: sellPrice(it.id) }).filter(Boolean)
      : shop.stock.map((st, i) => ({ id: st.item, i, st, price: s.priceFor(who, st.price), owned: st.once && has(c, st.item), locked: st.needs && !count(c, st.needs) }));
    const listW = 190, rowH = 15, maxRows = Math.floor((b.y + b.h - 8 - ty) / rowH);
    const L = this.scroller.list('shop', { n: rows.length, per: maxRows, onPick: (k) => {
      const r = rows[k]; if (!r) return;
      if (this.shopMode === 'sell') { if (r.price > 0) s.menuSell(r.slot); }
      else if (!r.owned && !r.locked && money >= r.price) s.menuBuy(id, r.i);
    } });
    this.shopSel = L.sel;
    this.scroller.bar(g, b.x + 10 + listW + 3, ty + 6, maxRows * rowH - 14, L, (x, y, t) => this._t(x, y, t, F(6, C.hi)));
    if (!rows.length) this._t(b.x + 14, ty + 4, this.shopMode === 'sell' ? 'Nothing to sell.' : 'Sold out.', F(8, C.sub));
    rows.slice(L.first, L.last).forEach((r, j) => {
      const k = L.first + j, def = ITEMS[r.id], y = ty + j * rowH, x = b.x + 10, sel = k === this.shopSel;
      const ok = this.shopMode === 'sell' ? r.price > 0 : !r.owned && !r.locked && money >= r.price;
      g.fillStyle(sel ? 0x23293f : 0x121521, 1).fillRoundedRect(x, y, listW, rowH - 2, 2);
      if (sel) g.lineStyle(1, 0xffb347, 0.9).strokeRoundedRect(x + 0.5, y + 0.5, listW - 1, rowH - 3, 2);
      this._icon(x + 8, y + 6, r.id).setScale(0.62);
      this._t(x + 17, y + 2, fit(`${def?.name ?? r.id}${r.qty > 1 ? ' ×' + r.qty : ''}`, listW - 64, 7), F(7, ok ? C.text : C.sub));
      const right = this.shopMode === 'sell' ? (r.price ? `$${r.price}` : '-') : r.owned ? 'owned' : `$${r.price}`;
      this._t(x + listW - 4, y + 2, right, F(7, this.shopMode === 'sell' ? C.ok : r.owned ? C.ok : money >= r.price ? C.hi : C.bad)).setOrigin(1, 0);
      const z = s.add.zone(x, y, listW, rowH - 2).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => { L.sel = k; this.refresh(); });
      this.root.add(z);
    });
    // detail pane
    const r = rows[this.shopSel]; if (!r) return;
    const def = ITEMS[r.id], px = b.x + 10 + listW + 10, pw = b.x + b.w - 10 - px, py = ty;
    g.fillStyle(0x10121e, 1).fillRoundedRect(px, py, pw, b.y + b.h - 8 - py, 4).lineStyle(1, 0x3a4060).strokeRoundedRect(px, py, pw, b.y + b.h - 8 - py, 4);
    g.fillStyle(0x0b0d16).fillRect(px + 8, py + 8, 36, 36);
    this._icon(px + 26, py + 26, r.id).setScale(2);
    this._t(px + 52, py + 8, def.name, F(10, C.hi));
    const kind = { weapon: 'Melee weapon', ranged: 'Ranged weapon', consumable: 'Food', material: 'Material', junk: 'Curio', key: 'Key item', instrument: 'Instrument', gift: 'Gift' }[def.slot] ?? `${SLOT_LABEL[def.slot] ?? def.slot}`;
    this._t(px + 52, py + 22, `${kind}${def.heal ? ` · heals ${def.heal}` : ''}`, F(7, C.ok));
    const desc = this._t(px + 8, py + 50, def.text ?? '', { ...F(7, C.text), wordWrap: { width: pw - 16 } });
    let dy = py + 56 + desc.height;
    // compare with what's worn in that slot
    const gearSlot = def.slot && c.equipped && def.slot in c.equipped ? def.slot : null;
    if (gearSlot && (def.mods || def.swing || def.gun)) {
      const now = playerMods(c, who), next = playerMods({ ...c, equipped: { ...c.equipped, [gearSlot]: r.id } }, who);
      const KEYS = { melee: ['melee', 1], shot: ['shot dmg', 1], armor: ['armor', 100], maxHp: ['max HP', 1], speed: ['speed', 100], crit: ['crit', 100], sta: ['stamina', 1], abilityPower: ['ability', 100], markDmg: ['vs marked', 100], loot: ['loot', 100] };
      const parts = [];
      if (gearSlot === 'weapon') {   // weapons: compare what a hit actually does, not the flat bonus
        const hit = (m) => (m.swing?.damage ?? 12) + (m.melee ?? 0), rate = (m) => m.swing?.cooldown ?? 0.38;
        const h0 = hit(now), h1 = hit(next), d0 = h0 / rate(now), d1 = h1 / rate(next);
        parts.push({ txt: `hit ${h1} (now ${h0})`, up: h1 >= h0 }, { txt: `${d1.toFixed(0)} dmg/s (now ${d0.toFixed(0)})`, up: d1 >= d0 });
        if (next.swing) parts.push({ txt: `reach ${next.swing.range ?? 20}, ${next.swing.arc >= 0.7 ? 'wide' : next.swing.arc <= 0.35 ? 'narrow' : 'normal'} arc`, up: true });
      }
      for (const [k, [label, mul]] of Object.entries(KEYS)) {
        if (gearSlot === 'weapon' && k === 'melee') continue;
        const dv = ((next[k] ?? 0) - (now[k] ?? 0)) * mul;
        if (Math.abs(dv) >= 0.5) parts.push({ txt: `${dv > 0 ? '+' : ''}${Math.round(dv)}${mul === 100 ? '%' : ''} ${label}`, up: dv > 0 });
      }
      const wornName = c.equipped[gearSlot] ? ITEMS[c.equipped[gearSlot]]?.name : 'nothing';
      this._t(px + 8, dy, `vs. ${wornName}:`, F(7, C.sub)); dy += 11;
      if (!parts.length) { this._t(px + 8, dy, 'no change', F(7, C.sub)); dy += 11; }
      parts.forEach((p) => { this._t(px + 8, dy, p.txt, F(7, p.up ? C.ok : C.bad)); dy += 10; });
      if (def.owner && def.owner !== who) { this._t(px + 8, dy, `Only ${def.owner[0].toUpperCase() + def.owner.slice(1)} can use this.`, F(7, C.bad)); dy += 11; }
    }
    // action button
    const by = b.y + b.h - 30;
    if (this.shopMode === 'sell') {
      const ok = r.price > 0;
      this._button(g, px + 8, by, pw - 16, ok ? `SELL FOR $${r.price}` : 'Wick won\'t take that', ok, () => s.menuSell(r.slot));
    } else {
      const ok = !r.owned && !r.locked && money >= r.price;
      const label = r.owned ? 'Already owned' : r.locked ? `Needs ${ITEMS[r.st.needs].name.toLowerCase()}` : money < r.price ? `Need $${r.price - money} more` : `BUY FOR $${r.price}${r.price < r.st.price ? `  (was $${r.st.price})` : ''}`;
      this._button(g, px + 8, by, pw - 16, label, ok, () => s.menuBuy(id, r.i));
    }
  }

  _button(g, x, y, w, label, enabled, fn) {
    g.fillStyle(enabled ? 0x2b2240 : 0x15172a).fillRoundedRect(x, y, w, 20, 3).lineStyle(1, enabled ? 0xffb347 : 0x3a4060).strokeRoundedRect(x, y, w, 20, 3);
    this._t(x + w / 2, y + 5, label, F(8, enabled ? C.hi : C.sub)).setOrigin(0.5, 0);
    if (enabled) { const z = this.scene.add.zone(x, y, w, 20).setOrigin(0).setInteractive({ useHandCursor: true }); z.on('pointerdown', fn); this.root.add(z); }
  }

  // MASTER ARMORER: upgrade anything you're wearing, +1 to +5. Each level is +15% of its bonuses.
  _armorer(g) {
    const s = this.scene, b = this.box, who = s.character, c = s.save.party[who], money = c?.money ?? 0;
    this._t(b.x + 10, b.y + 7, 'OTTOLINE BRACK · MASTER ARMORER', F(10, C.hi));
    this._t(b.x + b.w - 10, b.y + 7, `$${money}   [ESC] close`, F(8, C.hi)).setOrigin(1, 0);
    this._t(b.x + 10, b.y + 20, '"Bring it here. I don\'t make new things. I make your things better."', { ...F(7, C.sub), wordWrap: { width: b.w - 20 } });
    const worn = Object.entries(c.equipped).filter(([, id]) => id && ITEMS[id]?.mods && canWear(ITEMS[id], who));
    if (!worn.length) this._t(b.x + 12, b.y + 44, 'You aren\'t wearing anything worth her time.', F(8, C.sub));
    const rowH = 24, per = Math.floor((b.h - 50) / rowH);
    const canUp = (id) => { const lvl = c.upgrades?.[id] ?? 0, cost = upgradeCost(lvl); return lvl < MAX_UPGRADE && money >= cost.money && Object.entries(cost.mats).every(([m, n]) => count(c, m) >= n); };
    const L = this.scroller.list('armorer', { n: worn.length, per, onPick: (i) => { const id = worn[i]?.[1]; if (id && canUp(id)) s.gear.menuUpgrade(id); } });
    this.scroller.bar(g, b.x + b.w - 9, b.y + 44, per * rowH - 15, L, (x, y, t) => this._t(x, y, t, F(6, C.hi)));
    if (worn.length) this._t(b.x + b.w - 12, b.y + b.h - 10, 'W/S select · ENTER upgrade', F(6, '#4a5175')).setOrigin(1, 0);
    worn.slice(L.first, L.last).forEach(([slot, id], j) => {
      const i = L.first + j, sel = i === L.sel, def = ITEMS[id], lvl = c.upgrades?.[id] ?? 0, y = b.y + 38 + j * rowH, x = b.x + 12, maxed = lvl >= MAX_UPGRADE;
      const cost = upgradeCost(lvl), mats = Object.entries(cost.mats), can = canUp(id);
      g.fillStyle(sel ? 0x23293f : can ? 0x1a2030 : 0x121521).fillRoundedRect(x, y, b.w - 24, rowH - 3, 2).lineStyle(1, sel ? 0xe8e8f0 : def.unique ? 0xffd27f : can ? 0xffb347 : C.dim, sel ? 1 : can ? 0.8 : 0.4).strokeRoundedRect(x, y, b.w - 24, rowH - 3, 2);
      const zr = s.add.zone(x, y, b.w - 160, rowH - 3).setOrigin(0).setInteractive(); zr.on('pointerdown', () => { L.sel = i; this.refresh(); }); this.root.add(zr);
      this._icon(x + 10, y + (rowH - 3) / 2, id).setScale(Math.min(1, (rowH - 5) / 18));
      this._t(x + 24, y + 2, `${def.name} ${lvl ? '+' + lvl : ''}  (${SLOT_NAMES[slot]})`, F(7, def.unique ? '#ffd27f' : C.text));
      this._t(x + 24, y + 11, fit(maxed ? modText(scaleMods(def.mods, lvl)) : `${modText(scaleMods(def.mods, lvl))}  →  ${modText(scaleMods(def.mods, lvl + 1))}`, b.w - 150, 5), F(5, C.sub));
      const price = maxed ? 'MAX' : `$${cost.money} + ${mats.map(([m, n]) => `${n} ${ITEMS[m].name.toLowerCase()}`).join(', ')}  › UPGRADE`;
      this._t(x + b.w - 30, y + 5, price, F(6, maxed ? C.ok : can ? C.hi : C.bad), can ? () => s.gear.menuUpgrade(id) : null).setOrigin(1, 0);
    });
  }

  // FAST TRAVEL (winged boots, hold B): anywhere the party has already been.
  _travel(g) {
    const s = this.scene, b = this.box, here = s.map.id;
    this._t(b.x + 10, b.y + 7, 'WINGED BOOTS · FAST TRAVEL', F(10, '#ffb347'));
    this._t(b.x + b.w - 10, b.y + 7, '[ESC] close', F(8, C.hi)).setOrigin(1, 0);
    const dests = (s.save.world.visited ?? []).filter((id) => MAPS[id] && id !== here && id !== 'platform');
    if (!dests.length) this._t(b.x + 12, b.y + 30, 'Nowhere you\'ve been yet.', F(8, C.sub));
    const per = Math.floor((b.h - 34) / 18), go = (id) => { s.gear.travel(id); this.scene._closeMenu(); };
    const L = this.scroller.list('travel', { n: dests.length, per, onPick: (i) => go(dests[i]) });
    this.scroller.bar(g, b.x + b.w - 9, b.y + 30, per * 18 - 6, L, (x, y, t) => this._t(x, y, t, F(6, C.hi)));
    dests.slice(L.first, L.last).forEach((id, j) => {
      const i = L.first + j, y = b.y + 28 + j * 18, x = b.x + 12, sel = i === L.sel;
      g.fillStyle(sel ? 0x23293f : 0x1a2030).fillRoundedRect(x, y, b.w - 24, 15, 2).lineStyle(1, sel ? 0xe8e8f0 : 0xffb347, sel ? 1 : 0.7).strokeRoundedRect(x, y, b.w - 24, 15, 2);
      this._t(x + 8, y + 3, `${i + 1}. ${MAPS[id].name ?? id}`, F(8, C.text), () => go(id));
    });
    this._travelKeys = dests;
  }

  // STATS: D&D-style ability scores (D-017). Spend level-up points; each score's modifier feeds combat
  // and the NPC approaches (Charm, Deceive, Intimidate, Insight, Investigate, Pickpocket).
  _stats(g) {
    const s = this.scene, b = this.box, who = s.character, c = s.save.party[who], sc = scoresOf(c, who), pts = c.abilityPoints ?? 0;
    this._t(b.x + 14, b.y + 26, `${ROOMMATES[who].name} · level ${c.level}`, F(9, C.text));
    this._t(b.x + b.w - 14, b.y + 26, pts ? `${pts} point${pts > 1 ? 's' : ''} to spend` : 'no points to spend (1 per level, 2 every 5th)', F(8, pts ? C.hi : C.sub)).setOrigin(1, 0);
    ABILITY_KEYS.forEach((k, i) => {
      const y = b.y + 44 + i * 28, x = b.x + 14, score = sc[k], m = modOf(score), cost = raiseCost(score), can = pts >= cost && score < MAX_SCORE;
      g.fillStyle(0x151827).fillRoundedRect(x, y, b.w - 28, 24, 3).lineStyle(1, can ? 0xffb347 : C.dim, can ? 0.7 : 0.4).strokeRoundedRect(x, y, b.w - 28, 24, 3);
      this._t(x + 8, y + 4, ABILITIES[k].short, F(10, C.hi));
      this._t(x + 40, y + 3, ABILITIES[k].name, F(8, C.text));
      this._t(x + 40, y + 13, ABILITIES[k].does, F(6, C.sub));
      this._t(x + b.w - 120, y + 5, `${score}`, F(11, C.text)).setOrigin(1, 0);
      this._t(x + b.w - 112, y + 7, `(${fmtMod(m)})`, F(8, m > 0 ? C.ok : m < 0 ? C.bad : C.sub));
      if (score >= MAX_SCORE) this._t(x + b.w - 40, y + 7, 'max', F(8, C.ok)).setOrigin(1, 0);
      else this._t(x + b.w - 40, y + 5, `+1 (${cost} pt${cost > 1 ? 's' : ''})`, F(can ? 9 : 8, can ? C.hi : '#4a5175'), can ? () => s.menuAbility(k) : undefined).setOrigin(1, 0);   // higher scores cost more
    });
  }
}
