import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';

export default class OnboardingController {
  constructor(container) {
    this.container = container;
    this.currentStep = 0;
    this.totalSteps = 4;
    this.form = this.container.querySelector('#onboarding-form');
    
    this.btnPrev = this.container.querySelector('#btn-prev');
    this.btnNext = this.container.querySelector('#btn-next');
    this.btnSubmit = this.container.querySelector('#btn-submit');
    this.stepSteps = this.container.querySelectorAll('.onboard-step');
    this.railSteps = this.container.querySelectorAll('.rail-step');

    this.bindEvents();
  }

  bindEvents() {
    this.btnNext.addEventListener('click', () => this.goNext());
    this.btnPrev.addEventListener('click', () => this.goPrev());
    
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveCompany();
    });
  }

  goNext() {
    // Validación nativa HTML5 antes de avanzar de paso
    if (!this.form.reportValidity()) return;

    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.updateUI();
    }
  }

  goPrev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateUI();
    }
  }

  updateUI() {
    // Mostrar solo el paso actual
    this.stepSteps.forEach((stepEl, index) => {
      stepEl.style.display = (index === this.currentStep) ? 'block' : 'none';
    });

    // Actualizar barra de progreso (Rail)
    this.railSteps.forEach((railEl, index) => {
      railEl.classList.toggle('active', index === this.currentStep);
      if (index < this.currentStep) railEl.classList.add('done');
      else railEl.classList.remove('done');
    });

    // Actualizar textos
    this.container.querySelector('#ui-step-number').textContent = this.currentStep + 1;

    // Lógica de botones
    this.btnPrev.style.display = (this.currentStep === 0) ? 'none' : 'block';
    
    if (this.currentStep === this.totalSteps - 1) {
      this.btnNext.style.display = 'none';
      this.btnSubmit.style.display = 'block';
    } else {
      this.btnNext.style.display = 'block';
      this.btnSubmit.style.display = 'none';
    }
  }

  async saveCompany() {
    try {
      this.btnSubmit.disabled = true;
      this.btnSubmit.textContent = 'Guardando...';

      // Capturar todos los datos del formulario
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());
      
      // Capturar checkboxes (canales) que Object.fromEntries ignora si hay varios
      const canalesChecks = this.form.querySelectorAll('input[name="canales[]"]:checked');
      data.canales = Array.from(canalesChecks).map(cb => cb.value).join(',');

      // Llamada al Backend
      const response = await ApiClient.request('/empresa', 'POST', data);
      
      if (response.status === 'success') {
        appRouter.navigate('/dashboard');
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      this.btnSubmit.disabled = false;
      this.btnSubmit.textContent = 'Finalizar configuración ✅';
    }
  }
}