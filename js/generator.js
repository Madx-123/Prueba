
/**
 * ContentAI PYMES | Generación de contenido
 * Ruta: js/generator.js
 *
 * Responsabilidades:
 * 1. Validar los parámetros del formulario.
 * 2. Mostrar el indicador de progreso.
 * 3. Solicitar el borrador mediante services/api.js.
 * 4. Actualizar el editor, el estado y las previsualizaciones.
 *
 * Actualmente api.js utiliza generación simulada.
 * Todavía no existe conexión con Laravel ni IA real.
 *
 * craftAICommercialCopy() se conserva temporalmente
 * porque review.js y la API demo la utilizan.
 */


/* ==========================================================
   1. IMPORTACIONES
   ========================================================== */

import { store } from './store.js';

import { showToast } from './app.js';

import { api } from './services/api.js';

import { renderLivePreview } from './previews.js';


/* ==========================================================
   2. CONFIGURACIÓN
   ========================================================== */

const MAX_TOPIC_LENGTH = 500;

const GENERATION_TIME_MS = 2000;

let generating = false;

const byId = (id) => document.getElementById(id);

const wait = (ms) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));


/* ==========================================================
   3. REDES SOCIALES
   ========================================================== */

const CONTENT_NETWORKS = Object.freeze({
  Facebook: 'Facebook',
  Instagram: 'Instagram',
  TikTok: 'TikTok',
  WhatsApp: 'WhatsApp',
  Email: 'Email'
});


/* ==========================================================
   4. NORMALIZACIÓN DE TEXTO
   ========================================================== */

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}


/* ==========================================================
   5. IDENTIFICAR PLATAFORMA
   ========================================================== */

function detectNetwork(type) {
  const value = normalize(type);

  if (value.includes('instagram')) {
    return CONTENT_NETWORKS.Instagram;
  }

  if (value.includes('tiktok')) {
    return CONTENT_NETWORKS.TikTok;
  }

  if (value.includes('whatsapp')) {
    return CONTENT_NETWORKS.WhatsApp;
  }

  if (
    value.includes('email') ||
    value.includes('correo')
  ) {
    return CONTENT_NETWORKS.Email;
  }

  if (value.includes('landing')) {
    return 'Landing';
  }

  return CONTENT_NETWORKS.Facebook;
}


/* ==========================================================
   6. IDENTIFICAR OBJETIVO COMERCIAL
   ========================================================== */

function detectObjective(objective) {
  const value = normalize(objective);

  if (value.includes('lanzamiento')) {
    return 'launch';
  }

  if (
    value.includes('educacion') ||
    value.includes('valor')
  ) {
    return 'education';
  }

  if (value.includes('fidelizacion')) {
    return 'loyalty';
  }

  return 'sales';
}


/* ==========================================================
   7. IDENTIFICAR TONO DE MARCA
   ========================================================== */

function detectTone(tone) {
  const value = normalize(tone);

  if (
    value.includes('formal') ||
    value.includes('corporativo')
  ) {
    return 'formal';
  }

  if (
    value.includes('tecnico') ||
    value.includes('especializado')
  ) {
    return 'technical';
  }

  if (
    value.includes('energico') ||
    value.includes('motivador')
  ) {
    return 'energetic';
  }

  if (
    value.includes('elegante') ||
    value.includes('sofisticado')
  ) {
    return 'elegant';
  }

  return 'friendly';
}


/* ==========================================================
   8. ESTILOS DE COMUNICACIÓN
   ========================================================== */

const VOICES = Object.freeze({

  friendly: {
    opening: '¡Tenemos algo que contarte! ✨',
    closing: 'Nos encantará conversar contigo. 💜',
    greeting: '¡Hola! 👋',
    emailGreeting: '¡Hola!'
  },

  formal: {
    opening: 'Compartimos una novedad de nuestro negocio.',
    closing: 'Quedamos atentos a tus consultas.',
    greeting: 'Estimado/a cliente:',
    emailGreeting: 'Estimado/a cliente:'
  },

  technical: {
    opening: 'Información relevante para tomar una decisión.',
    closing: 'Consulta los detalles antes de decidir.',
    greeting: 'Hola, compartimos información de interés:',
    emailGreeting: 'Estimado/a cliente:'
  },

  energetic: {
    opening: '¡Es momento de descubrir algo nuevo! 🚀',
    closing: '¡Cuéntanos qué te parece! ⚡',
    greeting: '¡Hola! 🚀',
    emailGreeting: '¡Hola!'
  },

  elegant: {
    opening: 'Una propuesta para descubrir con calma.',
    closing: 'Será un gusto atenderte.',
    greeting: 'Un cordial saludo.',
    emailGreeting: 'Estimado/a cliente:'
  }

});


