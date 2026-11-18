import { ROOMMATES } from './BootScene.js';
import { VIEW, setupCameras, toView } from '../../view.js';
import { loadAutosave, clearAutosave, importFile, autosave } from '../../engine/save/storage.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    setupCameras(this);
    const W = VIEW.w, H = VIEW.h;
    this.cameras.main.setBackgroundColor('#0b0d16');
    const hour = new Date().getHours();
    this.add.text(W / 2, 40, 'JOHN PORK', { fontFamily: 'monospace', fontSize: '28px', color: '#f2a6b8' }).setOrigin(0.5);
    this.add.text(W / 2, 66, 'THE FINAL CALL', { fontFamily: 'monospace', fontSize: '12px', color: '#9aa3c7' }).setOrigin(0.5);
    // Easter egg (batch 1, #10): playing at 3 a.m. real local time.
    const sub = hour >= 0 && hour < 5 ? '"why are you still up?"  - J.P.' : 'Maryland, 2098';
    this.add.text(W / 2, 84, sub, { fontFamily: 'monospace', fontSize: '8px', color: '#5d6487' }).setOrigin(0.5);

    this.add.text(W / 2, 112, 'choose your roommate', { fontFamily: 'monospace', fontSize: '8px', color: '#9aa3c7' }).setOrigin(0.5);
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
    const saveInfo = this.add.text(W / 2, 98, '', { fontFamily: 'monospace', fontSize: '7px', color: '#5d6487' }).setOrigin(0.5);
    const refresh = async () => {
      const s = await loadAutosave().catch(() => null);
      saveInfo.setText(s ? `save found: act ${s.world.act} · world "${s.world.seed}" · click a roommate to continue` : 'no save yet: clicking a roommate starts a new game');
    };
    refresh();
    const small = (x, label, fn) => this.add.text(x, H - 52, label, { fontFamily: 'monospace', fontSize: '7px', color: '#9aa3c7' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', fn);
    small(W / 2 - 60, '[ new game ]', async () => { if (confirm('Start a new game? This browser\'s save will be erased (export it first if you want to keep it).')) { await clearAutosave(); refresh(); } });
    small(W / 2 + 60, '[ import save file ]', async () => {
      try { const s = await importFile(); await autosave(s); refresh(); } catch (e) { saveInfo.setText(`couldn't import: ${e.message}`); }
    });
    [['HOST CO-OP', 'host'], ['JOIN CO-OP', 'join']].forEach(([label, role], i) => {
      this.add.text(W / 2 + (i ? 70 : -70), H - 34, `[ ${label} ]`, { fontFamily: 'monospace', fontSize: '9px', color: '#ffb347' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Lobby', { role }));
    });
    this.add.text(W / 2, H - 16, 'WASD move · click things to use · L-click hit · R-click shoot · SPACE dodge\nE close · K skills · H heal · M morph · F answer · ESC pause/save',
      { fontFamily: 'monospace', fontSize: '7px', color: '#5d6487' }).setOrigin(0.5);
  }
}
