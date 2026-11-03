export function safeImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return '';
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('./') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  return '';
}