// La API pertenece al mismo proyecto, independientemente del nombre de la carpeta en htdocs.
// No abrir con Live Server: PHP necesita Apache o un servidor que ejecute PHP.
const API_URL = new URL('../../../backend/index.php', import.meta.url).href;

export const ApiClient = {
  async request(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    };
    if (data !== null) {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) formData.append(key, value);
      }
      options.body = formData;
    }

    let response;
    try {
      response = await fetch(`${API_URL}?route=${encodeURIComponent(endpoint)}`, options);
    } catch (error) {
      throw new Error('No se pudo conectar con PHP. Abre el proyecto desde Apache/XAMPP, no desde Live Server.');
    }

    const raw = await response.text();
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      throw new Error('La API no devolvió JSON. Revisa la URL, Apache y los errores de PHP.');
    }
    if (!response.ok || result.status === 'error') {
      throw new Error(result.message || `Error HTTP ${response.status}`);
    }
    return result;
  },
  login(correo, password) { return this.request('/login', 'POST', { correo, password }); },
  register(nombre, correo, password) { return this.request('/registro', 'POST', { nombre, correo, password }); },
  getCompany() { return this.request('/empresa', 'GET'); }
};
