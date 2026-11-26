// Assembly parts for the bench (docs/design/12-engineering-balance.md, section 4-5). A build is one frame, one power
// part, one payload and one control board; everything the player sees is derived from these numbers
// (src/engine/assembly.js). Starting values to tune in play. Which schematic teaches which part, and where, is
// story's and world's (`schematic` names the flag that unlocks it; null = known from the start).
export const FRAMES = {
  'part.bracket':  { name: 'Bracket', nameEs: 'Escuadra', capacity: 3, handling: 'quick', mounts: ['small'], weight: 0, cost: { 'item.mat_scrap': 2 }, schematic: null },
  'part.conduit':  { name: 'Conduit rig', nameEs: 'Armazón de conducto', capacity: 5, handling: 'normal', mounts: ['small', 'medium'], weight: 0, cost: { 'item.mat_scrap': 2, 'item.mat_wire': 1 }, schematic: 'schem.conduit' },
  'part.deck':     { name: 'Deck mount', nameEs: 'Montura de tabla', capacity: 8, handling: 'heavy', mounts: ['small', 'medium', 'large'], weight: 0, cost: { 'item.mat_scrap': 4 }, schematic: 'schem.deck' },
};
export const POWER = {
  'part.cell':     { name: 'Battery cell', nameEs: 'Celda de batería', capacity: 4, rate: 0.4, weight: 1, cost: { 'item.mat_cell': 1 }, schematic: null },
  'part.pack':     { name: 'Scooter pack', nameEs: 'Batería de scooter', capacity: 8, rate: 0.5, weight: 2, cost: { 'item.mat_cell': 2, 'item.mat_wire': 1 }, schematic: 'schem.pack' },
  'part.fusebank': { name: 'Fuse bank', nameEs: 'Banco de fusibles', capacity: 3, rate: 0.8, weight: 1, cost: { 'item.mat_wire': 2, 'item.mat_circuit': 1 }, schematic: 'schem.fusebank' },
  'part.dynamo':   { name: 'Hand-crank dynamo', nameEs: 'Dínamo de manivela', capacity: 2, rate: 0.25, weight: 1, cost: { 'item.mat_scrap': 2, 'item.mat_wire': 1 }, schematic: null, never: true },
};
export const PAYLOADS = {
  'part.arc':      { name: 'Arc coil', nameEs: 'Bobina de arco', kind: 'arc', mount: 'small', cost: 4, base: 18, weight: 1, parts: { 'item.mat_wire': 2 }, schematic: null },
  'part.burst':    { name: 'Helium burst', nameEs: 'Ráfaga de helio', kind: 'burst', mount: 'small', cost: 3, base: 120, weight: 1, parts: { 'item.mat_plastic': 1 }, schematic: 'schem.burst' },
  'part.gel':      { name: 'Coderot gel', nameEs: 'Gel de código podrido', kind: 'slow', mount: 'medium', cost: 5, base: 3, weight: 2, parts: { 'item.mat_gel': 2 }, schematic: 'schem.gel' },
  'part.lens':     { name: 'Lens array', nameEs: 'Matriz de lentes', kind: 'scan', mount: 'small', cost: 2, base: 1, weight: 1, parts: { 'item.mat_glass': 2 }, schematic: null },
};
// Control: an auto-written board is quick to get and rots with use; a hand-checked one never does (gonman, general #228).
export const CONTROLS = {
  'part.autoboard':  { name: 'Auto-written controller', nameEs: 'Controlador autoescrito', glitch: 0.03, wear: 0.004, maxGlitch: 0.2, precision: 0, cost: { 'item.mat_circuit': 1 }, schematic: null },
  'part.handboard':  { name: 'Hand-checked board', nameEs: 'Placa verificada a mano', glitch: 0, wear: 0, maxGlitch: 0, precision: 0.1, cost: { 'item.mat_circuit': 2 }, schematic: 'schem.handboard' },
};
export const HANDLING = { quick: { aim: 0.1, slow: 0 }, normal: { aim: 0.2, slow: 0.1 }, heavy: { aim: 0.35, slow: 0.3 } };
export const ALL_PARTS = { ...FRAMES, ...POWER, ...PAYLOADS, ...CONTROLS };
export const componentItemId = (part) => `item.component_${part.slice('part.'.length)}`;