/* ==========================================================
   9. OBJETIVOS COMERCIALES
   ========================================================== */

const GOALS = Object.freeze({

  sales: {
    heading: 'Una propuesta para ti',

    cta:
      'Escríbenos para conocer los detalles y cómo acceder a esta propuesta.',

    alternateCta:
      'Contáctanos hoy y consulta la disponibilidad y las condiciones.',

    subject: 'Conoce esta propuesta de'
  },

  launch: {
    heading: 'Presentamos una novedad',

    cta:
      '¿Quieres saber más? Cuéntanos qué te gustaría conocer.',

    alternateCta:
      'Conversemos sobre este lanzamiento y resuelve tus dudas.',

    subject: 'Te presentamos una novedad de'
  },

  education: {
    heading: 'Información que aporta valor',

    cta:
      'Guarda esta información y comparte tus preguntas con nosotros.',

    alternateCta:
      'Comparte esta publicación con alguien a quien pueda servirle.',

    subject: 'Información útil de'
  },

  loyalty: {
    heading: 'Seguimos conectados',

    cta:
      'Gracias por acompañarnos. Queremos conocer tu opinión.',

    alternateCta:
      'Responde este mensaje y cuéntanos qué te gustaría ver después.',

    subject: 'Un mensaje para nuestra comunidad de'
  }

});


/* ==========================================================
   10. HASHTAG EMPRESARIAL
   ========================================================== */

function brandHashtag(name) {
  const tag = String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');

  return `#${tag || 'MiPYME'}`;
}


/* ==========================================================
   11. PÚBLICO OBJETIVO
   ========================================================== */

function audienceLine(audience) {
  const firstIdea = String(audience ?? '')
    .split(/[,.;\n]/)[0]
    .trim();

  if (
    !firstIdea ||
    firstIdea.length > 100
  ) {
    return '';
  }

  const formattedAudience =
    firstIdea.charAt(0).toLowerCase() +
    firstIdea.slice(1);

  return `Una propuesta pensada para ${formattedAudience}.`;
}


/* ==========================================================
   12. MOTOR DE PLANTILLAS DE DEMOSTRACIÓN
   ========================================================== */

/**
 * Esta función continuará generando los textos demo.
 *
 * IMPORTANTE:
 * - api.js la utiliza mediante importación diferida.
 * - review.js la utiliza para crear variantes.
 *
 * Por eso mantenemos su nombre y parámetros.
 *
 * Posteriormente las plantillas se trasladarán
 * al servicio mock, eliminando esta dependencia temporal.
 *
 * @param {string} type
 * @param {string} objective
 * @param {string} topic
 * @returns {string}
 */
