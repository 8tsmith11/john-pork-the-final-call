// Save storage: IndexedDB autosave (localStorage fallback) + export/import of a .jpfc.json file.
import { migrate } from './schema.js';

const DB = 'jpfc', STORE = 'saves', KEY = 'autosave';

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
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function autosave(save) {
  save.savedAt = new Date().toISOString();
  const text = JSON.stringify(save);
  try { await idbOp('readwrite', (s) => s.put(text, KEY)); }
  catch { try { localStorage.setItem(`${DB}:${KEY}`, text); } catch { /* storage unavailable */ } }
}

export async function loadAutosave() {
  let text = null;
  try { text = await idbOp('readonly', (s) => s.get(KEY)); } catch { /* fall through */ }
  if (!text) { try { text = localStorage.getItem(`${DB}:${KEY}`); } catch { /* none */ } }
  return text ? migrate(JSON.parse(text)) : null;
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
