/** Persistencia real mediante PHP/PDO. No hay guardado alternativo en localStorage. */
const endpoint = new URL('../../api/index.php', import.meta.url);
let csrf = '';
async function request(action, data) {
  if (data !== undefined && !csrf) await api.session();
  const url = new URL(endpoint);
  url.searchParams.set('action', action);
  let response;
  try {
    response = await fetch(url, {
      method: data === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: data === undefined ? {} : {'Content-Type':'application/json','X-CSRF-Token':csrf},
      ...(data === undefined ? {} : {body:JSON.stringify(data)})
    });
  } catch {
    throw new Error('No se pudo conectar. Abre el proyecto desde el servidor PHP (localhost).');
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('El servidor no respondió con JSON. Ejecuta la aplicación con PHP/Apache, no con Live Server.'); }
  if (!response.ok || result?.error) {
    if (response.status === 403) csrf = '';
    throw new Error(result?.error || 'No se pudo guardar la información.');
  }
  return result;
}
export const api = {
  async session() { const result = await request('session'); csrf = result.csrf; return result.user; },
  register: data => request('register',data),
  login: data => request('login',data),
  async logout() { await request('logout',{}); csrf = ''; },
  getCompany: () => request('company'),
  saveCompany: data => request('saveCompany',data),
  posts: () => request('posts'),
  savePost: data => request('savePost',data),
  deletePost: id => request('deletePost',{id}),
  saveAvatar: value => request('saveAvatar',{value}),
  async exportDemo() { return JSON.stringify(await request('export'),null,2); }
};
