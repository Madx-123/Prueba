const API_URL = '/backend/index.php'; 

export const ApiClient = {
  async request(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    };

    if (data) {
      const formData = new FormData();
      for (const key in data) formData.append(key, data[key]);
      options.body = formData;
    }

    try {
      const url = `${API_URL}?route=${endpoint}`;
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Error en el servidor');
      }

      return result;
    } catch (error) {
      console.error(`Error en API [${endpoint}]:`, error);
      throw error;
    }
  },

  async login(correo, password) {
    return this.request('/login', 'POST', { correo, password });
  },

  async register(nombre, correo, password) {
    return this.request('/registro', 'POST', { nombre, correo, password });
  },

  async getCompany() {
    return this.request('/empresa', 'GET');
  }
};