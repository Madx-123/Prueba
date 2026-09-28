/**
 * ContentAI - PYMES | Main Orchestrator & Initialization Module
 * Expone la API pública window.ContentAI y coordina los módulos de la aplicación
 * Carga de forma modular las vistas HTML desde /src/views/*.html
 */

import { store } from './store.js';
import { navigateTo, switchDashboardTab } from './navigation.js';
import { initProfiles, handleOnboardingSubmit, loadDemoCompanyAutofill } from './profiles.js';
import { handleGenerateSubmit } from './generator.js';
import { 
  initReview, 
  handleTextareaEdit, 
  focusAndEditTextarea, 
  copyToClipboard, 
  regenerateVariant, 
  discardCurrentContent, 
  approveAndSaveContent,
  loadHistoryToEditor 
} from './review.js';
import { initPreviews, toggleEditorMode, toggleLike } from './previews.js';

// Sistema de Notificaciones Toast
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-up`;

  const icon = type === 'success' ? '✓' : 'ℹ';
  toast.innerHTML = `
    <span style="font-weight: 700; background: rgba(255,255,255,0.2); width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">
      ${icon}
    </span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Control del Formulario de Autenticación
export function toggleAuthMode(mode) {
  const tabLogin = document.getElementById('tab-btn-login');
  const tabRegister = document.getElementById('tab-btn-register');
  const nameGroup = document.getElementById('group-register-name');
  const submitText = document.getElementById('auth-btn-text');

  if (mode === 'login') {
    tabLogin?.classList.add('active');
    tabRegister?.classList.remove('active');
    if (nameGroup) nameGroup.style.display = 'none';
    if (submitText) submitText.textContent = 'Ingresar a la Plataforma';
  } else {
    tabLogin?.classList.remove('active');
    tabRegister?.classList.add('active');
    if (nameGroup) nameGroup.style.display = 'block';
    if (submitText) submitText.textContent = 'Crear Cuenta PYME y Continuar';
  }
}

// Envío de Autenticación con Enrutamiento Inteligente
export function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('auth-email')?.value || 'gerencia@lacumbre.com';
  
  store.setState({
    user: {
      ...store.getState().user,
      email: email,
      isLoggedIn: true
    }
  });

  showToast(`¡Bienvenido! Sesión iniciada como ${email}`, 'success');

  // Si el usuario ya tiene su empresa registrada, entra directo al Dashboard.
  // Si no, va al Onboarding para registrar su única empresa.
  setTimeout(() => {
    if (store.getState().isCompanyRegistered) {
      navigateTo('view-dashboard', 'tab-generator');
    } else {
      navigateTo('view-onboarding');
    }
  }, 350);
}

// Abre el entorno de trabajo directamente desde la Landing
export function openAppDemo() {
  if (store.getState().isCompanyRegistered) {
    navigateTo('view-dashboard', 'tab-generator');
  } else {
    navigateTo('view-onboarding');
  }
}

// Cierre de Sesión
export function logout() {
  store.setState({
    user: {
      ...store.getState().user,
      isLoggedIn: false
    }
  });
  showToast('Has cerrado sesión correctamente.', 'info');
  navigateTo('view-landing');
}

export function toggleTileClass(checkbox) {
  const parent = checkbox.closest('.channel-tile');
  if (parent) {
    parent.classList.toggle('checked', checkbox.checked);
  }
}

export function applySuggestion(text) {
  const textarea = document.getElementById('gen-campaign-topic');
  if (textarea) {
    textarea.value = text;
    textarea.focus();
    updateTopicCharCount(textarea);
  }
}

export function updateTopicCharCount(textarea) {
  const countEl = document.getElementById('topic-char-count');
  if (countEl) {
    countEl.textContent = `${textarea.value.length} / 500 caracteres`;
  }
}

// Exponer en window.ContentAI para accesibilidad directa desde handlers de HTML
window.ContentAI = {
  navigateTo,
  switchDashboardTab,
  toggleAuthMode,
  handleAuthSubmit,
  handleOnboardingSubmit,
  loadDemoCompanyAutofill,
  handleGenerateSubmit,
  handleTextareaEdit,
  focusAndEditTextarea,
  copyToClipboard,
  regenerateVariant,
  discardCurrentContent,
  approveAndSaveContent,
  loadHistoryToEditor,
  copyHistoryText: (text) => {
    navigator.clipboard.writeText(text).then(() => showToast('📋 Copiado al portapapeles.', 'success'));
  },
  toggleEditorMode,
  toggleLike,
  toggleTileClass,
  applySuggestion,
  updateTopicCharCount,
  openAppDemo,
  logout
};

// Inicialización de la aplicación: Setup de Controladores para Live Server y Vite
function initApp() {
  // 1. Inicializar controladores de perfiles, vistas previas y revisiones
  initProfiles();
  initPreviews();
  initReview();

  // 2. Establecer la vista inicial activa
  navigateTo('view-landing');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
