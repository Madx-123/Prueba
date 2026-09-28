/**
 * ContentAI - PYMES | Live Channel Preview Renderer Module
 * Genera maquetas interactivas realistas de Facebook, Instagram, WhatsApp y Email
 */

import { store } from './store.js';

export function initPreviews() {
  renderLivePreview();
}

export function toggleEditorMode(mode) {
  store.setState({ editorMode: mode });

  const editorTextarea = document.getElementById('preview-generated-text');
  const previewContainer = document.getElementById('live-channel-preview-container');
  const btnEditor = document.getElementById('btn-mode-editor');
  const btnPreview = document.getElementById('btn-mode-preview');

  if (mode === 'editor') {
    if (editorTextarea) editorTextarea.style.display = 'block';
    if (previewContainer) previewContainer.classList.remove('active');
    if (btnEditor) btnEditor.classList.add('active');
    if (btnPreview) btnPreview.classList.remove('active');
  } else {
    if (editorTextarea) editorTextarea.style.display = 'none';
    if (previewContainer) previewContainer.classList.add('active');
    if (btnEditor) btnEditor.classList.remove('active');
    if (btnPreview) btnPreview.classList.add('active');
    renderLivePreview();
  }
}

export function renderLivePreview() {
  const container = document.getElementById('live-channel-preview-container');
  if (!container) return;

  const state = store.getState();
  const profile = state.companyProfile;
  const currentGen = state.currentGeneration;
  const type = currentGen.contentType || 'Post de Facebook';
  const text = currentGen.generatedText || '';
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'P';
  const likesCount = state.likesCount || 142;
  const isLiked = state.isLiked || false;

  if (type.includes('Facebook')) {
    container.innerHTML = `
      <div class="fb-post-mockup">
        <div class="fb-post-header">
          <div class="fb-author-row">
            <div class="fb-avatar">${initial}</div>
            <div>
              <div class="fb-author-name">
                <span>${profile.name}</span>
                <span class="fb-verified-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              </div>
              <div class="fb-timestamp-row">
                <span>Hace 10 min</span>
                <span>·</span>
                <span>Publicidad comercial</span>
                <span>·</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
              </div>
            </div>
          </div>
          <button style="border:none; background:none; cursor:pointer; color:#65676B;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>

        <div class="fb-post-content">${escapeHtml(text)}</div>

        <!-- Banner Visual de la PYME -->
        <div class="fb-media-banner" style="background: ${profile.colorGradient || 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)'}">
          <span class="media-banner-badge">✨ Campaña Oficial · ${profile.sector.split('/')[0]}</span>
          <div class="media-banner-title">${profile.name}</div>
          <div class="media-banner-sub">${profile.badgeText || 'Calidad y Compromiso con cada cliente'}</div>
        </div>

        <div class="fb-stats-row">
          <div class="fb-reactions-bubble">
            <span style="background:#1877F2; border-radius:50%; width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; color:white; font-size:10px;">👍</span>
            <span style="background:#FA3E3E; border-radius:50%; width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; color:white; font-size:10px;">❤️</span>
            <span class="tabular-nums" id="fb-likes-display">${likesCount}</span>
          </div>
          <div style="display:flex; gap:12px;">
            <span>24 comentarios</span>
            <span>18 veces compartido</span>
          </div>
        </div>

        <div class="fb-actions-bar">
          <button class="fb-action-btn ${isLiked ? 'liked' : ''}" onclick="window.ContentAI.toggleLike()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? '#1877F2' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            <span>${isLiked ? 'Te gusta' : 'Me gusta'}</span>
          </button>
          <button class="fb-action-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>Comentar</span>
          </button>
          <button class="fb-action-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span>Compartir</span>
          </button>
        </div>
      </div>
    `;
  }
  else if (type.includes('Instagram')) {
    container.innerHTML = `
      <div class="ig-post-mockup">
        <div class="ig-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="ig-profile-ring">
              <div class="ig-profile-inner">${initial}</div>
            </div>
            <div>
              <strong style="font-size:0.88rem; display:block;">${profile.name.toLowerCase().replace(/\s+/g, '_')}</strong>
              <span style="font-size:0.75rem; color:#8E8E8E;">Audio original · Promocional</span>
            </div>
          </div>
          <button style="border:none; background:none; cursor:pointer;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>

        <div class="ig-media-frame" style="background: ${profile.colorGradient || 'linear-gradient(135deg, #18181B 0%, #27272A 100%)'}">
          <div>
            <div style="font-size:2.2rem; margin-bottom:12px;">✨</div>
            <h3 style="color:white; font-size:1.4rem; margin-bottom:8px; font-weight:800;">${profile.name}</h3>
            <p style="color:#D4D4D8; font-size:0.9rem; max-width:320px; margin:0 auto;">${profile.badgeText || 'Colección Comercial Exclusiva'}</p>
          </div>
        </div>

        <div class="ig-actions-row">
          <div class="ig-icon-group">
            <button class="ig-interactive-icon ${isLiked ? 'liked' : ''}" onclick="window.ContentAI.toggleLike()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="${isLiked ? '#ED4956' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            <button class="ig-interactive-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </button>
            <button class="ig-interactive-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <button class="ig-interactive-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>

        <div style="padding: 0 14px 6px; font-size:0.85rem; font-weight:700;">
          <span class="tabular-nums">${likesCount}</span> Me gusta
        </div>

        <div class="ig-caption-block">
          <strong>${profile.name.toLowerCase().replace(/\s+/g, '_')}</strong> ${escapeHtml(text)}
        </div>
      </div>
    `;
  }
  else if (type.includes('WhatsApp')) {
    container.innerHTML = `
      <div class="wa-mockup">
        <div class="wa-header">
          <div style="width:36px; height:36px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">
            ${initial}
          </div>
          <div style="flex:1;">
            <div style="font-weight:700; font-size:0.95rem;">${profile.name} (Empresa)</div>
            <div style="font-size:0.75rem; opacity:0.9;">Cuenta Comercial Verificada · En línea</div>
          </div>
        </div>

        <div class="wa-chat-canvas">
          <div class="wa-bubble">
            <div>${escapeHtml(text)}</div>
            <div class="wa-bubble-footer">
              <span>10:45 AM</span>
              <span class="wa-checks">✓✓</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  else {
    // Email / Landing
    container.innerHTML = `
      <div class="email-mockup">
        <div class="email-header-top">
          <span>De: <strong>${profile.name} &lt;comercial@${profile.name.toLowerCase().replace(/\s+/g, '')}.com&gt;</strong></span>
          <span>Bandeja de Entrada</span>
        </div>
        <div class="email-subject-box">
          <strong style="font-size:1.1rem; color:var(--text-primary); display:block; margin-bottom:4px;">Campaña Exclusiva para Clientes Selectos</strong>
          <span style="font-size:0.8rem; color:var(--text-muted);">Enviado a tu lista de suscriptores · Segmento PYME</span>
        </div>
        <div class="email-body-content">
          ${escapeHtml(text)}
        </div>
      </div>
    `;
  }
}

export function toggleLike() {
  const state = store.getState();
  const nextIsLiked = !state.isLiked;
  const nextCount = nextIsLiked ? state.likesCount + 1 : state.likesCount - 1;

  store.setState({
    isLiked: nextIsLiked,
    likesCount: nextCount
  });

  renderLivePreview();
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.innerText = string;
  return div.innerHTML;
}
