import { safeImage } from '../ui/media.js';
import { repository } from './repository.js';
import { uid } from '../core/utils.js';

// El registro, las sesiones y los datos de la empresa son reales (PHP/MySQL).
// Las publicaciones y las imágenes siguen siendo locales en este avance.
const API_DIR = new URL('../../api/', import.meta.url);
const DEMO_SESSION = 'contentai.v4.demo.active';
const STORAGE_PREFIX = 'contentai.v4.mysql.';

export class DemoError extends Error {
  constructor(message) { super(message); this.name = 'DemoError'; }
}

const clean = (value, max = 1000) => String(value ?? '').trim().slice(0, max);
const validateEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value));
const isDemo = () => sessionStorage.getItem(DEMO_SESSION) === '1';
const localKey = (type, userId) => `${STORAGE_PREFIX}${type}.${userId}`;
const clone = value => JSON.parse(JSON.stringify(value));

async function request(file, { method = 'GET', data } = {}) {
  const options = { method, credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } };
  if (data !== undefined) {
    const body = new FormData();
    for (const [key, value] of Object.entries(data)) {
      body.append(key, Array.isArray(value) ? value.join(',') : String(value ?? ''));
    }
    options.body = body;
  }
  let response;
  try {
    response = await fetch(new URL(file, API_DIR), options);
  } catch {
    throw new DemoError('No se pudo conectar con PHP. Abre el proyecto desde http://localhost/Prueba/ con Apache y MySQL encendidos.');
  }
  let result;
  try {
    result = await response.json();
  } catch {
    throw new DemoError('PHP no devolvió JSON. Revisa XAMPP, la URL del proyecto y los errores de PHP.');
  }
  if (!response.ok || result?.status === 'error') {
    throw new DemoError(result?.message || `Error de servidor (HTTP ${response.status}).`);
  }
  return result;
}

