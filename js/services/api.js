import { safeImage } from '../ui/media.js';
/** Contrato de datos. Implementación 100% local: sin fetch, sin PHP, sin IA remota. */
import { repository } from './repository.js';
import { uid } from '../core/utils.js';

export class DemoError extends Error {
  constructor(message) { super(message); this.name = 'DemoError'; }
}
const requireUser = () => {
  const user = repository.read().users.find(x => x.id === repository.getSession());
  if (!user) throw new DemoError('Inicia sesión para continuar.');
  return user;
};
const companyFor = userId => repository.read().companies.find(x => x.userId === userId) || null;
const validateEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
const clean = (v, max = 1000) => String(v || '').trim().slice(0, max);

export const api = {
  async session() {
    const id = repository.getSession();
    return repository.read().users.find(user => user.id === id) || null;
  },
  async login({ email, password }) {
    if (!validateEmail(email) || !String(password || '').trim()) throw new DemoError('Introduce correo y contraseña.');
    const user = repository.read().users.find(x => x.email === email.trim().toLowerCase());
    if (!user) throw new DemoError('Ese correo no está registrado en esta demostración.');
    // No guardamos ni validamos contraseñas. No es autenticación real.
    repository.setSession(user.id);
    return user;
  },
  async register({ name, email, password }) {
    if (clean(name, 100).length < 2 || !validateEmail(email) || String(password).length < 6) {
      throw new DemoError('Escribe tu nombre, un correo válido y una contraseña demo de al menos 6 caracteres.');
    }
    const normalized = email.trim().toLowerCase();
    if (repository.read().users.some(user => user.email === normalized)) {
      throw new DemoError('Ya existe una cuenta demo con ese correo. Inicia sesión.');
    }
    const user = repository.update(db => {
      const record = { id: uid('user'), name: clean(name, 100), email: normalized, createdAt: new Date().toISOString() };
      db.users.push(record);
      return record;
    });
    repository.setSession(user.id);
    return user;
  },
  async saveAvatar(value) {
    const user=requireUser();
    if(value && (!safeImage(value) || value.length>1500000)) throw new DemoError('La foto no es válida o es demasiado grande.');
    return repository.update(db=>{const record=db.users.find(u=>u.id===user.id);record.avatar=safeImage(value);return record;});
  },
  async logout() { repository.setSession(null); },
  async getCompany() {
    const user = requireUser();
    return companyFor(user.id);
  },
  async saveCompany(payload) {
    const user = requireUser();
    for (const field of ['name', 'sector', 'offer', 'audience', 'tone']) {
      if (!clean(payload[field])) throw new DemoError(`Completa el campo: ${field}.`);
    }
    if (!Array.isArray(payload.channels) || !payload.channels.length) throw new DemoError('Selecciona al menos un canal.');
    return repository.update(db => {
      const found = db.companies.find(x => x.userId === user.id);
      const sanitized = {
        name: clean(payload.name, 120), sector: clean(payload.sector, 100), city: clean(payload.city, 140),
        offer: clean(payload.offer, 1500), audience: clean(payload.audience, 1200),
        differentiator: clean(payload.differentiator, 1200), tone: clean(payload.tone, 100),
        goal: clean(payload.goal, 140), channels: [...new Set(payload.channels.map(x => clean(x, 40)))]
      };
      if (found) { Object.assign(found, sanitized); return found; }
      const company = { id: uid('company'), userId: user.id, ...sanitized, createdAt: new Date().toISOString() };
      db.companies.push(company);
      return company;
    });
  },
  async posts() {
    const user = requireUser();
    const company = companyFor(user.id);
    return company ? repository.read().posts.filter(x => x.companyId === company.id).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)) : [];
  },
  async savePost(payload) {
    const user = requireUser();
    const company = companyFor(user.id);
    if (!company) throw new DemoError('Completa el perfil de la empresa primero.');
    if (!clean(payload.text)) throw new DemoError('No se puede guardar una publicación vacía.');
    return repository.update(db => {
      const now = new Date().toISOString();
      const found = payload.id && db.posts.find(x => x.id === payload.id && x.companyId === company.id);
      const content = {
        channel: clean(payload.channel, 40), objective: clean(payload.objective, 160),
        topic: clean(payload.topic, 600), text: clean(payload.text, 20000),
        ...(Object.hasOwn(payload, 'image') ? {image:safeImage(payload.image)} : {}),
        status: payload.status === 'approved' ? 'approved' : 'draft', updatedAt: now
      };
      if (found) { Object.assign(found, content); return found; }
      const post = { id: uid('post'), companyId: company.id, ...content, createdAt: now };
      db.posts.push(post);
      return post;
    });
  },
  async deletePost(id) {
    const user = requireUser();
    const company = companyFor(user.id);
    return repository.update(db => {
      const index = db.posts.findIndex(x => x.id === id && x.companyId === company?.id);
      if (index < 0) throw new DemoError('No se encontró la publicación.');
      db.posts.splice(index, 1);
      return true;
    });
  },
  async exportDemo() { requireUser(); return repository.exportData(); },
  async resetDemo() { repository.reset(); }
};
