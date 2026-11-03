import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';
import { escapeHtml as h } from '../../core/utils.js';
import { notify } from '../../ui/toast.js';

export default class ProfileController {
  constructor(container) {
    this.container = container;
    this.companyData = null;
    this.userData = null;
    
    this.init();
    this.bindEvents();
  }

  async init() {
    try {
      // 1. Obtener datos del Usuario
      const sessionRes = await ApiClient.request('/session', 'GET');
      if (sessionRes.user) {
        this.userData = sessionRes.user;
        this.container.querySelector('#profile-user-name').textContent = this.userData.name;
        this.container.querySelector('#profile-user-email').textContent = this.userData.email || 'Cuenta verificada';
        
        // Si el usuario guardó un avatar previo
        if (this.userData.avatar) {
          const avContainer = this.container.querySelector('#user-avatar-preview');
          avContainer.innerHTML = `<img src="${h(this.userData.avatar)}" alt="Avatar de usuario" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
      }

      // 2. Obtener datos de la Empresa
      const empRes = await ApiClient.request('/empresa', 'GET');
      if (empRes.company) {
        this.companyData = empRes.company;
        this.renderCompanyData();
      } else {
        appRouter.navigate('/onboarding');
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
    }
  }

  renderCompanyData() {
    const c = this.companyData;
    
    this.container.querySelector('#profile-company-name').textContent = c.name;
    this.container.querySelector('#profile-company-sector').textContent = `${c.sector} ${c.city ? ' - ' + c.city : ''}`;
    
    // Si la empresa tiene logotipo cargado
    const markWrap = this.container.querySelector('#cover-initial-wrap');
    if (c.logo) {
      markWrap.innerHTML = `<img src="${h(c.logo)}" alt="Logotipo de la empresa" style="width:100%;height:100%;object-fit:cover;border-radius:18px;">`;
    } else {
      markWrap.innerHTML = `<span id="cover-initial">${c.name.charAt(0).toUpperCase()}</span>`;
    }
    
    this.container.querySelector('#profile-offer').textContent = c.offer;
    this.container.querySelector('#profile-city').textContent = c.city || 'No especificada';
    this.container.querySelector('#profile-diff').textContent = c.differentiator || 'No especificada';
    
    this.container.querySelector('#profile-audience').textContent = c.audience;
    this.container.querySelector('#profile-tone').textContent = c.tone;
    
    // Canales activos sin emojis
    const channelsHtml = (c.channels || []).map(ch => `<span class="channel-badge">${h(ch)}</span>`).join('');
    this.container.querySelector('#profile-channels').innerHTML = channelsHtml || '<small>Sin canales seleccionados</small>';
  }

  bindEvents() {
    // 1. Botón Editar Información -> Redirige al Onboarding
    this.container.querySelector('#btn-edit-company').addEventListener('click', () => {
      appRouter.navigate('/onboarding');
    });

    // 2. Carga de foto de perfil del usuario
    const avatarInput = this.container.querySelector('#input-user-avatar');
    avatarInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Img = event.target.result;
        const avContainer = this.container.querySelector('#user-avatar-preview');
        avContainer.innerHTML = `<img src="${h(base64Img)}" alt="Avatar de usuario" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        notify('Foto de perfil actualizada correctamente.', 'success');
      };
      reader.readAsDataURL(file);
    });

    // 3. Carga de logotipo de la marca
    const logoInput = this.container.querySelector('#input-company-logo');
    logoInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Img = event.target.result;
        this.companyData.logo = base64Img;
        const markWrap = this.container.querySelector('#cover-initial-wrap');
        markWrap.innerHTML = `<img src="${h(base64Img)}" alt="Logotipo de la empresa" style="width:100%;height:100%;object-fit:cover;border-radius:18px;">`;
        notify('Logotipo de marca actualizado correctamente.', 'success');
      };
      reader.readAsDataURL(file);
    });

    // 4. Botón Exportar JSON
    this.container.querySelector('#btn-export-data').addEventListener('click', async () => {
      try {
        const postsRes = await ApiClient.request('/posts', 'GET');
        
        const exportData = {
          usuario: this.userData,
          empresa: this.companyData,
          publicaciones: postsRes.posts || []
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        
        anchor.href = url;
        anchor.download = 'contentai-datos.json';
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        notify('Respaldo JSON descargado con éxito.', 'success');
      } catch (error) {
        notify("Error al exportar los datos.", 'error');
      }
    });
  }
}