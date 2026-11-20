// Browser smoke test for the Act 1 systems. Open the game, paste this into the dev console on the title
// screen (or load it with a harness), and read the results in the box: each line is OK or XX.
window.__errs = [];
window.addEventListener('error', (e) => window.__errs.push(String(e.message).slice(0, 60)));
game.scene.getScene('Title').scene.start('World', { character: 'trevor', mode: 'solo' });
setTimeout(async () => {
  const w = game.scene.getScene('World'), out = [];
  const ok = (name, cond) => out.push(`${cond ? 'OK ' : 'XX '} ${name}`);
  try {
    w.dlg = null; w._drawDialogue();
    const I = await import('/src/engine/inventory.js');
    const { MAPS } = await import('/src/content/maps/index.js');
    const c = w.save.party.trevor;
    ok('3 players (2 AI)', w.sim.players.size === 3);
    w.save.party.trevor.money = 200;   // wallets are per roommate (schema 7)
    const scooterPrice = w.priceFor('trevor', 90);   // CHA and haggle discounts apply (D-017)
    w._buy('trevor', 'scooters', 0); ok('buy scooter', I.has(c, 'item.scooter') && w.save.party.trevor.money === 200 - scooterPrice);
    w._buy('trevor', 'pawn', 0); ok('buy wrench', I.has(c, 'item.pipe_wrench'));
    w._buy('trevor', 'corner', 0); ok('buy food', I.has(c, 'item.energy_bar'));
    I.add(c, 'item.mat_scrap', 10);
    const ri = (await import('/src/content/items.js')).RECIPES.findIndex((r) => r.item === 'item.rebar');
    w._craft('trevor', ri); ok('fab prints rebar from scrap', I.has(c, 'item.rebar') && I.count(c, 'item.mat_scrap') === 6);
    w.menuMove(c.inventory.findIndex((s) => s?.id === 'item.pipe_wrench'), 0, false); w.selectHot(0);
    ok('hold wrench from hotbar', c.inventory[c.hotSel]?.id === 'item.pipe_wrench' && w.sim.players.get('host').mods?.swing?.damage === 30);
    const before = w.sim.players.get('host').hp; w.sim.players.get('host').hp = 50;
    const slot = c.inventory.findIndex((s) => s?.id === 'item.energy_bar'); w.menuUseSlot(slot); ok('hotbar eats food', w.sim.players.get('host').hp > 50 && !I.has(c, 'item.energy_bar'));
    c.skillPoints = 2; w._learn('trevor', 'tr.amp'); w._learn('trevor', 'tr.dropd'); ok('skill tree prereqs', c.skills['tr.amp'] === 1 && !c.skills['tr.dropd']);
    w.gameMenu.show('phone'); w.gameMenu.show('skills'); w.gameMenu.show('inventory'); w.gameMenu.show('quests'); w.gameMenu.show('shop:pawn'); w.gameMenu.show('fab'); w._closeMenu(); ok('every menu tab draws', true);
    // soup quest: ask then hand over a thermos
    w.sim.setMap(MAPS.aster_hall, 'room631'); await new Promise((r) => setTimeout(r, 400)); w.dlg = null; w._drawDialogue();
    const n409 = w.map.objects.find((o) => o.id === 'npc.409');
    w._questInteract(n409); w.dlg = null; w._drawDialogue(); I.add(c, 'item.mate_flask');
    const player = w.sim.players.get(w.localId); player.x = n409.x * 16 + 8; player.y = n409.y * 16 + 8;
    w._giveQuestItem(n409, 'side.soup');
    ok('soup quest completes', w.save.world.quests['side.soup']?.done);
    w.dlg = null; w._drawDialogue();
    // plaza: zipline, cordon gate
    w.sim.setMap(MAPS.metro_plaza, 'aster_lobby'); await new Promise((r) => setTimeout(r, 400)); w.dlg = null; w._drawDialogue();
    const h = w.sim.players.get('host'); h.x = 16 * 16 + 8; h.y = 15 * 16 + 8;
    w._zip(w.map.objects.find((o) => o.id === 'obj.zip_aster')); await new Promise((r) => setTimeout(r, 1700));
    ok('zipline lands at trailhead', Math.abs(h.x - 78 * 16) < 30);
    const grate = w.map.objects.find((o) => o.id === 'obj.grate'); ok('grate locked before cordon', !!grate.requiresFlag && !w.save.flags['act1.cordon.passed']);
    ok('scooter toggles outdoors', (w._scooter('host'), h.riding === true));
  } catch (e) { out.push('THREW ' + e.message); }
  out.push(`errors: ${window.__errs.length ? window.__errs.join(' | ') : 'none'}`);
  w.dlg = null; w._say(out.join('\n'));
}, 1300);
