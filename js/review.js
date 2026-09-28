/**
 * ContentAI - PYMES | Review & Approval Controller (Tab B)
 * Acciones de edición, guardado en historial, descarte y métricas en tiempo real
 */

import { store } from './store.js';
import { showToast } from './app.js';
import { switchDashboardTab } from './navigation.js';
import { renderLivePreview } from './previews.js';
import { craftAICommercialCopy } from './generator.js';

export function initReview() {
  updateReviewMetrics();
  renderApprovedHistory();

  store.subscribe(() => {
    updateReviewMetrics();
    renderApprovedHistory();
  });
}

export function updateReviewMetrics() {
  const textarea = document.getElementById('preview-generated-text');
  if (!textarea) return;

  const text = textarea.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const chars = text.length;

  const wordEl = document.getElementById('review-word-count');
  const charEl = document.getElementById('review-char-count');

  if (wordEl) wordEl.textContent = `${words} palabras`;
  if (charEl) charEl.textContent = `${chars} caracteres`;
}

export function handleTextareaEdit(textarea) {
  updateReviewMetrics();

  // Actualizar en store para mantener sincronizada la vista previa
  store.setState({
    currentGeneration: {
      ...store.getState().currentGeneration,
      generatedText: textarea.value
    }
  });

  const statusBadge = document.getElementById('edit-status-badge');
  if (statusBadge) {
    statusBadge.textContent = '✏️ Modificado manualmente';
    statusBadge.style.color = 'var(--primary)';
    statusBadge.style.background = 'var(--primary-light)';
  }
}

export function focusAndEditTextarea() {
  // Asegurar que estamos en modo editor
  const textarea = document.getElementById('preview-generated-text');
  if (textarea) {
    textarea.style.display = 'block';
    const previewContainer = document.getElementById('live-channel-preview-container');
    if (previewContainer) previewContainer.classList.remove('active');
    
    document.getElementById('btn-mode-editor')?.classList.add('active');
    document.getElementById('btn-mode-preview')?.classList.remove('active');

    textarea.focus();
    showToast('Modo de edición activado.', 'info');
  }
}

export function copyToClipboard() {
  const textarea = document.getElementById('preview-generated-text');
  if (!textarea || !textarea.value) return;

  navigator.clipboard.writeText(textarea.value).then(() => {
    showToast('📋 ¡Texto copiado al portapapeles!', 'success');
  }).catch(() => {
    textarea.select();
    document.execCommand('copy');
    showToast('📋 ¡Texto copiado!', 'success');
  });
}

export function regenerateVariant() {
  const gen = store.getState().currentGeneration;
  const newText = craftAICommercialCopy(
    gen.contentType,
    gen.objective,
    gen.topic + ' (Enfoque alternativo más directo y con llamada a la acción reforzada)'
  );

  store.setState({
    currentGeneration: {
      ...gen,
      generatedText: newText
    }
  });

  const textarea = document.getElementById('preview-generated-text');
  if (textarea) textarea.value = newText;

  updateReviewMetrics();
  renderLivePreview();
  showToast('🔄 Nueva variante generada por la IA.', 'info');
}

export function discardCurrentContent() {
  if (confirm('¿Deseas descartar este borrador? Se perderán las modificaciones no guardadas.')) {
    const textarea = document.getElementById('preview-generated-text');
    if (textarea) textarea.value = '';
    
    updateReviewMetrics();
    showToast('Borrador descartado. Regresando al generador.', 'info');
    switchDashboardTab('tab-generator');
  }
}

export function approveAndSaveContent() {
  const textarea = document.getElementById('preview-generated-text');
  const text = textarea ? textarea.value.trim() : '';

  if (!text) {
    showToast('No hay contenido para guardar.', 'info');
    return;
  }

  const state = store.getState();
  const profile = state.companyProfile;
  const currentGen = state.currentGeneration;

  const newItem = {
    id: Date.now(),
    date: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    company: profile.name,
    contentType: currentGen.contentType,
    tone: profile.tone.split('(')[0],
    text: text
  };

  const updatedHistory = [newItem, ...state.approvedHistory];

  store.setState({
    approvedHistory: updatedHistory
  });

  // Alerta de confirmación
  showToast('✅ ¡Contenido aprobado y guardado con éxito en el historial!', 'success');

  const statusBadge = document.getElementById('edit-status-badge');
  if (statusBadge) {
    statusBadge.textContent = '✅ Aprobado y Guardado';
    statusBadge.style.color = 'var(--success)';
    statusBadge.style.background = 'var(--success-light)';
  }
}

export function renderApprovedHistory() {
  const container = document.getElementById('history-items-container');
  const badge = document.getElementById('history-counter-badge');
  if (!container) return;

  const history = store.getState().approvedHistory;

  if (badge) {
    badge.textContent = `${history.length} Aprobado${history.length !== 1 ? 's' : ''}`;
  }

  if (history.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 28px; color: var(--text-muted); font-size: 0.9rem;">
        No hay contenidos aprobados aún. Genera y aprueba tu primer copy en el Tab A.
      </div>
    `;
    return;
  }

  container.innerHTML = history.map(item => `
    <div class="history-item-row">
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-weight: 700; font-size: 0.82rem; color: var(--primary);">${item.contentType}</span>
          <span style="color: var(--text-muted);">·</span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${item.company || 'PYME'}</span>
          <span style="color: var(--text-muted);">·</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${item.date}</span>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; white-space: pre-line; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(item.text)}
        </div>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary btn-sm" onclick="window.ContentAI.loadHistoryToEditor(${item.id})">
          Cargar
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.ContentAI.copyHistoryText('${escapeJs(item.text)}')">
          Copiar
        </button>
      </div>
    </div>
  `).join('');
}

export function loadHistoryToEditor(id) {
  const item = store.getState().approvedHistory.find(h => h.id === id);
  if (item) {
    const textarea = document.getElementById('preview-generated-text');
    if (textarea) {
      textarea.value = item.text;
      updateReviewMetrics();

      store.setState({
        currentGeneration: {
          ...store.getState().currentGeneration,
          contentType: item.contentType,
          generatedText: item.text
        }
      });

      renderLivePreview();
      showToast('Copia del historial cargada en el editor.', 'info');
      textarea.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

function escapeJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '');
}