function demoUser() {
  const id = repository.getSession();
  const found = repository.read().users.find(user => user.id === id);
  return found ? { ...found, isDemo: true } : null;
}
function requireDemo() {
  const user = demoUser();
  if (!user) throw new DemoError('Inicia sesión para continuar.');
  return user;
}
function demoCompanyFor(userId) {
  return repository.read().companies.find(company => company.userId === userId) || null;
}
async function currentUser() {
  const user = await api.session();
  if (!user) throw new DemoError('Inicia sesión para continuar.');
  return user;
}
function avatarFor(user) {
  const avatar = localStorage.getItem(localKey('avatar', user.id));
  return { ...user, avatar: avatar ? safeImage(avatar) : '', isDemo: false };
}
function readPosts(userId) {
  try {
    const data = JSON.parse(localStorage.getItem(localKey('posts', userId)) || '[]');
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
function storePosts(userId, posts) {
  try {
    localStorage.setItem(localKey('posts', userId), JSON.stringify(posts));
  } catch {
    throw new DemoError('No queda espacio para guardar publicaciones en este navegador. Elimina imágenes grandes.');
  }
}

export const api = {
  async session() {
    // Solo entramos en la demo si fue seleccionada explícitamente y su cuenta existe.
    if (isDemo()) {
      const user = demoUser();
      if (user) return user;
      sessionStorage.removeItem(DEMO_SESSION); // Marca demo obsoleta.
    }
    // El servidor decide si la sesión MySQL/PHP sigue activa tras un F5 o Ctrl+S.
    // Si PHP falla, no fingimos que el usuario cerró sesión.
    const result = await request('login.php');
    if (!result.user) return null;
    if (!result.user.id || !result.user.name) {
      throw new DemoError('La sesión PHP no devolvió los datos completos del usuario. Revisa api/login.php.');
    }
    return avatarFor(result.user);
  },

  async login({ email, password }) {
    if (!validateEmail(email) || !String(password || '').trim()) {
      throw new DemoError('Introduce un correo válido y tu contraseña.');
    }
    const result = await request('login.php', {
      method: 'POST', data: { correo: clean(email).toLowerCase(), password }
    });
    sessionStorage.removeItem(DEMO_SESSION);
    repository.setSession(null);
    return avatarFor(result.user);
  },

  async register({ name, email, password }) {
    if (clean(name, 100).length < 2 || !validateEmail(email) || String(password ?? '').length < 6) {
      throw new DemoError('Escribe tu nombre, un correo válido y una contraseña de al menos 6 caracteres.');
    }
    const result = await request('registro.php', {
      method: 'POST',
      data: { nombre: clean(name, 100), correo: clean(email).toLowerCase(), password }
    });
    sessionStorage.removeItem(DEMO_SESSION);
    repository.setSession(null);
    return avatarFor(result.user);
  },

  async demoLogin() {
    try { await request('login.php', { method: 'POST', data: { accion: 'logout' } }); } catch { /* demo funciona sin PHP */ }
    const user = repository.read().users.find(x => x.email === 'demo@contentai.pe');
    if (!user) throw new DemoError('No se encontró la cuenta de demostración.');
    repository.setSession(user.id);
    sessionStorage.setItem(DEMO_SESSION, '1');
    return { ...user, isDemo: true };
  },

  async logout() {
    if (isDemo()) {
      repository.setSession(null);
      sessionStorage.removeItem(DEMO_SESSION);
    } else {
      await request('login.php', { method: 'POST', data: { accion: 'logout' } });
    }
  },

  async getCompany() {
    const user = await currentUser();
    if (user.isDemo) return demoCompanyFor(user.id);
    const result = await request('guardar_empresa.php');
    return result.company || null;
  },

  async saveCompany(payload) {
    const user = await currentUser();
    for (const field of ['name', 'sector', 'offer', 'audience', 'tone']) {
      if (!clean(payload[field])) throw new DemoError(`Completa el campo: ${field}.`);
    }
    if (!Array.isArray(payload.channels) || payload.channels.length === 0) {
      throw new DemoError('Selecciona al menos un canal.');
    }
    const sanitized = {
      name: clean(payload.name, 120), sector: clean(payload.sector, 100), city: clean(payload.city, 140),
      offer: clean(payload.offer, 1500), audience: clean(payload.audience, 1200),
      differentiator: clean(payload.differentiator, 1200), tone: clean(payload.tone, 100),
      goal: clean(payload.goal, 140), channels: [...new Set(payload.channels.map(x => clean(x, 40)))]
    };
    if (user.isDemo) {
      return repository.update(db => {
        const found = db.companies.find(c => c.userId === user.id);
        if (found) { Object.assign(found, sanitized); return found; }
        const company = { id: uid('company'), userId: user.id, ...sanitized, createdAt: new Date().toISOString() };
        db.companies.push(company);
        return company;
      });
    }
    const result = await request('guardar_empresa.php', {
      method: 'POST',
      data: {
        nombre_comercial: sanitized.name, sector: sanitized.sector, ciudad: sanitized.city,
        productos: sanitized.offer, clientes: sanitized.audience, diferencia: sanitized.differentiator,
        tono: sanitized.tone, objetivo: sanitized.goal, canales: sanitized.channels
      }
    });
    return result.company;
  },

  async saveAvatar(value) {
    const user = await currentUser();
    if (value && (!safeImage(value) || value.length > 1500000)) {
      throw new DemoError('La foto no es válida o es demasiado grande.');
    }
    if (user.isDemo) {
      return repository.update(db => {
        const record = db.users.find(u => u.id === user.id);
        record.avatar = safeImage(value);
        return { ...record, isDemo: true };
      });
    }
    try {
      localStorage.setItem(localKey('avatar', user.id), safeImage(value));
    } catch { throw new DemoError('No hay espacio para guardar esta foto.'); }
    return { ...user, avatar: safeImage(value) };
  },

  async posts() {
    const user = await currentUser();
    if (user.isDemo) {
      const company = demoCompanyFor(user.id);
      return company ? repository.read().posts
        .filter(p => p.companyId === company.id)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) : [];
    }
    return readPosts(user.id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  async savePost(payload) {
    const user = await currentUser();
    const company = await api.getCompany();
    if (!company) throw new DemoError('Completa primero el perfil de tu empresa.');
    if (!clean(payload.text)) throw new DemoError('No se puede guardar una publicación vacía.');
    const now = new Date().toISOString();
    const content = {
      channel: clean(payload.channel, 40), objective: clean(payload.objective, 160),
      topic: clean(payload.topic, 600), text: clean(payload.text, 20000),
      ...(Object.hasOwn(payload, 'image') ? { image: safeImage(payload.image) } : {}),
      status: payload.status === 'approved' ? 'approved' : 'draft', updatedAt: now
    };
    if (user.isDemo) {
      return repository.update(db => {
        const found = payload.id && db.posts.find(p => p.id === payload.id && p.companyId === company.id);
        if (found) { Object.assign(found, content); return found; }
        const post = { id: uid('post'), companyId: company.id, ...content, createdAt: now };
        db.posts.push(post);
        return post;
      });
    }
    const posts = readPosts(user.id);
    const found = payload.id && posts.find(p => p.id === payload.id);
    if (found) { Object.assign(found, content); storePosts(user.id, posts); return clone(found); }
    const post = { id: uid('post'), companyId: company.id, ...content, createdAt: now };
    posts.push(post);
    storePosts(user.id, posts);
    return clone(post);
  },

  async deletePost(id) {
    const user = await currentUser();
    if (user.isDemo) {
      const company = demoCompanyFor(user.id);
      return repository.update(db => {
        const index = db.posts.findIndex(p => p.id === id && p.companyId === company?.id);
        if (index < 0) throw new DemoError('No se encontró la publicación.');
        db.posts.splice(index, 1);
        return true;
      });
    }
    const posts = readPosts(user.id);
    const index = posts.findIndex(p => p.id === id);
    if (index < 0) throw new DemoError('No se encontró la publicación.');
    posts.splice(index, 1);
    storePosts(user.id, posts);
    return true;
  },

  async exportDemo() {
    const user = await currentUser();
    if (user.isDemo) return repository.exportData();
    return JSON.stringify({
      aviso: 'Solo publicaciones y avatar locales; usuarios y empresas permanecen en MySQL.',
      userId: user.id, posts: readPosts(user.id), avatar: user.avatar || ''
    }, null, 2);
  },

  async resetDemo() {
    if (!isDemo()) throw new DemoError('Restablecer demo no elimina registros de MySQL. Esta opción solo funciona con la cuenta de demostración.');
    repository.reset();
    sessionStorage.removeItem(DEMO_SESSION);
  }
};
