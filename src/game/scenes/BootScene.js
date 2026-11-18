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
    this.load.image('title_bg', 'assets/sprites/title_bg.png');   // painted by tools/art/gen_title.py
    // Props/NPCs (frames named by map object id), enemies and the Warden. All optional.
    for (const id of ['props', 'wide', 'big', 'doors', 'icons', 'enemies', 'warden', 'principals', 'tiles', 'romance', 'bagel_enemies']) this.load.atlas(id, `assets/sprites/${id}.png`, `assets/sprites/${id}.json`);
  }

  create() {
    for (const [id, r] of Object.entries(ROOMMATES)) {
      if (this.textures.exists(id) && this.textures.get(id).getFrameNames().length) continue;
      this._placeholder(id, r);
    }
    this._makeAnims();
    // Two-frame loops for enemies and the Warden, when their art is present.
    const has = (key, frame) => this.textures.exists(key) && this.textures.get(key).has(frame);
    for (const k of ['enemy.moth', 'enemy.captcha', 'enemy.autocomplete']) {   // D-017 coderot (tools/art/gen_bagel_enemies.py)
      if (has('bagel_enemies', `${k}_0`)) this.anims.create({ key: k, frames: [0, 1].map((i) => ({ key: 'bagel_enemies', frame: `${k}_${i}` })), frameRate: k === 'enemy.moth' ? 7 : 5, repeat: -1 });
    }
    for (const k of ['enemy.rotling', 'enemy.spitter']) {
      if (has('enemies', `${k}_0`)) this.anims.create({ key: k, frames: [0, 1].map((i) => ({ key: 'enemies', frame: `${k}_${i}` })), frameRate: 5, repeat: -1 });
    }
    for (const k of ['sahur', 'pork']) {
      if (has('principals', `${k}_0`)) this.anims.create({ key: k, frames: [0, 1].map((i) => ({ key: 'principals', frame: `${k}_${i}` })), frameRate: 2, repeat: -1 });
    }
    if (has('warden', 'warden_0')) this.anims.create({ key: 'warden', frames: [0, 1].map((i) => ({ key: 'warden', frame: `warden_${i}` })), frameRate: 3, repeat: -1 });
    // Hand-drawn tiles: each frame of the 'tiles' atlas becomes its own texture under the key the
    // map renderer already uses (tile_<charCode>_<variant>). makeTiles() then only fills gaps.
    if (this.textures.exists('tiles')) {
      const atlas = this.textures.get('tiles');
      for (const name of atlas.getFrameNames()) {
        if (this.textures.exists(name)) continue;
        const f = atlas.get(name);
        const t = this.textures.createCanvas(name, f.width, f.height);
        t.getContext().drawImage(f.source.image, f.cutX, f.cutY, f.width, f.height, 0, 0, f.width, f.height);
        t.refresh();
      }
    }
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
        // Combat frames (optional art): a two-frame swing, a two-frame dodge, a one-frame flinch.
        if (pick('attack').length) this.anims.create({ key: `${id}_attack_${f}`, frames: pick('attack'), frameRate: 12, repeat: 0 });
        if (pick('dodge').length) this.anims.create({ key: `${id}_dodge_${f}`, frames: pick('dodge'), frameRate: 10, repeat: 0 });
        if (pick('hurt').length) this.anims.create({ key: `${id}_hurt_${f}`, frames: pick('hurt'), frameRate: 1, repeat: 0 });
      }
      // Long idles (easter eggs, docs/SECRETS.md): what each roommate does when left standing.
      const names = this.textures.get(id).getFrameNames();
      const seq = (prefix) => names.filter((n) => n.startsWith(prefix)).sort().map((frame) => ({ key: id, frame }));
      if (seq('long_down_').length) this.anims.create({ key: `${id}_long`, frames: seq('long_down_'), frameRate: 2, repeat: -1 });
      if (seq('alt_up_').length) this.anims.create({ key: `${id}_alt`, frames: seq('alt_up_'), frameRate: 7, repeat: -1 });
    }
  }
}
