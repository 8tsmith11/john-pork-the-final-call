// Keep exact completion and wipe counts: rounding a three-run mean can conceal a failed seed.
export function formatBalanceGroup(runs) {
  const first = runs[0];
  const sum = (field) => runs.reduce((total, run) => total + run[field], 0);
  const avg = (field) => Math.round(sum(field) / runs.length);
  const cleared = runs.filter((run) => run.killed === run.of).length;
  const lines = [
    `${first.mapId.padEnd(9)} ${first.solo ? 'solo ' : 'party'} ${first.gear ? 'gear ' : 'bare '} time avg ${avg('secs')}s max ${Math.max(...runs.map((run) => run.secs))}s  cleared ${cleared}/${runs.length} runs  downs total ${sum('downs')}  wipes total ${sum('wipes')}  dmg avg ${avg('dmg')}`,
  ];
  for (const run of runs) if (run.killed !== run.of || run.wipes > 0) {
    lines.push(`  ${run.seed}: ${run.killed === run.of ? 'cleared' : 'INCOMPLETE'}, ${run.of - run.killed} remaining, ${run.secs}s, downs ${run.downs}, wipes ${run.wipes}`);
  }
  return lines;
}
