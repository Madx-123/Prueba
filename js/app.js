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
  loadHistoryToEditor,
  insertFormatting
} from './review.js';
import { initPreviews, toggleEditorMode, toggleLike, setPreviewChannel, setEditorFont, setEditorSize } from './previews.js';
import { initLusionLanding } from './lusion-engine.js';

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

// Control del Menú Flotante de Usuario (Burbuja Abajo a la Derecha)
export function toggleUserBubbleMenu(forceState = null) {
  const menu = document.getElementById('user-bubble-dropdown');
  const trigger = document.getElementById('user-bubble-trigger');
  if (!menu) return;

  const isOpen = menu.classList.contains('active');
  const shouldOpen = forceState !== null ? forceState : !isOpen;

  if (shouldOpen) {
    menu.classList.add('active');
    if (trigger) trigger.classList.add('active');
  } else {
    menu.classList.remove('active');
    if (trigger) trigger.classList.remove('active');
  }
}

// Control del Menú Flotante de Usuario estilo Discord (Esquina Inferior Izquierda)
export function toggleDiscordPopup(forceState = null) {
  const popup = document.getElementById('discord-settings-popup');
  if (!popup) return;

  const isOpen = popup.classList.contains('active');
  const shouldOpen = forceState !== null ? forceState : !isOpen;

  if (shouldOpen) {
    popup.classList.add('active');
  } else {
    popup.classList.remove('active');
  }
}

// Cierra popups flotantes si se hace click fuera
document.addEventListener('click', (e) => {
  const discordDock = document.getElementById('discord-user-dock');
  if (discordDock && !discordDock.contains(e.target)) {
    toggleDiscordPopup(false);
  }
  const bubbleContainer = document.getElementById('user-bubble-dock');
  if (bubbleContainer && !bubbleContainer.contains(e.target)) {
    toggleUserBubbleMenu(false);
  }
});

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

export function selectChannel(channelName) {
  let fullType = 'Post de Facebook';
  if (channelName === 'Instagram') fullType = 'Post de Instagram con Hashtags';
  else if (channelName === 'TikTok') fullType = 'Video TikTok Promocional';
  else if (channelName === 'WhatsApp') fullType = 'Mensaje Promocional WhatsApp';
  else if (channelName === 'Email') fullType = 'Email Marketing';

  const selectOrInput = document.getElementById('gen-content-type');
  if (selectOrInput) selectOrInput.value = fullType;

  // Actualizar botones de canal en el creador
  const creatorBtns = document.querySelectorAll('.creator-channel-btn');
  creatorBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-network') === channelName);
  });

  // Sincronizar con el previsualizador en vivo
  setPreviewChannel(channelName);
}

export function selectObjective(objectiveName) {
  const input = document.getElementById('gen-objective');
  if (input) input.value = objectiveName;

  const chips = document.querySelectorAll('.objective-chip-btn');
  chips.forEach(chip => {
    chip.classList.toggle('active', chip.getAttribute('data-objective') === objectiveName);
  });
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
  insertFormatting,
  selectChannel,
  selectObjective,
  copyHistoryText: (text) => {
    navigator.clipboard.writeText(text).then(() => showToast('📋 Copiado al portapapeles.', 'success'));
  },
  toggleEditorMode,
  setPreviewChannel,
  setEditorFont,
  setEditorSize,
  toggleLike,
  toggleTileClass,
  applySuggestion,
  updateTopicCharCount,
  openAppDemo,
  toggleUserBubbleMenu,
  toggleDiscordPopup,
  logout: () => {
    store.setState({
      user: {
        ...store.getState().user,
        isLoggedIn: false
      }
    });
    toggleUserBubbleMenu(false);
    toggleDiscordPopup(false);
    showToast('Has cerrado sesión correctamente.', 'info');
    navigateTo('view-landing');
  }
};

// Inicialización de la aplicación: Setup de Controladores para Live Server y Vite
function initApp() {
  // 1. Inicializar controladores de perfiles, vistas previas y revisiones
  initProfiles();
  initPreviews();
  initReview();
  initLusionLanding();

  // 2. Establecer la vista inicial activa
  navigateTo('view-landing');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
