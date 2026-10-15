/** Solo datos ficticios. Ningún componente debe modificarlos directamente. */
export const CHANNELS = Object.freeze([
  { id: 'Facebook', label: 'Facebook', icon: 'facebook', description: 'Publicación en el feed' },
  { id: 'Instagram', label: 'Instagram', icon: 'instagram', description: 'Post visual con hashtags' },
  { id: 'TikTok', label: 'TikTok', icon: 'video', description: 'Guion para vídeo vertical' },
  { id: 'WhatsApp', label: 'WhatsApp', icon: 'messagecircle', description: 'Mensaje comercial' },
  { id: 'Email', label: 'Email', icon: 'mail', description: 'Campaña por correo' }
]);

export const OBJECTIVES = Object.freeze([
  'Aumentar las ventas', 'Presentar un producto', 'Informar y educar', 'Fidelizar clientes', 'Atraer seguidores'
]);

export const SECTORS = Object.freeze([
  'Alimentos y bebidas', 'Moda y accesorios', 'Belleza y bienestar',
  'Comercio y retail', 'Tecnología', 'Educación', 'Turismo y hotelería',
  'Servicios profesionales', 'Otro sector'
]);

export const TONES = Object.freeze([
  'Cercano y amigable', 'Profesional y claro', 'Entusiasta y dinámico', 'Elegante y sofisticado', 'Educativo y sencillo'
]);

export const SUGGESTIONS = Object.freeze([
  'Presenta nuestro producto estrella y explica qué lo hace especial.',
  'Invita a conocer el negocio y muestra los beneficios para nuestros clientes.',
  'Comparte tres consejos útiles relacionados con nuestros servicios.'
]);

export function createSeed() {
  return {
    schemaVersion: 1,
    users: [{ id: 'user-demo', name: 'María Flores', email: 'demo@contentai.pe', createdAt: '2026-10-01T10:00:00.000Z' }],
    companies: [{
      id: 'company-demo', userId: 'user-demo', name: 'Café La Cumbre',
      sector: 'Alimentos y bebidas', city: 'Chimbote, Áncash',
      offer: 'Café peruano de especialidad, desayunos artesanales y postres hechos cada mañana.',
      audience: 'Estudiantes y profesionales de 18 a 40 años que valoran el café de calidad.',
      differentiator: 'Productos frescos, origen local y atención cercana.',
      tone: 'Cercano y amigable', goal: 'Aumentar las ventas',
      channels: ['Facebook', 'Instagram', 'WhatsApp'],
      createdAt: '2026-10-01T10:05:00.000Z'
    }],
    posts: [
      {
        id: 'post-demo-1', companyId: 'company-demo', channel: 'Facebook', status: 'approved',
        objective: 'Presentar un producto', topic: 'Nuestro café de origen peruano',
        text: '☕ **Un café con historia**\n\nDescubre nuestro café peruano de especialidad, preparado con dedicación y productos locales.\n\nVisítanos en Café La Cumbre y conoce nuestro sabor de casa. 💜\n\n#CafeLaCumbre #CafePeruano',
        createdAt: '2026-10-10T15:30:00.000Z', updatedAt: '2026-10-10T15:30:00.000Z'
      },
      {
        id: 'post-demo-2', companyId: 'company-demo', channel: 'Instagram', status: 'draft',
        objective: 'Atraer seguidores', topic: 'Desayunos artesanales',
        text: '🥐 **Empieza el día con algo rico**\n\nNuestros desayunos artesanales están hechos para acompañar tus mejores mañanas. ¿Con quién vendrías?\n\n#Desayuno #CafeLaCumbre #Chimbote',
        createdAt: '2026-10-11T11:00:00.000Z', updatedAt: '2026-10-11T11:00:00.000Z'
      },
      {
        id: 'post-demo-3', companyId: 'company-demo', channel: 'WhatsApp', status: 'approved',
        objective: 'Fidelizar clientes', topic: 'Gracias a nuestros clientes',
        text: '¡Hola! 👋 Somos Café La Cumbre. Gracias por acompañarnos y formar parte de nuestra comunidad. 💜\n\nEscríbenos cuando quieras conocer las novedades de nuestra carta.',
        createdAt: '2026-10-12T09:00:00.000Z', updatedAt: '2026-10-12T09:00:00.000Z'
      }
    ]
  };
}
