// Loads assets. Missing art falls back to on-style placeholders so the game always boots.
import { makeTiles } from '../render/tiles.js';

export const ROOMMATES = {
  michael: { name: 'Michael', color: 0xc8605a, hair: 0x1a1a22, height: 23 },
  trevor:  { name: 'Trevor',  color: 0x3f6fb5, hair: 0x6b4a2e, height: 24 },
  manuel:  { name: 'Manuel',  color: 0x5f8f3a, hair: 0x5a3a22, height: 23 },
};

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.load.on('loaderror', (file) => console.info(`[boot] no asset yet: ${file.key} (using placeholder)`));
    for (const id of Object.keys(ROOMMATES)) {
      this.load.atlas(id, `assets/sprites/${id}.png`, `assets/sprites/${id}.json`);
    }
  }

  create() {
    for (const [id, r] of Object.entries(ROOMMATES)) {
      if (this.textures.exists(id) && this.textures.get(id).getFrameNames().length) continue;
      this._placeholder(id, r);
    }
    this._makeAnims();
    makeTiles(this);
    this.scene.start('Title');
  }

  // A 16x24 placeholder atlas with the same frame names as gonman's real sheets.
  _placeholder(id, r) {
    const facings = ['down', 'up', 'right'];
    const frames = [];
    for (const f of facings) {
      for (let i = 0; i < 2; i++) frames.push([`idle_${f}_${i}`, f, 0]);
      for (let i = 0; i < 4; i++) frames.push([`walk_${f}_${i}`, f, i % 2 ? 1 : 0]);
    }
    const canvas = this.textures.createCanvas(id, 16 * frames.length, 24);
    const ctx = canvas.getContext();
    const hex = (c) => `#${c.toString(16).padStart(6, '0')}`;
    frames.forEach(([name, facing, bob], i) => {
      const x0 = i * 16, top = 24 - r.height + bob;
      ctx.fillStyle = hex(r.color); ctx.fillRect(x0 + 4, top + 8, 8, 13);       // body
      ctx.fillStyle = '#e9c9a8'; ctx.fillRect(x0 + 5, top + 2, 6, 6);            // head
      ctx.fillStyle = hex(r.hair); ctx.fillRect(x0 + 5, top + 1, 6, facing === 'up' ? 6 : 2);
      ctx.fillStyle = '#222'; ctx.fillRect(x0 + 5, 22, 2, 2); ctx.fillRect(x0 + 9, 22, 2, 2); // feet
      if (facing === 'down') { ctx.fillStyle = '#111'; ctx.fillRect(x0 + 6, top + 4, 1, 1); ctx.fillRect(x0 + 9, top + 4, 1, 1); }
      if (facing === 'right') { ctx.fillStyle = '#111'; ctx.fillRect(x0 + 9, top + 4, 1, 1); }
      canvas.add(name, 0, x0, 0, 16, 24);
    });
    canvas.refresh();
  }

  _makeAnims() {
    for (const id of Object.keys(ROOMMATES)) {
      for (const f of ['down', 'up', 'right']) {
        const names = this.textures.get(id).getFrameNames();
        const pick = (anim) => names.filter((n) => n.startsWith(`${anim}_${f}_`)).sort().map((frame) => ({ key: id, frame }));
        this.anims.create({ key: `${id}_idle_${f}`, frames: pick('idle'), frameRate: 2, repeat: -1 });
        this.anims.create({ key: `${id}_walk_${f}`, frames: pick('walk'), frameRate: 8, repeat: -1 });
      }
    }
  }
}
