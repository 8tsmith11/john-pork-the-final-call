// Browser map sweep: loads every map, walks the spawn area, opens the world map, and reports any
// JS errors per map in the say box. Paste into the dev console on the title screen.
window.__errs = [];
window.addEventListener('error', (e) => window.__errs.push(String(e.message).slice(0, 70)));
window.addEventListener('unhandledrejection', (e) => window.__errs.push('rej ' + String(e.reason).slice(0, 60)));
game.scene.getScene('Title').scene.start('World', { character: 'trevor', mode: 'solo' });
setTimeout(async () => {
  const w = game.scene.getScene('World'), out = [];
  const { MAPS } = await import('/src/content/maps/index.js');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const id of Object.keys(MAPS)) {
    const before = window.__errs.length;
    try {
      w.dlg = null; w._drawDialogue?.();
      w.sim.setMap(MAPS[id], 'room631');
      await wait(900);
      w.dlg = null; w._drawDialogue?.();
      // walk the player around a bit so glimpses/scans/neon/ambient code all run
      const h = w.sim.players.get('host');
      for (let i = 0; i < 5; i++) { const s = MAPS[id].spawns[0]; h.x = s.x + i * 20; h.y = s.y; await wait(150); }
      w.gameMenu.show('map'); await wait(100); w._closeMenu();
    } catch (e) { window.__errs.push(`${id}: ${e.message}`); }
    out.push(`${id.padEnd(12)} ${window.__errs.length > before ? 'XX ' + window.__errs.slice(before).join(' | ') : 'OK'} (${MAPS[id].objects.length} objects, ${w.sim.enemies.size} enemies)`);
  }
  w.dlg = null; w._say(out.join('\n') + `\nerrors total: ${window.__errs.length}`);
}, 1300);
