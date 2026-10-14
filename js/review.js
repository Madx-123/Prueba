
/**
 * ContentAI PYMES | Edición, aprobación e historial
 *
 * Este módulo conserva los nombres utilizados por app.js e index.html.
 * Los borradores y la UI usan store.js; el guardado se realiza por api.js.
 * En el modo demo, api.js persiste en store.js; Laravel reemplazará su implementación.
 */

import { store } from './store.js';
import { api } from './services/api.js';
import { showToast } from './app.js';
import { switchDashboardTab } from './navigation.js';
import { renderLivePreview, toggleEditorMode } from './previews.js';
import { craftAICommercialCopy } from './generator.js';

const byId = (id) => document.getElementById(id);

let initialized = false;
let previewFrame = null;
let saving = false;

/* ==========================================================
   1. INICIALIZACIÓN Y SINCRONIZACIÓN
   ========================================================== */

export function initReview() {
  if (initialized) return;
  initialized = true;

  const editor = byId('preview-generated-text');
  const draft = store.getState().currentGeneration?.generatedText;

  if (editor && typeof draft === 'string') {
    editor.value = draft;
  }

  updateReviewMetrics();
  renderApprovedHistory();

  let previousHistory = store.getState().approvedHistory;
  let previousGeneration = store.getState().currentGeneration;

  store.subscribe((state) => {
    if (state.approvedHistory !== previousHistory) {
      previousHistory = state.approvedHistory;
      renderApprovedHistory();
    }

    if (state.currentGeneration !== previousGeneration) {
      previousGeneration = state.currentGeneration;
      updateReviewMetrics();
    }
  });
}

export function updateReviewMetrics() {
  const value = byId('preview-generated-text')?.value ?? '';
  const trimmed = value.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  const chars = value.length;

  const wordCounter = byId('review-word-count');
  const charCounter = byId('review-char-count');

  if (wordCounter) wordCounter.textContent = `${words} palabras`;
  if (charCounter) charCounter.textContent = `${chars} caracteres`;
}

function setEditStatus(message, approved = false) {
  const badge = byId('edit-status-badge');
  if (!badge) return;

  badge.textContent = message;
  badge.style.color = approved ? 'var(--success)' : 'var(--primary)';
  badge.style.background = approved ? 'var(--success-light)' : '';
}

/** Muestra un estado vacío sin inventar contenido de ejemplo. */
function showEmptyPreview() {
  const container = byId('live-channel-preview-container');
  if (!container) return;
  const message = document.createElement('p');
  message.textContent = 'Sin contenido para previsualizar. Genera un nuevo borrador.';
  message.style.cssText = 'padding:28px;text-align:center;color:var(--text-muted)';
  container.replaceChildren(message);
}

/** Limita a un render por fotograma mientras se escribe. */
function schedulePreview() {
  if (previewFrame !== null) return;

  if (typeof window.requestAnimationFrame !== 'function') {
    renderLivePreview();
    return;
  }

  previewFrame = window.requestAnimationFrame(() => {
    previewFrame = null;
    renderLivePreview();
  });
}

export function handleTextareaEdit(textarea) {
  const editor = textarea ?? byId('preview-generated-text');
  if (!editor) return;

  const current = store.getState().currentGeneration ?? {};
  const text = editor.value;

  updateReviewMetrics();

  if (current.generatedText !== text) {
    store.setState({
      currentGeneration: { ...current, generatedText: text }
    });
  }

  setEditStatus('Borrador modificado');

  if (!text.trim()) {
    if (previewFrame !== null && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(previewFrame);
      previewFrame = null;
    }
    showEmptyPreview();
  } else {
    schedulePreview();
  }
}

/* ==========================================================
   2. HERRAMIENTAS DEL EDITOR
   ========================================================== */

