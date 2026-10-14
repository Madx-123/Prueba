
/**
 * ContentAI PYMES | Navegación de vistas y pestañas
 *
 * Este módulo solo se encarga de navegar y de mostrar/ocultar vistas.
 * No procesa formularios, no autentica usuarios y no guarda publicaciones.
 *
 * Compatible con las funciones usadas en app.js, profiles.js y review.js.
 */

import { store } from './store.js';

const VIEWS = new Set([
  'view-landing',
  'view-auth',
  'view-onboarding',
  'view-dashboard'
]);

const DASHBOARD_TABS = new Set([
  'tab-generator',
  'tab-review'
]);

const TAB_CONTROLS = Object.freeze({
  'tab-generator': ['top-menu-generator', 'menu-tab-generator'],
  'tab-review': ['top-menu-review', 'menu-tab-review']
});

const TAB_TITLES = Object.freeze({
  'tab-generator': 'Espacio de trabajo',
  'tab-review': 'Historial de contenidos'
});

/**
 * Actualiza la pestaña visible y los botones del dashboard.
 */
function renderDashboardTab(tabId) {
  const dashboard = document.getElementById('view-dashboard');
  const selectedPane = document.getElementById(tabId);

  if (!dashboard || !selectedPane || !dashboard.contains(selectedPane)) {
    return false;
  }

  dashboard.querySelectorAll('.dashboard-tab-pane').forEach(pane => {
    const selected = pane.id === tabId;

    pane.classList.toggle('active', selected);
    pane.hidden = !selected;
    pane.setAttribute('aria-hidden', String(!selected));
  });

  for (const [id, controlIds] of Object.entries(TAB_CONTROLS)) {
    for (const controlId of controlIds) {
      const control = document.getElementById(controlId);

      if (!control) continue;

      const selected = id === tabId;

      control.classList.toggle('active', selected);
      control.setAttribute('aria-pressed', String(selected));
    }
  }

  const breadcrumb = document.getElementById('breadcrumb-active-label');

  if (breadcrumb) {
    breadcrumb.textContent = TAB_TITLES[tabId];
  }

  return true;
}

/**
 * Cierra los menús flotantes al cambiar de pantalla.
 */
function closeFloatingMenus() {
  document.getElementById('discord-settings-popup')
    ?.classList.remove('active');

  document.getElementById('user-bubble-dropdown')
    ?.classList.remove('active');

  document.getElementById('user-bubble-trigger')
    ?.classList.remove('active');

  document.getElementById('cai-nav')
    ?.classList.remove('is-open');

  const mobileMenu = document.getElementById('cai-menu-toggle');

  if (mobileMenu) {
    mobileMenu.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-label', 'Abrir menú');
  }
}

/**
 * Cambia de pantalla dentro de la SPA.
 *
 * El control de acceso es solo para la demostración.
 * Laravel implementará la autorización real en el servidor.
 */
export function navigateTo(viewId, targetTab = null) {

  // 1. Verificar que la pantalla solicitada sea válida.
  if (!VIEWS.has(viewId)) {
    console.warn(
      `ContentAI: vista desconocida: ${String(viewId)}`
    );
    return false;
  }

  const state = store.getState();
  let nextView = viewId;

  // 2. Comprobar el estado de la sesión de demostración.
  if (
    nextView === 'view-onboarding' ||
    nextView === 'view-dashboard'
  ) {

    if (!state.user?.isLoggedIn) {
      nextView = 'view-auth';

    } else if (
      nextView === 'view-dashboard' &&
      !state.isCompanyRegistered
    ) {
      nextView = 'view-onboarding';
    }
  }

  // 3. Comprobar que exista la vista antes de ocultar las demás.
  const target = document.getElementById(nextView);

  if (
    !target ||
    !target.classList.contains('view-section')
  ) {
    console.warn(
      `ContentAI: la vista ${nextView} no existe en index.html.`
    );
    return false;
  }

  // 4. Determinar la pestaña del dashboard.
  const preferredTab = targetTab ?? state.activeDashboardTab;

  const selectedTab = DASHBOARD_TABS.has(preferredTab)
    ? preferredTab
    : 'tab-generator';

  // 5. Sincronizar el estado visual de las pestañas.
  if (!renderDashboardTab(selectedTab)) {
    console.warn(
      'ContentAI: no se encontraron las pestañas del dashboard.'
    );
  }

  // 6. Mostrar solamente la pantalla seleccionada.
  document.querySelectorAll('.view-section').forEach(view => {
    const selected = view === target;

    view.classList.toggle('active', selected);
    view.setAttribute('aria-hidden', String(!selected));
  });

  // 7. Cerrar los menús que pudieran quedar abiertos.
  closeFloatingMenus();

  // 8. Actualizar el estado centralizado.
  if (nextView === 'view-dashboard') {
    store.setState({
      currentView: nextView,
      activeDashboardTab: selectedTab
    });

  } else {
    store.setState({
      currentView: nextView
    });
  }

  // 9. Regresar al inicio de la pantalla.
  window.scrollTo({
    top: 0,
    behavior: 'auto'
  });

  return true;
}

/**
 * Cambia únicamente entre las pestañas del dashboard.
 *
 * No modifica la pantalla actual.
 */
export function switchDashboardTab(tabId) {

  // 1. Validar la pestaña solicitada.
  if (!DASHBOARD_TABS.has(tabId)) {
    console.warn(
      `ContentAI: pestaña desconocida: ${String(tabId)}`
    );
    return false;
  }

  // 2. Mostrar la pestaña correspondiente.
  if (!renderDashboardTab(tabId)) {
    console.warn(
      `ContentAI: no se encontró la pestaña ${tabId}.`
    );
    return false;
  }

  // 3. Sincronizar el estado.
  store.setState({
    activeDashboardTab: tabId
  });

  return true;
}
