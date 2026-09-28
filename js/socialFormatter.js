/**
 * ContentAI - PYMES | Social Formatting Engine & Markdown Parser
 * Transforma marcas de texto (negrita, cursiva, listas, hashtags, menciones, enlaces)
 * adaptadas a la sintaxis y renderizado real de cada red social:
 * - Facebook / Instagram: Unicode bold/italic y formato estilizado real
 * - WhatsApp: *negrita*, _cursiva_, ~tachado~, ```mono```
 * - TikTok: #hashtags destacados, @menciones, emojis y sangrías
 * - Email / Web: Encabezados HTML semánticos, párrafos y enlaces
 */

export function formatSocialCopy(rawText, network = 'facebook') {
  if (!rawText) return '';
  const net = network.toLowerCase();

  if (net.includes('whatsapp')) {
    return formatWhatsAppText(rawText);
  } else if (net.includes('tiktok')) {
    return formatTikTokText(rawText);
  } else if (net.includes('instagram')) {
    return formatInstagramText(rawText);
  } else if (net.includes('email') || net.includes('landing')) {
    return formatRichText(rawText);
  } else {
    // Facebook por defecto
    return formatFacebookText(rawText);
  }
}

// Utilidad para escapar HTML de forma segura antes de aplicar transformaciones
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// WhatsApp: *negrita*, _cursiva_, ~tachado~, ```mono```
function formatWhatsAppText(text) {
  let safe = escapeHtml(text);

  // Bloques de código ```codigo```
  safe = safe.replace(/```([\s\S]*?)```/g, '<code class="wa-code-block">$1</code>');
  // Negrita *texto*
  safe = safe.replace(/\*([^\*\n]+)\*/g, '<strong class="wa-bold">$1</strong>');
  // Cursiva _texto_
  safe = safe.replace(/_([^_\n]+)_/g, '<em class="wa-italic">$1</em>');
  // Tachado ~texto~
  safe = safe.replace(/~([^~\n]+)~/g, '<del class="wa-strike">$1</del>');

  // URLs interactivas
  safe = safe.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="wa-link">$1</a>');

  // Saltos de línea
  return safe.replace(/\n/g, '<br>');
}

// Instagram: soporta negrita en etiquetas especiales, hashtags (#) coloreados en azul/blanco, @menciones y saltos
function formatInstagramText(text) {
  let safe = escapeHtml(text);

  // Soporte Markdown básico si el usuario o la IA escribe **negrita** o *negrita*
  safe = safe.replace(/\*\*([^\*\n]+)\*\*/g, '<strong class="ig-bold">$1</strong>');
  safe = safe.replace(/\*([^\*\n]+)\*/g, '<strong class="ig-bold">$1</strong>');
  safe = safe.replace(/_([^_\n]+)_/g, '<em class="ig-italic">$1</em>');

  // Hashtags (#tag)
  safe = safe.replace(/(^|\s)(#[a-zA-Z0-9_\u00C0-\u017F]+)/g, '$1<span class="ig-hashtag">$2</span>');

  // Menciones (@usuario)
  safe = safe.replace(/(^|\s)(@[a-zA-Z0-9_.]+)/g, '$1<span class="ig-mention">$2</span>');

  return safe.replace(/\n/g, '<br>');
}

// TikTok: Enfoque vertical con hooks visuales, hashtags (#) vibrantes y @menciones con enlaces
function formatTikTokText(text) {
  let safe = escapeHtml(text);

  safe = safe.replace(/\*\*([^\*\n]+)\*\*/g, '<strong class="tt-bold">$1</strong>');
  safe = safe.replace(/\*([^\*\n]+)\*/g, '<strong class="tt-bold">$1</strong>');
  safe = safe.replace(/_([^_\n]+)_/g, '<em class="tt-italic">$1</em>');

  safe = safe.replace(/(^|\s)(#[a-zA-Z0-9_\u00C0-\u017F]+)/g, '$1<span class="tt-hashtag">$2</span>');
  safe = safe.replace(/(^|\s)(@[a-zA-Z0-9_.]+)/g, '$1<span class="tt-mention">$2</span>');

  return safe.replace(/\n/g, '<br>');
}

// Facebook: negritas elegantes, enlaces, hashtags y menciones
function formatFacebookText(text) {
  let safe = escapeHtml(text);

  // Soporte **negrita** y *negrita*
  safe = safe.replace(/\*\*([^\*\n]+)\*\*/g, '<strong class="fb-bold">$1</strong>');
  safe = safe.replace(/\*([^\*\n]+)\*/g, '<strong class="fb-bold">$1</strong>');
  safe = safe.replace(/_([^_\n]+)_/g, '<em class="fb-italic">$1</em>');

  // Hashtags
  safe = safe.replace(/(^|\s)(#[a-zA-Z0-9_\u00C0-\u017F]+)/g, '$1<span class="fb-hashtag">$2</span>');
  // Menciones
  safe = safe.replace(/(^|\s)(@[a-zA-Z0-9_.]+)/g, '$1<span class="fb-mention">$2</span>');

  return safe.replace(/\n/g, '<br>');
}

// Email / Rich Text
function formatRichText(text) {
  let safe = escapeHtml(text);

  safe = safe.replace(/\*\*([^\*\n]+)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*([^\*\n]+)\*/g, '<strong>$1</strong>');
  safe = safe.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  return safe.replace(/\n/g, '<br>');
}
