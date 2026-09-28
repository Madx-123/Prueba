/**
 * ContentAI - PYMES | Live Channel Preview Renderer Module
 * Genera maquetas interactivas hiperrealistas de:
 * 1. Facebook Feed Post (Estilo Dark UI moderno con reacciones y comentarios)
 * 2. Instagram Feed / Reels (Header con avatar, carousel media, botones y caption)
 * 3. TikTok Feed (Formato vertical 9:16 estilo pantalla de móvil con acciones laterales, música y hashtags)
 * 4. WhatsApp Business (Burbuja oficial verde esmeralda con checks, hora y formato *negrita*, _cursiva_)
 * 5. Email Marketing (Bandeja de entrada corporativa con Asunto y CTA)
 */

import { store } from './store.js';
import { formatSocialCopy } from './socialFormatter.js';

export function initPreviews() {
  renderLivePreview();
}

export function setPreviewChannel(channelName) {
  const current = store.getState().currentGeneration || {};
  store.setState({
    currentGeneration: {
      ...current,
      previewNetwork: channelName
    }
  });

  // Actualizar selector visual de tabs en preview
  const pills = document.querySelectorAll('.preview-network-pill');
  pills.forEach((p) => {
    p.classList.toggle('active', p.getAttribute('data-network') === channelName);
  });

  // Actualizar botones de canal en el creador
  const creatorBtns = document.querySelectorAll('.creator-channel-btn');
  creatorBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-network') === channelName);
  });

  renderLivePreview();
}

export function setEditorFont(fontFamily) {
  store.setState({ editorFont: fontFamily });

  const textarea = document.getElementById('preview-generated-text');
  const previewContainer = document.getElementById('live-channel-preview-container');

  if (textarea) textarea.style.fontFamily = fontFamily;
  if (previewContainer) previewContainer.style.setProperty('--user-custom-font', fontFamily);
}

