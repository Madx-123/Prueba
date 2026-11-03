
import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';
import { notify } from '../../ui/toast.js';
import { icon } from '../../ui/icons.js';

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


    // =====================================================
    // 1. MOSTRAR / OCULTAR CONTRASEÑA
    // =====================================================

    this.container.querySelectorAll('[data-password-toggle]').forEach(button => {

      button.addEventListener('click', () => {

        const inputId = button.dataset.passwordToggle;
        const passwordInput = this.container.querySelector(`#${inputId}`);

        if (!passwordInput) return;

        const isVisible = passwordInput.type === 'text';

        passwordInput.type = isVisible ? 'password' : 'text';

        button.innerHTML = icon(isVisible ? 'eye' : 'eyeoff', 18);

        button.setAttribute(
          'aria-label',
          isVisible ? 'Mostrar contraseña' : 'Ocultar contraseña'
        );

        button.setAttribute(
          'aria-pressed',
          String(!isVisible)
        );

      });

    });


    // =====================================================
    // 2. NAVEGACIÓN ENTRE LOGIN Y REGISTRO
    // =====================================================

    if (btnGoRegister) {

      btnGoRegister.addEventListener('click', () => {
        appRouter.navigate('/registro');
      });

    }

    if (btnGoLogin) {

      btnGoLogin.addEventListener('click', () => {
        appRouter.navigate('/login');
      });

    }

    if (btnBackHome) {

      btnBackHome.addEventListener('click', () => {
        appRouter.navigate('/');
      });

    }


    // =====================================================
    // 3. INICIO DE SESIÓN
    // =====================================================

    if (loginForm) {

      loginForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const email = this.container
          .querySelector('#auth-email')
          .value.trim();

        const password = this.container
          .querySelector('#auth-password')
          .value;

        const btnSubmit = this.container
          .querySelector('#btn-submit');


        // Validación existente
        if (!email || !password) {

          notify(
            'Por favor, completa tu correo y contraseña.',
            'error'
          );

          return;
        }


        try {

          // Estado visual de carga
          this.setButtonLoading(
            btnSubmit,
            true,
            'Verificando tus datos...'
          );


          // Conexión original con PHP
          const response = await ApiClient.login(email, password);


          if (response.status === 'success') {

            notify(
              `¡Bienvenido de nuevo, ${response.user.name.split(' ')[0]}!`,
              'success'
            );


            // Verificar si el usuario tiene una empresa registrada
            const empRes = await ApiClient.getCompany();


            if (empRes.company) {

              appRouter.navigate('/dashboard');

            } else {

              appRouter.navigate('/onboarding');

            }

          }

        } catch (error) {

          notify(
            error.message || 'Error al iniciar sesión.',
            'error'
          );

        } finally {

          this.setButtonLoading(
            btnSubmit,
            false,
            'Entrar a mi espacio'
          );

        }

      });

    }


    // =====================================================
    // 4. REGISTRO DE CUENTA
    // =====================================================

    if (registerForm) {

      registerForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const name = this.container
          .querySelector('#reg-name')
          .value.trim();

        const email = this.container
          .querySelector('#reg-email')
          .value.trim();

        const password = this.container
          .querySelector('#reg-password')
          .value;

        const btnSubmit = this.container
          .querySelector('#btn-submit-reg');


        // Validación del nombre
        if (name.length < 2) {

          notify(
            'Ingresa tu nombre completo (mínimo 2 caracteres).',
            'error'
          );

          return;
        }


        // Validación del correo
        if (!email) {

          notify(
            'Ingresa un correo electrónico válido.',
            'error'
          );

          return;
        }


        // Validación de contraseña
        if (password.length < 6) {

          notify(
            'La contraseña debe tener al menos 6 caracteres.',
            'error'
          );

          return;
        }


        try {

          // Estado visual de carga
          this.setButtonLoading(
            btnSubmit,
            true,
            'Creando tu cuenta...'
          );


          // Conexión original con PHP
          const response = await ApiClient.register(
            name,
            email,
            password
          );


          if (response.status === 'success') {

            notify(
              '¡Cuenta creada con éxito! Configuremos tu negocio.',
              'success'
            );

            // Mantener redirección original
            appRouter.navigate('/onboarding');

          }

        } catch (error) {

          notify(
            error.message || 'No se pudo completar el registro.',
            'error'
          );

        } finally {

          this.setButtonLoading(
            btnSubmit,
            false,
            'Crear mi cuenta'
          );

        }

      });

    }

  }


  // =====================================================
  // 5. ESTADOS VISUALES DE LOS BOTONES
  // =====================================================

  setButtonLoading(button, loading, text) {

    if (!button) return;

    const label = button.querySelector('.auth-submit-label');

    button.disabled = loading;

    button.classList.toggle('is-loading', loading);

    button.setAttribute(
      'aria-busy',
      String(loading)
    );

    if (label) {
      label.textContent = text;
    }

    // Indicador de carga sin sustituir la estructura del botón
    const existingSpinner = button.querySelector('.auth-spinner');

    if (loading && !existingSpinner) {

      const spinner = document.createElement('span');

      spinner.className = 'auth-spinner';

      spinner.setAttribute('aria-hidden', 'true');

      button.appendChild(spinner);

    }

    if (!loading && existingSpinner) {
      existingSpinner.remove();
    }

  }

}
