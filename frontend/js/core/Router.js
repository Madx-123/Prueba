export class Router {
  constructor(routes) {
    this.routes = routes;
    this.appContainer = document.getElementById('app');
    
    window.addEventListener('hashchange', () => this.loadRoute());
  }

  async loadRoute() {
    let path = window.location.hash.slice(1) || '/';
    const route = this.routes[path];
    if (!route) return;

    try {
      let targetContainer = this.appContainer;

      // Si la ruta requiere el Layout Principal (Dashboard, Biblioteca, Creador)
      if (route.requiresLayout) {
        // Verificamos si el layout ya está en pantalla para no redibujarlo
        let moduleContent = document.getElementById('module-content');
        
        if (!moduleContent) {
          // 1. Descargamos e inyectamos el Layout primero
          const layoutRes = await fetch('./js/modules/layout/layout.html');
          this.appContainer.innerHTML = await layoutRes.text();
          
          // 2. Iniciamos el Controlador del Layout
          const { default: LayoutController } = await import('../modules/layout/LayoutController.js');
          new LayoutController(this.appContainer);

          // 3. Actualizamos el contenedor destino al centro del layout
          targetContainer = document.getElementById('module-content');
        } else {
          // Si el layout ya estaba, solo inyectamos en el centro
          targetContainer = moduleContent;
        }
      } else {
        // Si no requiere layout (Landing, Login, Onboarding), limpiamos todo el app container
        this.appContainer.innerHTML = ''; 
        targetContainer = this.appContainer;
      }

      // Descargamos e inyectamos la vista del módulo
      const response = await fetch(route.template);
      targetContainer.innerHTML = await response.text();

      // Ejecutamos su controlador
      if (route.controller) {
        const { default: Controller } = await import(route.controller);
        new Controller(targetContainer);
      }
    } catch (error) {
      console.error("Error en el Router:", error);
    }
  }

  navigate(path) {
    window.location.hash = path;
  }
}