export function setEditorSize(fontSize) {
  store.setState({ editorFontSize: fontSize });

  const textarea = document.getElementById('preview-generated-text');
  const previewContainer = document.getElementById('live-channel-preview-container');

  if (textarea) textarea.style.fontSize = fontSize;
  if (previewContainer) previewContainer.style.setProperty('--user-custom-size', fontSize);
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
  const profile = state.companyProfile || { name: 'Mi PYME', sector: 'General', colorGradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' };
  const currentGen = state.currentGeneration || {};
  const activeNetwork = currentGen.previewNetwork || getNetworkFromType(currentGen.contentType) || 'Facebook';
  const text = currentGen.generatedText || getDefaultSampleText(activeNetwork, profile.name);
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'P';
  const handleName = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const likesCount = state.likesCount || 348;
  const isLiked = state.isLiked || false;

  // Actualizar selector visual de tabs de red
  const pills = document.querySelectorAll('.preview-network-pill');
  pills.forEach((p) => {
    if (p.getAttribute('data-network') === activeNetwork) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  if (activeNetwork.toLowerCase() === 'tiktok') {
    container.innerHTML = `
      <div class="tiktok-mockup-wrapper">
        <div class="tiktok-phone-frame">
          <!-- Top Bar con Tabs y Búsqueda -->
          <div class="tiktok-top-bar">
            <span class="tiktok-tab">Siguiendo</span>
            <span class="tiktok-tab active">Para ti</span>
            <button class="tiktok-search-btn" title="Buscar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </div>

          <!-- Video / Canvas Simulado Vertical -->
          <div class="tiktok-video-canvas" style="background: ${profile.colorGradient || 'linear-gradient(180deg, #111827 0%, #0F172A 50%, #1E1B4B 100%)'};">
            <!-- Efecto de Video / Branding Centrado -->
            <div class="tiktok-media-center">
              <div class="tiktok-brand-logo">${initial}</div>
              <h3 class="tiktok-brand-heading">${profile.name}</h3>
              <span class="tiktok-brand-sub">${profile.sector.split('/')[0]}</span>
            </div>

            <!-- Acciones Laterales (TikTok Icons) -->
            <div class="tiktok-side-actions">
              <div class="tiktok-creator-avatar-box">
                <div class="tiktok-creator-avatar">${initial}</div>
                <button class="tiktok-follow-badge">+</button>
              </div>

              <button class="tiktok-action-item ${isLiked ? 'liked' : ''}" onclick="window.ContentAI.toggleLike()">
                <div class="tiktok-action-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="${isLiked ? '#FE2C55' : '#FFFFFF'}" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <span>${likesCount}</span>
              </button>

              <button class="tiktok-action-item">
                <div class="tiktok-action-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.42 3.84 7.03L5 22l4.23-1.41C10.12 20.82 11.04 21 12 21c5.52 0 10-4.03 10-10S17.52 2 12 2z"/></svg>
                </div>
                <span>48</span>
              </button>

              <button class="tiktok-action-item">
                <div class="tiktok-action-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                </div>
                <span>124</span>
              </button>

              <button class="tiktok-action-item">
                <div class="tiktok-action-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
                </div>
                <span>Compartir</span>
              </button>
            </div>

            <!-- Overlay de Información Inferior (Descripción, @usuario, Música) -->
            <div class="tiktok-bottom-overlay">
              <div class="tiktok-username-row">
                <span class="tiktok-username">@${handleName}</span>
                <span class="tiktok-verified">✓</span>
                <span class="tiktok-badge-official">Cuenta PYME</span>
              </div>

              <div class="tiktok-caption-text">
                ${formatSocialCopy(text, 'tiktok')}
              </div>

              <div class="tiktok-music-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                <div class="tiktok-marquee">Sonido original - ${profile.name} · Promociones Comerciales</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  else if (activeNetwork.toLowerCase() === 'instagram') {
    container.innerHTML = `
      <div class="ig-post-mockup">
        <!-- Header -->
        <div class="ig-post-header">
          <div class="ig-header-author">
            <div class="ig-avatar-ring">
              <div class="ig-avatar">${initial}</div>
            </div>
            <div>
              <div class="ig-author-name">
                <span>${handleName}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#0095F6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
              <span class="ig-sub-location">${profile.sector.split('/')[0]} · Comercial</span>
            </div>
          </div>
          <button class="ig-dots-btn">•••</button>
        </div>

        <!-- Media Box Cuadrado 1:1 -->
        <div class="ig-media-square" style="background: ${profile.colorGradient || 'linear-gradient(135deg, #18181B 0%, #27272A 100%)'}">
          <div class="ig-media-content">
            <div class="ig-media-sparkle">✨</div>
            <h3 class="ig-media-title">${profile.name}</h3>
            <p class="ig-media-tagline">Calidad y dedicación en cada detalle</p>
          </div>
        </div>

        <!-- Acciones: Like, Comentario, Compartir, Guardar -->
        <div class="ig-actions-row">
          <div class="ig-action-icons">
            <button class="ig-icon-btn ${isLiked ? 'liked' : ''}" onclick="window.ContentAI.toggleLike()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="${isLiked ? '#ED4956' : 'none'}" stroke="${isLiked ? '#ED4956' : '#FFFFFF'}" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            <button class="ig-icon-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </button>
            <button class="ig-icon-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <button class="ig-icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>

        <!-- Me gusta -->
        <div class="ig-likes-count">
          Les gusta a <strong>clientes_felices</strong> y <strong class="tabular-nums">${likesCount} personas más</strong>
        </div>

        <!-- Caption con negrita, cursiva y hashtags -->
        <div class="ig-post-caption">
          <strong class="ig-author-handle">${handleName}</strong>
          ${formatSocialCopy(text, 'instagram')}
        </div>

        <div class="ig-timestamp">HACE 15 MINUTOS</div>
      </div>
    `;
  }
  else if (activeNetwork.toLowerCase() === 'whatsapp') {
    container.innerHTML = `
      <div class="wa-post-mockup">
        <!-- WhatsApp Header -->
        <div class="wa-chat-header">
          <div class="wa-header-back">‹</div>
          <div class="wa-avatar-ring">${initial}</div>
          <div class="wa-header-meta">
            <div class="wa-header-title">
              <span>${profile.name}</span>
              <span class="wa-business-badge">✓</span>
            </div>
            <div class="wa-header-sub">Cuenta de empresa oficial · En línea</div>
          </div>
          <div class="wa-header-actions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </div>
        </div>

        <!-- Canvas de Chat -->
        <div class="wa-chat-canvas">
          <div class="wa-date-chip">HOY</div>

          <!-- Mensaje Enviado (Burbuja Verde) -->
          <div class="wa-bubble-sent">
            <div class="wa-bubble-text">
              ${formatSocialCopy(text, 'whatsapp')}
            </div>
            <div class="wa-bubble-time">
              <span>10:48 AM</span>
              <span class="wa-ticks">✓✓</span>
            </div>
          </div>
        </div>

        <!-- Chat Input Mockup -->
        <div class="wa-bottom-bar">
          <div class="wa-input-pill">
            <span style="opacity:0.6;">😊 Mensaje</span>
            <span style="opacity:0.6;">📎</span>
          </div>
          <div class="wa-mic-btn">🎙️</div>
        </div>
      </div>
    `;
  }
  else if (activeNetwork.toLowerCase() === 'email') {
    container.innerHTML = `
      <div class="email-post-mockup">
        <!-- Barra de Estado del Correo -->
        <div class="email-meta-header">
          <div class="email-meta-row">
            <span class="email-meta-label">De:</span>
            <span><strong>${profile.name}</strong> &lt;comercial@${handleName}.com&gt;</span>
          </div>
          <div class="email-meta-row">
            <span class="email-meta-label">Para:</span>
            <span>Cliente Preferencial &lt;contacto@cliente.com&gt;</span>
          </div>
          <div class="email-meta-row">
            <span class="email-meta-label">Asunto:</span>
            <span style="color:#FFFFFF; font-weight:600;">✨ Novedades y beneficios exclusivos para ti</span>
          </div>
        </div>

        <!-- Cuerpo del Email con formato rico -->
        <div class="email-body-content">
          <div class="email-branding-header" style="background:${profile.colorGradient || 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)'};">
            <h2>${profile.name}</h2>
            <p>Boletín Comercial Oficial</p>
          </div>

          <div class="email-copy-text">
            ${formatSocialCopy(text, 'email')}
          </div>

          <div class="email-cta-box">
            <button class="btn btn-primary" style="margin: 0 auto; display: inline-flex;">
              Aprovechar Beneficio Comercial
            </button>
          </div>

          <div class="email-footer-legal">
            Has recibido este correo porque formas parte de la comunidad de ${profile.name}.
            <br>© 2026 ${profile.name} · Todos los derechos reservados.
          </div>
        </div>
      </div>
    `;
  }
  else {
    // Facebook por defecto
    container.innerHTML = `
      <div class="fb-post-mockup">
        <!-- Header -->
        <div class="fb-post-header">
          <div class="fb-author-row">
            <div class="fb-avatar">${initial}</div>
            <div>
              <div class="fb-author-name">
                <span>${profile.name}</span>
                <span class="fb-verified-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#2D88FF"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </span>
              </div>
              <div class="fb-timestamp-row">
                <span>Hace 5 min</span>
                <span>·</span>
                <span>Publicidad</span>
                <span>·</span>
                <span>🌐</span>
              </div>
            </div>
          </div>
          <button class="fb-menu-dots">•••</button>
        </div>

        <!-- Contenido del Post con Negrita y Formato Real -->
        <div class="fb-post-content">
          ${formatSocialCopy(text, 'facebook')}
        </div>

        <!-- Banner Multimedia -->
        <div class="fb-media-banner" style="background: ${profile.colorGradient || 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)'}">
          <div class="fb-banner-badge">COMUNICADO OFICIAL · ${profile.sector.split('/')[0]}</div>
          <h2 class="fb-banner-title">${profile.name}</h2>
          <p class="fb-banner-sub">Experiencia, Confianza y Calidad Garantizada</p>
        </div>

        <!-- Barra de Estadísticas -->
        <div class="fb-stats-bar">
          <div class="fb-reactions-group">
            <span class="fb-reaction-icon" style="background:#1877F2;">👍</span>
            <span class="fb-reaction-icon" style="background:#FA3E3E;">❤️</span>
            <span class="tabular-nums" style="margin-left:4px; font-weight:600;">${likesCount}</span>
          </div>
          <div class="fb-comments-share">
            <span>32 comentarios</span>
            <span>·</span>
            <span>19 veces compartido</span>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="fb-actions-bar">
          <button class="fb-action-btn ${isLiked ? 'liked' : ''}" onclick="window.ContentAI.toggleLike()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? '#2D88FF' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            <span style="${isLiked ? 'color:#2D88FF;' : ''}">${isLiked ? 'Te gusta' : 'Me gusta'}</span>
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
}

export function toggleLike() {
  const state = store.getState();
  const nextIsLiked = !state.isLiked;
  const nextCount = nextIsLiked ? (state.likesCount || 348) + 1 : (state.likesCount || 349) - 1;

  store.setState({
    isLiked: nextIsLiked,
    likesCount: nextCount
  });

  renderLivePreview();
}

function getNetworkFromType(type = '') {
  if (type.includes('TikTok')) return 'TikTok';
  if (type.includes('Instagram')) return 'Instagram';
  if (type.includes('WhatsApp')) return 'WhatsApp';
  if (type.includes('Email')) return 'Email';
  if (type.includes('Facebook')) return 'Facebook';
  return 'Facebook';
}

function getDefaultSampleText(network, companyName) {
  const net = network.toLowerCase();
  if (net === 'tiktok') {
    return `🔥 ¡No compres café hasta ver esto! 😱\n\nEn **${companyName}** cambiamos las reglas del juego. ☕✨\n\n¿Sabías que el 80% de lo que compras en el súper lleva meses tostado? Nuestro lote sale directo de la finca a tu taza. 🌿\n\n👇 ¡Comenta "PROMO" y te mandamos el código secreto!\n\n#cafe #barista #pyme #emprendimiento #colombia #viral`;
  } else if (net === 'instagram') {
    return `✨ Un aroma que transforma cualquier momento. En **${companyName}** la pasión es nuestro ingrediente principal. ☕🌿\n\nPresentamos nuestro *nuevo origen especial*: cosechado con orgullo y notas a caramelo natural.\n\n💬 Cuéntanos en los comentarios: ¿cómo tomas tu primer café del día?\n\n#CaféDeOrigen #PYMES #CalidadArtesanal #${companyName.replace(/\s+/g, '')}`;
  } else if (net === 'whatsapp') {
    return `¡Hola! 👋 Te saludamos desde *${companyName}*.\n\nTenemos una noticia especial para nuestros clientes VIP: *20% OFF* durante las próximas 48 horas en toda nuestra línea. 📦🚀\n\nResponde a este chat con la palabra *PEDIDO* y nuestro asesor te tomará la orden al instante.`;
  } else if (net === 'email') {
    return `Estimado cliente,\n\nEn **${companyName}** preparamos una propuesta hecha a tu medida.\n\nDescubre cómo optimizar tu día con nuestros productos artesanales seleccionados a mano.\n\n[ BOTÓN: OBTENER DESCUENTO AHORA ]`;
  } else {
    return `☕✨ ¡Novedades exclusivas en **${companyName}**! ✨🌿\n\nSabemos lo importante que es disfrutar de productos auténticos y apoyar a la producción local. Esta semana tenemos beneficios directos para nuestra comunidad.\n\n👇 ¡Haz clic en el enlace o escríbenos directamente para más detalles!`;
  }
}
