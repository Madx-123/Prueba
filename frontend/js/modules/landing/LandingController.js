import { appRouter } from '../../app.js';

export default class LandingController {
  constructor(container) {
    this.container = container;
    this.bindEvents();
  }

  bindEvents() {
    const btnLogin = this.container.querySelector('#btn-login');
    const btnRegister = this.container.querySelector('#btn-register');
    const btnHeroRegister = this.container.querySelector('#btn-hero-register');
    const btnDemo = this.container.querySelector('#btn-demo');

    if (btnLogin) {
      btnLogin.addEventListener('click', () => {
        appRouter.navigate('/login');
      });
    }

    if (btnRegister) {
      btnRegister.addEventListener('click', () => {
        appRouter.navigate('/registro');
      });
    }

    if (btnHeroRegister) {
      btnHeroRegister.addEventListener('click', () => {
        appRouter.navigate('/registro');
      });
    }

    if (btnDemo) {
      btnDemo.addEventListener('click', async () => {
        // Aquí conectaremos la API para iniciar la sesión demo
        // const user = await ApiClient.demoLogin();
        console.log("Iniciando sesión de demostración...");
        appRouter.navigate('/dashboard');
      });
    }
  }
}