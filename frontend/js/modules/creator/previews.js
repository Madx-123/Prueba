import { safeImage } from '../../ui/media.js';
import { icon } from '../../ui/icons.js';
import { escapeHtml as h, initials, toHandle, textHtml } from '../../core/utils.js';

function mediaImage(image, className='social-uploaded-image') { 
  return `<img class="${className}" src="${h(image)}" alt="Imagen de la publicación">`; 
}

function fb(text, company, image) {
  return `<article class="preview-facebook" aria-label="Simulación de publicación de Facebook"><header class="social-head"><div class="facebook-avatar">${h(initials(company.name))}</div><div><b>${h(company.name)}</b><small>Ahora · Público</small></div><span class="social-more">${icon('more',20)}</span></header>
  <div class="social-copy">${textHtml(text)}</div>${image?`<div class="facebook-image has-uploaded-image">${mediaImage(image)}</div>`:`<div class="facebook-image"><div class="facebook-image-art">${icon('sparkles',36)}<strong>${h(company.name)}</strong><span>${h(company.sector)}</span></div></div>`}
  <div class="fb-metrics"><span>${icon('heart',13)} 128</span><span>12 comentarios · 5 compartidos</span></div><footer class="social-actions"><span>${icon('heart',16)} Me gusta</span><span>${icon('message',16)} Comentar</span><span>${icon('arrow',16)} Compartir</span></footer></article>`;
}

function ig(text, company, image) {
  return `<article class="preview-instagram" aria-label="Simulación de publicación de Instagram"><header class="ig-top"><span class="ig-avatar"><span>${h(initials(company.name))}</span></span><b>${h(toHandle(company.name))}</b><span class="social-more">${icon('more',20)}</span></header>
  ${image?`<div class="ig-image has-uploaded-image">${mediaImage(image)}</div>`:`<div class="ig-image"><div class="ig-image-ornament">${icon('sparkles',42)}</div><span>HISTORIA DE MARCA</span><h3>${h(company.name)}</h3><p>${h(company.sector)}</p></div>`}
  <div class="ig-controls"><span>${icon('heart',21)} ${icon('message',21)} ${icon('arrow',21)}</span>${icon('library',20)}</div>
  <div class="ig-body"><b>128 Me gusta</b><div class="ig-caption"><strong>${h(toHandle(company.name))}</strong> ${textHtml(text)}</div><small>VISTA PREVIA · CONTENTAI STUDIO</small></div></article>`;
}

function tt(text, company, image) {
  return `<article class="preview-tiktok ${image?'has-uploaded-image':''}" aria-label="Simulación de video TikTok"><div class="tt-top"><span>Siguiendo</span><strong>Para ti</strong>${icon('search',17)}</div>${image?mediaImage(image,'tt-uploaded-image'):`<div class="tt-visual"><div class="tt-big-symbol">${icon('video',52)}</div><p>${h(company.name)}</p><b>Guion visual en pantalla</b></div>`}<div class="tt-actions"><span class="tt-avatar">${h(initials(company.name))}</span><span>${icon('heart',24)}<small>1.2K</small></span><span>${icon('messagecircle',24)}<small>64</small></span><span>${icon('arrow',24)}<small>Compartir</small></span></div><div class="tt-bottom"><strong>@${h(toHandle(company.name))}</strong><div class="tt-caption">${textHtml(text)}</div><small>Audio original - ${h(company.name)}</small></div><div class="tt-bar"></div></article>`;
}

function wa(text, company, image) {
  return `<article class="preview-whatsapp" aria-label="Simulación de conversación de WhatsApp"><header class="wa-head"><span>${icon('back',17)}</span><span class="wa-avatar">${h(initials(company.name))}</span><span class="wa-contact"><strong>${h(company.name)}</strong><small>Cuenta de empresa</small></span>${icon('video',18)} ${icon('more',18)}</header>
  <div class="wa-background"><div class="wa-date">HOY</div><div class="wa-bubble">${image?mediaImage(image):''}${textHtml(text)}<small>10:42</small></div></div><footer class="wa-footer"><span>${icon('plus',18)}</span><span>Escribe un mensaje...</span><span class="wa-send">${icon('arrow',15)}</span></footer></article>`;
}

function email(text, company, image) {
  return `<article class="preview-email" aria-label="Simulación de correo electrónico"><header class="email-toolbar"><span>${icon('back',16)}</span><b>Bandeja de entrada</b><span class="social-more">${icon('more',19)}</span></header><div class="email-details"><h4>Comunicado de ${h(company.name)}</h4><span>Recibidos · Hoy</span><div class="email-sender"><span class="email-avatar">${h(initials(company.name))}</span><div><b>${h(company.name)}</b><small>contacto@${h(toHandle(company.name))}.com</small></div></div></div><div class="email-template"><div class="email-brand">${icon('mail',20)}<strong>${h(company.name)}</strong></div>${image?mediaImage(image):''}<div class="email-message">${textHtml(text)}</div><div class="email-button">Conoce más</div><small>Simulación de boletín corporativo.</small></div></article>`;
}

export function previewView(channel, text, company, imageValue='') {
  const image = safeImage(imageValue);
  text = String(text || '');
  
  if (!text.trim() && !image) {
    return `<div class="preview-empty">${icon('eye',36)}<h3>Simulador listo</h3><p>Configura tu mensaje o añade una imagen a la izquierda para previsualizar el diseño en ${h(channel)}.</p></div>`;
  }
  
  const data = company || {name:'Tu empresa', sector:'Mi negocio'};
  switch(channel) { 
    case 'Instagram': return ig(text, data, image); 
    case 'TikTok': return tt(text, data, image); 
    case 'WhatsApp': return wa(text, data, image); 
    case 'Email': return email(text, data, image); 
    default: return fb(text, data, image); 
  }
}