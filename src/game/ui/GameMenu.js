// In-game menu: tabbed panel (INVENTORY · SKILLS · MAP · CONTROLS · SYSTEM) plus the FAB printer.
// Rebuilt from scratch on every refresh (cheap, and never shows stale state).
import { VIEW } from '../../view.js';
import { ITEMS, RECIPES, SKILLS, SHOPS, playerMods } from '../../content/items.js';
import { canPay, count } from '../../engine/inventory.js';
import { SKILL_TREE, skillOpen } from '../../content/skills.js';
import { ROOMMATES } from '../scenes/BootScene.js';
import { QUESTS, questState } from '../../content/quests.js';

export const TABS = ['inventory', 'quests', 'skills', 'map', 'controls', 'system'];
const TAB_LABEL = { inventory: 'INVENTORY', quests: 'QUESTS', skills: 'SKILLS', map: 'MAP', controls: 'CONTROLS', system: 'SYSTEM' };
const C = { panel: 0x0b0d16, edge: 0xf2a6b8, dim: 0x5d6487, text: '#e8e8f0', sub: '#9aa3c7', hi: '#ffb347', ok: '#7fb069', bad: '#d65db1' };
const F = (size = 8, color = C.text) => ({ fontFamily: 'monospace', fontSize: `${size}px`, color });
const SLOT_LABEL = { weapon: 'Melee', ranged: 'Ranged', armor: 'Armor', gadget: 'Gadget', charm: 'Charm' };

