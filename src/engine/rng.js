// Seeded randomness. One world seed, many independent named streams (docs/tech/PLAN.md §4):
// adding a draw to one stream never reshuffles another.

/** cyrb53: fast 53-bit string hash. */
export function hashString(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/** sfc32 PRNG. Returns floats in [0, 1). */
function sfc32(a, b, c, d) {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export class Rng {
  constructor(key) {
    const h = (s) => hashString(key, s) >>> 0;
    this._next = sfc32(h(1), h(2), h(3), h(4));
    for (let i = 0; i < 12; i++) this._next(); // warm up
  }
  next() { return this._next(); }
  /** Integer in [min, max] inclusive. */
  int(min, max) { return min + Math.floor(this._next() * (max - min + 1)); }
  chance(p) { return this._next() < p; }
  pick(arr) { return arr[Math.floor(this._next() * arr.length)]; }
  /** Pick from [{w, ...}] by weight. */
  weighted(items) {
    const total = items.reduce((s, it) => s + (it.w ?? 1), 0);
    let r = this._next() * total;
    for (const it of items) { r -= it.w ?? 1; if (r < 0) return it; }
    return items[items.length - 1];
  }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this._next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
}

/** Named streams derived from a world seed. */
export function makeStreams(seed) {
  const cache = new Map();
  return (name) => {
    if (!cache.has(name)) cache.set(name, new Rng(`${seed}::${name}`));
    return cache.get(name);
  };
}

export function newSeed() {
  const words = ['rot', 'pork', 'aster', 'mate', 'helium', 'sahur', 'cheese', 'metro', 'shrimp', 'fab', 'lace', 'ottoman'];
  const r = new Rng(`${Date.now()}-${Math.random()}`);
  return `${r.pick(words)}-${r.pick(words)}-${r.int(1000, 9999)}`;
}
