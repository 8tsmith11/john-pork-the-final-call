// The abatement bounty board (scope, docs/design/10-scope.md: systems carry the length). Pruitt's crew
// pins up small paid jobs; three are open at a time, and a finished one is replaced by a new one. Jobs are
// seeded by the world seed and a running count, so a world's board is reproducible and co-op screens agree.
// Procedural and never story-critical (08-procgen.md): curated templates only, nothing touches canon.
import { makeStreams } from '../engine/rng.js';

export const OPEN_JOBS = 3;

// A nest job spawns its own targets on a map (killed keys `<map>#job.<n>.<i>`), so it can always be done.
// The spots are open tiles away from NPCs; story owners can add more.
const NESTS = [
  { map: 'metro_plaza', at: [[34, 42], [38, 44], [36, 46]], where: 'the dead parking lot', es: 'el estacionamiento muerto' },
  { map: 'metro_plaza', at: [[70, 33], [72, 33], [71, 31]], where: 'the cross street by the shops', es: 'la calle transversal junto a las tiendas' },
  { map: 'metro_plaza', at: [[20, 33], [22, 32], [24, 33]], where: 'the old Purple Line tracks', es: 'las vías viejas de la Línea Púrpura' },
  { map: 'lake', at: [[20, 12], [22, 14], [19, 15]], where: 'the lake path', es: 'el camino del lago' },
];
const GATHER = [
  { item: 'item.mat_scrap', n: [6, 12], name: 'scrap metal', es: 'chatarra' },
  { item: 'item.mat_wire', n: [3, 6], name: 'copper wire', es: 'cable de cobre' },
  { item: 'item.mat_circuit', n: [2, 4], name: 'circuit boards', es: 'placas de circuito' },
];

/** The n-th job on this world's board: { n, type: 'nest'|'gather'|'fish', ...details, reward: { money, xp } }. */
export function makeJob(seed, n) {
  const r = makeStreams(`${seed}|job|${n}`)('jobs');
  const roll = r.next();
  if (roll < 0.45) {
    const nest = r.pick(NESTS), kinds = nest.map === 'lake' ? ['enemy.rotling'] : ['enemy.rotling', 'enemy.rotling', 'enemy.spitter'];
    const count = 2 + Math.floor(r.next() * 2);
    return { n, type: 'nest', map: nest.map, where: nest.where, whereEs: nest.es, spawns: nest.at.slice(0, count).map(([x, y]) => [r.pick(kinds), x, y]),
      reward: { money: 14 + count * 4, xp: 12 + count * 3 } };
  }
  if (roll < 0.8) {
    const g = r.pick(GATHER), qty = g.n[0] + Math.floor(r.next() * (g.n[1] - g.n[0] + 1));
    return { n, type: 'gather', item: g.item, qty, name: g.name, nameEs: g.es, reward: { money: 6 + qty * 2, xp: 8 + qty } };
  }
  const qty = 1 + Math.floor(r.next() * 2);
  return { n, type: 'fish', qty, reward: { money: 10 + qty * 6, xp: 10 + qty * 4 } };
}

/** One line for the board. */
export function jobLine(job, es) {
  if (job.type === 'nest') {
    const left = job.spawns.length - (job.killed ?? 0);
    return es ? `Nido de podredumbre en ${job.whereEs}: ${left} por limpiar  ($${job.reward.money})` : `Rot nest at ${job.where}: ${left} left to clear  ($${job.reward.money})`;
  }
  if (job.type === 'gather') return es ? `Traer ${job.qty} de ${job.nameEs}  ($${job.reward.money})` : `Bring ${job.qty} ${job.name}  ($${job.reward.money})`;
  const left = job.qty - (job.caught ?? 0);
  return es ? `Pescar ${left} pez${left === 1 ? '' : 'es'} para la olla del campamento  ($${job.reward.money})` : `Catch ${left} fish for the camp pot  ($${job.reward.money})`;
}
