
/**
 * ContentAI PYMES | Perfil empresarial
 * Ruta: js/profiles.js
 *
 * Responsabilidades:
 * - Leer y validar el formulario de empresa.
 * - Registrar o actualizar mediante services/api.js.
 * - Mostrar la información empresarial en la interfaz.
 * - Recuperar los datos guardados al volver al onboarding.
 *
 * No realiza peticiones HTTP directamente ni usa localStorage.
 * La API funciona en modo demo y después podrá conectarse a Laravel.
 */

import { store } from './store.js';
import { api } from './services/api.js';
import { getDemoCompany } from '../data/demoData.js';
import { navigateTo } from './navigation.js';
import { showToast } from './app.js';

const byId = (id) => document.getElementById(id);

const FIELDS = Object.freeze({
  name: 'company-name',
  sector: 'company-sector',
  audience: 'company-audience',
  tone: 'company-tone'
});

const LIMITS = Object.freeze({
  name: 120,
  sector: 150,
  audience: 1000,
  tone: 120
});

let initialized = false;
let submitting = false;

/* ==========================================================
   1. ELEMENTOS Y CANALES DEL FORMULARIO
   ========================================================== */

function setText(id, value) {
  const element = byId(id);
  if (element) element.textContent = String(value ?? '');
}

function syncChannelTiles(form) {
  form.querySelectorAll('input[name="channels"]').forEach((checkbox) => {
    checkbox.closest('.channel-tile')?.classList.toggle(
      'checked', checkbox.checked
    );
  });
}

function fillCompanyForm(company) {
  const form = byId('onboarding-form');
  if (!form || !company) return;

  for (const [property, id] of Object.entries(FIELDS)) {
    const input = byId(id);
    if (input && typeof company[property] === 'string') {
      input.value = company[property];
    }
  }

  const selected = new Set(
    Array.isArray(company.channels) ? company.channels : []
  );

  form.querySelectorAll('input[name="channels"]').forEach((checkbox) => {
    checkbox.checked = selected.has(checkbox.value);
  });

  syncChannelTiles(form);
}

/* ==========================================================
   2. TEXTOS DEL ONBOARDING Y PERFIL VISIBLE
   ========================================================== */

function renderFormMode(isRegistered) {
  const heading = document.querySelector(
    '#view-onboarding .onboarding-title'
  );

  const buttonText = document.querySelector(
    '#onboarding-form button[type="submit"] span'
  );

  if (heading) {
    heading.textContent = isRegistered
      ? 'Actualiza los datos de tu empresa'
      : 'Registra tu Empresa en la Plataforma';
  }

  if (buttonText) {
    buttonText.textContent = isRegistered
      ? 'Guardar cambios de empresa'
      : 'Registrar Empresa y Abrir Dashboard';
  }
}

/**
 * Actualiza los datos empresariales mostrados
 * en los elementos existentes del index.html.
 */
export function renderProfileUI() {
  const {
    user,
    companyProfile,
    isCompanyRegistered
  } = store.getState();

  const company = companyProfile || {};

  const name = String(company.name || 'Tu empresa');
  const sector = String(company.sector || 'Sin sector');

  const userName = String(
    user?.name || 'Administrador PYME'
  );

  const email = String(user?.email || '');

  const initial =
    userName.trim().charAt(0).toUpperCase() || 'U';

  // Landing Page
  setText('landing-hero-company-name', name);
  setText('landing-hero-company-sector', sector);

  // Dashboard
  setText('topbar-brand-name', name);

  setText(
    'generator-header-company-note',
    `Vinculado a: ${name}`
  );

  // Barra inferior del dashboard
  setText('discord-user-avatar', initial);
  setText('discord-user-name', userName);

  // Este elemento muestra el nombre comercial
  // en el diseño original.
  setText('discord-user-email', name);

  // Ventana de configuración
  setText('discord-popup-avatar', initial);
  setText('discord-popup-name', userName);
  setText('discord-popup-email', email);

  setText('discord-company-name', name);
  setText('discord-company-sector', sector);

  // Cambiar modo registro / edición
  renderFormMode(isCompanyRegistered);
}

/* ==========================================================
   3. INICIALIZACIÓN Y SINCRONIZACIÓN
   ========================================================== */

export function initProfiles() {
  if (initialized) return;

  initialized = true;

  const initial = store.getState();

  let previousProfile = initial.companyProfile;
  let previousUser = initial.user;
  let previousRegistered = initial.isCompanyRegistered;
  let previousView = initial.currentView;

  renderProfileUI();

  // Recuperar empresa si ya estaba registrada
  if (initial.isCompanyRegistered) {
    fillCompanyForm(initial.companyProfile);
  }

  /**
   * Escuchar cambios del estado central.
   *
   * No actualizamos el formulario cuando el usuario
   * está escribiendo, solo cuando vuelve a abrirlo.
   */
  store.subscribe((state) => {
    const profileChanged =
      state.companyProfile !== previousProfile;

    const userChanged =
      state.user !== previousUser;

    const registrationChanged =
      state.isCompanyRegistered !== previousRegistered;

    const enteredOnboarding =
      state.currentView === 'view-onboarding' &&
      previousView !== 'view-onboarding';

    if (
      profileChanged ||
      userChanged ||
      registrationChanged
    ) {
      renderProfileUI();
    }

    if (
      enteredOnboarding &&
      state.isCompanyRegistered
    ) {
      fillCompanyForm(state.companyProfile);
    }

    previousProfile = state.companyProfile;
    previousUser = state.user;
    previousRegistered = state.isCompanyRegistered;
    previousView = state.currentView;
  });
}

