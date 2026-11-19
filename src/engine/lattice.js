// "Lattice": an original hex resource-trading board game played at the casino (task #27). Catan's
// genre (dice-driven production, building on corners and edges, trading), with its own board, costs,
// pieces and win target, sized for a ~5 minute game. Pure rules, no Phaser: tested in tests/run.js.
//
// Board: 7 hex districts (axial coords), the centre one is the dead zone where the coderot token
// starts. Each other district makes one material on its number. Pieces: LINKS on edges, RELAYS on
// corners (1 point), upgraded to HUBS (2 points, double output). First side to TARGET points wins.
import { Rng } from './rng.js';

export const RES = ['scrap', 'wire', 'cell', 'gel', 'glass'];
export const COST = {
  link: { scrap: 1, wire: 1 },
  relay: { scrap: 1, wire: 1, gel: 1, glass: 1 },
  hub: { cell: 2, glass: 2 },
};
export const TARGET = 6, HAND_LIMIT = 7, BANK_RATE = 3;
const HEXES = [[0, 0], [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const NUMBERS = [6, 8, 5, 9, 4, 10];           // no 7s; 6/8 most likely
const SIZE = 1;

// Corner positions of a pointy-top hex, rounded so shared corners dedupe.
function corners(q, r) {
  const cx = SIZE * Math.sqrt(3) * (q + r / 2), cy = SIZE * 1.5 * r;
  return [...Array(6)].map((_, i) => {
    const a = Math.PI / 180 * (60 * i - 30);
    return [Math.round((cx + SIZE * Math.cos(a)) * 1000) / 1000, Math.round((cy + SIZE * Math.sin(a)) * 1000) / 1000];
  });
}

export function newGame(seed = 'lattice', sides = ['party', 'npc']) {
  const rng = new Rng(`lattice:${seed}`);
  const mats = rng.shuffle ? rng.shuffle([...RES, RES[rng.int(0, RES.length - 1)]]) : [...RES, 'scrap'];
  const nums = rng.shuffle ? rng.shuffle([...NUMBERS]) : [...NUMBERS];
  const hexes = HEXES.map(([q, r], i) => i === 0 ? { q, r, res: null, num: null } : { q, r, res: mats[i - 1], num: nums[i - 1] });
  const vmap = new Map(), verts = [], edgeSet = new Map(), edges = [];
  hexes.forEach((h, hi) => {
    const cs = corners(h.q, h.r).map(([x, y]) => {
      const k = `${x},${y}`;
      if (!vmap.has(k)) { vmap.set(k, verts.length); verts.push({ x, y, hexes: [], owner: null, hub: false }); }
      const vi = vmap.get(k); verts[vi].hexes.push(hi); return vi;
    });
    h.verts = cs;
    for (let i = 0; i < 6; i++) {
      const a = cs[i], b = cs[(i + 1) % 6], k = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edgeSet.has(k)) { edgeSet.set(k, edges.length); edges.push({ a: Math.min(a, b), b: Math.max(a, b), owner: null }); }
    }
  });
  const hand = () => Object.fromEntries(RES.map((r) => [r, 0]));
  return {
    seed, rng, hexes, verts, edges, rot: 0,
    sides, turn: 0, phase: 'setup', setupStep: 0, rolled: false, lastRoll: null, winner: null, log: [],
    hands: Object.fromEntries(sides.map((s) => [s, hand()])),
  };
}

export const side = (g) => g.sides[g.turn % g.sides.length];
export const points = (g, who) => g.verts.reduce((t, v) => t + (v.owner === who ? (v.hub ? 2 : 1) : 0), 0);
const neighbours = (g, vi) => g.edges.filter((e) => e.a === vi || e.b === vi).map((e) => (e.a === vi ? e.b : e.a));
const canAfford = (h, cost) => Object.entries(cost).every(([r, n]) => h[r] >= n);
const pay = (h, cost) => { for (const [r, n] of Object.entries(cost)) h[r] -= n; };

// Corners at least two edges from any relay, and (after setup) touching one of your links.
export function canRelay(g, who, vi, free = false) {
  const v = g.verts[vi]; if (!v || v.owner) return false;
  if (neighbours(g, vi).some((n) => g.verts[n].owner)) return false;
  if (free) return true;
  return g.edges.some((e) => e.owner === who && (e.a === vi || e.b === vi));
}
export function canLink(g, who, ei) {
  const e = g.edges[ei]; if (!e || e.owner) return false;
  const touches = (vi) => g.verts[vi].owner === who || g.edges.some((x) => x !== e && x.owner === who && (x.a === vi || x.b === vi));
  return touches(e.a) || touches(e.b);
}
export const canHub = (g, who, vi) => g.verts[vi]?.owner === who && !g.verts[vi].hub;

// Setup: each side places a relay and a link, twice, in snake order (A B B A). Free.
const SETUP_ORDER = [0, 1, 1, 0];
export function setupSide(g) { return g.sides[SETUP_ORDER[Math.floor(g.setupStep / 2)]]; }
export function setupPlace(g, vi, ei) {
  const who = setupSide(g);
  if (!canRelay(g, who, vi, true)) return false;
  const e = g.edges[ei]; if (!e || e.owner || (e.a !== vi && e.b !== vi)) return false;
  g.verts[vi].owner = who; e.owner = who;
  // the second relay pays out its districts once, so nobody starts empty
  if (g.setupStep >= 4) for (const hi of g.verts[vi].hexes) { const h = g.hexes[hi]; if (h.res) g.hands[who][h.res]++; }
  g.setupStep += 2;
  if (g.setupStep >= SETUP_ORDER.length * 2) { g.phase = 'play'; g.turn = 0; }
  return true;
}

export function roll(g, forced = null) {
  if (g.phase !== 'play' || g.rolled || g.winner) return null;
  const d = forced ?? [g.rng.int(1, 6), g.rng.int(1, 6)], n = d[0] + d[1];
  g.rolled = true; g.lastRoll = d;
  if (n === 7) {
    for (const s of g.sides) {   // over the limit: lose half (rounded down), from your biggest piles
      const h = g.hands[s]; let total = RES.reduce((t, r) => t + h[r], 0);
      if (total > HAND_LIMIT) { let lose = Math.floor(total / 2); while (lose-- > 0) { const r = RES.reduce((a, b) => (h[b] > h[a] ? b : a)); h[r]--; } }
    }
    g.mustMoveRot = true; g.log.push(`${side(g)} rolled 7: coderot spreads`);
    return n;
  }
  g.hexes.forEach((h, hi) => {
    if (h.num !== n || hi === g.rot || !h.res) return;
    for (const vi of h.verts) { const v = g.verts[vi]; if (v.owner) g.hands[v.owner][h.res] += v.hub ? 2 : 1; }
  });
  g.log.push(`${side(g)} rolled ${n}`);
  return n;
}
export function moveRot(g, hi) {
  if (!g.mustMoveRot || hi === g.rot || !g.hexes[hi]) return false;
  g.rot = hi; g.mustMoveRot = false;
  // take one material from an opponent with a relay there
  const who = side(g), victim = g.hexes[hi].verts.map((vi) => g.verts[vi].owner).find((o) => o && o !== who);
  if (victim) { const h = g.hands[victim], have = RES.filter((r) => h[r] > 0); if (have.length) { const r = have[g.rng.int(0, have.length - 1)]; h[r]--; g.hands[who][r]++; } }
  return true;
}

export function build(g, kind, idx) {
  const who = side(g), h = g.hands[who];
  if (g.phase !== 'play' || !g.rolled || g.mustMoveRot || g.winner || !canAfford(h, COST[kind])) return false;
  const ok = kind === 'link' ? canLink(g, who, idx) : kind === 'relay' ? canRelay(g, who, idx) : canHub(g, who, idx);
  if (!ok) return false;
  pay(h, COST[kind]);
  if (kind === 'link') g.edges[idx].owner = who; else if (kind === 'relay') g.verts[idx].owner = who; else g.verts[idx].hub = true;
  if (points(g, who) >= TARGET) g.winner = who;
  return true;
}
export function bankTrade(g, give, get) {
  const h = g.hands[side(g)];
  if (!g.rolled || g.mustMoveRot || give === get || h[give] < BANK_RATE) return false;
  h[give] -= BANK_RATE; h[get]++; return true;
}
// Offer the other side a 1-for-1 swap; they accept if they have it and want what you give more.
export function offerTrade(g, give, get) {
  const me = side(g), them = g.sides.find((s) => s !== me), hm = g.hands[me], ht = g.hands[them];
  if (!g.rolled || hm[give] < 1 || ht[get] < 1 || give === get) return false;
  if (!(ht[give] < ht[get] && ht[get] > 1)) return false;   // they keep what they're short of
  hm[give]--; ht[give]++; ht[get]--; hm[get]++; return true;
}
export function endTurn(g) {
  if (g.phase !== 'play' || !g.rolled || g.mustMoveRot || g.winner) return false;
  g.turn++; g.rolled = false; return true;
}

// --- the opponent (and a stand-in for idle roommates): greedy, prefers likely numbers ---
const PIPS = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
const vertValue = (g, vi) => g.verts[vi].hexes.reduce((t, hi) => t + (hi === g.rot ? 0 : PIPS[g.hexes[hi].num] ?? 0), 0);
export function aiSetup(g) {
  const who = setupSide(g);
  const vs = g.verts.map((_, i) => i).filter((i) => canRelay(g, who, i, true)).sort((a, b) => vertValue(g, b) - vertValue(g, a));
  const vi = vs[0], ei = g.edges.findIndex((e) => !e.owner && (e.a === vi || e.b === vi));
  return setupPlace(g, vi, ei);
}
export function aiTurn(g) {
  const who = side(g);
  if (!g.rolled) roll(g);
  if (g.mustMoveRot) {   // put coderot on the opponent's best district
    const best = g.hexes.map((h, i) => i).filter((i) => i !== g.rot && g.hexes[i].res)
      .sort((a, b) => g.hexes[b].verts.filter((v) => g.verts[v].owner && g.verts[v].owner !== who).length - g.hexes[a].verts.filter((v) => g.verts[v].owner && g.verts[v].owner !== who).length);
    moveRot(g, best[0]);
  }
  for (let guard = 0; guard < 12 && !g.winner; guard++) {
    const hubs = g.verts.map((_, i) => i).filter((i) => canHub(g, who, i)).sort((a, b) => vertValue(g, b) - vertValue(g, a));
    if (hubs.length && build(g, 'hub', hubs[0])) continue;
    const spots = g.verts.map((_, i) => i).filter((i) => canRelay(g, who, i)).sort((a, b) => vertValue(g, b) - vertValue(g, a));
    if (spots.length && build(g, 'relay', spots[0])) continue;
    // extend toward the best open corner
    const links = g.edges.map((_, i) => i).filter((i) => canLink(g, who, i));
    const linkScore = (i) => Math.max(vertValue(g, g.edges[i].a) * (g.verts[g.edges[i].a].owner ? 0 : 1), vertValue(g, g.edges[i].b) * (g.verts[g.edges[i].b].owner ? 0 : 1));
    links.sort((a, b) => linkScore(b) - linkScore(a));
    if (!spots.length && links.length && canAfford(g.hands[who], COST.link) && build(g, 'link', links[0])) continue;
    // trade down a surplus with the bank for what the next relay needs
    const h = g.hands[who], need = RES.find((r) => (COST.relay[r] ?? 0) > h[r] || (COST.hub[r] ?? 0) > h[r]);
    const surplus = RES.find((r) => h[r] >= BANK_RATE + (COST.relay[r] ?? 0));
    if (need && surplus && bankTrade(g, surplus, need)) continue;
    break;
  }
  if (!g.winner) endTurn(g);
}
