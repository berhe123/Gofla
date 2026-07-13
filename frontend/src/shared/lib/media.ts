import { config } from '@/shared/config';

function toRelativeUploadPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/uploads/')) return parsed.pathname;
  } catch {
    /* not a URL */
  }
  return null;
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (config.useProxy) {
      const relative = toRelativeUploadPath(url);
      if (relative) return relative;
    }

    const base = config.apiUrl;
    if (base && /https?:\/\/localhost(?::\d+)?/i.test(url)) {
      return url.replace(/https?:\/\/localhost(?::\d+)?/i, base);
    }
    return url;
  }

  if (config.apiUrl) {
    return `${config.apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  return url.startsWith('/') ? url : `/${url}`;
}
