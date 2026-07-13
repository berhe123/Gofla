export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const base = publicApiBase();
    if (base && /https?:\/\/localhost(?::\d+)?/i.test(url)) {
      return url.replace(/https?:\/\/localhost(?::\d+)?/i, base);
    }
    return url;
  }

  const base = publicApiBase();
  if (!base) return url;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

function publicApiBase(): string {
  return (process.env.API_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
}