/* ==========================================================
   4. AUTOCOMPLETAR DATOS DE DEMOSTRACIÓN
   ========================================================== */

/**
 * Obtiene los datos desde data/demoData.js.
 *
 * No registra la empresa automáticamente.
 * Solo rellena los controles del formulario.
 */
export function loadDemoCompanyAutofill() {
  const form = byId('onboarding-form');

  if (!form) return;

  form.reset();

  fillCompanyForm(
    getDemoCompany()
  );

  showToast(
    'Datos de prueba cargados. Pulsa Guardar para confirmar los cambios.',
    'info'
  );
}

/* ==========================================================
   5. VALIDAR DATOS EMPRESARIALES
   ========================================================== */

/**
 * Lee los campos originales del formulario.
 *
 * Devuelve un objeto preparado para enviarlo
 * a nuestro servicio api.js.
 */
function readCompanyForm(form) {
  const company = {};

  // Validar nombre, sector, audiencia y tono
  for (const [property, id] of Object.entries(FIELDS)) {
    const input = byId(id);

    if (!input) {
      throw new Error(
        `No se encontró el campo ${id}.`
      );
    }

    const value = input.value.trim();

    if (
      !value ||
      !input.checkValidity()
    ) {
      input.focus();

      form.reportValidity?.();

      throw new Error(
        'Completa los campos obligatorios de la empresa.'
      );
    }

    // Validar longitud máxima
    if (value.length > LIMITS[property]) {
      input.focus();

      throw new Error(
        `El campo ${property} supera el límite de ${LIMITS[property]} caracteres.`
      );
    }

    company[property] = value;
  }

  // Obtener canales seleccionados
  const channels = [
    ...form.querySelectorAll(
      'input[name="channels"]:checked'
    )
  ]
    .map((input) => input.value.trim())
    .filter(Boolean);

  // Debe existir al menos un canal
  if (channels.length === 0) {
    form.querySelector(
      'input[name="channels"]'
    )?.focus();

    throw new Error(
      'Selecciona al menos un canal de comunicación.'
    );
  }

  // Eliminar canales duplicados
  company.channels = [
    ...new Set(channels)
  ];

  return company;
}

/* ==========================================================
   6. REGISTRAR O ACTUALIZAR MEDIANTE LA API
   ========================================================== */

/**
 * Procesa el formulario empresarial.
 *
 * Si la empresa no existe:
 *   api.saveCompany()
 *
 * Si la empresa ya existe:
 *   api.updateCompany()
 *
 * Conservamos este nombre porque index.html
 * utiliza handleOnboardingSubmit(event).
 */
export async function handleOnboardingSubmit(event) {
  event?.preventDefault();

  const form = byId('onboarding-form');

  // No procesar si falta el formulario
  // o ya existe un envío en curso.
  if (!form || submitting) {
    return false;
  }

  // Validar sesión de demostración
  if (!store.getState().user?.isLoggedIn) {
    showToast(
      'Inicia sesión para continuar.',
      'warning'
    );

    navigateTo('view-auth');

    return false;
  }

  let companyData;

  // Leer y validar formulario
  try {
    companyData = readCompanyForm(form);

  } catch (error) {
    showToast(
      error.message,
      'warning'
    );

    return false;
  }

  // Determinar registro o actualización
  const wasRegistered =
    store.getState().isCompanyRegistered;

  const button = form.querySelector(
    'button[type="submit"]'
  );

  const wasDisabled =
    button?.disabled ?? false;

  // Bloquear doble envío
  submitting = true;

  if (button) {
    button.disabled = true;

    button.setAttribute(
      'aria-busy',
      'true'
    );
  }

  try {
    let company;

    /* ======================================================
       7. CONEXIÓN CON EL SERVICIO
       ====================================================== */

    if (wasRegistered) {
      // Actualizar empresa existente
      company = await api.updateCompany(
        companyData
      );

    } else {
      // Registrar nueva empresa
      company = await api.saveCompany(
        companyData
      );
    }

    /* ======================================================
       8. CONFIRMACIÓN DEL RESULTADO
       ====================================================== */

    showToast(
      wasRegistered
        ? 'Los datos de tu empresa se actualizaron correctamente.'
        : `Empresa "${company.name}" registrada correctamente.`,
      'success'
    );

    // Abrir el dashboard
    navigateTo(
      'view-dashboard',
      'tab-generator'
    );

    return true;

  } catch (error) {

    /* ======================================================
       9. MANEJO DE ERRORES DEL SERVICIO
       ====================================================== */

    showToast(
      error?.message ||
        'No se pudo guardar la empresa. Inténtalo nuevamente.',
      'error'
    );

    // Si la futura API indica sesión inválida
    if (error?.status === 401) {
      navigateTo('view-auth');
    }

    return false;

  } finally {

    /* ======================================================
       10. RESTABLECER EL BOTÓN
       ====================================================== */

    submitting = false;

    if (button) {
      button.disabled = wasDisabled;

      button.removeAttribute(
        'aria-busy'
      );
    }
  }
}
