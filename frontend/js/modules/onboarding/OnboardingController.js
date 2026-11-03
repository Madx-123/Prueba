import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';

export default class OnboardingController {
  constructor(container) {
    this.container = container;
    this.currentStep = 0;
    this.totalSteps = 4;
    this.isEditing = false;
    this.form = container.querySelector('#onboarding-form');
    this.btnPrev = container.querySelector('#btn-prev');
    this.btnNext = container.querySelector('#btn-next');
    this.btnSubmit = container.querySelector('#btn-submit');
    this.stepSteps = container.querySelectorAll('.onboard-step');
    this.railSteps = container.querySelectorAll('.rail-step');
    this.bindEvents();
    this.loadExistingCompany();
  }

  async loadExistingCompany() {
    try {
      const response = await ApiClient.getCompany();
      if (!response.company) return;
      this.isEditing = true;
      const company = response.company;
      const mapping = {
        nombre: company.name, sector: company.sector, ciudad: company.city,
        productos: company.offer, clientes: company.audience,
        diferencia: company.differentiator, tono: company.tone
      };
      for (const [name, value] of Object.entries(mapping)) {
        const input = this.form.elements.namedItem(name);
        if (input) input.value = value || '';
      }
      const channels = new Set(company.channels || []);
      this.form.querySelectorAll('input[name="canales[]"]').forEach(input => {
        input.checked = channels.has(input.value);
      });
    } catch (error) {
      console.error('No se pudo cargar la empresa:', error);
    }
  }

  bindEvents() {
    this.btnNext.addEventListener('click', () => this.goNext());
    this.btnPrev.addEventListener('click', () => this.goPrev());
    this.railSteps.forEach((button, index) => {
      button.addEventListener('click', () => {
        if (index < this.currentStep || (index === this.currentStep + 1 && this.validateStep())) {
          this.currentStep = index;
          this.updateUI();
        }
      });
    });
    this.form.addEventListener('submit', async event => {
      event.preventDefault();
      // Revisar todos los pasos y no depender de controles ocultos.
      for (let step = 0; step < this.totalSteps - 1; step++) {
        if (!this.validateStep(step)) {
          this.currentStep = step;
          this.updateUI();
          return;
        }
      }
      await this.saveCompany();
    });
  }

  validateStep(index = this.currentStep) {
    const step = this.stepSteps[index];
    for (const control of step.querySelectorAll('input[required], select[required], textarea[required]')) {
      if (!control.checkValidity()) {
        // Si está oculto, primero hacerlo visible para que el navegador pueda enfocarlo.
        this.currentStep = index;
        this.updateUI();
        control.reportValidity();
        return false;
      }
    }
    if (index === 2 && !step.querySelector('input[name="canales[]"]:checked')) {
      this.currentStep = index;
      this.updateUI();
      alert('Selecciona al menos un canal para continuar.');
      return false;
    }
    return true;
  }

  goNext() {
    if (!this.validateStep()) return;
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
    this.stepSteps.forEach((step, index) => {
      step.style.display = index === this.currentStep ? 'block' : 'none';
    });
    this.railSteps.forEach((rail, index) => {
      rail.classList.toggle('active', index === this.currentStep);
      rail.classList.toggle('done', index < this.currentStep);
    });
    this.container.querySelector('#ui-step-number').textContent = this.currentStep + 1;
    this.btnPrev.style.display = this.currentStep === 0 ? 'none' : 'block';
    this.btnNext.style.display = this.currentStep === this.totalSteps - 1 ? 'none' : 'block';
    this.btnSubmit.style.display = this.currentStep === this.totalSteps - 1 ? 'block' : 'none';
  }

  async saveCompany() {
    try {
      this.btnSubmit.disabled = true;
      this.btnSubmit.textContent = 'Guardando...';
      const data = Object.fromEntries(new FormData(this.form).entries());
      data.canales = Array.from(this.form.querySelectorAll('input[name="canales[]"]:checked'))
        .map(input => input.value).join(',');
      await ApiClient.request('/empresa', 'POST', data);
      appRouter.navigate(this.isEditing ? '/perfil' : '/dashboard');
    } catch (error) {
      alert(`No se pudo guardar la empresa: ${error.message}`);
    } finally {
      this.btnSubmit.disabled = false;
      this.btnSubmit.textContent = 'Finalizar configuración ✅';
    }
  }
}
