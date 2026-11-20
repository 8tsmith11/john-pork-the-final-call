// The customization station screen (task #40). Left: your weapons (in the bag) and worn armor, each with its
// sockets. Right: the mods you carry. Pick a mod, then click an empty socket it fits; click a filled socket to take
// its mod back out. Moves go through the scene (host-applied in co-op): scene.menuMod(op, ref, arg).
import { VIEW } from '../../view.js';
import { ITEMS, ARMOR_SLOTS } from '../../content/items.js';
import { socketInfo, canInsert } from '../../engine/sockets.js';
import { getLang, tr } from '../../i18n.js';
import { modText } from './GameMenu.js';

const es = () => getLang() === 'es';
const T = (en, sp) => (es() ? sp : en);
const F = (size, color = '#e8e8f0', extra = {}) => ({ fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra });

export class ModStation {
  constructor(scene) {
    this.s = scene; this.closed = false; this.pick = null; this.msg = null;
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9765);
    this.esc = (ev) => { if (ev.key === 'Escape') this.close(); };
    scene.input.keyboard.on('keydown', this.esc);
    this.redraw();
  }

  /** The pieces that take mods: worn armor, then weapons in the bag. */
  pieces(c) {
    const out = [];
    for (const slot of ARMOR_SLOTS) if (c.equipped?.[slot]) out.push({ ref: { worn: slot }, label: T('worn', 'puesto') });
    c.inventory.forEach((s, i) => { const d = s && ITEMS[s.id]; if (d && (d.slot === 'weapon' || d.slot === 'ranged')) out.push({ ref: { bag: i }, label: c.equipped?.[d.slot] === s.id ? T('in hand', 'en mano') : T('in bag', 'en la mochila') }); });
    return out.map((p) => ({ ...p, info: socketInfo(c, p.ref) })).filter((p) => p.info?.size > 0);
  }

  redraw() {
    if (this.closed) return;
    this.root.removeAll(true);
    const s = this.s, c = s.save.party[s.character], g = s.add.graphics(), add = (o) => { this.root.add(o); return o; };
    this.root.add(g);
    g.fillStyle(0x06070c, 0.97).fillRect(0, 0, VIEW.w, VIEW.h);
    g.fillStyle(0x15171f, 1).fillRoundedRect(10, 10, VIEW.w - 20, VIEW.h - 20, 6).lineStyle(1, 0xc9a24a, 0.9).strokeRoundedRect(10, 10, VIEW.w - 20, VIEW.h - 20, 6);
    add(s.add.text(VIEW.w / 2, 16, T('CUSTOMIZATION STATION', 'ESTACIÓN DE PERSONALIZACIÓN'), F(9, '#f2d48a', { heading: true })).setOrigin(0.5, 0));
    add(s.add.text(VIEW.w - 16, 16, T('[ESC] close', '[ESC] cerrar'), F(6, '#9aa3c7')).setOrigin(1, 0));
    // gear with sockets
    let y = 34;
    const pieces = this.pieces(c);
    if (!pieces.length) add(s.add.text(18, y, T('Nothing here takes mods yet. Weapons and armor do.', 'Nada de esto acepta mods todavía. Las armas y la armadura sí.'), F(7, '#9aa3c7')));
    for (const p of pieces.slice(0, 8)) {
      const d = p.info.def;
      g.fillStyle(0x1c1f2c, 1).fillRoundedRect(16, y, 268, 24, 3);
      add(s.add.text(22, y + 3, tr(d.name), F(7, '#e8e8f0')));
      add(s.add.text(22, y + 13, p.label, F(5, '#7f848e')));
      for (let k = 0; k < p.info.size; k++) {
        const x = 150 + k * 66, id = p.info.mods[k], fits = this.pick && !id && canInsert(c, p.ref, this.pick);
        g.fillStyle(id ? 0x2a2312 : fits ? 0x1d2a44 : 0x101220, 1).fillRoundedRect(x, y + 3, 62, 18, 3).lineStyle(1, id ? 0xffb347 : fits ? 0x61afef : 0x2a2f48, 1).strokeRoundedRect(x, y + 3, 62, 18, 3);
        add(s.add.text(x + 31, y + 8, id ? tr(ITEMS[id].name) : fits ? T('insert', 'colocar') : T('empty', 'vacío'), F(6, id ? '#ffd27f' : fits ? '#9fd1ff' : '#4a5175')).setOrigin(0.5, 0));
        if (id) add(s.add.zone(x, y + 3, 62, 18).setOrigin(0).setInteractive({ useHandCursor: true })).on('pointerdown', () => this._do('extract', p.ref, k));
        else if (fits) add(s.add.zone(x, y + 3, 62, 18).setOrigin(0).setInteractive({ useHandCursor: true })).on('pointerdown', () => this._do('insert', p.ref, this.pick));
      }
      y += 28;
    }
    // mods you carry
    const mods = [...new Set(c.inventory.filter((x) => x && ITEMS[x.id]?.slot === 'mod').map((x) => x.id))];
    const rx = 296; let ry = 34;
    add(s.add.text(rx, ry, T('YOUR MODS', 'TUS MODS'), F(7, '#61afef'))); ry += 12;
    if (!mods.length) add(s.add.text(rx, ry, T('None. Make them at the fab.', 'Ninguno. Fabrícalos en el fab.'), { ...F(6, '#7f848e'), wordWrap: { width: 160 } }));
    for (const id of mods) {
      const d = ITEMS[id], on = this.pick === id, n = c.inventory.reduce((t, x) => t + (x?.id === id ? x.qty : 0), 0);
      g.fillStyle(on ? 0x2a2312 : 0x1c1f2c, 1).fillRoundedRect(rx, ry, 160, 26, 3).lineStyle(1, on ? 0xffb347 : 0x2a2f48, 1).strokeRoundedRect(rx, ry, 160, 26, 3);
      add(s.add.text(rx + 5, ry + 3, `${tr(d.name)} ×${n}`, F(7, on ? '#ffd27f' : '#e8e8f0')));
      add(s.add.text(rx + 5, ry + 14, `${modText(d.mods)} · ${d.fits.map((f) => T(f, { weapon: 'arma', ranged: 'distancia', chestplate: 'pecho', helmet: 'casco', leggings: 'piernas', boots: 'botas' }[f] ?? f)).join('/')}`, F(5, '#98c379')));
      add(s.add.zone(rx, ry, 160, 26).setOrigin(0).setInteractive({ useHandCursor: true })).on('pointerdown', () => { this.pick = on ? null : id; this.msg = null; this.redraw(); });
      ry += 30;
    }
    add(s.add.text(18, VIEW.h - 30, this.msg ?? (this.pick ? T('Click a glowing socket to put it in.', 'Haz clic en un hueco brillante para colocarlo.') : T('Pick a mod on the right, or click a mod in a socket to take it out.', 'Elige un mod a la derecha, o haz clic en uno colocado para sacarlo.')), F(7, '#c9cde0')));
  }

  _do(op, ref, arg) {
    this.s.menuMod?.(op, ref, arg);
    if (op === 'insert') this.pick = null;
    this.s.time.delayedCall(this.s.mode === 'client' ? 250 : 0, () => this.redraw());   // a guest waits for the host's party update
  }

  close() { if (this.closed) return; this.closed = true; this.s.input.keyboard.off('keydown', this.esc); this.root.destroy(); this.s.modStation = null; }
}
