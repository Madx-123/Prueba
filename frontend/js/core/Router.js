import { ApiClient } from './ApiClient.js';

const PRIVATE_ROUTES = new Set(['/onboarding', '/dashboard', '/crear', '/biblioteca', '/perfil']);

export class Router {
  constructor(routes) {
    this.routes = routes;
    this.appContainer = document.getElementById('app');
    this.navigationId = 0;
    window.addEventListener('hashchange', () => this.loadRoute());
  }

  async loadRoute() {
    const navigationId = ++this.navigationId;
    let path = window.location.hash.slice(1) || '/';
    if (!this.routes[path]) {
      this.navigate('/');
      return;
    }

    try {
      if (PRIVATE_ROUTES.has(path)) {
        const session = await ApiClient.request('/session');
        if (navigationId !== this.navigationId) return;
        if (!session.user) {
          this.navigate('/login');
          return;
        }
        // Un usuario sin empresa debe terminar la configuración primero.
        if (path !== '/onboarding') {
          const company = await ApiClient.getCompany();
          if (navigationId !== this.navigationId) return;
          if (!company.company) {
            this.navigate('/onboarding');
            return;
          }
        }
      }

      const route = this.routes[path];
      let targetContainer = this.appContainer;
      let layoutHtml = null;
      if (route.requiresLayout && !document.getElementById('module-content')) {
        const layoutRes = await fetch('./js/modules/layout/layout.html', { cache: 'no-store' });
        if (!layoutRes.ok) throw new Error('No se encontró layout.html');
        layoutHtml = await layoutRes.text();
      }
      const response = await fetch(route.template, { cache: 'no-store' });
      if (!response.ok) throw new Error(`No se encontró la vista: ${route.template}`);
      const html = await response.text();
      if (navigationId !== this.navigationId) return;

      if (route.requiresLayout) {
        if (layoutHtml !== null) {
          this.appContainer.innerHTML = layoutHtml;
          const { default: LayoutController } = await import('../modules/layout/LayoutController.js');
          if (navigationId !== this.navigationId) return;
          new LayoutController(this.appContainer);
        }
        targetContainer = document.getElementById('module-content');
      } else {
        this.appContainer.innerHTML = '';
      }
      targetContainer.innerHTML = html;

      if (route.controller) {
        const { default: Controller } = await import(route.controller);
        if (navigationId !== this.navigationId) return;
        new Controller(targetContainer);
      }
    } catch (error) {
      if (navigationId !== this.navigationId) return;
      console.error('Error de navegación:', error);
      this.appContainer.innerHTML = '<main style="padding:2rem"><h2>No se pudo abrir la página</h2><p id="router-error"></p><a href="#/">Volver al inicio</a></main>';
      this.appContainer.querySelector('#router-error').textContent = error.message;
    }
  }

  navigate(path) {
    if (window.location.hash === `#${path}`) this.loadRoute();
    else window.location.hash = path;
  }
}
