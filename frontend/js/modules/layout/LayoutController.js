import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';

export default class LayoutController {
  constructor(container) {
    this.container = container;
    this.bindEvents();
    this.loadUserData();
  }

  async loadUserData() {
    try {
      // 1. Cargar nombre de usuario
      const session = await ApiClient.request('/session', 'GET');
      if (session.user) {
        this.container.querySelector('#layout-user-name').textContent = session.user.name.split(' ')[0];
      }
      
      // 2. Cargar nombre de la empresa para la cabecera
      const empRes = await ApiClient.request('/empresa', 'GET');
      if (empRes.company) {
        this.container.querySelector('#layout-company-name').textContent = empRes.company.name;
      }
    } catch (e) {
      console.error("Error cargando datos del layout", e);
    }
  }

  bindEvents() {
    // Manejar menú móvil
    const sidebar = this.container.querySelector('#app-sidebar');
    const backdrop = this.container.querySelector('#sidebar-backdrop');
    
    this.container.querySelector('#btn-mobile-menu')?.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      backdrop.classList.add('show');
    });

    const closeSidebar = () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('show');
    };
    
    this.container.querySelector('#btn-close-sidebar')?.addEventListener('click', closeSidebar);
    backdrop?.addEventListener('click', closeSidebar);

    // Navegar al perfil
    this.container.querySelector('#btn-header-profile')?.addEventListener('click', () => {
      appRouter.navigate('/perfil');
    });

    // Cerrar sesión
    this.container.querySelector('#btn-logout')?.addEventListener('click', async () => {
      if (confirm('¿Seguro que deseas cerrar sesión?')) {
        try {
          await ApiClient.request('/logout', 'POST');
          appRouter.navigate('/login');
        } catch (error) {
          alert("Error cerrando sesión");
        }
      }
    });
  }
}