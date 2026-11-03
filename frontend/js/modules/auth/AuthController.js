import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';
import { notify } from '../../ui/toast.js';

export default class AuthController {
  constructor(container) {
    this.container = container;
    this.bindEvents();
  }

  bindEvents() {
    const loginForm = this.container.querySelector('#login-form');
    const registerForm = this.container.querySelector('#register-form');
    const btnGoRegister = this.container.querySelector('#btn-go-register');
    const btnGoLogin = this.container.querySelector('#btn-go-login');
    const btnBackHome = this.container.querySelector('#btn-back-home');

    // Navegación entre pantallas de acceso
    if (btnGoRegister) {
      btnGoRegister.addEventListener('click', () => appRouter.navigate('/registro'));
    }

    if (btnGoLogin) {
      btnGoLogin.addEventListener('click', () => appRouter.navigate('/login'));
    }

    if (btnBackHome) {
      btnBackHome.addEventListener('click', () => appRouter.navigate('/'));
    }

    // 1. Lógica de Inicio de Sesión
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = this.container.querySelector('#auth-email').value.trim();
        const password = this.container.querySelector('#auth-password').value;
        const btnSubmit = this.container.querySelector('#btn-submit');

        if (!email || !password) {
          notify('Por favor, completa tu correo y contraseña.', 'error');
          return;
        }

        try {
          btnSubmit.disabled = true;
          btnSubmit.textContent = 'Verificando...';

          const response = await ApiClient.login(email, password);
          
          if (response.status === 'success') {
            notify(`¡Bienvenido de nuevo, ${response.user.name.split(' ')[0]}!`, 'success');
            
            // Verificar si ya tiene empresa registrada o debe ir al Onboarding
            const empRes = await ApiClient.getCompany();
            if (empRes.company) {
              appRouter.navigate('/dashboard');
            } else {
              appRouter.navigate('/onboarding');
            }
          }
        } catch (error) {
          notify(error.message || 'Error al iniciar sesión.', 'error');
        } finally {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Entrar a mi espacio ➔';
        }
      });
    }

    // 2. Lógica de Registro de Cuenta
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = this.container.querySelector('#reg-name').value.trim();
        const email = this.container.querySelector('#reg-email').value.trim();
        const password = this.container.querySelector('#reg-password').value;
        const btnSubmit = this.container.querySelector('#btn-submit-reg');

        if (name.length < 2) {
          notify('Ingresa tu nombre completo (mínimo 2 caracteres).', 'error');
          return;
        }
        if (!email) {
          notify('Ingresa un correo electrónico válido.', 'error');
          return;
        }
        if (password.length < 6) {
          notify('La contraseña debe tener al menos 6 caracteres.', 'error');
          return;
        }

        try {
          btnSubmit.disabled = true;
          btnSubmit.textContent = 'Creando cuenta...';

          const response = await ApiClient.register(name, email, password);

          if (response.status === 'success') {
            notify('¡Cuenta creada con éxito! Configuremos tu negocio.', 'success');
            appRouter.navigate('/onboarding');
          }
        } catch (error) {
          notify(error.message || 'No se pudo completar el registro.', 'error');
        } finally {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Crear mi cuenta ➔';
        }
      });
    }
  }
}