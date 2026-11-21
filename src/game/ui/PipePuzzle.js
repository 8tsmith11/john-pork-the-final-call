// Signal-routing puzzle (Act 1, lead C: the rotted lobby camera). Rotate circuit tiles so the signal
// runs from the camera feed (left) to the monitor (right). Rotted cells can't be turned. Generated
// from a seed so it's always solvable and differs per world.
import { VIEW } from '../../view.js';
import { Rng } from '../../engine/rng.js';
import { sfx } from '../../audio/audio.js';

const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];          // N E S W
const SHAPES = { straight: [1, 0, 1, 0], corner: [1, 1, 0, 0], tee: [1, 1, 1, 0] };
const rot = (mask, r) => mask.map((_, i) => mask[(i - r + 4) % 4]);

export class PipePuzzle {
  // onRotate (co-op, src/game/pipeTable.js): a click asks the host to turn the tile instead of turning it here; the
  // host's state comes back through setRots(), and only the host says it's solved (finish()).
  constructor(scene, seed, onSolved, { cols = 6, rows = 4, onRotate = null } = {}) {
    this.scene = scene; this.onSolved = onSolved; this.cols = cols; this.rows = rows; this.onRotate = onRotate;
    const r = new Rng(`${seed}::pipe`);
    this.inRow = r.int(0, rows - 1); this.outRow = r.int(0, rows - 1);
    this.grid = this._generate(r);
    if (!scene) return;                      // headless (tests)
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9700);
    this.cell = 26; this.ox = Math.floor((VIEW.w - cols * this.cell) / 2); this.oy = 70;
    this.draw();
  }

  // Carve a random path, place the pieces that fit it, then scramble rotations.
  _generate(r) {
    const { cols, rows } = this;
    const path = [[0, this.inRow]];
    let [x, y] = path[0];
    const seen = new Set([`${x},${y}`]);
    while (x < cols - 1 || y !== this.outRow) {
      const opts = [];
      if (x < cols - 1) opts.push([1, 0], [1, 0]);                       // bias rightward
      if (y > 0 && !seen.has(`${x},${y - 1}`)) opts.push([0, -1]);
      if (y < rows - 1 && !seen.has(`${x},${y + 1}`)) opts.push([0, 1]);
      if (x === cols - 1) opts.length = 0, opts.push(y < this.outRow ? [0, 1] : [0, -1]);
      const [dx, dy] = r.pick(opts);
      x += dx; y += dy; seen.add(`${x},${y}`); path.push([x, y]);
    }
    const grid = [];
    for (let j = 0; j < rows; j++) { grid.push([]); for (let i = 0; i < cols; i++) grid[j].push(null); }
    path.forEach(([px, py], k) => {
      const prev = k === 0 ? [px - 1, py] : path[k - 1], next = k === path.length - 1 ? [px + 1, py] : path[k + 1];
      const need = [0, 0, 0, 0];
      for (const [nx, ny] of [prev, next]) need[DIRS.findIndex(([dx, dy]) => px + dx === nx && py + dy === ny)] = 1;
      const isStraight = (need[0] && need[2]) || (need[1] && need[3]);
      grid[py][px] = { shape: isStraight ? 'straight' : 'corner', r: 0, locked: false, need };
      // find the rotation that matches `need`
      const base = SHAPES[grid[py][px].shape];
      for (let rr = 0; rr < 4; rr++) if (rot(base, rr).every((v, i) => v === need[i])) grid[py][px].solution = rr;
    });
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (!grid[j][i]) grid[j][i] = { shape: r.pick(['straight', 'corner', 'tee']), r: r.int(0, 3), locked: r.chance(0.18), filler: true };
      else { grid[j][i].r = r.int(0, 3); if (grid[j][i].r === grid[j][i].solution) grid[j][i].r = (grid[j][i].r + 1) % 4; }
    }
    return grid;
  }

  mask(c) { return rot(SHAPES[c.shape], c.r); }

  /** Which cells carry signal from the input. */
  powered() {
    const on = new Set(), q = [];
    const start = this.grid[this.inRow][0];
    if (this.mask(start)[3]) { on.add(`0,${this.inRow}`); q.push([0, this.inRow]); }
    while (q.length) {
      const [x, y] = q.shift(), m = this.mask(this.grid[y][x]);
      DIRS.forEach(([dx, dy], d) => {
        if (!m[d]) return;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows || on.has(`${nx},${ny}`)) return;
        if (this.mask(this.grid[ny][nx])[(d + 2) % 4]) { on.add(`${nx},${ny}`); q.push([nx, ny]); }
      });
    }
    return on;
  }

  solved() {
    const on = this.powered(), last = this.grid[this.outRow][this.cols - 1];
    return on.has(`${this.cols - 1},${this.outRow}`) && this.mask(last)[1];
  }

  draw() {
    const { scene, cell, ox, oy } = this;
    this.root.removeAll(true);
    const g = scene.add.graphics(); this.root.add(g);
    const W = this.cols * cell, H = this.rows * cell;
    g.fillStyle(0x000000, 0.55).fillRect(0, 0, VIEW.w, VIEW.h);
    g.fillStyle(0x0b0d16, 0.97).fillRoundedRect(ox - 34, oy - 34, W + 68, H + 66, 3).lineStyle(1, 0x6ff2ff, 0.8).strokeRoundedRect(ox - 34, oy - 34, W + 68, H + 66, 3);
    const title = scene.add.text(VIEW.w / 2, oy - 28, 'ASTER LOBBY CAM · signal lost', { heading: true, fontSize: '9px', color: '#6ff2ff' }).setOrigin(0.5, 0);
    const help = scene.add.text(VIEW.w / 2, oy + H + 8, 'Click tiles to rotate. Route the feed (left) to the monitor (right). [ESC] leave', { fontFamily: 'monospace', fontSize: '7px', color: '#9aa3c7' }).setOrigin(0.5, 0);
    this.root.add([title, help]);
    const on = this.powered();
    // feed + monitor terminals
    g.fillStyle(0xffb347).fillRect(ox - 14, oy + this.inRow * cell + cell / 2 - 3, 12, 6);
    g.fillStyle(this.solved() ? 0x7fff9a : 0x5d6487).fillRect(ox + W + 2, oy + this.outRow * cell + cell / 2 - 5, 12, 10);
    for (let j = 0; j < this.rows; j++) for (let i = 0; i < this.cols; i++) {
      const c = this.grid[j][i], x = ox + i * cell, y = oy + j * cell, lit = on.has(`${i},${j}`);
      g.fillStyle(c.locked ? 0x2a1f2e : 0x151827).fillRect(x + 1, y + 1, cell - 2, cell - 2);
      if (c.locked) { g.lineStyle(1, 0xd65db1, 0.6).lineBetween(x + 3, y + 3, x + cell - 3, y + cell - 3); }
      const m = this.mask(c), cx = x + cell / 2, cy = y + cell / 2;
      g.lineStyle(4, lit ? 0x6ff2ff : 0x4a5070, 1);
      DIRS.forEach(([dx, dy], d) => { if (m[d]) g.lineBetween(cx, cy, cx + dx * cell / 2, cy + dy * cell / 2); });
      g.fillStyle(lit ? 0x6ff2ff : 0x4a5070).fillCircle(cx, cy, 3);
      if (!c.locked) {
        const z = scene.add.zone(x, y, cell, cell).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        z.on('pointerdown', (p, lx, ly, ev) => {
          ev?.stopPropagation?.(); sfx('swing');
          if (this.onRotate) { this.onRotate(i, j); return; }   // co-op: the host turns it, for everyone
          c.r = (c.r + 1) % 4; this.draw(); if (this.solved()) this._win();
        });
        this.root.add(z);
      }
    }
  }

  _win() {
    if (this.won) return; this.won = true;
    this.scene.time.delayedCall(450, () => { this.destroy(); this.onSolved?.(); });
  }

  destroy() { if (this.closed) return; this.root?.destroy(); this.closed = true; }

  /** Every tile's rotation, row by row (the shared state). */
  rots() { return this.grid.flat().map((c) => c.r); }
  /** Take the host's rotations and redraw. */
  setRots(rots) { this.grid.flat().forEach((c, k) => { if (Number.isInteger(rots?.[k])) c.r = ((rots[k] % 4) + 4) % 4; }); if (this.root && !this.closed) this.draw(); }
  /** The host says it's solved: close and run onSolved. */
  finish() { this._win(); }
}
