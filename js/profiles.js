/**
 * ContentAI - PYMES | Company Profiles & Onboarding Controller
 * Modelo de Empresa Única: El usuario registra su empresa y trabaja exclusivamente con ella.
 */

import { store } from './store.js';
import { showToast } from './app.js';
import { navigateTo } from './navigation.js';

export function initProfiles() {
  renderProfileUI();

  // Suscribirse a cambios en store
  store.subscribe(() => {
    renderProfileUI();
  });
}

// Carga datos de ejemplo en el formulario para evaluación rápida
export function loadDemoCompanyAutofill() {
  const nameInput = document.getElementById('company-name');
  const sectorSelect = document.getElementById('company-sector');
  const audienceTextarea = document.getElementById('company-audience');
  const toneSelect = document.getElementById('company-tone');
  const topicTextarea = document.getElementById('gen-campaign-topic');

  if (nameInput) nameInput.value = 'Café Artesanal La Cumbre';
  if (sectorSelect) sectorSelect.value = 'Gastronomía & Alimentos';
  if (audienceTextarea) audienceTextarea.value = 'Amantes del café de especialidad y profesionales de 25 a 45 años que buscan productos de origen local, apoyan a caficultores y aprecian la trazabilidad del grano.';
  if (toneSelect) toneSelect.value = 'Cercano, Amigable y Cálido';
  if (topicTextarea) topicTextarea.value = 'Lanzamiento de nuestro nuevo café de origen Nariño con 20% de descuento durante este fin de semana. Tueste medio, notas a panela y frutos rojos.';

  showToast('Datos de ejemplo cargados en el formulario de registro.', 'info');
}

// Procesa el registro de la única empresa del usuario
export function handleOnboardingSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('company-name').value.trim();
  const sector = document.getElementById('company-sector').value;
  const audience = document.getElementById('company-audience').value.trim();
  const tone = document.getElementById('company-tone').value;

  const channels = [];
  document.querySelectorAll('input[name="channels"]:checked').forEach(cb => {
    channels.push(cb.value);
  });

  const registeredCompany = {
    id: 'pyme_' + Date.now(),
    name: name,
    sector: sector,
    audience: audience,
    tone: tone,
    channels: channels.length > 0 ? channels : ['Facebook', 'Instagram', 'WhatsApp Business'],
    registeredAt: new Date().toLocaleDateString('es-ES')
  };

  // Guardar como la única empresa del usuario en la tienda global
  store.registerUserCompany(registeredCompany);

  showToast(`¡Empresa "${name}" registrada! Entorno de trabajo comercial activado.`, 'success');

  // Redirigir al Dashboard principal (Tab A: Generador IA)
  setTimeout(() => {
    navigateTo('view-dashboard', 'tab-generator');
  }, 400);
}

// Sincroniza la información de la empresa exclusiva en todas las vistas
export function renderProfileUI() {
  const profile = store.getState().companyProfile;
  if (!profile) return;

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'E';

  // Sidebar del Dashboard
  const avatarEl = document.getElementById('sidebar-avatar');
  const nameEl = document.getElementById('sidebar-company-name');
  const sectorEl = document.getElementById('sidebar-company-sector');
  const topbarBrandPill = document.getElementById('topbar-brand-name');
  const genHeaderCompany = document.getElementById('generator-header-company-note');

  // Elementos de la Burbuja Flotante de Usuario (Abajo a la Derecha)
  const bubbleAvatar = document.getElementById('user-bubble-avatar');
  const bubbleInitial = document.getElementById('user-bubble-initial');
  const bubbleName = document.getElementById('user-bubble-name');
  const bubbleCompany = document.getElementById('user-bubble-company');
  const bubbleSector = document.getElementById('user-bubble-sector');
  const bubbleEmail = document.getElementById('user-bubble-email');

  const userEmail = store.getState().user?.email || 'gerencia@pyme.com';

  // Elementos del Dock de Usuario estilo Discord (Esquina Inferior Izquierda)
  const discordAvatar = document.getElementById('discord-user-avatar');
  const discordUserName = document.getElementById('discord-user-name');
  const discordUserEmail = document.getElementById('discord-user-email');
  const discordCompanyName = document.getElementById('discord-company-name');
  const discordCompanySector = document.getElementById('discord-company-sector');

  if (discordAvatar) discordAvatar.textContent = initial;
  if (discordUserName) discordUserName.textContent = profile.name;
  if (discordUserEmail) discordUserEmail.textContent = userEmail;
  if (discordCompanyName) discordCompanyName.textContent = profile.name;
  if (discordCompanySector) discordCompanySector.textContent = profile.sector;

  if (avatarEl) avatarEl.textContent = initial;
  if (nameEl) nameEl.textContent = profile.name;
  if (sectorEl) sectorEl.textContent = profile.sector.split('/')[0];
  if (topbarBrandPill) topbarBrandPill.textContent = profile.name;
  if (genHeaderCompany) genHeaderCompany.textContent = `Vinculado a: ${profile.name}`;

  if (bubbleAvatar) bubbleAvatar.textContent = initial;
  if (bubbleInitial) bubbleInitial.textContent = initial;
  if (bubbleName) bubbleName.textContent = profile.name;
  if (bubbleCompany) bubbleCompany.textContent = profile.name;
  if (bubbleSector) bubbleSector.textContent = profile.sector;
  if (bubbleEmail) bubbleEmail.textContent = userEmail;

  // Landing Hero Card
  const landingHeroName = document.getElementById('landing-hero-company-name');
  const landingHeroSector = document.getElementById('landing-hero-company-sector');
  if (landingHeroName) landingHeroName.textContent = profile.name;
  if (landingHeroSector) landingHeroSector.textContent = profile.sector;

  // Review & Previews badges
  const reviewCompanyBadge = document.getElementById('review-badge-company');
  const reviewToneBadge = document.getElementById('review-badge-tone');
  if (reviewCompanyBadge) reviewCompanyBadge.textContent = profile.name;
  if (reviewToneBadge) reviewToneBadge.textContent = `Tono: ${profile.tone.split('(')[0]}`;
}
