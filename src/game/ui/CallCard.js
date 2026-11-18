import { VIEW } from '../../view.js';

// Presentation only. The call-flow owner gates world input and decides what each answer means.
const C = { night: 0x0d0b1a, panel: 0x17142b, edge: 0x332e57, pink: 0xe87a9c,
  pale: 0xf7b8c8, cyan: 0x3fd0d6, red: 0xd42a3c, bone: '#e8e2d0', steel: '#7a8794' };
const font = (size, color = C.bone) => ({ fontFamily: 'monospace', fontSize: `${size}px`, color });

/**
 * new CallCard(scene, { name, portraitKey: 'pork_0', onAnswer, onDecline }).
 * Opens immediately. F / X and pointer buttons resolve once and dispose the card.
 * answer(), decline(), or destroy() can also be called by the host flow (destroy is silent).
 * Optional ringFor is seconds; expiry resolves through onTimeout instead of onDecline.
 * portraitKey is an existing frame in the principals atlas; no external image is loaded.
 */
export class CallCard {
  constructor(scene, { name = 'John Pork', portraitKey = 'pork_0', onAnswer, onDecline, ringFor, onTimeout } = {}) {
    this.scene = scene;
    this.onAnswer = onAnswer; this.onDecline = onDecline;
    this.closed = false;
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9800);
    const add = (obj) => { this.root.add(obj); return obj; };
    // Catch clicks over the entire takeover so they cannot reach objects underneath it.
    add(scene.add.rectangle(VIEW.w / 2, VIEW.h / 2, VIEW.w, VIEW.h, C.night, 0.97)
      .setInteractive().on('pointerdown', (p, x, y, ev) => ev?.stopPropagation?.()));
    const frame = add(scene.add.graphics());
    frame.fillStyle(C.panel).fillRect(18, 12, VIEW.w - 36, VIEW.h - 24);
    frame.lineStyle(2, C.pink).strokeRect(18, 12, VIEW.w - 36, VIEW.h - 24);
    frame.lineStyle(1, C.edge).strokeRect(22, 16, VIEW.w - 44, VIEW.h - 32);
    // Earpiece and signal indicator make the takeover read as a phone at a glance.
    frame.fillStyle(C.edge).fillRect(VIEW.w / 2 - 14, 19, 28, 2);
    for (let i = 0; i < 4; i++) frame.fillStyle(C.cyan).fillRect(432 + i * 4, 28 - i * 2, 2, 3 + i * 2);
    add(scene.add.text(VIEW.w / 2, 29, 'INCOMING CALL', font(8, C.steel)).setOrigin(0.5, 0));
    const title = add(scene.add.text(VIEW.w / 2, 43, String(name).toUpperCase(), font(18, '#f7b8c8')).setOrigin(0.5, 0));
    if (title.width > 390) title.setScale(390 / title.width);
    add(scene.add.text(VIEW.w / 2, 65, 'IS CALLING', font(8, '#e87a9c')).setOrigin(0.5, 0));

    this.ring = add(scene.add.graphics());
    frame.fillStyle(C.night).fillCircle(VIEW.w / 2, 134, 47);
    if (scene.textures.exists('principals') && scene.textures.get('principals').has(portraitKey)) {
      add(scene.add.image(VIEW.w / 2, 134, 'principals', portraitKey).setScale(3));
    } else {
      add(scene.add.text(VIEW.w / 2, 134, 'JP', font(26, '#f7b8c8')).setOrigin(0.5));
    }
    this.glitch = add(scene.add.graphics());
    this._button(80, 207, 'F  ANSWER', C.cyan, () => this.answer());
    this._button(256, 207, 'X  DECLINE', C.red, () => this.decline());
    add(scene.add.text(VIEW.w / 2, 245, 'INCOMING SIGNAL', font(6, C.steel)).setOrigin(0.5, 0));

    this._answerKey = (ev) => { if (!ev?.repeat) { ev?.preventDefault?.(); this.answer(); } };
    this._declineKey = (ev) => { if (!ev?.repeat) { ev?.preventDefault?.(); this.decline(); } };
    scene.input.keyboard?.on('keydown-F', this._answerKey);
    scene.input.keyboard?.on('keydown-X', this._declineKey);
    this._shutdown = () => this.destroy();
    scene.events.once('shutdown', this._shutdown);
    this._started = scene.time.now;
    this._tick();
    this.timer = scene.time.addEvent({ delay: 60, loop: true, callback: () => this._tick() });
    if (Number.isFinite(ringFor) && ringFor >= 0) {
      this.timeout = scene.time.delayedCall(ringFor * 1000, () => this._resolve(onTimeout));
    }
  }

  _button(x, y, text, color, callback) {
    const button = this.scene.add.rectangle(x + 72, y + 15, 144, 30, C.night)
      .setStrokeStyle(1, color).setInteractive({ useHandCursor: true });
    const label = this.scene.add.text(x + 72, y + 15, text, font(9)).setOrigin(0.5);
    button.on('pointerover', () => button.setFillStyle(C.edge));
    button.on('pointerout', () => button.setFillStyle(C.night));
    button.on('pointerdown', (p, lx, ly, ev) => { ev?.stopPropagation?.(); callback(); });
    this.root.add([button, label]);
  }

  _tick() {
    if (this.closed) return;
    const t = this.scene.time.now - this._started, pulse = (t % 1600) / 1600;
    this.ring.clear().lineStyle(1, C.pink, 0.8).strokeCircle(VIEW.w / 2, 134, 49);
    this.ring.lineStyle(2, C.pale, 0.65 * (1 - pulse)).strokeCircle(VIEW.w / 2, 134, 50 + pulse * 12);
    // Small torn strips stay outside the face and controls; the entire screen never flashes.
    const step = Math.floor(t / 180), g = this.glitch.clear();
    for (let i = 0; i < 3; i++) {
      const left = (step + i) % 2 === 0, y = 86 + ((step * 17 + i * 39) % 100);
      g.fillStyle(i === 1 ? C.cyan : C.pink, 0.18).fillRect(left ? 26 : 384, y, 35 + (step + i) % 24, 1 + i);
    }
  }

  answer() { this._resolve(this.onAnswer); }
  decline() { this._resolve(this.onDecline); }
  _resolve(callback) {
    if (this.closed) return;
    this.destroy();
    callback?.();
  }

  destroy() {
    if (this.closed) return;
    this.closed = true;
    this.timer?.remove();
    this.timeout?.remove();
    this.scene.input.keyboard?.off('keydown-F', this._answerKey);
    this.scene.input.keyboard?.off('keydown-X', this._declineKey);
    this.scene.events.off('shutdown', this._shutdown);
    this.root.destroy();
  }
}
