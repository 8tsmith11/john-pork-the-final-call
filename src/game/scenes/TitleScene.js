import { langToggle } from '../../i18n.js';
import { ROOMMATES } from './BootScene.js';
import { setArea } from '../../audio/audio.js';
import { VIEW, setupCameras, toView } from '../../view.js';
import { loadAutosave, clearAutosave, importFile, autosave } from '../../engine/save/storage.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    setArea('title');   // music: see src/audio/music.js
    setupCameras(this);
    const W = VIEW.w, H = VIEW.h;
    this.cameras.main.setBackgroundColor('#0b0d16');
    paintNight(this);
    langToggle(this, W - 6, 6, () => this.scene.restart());   // English / Español (Trevor)
    const hour = new Date().getHours();
    this.add.text(W / 2, 40, 'JOHN PORK', { heading: true, fontSize: '30px', color: '#f2a6b8' }).setOrigin(0.5);
    this.add.text(W / 2, 66, 'THE FINAL CALL', { heading: true, fontSize: '12px', color: '#9aa3c7' }).setOrigin(0.5);
    // Easter egg (batch 1, #10): playing at 3 a.m. real local time.
    const sub = hour >= 0 && hour < 5 ? '"why are you still up?"  - J.P.' : 'Maryland, 2098';
    this.add.text(W / 2, 84, sub, { fontFamily: 'monospace', fontSize: '8px', color: '#9aa3c7' }).setOrigin(0.5);

    this.add.text(W / 2, 112, 'choose your roommate', { fontFamily: 'monospace', fontSize: '8px', color: '#e8e8f0', backgroundColor: 'rgba(11,13,22,0.6)', padding: { x: 3, y: 1 } }).setOrigin(0.5);
    const ids = Object.keys(ROOMMATES);
    ids.forEach((id, i) => {
      const x = W / 2 + (i - 1) * 90, y = 160;
      const spr = this.add.sprite(x, y, id).setScale(3).play(`${id}_idle_down`);
      const label = this.add.text(x, y + 44, ROOMMATES[id].name, { fontFamily: 'monospace', fontSize: '10px', color: '#e8e8f0' }).setOrigin(0.5);
      const zone = this.add.zone(x, y + 10, 70, 110).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => { spr.play(`${id}_walk_down`); label.setColor('#ffb347'); });
      zone.on('pointerout', () => { spr.play(`${id}_idle_down`); label.setColor('#e8e8f0'); });
      zone.on('pointerdown', () => this.scene.start('World', { character: id, mode: 'solo' }));
    });
    // Save controls: the save lives in this browser (and in exported .jpfc.json files).
    const saveInfo = this.add.text(W / 2, 98, '', { fontFamily: 'monospace', fontSize: '7px', color: '#9aa3c7', backgroundColor: 'rgba(11,13,22,0.6)', padding: { x: 3, y: 1 } })   // backed: it sits on the skyline.setOrigin(0.5);
    const refresh = async () => {
      const s = await loadAutosave().catch(() => null);
      if (!saveInfo.active) return;   // left the title before the save check finished
      saveInfo.setText(s ? `save found: act ${s.world.act} · world "${s.world.seed}" · click a roommate to continue` : 'no save yet: clicking a roommate starts a new game').setOrigin(0.5);   // re-centre: the padded box changes width
    };
    refresh();
    const small = (x, label, fn) => this.add.text(x, H - 52, label, { fontFamily: 'monospace', fontSize: '7px', color: '#9aa3c7' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', fn);
    small(W / 2 - 60, '[ new game ]', async () => { if (confirm('Start a new game? This browser\'s save will be erased (export it first if you want to keep it).')) { await clearAutosave(); refresh(); } });
    small(W / 2 + 60, '[ import save file ]', async () => {
      try { const s = await importFile(); await autosave(s); refresh(); } catch (e) { saveInfo.setText(`couldn't import: ${e.message}`).setOrigin(0.5); }
    });
    [['HOST CO-OP', 'host'], ['JOIN CO-OP', 'join']].forEach(([label, role], i) => {
      this.add.text(W / 2 + (i ? 70 : -70), H - 34, `[ ${label} ]`, { fontFamily: 'monospace', fontSize: '9px', color: '#ffb347' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Lobby', { role }));
    });
    this.add.text(W / 2, H - 12, 'controls: ESC in game', { fontFamily: 'monospace', fontSize: '7px', color: '#6f789c' }).setOrigin(0.5);
  }
}

/**
 * The night behind the menus: the painted view north from ASTER's roof, with the things that move.
 * Shared by the title and the co-op lobby (`dim` darkens it so lobby text reads).
 */
export function paintNight(scene, dim = 0) {
  const W = VIEW.w, H = VIEW.h;
  if (!scene.textures.exists('title_bg')) return;
  scene.add.image(0, 0, 'title_bg').setOrigin(0, 0).setDepth(-20);
  // The lights on the northern horizon: slow, low, all moving the same way.
  for (let i = 0; i < 6; i++) {
    const l = scene.add.rectangle(150 + i * 34, 108 + (i % 2), 2, 1, 0xe0b866).setDepth(-19).setAlpha(0.9);
    scene.tweens.add({ targets: l, x: l.x + 90, duration: 60000 + i * 4000, repeat: -1, yoyo: false, onRepeat: () => { l.x = 150 + i * 34; } });
    scene.tweens.add({ targets: l, alpha: 0.35, duration: 900 + i * 170, yoyo: true, repeat: -1 });
  }
  // The antenna's lamp.
  const lamp = scene.add.rectangle(31, 95, 2, 2, 0xd42a3c).setDepth(-19);
  scene.tweens.add({ targets: lamp, alpha: 0.1, duration: 1100, yoyo: true, repeat: -1, hold: 300 });
  // A window or two that goes dark and comes back.
  for (const [x, y] of [[214, 158], [286, 150], [372, 166], [58, 160]]) {
    const w = scene.add.rectangle(x, y, 2, 2, 0xe0b866).setDepth(-19).setAlpha(0);
    scene.tweens.add({ targets: w, alpha: 1, duration: 200, delay: 2000 + x * 23, hold: 5000 + y * 31, yoyo: true, repeat: -1, repeatDelay: 7000 });
  }
  // Rain: thin streaks falling a little off vertical, drawn as plain rectangles so it works in Canvas too.
  for (let i = 0; i < 70; i++) {
    const x0 = (i * 37) % (W + 40) - 20, len = 3 + (i % 3);
    const drop = scene.add.rectangle(x0, -10, 1, len, 0x7a8794).setDepth(-18).setAlpha(0.28 + (i % 4) * 0.06).setAngle(8);
    scene.tweens.add({ targets: drop, y: H + 10, x: x0 - 26, duration: 900 + (i % 7) * 110, delay: (i * 53) % 1400, repeat: -1 });
  }
  if (dim) scene.add.rectangle(0, 0, W, H, 0x0b0d16, dim).setOrigin(0, 0).setDepth(-17);
}

