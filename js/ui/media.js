import { icon } from './icons.js';
import { escapeHtml as h, initials } from '../core/utils.js';
import { CHANNELS } from '../data/seed.js';

export const DEMO_IMAGE = './assets/images/cafe-editorial.jpg';
export function safeImage(value) {
  return typeof value === 'string' && (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) || value === DEMO_IMAGE || value === './assets/images/community.svg') ? value : '';
}
export function postImage(post) {
  if (Object.hasOwn(post, 'image')) return safeImage(post.image);
  return post.id === 'post-demo-1' || post.id === 'post-demo-2' ? DEMO_IMAGE : post.id === 'post-demo-3' ? './assets/images/community.svg' : '';
}
export function thumbnail(post, className='publication-thumb') {
  const src=postImage(post);
  return src ? `<img class="${className}" src="${h(src)}" alt="Imagen de ${h(post.topic || 'la publicación')}" loading="lazy">` : `<span class="${className} image-placeholder" aria-label="Publicación sin imagen">${icon('layers',26)}</span>`;
}
export function avatar(user, className='profile-avatar', value=user?.avatar) {
  const src=safeImage(value);
  return `<span class="${className}">${src?`<img src="${h(src)}" alt="Foto de ${h(user.name)}">`:h(initials(user?.name || 'Usuario'))}</span>`;
}
export function socialIcon(channel, size=20) {
  const item=CHANNELS.find(c=>c.id===channel) || CHANNELS[0];
  return `<span class="social-brand social-brand--${item.id.toLowerCase()}" aria-hidden="true">${item.id==='TikTok'?'<b>♪</b>':icon(item.icon,size)}</span>`;
}
/** Decode and resize locally. Only the resulting raster data is persisted. */
export async function readImage(file, maxSide=1200) {
  if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Selecciona una imagen JPG, PNG o WebP.');
  if (file.size>5*1024*1024) throw new Error('La imagen debe pesar como máximo 5 MB.');
  const url=URL.createObjectURL(file);
  try {
    const img=new Image(); img.src=url; await img.decode();
    if(!img.naturalWidth || !img.naturalHeight) throw new Error('Imagen inválida.');
    const scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(img.naturalWidth*scale)); canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',0.82);
  } catch {throw new Error('No se pudo abrir la imagen. Prueba con otro archivo JPG, PNG o WebP.');}
  finally {URL.revokeObjectURL(url);}
}