export class GameMenu {
  constructor(scene) {
    this.scene = scene;
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9600).setVisible(false);
    this.tab = null;
    this.box = { x: 40, y: 22, w: VIEW.w - 80, h: VIEW.h - 44 };
  }

  get open() { return !!this.tab; }
  contains(x, y) { const b = this.box; return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
  show(tab) {
    const wasOpen = !!this.tab; this.tab = tab; this.refresh();
    if (!wasOpen) { this.root.setAlpha(0); this.scene.tweens.add({ targets: this.root, alpha: 1, duration: 140 }); }
  }
  close() { this.held = null; this.hover = null; this.skillHover = null; this.tab = null; this.root.removeAll(true); this.root.setVisible(false); }
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
    this.root.removeAll(true); this.tip = [];
    this.root.setVisible(true);
    const b = this.box, g = this._g();
    g.fillStyle(0x000000, 0.45).fillRect(0, 0, VIEW.w, VIEW.h);                 // dim the world
    g.fillStyle(C.panel, 0.97).fillRoundedRect(b.x, b.y, b.w, b.h, 3).lineStyle(1, C.edge, 0.9).strokeRoundedRect(b.x, b.y, b.w, b.h, 3);
    if (this.tab === 'fab') return this._fab(g);
    if (this.tab?.startsWith('shop:')) return this._shop(g, this.tab.slice(5));
    // tab bar
    let x = b.x + 8;
    for (const tab of TABS) {
      const on = tab === this.tab;
      const t = this._t(x, b.y + 6, TAB_LABEL[tab], F(8, on ? C.hi : C.sub), () => this.show(tab));
      if (on) g.fillStyle(0xffb347).fillRect(x, b.y + 16, t.width, 1);
      x += t.width + 12;
    }
    this._t(b.x + b.w - 8, b.y + 6, '[ESC] close  [A/D] tabs', F(7, C.sub)).setOrigin(1, 0);
    g.lineStyle(1, C.dim, 0.6).lineBetween(b.x + 6, b.y + 20, b.x + b.w - 6, b.y + 20);
    this[`_${this.tab}`](g);
  }

  // ---- tabs ----
  // Minecraft-style grid: 27 backpack slots + the 9-slot hotbar, equipment beside the character.
  // Left click picks a stack up / puts it down (merge or swap); right click picks up half, or uses /
  // equips when your hand is empty. Drop gear on an equipment slot to wear it.
  _inventory(g) {
    const s = this.scene, who = s.character, c = s.save.party[who], b = this.box;
    const mods = playerMods(c, who), inv = c.inventory ?? [];
    const S = 20, GAP = 2;
    // character preview
    g.fillStyle(0x151827).fillRoundedRect(b.x + 10, b.y + 28, 84, 118, 3);
    const spr = s.add.sprite(b.x + 52, b.y + 128, who).setOrigin(0.5, 1).setScale(4).play(`${who}_idle_down`);
    this.root.add(spr);
    this._t(b.x + 52, b.y + 132, `${ROOMMATES[who].name} · lv ${c.level}`, F(8, C.text)).setOrigin(0.5, 0);
    // equipment column
    const ex = b.x + 100, ey = b.y + 28;
    Object.keys(SLOT_LABEL).forEach((slot, k) => {
      const y = ey + k * (S + GAP), id = c.equipped[slot];
      g.fillStyle(0x151827).fillRect(ex, y, S, S).lineStyle(1, id ? 0x7fb069 : C.dim, 0.9).strokeRect(ex + 0.5, y + 0.5, S - 1, S - 1);
      if (id) this._icon(ex + S / 2, y + S / 2, id);
      else this._t(ex + S / 2, y + S / 2, SLOT_LABEL[slot][0], F(7, '#3a4060')).setOrigin(0.5);
      const z = s.add.zone(ex, y, S, S).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => {
        if (this.held != null) { const it = inv[this.held]; if (it && ITEMS[it.id]?.slot === slot) s.menuUse(it.id); this.held = null; return this.refresh(); }
        if (id) s.menuUse(id);   // click a worn item to take it off
      });
      z.on('pointerover', () => { this.hover = id ? { id } : { label: `${SLOT_LABEL[slot]} slot` }; this._drawTip(); });
      this.root.add(z);
    });
    // stats under the preview
    const stat = [`HP ${100 + (mods.maxHp || 0)}   Armor ${Math.round((mods.armor || 0) * 100)}%`, `Melee +${mods.melee}   Ranged ${mods.gun ? '+' + mods.shot : '-'}`, `$${s.save.world.money ?? 0}   XP ${c.xp}/${c.level * 30}`];
    stat.forEach((line, k) => this._t(b.x + 10, b.y + 152 + k * 10, line, F(7, k === 2 ? C.hi : C.sub)));
    // grid + hotbar
    const gx = b.x + 132, gy = b.y + 36;
    this._t(gx, gy - 4, 'BACKPACK', F(6, C.sub)).setOrigin(0, 1);
    const slotXY = (i) => i < 9 ? [gx + i * (S + GAP), gy + 3 * (S + GAP) + 10] : [gx + ((i - 9) % 9) * (S + GAP), gy + Math.floor((i - 9) / 9) * (S + GAP)];
    this._t(gx, gy + 3 * (S + GAP) + 6, 'HOTBAR  (keys 1-9)', F(6, C.sub)).setOrigin(0, 1);
    const eq = new Set(Object.values(c.equipped || {}));
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
        if (right && !p.event?.shiftKey) { const def = ITEMS[it.id]; if (def?.slot === 'material' || it.qty > 1 && def?.slot !== 'consumable') { this.held = i; this.heldHalf = true; } else s.menuUseSlot(i); return this.refresh(); }
        this.held = i; this.heldHalf = false; this.refresh();
      });
      z.on('pointerover', () => { this.hover = it ? { id: it.id, qty: it.qty } : null; this._drawTip(); });
      this.root.add(z);
    }
    // the held stack follows the cursor
    if (this.held != null && inv[this.held]) {
      const ghost = this._icon(0, 0, inv[this.held].id).setDepth(9700);
      const follow = (p) => ghost.setPosition(p.x / 4, p.y / 4);
      follow(s.input.activePointer);
      s.input.on('pointermove', follow); ghost.once('destroy', () => s.input.off('pointermove', follow));
    }
    // tooltip area
    this.tipY = gy + 4 * (S + GAP) + 16; this.tipX = gx; this.tipW = b.x + b.w - gx - 10;
    this._t(gx, b.y + b.h - 12, 'click: pick up / place · right click: use / equip / half', F(6, '#4a5175'));
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
    const kind = { weapon: 'Melee weapon', ranged: 'Ranged weapon', armor: 'Armor', gadget: 'Gadget', charm: 'Charm', consumable: 'Food', material: 'Material', junk: 'Curio', key: 'Key item' }[def.slot] ?? '';
    const stats = Object.entries(def.mods || {}).filter(([k]) => k !== 'gun').map(([k, v]) => `${{ melee: 'melee', shot: 'shot dmg', shotCd: 'fire rate', armor: 'armor', maxHp: 'max HP' }[k] ?? k} ${k === 'armor' ? Math.round(v * 100) + '%' : (v > 0 ? '+' : '') + v}`).join('  ');
    this.tip.push(this._t(x, y, `${def.name}${h.qty > 1 ? ' ×' + h.qty : ''}`, F(9, C.hi)));
    this.tip.push(this._t(x, y + 11, `${kind}${def.heal ? `  · heals ${def.heal}` : ''}${stats ? '  · ' + stats : ''}`, F(6, C.ok)));
    this.tip.push(this._t(x, y + 20, def.text ?? '', { ...F(7, C.sub), wordWrap: { width: this.tipW } }));
  }

  _quests() {
    const s = this.scene, b = this.box, qs = questState(s.save);
    let y = b.y + 28;
    const show = QUESTS.filter((q) => qs[q.id].started || qs[q.id].done);
    if (!show.length) this._t(b.x + 14, y, 'Nothing yet.', F(8, C.sub));
    for (const q of show) {
      const st = qs[q.id];
      this._t(b.x + 14, y, `${st.done ? '✓' : q.main ? '★' : '·'} ${q.title}${q.main ? '' : '  (side)'}`, F(9, st.done ? C.ok : q.main ? C.hi : C.text)); y += 12;
      if (!st.done) { this._t(b.x + 26, y, q.stages[st.stage]?.text ?? '', { ...F(7, C.sub), wordWrap: { width: b.w - 50 } }); y += 18; }
      if (y > b.y + b.h - 20) break;
    }
  }

  // Skill tree: three branches of four tiers meeting at a capstone. Hover for details, click to learn.
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
    const foot = r >= n.max ? 'Maxed.' : !open ? `Needs: ${need.join(', ')}` : (c.skillPoints ?? 0) > 0 ? 'Click to learn (1 point).' : 'No points. Level up.';
    this.tip.push(this._t(t.x, t.y + 92, foot, { ...F(7, !open ? C.bad : C.ok), wordWrap: { width: t.w } }));
  }

  _map(g) {
    const s = this.scene, b = this.box;
    const vx = b.x + 10, vy = b.y + 26, vw = b.w - 20, vh = b.h - 44;
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

  _redrawSoon() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = null; if (this.tab === 'map') this.refresh(); }); }

  _controls() {
    const b = this.box;
    const rows = [['Move', 'WASD / arrows (diagonals work)'], ['Dash', 'SPACE / SHIFT (uses stamina)'], ['Hit', 'Left click'],
      ['Shoot', 'Right click, once you have a ranged weapon'], ['Use / talk', 'E when close; walk into doors'], ['Dialogue', 'E (or SPACE) to continue; click or 1-6 to choose'],
      ['Menu', 'ESC   Inventory I   Skills K   Map TAB'], ['Hotbar', '1-9 use or equip that slot'], ['Ability', 'R: Trevor Riff · Manuel Decoy Bust · Michael Ping'], ['Heal / Morph', 'H (mate thermos)   M (when unlocked)'], ['Scooter', 'Q outdoors, once you own one (Delroy\'s, on the plaza)'], ['Phone', 'F to answer when it rings']];
    rows.forEach(([k, v], i) => { this._t(b.x + 14, b.y + 30 + i * 15, k, F(8, C.hi)); this._t(b.x + 110, b.y + 30 + i * 15, v, F(8)); });
  }

  _system() {
    const s = this.scene, b = this.box;
    const items = s.mode === 'client'
      ? [['Resume', () => this.close()], ['Leave the game', () => s.menuQuit(false)]]
      : [['Resume', () => this.close()], ['Save now', () => { s._save(); this.close(); }], ['Export save file (.jpfc.json)', () => s.menuExport()], ['Save and quit to title', () => s.menuQuit(true)]];
    items.forEach(([label, fn], i) => this._t(b.x + 14, b.y + 32 + i * 18, `› ${label}`, F(9, i === 0 ? C.hi : C.text), fn));
    this._t(b.x + 14, b.y + b.h - 18, s.mode === 'client' ? 'The host keeps the save for everyone.' : `World "${s.save.world.seed}" · saved in this browser`, F(7, C.sub));
  }

  // ---- fab printer: prints from materials ----
  _fab(g) {
    const s = this.scene, b = this.box, c = s.save.party[s.character];
    this._t(b.x + 10, b.y + 7, 'FAB #2 · PRINT', F(9, C.hi));
    this._t(b.x + b.w - 10, b.y + 7, '[ESC] close', F(8, C.sub)).setOrigin(1, 0);
    const cw = 120, ch = 92, cols = 3;
    RECIPES.forEach((r, i) => {
      const def = ITEMS[r.item], x = b.x + 12 + (i % cols) * (cw + 8), y = b.y + 24 + Math.floor(i / cols) * (ch + 6);
      const can = canPay(c, r.cost), owned = count(c, r.item);
      g.fillStyle(can ? 0x1a2030 : 0x121521).fillRoundedRect(x, y, cw, ch, 3).lineStyle(1, can ? 0xffb347 : C.dim, can ? 0.9 : 0.5).strokeRoundedRect(x, y, cw, ch, 3);
      g.fillStyle(0x0b0d16).fillRect(x + 5, y + 5, 20, 20);
      this._icon(x + 15, y + 15, r.item);
      this._t(x + 30, y + 6, def.name, { ...F(def.name.length > 14 ? 7 : 8, can ? C.text : C.sub), wordWrap: { width: cw - 34 } });
      this._t(x + 30, y + 16, `${SLOT_LABEL[def.slot] ?? 'Food'}${owned ? ` · have ${owned}` : ''}`, F(6, owned ? C.ok : C.sub));
      this._t(x + 6, y + 29, def.text, { ...F(6, C.sub), wordWrap: { width: cw - 12 } });
      // material cost row: icon + have/need
      Object.entries(r.cost).forEach(([mid, n], k) => {
        const have = count(c, mid), mx = x + 5 + k * 28, my = y + ch - 30;
        this._icon(mx + 5, my + 6, mid).setScale(0.62);
        this._t(mx + 11, my + 3, `${Math.min(have, 99)}/${n}`, F(6, have >= n ? C.ok : C.bad));
      });
      this._t(x + 6, y + ch - 13, can ? '› PRINT' : 'need materials', F(8, can ? C.hi : C.bad), can ? () => s.menuCraft(i) : null);
    });
    this._t(b.x + 12, b.y + b.h - 12, 'Materials drop from coderot things and turn up in the world. Shops sell some.', F(6, C.sub));
  }

  // ---- shops: buy with money ----
  _shop(g, id) {
    const s = this.scene, b = this.box, c = s.save.party[s.character], shop = SHOPS[id]; if (!shop) return;
    const money = s.save.world.money ?? 0;
    this._t(b.x + 10, b.y + 7, shop.title, F(10, C.hi));
    this._t(b.x + b.w - 10, b.y + 7, `$${money}   [ESC] close`, F(8, C.hi)).setOrigin(1, 0);
    this._t(b.x + 10, b.y + 20, shop.lines.join(' '), { ...F(7, C.sub), wordWrap: { width: b.w - 20 } });
    shop.stock.forEach((st, i) => {
      const def = ITEMS[st.item], y = b.y + 40 + i * 30, x = b.x + 12;
      const owned = st.once && count(c, st.item) > 0, locked = st.needs && !count(c, st.needs);
      const price = s.priceFor(s.character, st.price), can = !owned && !locked && money >= price;
      g.fillStyle(can ? 0x1a2030 : 0x121521).fillRoundedRect(x, y, b.w - 24, 26, 2).lineStyle(1, can ? 0xffb347 : C.dim, can ? 0.8 : 0.4).strokeRoundedRect(x, y, b.w - 24, 26, 2);
      g.fillStyle(0x0b0d16).fillRect(x + 3, y + 3, 20, 20);
      this._icon(x + 13, y + 13, st.item);
      this._t(x + 28, y + 3, def.name, F(8, can ? C.text : C.sub));
      this._t(x + 28, y + 14, def.text, { ...F(6, C.sub), wordWrap: { width: b.w - 140 } });
      const right = owned ? 'owned' : locked ? `needs ${ITEMS[st.needs].name.toLowerCase()}` : `${price < st.price ? `($${st.price}) ` : ''}$${price}  › BUY`;
      this._t(x + b.w - 30, y + 8, right, F(8, owned ? C.ok : can ? C.hi : C.bad), can ? () => s.menuBuy(id, i) : null).setOrigin(1, 0);
    });
  }
}
