/** Funciones puras compartidas, sin dependencias de DOM. */
export const escapeHtml = (value = '') => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

export function clone(value) { return JSON.parse(JSON.stringify(value)); }
export function uid(prefix = 'id') {
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${value}`;
}
export function dateLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
export function timeLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}
export const words = text => String(text || '').trim().split(/\s+/).filter(Boolean).length;
export const initials = text => String(text || 'C').trim().split(/\s+/).slice(0, 2).map(x => x[0] || '').join('').toUpperCase();
export function toHandle(text) {
  return String(text || 'mi_pyme').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 28) || 'mi_pyme';
}
export function textHtml(text) {
  // Only supported formatting markers; escape first, then transform. No external links to execute.
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/(^|\s)(#[\p{L}\p{N}_]+)/gu, '$1<span class="hash-tag">$2</span>');
}
