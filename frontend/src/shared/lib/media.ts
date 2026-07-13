import { config } from '@/shared/config';

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const base = config.apiUrl.replace(/\/$/, '');
    if (base && /https?:\/\/localhost(?::\d+)?/i.test(url)) {
      return url.replace(/https?:\/\/localhost(?::\d+)?/i, base);
    }
    return url;
  }

  const base = config.apiUrl.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
