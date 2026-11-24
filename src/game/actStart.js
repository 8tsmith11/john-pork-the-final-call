// Test starts (?start=act2): a new game as if Act 1 had just ended, for playtesting later acts without replaying
// Act 1. It runs only for a brand-new save in its own slot (src/engine/save/storage.js keys it 'autosave:act2'),
// never over a real game. The Act 1 flags below are the ones later content reads; the ending itself isn't replayed.
import { addXp, xpToNext } from '../content/progression.js';

const ACT_ONE_DONE = {
  'act1.coldopen.done': true, 'act1.balloon.noticedGone': true, 'act1.clue.lockForced': true, 'act1.beat.asterEnter': true, 'act1.balloon.lobbyClue': true, 'q.armed': true,
  'act1.halvard.sellerClue': true, 'act1.leadA.done': true, 'act1.leadC.done': true,
  'act1.cordon.passed': true, 'act1.call.attempt': 1, 'act1.beat.call': true, 'act1.call.answered': true,
  'act1.fuses.seen': true, 'act1.fuses.in': true, 'act1.tunnel.gate': true,
  'act1.boss.kind': 'warden', 'act1.boss.defeated': true, 'act1.outbreak.contained': true, 'act1.boss.sahur': false,
  'act1.ending.warm': true, 'act1.ending.balloonReleased': true, 'act1.complete': true,
};

export const ACT_STARTS = {
  act2: { area: 'route1_north', level: 6, money: 150,
    kit: { hotbar: ['item.rebar', 'item.fab_launcher'], equipped: { chestplate: 'item.mesh_vest' } } },
};

/** Turn a brand-new save into the start of an act. Returns the save, or null for an unknown start. */
export function applyActStart(save, start) {
  const s = ACT_STARTS[start]; if (!s) return null;
  Object.assign(save.flags, ACT_ONE_DONE);
  save.world.act = 2; save.world.area = s.area;
  save.meta.slotName = `Test start: ${start}`;
  for (const c of Object.values(save.party)) {
    let need = 0; for (let l = c.level ?? 1; l < s.level; l++) need += xpToNext(l);
    addXp(c, need);   // real level-ups, so skill and ability points come with them
    c.money = s.money;
    s.kit.hotbar.forEach((id, i) => { c.inventory[i] = { id, qty: 1 }; });
    c.hotSel = 0;
    Object.assign(c.equipped, s.kit.equipped);
  }
  return save;
}
