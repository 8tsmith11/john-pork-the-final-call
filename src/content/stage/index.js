// Cutscene triggers (docs/design/cutscenes.md). Each entry plays its script, src/content/stage/<id>.js,
// once per world: on the host, as soon as its flag is set, while the party is on its map (if one is
// given), with no dialogue open. Dialogue scripts set flags with an italic "Sets ..." line, so a scene
// can hand straight off to a cutscene with no code. Keep ids and flags generic: no spoilers here.
export const STAGE_TRIGGERS = [
  // { id: 'some_cutscene', flag: 'act1.some.flag', map: 'room631' },
];
