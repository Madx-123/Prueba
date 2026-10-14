
/**
 * ==========================================================
 * CONTENTAI PYMES
 * Archivo: js/app.js
 *
 * Orquestador principal del frontend.
 *
 * Responsabilidades:
 * - Inicializar los módulos.
 * - Exponer la API window.ContentAI.
 * - Gestionar el acceso de demostración.
 * - Coordinar controles de interfaz.
 * - Mostrar notificaciones.
 *
 * No realiza autenticación real ni llamadas a un servidor.
 * ==========================================================
 */

import { store } from './store.js';

import {
  navigateTo,
  switchDashboardTab
} from './navigation.js';

import {
  initProfiles,
  handleOnboardingSubmit,
  loadDemoCompanyAutofill
} from './profiles.js';

import {
  handleGenerateSubmit
} from './generator.js';

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

import {
  initPreviews,
  toggleEditorMode,
  toggleLike,
  setPreviewChannel,
  setEditorFont,
  setEditorSize
} from './previews.js';


/* ==========================================================
   1. CONFIGURACIÓN
   ========================================================== */

const CHANNEL_TYPES = Object.freeze({
  Facebook: 'Post de Facebook',
  Instagram: 'Post de Instagram con Hashtags',
  TikTok: 'Video TikTok Promocional',
  WhatsApp: 'Mensaje Promocional WhatsApp',
  Email: 'Email Marketing'
});

let initialized = false;

const byId = (id) => document.getElementById(id);


/* ==========================================================
   2. NOTIFICACIONES
   ========================================================== */

/**
 * Muestra mensajes al usuario.
 * Utiliza textContent para evitar interpretar HTML externo.
 */
export function showToast(message, type = 'info') {
  const container = byId('toast-container');

  if (!container) return;

  const allowedTypes = [
    'success',
    'info',
    'warning',
    'error'
  ];

  const toastType = allowedTypes.includes(type)
    ? type
    : 'info';

  const toast = document.createElement('div');
  const icon = document.createElement('span');
  const text = document.createElement('span');

  toast.className =
    `toast toast-${toastType} animate-slide-up`;

  toast.setAttribute('role', 'status');

  icon.textContent =
    toastType === 'success'
      ? '✓'
      : toastType === 'error'
        ? '!'
        : 'ℹ';

  icon.style.cssText = `
    font-weight: 700;
    display: grid;
    place-items: center;
    min-width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(255, 255, 255, .15);
  `;

  text.textContent = String(message);

  toast.append(icon, text);
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition =
      'opacity .25s ease, transform .25s ease';

    window.setTimeout(() => {
      toast.remove();
    }, 280);
  }, 3600);
}


/* ==========================================================
   3. MODO DE AUTENTICACIÓN
   ========================================================== */

/**
 * Alterna entre iniciar sesión y crear cuenta.
 */
export function toggleAuthMode(mode) {
  if (mode !== 'login' && mode !== 'register') {
    return false;
  }

  const isRegister = mode === 'register';

  const loginTab = byId('tab-btn-login');
  const registerTab = byId('tab-btn-register');

  const nameGroup = byId('group-register-name');
  const nameInput = byId('auth-name');

  const passwordInput = byId('auth-password');
  const submitText = byId('auth-btn-text');

  // Pestañas visuales
  loginTab?.classList.toggle('active', !isRegister);
  registerTab?.classList.toggle('active', isRegister);

  loginTab?.setAttribute(
    'aria-pressed',
    String(!isRegister)
  );

  registerTab?.setAttribute(
    'aria-pressed',
    String(isRegister)
  );

  // Nombre obligatorio solamente en registro
  if (nameGroup) {
    nameGroup.style.display = isRegister
      ? 'block'
      : 'none';
  }

  if (nameInput) {
    nameInput.required = isRegister;
  }

  // Autocompletado apropiado para cada modo
  if (passwordInput) {
    passwordInput.setAttribute(
      'autocomplete',
      isRegister
        ? 'new-password'
        : 'current-password'
    );
  }

  // Texto del botón principal
  if (submitText) {
    submitText.textContent = isRegister
      ? 'Crear cuenta de demostración'
      : 'Ingresar a la Plataforma';
  }

  store.setState({
    authMode: mode
  });

  return true;
}


