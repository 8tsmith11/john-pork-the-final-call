// In-game menu: tabbed panel (INVENTORY · SKILLS · MAP · CONTROLS · SYSTEM) plus the FAB printer.
// Rebuilt from scratch on every refresh (cheap, and never shows stale state).
import { VIEW } from '../../view.js';
import { ITEMS, RECIPES, SKILLS, playerMods } from '../../content/items.js';
import { ROOMMATES } from '../scenes/BootScene.js';

export const TABS = ['inventory', 'skills', 'map', 'controls', 'system'];
const TAB_LABEL = { inventory: 'INVENTORY', skills: 'SKILLS', map: 'MAP', controls: 'CONTROLS', system: 'SYSTEM' };
const C = { panel: 0x0b0d16, edge: 0xf2a6b8, dim: 0x5d6487, text: '#e8e8f0', sub: '#9aa3c7', hi: '#ffb347', ok: '#7fb069', bad: '#d65db1' };
const F = (size = 8, color = C.text) => ({ fontFamily: 'monospace', fontSize: `${size}px`, color });
const SLOT_LABEL = { weapon: 'Melee', ranged: 'Ranged', armor: 'Armor', gadget: 'Gadget' };

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
  close() { this.tab = null; this.root.removeAll(true); this.root.setVisible(false); }
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
    this.root.removeAll(true);
    this.root.setVisible(true);
    const b = this.box, g = this._g();
    g.fillStyle(0x000000, 0.45).fillRect(0, 0, VIEW.w, VIEW.h);                 // dim the world
    g.fillStyle(C.panel, 0.97).fillRoundedRect(b.x, b.y, b.w, b.h, 3).lineStyle(1, C.edge, 0.9).strokeRoundedRect(b.x, b.y, b.w, b.h, 3);
    if (this.tab === 'fab') return this._fab(g);
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
  _inventory(g) {
    const s = this.scene, who = s.character, c = s.save.party[who], b = this.box;
    const mods = playerMods(c, who);
    // character preview
    g.fillStyle(0x151827).fillRoundedRect(b.x + 10, b.y + 28, 92, 150, 3);
    const spr = s.add.sprite(b.x + 56, b.y + 150, who).setOrigin(0.5, 1).setScale(4).play(`${who}_idle_down`);
    this.root.add(spr);
    this._t(b.x + 56, b.y + 156, ROOMMATES[who].name, F(9, C.text)).setOrigin(0.5, 0);
    this._t(b.x + 56, b.y + 167, `level ${c.level}${c.morph.stage ? ' · morph ' + c.morph.stage : ''}`, F(7, C.sub)).setOrigin(0.5, 0);
    // stats
    const sx = b.x + 112, sy = b.y + 28;
    this._t(sx, sy, 'STATS', F(7, C.sub));
    const stat = [`Max HP   ${100 + (mods.maxHp || 0)}`, `Melee    +${mods.melee}`, `Ranged   ${mods.gun ? '+' + mods.shot : 'no weapon'}`,
      `Armor    ${Math.round((mods.armor || 0) * 100)}%`, `Scrap    ${s.save.world.scrap ?? 0}`, `XP       ${c.xp}/${c.level * 30}`];
    stat.forEach((line, i) => this._t(sx, sy + 11 + i * 10, line, F(8)));
    // equipment
    const ex = b.x + 112, ey = b.y + 102;
    this._t(ex, ey, 'EQUIPPED', F(7, C.sub));
    Object.keys(SLOT_LABEL).forEach((slot, i) => {
      const id = c.equipped[slot];
      this._t(ex, ey + 11 + i * 10, `${SLOT_LABEL[slot].padEnd(7)} ${id ? ITEMS[id]?.name ?? id : '·'}`, F(8, id ? C.text : C.sub));
    });
    // items
    const ix = b.x + 236, iy = b.y + 28;
    this._t(ix, iy, 'ITEMS  (click to equip / use)', F(7, C.sub));
    const counts = new Map();
    for (const it of c.inventory) counts.set(it.id, (counts.get(it.id) ?? 0) + (it.qty ?? 1));
    if (!counts.size) this._t(ix, iy + 12, 'Nothing yet. Print gear at Fab #2\nin the engineering room.', F(8, C.sub));
    [...counts].forEach(([id, n], i) => {
      const def = ITEMS[id]; const eq = Object.values(c.equipped).includes(id);
      const label = `${def?.name ?? id}${n > 1 ? ' ×' + n : ''}${eq ? '  (equipped)' : ''}`;
      this._t(ix, iy + 12 + i * 20, label, F(8, eq ? C.ok : C.text), () => s.menuUse(id));
      this._t(ix, iy + 21 + i * 20, def?.text ?? '', { ...F(6, C.sub), wordWrap: { width: b.x + b.w - ix - 10 } });
    });
  }

  _skills() {
    const s = this.scene, who = s.character, c = s.save.party[who], b = this.box;
    this._t(b.x + 12, b.y + 28, `${ROOMMATES[who].name}: ${c.skillPoints} skill point${c.skillPoints === 1 ? '' : 's'} to spend`, F(8, c.skillPoints ? C.hi : C.sub));
    (SKILLS[who] || []).forEach((sk, i) => {
      const r = c.skills[sk.id] ?? 0, y = b.y + 46 + i * 34;
      const pips = '■'.repeat(r) + '□'.repeat(sk.max - r);
      this._t(b.x + 12, y, `${sk.name}   ${pips}`, F(9, r >= sk.max ? C.ok : C.text), () => s.menuLearn(sk.id));
      this._t(b.x + 12, y + 12, sk.text + (r < sk.max && c.skillPoints ? '   · click to learn' : ''), F(7, C.sub));
    });
  }

  _map(g) {
    const b = this.box;
    this.scene.drawAreaMap(g, b.x + 12, b.y + 28, b.w - 150, b.h - 40);
    const visited = this.scene.save.world.visited || [];
    this._t(b.x + b.w - 130, b.y + 28, 'AREAS FOUND', F(7, C.sub));
    visited.forEach((id, i) => this._t(b.x + b.w - 130, b.y + 40 + i * 11, this.scene.mapName(id) + (id === this.scene.map.id ? '  ◀' : ''), F(7, id === this.scene.map.id ? C.hi : C.text)));
  }

  _controls() {
    const b = this.box;
    const rows = [['Move', 'WASD / arrows (diagonals work)'], ['Dash', 'SPACE / SHIFT (uses stamina)'], ['Hit', 'Left click'],
      ['Shoot', 'Right click, once you have a ranged weapon'], ['Use / talk', 'E when close; walk into doors'], ['Dialogue', 'E (or SPACE) to continue; click or 1-6 to choose'],
      ['Menu', 'ESC   Inventory I   Skills K   Map TAB'], ['Heal / Morph', 'H (mate thermos)   M (when unlocked)'], ['Phone', 'F to answer when it rings']];
    rows.forEach(([k, v], i) => { this._t(b.x + 14, b.y + 30 + i * 15, k, F(8, C.hi)); this._t(b.x + 110, b.y + 30 + i * 15, v, F(8)); });
  }

  _system() {
    const s = this.scene, b = this.box;
    const items = s.mode === 'client'
      ? [['Resume', () => this.close()], ['Leave the game', () => s.menuQuit(false)]]
      : [['Resume', () => this.close()], ['Save now', () => { s._save(); this.close(); }], ['Export save file (.jpfc.json)', () => s.menuExport()], ['Save and quit to title', () => s.menuQuit(true)]];
    items.forEach(([label, fn], i) => this._t(b.x + 14, b.y + 32 + i * 18, `› ${label}`, F(9, i === 0 ? C.hi : C.text), fn));
    // Settings (per browser).
    const get = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
    const set = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } this.refresh(); };
    const sy = b.y + 32 + items.length * 18 + 10;
    this._t(b.x + 14, sy, 'SETTINGS', F(7, C.sub));
    const crude = get('jpfc.crudeHumor', 'on') !== 'off';
    this._t(b.x + 14, sy + 12, `Crude humor: ${crude ? 'ON' : 'OFF'}   (click to toggle)`, F(8), () => set('jpfc.crudeHumor', crude ? 'off' : 'on'));
    const shake = get('jpfc.screenshake', 'on') !== 'off';
    this._t(b.x + 14, sy + 24, `Screen shake: ${shake ? 'ON' : 'OFF'}   (click to toggle)`, F(8), () => { set('jpfc.screenshake', shake ? 'off' : 'on'); this.scene.cameras.main.shakeEnabled = !shake; });
    this._t(b.x + 14, b.y + b.h - 18, s.mode === 'client' ? 'The host keeps the save for everyone.' : `World "${s.save.world.seed}" · saved in this browser`, F(7, C.sub));
  }

  // ---- fab printer ----
  _fab(g) {
    const s = this.scene, b = this.box, scrap = s.save.world.scrap ?? 0, c = s.save.party[s.character];
    this._t(b.x + 10, b.y + 7, 'FAB #2 · PRINT', F(9, C.hi));
    this._t(b.x + b.w - 10, b.y + 7, `scrap: ${scrap}   [ESC] close`, F(8, C.sub)).setOrigin(1, 0);
    const cw = 104, ch = 74, cols = 3;
    RECIPES.forEach((r, i) => {
      const def = ITEMS[r.item], x = b.x + 12 + (i % cols) * (cw + 8), y = b.y + 24 + Math.floor(i / cols) * (ch + 6);
      const can = scrap >= r.scrap, owned = c.inventory.some((it) => it.id === r.item);
      g.fillStyle(can ? 0x1a2030 : 0x121521).fillRoundedRect(x, y, cw, ch, 3).lineStyle(1, can ? 0xffb347 : C.dim, can ? 0.9 : 0.5).strokeRoundedRect(x, y, cw, ch, 3);
      // item "icon": colored swatch by slot until real icons exist
      const col = { weapon: 0xb08850, ranged: 0x7fb0d0, armor: 0x8a9aa8, gadget: 0x7fd09a, consumable: 0xd0a060 }[def.slot] ?? 0x888888;
      g.fillStyle(col).fillRoundedRect(x + 6, y + 6, 18, 18, 2);
      this._t(x + 30, y + 6, def.name, { ...F(def.name.length > 13 ? 7 : 8, can ? C.text : C.sub), wordWrap: { width: cw - 34 } });
      this._t(x + 30, y + 16, `${SLOT_LABEL[def.slot] ?? 'Use'}${owned ? ' · owned' : ''}`, F(6, owned ? C.ok : C.sub));
      this._t(x + 6, y + 30, def.text, { ...F(6, C.sub), wordWrap: { width: cw - 12 } });
      this._t(x + 6, y + ch - 14, can ? `PRINT · ${r.scrap} scrap` : `need ${r.scrap} scrap`, F(8, can ? C.hi : C.bad), can ? () => s.menuCraft(i) : null);
    });
  }
}
