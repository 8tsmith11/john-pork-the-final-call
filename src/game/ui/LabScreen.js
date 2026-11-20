// The lab bench screen (hub #44): an editor with line numbers and syntax colours, blanks as clickable chips that
// cycle their options, a plain-English hint for the blank you hover, and a testbench panel that lists every vector,
// expected against actual. Pass them all and the lab is done.
//   new LabScreen(scene, { act(move), leave() })  ·  view.update(bench)  ·  view.close()
import { VIEW } from '../../view.js';
import * as V from '../../engine/verilogLab.js';
import { getLang } from '../../i18n.js';

const es = () => getLang() === 'es';
const T = (en, sp) => (es() ? sp : en);
const F = (size, color = '#e8e8f0', extra = {}) => ({ fontFamily: 'monospace', fontSize: `${size}px`, color, ...extra });
const KEYWORDS = /\b(module|endmodule|input|output|logic|assign|always_ff|posedge|if|else|case|endcase|typedef|enum|begin|end)\b/;

export class LabScreen {
  constructor(scene, { act = () => {}, leave = () => {} } = {}) {
    this.s = scene; this.act = act; this.onLeave = leave; this.closed = false; this.hover = null; this.bench = null; this.tab = 'tests';
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9770);
    this.esc = (ev) => { if (ev.key === 'Escape') this.leave(); };
    scene.input.keyboard.on('keydown', this.esc);
  }

  update(bench) { if (this.closed || !bench) return; this.bench = bench; this.redraw(); }

  redraw() {
    this.root.removeAll(true);
    const s = this.s, b = this.bench, lab = V.labById(b.lab), g = s.add.graphics(), add = (o) => { this.root.add(o); return o; };
    this.root.add(g);
    g.fillStyle(0x07090f, 1).fillRect(0, 0, VIEW.w, VIEW.h);
    // window chrome
    g.fillStyle(0x161a26, 1).fillRoundedRect(6, 6, VIEW.w - 12, VIEW.h - 12, 5).lineStyle(1, 0x2f3650, 1).strokeRoundedRect(6, 6, VIEW.w - 12, VIEW.h - 12, 5);
    g.fillStyle(0x0f121b, 1).fillRect(7, 7, VIEW.w - 14, 14);
    for (const [i, c] of [[0, 0xe06c75], [1, 0xe5c07b], [2, 0x98c379]].map(([i, c]) => [i, c])) g.fillStyle(c, 1).fillCircle(15 + i * 8, 14, 2.5);
    add(s.add.text(VIEW.w / 2, 9, `lab245 · ${b.lab}.sv`, F(7, '#9aa3c7')).setOrigin(0.5, 0));
    const close = add(s.add.text(VIEW.w - 12, 9, T('[ESC] step away', '[ESC] alejarse'), F(6, '#9aa3c7')).setOrigin(1, 0).setInteractive({ useHandCursor: true }));
    close.on('pointerdown', () => this.leave());
    add(s.add.text(14, 26, es() ? lab.titleEs : lab.title, F(9, '#e5c07b', { heading: true })));
    add(s.add.text(14, 39, es() ? lab.goalEs : lab.goal, { ...F(7, '#c9cde0'), wordWrap: { width: 270 } }));
    // the editor
    const ex = 12, ey = 58, ew = 280, lh = 11;
    g.fillStyle(0x0b0e16, 1).fillRect(ex, ey, ew, 150);
    V.codeLines(b).forEach((runs, li) => {
      const y = ey + 6 + li * lh;
      add(s.add.text(ex + 4, y, String(li + 1).padStart(2, ' '), F(7, '#4a5175')));
      let x = ex + 20;
      for (const r of runs) {
        if (r.blank == null) {
          for (const tok of r.text.split(/(\s+|[(),;:?\[\]{}=<>&|!]+)/).filter((t) => t !== '')) {
            const color = KEYWORDS.test(tok) ? '#c678dd' : /^\d|'d/.test(tok) ? '#d19a66' : /^[A-Z][A-Z0-9_]+$/.test(tok) ? '#e5c07b' : '#abb2bf';
            const t = add(s.add.text(x, y, tok, F(7, color))); x += t.width;
          }
          continue;
        }
        const t = s.add.text(x + 2, y, r.text, F(7, b.passed ? '#98c379' : '#ffffff'));
        g.fillStyle(b.passed ? 0x1e3324 : this.hover === r.blank ? 0x3a3f66 : 0x2a2f4a, 1).fillRoundedRect(x, y - 1, t.width + 4, lh, 2);
        g.lineStyle(1, b.passed ? 0x98c379 : 0x61afef, 0.9).strokeRoundedRect(x, y - 1, t.width + 4, lh, 2);
        add(t);
        if (!b.passed) {
          const i = r.blank, z = add(s.add.zone(x, y - 1, t.width + 4, lh).setOrigin(0).setInteractive({ useHandCursor: true }));
          z.on('pointerover', () => { if (this.hover !== i) { this.hover = i; this.redraw(); } });
          z.on('pointerdown', () => this.act({ type: 'cycle', i }));
        }
        x += t.width + 6;
      }
    });
    const hint = this.hover != null ? V.hintsFor(b, this.hover, es()) : null;
    add(s.add.text(ex, ey + 154, hint ? hint.map((h) => `// ${h}`).join('\n') : T('// click a blue chip to try another option', '// haz clic en un recuadro azul para probar otra opción'), { ...F(7, '#7f848e'), wordWrap: { width: ew } }));
    // the testbench
    const tx = 300, ty = 26, tw = VIEW.w - tx - 12;
    g.fillStyle(0x0b0e16, 1).fillRect(tx, ty, tw, 196);
    // A lab with a reference card (the story bench) gets a second tab; the card is always there, book or not.
    const tabs = lab.ref ? [['tests', T('TESTBENCH', 'BANCO DE PRUEBAS')], ['ref', T('REFERENCE', 'REFERENCIA')]] : [['tests', T('TESTBENCH', 'BANCO DE PRUEBAS')]];
    let tabX = tx + 6;
    for (const [id, label] of tabs) {
      const t = add(s.add.text(tabX, ty + 4, label, F(7, this.tab === id ? '#61afef' : '#4a5175')));
      if (tabs.length > 1) t.setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.tab = id; this.redraw(); });
      tabX += t.width + 10;
    }
    if (this.tab === 'ref' && lab.ref) {
      lab.ref.forEach(([en, sp], i) => add(s.add.text(tx + 6, ty + 18 + i * 34, `• ${es() ? sp : en}`, { ...F(6, '#c9cde0'), wordWrap: { width: tw - 12 } })));
    } else if (!b.results) add(s.add.text(tx + 6, ty + 18, T('Not run yet.', 'Todavía no se ejecutó.'), F(7, '#7f848e')));
    else if (this.tab !== 'ref') b.results.forEach((r, i) => {
      const y = ty + 18 + i * 12;
      add(s.add.text(tx + 6, y, r.ok ? '✓' : '✗', F(8, r.ok ? '#98c379' : '#e06c75')));
      add(s.add.text(tx + 16, y + 1, r.inputs, F(6, '#abb2bf')));
      add(s.add.text(tx + tw - 6, y + 1, r.ok ? r.got : `${r.got} (≠ ${r.want})`, F(6, r.ok ? '#98c379' : '#e06c75')).setOrigin(1, 0));
    });
    // run button and verdict
    const by = 228;
    g.fillStyle(b.passed ? 0x1e3324 : 0x1d2a44, 1).fillRoundedRect(tx, by, 74, 16, 3).lineStyle(1, b.passed ? 0x98c379 : 0x61afef, 1).strokeRoundedRect(tx, by, 74, 16, 3);
    add(s.add.text(tx + 37, by + 4, b.passed ? T('PASSED', 'APROBADO') : T('RUN TESTS', 'PROBAR'), F(7, b.passed ? '#98c379' : '#e8f1ff')).setOrigin(0.5, 0));
    if (!b.passed) add(s.add.zone(tx, by, 74, 16).setOrigin(0).setInteractive({ useHandCursor: true })).on('pointerdown', () => this.act({ type: 'run' }));
    const fails = b.results ? b.results.filter((r) => !r.ok).length : null;
    const verdict = b.passed ? T('All vectors pass. Lab complete.', 'Pasan todos los vectores. Lab completo.') : fails != null ? T(`${fails} of ${b.results.length} vectors fail.`, `Fallan ${fails} de ${b.results.length} vectores.`) : T(`Runs so far: ${b.runs}`, `Ejecuciones: ${b.runs}`);
    add(s.add.text(tx + 80, by + 4, verdict, { ...F(6, b.passed ? '#98c379' : '#c9cde0'), wordWrap: { width: tw - 80 } }));
  }

  leave() { if (this.closed) return; this.onLeave?.(); this.close(); }
  close() { if (this.closed) return; this.closed = true; this.s.input.keyboard.off('keydown', this.esc); this.root.destroy(); }
}
