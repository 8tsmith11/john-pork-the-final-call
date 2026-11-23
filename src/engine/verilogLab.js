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
  {
    // The story bench (sealed plan, M3.I): harder than labs 1-3, same style. Five blanks; the reference card is
    // always on the bench, so it never needs anything else. With lab.book set, the book adds a hint per blank.
    id: 'reader', title: 'Bench 245: a serial reader', titleEs: 'Banco 245: un lector serie',
    goal: 'Eight data bits arrive, top bit first, then a parity bit. Pass each byte on as it came; raise valid only if parity checks.',
    goalEs: 'Llegan ocho bits, el de arriba primero, y luego la paridad. Entrega cada byte tal cual; valid en 1 solo si la paridad cuadra.',
    code: ['module reader (input logic clk, rst, bit_in,', '               output logic [7:0] data, output logic valid);', '  logic [7:0] sh; logic [3:0] n; logic par;', '  always_ff @(posedge clk)',
      '    if (rst) begin n <= 0; par <= 0; valid <= 0; end', '    else if (n == {0}) begin', '      valid <= ({1} == bit_in);', '      data <= {2}; n <= 0; par <= 0;', '    end else begin',
      '      sh <= {3}; par <= {4};', '      n <= n + 1; valid <= 0;', '    end', 'endmodule'],
    ref: [
      ['A frame is eight data bits, then one parity bit. n counts the data bits in, from 0.', 'Una trama son ocho bits de datos y luego uno de paridad. n cuenta los bits de datos que entran, desde 0.'],
      ['{a, b} glues bits together. {sh[6:0], bit_in} drops the top bit and puts bit_in at the bottom.', '{a, b} junta bits. {sh[6:0], bit_in} quita el bit de arriba y pone bit_in abajo.'],
      ['^ is XOR: 1 when the two bits differ. | is OR: 1 when either is 1.', '^ es XOR: 1 cuando los dos bits difieren. | es OR: 1 cuando alguno es 1.'],
      ['Even parity: the parity bit equals the XOR of all eight data bits.', 'Paridad par: el bit de paridad es igual al XOR de los ocho bits de datos.'],
      ["4'd8 is the number 8 in four bits. 8'h00 is a byte of zeros.", "4'd8 es el número 8 en cuatro bits. 8'h00 es un byte de ceros."],
    ],
    blanks: [
      { hint: 'When has a whole byte come in?', hintEs: '¿Cuándo entró un byte entero?',
        book: 'Count from zero: after eight data bits the counter reads eight, and the bit arriving now is the parity.', bookEs: 'Contando desde cero: tras ocho bits de datos el contador vale ocho, y el bit que llega ahora es la paridad.',
        options: [["4'd7", 7], ["4'd8", 8], ["4'd9", 9]] },
      { hint: 'The parity you worked out, against the parity bit that just arrived.', hintEs: 'La paridad que calculaste, contra el bit de paridad que acaba de llegar.',
        book: 'Compare what you computed, not what you guessed. A reader that assumes the answer reads nothing.', bookEs: 'Compara lo que calculaste, no lo que supones. Un lector que da por sabida la respuesta no lee nada.',
        options: [['par', (par) => par], ['!par', (par) => par ^ 1], ["1'b0", () => 0], ['sh[0]', (par, sh) => sh & 1]] },
      { hint: 'Hand on exactly what came in, good or bad. valid says which.', hintEs: 'Entrega exactamente lo que llegó, bueno o malo. valid dice cuál.',
        book: 'Never tidy the data. A bad byte is passed on as it is, and flagged.', bookEs: 'Nunca arregles los datos. Un byte malo se entrega como está, y se marca.',
        options: [["8'h00", () => 0], ['sh', (sh) => sh], ["{sh[3:0], sh[7:4]}", (sh) => ((sh & 15) << 4) | (sh >> 4)], ["sh & 8'h7F", (sh) => sh & 0x7f]] },
      { hint: 'Most significant bit first: each new bit goes in at the bottom and pushes the rest up.', hintEs: 'El bit más significativo primero: cada bit nuevo entra abajo y empuja el resto hacia arriba.',
        book: 'Shift toward the top. After eight shifts the first bit in is bit 7.', bookEs: 'Desplaza hacia arriba. Tras ocho desplazamientos, el primer bit que entró es el bit 7.',
        options: [['sh', (sh) => sh], ['{bit_in, sh[7:1]}', (sh, b) => (b << 7) | (sh >> 1)], ['{sh[6:0], bit_in}', (sh, b) => ((sh << 1) | b) & 255], ['bit_in', (sh, b) => b]] },
      { hint: 'Keep a running parity of the data bits so far.', hintEs: 'Lleva la paridad acumulada de los bits de datos hasta ahora.',
        book: 'Parity flips on every 1 and holds on every 0.', bookEs: 'La paridad cambia con cada 1 y se mantiene con cada 0.',
        options: [['par | bit_in', (par, b) => par | b], ['bit_in', (par, b) => b], ['par ^ bit_in', (par, b) => par ^ b], ['par', (par) => par]] },
    ],
    run(ch) {
      const [N, cmp, dat, shf, pf] = ch.map((c, i) => this.blanks[i].options[c][1]);
      const hex = (v) => v.toString(16).toUpperCase().padStart(2, '0');
      const frames = [[0xb2, 0], [0x5c, 1], [0xe1, 0], [0x07, 1], [0x80, 1], [0x3a, 1]];   // [byte, parity bit sent]
      const evenPar = (v) => [...v.toString(2)].filter((d) => d === '1').length & 1;
      const st = { sh: 0, n: 0, par: 0, valid: 0, data: 0 };
      let strays = 0;
      const clock = (b, rst = 0) => {
        if (rst) { st.n = 0; st.par = 0; st.valid = 0; return; }
        if (st.n === N) { st.valid = cmp(st.par, st.sh) === b ? 1 : 0; st.data = dat(st.sh); st.n = 0; st.par = 0; return; }
        st.sh = shf(st.sh, b) & 255; st.par = pf(st.par, b) & 1; st.n = (st.n + 1) & 15; st.valid = 0;
      };
      const out = [];
      clock(0, 1); clock(1); clock(0); clock(1); clock(0, 1);   // a few bits, then a reset: start clean
      out.push({ inputs: 'reset mid-frame', want: 'n=0', got: `n=${st.n}`, ok: st.n === 0 });
      frames.forEach(([v, p], k) => {
        for (let i = 7; i >= 0; i--) { clock((v >> i) & 1); strays += st.valid; }
        clock(p);
        const wantValid = evenPar(v) === p ? 1 : 0, ok = st.data === v && st.valid === wantValid;
        const tag = (d, ok1) => `${hex(d)} ${ok1 ? 'ok' : 'bad'}`;   // the byte handed on, and whether valid went up
        out.push({ inputs: `${hex(v)} +p${p}`, want: tag(v, wantValid), got: tag(st.data, st.valid), ok });
      });
      out.push({ inputs: 'between frames', want: 'valid=0', got: strays ? `valid=1 ×${strays}` : 'valid=0', ok: strays === 0 });
      return out;
    },
  },
];

export const labById = (id) => LABS.find((l) => l.id === id);

/** A fresh bench: every blank on its first option, nothing run yet. */
export function newBench(labId, { book = false } = {}) {
  const lab = labById(labId); if (!lab) throw new Error(`no lab ${labId}`);
  return { lab: labId, choices: lab.blanks.map(() => 0), results: null, passed: false, runs: 0, book: !!book };
}
/** Hints for blank i: the bench's own, plus the book's when the party has the book (lab.book). */
export function hintsFor(bench, i, es = false) {
  const b = labById(bench.lab)?.blanks[i]; if (!b) return [];
  return [es ? b.hintEs : b.hint, ...(bench.book && b.book ? [`${es ? 'Libro' : 'Book'}: ${es ? b.bookEs : b.book}`] : [])];
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
