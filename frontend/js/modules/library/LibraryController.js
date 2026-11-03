import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';

export default class LibraryController {
  constructor(container) {
    this.container = container;
    this.posts = [];       // Guardará todos los posts traídos de MySQL
    this.currentFilter = 'all'; 
    
    this.init();
    this.bindEvents();
  }

  async init() {
    try {
      // Solicita los posts al backend
      const response = await ApiClient.request('/posts', 'GET');
      this.posts = response.posts || [];
      this.renderPosts();
    } catch (error) {
      this.container.querySelector('#library-results').innerHTML = `<p style="color:red; text-align:center;">Error al cargar la biblioteca.</p>`;
    }
  }

  bindEvents() {
    // Botón "Nueva publicación"
    this.container.querySelector('#btn-new-post').addEventListener('click', () => {
      appRouter.navigate('/crear');
    });

    // Pestañas de filtrado (Todas, Borradores, Aprobadas)
    const filterButtons = this.container.querySelectorAll('#library-filters button');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        this.currentFilter = e.currentTarget.dataset.filter;
        this.renderPosts();
      });
    });

    // Buscador en tiempo real
    const searchInput = this.container.querySelector('#library-search');
    searchInput.addEventListener('input', () => {
      this.renderPosts(searchInput.value);
    });
  }

  renderPosts(searchQuery = '') {
    const container = this.container.querySelector('#library-results');
    
    // Filtrar localmente por pestaña y por texto de búsqueda
    const query = searchQuery.toLowerCase().trim();
    const filteredPosts = this.posts.filter(p => {
      const matchFilter = (this.currentFilter === 'all') || (p.status === this.currentFilter);
      const matchSearch = p.topic.toLowerCase().includes(query) || p.text.toLowerCase().includes(query);
      return matchFilter && matchSearch;
    });

    if (filteredPosts.length === 0) {
      container.innerHTML = `
        <div class="empty-state library-empty">
          <h3>No encontramos publicaciones</h3>
          <p>Prueba otro filtro o crea tu primera publicación.</p>
        </div>`;
      return;
    }

    // Dibujar las tarjetas (HTML)
    container.innerHTML = filteredPosts.map(p => `
      <article class="post-card">
        <div class="post-card-top">
          <span class="channel-badge">${p.channel}</span>
          <span class="tag tag--${p.status}">${p.status === 'approved' ? '✅ Aprobado' : '✍️ Borrador'}</span>
        </div>
        <h3>${p.topic || 'Publicación sin título'}</h3>
        <p>${p.text.substring(0, 110)}${p.text.length > 110 ? '...' : ''}</p>
        <div class="post-card-foot">
          <span>📅 ${new Date(p.updatedAt).toLocaleDateString()}</span>
        </div>
      </article>
    `).join('');
  }
}