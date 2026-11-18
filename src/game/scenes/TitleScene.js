import { ROOMMATES } from './BootScene.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const { width: W, height: H } = this.scale;
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
    [['HOST CO-OP', 'host'], ['JOIN CO-OP', 'join']].forEach(([label, role], i) => {
      this.add.text(W / 2 + (i ? 70 : -70), H - 34, `[ ${label} ]`, { fontFamily: 'monospace', fontSize: '9px', color: '#ffb347' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Lobby', { role }));
    });
    this.add.text(W / 2, H - 14, 'click a roommate: solo · WASD move · click things to use · L-click hit · R-click shoot · SPACE dodge · E close · K skills',
      { fontFamily: 'monospace', fontSize: '7px', color: '#5d6487' }).setOrigin(0.5);
  }
}
