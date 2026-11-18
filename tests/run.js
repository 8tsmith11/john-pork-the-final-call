// Node test runner (no dependencies): `node tests/run.js`. Must pass before pushing.
import assert from 'node:assert/strict';
import { makeStreams, Rng } from '../src/engine/rng.js';
import { rollWorld } from '../src/engine/worldRolls.js';
import { newSave, migrate, CURRENT_SCHEMA } from '../src/engine/save/schema.js';

let failed = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n     ${e.message}`); } };

test('rng streams are deterministic and independent', () => {
  const a = makeStreams('seed-1'), b = makeStreams('seed-1');
  const xs = [1, 2, 3].map(() => a('loot').next());
  assert.deepEqual(xs, [1, 2, 3].map(() => b('loot').next()));
  b('fish').next(); b('fish').next();                       // drawing from another stream...
  assert.equal(a('loot').next(), b('loot').next());          // ...doesn't shift this one
  assert.notEqual(new Rng('x').next(), new Rng('y').next());
});

test('world rolls are stable for a seed', () => {
  assert.deepEqual(rollWorld('aster-pros-631'), rollWorld('aster-pros-631'));
  const seen = new Set(Array.from({ length: 40 }, (_, i) => rollWorld(`s${i}`).twistVariant));
  assert.deepEqual([...seen].sort(), ['A', 'B']);
});

test('save round-trips through JSON + migrate, keeping unknown keys', () => {
  const s = newSave({ seed: 'abc', rolls: rollWorld('abc'), gameVersion: '0.1.0' });
  s.futureField = { keep: true };
  const back = migrate(JSON.parse(JSON.stringify(s)));
  assert.equal(back.schemaVersion, CURRENT_SCHEMA);
  assert.deepEqual(back.futureField, { keep: true });
  assert.equal(back.party.manuel.id, 'manuel');
});

test('migrate fills fields missing from older/partial saves', () => {
  const partial = { format: 'jpfc-save', schemaVersion: 1, world: { seed: 'z', rolls: {} } };
  const s = migrate(partial);
  assert.ok(s.party.trevor && s.standing && s.flags);
});

test('migrate rejects foreign and future saves', () => {
  assert.throws(() => migrate({ hello: 1 }));
  assert.throws(() => migrate({ format: 'jpfc-save', schemaVersion: CURRENT_SCHEMA + 1 }));
});

if (failed) { console.log(`\n${failed} test(s) failed`); process.exit(1); }
console.log('\nall tests passed');
