// Timed machine jobs for the engineering room (docs/design/09-engineering-room.md §3). Engine only; the
// machines, slots and menus land with gonman's layout once the lore gate places them.
// A machine runs one job at a time. Jobs keep running while you're away: time is measured in play time
// (save.world.playMs, advanced by the host each tick), so it doesn't race ahead while the game is closed,
// and nobody stands at a fab waiting. When you walk back into 631, finished jobs raise a "ready" toast.
// Host-authoritative like buying: clients ask, the host starts and collects.

/** Advance the world's play clock (host, every tick). */
export function tickPlay(save, dtMs) { save.world.playMs = (save.world.playMs ?? 0) + dtMs; }

const jobs = (save) => (save.world.machines ??= {});

/** Start a job if the machine is free. recipe: { id, time (s), out } Returns false if it's busy. */
export function startJob(save, machineId, recipe, who) {
  const j = jobs(save);
  if (j[machineId]) return false;
  j[machineId] = { recipe: recipe.id, out: recipe.out, by: who, at: save.world.playMs ?? 0, ms: Math.round((recipe.time ?? 0) * 1000), notified: false };
  return true;
}

export const jobLeftMs = (save, machineId) => {
  const job = jobs(save)[machineId];
  return job ? Math.max(0, job.at + job.ms - (save.world.playMs ?? 0)) : 0;
};
export const jobReady = (save, machineId) => !!jobs(save)[machineId] && jobLeftMs(save, machineId) === 0;

/** Take a finished job's output off the machine. Returns { out, by, recipe } or null if not ready. */
export function collect(save, machineId) {
  if (!jobReady(save, machineId)) return null;
  const job = jobs(save)[machineId];
  delete jobs(save)[machineId];
  return { out: job.out, by: job.by, recipe: job.recipe };
}

/** Finished jobs nobody has been told about yet (for the "ready" toast on entering 631); marks them told. */
export function newlyReady(save) {
  const out = [];
  for (const [id, job] of Object.entries(jobs(save))) if (!job.notified && jobReady(save, id)) { job.notified = true; out.push(id); }
  return out;
}
