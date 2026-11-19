// Puzzle kit: optional puzzles as data, so the planned item puzzles (docs/sealed/acts-2-3.md §2-3; the brief:
// "hard puzzles that are optional that give various boons") need no bespoke scene code. Engine only, no story:
// writers and the lore gate supply the specs in src/content/puzzles.js. The Four Clocks and Manuel's busts
// (optionalPuzzles.js) are the hand-built originals these generalize.
//
// Kinds:
//   cycle  - each part object steps through `states` when used (dials, valves, weights, clock hands). Solved when
//            `answer` matches (a list, or (seed) => list for a seeded answer), or when `check(states, ctx)` says so
//            (e.g. weights summing to a target). Clues live in other objects' text, as with the switchyard.
//   order  - use the parts in `answer` order. A wrong part resets the sequence (the busts).
//   timed  - using the part only works while `window(ctx)` is open (ring the bell at the tide that won't come,
//            follow the prints under the dish's sweep). `cycleWindow(period, open, offset)` builds a repeating one.
//
// State is in save flags (`pz.<id>.*`), so it saves, syncs to co-op clients like every other flag, and a solved
// puzzle stays solved. `use()` is pure: it returns the flags to set, the line to show, and the reward to give.

const KINDS = ['cycle', 'order', 'timed'];

/** Validates and returns a puzzle spec (throws with a clear message, like the other builders). */
export function definePuzzle(spec) {
  const { id, kind, parts, reward } = spec;
  if (!id || !/^[a-z0-9_]+$/.test(id)) throw new Error(`puzzle: bad id ${id}`);
  if (!KINDS.includes(kind)) throw new Error(`puzzle ${id}: kind must be one of ${KINDS.join(', ')}`);
  if (!Array.isArray(parts) || !parts.length) throw new Error(`puzzle ${id}: needs parts (object ids)`);
  if (!reward?.text) throw new Error(`puzzle ${id}: reward.text is required (what the player sees on solving)`);
  if (kind === 'cycle' && !(spec.states?.length >= 2)) throw new Error(`puzzle ${id}: a cycle puzzle needs 2+ states`);
  if (kind === 'cycle' && !spec.answer && !spec.check) throw new Error(`puzzle ${id}: a cycle puzzle needs answer or check`);
  if (kind === 'order' && !spec.answer) throw new Error(`puzzle ${id}: an order puzzle needs answer (part ids in order)`);
  if (kind === 'timed' && typeof spec.window !== 'function') throw new Error(`puzzle ${id}: a timed puzzle needs window(ctx)`);
  return { ...spec, solvedFlag: reward.flag ?? `pz.${id}.solved` };
}

/** A window open for `open` seconds out of every `period`, shifted by `offset` (ctx.t is play time in seconds). */
export const cycleWindow = (period, open, offset = 0) => (ctx) => ((((ctx.t ?? 0) - offset) % period) + period) % period < open;

const answerFor = (p, ctx) => (typeof p.answer === 'function' ? p.answer(ctx.seed) : p.answer);
const pick = (en, es, lang) => (lang === 'es' && es ? es : en);

/** The current state label of each part of a cycle puzzle. */
export function cycleStates(p, flags) { return p.parts.map((o) => p.states[(flags[`pz.${p.id}.${o}`] ?? 0) % p.states.length]); }

export function isSolved(p, flags) { return !!flags[p.solvedFlag]; }

/**
 * Use part `objId` of puzzle `p`. ctx: { seed, t, lang }. Returns { set: {flag: value}, say, solved, reward }.
 * `say` is the line to show (the part's own text is the caller's to prepend).
 */
export function use(p, objId, flags, ctx = {}) {
  const lang = ctx.lang ?? 'en', set = {};
  if (isSolved(p, flags)) return { set, say: pick(p.solvedText ?? 'It stays the way you left it.', p.solvedTextEs, lang), solved: false };
  let done = false, say = '';
  if (p.kind === 'cycle') {
    const key = `pz.${p.id}.${objId}`, n = ((flags[key] ?? 0) + 1) % p.states.length;
    set[key] = n;
    const after = { ...flags, [key]: n }, states = cycleStates(p, after), ans = answerFor(p, ctx);
    done = p.check ? !!p.check(states, ctx) : states.every((s, i) => s === ans[i]);
    say = pick(p.stepText ?? 'It now reads {state}.', p.stepTextEs, lang).replace('{state}', p.states[n]);
  } else if (p.kind === 'order') {
    const ans = answerFor(p, ctx), seq = String(flags[`pz.${p.id}.seq`] ?? '').split(',').filter(Boolean);
    if (objId !== ans[seq.length]) {
      set[`pz.${p.id}.seq`] = '';
      return { set, say: pick(p.wrongText ?? 'Nothing. Whatever you started has undone itself.', p.wrongTextEs, lang), solved: false, wrong: true };
    }
    seq.push(objId); set[`pz.${p.id}.seq`] = seq.join(',');
    done = seq.length === ans.length;
    say = pick(p.stepText ?? '({n} of {total})', p.stepTextEs, lang).replace('{n}', seq.length).replace('{total}', ans.length);
  } else if (p.kind === 'timed') {
    if (!p.window(ctx)) return { set, say: pick(p.closedText ?? 'Not now. Not like this.', p.closedTextEs, lang), solved: false };
    done = true;
  }
  if (!done) return { set, say, solved: false };
  set[p.solvedFlag] = true;
  return { set, say: pick(p.reward.text, p.reward.textEs, lang), solved: true, reward: p.reward };
}
