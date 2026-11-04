import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';
import { escapeHtml as h } from '../../core/utils.js';
import { safeImage } from '../../ui/media.js';
import { notify } from '../../ui/toast.js';
import { previewView } from '../creator/previews.js';

export default class LibraryController {
  constructor(container) {
    this.container = container;
    this.posts = [];
    this.companyData = { name: 'Mi Empresa', sector: 'PYMES' };
    this.currentFilter = 'all';
    this.currentChannel = 'all';
    this.viewMode = 'grid';
    this.activeModalPost = null;

    this.init();
    this.bindEvents();
  }

  async init() {
    try {
      const [postsRes, empRes] = await Promise.all([
        ApiClient.request('/posts', 'GET'),
        ApiClient.request('/empresa', 'GET').catch(() => ({ company: null }))
      ]);

      this.posts = postsRes.posts || [];
      if (empRes?.company) {
        this.companyData = empRes.company;
      }

      this.updateMetrics();
      this.renderPosts();
    } catch (error) {
      this.container.querySelector('#library-results').innerHTML = `
        <div class="empty-state">
          <h3>No se pudo cargar la biblioteca</h3>
          <p>${h(error.message)}</p>
        </div>`;
    }
  }

  updateMetrics() {
    const total = this.posts.length;
    const withImages = this.posts.filter(p => Boolean(safeImage(p.image))).length;
    const approved = this.posts.filter(p => p.status === 'approved').length;

    this.container.querySelector('#lib-count-total').textContent = total;
    this.container.querySelector('#lib-count-images').textContent = withImages;
    this.container.querySelector('#lib-count-approved').textContent = approved;
  }

