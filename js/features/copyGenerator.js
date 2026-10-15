/** Motor ficticio determinista para demostración visual. NO es un modelo de IA. */
import { toHandle } from '../core/utils.js';
const intros = {
  'Aumentar las ventas': ['Una propuesta para descubrir 💜', 'Esto podría interesarte ✨'],
  'Presentar un producto': ['¡Conoce lo nuevo! ✨', 'Un producto, muchas posibilidades 🌟'],
  'Informar y educar': ['¿Sabías esto? 💡', 'Un consejo útil para hoy 📚'],
  'Fidelizar clientes': ['Gracias por estar aquí 💜', 'Esta comunidad nos inspira 🙌'],
  'Atraer seguidores': ['¡Bienvenido a nuestro espacio! 👋', 'Conoce nuestra historia ✨']
};
const ctas = {
  'Aumentar las ventas': 'Escríbenos para conocer disponibilidad y detalles.',
  'Presentar un producto': '¿Te gustaría saber más? Déjanos tus preguntas.',
  'Informar y educar': 'Guarda esta información para consultarla después.',
  'Fidelizar clientes': 'Cuéntanos qué te gustaría ver próximamente.',
  'Atraer seguidores': 'Síguenos para descubrir más novedades.'
};
const voice = {
  'Cercano y amigable': 'Queremos compartir contigo algo especial.',
  'Profesional y claro': 'Compartimos información relevante sobre nuestra propuesta.',
  'Entusiasta y dinámico': '¡Nos emociona contarte esto!',
  'Elegante y sofisticado': 'Un detalle pensado para quienes valoran la calidad.',
  'Educativo y sencillo': 'Te lo contamos de una forma fácil y práctica.'
};
const cleanTopic = text => String(text || '').trim().replace(/\s+/g, ' ');
export function buildCopy({ channel, objective, topic }, company, variant = 0) {
  const greeting = (intros[objective] || intros['Aumentar las ventas'])[variant % 2];
  const brand = company?.name || 'Tu negocio';
  const subject = cleanTopic(topic);
  const line = voice[company?.tone] || voice['Profesional y claro'];
  const action = ctas[objective] || ctas['Aumentar las ventas'];
  const tags = `#${toHandle(brand)} #Emprendimiento #PYMES`;
  // No añadir promociones, precios ni hechos que el usuario no haya especificado.
  switch (channel) {
    case 'Instagram': return `${greeting}\n\n**${subject}**\n\n${line} En ${brand} trabajamos para compartir experiencias con nuestra comunidad.\n\n${action}\n\n${tags}`;
    case 'TikTok': return `🎬 GUION PARA TIKTOK · ${brand}\n\n[0–3 segundos] ${greeting}\n\n[4–12 segundos] Presenta visualmente: ${subject}\n\n[13–20 segundos] ${line}\n\n[21–25 segundos] ${action}\n\n${tags}`;
    case 'WhatsApp': return `¡Hola! 👋 Somos *${brand}*.\n\n${greeting}\n\n${subject}\n\n${action}\n\nGracias por confiar en nosotros.`;
    case 'Email': return `ASUNTO: ${subject}\n\nHola,\n\n${line}\n\nHoy queremos hablarte sobre: ${subject}\n\n${action}\n\nUn saludo,\nEquipo de ${brand}`;
    default: return `${greeting}\n\n**${subject}**\n\n${line} En ${brand} nos encanta mantenerte al tanto de lo que hacemos.\n\n${action}\n\n${tags}`;
  }
}
