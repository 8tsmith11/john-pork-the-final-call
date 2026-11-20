// Dialogue runtime for the generated scene data (tools/dialogue/convert.py).
// Conditions are evaluated leniently: unknown expressions count as true, so draft scripts play.

const rot13 = (s) => s.replace(/[a-zA-Z]/g, (c) => {
  const b = c <= 'Z' ? 65 : 97;
  return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
});

import { getLang } from '../i18n.js';

const cache = new Map();
export async function loadScene(name) {
  if (!cache.has(name)) {
    const mod = await import(`../content/dialogue/act1/${name}.js`);
    cache.set(name, JSON.parse(rot13(mod.default)));
  }
  return cache.get(name);
}

/** ctx: { speaker, present:[ids], flags, inventory:[ids], seed:'A'|'B', morph:int, standing:{} } */
export function evalCond(expr, ctx) {
  if (!expr) return true;
  return expr.split(/\s*&&\s*|\s+and\s+/).every((part) => evalAtom(part.trim(), ctx));
}

function lookup(name, flags) {
  if (name in flags) return flags[name];
  const hit = Object.keys(flags).find((k) => k.endsWith(`.${name}`));
  return hit ? flags[hit] : undefined;
}

function evalAtom(a, ctx) {
  a = a.replace(/\(replaces.*$|\(append.*$/i, '').replace(/[`*]/g, '').trim();
  let m;
  if (!a || /none of the above|any speaker|^else$/i.test(a)) return true;
  if ((m = a.match(/^not\s*\((.*)\)$/i))) return !evalAtom(m[1], ctx);
  if ((m = a.match(/^(?:not|!)\s*(?:flag\s+)?(.+)$/i))) return !evalAtom(`flag ${m[1]}`, ctx);
  if ((m = a.match(/^speaker\s*(!?=)\s*(\w+)/i))) return (ctx.speaker === m[2].toLowerCase()) === (m[1] === '=');
  if ((m = a.match(/^present\s+(\w+)/i))) return ctx.present.includes(m[1].toLowerCase());
  if ((m = a.match(/^item\s+(\w+)/i))) return ctx.inventory.some((i) => i.includes(m[1]));
  if ((m = a.match(/^seed\s*=\s*([AB])/i))) return ctx.seed === m[1].toUpperCase();
  if ((m = a.match(/^morph\s*(>=|<|>|<=|==)\s*(\d+)/i))) return cmp(ctx.morph, m[1], +m[2]);
  if ((m = a.match(/^standing\s+(\w+)\s*(>=|<|>|<=|==)\s*(-?\d+)/i))) return cmp(ctx.standing[m[1]] ?? 0, m[2], +m[3]);
  if (/^once$/i.test(a)) return !ctx.flags[`dlg.once.${ctx.nodeId}`];
  if ((m = a.match(/^money\s*(>=|<=|>|<|==)\s*(\d+)/i))) return cmp(ctx.money ?? 0, m[1], +m[2]);
  if ((m = a.match(/^flag\s+([\w.\-]+)(?:\s*=\s*(\w+))?/i))) {
    const v = lookup(m[1], ctx.flags);
    return m[2] ? String(v) === m[2] : !!v && v !== 'off';
  }
  if ((m = a.match(/^([\w.\-]+)\s*(>=|<=|==|=|>|<)\s*([\w\-]+)/))) {
    const v = lookup(m[1], ctx.flags);
    if (m[3] === 'on' || m[3] === 'off') return (m[3] === 'on') === (!!v && v !== 'off');
    if (/^-?\d+$/.test(m[3])) return cmp(Number(v ?? 0), m[2] === '=' ? '==' : m[2], +m[3]);
    return String(v) === m[3];
  }
  if ((m = a.match(/^([\w.\-]+)$/))) { const v = lookup(m[1], ctx.flags); return v === undefined ? false : !!v && v !== 'off'; }
  return true; // unknown phrasing in a draft: don't block the scene
}

function cmp(a, op, b) {
  return op === '>=' ? a >= b : op === '<=' ? a <= b : op === '>' ? a > b : op === '<' ? a < b : a === b;
}

/** Apply "set x; y +1; give item z; standing callers +1" style effects. Returns a list of changes. */
export function applyEffects(effects, ctx, sink) {
  for (const eff of effects || []) {
    if (!evalCond(eff.if, ctx)) continue;
    // "Set `a = 1`, `b`. If the timeout fired..." → ["set a = 1", "set b"]; prose sentences are dropped.
    const body = `${eff.op} ${eff.arg}`.replace(/`/g, '').split(/\.\s+(?=[A-Z])/)[0];
    const parts = body.split(/;\s*|,\s*(?:and\s+)?/).map((x, i) => (i === 0 || /^(set|give|standing)\b/i.test(x.trim()) || !/^[\w.\-]+(\s*(=|\+)|$)/.test(x.trim()) ? x : `set ${x}`));
    for (let p of parts) {
      p = p.replace(/[*.]+$/g, '').replace(/\(.*?\)/g, '').replace(/\s+(true|on)$/i, '').trim();
      let m;
      if ((m = p.match(/^(?:set\s+)?([\w.\-]+)\s*\+\s*(\d+)/i))) sink.flag(m[1], (Number(ctx.flags[m[1]] ?? 0) + +m[2]));
      else if ((m = p.match(/^set\s+([\w.\-]+)(?:\s*=\s*([\w\-]+))?/i))) sink.flag(m[1], m[2] ?? true);
      // give item sniffer · give item.sniffer · give item item.sniffer 2 · give sniffer x3
      else if ((m = p.match(/^give\s+(?:item\s+)?(?:item\.)?([\w\-]+)(?:\s*[x×]?\s*(\d+))?/i))) sink.item(m[1], m[2] ? +m[2] : 1);
      else if ((m = p.match(/^standing\s+(\w+)\s*([+-]\d+)/i))) sink.standing(m[1], +m[2]);
      else if ((m = p.match(/^pay\s+\$?(\d+)/i))) sink.pay?.(+m[1]);
    }
  }
}

/** Steps through one scene from a node. */
export class Conversation {
  constructor(scene, startId, ctx, sink) {
    this.scene = scene; this.ctx = ctx; this.sink = sink;
    this._enter(startId ?? scene.start);
  }

  _enter(id) {
    this.node = this.scene.nodes[id];
    this.nodeId = id; this.ctx.nodeId = id;
    if (!this.node) { this.done = true; return; }
    // Spanish (task 28): a line or choice with an `es` text shows it when the language is Spanish.
    const es = getLang() === 'es';
    this.lines = this.node.lines.filter((l) => evalCond(l.if, this.ctx)).map((l) => (es && l.es ? { ...l, text: l.es } : l));
    this.i = 0;
    this.revealedLine = -1;
    applyEffects(this.node.effects, this.ctx, this.sink);
    this.sink.flag(`dlg.once.${id}`, true);
    if (!this.lines.length) this._afterLines();
  }

  get line() { return this.lines?.[this.i] ?? null; }

  revealLine() {
    if (this.revealedLine === this.i || !this.line?.reveal?.length) return;
    this.revealedLine = this.i;
    for (const flag of this.line.reveal) if (!this.ctx.flags[flag]) this.sink.flag(flag, true);
  }

  get choices() {
    if (!this.node || this.i < this.lines.length) return [];
    const es = getLang() === 'es';
    return this.node.choices.filter((c) => evalCond(c.if, this.ctx)).map((c) => (es && c.es ? { ...c, text: c.es } : c));
  }

  advance() {
    if (this.done) return;
    if (this.i < this.lines.length) this.i++;
    if (this.i >= this.lines.length && !this.choices.length) this._afterLines();
  }

  _afterLines() {
    this.i = this.lines.length;
    if (this.choices.length) return;
    const cond = (this.node.gos || []).find((g) => evalCond(g.if, this.ctx));
    const next = cond?.go ?? this.node.go;
    if (next && this.scene.nodes[next]) this._enter(next); else this.done = true;
  }

  choose(index) {
    const c = this.choices[index];
    if (c) this._enter(c.go);
  }
}
