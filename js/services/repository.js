/** Base de datos SIMULADA en localStorage. El servidor futuro sustituirá esta capa. */
import { createSeed } from '../data/seed.js';
import { clone } from '../core/utils.js';

const DB_KEY = 'contentai.v3.demo.database';
const SESSION_KEY = 'contentai.v3.demo.session';

function validDb(db) {
  return db?.schemaVersion === 1 && Array.isArray(db.users) && Array.isArray(db.companies) && Array.isArray(db.posts);
}
function readDb() {
  try {
    const stored = JSON.parse(localStorage.getItem(DB_KEY));
    if (validDb(stored)) return stored;
  } catch { /* malformed data: start from seed */ }
  const seed = createSeed();
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}
export const repository = {
  read: () => clone(readDb()),
  update(mutator) {
    const db = readDb();
    const result = mutator(db);
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { throw new Error('No hay espacio disponible en este navegador. Exporta tus datos y elimina imágenes que ya no necesites.'); }
    return clone(result);
  },
  getSession() { return sessionStorage.getItem(SESSION_KEY); },
  setSession(id) { id ? sessionStorage.setItem(SESSION_KEY, id) : sessionStorage.removeItem(SESSION_KEY); },
  exportData() { return JSON.stringify(readDb(), null, 2); },
  reset() { localStorage.removeItem(DB_KEY); sessionStorage.removeItem(SESSION_KEY); readDb(); }
};
