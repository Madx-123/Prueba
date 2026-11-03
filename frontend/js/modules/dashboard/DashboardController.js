import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';
import { escapeHtml as h } from '../../core/utils.js';

export default class DashboardController {
  constructor(container) {
    this.container = container;
    this.init();
    this.bindEvents();
  }

  // Se ejecuta automáticamente al cargar la vista
  async init() {
    try {
      // 1. Obtener la sesión actual desde el backend
      const session = await ApiClient.request('/session', 'GET');
      if (!session.user) {
        appRouter.navigate('/login');
        return;
      }

      // 2. Pintar el nombre del usuario
      const firstName = session.user.name.split(' ')[0];
      this.container.querySelector('#user-name').textContent = firstName;

      // 3. Cargar las métricas de publicaciones
      this.loadMetrics();
      
    } catch (error) {
      console.error("Error cargando el dashboard:", error);
      appRouter.navigate('/login');
    }
  }

  async loadMetrics() {
    try {
      const response = await ApiClient.request('/posts', 'GET');
      const posts = response.posts || []; // Evita error si posts no es array
      
      const totalPosts = posts.length;
      const approvedPosts = posts.filter(p => p.status === 'approved').length;
      const draftPosts = totalPosts - approvedPosts;

      this.container.querySelector('#metric-posts').textContent = totalPosts;
      this.container.querySelector('#metric-approved').textContent = approvedPosts;
      this.container.querySelector('#metric-drafts').textContent = draftPosts;

      this.renderRecentPosts(posts);
    } catch (error) {
      this.container.querySelector('#recent-posts-container').innerHTML = 
        `<p style="padding: 20px; text-align: center; color: red;">No se pudieron cargar las publicaciones.</p>`;
    }
  }

  renderRecentPosts(posts) {
    const container = this.container.querySelector('#recent-posts-container');
    
    if (posts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Tu primera idea empieza aquí</h3>
          <p>Crea y guarda una propuesta para verla en tu biblioteca.</p>
        </div>`;
      return;
    }

    // Dibujamos solo los 4 más recientes
    const html = posts.slice(0, 4).map(post => `
      <button class="recent-row" data-id="${post.id}">
        <span class="recent-title">
          <strong>${h(post.topic || 'Sin título')}</strong>
          <small>${h(post.channel)}</small>
        </span>
        <span class="tag tag--${post.status === 'approved' ? 'approved' : 'draft'}">
          ${post.status === 'approved' ? 'Aprobado' : 'Borrador'}
        </span>
      </button>
    `).join('');

    container.innerHTML = html;
  }

  bindEvents() {
    const btnNewPost = this.container.querySelector('#btn-new-post');
    const btnGoLibrary = this.container.querySelector('#btn-go-library');

    if (btnNewPost) {
      btnNewPost.addEventListener('click', () => appRouter.navigate('/crear'));
    }

    if (btnGoLibrary) {
      btnGoLibrary.addEventListener('click', () => appRouter.navigate('/biblioteca'));
    }
  }
}