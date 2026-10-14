
/**
 * ContentAI PYMES | Formato seguro de publicaciones
 * Archivo: js/socialFormatter.js
 *
 * Convierte texto plano en fragmentos HTML para las maquetas de:
 * Facebook, Instagram, TikTok, WhatsApp y Email.
 *
 * IMPORTANTE:
 * - El resultado es HTML generado de forma controlada para vistas previas.
 * - No modifica el contenido original ni publica en redes sociales.
 * - Los estilos Markdown de Facebook/Instagram/TikTok son visuales:
 *   no garantizan ese formato al copiar y publicar en esas plataformas.
 */

// Mantener estas clases: ya están definidas en css/previews.css.
const STYLES = Object.freeze({
  facebook: {
    bold: 'fb-bold', italic: 'fb-italic',
    hashtag: 'fb-hashtag', mention: 'fb-mention', link: 'fb-link'
  },
  instagram: {
    bold: 'ig-bold', italic: 'ig-italic',
    hashtag: 'ig-hashtag', mention: 'ig-mention', link: ''
  },
  tiktok: {
    bold: 'tt-bold', italic: 'tt-italic',
    hashtag: 'tt-hashtag', mention: 'tt-mention', link: ''
  },
  whatsapp: {
    bold: 'wa-bold', italic: 'wa-italic',
    strike: 'wa-strike', code: 'wa-code-block', link: 'wa-link'
  },
  email: {
    bold: '', italic: '', link: ''
  }
});

/**
 * Reconoce tokens sobre el TEXTO ORIGINAL, nunca sobre HTML generado.
 * El orden importa: código y negrita doble antes que formato simple.
 */
const TOKEN_PATTERN =
  /```[\s\S]*?```|\*\*[^*\r\n]+\*\*|\*[^*\r\n]+\*|_[^_\r\n]+_|~[^~\r\n]+~|https?:\/\/[^\s<>"'`]+|#[\p{L}\p{N}_]+|@[\p{L}\p{N}_]+(?:\.[\p{L}\p{N}_]+)*/giu;

/** Escapa cualquier carácter con significado especial en HTML. */
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

/** Mantiene los saltos de línea del borrador en la vista previa. */
function escapeLines(value) {
  return escapeHtml(value).replace(/\r\n?|\n/g, '<br>');
}

function resolveNetwork(network) {
  const name = String(network ?? 'facebook').toLowerCase();

  if (name.includes('whatsapp')) return 'whatsapp';
  if (name.includes('tiktok')) return 'tiktok';
  if (name.includes('instagram')) return 'instagram';
  if (name.includes('email') || name.includes('correo') ||
      name.includes('landing') || name.includes('web')) return 'email';

  return 'facebook';
}

/**
 * Todos los nombres de elementos y clases vienen de constantes internas.
 * Ningún texto del usuario se utiliza como HTML sin escapar.
 */
function element(tag, className, content) {
  const attribute = className ? ` class="${className}"` : '';
  return `<${tag}${attribute}>${content}</${tag}>`;
}

/** Comprueba límites para no convertir partes de nombres en formato. */
function isWordCharacter(char) {
  return Boolean(char && /[\p{L}\p{N}_]/u.test(char));
}

/**
 * Crea enlaces únicamente para URL HTTP(S) válidas.
 * No crea enlaces de javascript:, data: ni otros esquemas.
 */
function formatUrl(token, network) {
  // Separar signos de puntuación finales del enlace.
  const urlText = token.replace(/[.,!?;:)\]\}]+$/u, '');
  const suffix = token.slice(urlText.length);

  // Instagram y TikTok muestran la URL como texto en el mockup:
  // una URL en una descripción no es necesariamente clicable allí.
  if (network === 'instagram' || network === 'tiktok') {
    return escapeLines(token);
  }

  try {
    const url = new URL(urlText);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return escapeLines(token);
    }

    const className = STYLES[network].link;
    const attribute = className ? ` class="${className}"` : '';
    const safeHref = escapeHtml(url.href);

    return `<a${attribute} href="${safeHref}" target="_blank" ` +
      `rel="noopener noreferrer">${escapeHtml(urlText)}</a>${escapeHtml(suffix)}`;
  } catch {
    return escapeLines(token);
  }
}

