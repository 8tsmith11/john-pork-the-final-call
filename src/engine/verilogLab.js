// A lab-bench puzzle in SystemVerilog's style (hub #44): a short module with blanks; click a blank to cycle its
// options, run the testbench, pass every vector. Each option carries the code you see and a tiny JS model of what it
// does, so the "simulator" is just those models stepped against the testbench. Readable by non-coders: every blank
// has a plain-English hint. Pure rules; the screen and the co-op table live in src/game/.

export const LABS = [
  {
    id: 'mux', title: 'Lab 1: a 2-to-1 multiplexer', titleEs: 'Lab 1: un multiplexor 2 a 1',
    goal: 'When sel is 1, y follows b. When sel is 0, y follows a.', goalEs: 'Cuando sel es 1, y sigue a b. Cuando sel es 0, y sigue a a.',
    code: ['module mux2 (input logic a, b, sel,', '             output logic y);', '  assign y = {0};', 'endmodule'],
    blanks: [{ hint: 'Pick b when sel is high, otherwise a.', hintEs: 'Elige b cuando sel está en alto; si no, a.',
      options: [['a & b', (a, b) => a & b], ['sel ? a : b', (a, b, sel) => (sel ? a : b)], ['sel ? b : a', (a, b, sel) => (sel ? b : a)], ['a | sel', (a, b, sel) => a | sel]] }],
    run(ch) {
      const f = this.blanks[0].options[ch[0]][1], out = [];
      for (let v = 0; v < 8; v++) { const a = v & 1, b = (v >> 1) & 1, sel = (v >> 2) & 1, want = sel ? b : a, got = f(a, b, sel) & 1; out.push({ inputs: `a=${a} b=${b} sel=${sel}`, want: `y=${want}`, got: `y=${got}`, ok: want === got }); }
      return out;
    },
  },
  {
    id: 'counter', title: 'Lab 2: a counter with reset', titleEs: 'Lab 2: un contador con reset',
    goal: 'On every clock edge, count up by one. While rst is 1, go back to 0.', goalEs: 'En cada flanco de reloj, suma uno. Mientras rst es 1, vuelve a 0.',
    code: ['module counter (input logic clk, rst,', '                output logic [3:0] q);', '  always_ff @(posedge clk)', '    if ({0}) q <= {1};', '    else     q <= {2};', 'endmodule'],
    blanks: [
      { hint: 'The condition for going back to zero.', hintEs: 'La condición para volver a cero.', options: [['rst', (rst) => rst], ['!rst', (rst) => !rst], ['clk', () => true]] },
      { hint: 'What q becomes on reset.', hintEs: 'Lo que vale q en el reset.', options: [["4'd0", () => 0], ["4'd1", () => 1], ['q', (q) => q]] },
      { hint: 'What q becomes otherwise: one more than now.', hintEs: 'Lo que vale q si no: uno más que ahora.', options: [['q - 1', (q) => q - 1], ['q', (q) => q], ['q + 1', (q) => q + 1], ['q + 2', (q) => q + 2]] },
    ],
    run(ch) {
      const [cond, rv, nx] = ch.map((c, i) => this.blanks[i].options[c][1]);
      const rsts = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let q = 5, w = 5; const out = [];
      rsts.forEach((rst, t) => {
        q = (cond(rst) ? rv(q) : nx(q)) & 15; w = (rst ? 0 : w + 1) & 15;
        if (t < 8 || t === 19) out.push({ inputs: `clock ${t + 1}, rst=${rst}`, want: `q=${w}`, got: `q=${q}`, ok: q === w });
      });
      return out;
    },
  },
  {
    id: 'fsm', title: 'Lab 3: spot the pattern 1-0-1', titleEs: 'Lab 3: detecta el patrón 1-0-1',
    goal: 'Raise found for one clock when the last three bits in were 1, 0, 1.', goalEs: 'Pon found en 1 durante un ciclo cuando los últimos tres bits fueron 1, 0, 1.',
    code: ['typedef enum logic [1:0] {IDLE, GOT1, GOT10} state_t;', 'state_t s;', 'always_ff @(posedge clk) case (s)', '  IDLE:  s <= bit_in ? {0} : IDLE;', '  GOT1:  s <= bit_in ? GOT1 : {1};', '  GOT10: s <= bit_in ? {2} : IDLE;', 'endcase', 'assign found = (s == GOT10) && bit_in;'],
    blanks: [
      { hint: 'Saw a 1 from nothing: we have the first bit.', hintEs: 'Vino un 1 desde cero: tenemos el primer bit.', options: [['IDLE', 0], ['GOT1', 1], ['GOT10', 2]] },
      { hint: 'After a 1, a 0 makes "1 0".', hintEs: 'Después de un 1, un 0 forma "1 0".', options: [['IDLE', 0], ['GOT1', 1], ['GOT10', 2]] },
      { hint: 'After "1 0", a 1 finishes the pattern, and that 1 can start the next one.', hintEs: 'Después de "1 0", un 1 completa el patrón, y ese 1 puede empezar el siguiente.', options: [['IDLE', 0], ['GOT1', 1], ['GOT10', 2]] },
    ],
    run(ch) {
      const nxt = ch.map((c, i) => this.blanks[i].options[c][1]);
      const bits = [1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1];
      let s = 0; const hist = []; const out = [];
      bits.forEach((b, t) => {
        const got = s === 2 && b === 1 ? 1 : 0;
        hist.push(b); const last = hist.slice(-3).join(''), want = last === '101' ? 1 : 0;
        out.push({ inputs: `bit ${t + 1} = ${b}`, want: `found=${want}`, got: `found=${got}`, ok: got === want });
        s = s === 0 ? (b ? nxt[0] : 0) : s === 1 ? (b ? 1 : nxt[1]) : (b ? nxt[2] : 0);
      });
      return out;
    },
  },
];

export const labById = (id) => LABS.find((l) => l.id === id);

/** A fresh bench: every blank on its first option, nothing run yet. */
export function newBench(labId) {
  const lab = labById(labId); if (!lab) throw new Error(`no lab ${labId}`);
  return { lab: labId, choices: lab.blanks.map(() => 0), results: null, passed: false, runs: 0 };
}
export function cycle(bench, i) {
  const lab = labById(bench.lab); if (!lab.blanks[i] || bench.passed) return false;
  bench.choices[i] = (bench.choices[i] + 1) % lab.blanks[i].options.length; bench.results = null; return true;
}
export function runTests(bench) {
  const lab = labById(bench.lab);
  bench.results = lab.run(bench.choices); bench.runs++;
  bench.passed = bench.results.every((r) => r.ok);
  return bench.passed;
}
/** The code with the current choices filled in: [{ text, blank: index|null }] runs per line, for the screen. */
export function codeLines(bench) {
  const lab = labById(bench.lab);
  return lab.code.map((line) => line.split(/(\{\d+\})/).filter(Boolean).map((part) => {
    const m = part.match(/^\{(\d+)\}$/); if (!m) return { text: part, blank: null };
    const i = +m[1]; return { text: lab.blanks[i].options[bench.choices[i]][0], blank: i };
  }));
}
/** The right answer (for tests): the choices that pass. */
export function solve(labId) {
  const lab = labById(labId), n = lab.blanks.map((b) => b.options.length), ch = n.map(() => 0);
  const total = n.reduce((a, b) => a * b, 1);
  for (let k = 0; k < total; k++) {
    let x = k; for (let i = 0; i < n.length; i++) { ch[i] = x % n[i]; x = Math.floor(x / n[i]); }
    if (lab.run(ch).every((r) => r.ok)) return [...ch];
  }
  return null;
}
