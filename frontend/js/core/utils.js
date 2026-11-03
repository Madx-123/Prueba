export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function initials(name) {
  if (!name) return 'CA';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function toHandle(name) {
  if (!name) return 'contentai';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function textHtml(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}