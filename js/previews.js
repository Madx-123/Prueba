
/**
 * ContentAI PYMES | Previsualizaciones de publicaciones
 * Archivo 7 de la refactorización.
 *
 * Mantiene las cinco maquetas y clases del CSS original.
 * La vista previa NUNCA publica contenido en una red social.
 * La información de empresa se escapa antes de insertar HTML.
 */

import { store } from './store.js';
import { formatSocialCopy } from './socialFormatter.js';

const byId = (id) => document.getElementById(id);
const NETWORKS = ['Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'Email'];

const FONTS = new Set([
  "'Inter', sans-serif",
  "'Plus Jakarta Sans', sans-serif",
  "'Space Grotesk', sans-serif",
  "'JetBrains Mono', monospace"
]);

const SIZES = new Set(['0.86rem', '0.92rem', '1.05rem']);

let initialized = false;

/* ==========================================================
   1. PROTECCIÓN Y UTILIDADES
   ========================================================== */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

/**
 * Solo se aceptan degradados CSS simples
 * basados en colores hexadecimales.
 */
function safeGradient(value, fallback) {
  if (typeof value !== 'string') return fallback;

  const color = '#[0-9a-fA-F]{3,8}';
  const stop = `${color}(?:\\s+\\d{1,3}%)?`;

  const pattern = new RegExp(
    `^linear-gradient\\(\\s*\\d{1,3}deg\\s*,\\s*${stop}(?:\\s*,\\s*${stop}){1,4}\\s*\\)$`,
    'i'
  );

  return pattern.test(value.trim())
    ? value.trim()
    : fallback;
}

function networkFromType(type) {
  const value = String(type ?? '').toLowerCase();

  if (value.includes('instagram')) return 'Instagram';
  if (value.includes('tiktok')) return 'TikTok';
  if (value.includes('whatsapp')) return 'WhatsApp';

  if (
    value.includes('email') ||
    value.includes('correo')
  ) {
    return 'Email';
  }

  return 'Facebook';
}

function resolveNetwork(name, contentType) {
  return NETWORKS.includes(name)
    ? name
    : networkFromType(contentType);
}

/* ==========================================================
   2. SINCRONIZACIÓN DE BOTONES
   ========================================================== */

/**
 * Sincroniza el selector visual sin alterar
 * el canal del borrador.
 */
function syncNetworkButtons(network) {
  document.querySelectorAll(
    '.preview-network-pill, .creator-channel-btn'
  ).forEach((button) => {
    const selected =
      button.dataset.network === network;

    button.classList.toggle('active', selected);

    button.setAttribute(
      'aria-pressed',
      String(selected)
    );
  });
}

/* ==========================================================
   3. INICIALIZACIÓN
   ========================================================== */

export function initPreviews() {
  if (initialized) return;

  initialized = true;

  const container = byId(
    'live-channel-preview-container'
  );

  if (container) {
    // Delegación de eventos:
    // funciona después de reconstruir las maquetas.
    container.addEventListener('click', (event) => {
      const button = event.target.closest(
        '[data-preview-like]'
      );

      if (
        button &&
        container.contains(button)
      ) {
        toggleLike();
      }
    });
  }

  let previousCompany =
    store.getState().companyProfile;

  let previousLikes =
    store.getState().likesCount;

  let previousLiked =
    store.getState().isLiked;

  store.subscribe((state) => {
    if (
      state.companyProfile !== previousCompany ||
      state.likesCount !== previousLikes ||
      state.isLiked !== previousLiked
    ) {
      previousCompany = state.companyProfile;
      previousLikes = state.likesCount;
      previousLiked = state.isLiked;

      renderLivePreview();
    }
  });

  renderLivePreview();
}

/* ==========================================================
   4. SELECCIÓN DE PLATAFORMA
   ========================================================== */

export function setPreviewChannel(channelName) {
  if (!NETWORKS.includes(channelName)) {
    return false;
  }

  const current =
    store.getState().currentGeneration || {};

  if (current.previewNetwork !== channelName) {
    store.setState({
      currentGeneration: {
        ...current,
        previewNetwork: channelName
      }
    });
  }

  syncNetworkButtons(channelName);
  renderLivePreview();

  return true;
}

/* ==========================================================
   5. CONFIGURACIÓN DEL EDITOR
   ========================================================== */

export function setEditorFont(fontFamily) {
  if (!FONTS.has(fontFamily)) {
    return false;
  }

  store.setState({
    editorFont: fontFamily
  });

  const editor = byId('preview-generated-text');
  const preview = byId('live-channel-preview-container');

  if (editor) {
    editor.style.fontFamily = fontFamily;
  }

  if (preview) {
    preview.style.setProperty(
      '--user-custom-font',
      fontFamily
    );
  }

  return true;
}

export function setEditorSize(fontSize) {
  if (!SIZES.has(fontSize)) {
    return false;
  }

  store.setState({
    editorFontSize: fontSize
  });

  const editor = byId('preview-generated-text');
  const preview = byId('live-channel-preview-container');

  if (editor) {
    editor.style.fontSize = fontSize;
  }

  if (preview) {
    preview.style.setProperty(
      '--user-custom-size',
      fontSize
    );
  }

  return true;
}

/* ==========================================================
   6. MODO EDITOR / VISTA PREVIA
   ========================================================== */

/**
 * El dashboard actual muestra simultáneamente
 * el editor y la vista previa.
 */
export function toggleEditorMode(mode) {
  if (mode !== 'editor' && mode !== 'preview') {
    return false;
  }

  store.setState({
    editorMode: mode
  });

  const btnEditor = byId('btn-mode-editor');
  const btnPreview = byId('btn-mode-preview');

  // Si no existe el selector de modos,
  // no ocultar ninguna columna.
  if (!btnEditor && !btnPreview) {
    return true;
  }

  const editor = byId('preview-generated-text');
  const preview = byId('live-channel-preview-container');

  if (editor) {
    editor.style.display =
      mode === 'editor' ? '' : 'none';
  }

  if (preview) {
    preview.classList.toggle(
      'active',
      mode === 'preview'
    );
  }

  btnEditor?.classList.toggle(
    'active',
    mode === 'editor'
  );

  btnPreview?.classList.toggle(
    'active',
    mode === 'preview'
  );

  if (mode === 'preview') {
    renderLivePreview();
  }

  return true;
}

/* ==========================================================
   7. RENDERIZADO PRINCIPAL
   ========================================================== */

export function renderLivePreview() {
  const container = byId(
    'live-channel-preview-container'
  );

  if (!container) return;

  const state = store.getState();
  const profile = state.companyProfile || {};
  const generation = state.currentGeneration || {};

  const activeNetwork = resolveNetwork(
    generation.previewNetwork,
    generation.contentType
  );

  const text = String(
    generation.generatedText ?? ''
  );

  syncNetworkButtons(activeNetwork);

  // Un borrador vacío debe seguir vacío
  // incluso después de cambiar de plataforma.
  if (!text.trim()) {
    const message = document.createElement('p');

    message.textContent =
      'Sin contenido para previsualizar. Genera un nuevo borrador.';

    message.style.cssText =
      'padding:28px;text-align:center;color:var(--text-muted);';

    container.replaceChildren(message);
    return;
  }

  // Información de la empresa.
  const displayName = String(
    profile.name || 'Mi PYME'
  );

  const safeName = escapeHtml(displayName);

  const safeSector = escapeHtml(
    String(profile.sector || 'General')
      .split('/')[0]
      .trim()
  );

  const initial = escapeHtml(
    displayName.trim().charAt(0).toUpperCase() || 'P'
  );

  // Nombre de usuario compatible con redes sociales.
  const handleName = displayName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || 'mi_pyme';

  // Estadísticas simuladas.
  const likesCount = Number.isFinite(state.likesCount)
    ? Math.max(0, Math.trunc(state.likesCount))
    : 142;

  const isLiked = Boolean(state.isLiked);

  /*
   * El formateador escapa el texto antes de
   * generar etiquetas HTML controladas.
   */

  /* ========================================================
     8. PREVISUALIZACIÓN TIKTOK
     ======================================================== */

  if (activeNetwork.toLowerCase() === 'tiktok') {
    container.innerHTML = `
      <div class="tiktok-mockup-wrapper">
        <div class="tiktok-phone-frame">

          <!-- Barra superior -->
          <div class="tiktok-top-bar">
            <span class="tiktok-tab">Siguiendo</span>
            <span class="tiktok-tab active">Para ti</span>

            <button
              class="tiktok-search-btn"
              type="button"
              title="Control decorativo"
              disabled
            >
              <svg width="18" height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </button>
          </div>

          <!-- Simulación de video vertical -->
          <div
            class="tiktok-video-canvas"
            style="background: ${safeGradient(
              profile.colorGradient,
              'linear-gradient(180deg, #111827 0%, #0F172A 50%, #1E1B4B 100%)'
            )};"
          >

            <!-- Identidad de marca -->
            <div class="tiktok-media-center">
              <div class="tiktok-brand-logo">
                ${initial}
              </div>

              <h3 class="tiktok-brand-heading">
                ${safeName}
              </h3>

              <span class="tiktok-brand-sub">
                ${safeSector}
              </span>
            </div>

            <!-- Botones laterales -->
            <div class="tiktok-side-actions">

              <div class="tiktok-creator-avatar-box">
                <div class="tiktok-creator-avatar">
                  ${initial}
                </div>

                <button
                  class="tiktok-follow-badge"
                  type="button"
                  disabled
                >+</button>
              </div>

              <!-- Me gusta -->
              <button
                class="tiktok-action-item ${isLiked ? 'liked' : ''}"
                type="button"
                data-preview-like="true"
                aria-label="Marcar me gusta en la demostración"
              >
                <div class="tiktok-action-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="${isLiked ? '#FE2C55' : '#FFFFFF'}"
                    stroke="none"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>

                <span>${likesCount}</span>
              </button>

              <!-- Comentarios decorativos -->
              <button
                class="tiktok-action-item"
                type="button"
                disabled
              >
                <div class="tiktok-action-icon">
                  <svg width="26" height="26"
                    viewBox="0 0 24 24"
                    fill="#FFFFFF">
                    <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.42 3.84 7.03L5 22l4.23-1.41C10.12 20.82 11.04 21 12 21c5.52 0 10-4.03 10-10S17.52 2 12 2z"/>
                  </svg>
                </div>
                <span>48</span>
              </button>

              <!-- Guardados decorativos -->
              <button
                class="tiktok-action-item"
                type="button"
                disabled
              >
                <div class="tiktok-action-icon">
                  <svg width="26" height="26"
                    viewBox="0 0 24 24"
                    fill="#FFFFFF">
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <span>124</span>
              </button>

              <!-- Compartir decorativo -->
              <button
                class="tiktok-action-item"
                type="button"
                disabled
              >
                <div class="tiktok-action-icon">
                  <svg width="26" height="26"
                    viewBox="0 0 24 24"
                    fill="#FFFFFF">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                </div>
                <span>Compartir</span>
              </button>

            </div>

            <!-- Información inferior -->
            <div class="tiktok-bottom-overlay">

              <div class="tiktok-username-row">
                <span class="tiktok-username">
                  @${handleName}
                </span>

                <span
                  class="tiktok-verified"
                  title="Maqueta"
                >✦</span>

                <span class="tiktok-badge-official">
                  Demo PYME
                </span>
              </div>

              <div class="tiktok-caption-text">
                ${formatSocialCopy(text, 'tiktok')}
              </div>

              <div class="tiktok-music-row">
                <svg width="14" height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>

                <div class="tiktok-marquee">
                  Sonido original - ${safeName}
                  · Promociones Comerciales
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ========================================================
     9. PREVISUALIZACIÓN INSTAGRAM
     ======================================================== */

  else if (activeNetwork.toLowerCase() === 'instagram') {
    container.innerHTML = `
      <div class="ig-post-mockup">

        <!-- Encabezado -->
        <div class="ig-post-header">
          <div class="ig-header-author">

            <div class="ig-avatar-ring">
              <div class="ig-avatar">
                ${initial}
              </div>
            </div>

            <div>
              <div class="ig-author-name">
                <span>${handleName}</span>

                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="#0095F6"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>

              <span class="ig-sub-location">
                ${safeSector} · Comercial
              </span>
            </div>

          </div>

          <button
            class="ig-dots-btn"
            type="button"
            disabled
          >•••</button>
        </div>

        <!-- Imagen simulada -->
        <div
          class="ig-media-square"
          style="background: ${safeGradient(
            profile.colorGradient,
            'linear-gradient(135deg, #18181B 0%, #27272A 100%)'
          )}"
        >
          <div class="ig-media-content">

            <div class="ig-media-sparkle">
              ✨
            </div>

            <h3 class="ig-media-title">
              ${safeName}
            </h3>

            <p class="ig-media-tagline">
              Calidad y dedicación en cada detalle
            </p>

          </div>
        </div>

        <!-- Acciones -->
        <div class="ig-actions-row">
          <div class="ig-action-icons">

            <!-- Me gusta -->
            <button
              class="ig-icon-btn ${isLiked ? 'liked' : ''}"
              type="button"
              data-preview-like="true"
              aria-label="Marcar me gusta en la demostración"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="${isLiked ? '#ED4956' : 'none'}"
                stroke="${isLiked ? '#ED4956' : '#FFFFFF'}"
                stroke-width="2"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </button>

            <!-- Comentar -->
            <button
              class="ig-icon-btn"
              type="button"
              disabled
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                stroke-width="2"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </button>

            <!-- Enviar -->
            <button
              class="ig-icon-btn"
              type="button"
              disabled
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                stroke-width="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>

          </div>

          <!-- Guardar -->
          <button
            class="ig-icon-btn"
            type="button"
            disabled
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              stroke-width="2"
            >
              <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>

        <!-- Estadísticas de demostración -->
        <div class="ig-likes-count">
          Les gusta a
          <strong>clientes_felices</strong>
          y
          <strong class="tabular-nums">
            ${likesCount} personas más
          </strong>
        </div>

        <!-- Descripción -->
        <div class="ig-post-caption">
          <strong class="ig-author-handle">
            ${handleName}
          </strong>

          ${formatSocialCopy(text, 'instagram')}
        </div>

        <div class="ig-timestamp">
          VISTA DE DEMOSTRACIÓN
        </div>

      </div>
    `;
  }

  /* ========================================================
     10. PREVISUALIZACIÓN WHATSAPP
     ======================================================== */

  else if (activeNetwork.toLowerCase() === 'whatsapp') {
    container.innerHTML = `
      <div class="wa-post-mockup">

        <!-- Encabezado del chat -->
        <div class="wa-chat-header">

          <div class="wa-header-back">
            ‹
          </div>

          <div class="wa-avatar-ring">
            ${initial}
          </div>

          <div class="wa-header-meta">
            <div class="wa-header-title">
              <span>${safeName}</span>

              <span
                class="wa-business-badge"
                title="Maqueta"
              >✦</span>
            </div>

            <div class="wa-header-sub">
              Vista previa de conversación · Demo
            </div>
          </div>

          <!-- Íconos decorativos -->
          <div class="wa-header-actions">

            <svg width="20" height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect
                width="15"
                height="14"
                x="1"
                y="5"
                rx="2"
                ry="2"
              />
            </svg>

            <svg width="18" height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>

            <svg width="16" height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>

          </div>
        </div>

        <!-- Área de conversación -->
        <div class="wa-chat-canvas">

          <div class="wa-date-chip">
            HOY
          </div>

          <!-- Mensaje comercial -->
          <div class="wa-bubble-sent">

            <div class="wa-bubble-text">
              ${formatSocialCopy(text, 'whatsapp')}
            </div>

            <div class="wa-bubble-time">
              <span>Demo</span>
              <span class="wa-ticks">✓✓</span>
            </div>

          </div>
        </div>

        <!-- Caja de escritura decorativa -->
        <div class="wa-bottom-bar">
          <div class="wa-input-pill">

            <span style="opacity:0.6;">
              😊 Mensaje
            </span>

            <span style="opacity:0.6;">
              📎
            </span>

          </div>

          <div class="wa-mic-btn">
            🎙️
          </div>
        </div>

      </div>
    `;
  }

  /* ========================================================
     11. PREVISUALIZACIÓN EMAIL
     ======================================================== */

  else if (activeNetwork.toLowerCase() === 'email') {
    container.innerHTML = `
      <div class="email-post-mockup">

        <!-- Información del correo -->
        <div class="email-meta-header">

          <div class="email-meta-row">
            <span class="email-meta-label">
              De:
            </span>

            <span>
              <strong>${safeName}</strong>
              &lt;demo@ejemplo.test&gt;
            </span>
          </div>

          <div class="email-meta-row">
            <span class="email-meta-label">
              Para:
            </span>

            <span>
              Cliente de ejemplo
              &lt;contacto@ejemplo.test&gt;
            </span>
          </div>

          <div class="email-meta-row">
            <span class="email-meta-label">
              Asunto:
            </span>

            <span
              style="color:#FFFFFF;font-weight:600;"
            >
              Vista previa de campaña comercial
            </span>
          </div>

        </div>

        <!-- Contenido del correo -->
        <div class="email-body-content">

          <!-- Encabezado de marca -->
          <div
            class="email-branding-header"
            style="background:${safeGradient(
              profile.colorGradient,
              'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)'
            )};"
          >
            <h2>${safeName}</h2>
            <p>Boletín de demostración</p>
          </div>

          <!-- Texto comercial -->
          <div class="email-copy-text">
            ${formatSocialCopy(text, 'email')}
          </div>

          <!-- CTA decorativo -->
          <div class="email-cta-box">
            <button
              class="btn btn-primary"
              type="button"
              disabled
              style="margin:0 auto;display:inline-flex;"
            >
              Botón de ejemplo
            </button>
          </div>

          <!-- Pie de correo -->
          <div class="email-footer-legal">
            Ejemplo de correo preparado para
            la comunidad de ${safeName}.

            <br>

            © 2026 ${safeName}
            · Todos los derechos reservados.
          </div>

        </div>

      </div>
    `;
  }

  /* ========================================================
     12. PREVISUALIZACIÓN FACEBOOK
     ======================================================== */

  else {
    container.innerHTML = `
      <div class="fb-post-mockup">

        <!-- Encabezado -->
        <div class="fb-post-header">

          <div class="fb-author-row">

            <div class="fb-avatar">
              ${initial}
            </div>

            <div>
              <div class="fb-author-name">

                <span>${safeName}</span>

                <span
                  class="fb-verified-check"
                  aria-label="Diseño ilustrativo"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#2D88FF"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>

              </div>

              <div class="fb-timestamp-row">
                <span>Borrador</span>
                <span>·</span>
                <span>Vista previa</span>
                <span>·</span>
                <span>🌐</span>
              </div>

            </div>
          </div>

          <button
            class="fb-menu-dots"
            type="button"
            disabled
          >•••</button>

        </div>

        <!-- Texto de la publicación -->
        <div class="fb-post-content">
          ${formatSocialCopy(text, 'facebook')}
        </div>

        <!-- Banner ilustrativo -->
        <div
          class="fb-media-banner"
          style="background: ${safeGradient(
            profile.colorGradient,
            'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)'
          )}"
        >
          <div class="fb-banner-badge">
            PUBLICACIÓN DE MUESTRA · ${safeSector}
          </div>

          <h2 class="fb-banner-title">
            ${safeName}
          </h2>

          <p class="fb-banner-sub">
            Publicación preparada para revisar
          </p>
        </div>

        <!-- Estadísticas de ejemplo -->
        <div class="fb-stats-bar">

          <div class="fb-reactions-group">

            <span
              class="fb-reaction-icon"
              style="background:#1877F2;"
            >
              👍
            </span>

            <span
              class="fb-reaction-icon"
              style="background:#FA3E3E;"
            >
              ❤️
            </span>

            <span
              class="tabular-nums"
              style="margin-left:4px;font-weight:600;"
            >
              ${likesCount}
            </span>

          </div>

          <div class="fb-comments-share">
            <span>Comentarios de ejemplo</span>
            <span>·</span>
            <span>Compartidos de ejemplo</span>
          </div>

        </div>

        <!-- Acciones -->
        <div class="fb-actions-bar">

          <!-- Me gusta -->
          <button
            class="fb-action-btn ${isLiked ? 'liked' : ''}"
            type="button"
            data-preview-like="true"
            aria-label="Marcar me gusta en la demostración"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="${isLiked ? '#2D88FF' : 'none'}"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>

            <span style="${isLiked ? 'color:#2D88FF;' : ''}">
              ${isLiked ? 'Te gusta' : 'Me gusta'}
            </span>
          </button>

          <!-- Comentar decorativo -->
          <button
            class="fb-action-btn"
            type="button"
            disabled
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>

            <span>Comentar</span>
          </button>

          <!-- Compartir decorativo -->
          <button
            class="fb-action-btn"
            type="button"
            disabled
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>

              <line
                x1="8.59"
                y1="13.51"
                x2="15.42"
                y2="17.49"
              />

              <line
                x1="15.41"
                y1="6.51"
                x2="8.59"
                y2="10.49"
              />
            </svg>

            <span>Compartir</span>
          </button>

        </div>

      </div>
    `;
  }
}

/* ==========================================================
   13. INTERACCIÓN DE ME GUSTA
   ========================================================== */

/**
 * Me gusta solo afecta la maqueta local.
 * No se envían datos a redes sociales.
 */
export function toggleLike() {
  const state = store.getState();

  const liked = !Boolean(state.isLiked);

  const current = Number.isFinite(state.likesCount)
    ? Math.max(0, Math.trunc(state.likesCount))
    : 142;

  store.setState({
    isLiked: liked,
    likesCount: Math.max(
      0,
      current + (liked ? 1 : -1)
    )
  });

  // initPreviews actualiza automáticamente
  // la maqueta mediante subscribe().
  if (!initialized) {
    renderLivePreview();
  }
}
