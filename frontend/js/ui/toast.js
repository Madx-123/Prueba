import { icon } from './icons.js';
export function notify(message, type = 'info') {
  const target = document.getElementById('toast-region');
  if (!target) return;
  const node = document.createElement('div');
  node.className = `toast toast--${['success','error','info'].includes(type) ? type : 'info'}`;
  const glyph = document.createElement('span');
  glyph.innerHTML = icon(type === 'success' ? 'check' : type === 'error' ? 'alert' : 'info', 18);
  const body = document.createElement('span');
  body.textContent = message;
  const close = document.createElement('button');
  close.type = 'button'; close.className = 'toast__close'; close.setAttribute('aria-label','Cerrar notificación');
  close.innerHTML = icon('close',15);
  close.addEventListener('click', () => node.remove());
  node.append(glyph, body, close); target.append(node);
  setTimeout(() => node.remove(), 4400);
}
