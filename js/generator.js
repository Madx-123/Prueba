/**
 * ContentAI - PYMES | AI Content Generation Engine Simulation
 * Simulación de 2 segundos con pasos progresivos y redacción contextual por canal
 */

import { store } from './store.js';
import { switchDashboardTab } from './navigation.js';
import { showToast } from './app.js';
import { renderLivePreview } from './previews.js';

export function handleGenerateSubmit(event) {
  event.preventDefault();

  const contentType = document.getElementById('gen-content-type').value;
  const objective = document.getElementById('gen-objective').value;
  const topic = document.getElementById('gen-campaign-topic').value.trim();

  if (!topic) {
    showToast('Por favor describe el tema de la campaña', 'info');
    return;
  }

  const overlay = document.getElementById('generator-loading-overlay');
  const btn = document.getElementById('btn-generate-ai');

  // Activar estado de carga animado
  if (overlay) overlay.classList.add('active');
  if (btn) btn.disabled = true;

  // Pasos secuenciales de la animación de 2 segundos (2000 ms)
  const step1 = document.getElementById('load-step-1');
  const step2 = document.getElementById('load-step-2');
  const step3 = document.getElementById('load-step-3');

  if (step1) step1.classList.add('active');
  if (step2) step2.classList.remove('active');
  if (step3) step3.classList.remove('active');

  setTimeout(() => {
    if (step2) step2.classList.add('active');
  }, 700);

  setTimeout(() => {
    if (step3) step3.classList.add('active');
  }, 1400);

  // Culminación a los 2 segundos exactos
  setTimeout(() => {
    if (overlay) overlay.classList.remove('active');
    if (btn) btn.disabled = false;

    // Generar copy comercial contextualizado
    const generatedCopy = craftAICommercialCopy(contentType, objective, topic);

    store.setState({
      currentGeneration: {
        contentType,
        objective,
        topic,
        generatedText: generatedCopy
      }
    });

    // Actualizar editor de texto
    const textarea = document.getElementById('preview-generated-text');
    if (textarea) textarea.value = generatedCopy;

    // Actualizar badge de tipo
    const typeBadge = document.getElementById('review-badge-type');
    if (typeBadge) typeBadge.textContent = contentType;

    // Renderizar la vista previa en vivo del canal
    renderLivePreview();

    showToast('¡Contenido generado exitosamente con la identidad de tu PYME!', 'success');

    // Cambio automático al Tab B por requerimiento
    switchDashboardTab('tab-review');

  }, 2000);
}

export function craftAICommercialCopy(type, objective, topic) {
  const profile = store.getState().companyProfile;
  const name = profile.name || 'Nuestra Empresa';
  const audience = profile.audience || 'nuestros clientes';
  const tone = profile.tone || 'Cercano';

  if (type.includes('Facebook')) {
    return `☕✨ ¡Novedades exclusivas en ${name}! ✨🌿\n\n📌 ¿De qué se trata?\n${topic}\n\nSabemos lo importante que es para ti disfrutar de productos auténticos y apoyar el talento y la producción local. Esta campaña fue pensada especialmente para quienes buscan calidad sin rodeos.\n\n🎁 BENEFICIO PARA NUESTRA COMUNIDAD:\nComenta "QUIERO" o escríbenos directamente por mensaje privado para reclamar tu beneficio antes de agotar existencia.\n\n👇 ¡Haz clic en el enlace o contáctanos hoy mismo!`;
  }
  else if (type.includes('Instagram')) {
    return `✨ Hecho con pasión, pensado para tu día a día. En ${name} cuidamos cada detalle. 📸\n\n${topic}\n\nDiseñado especialmente para quienes como tú valoran la autenticidad y el compromiso real. 🤍\n\n💬 Cuéntanos en los comentarios: ¿qué es lo primero que buscas al elegir un producto artesanal?\n\n.\n.\n#${name.replace(/[^a-zA-Z0-9]/g, '')} #ComercioLocal #PYMES #CalidadArtesanal #ConsumoConsciente #Emprendimiento`;
  }
  else if (type.includes('WhatsApp')) {
    return `¡Hola! 👋 Te saludamos con mucho cariño desde *${name}*.\n\nQueremos compartirte una promoción especial:\n\n✨ *${topic}*\n\nSi deseas hacer tu pedido o tienes alguna duda, respóndenos a este mensaje con la palabra *PEDIDO* y nuestro equipo te atenderá con gusto en este instante. 📦🚀`;
  }
  else if (type.includes('Email')) {
    return `ASUNTO: 📬 Una invitación especial de ${name} para ti\nPREHEAD: Descubre la nueva propuesta que preparamos para tu bienestar.\n\nEstimado/a cliente,\n\nEn ${name} tenemos el compromiso de ofrecerte siempre lo mejor. Por ello, hoy te presentamos:\n\n👉 ${topic}\n\n¿Por qué es importante para ti?\nPorque conocemos tus necesidades y creamos soluciones a tu medida.\n\n[ BOTÓN: APROVECHAR PROMOCIÓN EXCLUSIVA ]\n\nUn cordial saludo,\nEl equipo de ${name}`;
  }
  else if (type.includes('Landing')) {
    return `[ ENCABEZADO PRINCIPAL (H1) ]\nLa mejor experiencia artesanal la vives con ${name}.\n\n[ SUBTÍTULO PERSUASIVO ]\n${topic}\n\n[ 3 RAZONES PARA ELEGIRNOS ]\n1. Calidad Certificada: Cuidado minucioso en cada lote y proceso.\n2. Trato Humano y Cercano: Respaldado por personas comprometidas con tu satisfacción.\n3. Garantía y Rapidez: Entregas seguras y atención inmediata a tus requerimientos.\n\n[ LLAMADA A LA ACCIÓN (CTA) ]:\n"Solicitar Información Ahora / Comprar con Envío Gratis"`;
  }
  else {
    return `En ${name} reafirmamos nuestro compromiso con la innovación en el sector.\n\n${topic}\n\nUna propuesta estructurada para generar impacto medible y valor sostenible. ¿Cómo gestiona tu equipo estas prioridades en la actualidad?\n\n#Innovación #PYMES #LiderazgoEmpresarial #${name.replace(/[^a-zA-Z0-9]/g, '')}`;
  }
}
