/**
 * Добавляет к абсолютному пути ассета из папки public/ текущий base path
 * (import.meta.env.BASE_URL). Нужно для корректной работы на GitHub Pages,
 * где сайт живёт не в корне домена (например /smart-hub/), а не только
 * локально/на Vercel, где base = '/'.
 *
 * withBase('/images/lamp.png') -> '/images/lamp.png' локально
 *                               -> '/smart-hub/images/lamp.png' на GH Pages
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  if (/^https?:\/\//.test(path)) return path;
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
