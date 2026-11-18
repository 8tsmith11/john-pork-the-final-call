// Manuel's smart pacifier (src/content/items.js item.smart_pacifier): while he wears it, it sits in
// his mouth and he sucks on it. The shield pumps in and out (faster while he fights), the sensor
// light blinks, and now and then a little "chk chk" floats up. Drawn over his sprite on every screen.
const ITEM = 'item.smart_pacifier';

export class Pacifier {
  constructor(scene) {
    this.s = scene;
    this.g = scene.add.graphics();
    this.nextChk = 0;
  }

  update(snap) {
    const s = this.s, g = this.g; g.clear();
    const worn = s.save.party?.manuel?.equipped?.goggles === ITEM;
    if (!worn) return;
    for (const p of snap.players) {
      if (p.c !== 'manuel' || p.dn || p.f === 'up') continue;
      const spr = s.sprites?.get(p.id); if (!spr?.visible) continue;
      const t = s.time.now, fast = p.sw || p.m ? 2 : 1;
      const suck = (Math.sin(t / (110 / fast)) + 1) / 2;            // 0..1, one suck per ~0.7 s standing still
      const side = p.f === 'left' ? -2 : p.f === 'right' ? 2 : 0;
      const x = Math.round(spr.x + side), y = Math.round(spr.y - 16);
      const w = 4 - Math.round(suck);                                 // the shield pulls in as he sucks
      g.setDepth(spr.depth + 1);
      g.fillStyle(0x0d0b1a, 1).fillRect(x - w / 2 - 1, y - 1, w + 2, 4);   // outline
      g.fillStyle(0x4f7fd0, 1).fillRect(x - w / 2, y, w, 2);            // tub blue shield
      g.fillStyle(0xe8e2d0, 1).fillRect(x - 1, y + 2, 2, 1);             // the ring
      if (Math.floor(t / 400) % 2) g.fillStyle(0xd42a3c, 1).fillRect(x + w / 2 - 1, y, 1, 1);   // sensor light
      if (t > this.nextChk) {
        this.nextChk = t + 6000 + Math.random() * 9000;
        const txt = s.add.text(x + 4, y - 4, 'chk chk', { fontFamily: 'monospace', fontSize: '5px', color: '#9aa3c7' }).setOrigin(0, 1).setDepth(7000);
        s.tweens.add({ targets: txt, y: txt.y - 8, alpha: 0, duration: 1100, onComplete: () => txt.destroy() });
      }
    }
  }
}
