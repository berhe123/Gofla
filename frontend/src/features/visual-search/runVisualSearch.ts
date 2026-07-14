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

/** Upload image and compare against catalog photos on the API. */
export async function runVisualSearch(payload: {
  file?: File;
  color?: string;
  category?: string;
}): Promise<VisualSearchResult> {
  const base = apiBase();

  if (!payload.file) {
    const params = new URLSearchParams();
    if (payload.color) params.set('color', payload.color);
    if (payload.category) params.set('category', payload.category);
    const qs = params.toString();
    const res = await fetch(`${base}/api/v1/search/visual${qs ? `?${qs}` : ''}`);
    return parseApiResponse<VisualSearchResult>(res);
  }

  const form = new FormData();
  form.append('image', payload.file);
  if (payload.color) form.append('color', payload.color);
  if (payload.category) form.append('category', payload.category);

  const res = await fetch(`${base}/api/v1/search/visual`, {
    method: 'POST',
    body: form,
  });
  return parseApiResponse<VisualSearchResult>(res);
}