/* ==========================================================
   4. PROCESAMIENTO DEL LOGIN / REGISTRO
   ========================================================== */

/**
 * Acceso simulado.
 *
 * - Valida campos obligatorios.
 * - No comprueba contraseñas contra una base de datos.
 * - No almacena contraseñas.
 * - Trabaja con una empresa demo por navegador.
 */

export function handleAuthSubmit(event) {
  event?.preventDefault();

  const form = byId('auth-form');
  const emailInput = byId('auth-email');
  const passwordInput = byId('auth-password');
  const nameInput = byId('auth-name');

  if (!form || !emailInput || !passwordInput) {
    console.error(
      'ContentAI: faltan elementos del formulario de acceso.'
    );
    return false;
  }

  const state = store.getState();
  const isRegister = state.authMode === 'register';

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const name = nameInput?.value.trim() ?? '';

  // Validar los campos básicos.
  if (
    !email ||
    !emailInput.checkValidity() ||
    !password.trim()
  ) {
    showToast(
      'Escribe un correo válido y una contraseña.',
      'warning'
    );

    form.reportValidity?.();
    return false;
  }

  // El nombre solo es necesario al crear cuenta.
  if (isRegister && !name) {
    showToast(
      'Escribe tu nombre para crear una cuenta demo.',
      'warning'
    );

    nameInput?.focus();
    return false;
  }

  // FRONTEND ESTÁTICO:
  // El acceso es simulado y no verifica cuentas reales.
  // Los datos guardados pertenecen a este navegador.
  const sameEmail =
    state.user?.email?.toLowerCase() === email;

  const demoName = isRegister
    ? name
    : (
        sameEmail
          ? state.user.name
          : email.split('@')[0]
      );

  // Activar sesión de demostración.
  store.setState({
    user: {
      name: demoName || 'Usuario demo',
      email,
      isLoggedIn: true
    }
  });

  // Limpiar contraseña.
  passwordInput.value = '';

  // Decidir a qué pantalla ingresar.
  const nextView = store.getState().isCompanyRegistered
    ? 'view-dashboard'
    : 'view-onboarding';

  const navigated = navigateTo(
    nextView,
    'tab-generator'
  );

  if (!navigated) {
    showToast(
      'No se pudo abrir la siguiente pantalla.',
      'error'
    );
    return false;
  }

  showToast(
    isRegister
      ? 'Cuenta demo creada.'
      : 'Acceso demo correcto.',
    'success'
  );

  return true;
}



/* ==========================================================
   5. ABRIR DEMOSTRACIÓN
   ========================================================== */

/**
 * navigation.js decide si necesita mostrar
 * autenticación, onboarding o dashboard.
 */
export function openAppDemo() {
  return navigateTo(
    'view-dashboard',
    'tab-generator'
  );
}


/* ==========================================================
   6. CERRAR SESIÓN
   ========================================================== */

export function logout() {
  const state = store.getState();

  store.setState({
    user: {
      ...state.user,
      isLoggedIn: false
    }
  });

  const passwordInput = byId('auth-password');

  if (passwordInput) {
    passwordInput.value = '';
  }

  toggleDiscordPopup(false);
  toggleUserBubbleMenu(false);

  navigateTo('view-landing');

  showToast(
    'Has cerrado la sesión de demostración.',
    'info'
  );
}


/* ==========================================================
   7. MENÚS FLOTANTES DEL DASHBOARD
   ========================================================== */

export function toggleDiscordPopup(forceState = null) {
  const popup = byId('discord-settings-popup');

  if (!popup) return;

  const shouldOpen = typeof forceState === 'boolean'
    ? forceState
    : !popup.classList.contains('active');

  popup.classList.toggle(
    'active',
    shouldOpen
  );
}


export function toggleUserBubbleMenu(forceState = null) {
  const menu = byId('user-bubble-dropdown');
  const trigger = byId('user-bubble-trigger');

  if (!menu) return;

  const shouldOpen = typeof forceState === 'boolean'
    ? forceState
    : !menu.classList.contains('active');

  menu.classList.toggle(
    'active',
    shouldOpen
  );

  trigger?.classList.toggle(
    'active',
    shouldOpen
  );
}


