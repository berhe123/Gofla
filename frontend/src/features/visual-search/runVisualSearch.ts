import { config } from '@/shared/config';
import type { VisualSearchResult } from './api';

function apiBase(): string {
  const base = config.apiUrl.replace(/\/$/, '');
  if (base) return base;
  return import.meta.env.PROD ? 'https://gofla-1.onrender.com' : 'http://localhost:3000';
}

async function parseApiResponse<T>(res: Response): Promise<T> {
  const json = (await res.json()) as { success?: boolean; data?: T; message?: string };
  if (!res.ok || !json?.success || json.data === undefined) {
    throw new Error(json?.message ?? `Visual search failed (${res.status})`);
  }
  return json.data;
}

/** Multipart uploads use fetch (axios can break FormData boundaries / retries). */
export async function runVisualSearch(payload: {
  file?: File;
  color?: string;
  category?: string;
}): Promise<VisualSearchResult> {
  const base = apiBase();

  if (payload.file) {
    const form = new FormData();
    form.append('image', payload.file);
    if (payload.color) form.append('color', payload.color);
    if (payload.category) form.append('category', payload.category);

    try {
      const res = await fetch(`${base}/api/v1/search/visual`, {
        method: 'POST',
        body: form,
      });
      return await parseApiResponse<VisualSearchResult>(res);
    } catch {
      // POST can fail on some hosts when saving uploads — fall back to GET ranking.
    }
  }

  const params = new URLSearchParams();
  if (payload.color) params.set('color', payload.color);
  if (payload.category) params.set('category', payload.category);
  const qs = params.toString();
  const res = await fetch(`${base}/api/v1/search/visual${qs ? `?${qs}` : ''}`);
  return parseApiResponse<VisualSearchResult>(res);
}