export function insertFormatting(type) {
  const editor = byId('preview-generated-text');
  if (!editor) return;

  if (type === 'clear') {
    if (!editor.value) return;
    if (!window.confirm('¿Limpiar el texto del editor?')) return;

    editor.value = '';
    handleTextareaEdit(editor);
    editor.focus();
    return;
  }

  const start = editor.selectionStart ?? 0;
  const end = editor.selectionEnd ?? start;
  const selected = editor.value.slice(start, end);
  let replacement;
  let offset;

  switch (type) {
    case 'bold':
      replacement = `**${selected || 'texto destacado'}**`;
      offset = selected ? replacement.length : 2;
      break;
    case 'italic':
      replacement = `_${selected || 'texto en cursiva'}_`;
      offset = selected ? replacement.length : 1;
      break;
    case 'hashtag':
      replacement = selected
        ? `#${selected.replace(/\s+/gu, '')}`
        : '#MiNegocio';
      offset = replacement.length;
      break;
    case 'bullet':
      replacement = `\n• ${selected || 'Escribe un punto importante'}`;
      offset = replacement.length;
      break;
    case 'emoji':
      replacement = '✨ ';
      offset = replacement.length;
      break;
    default:
      return;
  }

  const oldText = editor.value;
  editor.value = oldText.slice(0, start) + replacement + oldText.slice(end);

  const cursor = start + offset;
  editor.setSelectionRange(cursor, cursor);
  editor.focus();
  handleTextareaEdit(editor);
}

export function focusAndEditTextarea() {
  const editor = byId('preview-generated-text');
  if (!editor) return;

  toggleEditorMode('editor');
  editor.focus();
}

/** Copia el texto; ofrece alternativa para navegadores sin Clipboard API. */
async function copyText(text) {
  if (!text) {
    showToast('No hay texto para copiar.', 'info');
    return false;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error('Clipboard API no disponible');
    }
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    helper.remove();

    if (!copied) {
      showToast('No se pudo copiar. Selecciona el texto manualmente.', 'warning');
      return false;
    }
  }

  showToast('Texto copiado al portapapeles.', 'success');
  return true;
}

export function copyToClipboard() {
  return copyText(byId('preview-generated-text')?.value ?? '');
}

/* ==========================================================
   3. GENERAR VARIANTE Y DESCARTAR BORRADOR
   ========================================================== */

export function regenerateVariant() {
  const state = store.getState();
  const current = state.currentGeneration ?? {};

  if (!state.user?.isLoggedIn || !state.isCompanyRegistered) {
    showToast('Inicia sesión y registra tu empresa para continuar.', 'warning');
    return false;
  }

  if (!String(current.topic ?? '').trim()) {
    showToast('Primero describe una campaña y genera un borrador.', 'warning');
    return false;
  }

  const alternativeTopic = `${current.topic} (Enfoque alternativo más directo y con llamada a la acción reforzada)`;
  const generatedText = craftAICommercialCopy(
    current.contentType,
    current.objective,
    alternativeTopic
  );

  if (!generatedText) {
    showToast('No se pudo crear la variante.', 'warning');
    return false;
  }

  const editor = byId('preview-generated-text');
  if (editor) editor.value = generatedText;

  store.setState({
    currentGeneration: { ...current, generatedText }
  });

  updateReviewMetrics();
  renderLivePreview();
  setEditStatus('Variante de demostración generada');
  showToast('Variante de demostración lista para revisar.', 'success');
  return true;
}

export function discardCurrentContent() {
  const editor = byId('preview-generated-text');
  const current = store.getState().currentGeneration ?? {};
  const hasDraft = Boolean((editor?.value ?? current.generatedText ?? '').trim());

  if (!hasDraft) {
    showToast('No hay un borrador para descartar.', 'info');
    return false;
  }

  if (!window.confirm('¿Descartar este borrador? Los cambios no guardados se perderán.')) {
    return false;
  }

  if (editor) editor.value = '';

  store.setState({
    currentGeneration: { ...current, generatedText: '' }
  });

  updateReviewMetrics();
  setEditStatus('Sin borrador');

  // La previsualización del paso 7 respeta el borrador vacío.
  if (previewFrame !== null && typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(previewFrame);
    previewFrame = null;
  }
  showEmptyPreview();

  switchDashboardTab('tab-generator');
  showToast('Borrador descartado.', 'info');
  return true;
}

