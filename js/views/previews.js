/** Solo vistas de las aplicaciones: no accede a estado, servicios ni DOM. */
import { icon } from '../ui/icons.js';
import { escapeHtml as h, initials, toHandle, textHtml } from '../core/utils.js';

function fb(text, company) {
  return `<article class="preview-facebook" aria-label="Simulación de publicación de Facebook"><header class="social-head"><div class="facebook-avatar">${h(initials(company.name))}</div><div><b>${h(company.name)}</b><small>Ahora · 🌐 Público</small></div><span class="social-more">${icon('more',20)}</span></header>
  <div class="social-copy">${textHtml(text)}</div><div class="facebook-image"><div class="facebook-image-art">${icon('sparkles',40)}<strong>${h(company.name)}</strong><span>${h(company.sector)}</span></div></div>
  <div class="fb-metrics"><span>👍 ❤️ 128</span><span>12 comentarios · 5 compartidos</span></div><footer class="social-actions"><span>${icon('heart',17)} Me gusta</span><span>${icon('message',17)} Comentar</span><span>${icon('arrow',17)} Compartir</span></footer></article>`;
}
function ig(text, company) {
  return `<article class="preview-instagram" aria-label="Simulación de publicación de Instagram"><header class="ig-top"><span class="ig-avatar"><span>${h(initials(company.name))}</span></span><b>${h(toHandle(company.name))}</b><span class="social-more">${icon('more',21)}</span></header>
  <div class="ig-image"><div class="ig-image-ornament">✦</div><span>UNA HISTORIA PARA CONTAR</span><h3>${h(company.name)}</h3><p>${h(company.sector)}</p></div>
  <div class="ig-controls"><span>${icon('heart',23)} ${icon('message',23)} ${icon('arrow',23)}</span>${icon('library',21)}</div>
  <div class="ig-body"><b>128 Me gusta</b><div class="ig-caption"><strong>${h(toHandle(company.name))}</strong> ${textHtml(text)}</div><small>VISTA PREVIA · DEMOSTRACIÓN</small></div></article>`;
}
function tt(text, company) {
  return `<article class="preview-tiktok" aria-label="Simulación de video TikTok"><div class="tt-top"><span>Siguiendo</span><strong>Para ti</strong>${icon('search',18)}</div><div class="tt-visual"><div class="tt-big-symbol">${icon('sparkles',60)}</div><p>${h(company.name)}</p><b>Tu historia en pantalla</b></div><div class="tt-actions"><span class="tt-avatar">${h(initials(company.name))}</span><span>${icon('heart',27)}<small>1.2K</small></span><span>${icon('messagecircle',26)}<small>64</small></span><span>${icon('arrow',26)}<small>Compartir</small></span></div><div class="tt-bottom"><strong>@${h(toHandle(company.name))}</strong><div class="tt-caption">${textHtml(text)}</div><small>♫ Sonido original · ${h(company.name)}</small></div><div class="tt-bar">⌂　⌕　＋　▣　◉</div></article>`;
}
function wa(text, company) {
  return `<article class="preview-whatsapp" aria-label="Simulación de conversación de WhatsApp"><header class="wa-head"><span>${icon('back',17)}</span><span class="wa-avatar">${h(initials(company.name))}</span><span class="wa-contact"><strong>${h(company.name)}</strong><small>Cuenta de empresa · Demo</small></span>${icon('video',18)} ${icon('more',18)}</header>
  <div class="wa-background"><div class="wa-date">HOY</div><div class="wa-bubble">${textHtml(text)}<small>10:42 ✓✓</small></div></div><footer class="wa-footer"><span>☺</span><span>Mensaje</span>${icon('plus',19)}<span class="wa-send">➤</span></footer></article>`;
}
function email(text, company) {
  return `<article class="preview-email" aria-label="Simulación de correo electrónico"><header class="email-toolbar"><span>${icon('back',16)}</span><b>Bandeja de entrada</b><span class="social-more">${icon('more',19)}</span></header><div class="email-details"><h4>Una novedad de ${h(company.name)}</h4><span>Recibidos · Hoy</span><div class="email-sender"><span class="email-avatar">${h(initials(company.name))}</span><div><b>${h(company.name)}</b><small>demo@ejemplo.test</small></div></div></div><div class="email-template"><div class="email-brand">${icon('sparkles',22)}<strong>${h(company.name)}</strong></div><div class="email-message">${textHtml(text)}</div><div class="email-button">Conoce más</div><small>Este correo es una simulación de diseño; no se envía.</small></div></article>`;
}
export function previewView(channel, text, company) {
  if (!text?.trim()) return `<div class="preview-empty">${icon('eye',36)}<h3>Tu contenido aparecerá aquí</h3><p>Describe una campaña y genera una propuesta para visualizarla en ${h(channel)}.</p></div>`;
  const data = company || {name:'Tu empresa',sector:'Mi negocio'};
  switch(channel) { case 'Instagram': return ig(text,data); case 'TikTok': return tt(text,data); case 'WhatsApp': return wa(text,data); case 'Email': return email(text,data); default: return fb(text,data); }
}
