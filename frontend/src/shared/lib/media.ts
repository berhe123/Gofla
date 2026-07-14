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

/** Turn API image paths into browser-loadable URLs (local, proxy, or direct Render). */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  const base = config.apiUrl.replace(/\/$/, '');

  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (config.useProxy) {
      const relative = toRelativeUploadPath(url);
      if (relative) return relative;
    }

    if (base && /https?:\/\/localhost(?::\d+)?/i.test(url)) {
      return url.replace(/https?:\/\/localhost(?::\d+)?/i, base);
    }

    // Rewrite stale Render hosts to the configured API base.
    if (base && /https?:\/\/[^/]+\.onrender\.com/i.test(url)) {
      const relative = toRelativeUploadPath(url);
      if (relative) return config.useProxy ? relative : `${base}${relative}`;
    }

    return url;
  }

  const path = url.startsWith('/') ? url : `/${url}`;

  if (config.useProxy) return path;

  if (base) return `${base}${path}`;

  return path;
}