/**
 * Procesa un segmento completo sin volver a analizar etiquetas HTML.
 * El modo nested permite hashtags dentro de una negrita, por ejemplo:
 * **Conoce #ContentAI**.
 */
function renderText(input, network, nested = false) {
  const styles = STYLES[network];
  const text = String(input ?? '');
  const tokens = new RegExp(TOKEN_PATTERN.source, TOKEN_PATTERN.flags);
  let output = '';
  let lastIndex = 0;

  for (const match of text.matchAll(tokens)) {
    const token = match[0];
    const start = match.index;
    const end = start + token.length;

    // Texto común: siempre escapar antes de añadir al HTML final.
    output += escapeLines(text.slice(lastIndex, start));
    lastIndex = end;

    const previous = start > 0 ? text[start - 1] : '';
    const following = end < text.length ? text[end] : '';

    // Código multilínea de WhatsApp: no interpretar su contenido.
    if (token.startsWith('```') && token.endsWith('```')) {
      output += network === 'whatsapp' && !nested
        ? element('code', styles.code, escapeLines(token.slice(3, -3)))
        : escapeLines(token);
      continue;
    }

    // URL: nunca se vuelven a procesar sus atributos o sus etiquetas.
    if (/^https?:\/\//i.test(token)) {
      output += formatUrl(token, network);
      continue;
    }

    // Hashtags y menciones: resaltar sin crear enlaces inventados.
    if (token.startsWith('#') || token.startsWith('@')) {
      const kind = token[0] === '#' ? 'hashtag' : 'mention';
      const className = styles[kind];
      const boundaryIsValid = !isWordCharacter(previous);

      output += className && boundaryIsValid
        ? element('span', className, escapeHtml(token))
        : escapeHtml(token);
      continue;
    }

    // Evitar interpretar marcas de formato anidadas repetidamente.
    if (nested) {
      output += escapeLines(token);
      continue;
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      const body = token.slice(2, -2);
      output += body.trim()
        ? element('strong', styles.bold, renderText(body, network, true))
        : escapeLines(token);
      continue;
    }

    if (token.startsWith('*') && token.endsWith('*')) {
      const body = token.slice(1, -1);
      output += body.trim()
        ? element('strong', styles.bold, renderText(body, network, true))
        : escapeLines(token);
      continue;
    }

    if (token.startsWith('_') && token.endsWith('_')) {
      const body = token.slice(1, -1);
      // Ejemplo: archivo_nombre_final, sin cursivas parciales.
      const validBoundary = !isWordCharacter(previous) &&
        !isWordCharacter(following);

      output += body.trim() && validBoundary
        ? element('em', styles.italic, renderText(body, network, true))
        : escapeLines(token);
      continue;
    }

    if (token.startsWith('~') && token.endsWith('~')) {
      const body = token.slice(1, -1);
      output += network === 'whatsapp' && body.trim()
        ? element('del', styles.strike, renderText(body, network, true))
        : escapeLines(token);
      continue;
    }

    output += escapeLines(token);
  }

  output += escapeLines(text.slice(lastIndex));
  return output;
}

/**
 * API pública usada por js/previews.js.
 *
 * @param {string} rawText - Borrador introducido por el usuario.
 * @param {string} network - Facebook, Instagram, TikTok, WhatsApp o Email.
 * @returns {string} Fragmento HTML seguro para la maqueta.
 */
export function formatSocialCopy(rawText, network = 'facebook') {
  if (rawText === null || rawText === undefined || rawText === '') {
    return '';
  }

  return renderText(String(rawText), resolveNetwork(network));
}
