import { appRouter } from '../../app.js';
import { ApiClient } from '../../core/ApiClient.js';

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
        this.container.querySelector('#profile-user-email').textContent = this.userData.email || 'Oculto por seguridad';
      }

      // 2. Obtener datos de la Empresa
      const empRes = await ApiClient.request('/empresa', 'GET');
      if (empRes.company) {
        this.companyData = empRes.company;
        this.renderCompanyData();
      } else {
        // Si no hay empresa, lo mandamos a crearla
        appRouter.navigate('/onboarding');
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
    }
  }

  renderCompanyData() {
    const c = this.companyData;
    
    this.container.querySelector('#profile-company-name').textContent = c.name;
    this.container.querySelector('#cover-initial').textContent = c.name.charAt(0).toUpperCase();
    this.container.querySelector('#profile-company-sector').textContent = `${c.sector} ${c.city ? ' - ' + c.city : ''}`;
    
    this.container.querySelector('#profile-offer').textContent = c.offer;
    this.container.querySelector('#profile-city').textContent = c.city || 'No especificada';
    this.container.querySelector('#profile-diff').textContent = c.differentiator || 'No especificada';
    
    this.container.querySelector('#profile-audience').textContent = c.audience;
    this.container.querySelector('#profile-tone').textContent = c.tone;
    
    // Pintar los canales como insignias (badges)
    const channelsHtml = c.channels.map(ch => `<span class="channel-badge">${ch}</span>`).join('');
    this.container.querySelector('#profile-channels').innerHTML = channelsHtml;
  }

  bindEvents() {
    // 1. Botón Editar Información -> Redirige al Onboarding (que usa el ON DUPLICATE KEY UPDATE)
    this.container.querySelector('#btn-edit-company').addEventListener('click', () => {
      appRouter.navigate('/onboarding');
    });

    // 2. Botón Exportar JSON (Descarga los datos del usuario)
    this.container.querySelector('#btn-export-data').addEventListener('click', async () => {
      try {
        const postsRes = await ApiClient.request('/posts', 'GET');
        
        const exportData = {
          usuario: this.userData,
          empresa: this.companyData,
          publicaciones: postsRes.posts || []
        };

        // Crear y descargar archivo JSON
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        
        anchor.href = url;
        anchor.download = 'contentai-datos.json';
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        
      } catch (error) {
        alert("Error al exportar los datos.");
      }
    });
  }
}