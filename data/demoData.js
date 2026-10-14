
/**
 * ContentAI PYMES | Datos de demostración
 * Ruta: data/demoData.js
 *
 * Este archivo contiene únicamente información ficticia
 * para el prototipo.
 *
 * No inicia sesiones, no guarda datos y no registra empresas.
 * Los datos comerciales son ejemplos, no promociones reales.
 */


/* ==========================================================
   1. USUARIO DE DEMOSTRACIÓN
   ========================================================== */

export const DEMO_USER = Object.freeze({
  name: 'Administrador PYME',
  email: 'gerencia@lacumbre.com'
});


/* ==========================================================
   2. EMPRESA DE DEMOSTRACIÓN
   ========================================================== */

export const DEMO_COMPANY = Object.freeze({
  name: 'Café Artesanal La Cumbre',

  sector: 'Gastronomía & Alimentos',

  audience:
    'Amantes del café de especialidad y profesionales ' +
    'de 25 a 45 años que buscan productos de origen local, ' +
    'apoyan a caficultores y aprecian la trazabilidad del grano.',

  tone: 'Cercano, Amigable y Cálido',

  channels: Object.freeze([
    'Facebook',
    'Instagram',
    'Email Marketing',
    'WhatsApp Business'
  ])
});


/* ==========================================================
   3. PUBLICACIÓN DE DEMOSTRACIÓN
   ========================================================== */

export const DEMO_GENERATION = Object.freeze({
  contentType: 'Post de Facebook',

  objective: 'Ventas Directas y Conversión',

  topic:
    'Lanzamiento de nuestro nuevo café de origen Nariño ' +
    'con 20% de descuento durante este fin de semana.',

  previewNetwork: 'Facebook',

  generatedText: [
    '✨ ¿Hueles eso? Es el aroma a café recién tostado ' +
    'llegando directo a tu mesa. ☕🌿',

    'En Café Artesanal La Cumbre estamos de fiesta: ' +
    'te presentamos nuestro nuevo origen Nariño, ' +
    'cosechado a mano con notas dulces a panela y frutos rojos ' +
    'que transformarán tus mañanas.',

    '🎉 PROMO EXCLUSIVA DE FIN DE SEMANA:\n' +
    'Llévate tu bolsa con un 20% DE DESCUENTO especial. ' +
    'Y si tu pedido supera los $50.000, el envío va 100% ' +
    'por nuestra cuenta hasta tu puerta. 📦✨',

    '👇 Dale clic al botón de abajo o escríbenos a nuestro ' +
    'WhatsApp para pedir el tuyo antes de que se agote el ' +
    'lote de esta semana. ¡Apoya a nuestros caficultores locales!'

  ].join('\n\n')
});


/* ==========================================================
   4. HISTORIAL DE DEMOSTRACIÓN
   ========================================================== */

/**
 * Publicación ficticia aprobada.
 *
 * Este registro solamente servirá como ejemplo.
 * No debe agregarse automáticamente al historial
 * real de una empresa registrada.
 */

export const DEMO_HISTORY = Object.freeze([
  Object.freeze({
    id: 'demo_publicacion_1',

    company: 'Café Artesanal La Cumbre',

    contentType: 'Post de Facebook',

    objective: 'Ventas Directas y Conversión',

    tone: 'Cercano, Amigable y Cálido',

    topic: DEMO_GENERATION.topic,

    text:
      '✨ ¿Hueles eso? Es el aroma a café recién tostado ' +
      'llegando directo a tu mesa. En Café Artesanal ' +
      'La Cumbre celebramos con 20% de descuento en café Nariño.',

    status: 'approved',

    date: '27/09/2026 10:15'
  })
]);


/* ==========================================================
   5. OBTENER EMPRESA DE DEMOSTRACIÓN
   ========================================================== */

/**
 * Devuelve una copia de los datos empresariales.
 *
 * Esto evita modificar accidentalmente la información
 * original cuando el usuario edita el formulario.
 */

export function getDemoCompany() {
  return {
    ...DEMO_COMPANY,
    channels: [...DEMO_COMPANY.channels]
  };
}


/* ==========================================================
   6. OBTENER PUBLICACIÓN DE DEMOSTRACIÓN
   ========================================================== */

export function getDemoGeneration() {
  return {
    ...DEMO_GENERATION
  };
}


/* ==========================================================
   7. OBTENER HISTORIAL DE DEMOSTRACIÓN
   ========================================================== */

export function getDemoHistory() {
  return DEMO_HISTORY.map((item) => ({
    ...item
  }));
}