  channelSvg(channel) {
    switch (channel) {
      case 'Instagram':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.25"/><circle cx="17.7" cy="6.5" r="1.25" fill="currentColor" stroke="none"/></svg>`;
      case 'TikTok':
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 2h-3.5v13.8a3.15 3.15 0 1 1-2.55-3.09V9.1a6.75 6.75 0 1 0 6.05 6.7V8.8c1.44 1.02 3.15 1.57 4.95 1.61V6.87C18.16 6.74 16.39 4.88 16 2Z"/></svg>`;
      case 'WhatsApp':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.2 11.85a8.15 8.15 0 0 1-11.98 7.2L3.2 20.5l1.46-4.88A8.15 8.15 0 1 1 20.2 11.85Z"/></svg>`;
      case 'Email':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.7 6.7 8.3 6.1 8.3-6.1"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.9 22V13h3.04l.46-3.51H13.9V7.25c0-1.02.29-1.71 1.76-1.71h1.88V2.4a25 25 0 0 0-2.74-.14c-2.71 0-4.56 1.65-4.56 4.69v2.54H7.2V13h3.04v9h3.66Z"/></svg>`;
    }
  }

  bindEvents() {
    this.container.querySelector('#btn-new-post').addEventListener('click', () => {
      appRouter.navigate('/crear');
    });

    // Filtros de pestaña (Todas / Aprobadas / Borradores / Con Imagen IA)
    const filterButtons = this.container.querySelectorAll('#library-filters button');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.dataset.filter;
        this.renderPosts();
      });
    });

    // Filtro por canal
    this.container.querySelector('#library-channel-filter').addEventListener('change', (e) => {
      this.currentChannel = e.target.value;
      this.renderPosts();
    });

    // Buscador en tiempo real
    this.container.querySelector('#library-search').addEventListener('input', () => {
      this.renderPosts();
    });

    // Conmutador Galería / Lista
    const viewButtons = this.container.querySelectorAll('[data-view-mode]');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.viewMode = btn.dataset.viewMode;
        const resultsBox = this.container.querySelector('#library-results');
        resultsBox.classList.toggle('is-list-view', this.viewMode === 'list');
        this.renderPosts();
      });
    });

    // Eventos del Modal de vista previa
    const closeModal = () => {
      const modal = this.container.querySelector('#lib-preview-modal');
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    };

    this.container.querySelector('#btn-close-modal').addEventListener('click', closeModal);
    this.container.querySelector('#modal-close-backdrop').addEventListener('click', closeModal);

    this.container.querySelector('#modal-btn-copy').addEventListener('click', async () => {
      if (!this.activeModalPost) return;
      try {
        await navigator.clipboard.writeText(this.activeModalPost.text || '');
        notify('Texto copiado al portapapeles.', 'success');
      } catch {
        notify('No se pudo copiar automáticamente.', 'error');
      }
    });
  }

  getFilteredPosts() {
    const query = (this.container.querySelector('#library-search')?.value || '').toLowerCase().trim();

    return this.posts.filter(p => {
      const hasImg = Boolean(safeImage(p.image));
      const matchTab =
        this.currentFilter === 'all' ||
        (this.currentFilter === 'with-image' ? hasImg : p.status === this.currentFilter);

      const matchChannel = this.currentChannel === 'all' || p.channel === this.currentChannel;

      const haystack = `${p.topic || ''} ${p.text || ''} ${p.imagePrompt || ''} ${p.objective || ''}`.toLowerCase();
      const matchSearch = !query || haystack.includes(query);

      return matchTab && matchChannel && matchSearch;
    });
  }

  renderPosts() {
    const container = this.container.querySelector('#library-results');
    const filteredPosts = this.getFilteredPosts();

    if (filteredPosts.length === 0) {
      container.innerHTML = `
        <div class="empty-state library-empty" style="grid-column: 1 / -1;">
          <h3>No se encontraron publicaciones</h3>
          <p>Prueba cambiando los filtros o genera una nueva pieza con imagen y texto en el Estudio IA.</p>
        </div>`;
      return;
    }

    container.innerHTML = filteredPosts.map((p, idx) => {
      const imgUrl = safeImage(p.image);
      const isApproved = p.status === 'approved';
      const dateStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

      const mediaHtml = imgUrl
        ? `<div class="ws-card-media" data-open-idx="${idx}">
             <img src="${h(imgUrl)}" alt="${h(p.topic || 'Imagen generada')}" loading="lazy">
             <span class="ws-media-badge">IMAGEN IA</span>
           </div>`
        : `<div class="ws-card-media ws-card-media-placeholder" data-open-idx="${idx}">
             <div class="ws-placeholder-inner">
               ${this.channelSvg(p.channel)}
               <span>SOLO TEXTO · ${h(p.channel.toUpperCase())}</span>
             </div>
           </div>`;

      const promptBadge = p.imagePrompt
        ? `<div class="ws-card-prompt">
             <strong>Prompt visual:</strong> ${h(p.imagePrompt)}
           </div>`
        : '';

      return `
        <article class="ws-lib-card">
          ${mediaHtml}
          <div class="ws-lib-card-body">
            <div class="ws-lib-card-top">
              <span class="ws-lib-channel">
                ${this.channelSvg(p.channel)}
                <b>${h(p.channel)}</b>
              </span>
              <span class="ws-lib-status ${isApproved ? 'is-approved' : 'is-draft'}">
                ${isApproved ? 'Aprobado' : 'Borrador'}
              </span>
            </div>

            <h3 class="ws-lib-title" data-open-idx="${idx}">${h(p.topic || 'Publicación comercial')}</h3>
            ${p.objective ? `<span class="ws-lib-objective">${h(p.objective)}</span>` : ''}

            <p class="ws-lib-excerpt">${h(String(p.text || ''))}</p>
            ${promptBadge}

            <footer class="ws-lib-card-foot">
              <span class="ws-lib-date">${h(dateStr)}</span>
              <div class="ws-lib-actions">
                <button type="button" class="ws-icon-action" data-copy-idx="${idx}" title="Copiar texto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                    <rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
                  </svg>
                  <span>Copiar</span>
                </button>
                <button type="button" class="ws-icon-action primary" data-open-idx="${idx}" title="Ver en simulador">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                    <path d="M2 12s3.7-7 10-7 10 7 10 7-3.7 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>Previsualizar</span>
                </button>
              </div>
            </footer>
          </div>
        </article>
      `;
    }).join('');

    // Conectar eventos de las tarjetas renderizadas
    container.querySelectorAll('[data-copy-idx]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const post = filteredPosts[Number(btn.dataset.copyIdx)];
        if (!post) return;
        try {
          await navigator.clipboard.writeText(post.text || '');
          notify('Copy copiado al portapapeles.', 'success');
        } catch {
          notify('No se pudo copiar el texto.', 'error');
        }
      });
    });

    container.querySelectorAll('[data-open-idx]').forEach(el => {
      el.addEventListener('click', () => {
        const post = filteredPosts[Number(el.dataset.openIdx)];
        if (post) this.openPreviewModal(post);
      });
    });
  }

  openPreviewModal(post) {
    this.activeModalPost = post;
    const modal = this.container.querySelector('#lib-preview-modal');
    const imgUrl = safeImage(post.image);

    this.container.querySelector('#modal-post-meta').textContent = `${post.channel.toUpperCase()} · ${post.objective || 'PUBLICACIÓN'}`;
    this.container.querySelector('#modal-post-title').textContent = post.topic || 'Publicación comercial';
    this.container.querySelector('#modal-post-text').textContent = post.text || '';

    const promptBlock = this.container.querySelector('#modal-prompt-block');
    if (post.imagePrompt) {
      promptBlock.style.display = 'block';
      this.container.querySelector('#modal-post-prompt').textContent = post.imagePrompt;
    } else {
      promptBlock.style.display = 'none';
    }

    const downloadBtn = this.container.querySelector('#modal-btn-download');
    if (imgUrl) {
      downloadBtn.style.display = 'inline-flex';
      downloadBtn.href = imgUrl;
    } else {
      downloadBtn.style.display = 'none';
    }

    const simContainer = this.container.querySelector('#modal-live-preview');
    simContainer.innerHTML = previewView(post.channel, post.text, this.companyData, imgUrl);

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
  }
}