export function craftAICommercialCopy(
  type,
  objective,
  topic
) {

  // Recuperar empresa actual.
  const company =
    store.getState().companyProfile || {};

  const name = String(
    company.name || 'Mi negocio'
  ).trim();

  const network = detectNetwork(type);

  const goal = GOALS[
    detectObjective(objective)
  ];

  const voice = VOICES[
    detectTone(company.tone)
  ];

  const target = audienceLine(
    company.audience
  );

  /*
   * Este marcador lo añade review.js para pedir
   * una variante más directa.
   *
   * No debe aparecer en el texto final.
   */
  const variantMarker =
    /\s*\(Enfoque alternativo m[aá]s directo y con llamada a la acci[oó]n reforzada\)\s*$/i;

  const rawTopic = String(
    topic ?? ''
  ).trim();

  const isVariant =
    variantMarker.test(rawTopic);

  const message = rawTopic
    .replace(variantMarker, '')
    .trim();

  if (!message) {
    return '';
  }

  const callToAction = isVariant
    ? goal.alternateCta
    : goal.cta;

  const brandTag = brandHashtag(name);


  /* ========================================================
     13. FORMATO INSTAGRAM
     ======================================================== */

  if (network === 'Instagram') {

    return [

      voice.opening,

      `**${goal.heading} en ${name}**`,

      message,

      target,

      voice.closing,

      `💬 ${callToAction}`,

      `${brandTag} #PYMES #Emprendimiento`

    ]
      .filter(Boolean)
      .join('\n\n');
  }


  /* ========================================================
     14. FORMATO TIKTOK
     ======================================================== */

  if (network === 'TikTok') {

    return [

      `GUION PARA VIDEO CORTO | ${name}`,

      `[0–3 s] ${goal.heading}.`,

      `[3–15 s] ${message}`,

      `[15–20 s] ${callToAction}`,

      'Sugerencia visual: muestra tu negocio o el producto mencionado.',

      `${brandTag} #PYMES #Emprendimiento`

    ].join('\n\n');
  }


  /* ========================================================
     15. FORMATO WHATSAPP
     ======================================================== */

  if (network === 'WhatsApp') {

    return [

      voice.greeting,

      `Te escribimos desde *${name}*.`,

      `*${goal.heading}*`,

      message,

      callToAction,

      voice.closing

    ].join('\n\n');
  }


  /* ========================================================
     16. FORMATO EMAIL
     ======================================================== */

  if (network === 'Email') {

    return [

      `ASUNTO: ${goal.subject} ${name}`,

      `PREENCABEZADO: ${goal.heading}.`,

      voice.emailGreeting,

      `En ${name} queremos compartir contigo lo siguiente:`,

      message,

      target,

      callToAction,

      `Atentamente,\nEl equipo de ${name}`

    ]
      .filter(Boolean)
      .join('\n\n');
  }


  /* ========================================================
     17. FORMATO LANDING
     ======================================================== */

  if (network === 'Landing') {

    return [

      `[TITULAR]\n${goal.heading} | ${name}`,

      `[DESCRIPCIÓN]\n${message}`,

      target
        ? `[PÚBLICO]\n${target}`
        : '',

      `[LLAMADA A LA ACCIÓN]\n${callToAction}`

    ]
      .filter(Boolean)
      .join('\n\n');
  }


  /* ========================================================
     18. FORMATO FACEBOOK
     ======================================================== */

  return [

    voice.opening,

    `**${goal.heading} en ${name}**`,

    message,

    target,

    callToAction,

    voice.closing,

    `${brandTag} #ComercioLocal #PYMES`

  ]
    .filter(Boolean)
    .join('\n\n');
}


/* ==========================================================
   19. INDICADOR DE PROGRESO
   ========================================================== */

function renderLoadingStep(stepNumber) {

  for (let number = 1; number <= 3; number++) {

    const step = byId(
      `load-step-${number}`
    );

    if (!step) continue;

    step.classList.toggle(
      'active',
      number <= stepNumber
    );
  }
}


/* ==========================================================
   20. ACTIVAR / DESACTIVAR CARGA
   ========================================================== */

function setLoading(isLoading) {

  const overlay = byId(
    'generator-loading-overlay'
  );

  const button = byId(
    'btn-generate-ai'
  );

  if (overlay) {

    overlay.classList.toggle(
      'active',
      isLoading
    );

    overlay.setAttribute(
      'aria-hidden',
      String(!isLoading)
    );
  }

  if (button) {

    button.disabled = isLoading;

    button.setAttribute(
      'aria-busy',
      String(isLoading)
    );
  }

  if (isLoading) {
    renderLoadingStep(1);
  }
}


/* ==========================================================
   21. PROCESAR GENERACIÓN
   ========================================================== */

/**
 * Recoge los datos del formulario.
 *
 * Solicita la generación mediante api.js y
 * coloca el resultado dentro del editor.
 *
 * Contrato del servicio:
 *
 * api.generateContent({
 *   contentType,
 *   objective,
 *   topic
 * })
 *
 * Respuesta:
 *
 * {
 *   contentType,
 *   objective,
 *   topic,
 *   generatedText
 * }
 */
