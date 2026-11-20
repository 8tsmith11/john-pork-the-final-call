// Save storage: IndexedDB autosave (localStorage fallback) + export/import of a .jpfc.json file.
import { migrate } from './schema.js';

const DB = 'jpfc', STORE = 'saves', KEY = 'autosave';
const FALLBACK_KEY = `${DB}:${KEY}`;
let pendingWrite = Promise.resolve();
let lastTimestamp = 0;

function queueWrite(write) {
  const result = pendingWrite.then(write);
  pendingWrite = result.catch(() => {});
  return result;
}

function idb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbOp(mode, fn) {
  const db = await idb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      tx.onabort = () => reject(tx.error ?? new Error('Save transaction aborted.'));
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
    });
  } finally {
    db.close();
  }
}

export async function autosave(save) {
  // Snapshot at the call site, even when an earlier write is still in flight.
  lastTimestamp = Math.max(Date.now(), lastTimestamp + 1);
  const savedAt = new Date(lastTimestamp).toISOString();
  const text = JSON.stringify({ ...save, savedAt });
  return queueWrite(async () => {
    try {
      await idbOp('readwrite', (s) => s.put(text, KEY));
    } catch {
      try { localStorage.setItem(FALLBACK_KEY, text); }
      catch (cause) { throw new Error('Browser storage is unavailable.', { cause }); }
    }
    save.savedAt = savedAt;
  });
}

export async function loadAutosave() {
  await pendingWrite;
  let primary, fallback;
  try { primary = await idbOp('readonly', (s) => s.get(KEY)); } catch { /* fallback may still be readable */ }
  try { fallback = localStorage.getItem(FALLBACK_KEY); } catch { /* primary may still be readable */ }

  let newest = null, newestTime = -Infinity, error;
  for (const text of [primary, fallback]) {
    if (!text) continue;
    try {
      const save = JSON.parse(text);
      // A legacy save can lack a timestamp; migration would fill in the current time.
      const time = typeof save?.savedAt === 'string' ? Date.parse(save.savedAt) : NaN;
      const candidate = migrate(save);
      if (!newest || time > newestTime) {
        newest = candidate;
        newestTime = Number.isFinite(time) ? time : -Infinity;
      }
    } catch (cause) {
      error ??= cause;
    }
  }
  if (!newest && error) throw error;
  return newest;
}

export function exportFile(save) {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const name = (save.meta?.slotName || 'save').replace(/[^\w-]+/g, '_');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.jpfc.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function importFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
      try { resolve(migrate(JSON.parse(await input.files[0].text()))); }
      catch (e) { reject(e); }
    };
    input.click();
  });
}

export async function clearAutosave() {
  return queueWrite(async () => {
    try { await idbOp('readwrite', (s) => s.delete(KEY)); } catch { /* unavailable */ }
    try { localStorage.removeItem(FALLBACK_KEY); } catch { /* unavailable */ }
  });
}