/* ==========================================================
   8. SELECCIÓN DE CANALES EN ONBOARDING
   ========================================================== */

export function toggleTileClass(checkbox) {
  if (!checkbox) return;

  const tile = checkbox.closest('.channel-tile');

  tile?.classList.toggle(
    'checked',
    checkbox.checked
  );
}


/* ==========================================================
   9. CONTADOR DEL PROMPT
   ========================================================== */

export function updateTopicCharCount(
  textarea = byId('gen-campaign-topic')
) {
  if (!textarea) return;

  const count = byId('topic-char-count');

  if (count) {
    count.textContent =
      `${textarea.value.length} / 500 caracteres`;
  }
}


/* ==========================================================
   10. SUGERENCIAS DEL GENERADOR
   ========================================================== */

export function applySuggestion(text) {
  const textarea = byId('gen-campaign-topic');

  if (!textarea || typeof text !== 'string') {
    return;
  }

  textarea.value = text.slice(0, 500);

  textarea.focus();

  updateTopicCharCount(textarea);
}


/* ==========================================================
   11. SELECCIÓN DE RED SOCIAL
   ========================================================== */

export function selectChannel(channelName) {
  const contentType = CHANNEL_TYPES[channelName];

  if (!contentType) return;

  const field = byId('gen-content-type');

  if (field) {
    field.value = contentType;
  }

  // Sincronizar los botones del generador
  const buttons = document.querySelectorAll(
    '.creator-channel-btn'
  );

  buttons.forEach(button => {
    const selected =
      button.dataset.network === channelName;

    button.classList.toggle(
      'active',
      selected
    );

    button.setAttribute(
      'aria-pressed',
      String(selected)
    );
  });

  // Actualizar el previsualizador existente
  setPreviewChannel(channelName);
}


/* ==========================================================
   12. OBJETIVO COMERCIAL
   ========================================================== */

export function selectObjective(objectiveName) {
  if (
    typeof objectiveName !== 'string' ||
    !objectiveName.trim()
  ) {
    return;
  }

  const field = byId('gen-objective');

  if (field) {
    field.value = objectiveName;
  }

  const buttons = document.querySelectorAll(
    '.objective-chip-btn'
  );

  buttons.forEach(button => {
    const selected =
      button.dataset.objective === objectiveName;

    button.classList.toggle(
      'active',
      selected
    );

    button.setAttribute(
      'aria-pressed',
      String(selected)
    );
  });
}


/* ==========================================================
   13. COPIAR TEXTO DEL HISTORIAL
   ========================================================== */

export async function copyHistoryText(text) {
  const value = String(text ?? '');

  if (!value) return;

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API no disponible');
    }

    await navigator.clipboard.writeText(value);

    showToast(
      'Texto copiado al portapapeles.',
      'success'
    );

  } catch {
    // Alternativa para navegadores sin Clipboard API
    const temp = document.createElement('textarea');

    temp.value = value;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';

    document.body.appendChild(temp);

    temp.select();

    const copied =
      document.execCommand?.('copy') === true;

    temp.remove();

    showToast(
      copied
        ? 'Texto copiado al portapapeles.'
        : 'No se pudo copiar el texto.',
      copied ? 'success' : 'warning'
    );
  }
}


/* ==========================================================
   14. MENÚ RESPONSIVE DE LA LANDING
   ========================================================== */

function initLandingMenu() {
  const toggle = byId('cai-menu-toggle');
  const nav = byId('cai-nav');

  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);

    toggle.setAttribute(
      'aria-expanded',
      String(open)
    );

    toggle.setAttribute(
      'aria-label',
      open ? 'Cerrar menú' : 'Abrir menú'
    );
  }

  // Abrir y cerrar el menú
  toggle.addEventListener('click', () => {
    const isOpen =
      toggle.getAttribute('aria-expanded') === 'true';

    setOpen(!isOpen);
  });

  // Cerrar cuando se selecciona una sección
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      setOpen(false);
    }
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', event => {
    if (
      !toggle.contains(event.target) &&
      !nav.contains(event.target)
    ) {
      setOpen(false);
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  });
}


/* ==========================================================
   15. MOSTRAR / OCULTAR CONTRASEÑA
   ========================================================== */