export async function handleGenerateSubmit(event) {

  event?.preventDefault();

  // Evitar peticiones simultáneas.
  if (generating) {
    return false;
  }


  /* ========================================================
     22. RECUPERAR CAMPOS
     ======================================================== */

  const typeField = byId(
    'gen-content-type'
  );

  const objectiveField = byId(
    'gen-objective'
  );

  const topicField = byId(
    'gen-campaign-topic'
  );

  if (
    !typeField ||
    !objectiveField ||
    !topicField
  ) {

    showToast(
      'No se encontró el formulario del generador.',
      'error'
    );

    return false;
  }

  const contentType = typeField.value.trim();

  const objective = objectiveField.value.trim();

  const topic = topicField.value.trim();


  /* ========================================================
     23. VALIDAR SESIÓN Y EMPRESA
     ======================================================== */

  const state = store.getState();

  if (
    !state.user?.isLoggedIn ||
    !state.isCompanyRegistered
  ) {

    showToast(
      'Primero inicia sesión y registra tu empresa.',
      'warning'
    );

    return false;
  }


  /* ========================================================
     24. VALIDAR FORMULARIO
     ======================================================== */

  if (
    !contentType ||
    !objective ||
    !topic
  ) {

    showToast(
      'Selecciona un canal, un objetivo y describe tu campaña.',
      'warning'
    );

    if (!topic) {
      topicField.focus();
    }

    return false;
  }

  if (topic.length > MAX_TOPIC_LENGTH) {

    showToast(
      'La descripción no puede superar 500 caracteres.',
      'warning'
    );

    topicField.focus();

    return false;
  }


  /* ========================================================
     25. PREPARAR SOLICITUD
     ======================================================== */

  const parameters = {
    contentType,
    objective,
    topic
  };

  generating = true;

  setLoading(true);


  try {

    /* ======================================================
       26. SOLICITAR CONTENIDO A LA API
       ====================================================== */

    /**
     * api.js genera un borrador mediante
     * plantillas locales.
     *
     * En Laravel, este mismo método podrá
     * comunicarse con un controlador PHP.
     */

    const request = api.generateContent(
      parameters
    ).then(

      (data) => ({
        success: true,
        data
      }),

      (error) => ({
        success: false,
        error
      })

    );


    /* ======================================================
       27. MOSTRAR ANIMACIÓN DE PROGRESO
       ====================================================== */

    await wait(700);

    renderLoadingStep(2);

    await wait(700);

    renderLoadingStep(3);

    /*
     * Esperamos el resultado del servicio
     * y garantizamos un mínimo de 2 segundos
     * de progreso.
     */

    const [response] = await Promise.all([

      request,

      wait(GENERATION_TIME_MS - 1400)

    ]);


    /* ======================================================
       28. COMPROBAR ESTADO ACTUAL
       ====================================================== */

    const latest = store.getState();

    // No mostrar respuestas de una sesión cerrada.
    if (
      !latest.user?.isLoggedIn ||
      latest.currentView !== 'view-dashboard'
    ) {
      return false;
    }


    /* ======================================================
       29. VALIDAR RESPUESTA DE LA API
       ====================================================== */

    if (!response.success) {
      throw response.error;
    }

    const result = response.data;

    const generatedText =
      typeof result?.generatedText === 'string'
        ? result.generatedText.trim()
        : '';

    if (!generatedText) {
      throw new Error(
        'El servicio devolvió un texto vacío.'
      );
    }

    const finalType = String(
      result?.contentType || contentType
    );

    const finalObjective = String(
      result?.objective || objective
    );

    const finalTopic = String(
      result?.topic || topic
    );

    const network = detectNetwork(
      finalType
    );


    /* ======================================================
       30. ACTUALIZAR EL EDITOR
       ====================================================== */

    const editor = byId(
      'preview-generated-text'
    );

    const typeBadge = byId(
      'review-badge-type'
    );

    const statusBadge = byId(
      'edit-status-badge'
    );

    if (editor) {
      editor.value = generatedText;
    }

    if (typeBadge) {
      typeBadge.textContent = finalType;
    }

    if (statusBadge) {
      statusBadge.textContent =
        'Borrador generado · Pendiente de revisión';
    }


    /* ======================================================
       31. ACTUALIZAR ESTADO CENTRAL
       ====================================================== */

    /**
     * Realizamos una única actualización
     * para conservar los parámetros y el texto.
     */

    store.setState({

      currentGeneration: {

        ...latest.currentGeneration,

        contentType: finalType,

        objective: finalObjective,

        topic: finalTopic,

        generatedText,

        previewNetwork: network

      }

    });


    /* ======================================================
       32. ACTUALIZAR PREVISUALIZACIÓN
       ====================================================== */

    renderLivePreview();


    /* ======================================================
       33. CONFIRMAR GENERACIÓN
       ====================================================== */

    showToast(
      'Borrador generado. Revísalo antes de guardarlo.',
      'success'
    );

    return true;


  } catch (error) {

    /* ======================================================
       34. MANEJAR ERRORES
       ====================================================== */

    console.error(
      'ContentAI: error de generación.',
      error
    );

    let message =
      'No se pudo generar el borrador. Inténtalo nuevamente.';

    if (error?.status === 422) {

      message = error.message;

    } else if (error?.status === 401) {

      message =
        'Tu sesión ha terminado. Inicia sesión para continuar.';

    }

    showToast(
      message,
      'error'
    );

    return false;


  } finally {

    /* ======================================================
       35. RESTABLECER EL FORMULARIO
       ====================================================== */

    setLoading(false);

    generating = false;

  }
}
