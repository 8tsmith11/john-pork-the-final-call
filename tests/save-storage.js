import assert from 'node:assert/strict';
import { newSave } from '../src/engine/save/schema.js';
import { autosave, clearAutosave, loadAutosave } from '../src/engine/save/storage.js';

// IndexedDB exposes request success before reporting whether the transaction committed.
let primary, fallback, abortWrite = false, fallbackFull = false;
let writeRequestSucceeded = false;
const connection = {
  transaction(_store, mode) {
    const tx = {
      objectStore() {
        function request(result, commit) {
          const req = { result };
          setImmediate(() => {
            req.onsuccess?.();
            if (mode === 'readwrite') writeRequestSucceeded = true;
            setImmediate(() => {
              if (mode === 'readwrite' && abortWrite) return tx.onabort?.();
              commit?.();
              tx.oncomplete?.();
            });
          });
          return req;
        }
        return {
          get: () => request(primary),
          put: (text) => request(undefined, () => { primary = text; }),
          delete: () => request(undefined, () => { primary = undefined; }),
        };
      },
    };
    return tx;
  },
  close() {},
};

const savedGlobals = new Map(['indexedDB', 'localStorage'].map((key) => [
  key, Object.getOwnPropertyDescriptor(globalThis, key),
]));
try {
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: {
      open() {
        const req = { result: connection };
        setImmediate(() => req.onsuccess());
        return req;
      },
    },
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => fallback ?? null,
      setItem: (_key, text) => {
        if (fallbackFull) throw new DOMException('Test quota reached', 'QuotaExceededError');
        fallback = text;
      },
      removeItem: () => { fallback = undefined; },
    },
  });

  const save = (seed) => newSave({ seed, rolls: {}, gameVersion: 'test' });
  await autosave(save('original'));
  assert.equal(JSON.parse(primary).world.seed, 'original');

  abortWrite = true;
  writeRequestSucceeded = false;
  const fallbackSave = save('fallback');
  const character = fallbackSave.party.trevor;
  character.inventory[0] = { id: 'item.rebar', qty: 1, roll: { tier: 2 }, socketed: ['mod.test'] };
  character.rolled = { helmet: { tier: 1 } };
  character.socketed = { helmet: ['mod.test'] };
  await autosave(fallbackSave);
  assert.equal(writeRequestSucceeded, true);
  assert.equal(JSON.parse(primary).world.seed, 'original');
  assert.equal(JSON.parse(fallback).world.seed, 'fallback');
  const recovered = await loadAutosave();
  assert.equal(recovered.world.seed, 'fallback');
  assert.deepEqual(recovered.party.trevor, character);

  fallbackFull = true;
  const unsaved = save('unsaved');
  const priorTimestamp = unsaved.savedAt;
  await assert.rejects(autosave(unsaved), /Browser storage is unavailable/);
  assert.equal(unsaved.savedAt, priorTimestamp);
  assert.equal((await loadAutosave()).world.seed, 'fallback');

  abortWrite = false;
  fallbackFull = false;
  await autosave(save('committed'));
  assert.equal((await loadAutosave()).world.seed, 'committed');
  fallback = '{corrupt';
  assert.equal((await loadAutosave()).world.seed, 'committed');

  await Promise.all([autosave(save('before clear')), clearAutosave()]);
  assert.equal(await loadAutosave(), null);
  console.log('ok   autosave recovers the newest readable copy after a transaction abort');
} finally {
  for (const [key, descriptor] of savedGlobals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
}
