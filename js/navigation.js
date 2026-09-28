/**
 * ContentAI - PYMES | Navigation & View Router Module
 * Controla la visualización SPA mediante display: none / block y transiciones
 */

import { store } from './store.js';

export function navigateTo(viewId, targetTab = null) {
  const allViews = document.querySelectorAll('.view-section');
  allViews.forEach(view => {
    view.classList.remove('active');
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    store.setState({ currentView: viewId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Si entra al dashboard
  if (viewId === 'view-dashboard') {
    if (targetTab) {
      switchDashboardTab(targetTab);
    } else {
      switchDashboardTab(store.getState().activeDashboardTab);
    }
  }
}

export function switchDashboardTab(tabId) {
  store.setState({ activeDashboardTab: tabId });

  // Pestañas
  const allTabs = document.querySelectorAll('.dashboard-tab-pane');
  allTabs.forEach(pane => pane.classList.remove('active'));

  const targetPane = document.getElementById(tabId);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // Items del menú (tanto en Top Bar como si existen en Sidebar)
  const menuGenerator = document.getElementById('menu-tab-generator');
  const menuReview = document.getElementById('menu-tab-review');
  const topNavGenerator = document.getElementById('top-menu-generator');
  const topNavReview = document.getElementById('top-menu-review');
  const breadcrumbActive = document.getElementById('breadcrumb-active-label');

  if (tabId === 'tab-generator') {
    if (menuGenerator) menuGenerator.classList.add('active');
    if (menuReview) menuReview.classList.remove('active');
    if (topNavGenerator) topNavGenerator.classList.add('active');
    if (topNavReview) topNavReview.classList.remove('active');
    if (breadcrumbActive) breadcrumbActive.textContent = 'Generador de Copys IA';
  } else if (tabId === 'tab-review') {
    if (menuGenerator) menuGenerator.classList.remove('active');
    if (menuReview) menuReview.classList.add('active');
    if (topNavGenerator) topNavGenerator.classList.remove('active');
    if (topNavReview) topNavReview.classList.add('active');
    if (breadcrumbActive) breadcrumbActive.textContent = 'Revisión & Previsualización';
  }
}