/* ==========================================================
   4. APROBAR Y GUARDAR MEDIANTE services/api.js
   ========================================================== */

/**
 * Aprueba el texto actualmente visible en el editor.
 * No crea IDs, fechas ni modifica el historial directamente:
 * todas esas responsabilidades corresponden al servicio API.
 */
export async function approveAndSaveContent() {
  // Evita dos solicitudes simultáneas incluso si llaman a la función por JS.
  if (saving) return false;

  const state = store.getState();
  const editor = byId('preview-generated-text');
  const text = String(editor?.value ?? '').trim();

  if (!state.user?.isLoggedIn || !state.isCompanyRegistered) {
    showToast('Inicia sesión y registra tu empresa para continuar.', 'warning');
    return false;
  }

  if (!text) {
    showToast('No hay contenido para aprobar.', 'warning');
    editor?.focus();
    return false;
  }

  const draft = state.currentGeneration ?? {};
  const request = {
    contentType: String(draft.contentType || 'Post de Facebook'),
    objective: String(draft.objective || ''),
    topic: String(draft.topic || ''),
    text
  };

  // Previene un segundo guardado inmediato del mismo borrador.
  const history = Array.isArray(state.approvedHistory)
    ? state.approvedHistory
    : [];
  const newest = history[0];
  const savedAt = Date.parse(newest?.createdAt ?? '');
  const recentlySaved = Number.isFinite(savedAt) &&
    Date.now() - savedAt >= 0 && Date.now() - savedAt < 5000;
  const sameCompany = newest?.companyId === state.companyProfile?.id;

  if (
    newest && recentlySaved && sameCompany &&
    newest.contentType === request.contentType &&
    newest.text === request.text
  ) {
    showToast('Este contenido acaba de guardarse.', 'info');
    return false;
  }

  const button = document.querySelector(
    '#view-dashboard button[onclick*="approveAndSaveContent"]'
  );
  const wasDisabled = button?.disabled ?? false;

  saving = true;
  if (button) {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  }
  setEditStatus('Guardando publicación...');

  try {
    // En modo demo, api.saveContent() guarda en store.js.
    // En Laravel, el mismo método enviará la solicitud HTTP.
    const saved = await api.saveContent(request);

    if (!saved || saved.id == null) {
      throw new Error('El servicio no confirmó el guardado.');
    }

    // La API actualiza approvedHistory; el suscriptor renderiza la lista.
    setEditStatus('Contenido aprobado y guardado', true);
    showToast('Contenido aprobado y guardado en el historial.', 'success');
    return true;

  } catch (error) {
    console.error('ContentAI: no se pudo guardar el contenido.', error);
    const message = error?.status === 422
      ? error.message
      : error?.status === 401
        ? 'Tu sesión no está activa. Inicia sesión nuevamente.'
        : 'No se pudo guardar la publicación. Inténtalo nuevamente.';
    setEditStatus('Error al guardar el borrador');
    showToast(message, 'error');
    return false;

  } finally {
    saving = false;
    if (button) {
      button.disabled = wasDisabled;
      button.removeAttribute('aria-busy');
    }
  }
}

/* ==========================================================
   5. HISTORIAL SEGURO (SIN HTML DINÁMICO NI ONCLICK EN TEXTO)
   ========================================================== */

function makeElement(tag, className = '', text = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = String(text ?? '');
  return el;
}

