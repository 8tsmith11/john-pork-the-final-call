// Story tables with something riding on them (what and where: docs/sealed/acts-2-3.md; keep this file to plumbing).
// A staked table checkpoints the moment the party sits down. A loss plays `lossStage` (an in-world cutscene,
// src/content/stage/, if one is written) and then reloads everyone to that checkpoint, seated again, as many
// times as it takes. A win only records the result (bastion.won.<id>), like any other match.
export const STAKES = {
  house_rules: { lossStage: 'house_rules_loss' },
};