function initAuthPasswordToggle() {
  const button = byId('cai-auth-password-toggle');
  const input = byId('auth-password');

  if (!button || !input) return;

  button.addEventListener('click', () => {
    const show = input.type === 'password';

    input.type = show
      ? 'text'
      : 'password';

    button.textContent = show
      ? 'Ocultar'
      : 'Mostrar';

    button.setAttribute(
      'aria-pressed',
      String(show)
    );

    button.setAttribute(
      'aria-label',
      show
        ? 'Ocultar contraseña'
        : 'Mostrar contraseña'
    );
  });
}


/* ==========================================================
   16. ANIMACIONES DE ENTRADA
   ========================================================== */

function initScrollReveals() {
  const targets = document.querySelectorAll(
    '[data-cai-reveal]'
  );

  if (!targets.length) return;

  // Respetar preferencias de accesibilidad
  const reducedMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)'
  )?.matches;

  if (
    !('IntersectionObserver' in window) ||
    reducedMotion
  ) {
    targets.forEach(element => {
      element.classList.add('cai-is-visible');
    });

    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add(
          'cai-is-visible'
        );

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12
    }
  );

  targets.forEach(element => {
    observer.observe(element);
  });
}


/* ==========================================================
   17. CIERRE DE MENÚS FLOTANTES
   ========================================================== */

function initFloatingMenus() {
  document.addEventListener('click', event => {
    const dock = byId('discord-user-dock');

    if (
      dock &&
      !dock.contains(event.target)
    ) {
      toggleDiscordPopup(false);
    }

    const bubble = byId('user-bubble-dock');

    if (
      bubble &&
      !bubble.contains(event.target)
    ) {
      toggleUserBubbleMenu(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    toggleDiscordPopup(false);
    toggleUserBubbleMenu(false);
  });
}


/* ==========================================================
   18. API PÚBLICA DEL FRONTEND
   ========================================================== */

/**
 * Las funciones se exponen para conservar la compatibilidad
 * con los atributos onclick del index.html actual.
 *
 * En una etapa posterior podremos migrar estos eventos
 * a addEventListener y separar los controladores.
 */

window.ContentAI = {

  // Navegación
  navigateTo,
  switchDashboardTab,

  // Autenticación
  toggleAuthMode,
  handleAuthSubmit,
  logout,

  // Empresa
  handleOnboardingSubmit,
  loadDemoCompanyAutofill,
  toggleTileClass,

  // Generador
  handleGenerateSubmit,
  selectChannel,
  selectObjective,
  applySuggestion,
  updateTopicCharCount,

  // Editor y revisión
  handleTextareaEdit,
  focusAndEditTextarea,
  copyToClipboard,
  regenerateVariant,
  discardCurrentContent,
  approveAndSaveContent,
  insertFormatting,

  // Historial
  loadHistoryToEditor,
  copyHistoryText,

  // Previsualizaciones
  toggleEditorMode,
  setPreviewChannel,
  setEditorFont,
  setEditorSize,
  toggleLike,

  // Interfaz
  openAppDemo,
  toggleUserBubbleMenu,
  toggleDiscordPopup
};


/* ==========================================================
   19. INICIALIZACIÓN DE LA APLICACIÓN
   ========================================================== */

function initApp() {

  // Evitar inicializaciones duplicadas
  if (initialized) return;

  initialized = true;

  // Inicializar módulos existentes
  initProfiles();
  initPreviews();
  initReview();

  // Inicializar controles visuales
  initLandingMenu();
  initAuthPasswordToggle();
  initFloatingMenus();
  initScrollReveals();

  // Configurar límite y contador del prompt
  const topic = byId('gen-campaign-topic');

  if (topic) {
    topic.maxLength = 500;
  }

  updateTopicCharCount(topic);

  // Establecer el modo inicial del formulario
  toggleAuthMode(
    store.getState().authMode
  );

  /**
   * Ya no inicializamos initLusionLanding().
   * Su motor de partículas pertenece al diseño anterior.
   */

  // Pantalla inicial
  navigateTo('view-landing');
}


/* ==========================================================
   20. ARRANQUE
   ========================================================== */

if (document.readyState === 'loading') {

  document.addEventListener(
    'DOMContentLoaded',
    initApp,
    { once: true }
  );

} else {

  initApp();

}