function historyRow(item) {
  const row = makeElement('article', 'history-item-row');
  row.style.flexWrap = 'wrap';

  const information = makeElement('div', 'history-item-main');
  information.style.flex = '1 1 260px';
  information.style.minWidth = '0';

  const metadata = makeElement('div', 'history-item-meta');
  metadata.style.cssText = 'font-size:.78rem;color:var(--text-muted);margin-bottom:8px;overflow-wrap:anywhere';

  const type = makeElement('strong', '', item.contentType || 'Publicación');
  type.style.color = 'var(--primary)';
  const details = makeElement('span', '',
    ` · ${item.company || 'Mi empresa'} · ${item.date || 'Sin fecha'}`
  );
  metadata.append(type, details);

  const content = makeElement('p', 'history-item-text', item.text || '');
  content.style.cssText =
    'margin:0;color:var(--text-secondary);font-size:.88rem;line-height:1.5;' +
    'white-space:pre-line;overflow-wrap:anywhere;display:-webkit-box;' +
    '-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden';

  information.append(metadata, content);

  const actions = makeElement('div', 'history-item-actions');
  actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';

  const loadButton = makeElement('button', 'btn btn-secondary btn-sm', 'Cargar');
  loadButton.type = 'button';
  loadButton.setAttribute('aria-label', 'Cargar publicación en el editor');
  loadButton.addEventListener('click', () => loadHistoryToEditor(item.id));

  const copyButton = makeElement('button', 'btn btn-secondary btn-sm', 'Copiar');
  copyButton.type = 'button';
  copyButton.setAttribute('aria-label', 'Copiar publicación');
  copyButton.addEventListener('click', () => copyText(String(item.text ?? '')));

  actions.append(loadButton, copyButton);
  row.append(information, actions);
  return row;
}

export function renderApprovedHistory() {
  const container = byId('history-items-container');
  const badge = byId('history-counter-badge');
  if (!container) return;

  const history = Array.isArray(store.getState().approvedHistory)
    ? store.getState().approvedHistory
    : [];

  if (badge) {
    badge.textContent = `${history.length} Aprobado${history.length === 1 ? '' : 's'}`;
  }

  if (history.length === 0) {
    const empty = makeElement(
      'p', 'history-empty',
      'Todavía no hay publicaciones aprobadas. Crea un borrador y pulsa «Aprobar y Guardar».'
    );
    empty.style.cssText =
      'padding:30px 16px;text-align:center;color:var(--text-muted);font-size:.9rem';
    container.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const item of history) {
    if (item && typeof item === 'object') {
      fragment.appendChild(historyRow(item));
    }
  }
  container.replaceChildren(fragment);
}

/* ==========================================================
   6. RECUPERAR UNA PUBLICACIÓN
   ========================================================== */

function networkForType(type) {
  const text = String(type ?? '').toLowerCase();
  if (text.includes('instagram')) return 'Instagram';
  if (text.includes('tiktok')) return 'TikTok';
  if (text.includes('whatsapp')) return 'WhatsApp';
  if (text.includes('email')) return 'Email';
  return 'Facebook';
}

export function loadHistoryToEditor(id) {
  const history = store.getState().approvedHistory ?? [];
  const item = history.find((record) => String(record.id) === String(id));

  if (!item) {
    showToast('No se encontró la publicación.', 'warning');
    return false;
  }

  const editor = byId('preview-generated-text');
  if (!editor) return false;

  editor.value = String(item.text ?? '');

  const current = store.getState().currentGeneration ?? {};
  const contentType = String(item.contentType ?? current.contentType ?? 'Post de Facebook');
  const objective = String(item.objective ?? current.objective ?? '');
  const network = networkForType(contentType);

  store.setState({
    currentGeneration: {
      ...current,
      contentType,
      objective,
      topic: String(item.topic ?? current.topic ?? ''),
      generatedText: editor.value,
      previewNetwork: network
    }
  });

  const typeField = byId('gen-content-type');
  if (typeField) typeField.value = contentType;
  const objectiveField = byId('gen-objective');
  if (objectiveField) objectiveField.value = objective;
  const topicField = byId('gen-campaign-topic');
  if (topicField && item.topic) topicField.value = item.topic;

  document.querySelectorAll('.creator-channel-btn, .preview-network-pill')
    .forEach((button) => {
      button.classList.toggle('active', button.dataset.network === network);
    });
  document.querySelectorAll('.objective-chip-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.objective === objective);
  });

  updateReviewMetrics();
  renderLivePreview();
  setEditStatus('Copia del historial cargada en el editor');
  switchDashboardTab('tab-generator');
  editor.focus({ preventScroll: true });
  editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast('Publicación cargada para editar una copia.', 'info');
  return true;
}
