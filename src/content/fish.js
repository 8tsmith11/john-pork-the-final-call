// Fishing tables (brief: "add fishing"). Real Chesapeake-watershed species, rotted glitch-fish, and
// rare oddities. Each catch is an item (food heals a little); the save keeps a fishing log.
export const FISH = {
  'item.fish_perch':    { name: 'White perch', slot: 'consumable', heal: 15, text: 'Silver, small, stubborn. The Chesapeake\'s most common fish, still, somehow.' },
  'item.fish_bluegill': { name: 'Bluegill', slot: 'consumable', heal: 12, text: 'A flat little sunfish with a blue cheek. Michael names every one he catches.' },
  'item.fish_catfish':  { name: 'Channel catfish', slot: 'consumable', heal: 25, text: 'Whiskers, attitude, and about four pounds of dinner.' },
  'item.fish_striper':  { name: 'Striped bass', slot: 'consumable', heal: 35, text: 'A rockfish. Maryland\'s state fish. Somebody in 2098 still cares about that.' },
  'item.fish_glitch':   { name: 'Glitch-fish', slot: 'consumable', heal: 10, text: 'It renders a frame behind where it actually is. Edible, probably. It tastes like static.' },
  'item.fish_loopfin':  { name: 'Loopfin', slot: 'consumable', heal: 18, text: 'Swims in a perfect circle even out of water. Its scales repeat the same three pixels.' },
  'item.fish_lantern':  { name: 'Lantern bass', slot: 'consumable', heal: 40, text: 'A largemouth bass with a light under its scales, slow and green, like a screen left on in another room. Only in the lake.' },
  'item.relic_phone':   { name: 'A ringing phone', slot: 'junk', text: 'A 2020s phone, waterlogged, cracked, and ringing. The caller ID is blank. It stops when you look at it.' },
  'item.relic_coin':    { name: '2081 commemorative coin', slot: 'junk', text: '"TEN YEARS OF STABILITY". Continuity minted a million of these. Nobody kept one on purpose.' },
  'item.relic_figure':  { name: 'Pork action figure', slot: 'junk', text: 'Banned merchandise. The paint on the face has been kissed off.' },
};

const TABLES = {
  metro_plaza: [['item.fish_perch', 30], ['item.fish_bluegill', 25], ['item.fish_catfish', 15], ['item.fish_striper', 6], ['item.fish_glitch', 10], ['item.relic_coin', 6], ['item.relic_phone', 4], ['item.relic_figure', 4]],
  lake:        [['item.fish_perch', 22], ['item.fish_bluegill', 22], ['item.fish_catfish', 18], ['item.fish_striper', 10], ['item.fish_lantern', 8], ['item.fish_glitch', 8], ['item.relic_figure', 6], ['item.relic_coin', 6]],
  tunnel_1:    [['item.fish_glitch', 45], ['item.fish_loopfin', 30], ['item.relic_phone', 15], ['item.relic_coin', 10]],
  default:     [['item.fish_perch', 50], ['item.fish_bluegill', 50]],
};

export function rollCatch(mapId) {
  const t = TABLES[mapId] ?? TABLES.default, total = t.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [id, w] of t) { r -= w; if (r < 0) return id; }
  return t[0][0];
}
