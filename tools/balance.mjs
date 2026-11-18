// Headless balance probe: a scripted human (chase + swing + dash away when low) with two AI
// companions clears a map. Reports time, downs, wipes, and HP lost. Usage: node tools/balance.mjs "$PWD"
const root = process.argv[2];
const { Sim, emptyInput } = await import(root + '/src/engine/sim.js');
const { CompanionBrain } = await import(root + '/src/engine/companion.js');
const { MAPS } = await import(root + '/src/content/maps/index.js');
const { playerMods } = await import(root + '/src/content/items.js');

function run(mapId, solo, gear, seed) {
  const sim = new Sim(MAPS[mapId], { seed });
  sim.addPlayer('host', 'trevor');
  if (!solo) { sim.addPlayer('ai:manuel', 'manuel'); sim.addPlayer('ai:michael', 'michael'); }
  const char = { equipped: gear ? { weapon: 'item.wooden_bat', armor: 'item.mesh_vest' } : {}, skills: {} };
  for (const p of sim.players.values()) sim.setMods(p.id, playerMods(char, p.character));
  const brain = new CompanionBrain(sim), h = sim.players.get('host');
  const start = sim.enemies.size; let downs = 0, wipes = 0, dmg = 0, t = 0;
  for (; t < 60 * 600 && sim.enemies.size > 0; t++) {
    let foe = null, fd = 1e9;
    for (const e of sim.enemies.values()) { const d = Math.hypot(e.x - h.x, e.y - h.y); if (d < fd) { fd = d; foe = e; } }
    const inp = emptyInput();
    if (foe && !h.downed) {
      const a = Math.atan2(foe.y - h.y, foe.x - h.x); inp.aim = a;
      if (fd > 16) { inp.mx = Math.cos(a); inp.my = Math.sin(a); } else inp.attack = true;
      if (h.hp < 30 && fd < 30 && h.sta > 40) { inp.mx = -Math.cos(a); inp.my = -Math.sin(a); inp.dodge = true; }
      // steer with the brain's pathing when blocked
      const m = brain.mem.get('host') ?? { path: null, goal: null, repath: 0, stuck: 0, lx: h.x, ly: h.y };
      brain.mem.set('host', m); m.repath -= 1;
      if (fd > 16 && !brain._clear(h.x, h.y, foe.x, foe.y)) { const tmp = emptyInput(); brain._steer(h, m, foe.x, foe.y, tmp); inp.mx = tmp.mx; inp.my = tmp.my; }
    }
    const inputs = new Map([['host', inp]]);
    for (const [id, i] of brain.inputs()) inputs.set(id, i);
    sim.step(1 / 60, inputs);
    for (const e of sim.events) { if (e.t === 'down') downs++; if (e.t === 'hurt') dmg += e.dmg; }
    if (sim.wiped) { wipes++; for (const p of sim.players.values()) { p.downed = false; p.hp = 60; } }
  }
  return { mapId, solo, gear, secs: Math.round(t / 60), killed: start - sim.enemies.size, of: start, downs, wipes, dmg };
}
for (const mapId of ['tunnel_1', 'lake']) for (const solo of [false, true]) for (const gear of [false, true]) {
  const rs = [1, 2, 3].map((k) => run(mapId, solo, gear, 'bal' + k));
  const avg = (f) => Math.round(rs.reduce((a, r) => a + r[f], 0) / rs.length);
  console.log(`${mapId.padEnd(9)} ${solo ? 'solo ' : 'party'} ${gear ? 'gear ' : 'bare '} time ${avg('secs')}s  killed ${avg('killed')}/${rs[0].of}  downs ${avg('downs')}  wipes ${avg('wipes')}  dmg taken ${avg('dmg')}`);
}
