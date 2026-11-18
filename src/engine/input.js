// Gathers a serializable input frame each tick (the same shape is sent over the network).
import { emptyInput } from './sim.js';

export class InputReader {
  constructor(scene) {
    this.scene = scene;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard.addKeys({
      w: K.W, a: K.A, s: K.S, d: K.D, up: K.UP, left: K.LEFT, down: K.DOWN, right: K.RIGHT,
      space: K.SPACE, shift: K.SHIFT, e: K.E,
    });
    this._dodgeQueued = false;
    this._interactQueued = false;
    scene.input.keyboard.on('keydown-SPACE', () => { this._dodgeQueued = true; });
    scene.input.keyboard.on('keydown-SHIFT', () => { this._dodgeQueued = true; });
    // Interaction is by clicking objects (WorldScene). E closes panels / advances dialogue there.
    this.blockAttack = false;   // set while a click was consumed by an object or UI; clears on release
    scene.input.on('pointerup', () => { this.blockAttack = false; });
  }

  /** @param {{x:number,y:number}} from  world position the aim is measured from */
  read(from) {
    const k = this.keys, inp = emptyInput();
    inp.mx = (k.d.isDown || k.right.isDown ? 1 : 0) - (k.a.isDown || k.left.isDown ? 1 : 0);
    inp.my = (k.s.isDown || k.down.isDown ? 1 : 0) - (k.w.isDown || k.up.isDown ? 1 : 0);
    const ptr = this.scene.input.activePointer;
    const wp = this.scene.cameras.main.getWorldPoint(ptr.x, ptr.y);
    inp.aim = Math.atan2(wp.y - from.y, wp.x - from.x);
    inp.attack = ptr.leftButtonDown() && !this.blockAttack;
    inp.fire = ptr.rightButtonDown();
    inp.dodge = this._dodgeQueued; this._dodgeQueued = false;
    inp.interact = this._interactQueued; this._interactQueued = false;
    return inp;
  }
}
