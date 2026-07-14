/** Production Render API — used when no VITE_API_URL is set at build time. */
const DEFAULT_PROD_API = 'https://gofla-1.onrender.com';

const explicitApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

// Vite dev proxy only — production always loads images directly from the API host.
const useProxy = !import.meta.env.PROD && import.meta.env.VITE_USE_API_PROXY === 'true';

export const config = {
  apiUrl: useProxy
    ? ''
    : explicitApiUrl || (import.meta.env.PROD ? DEFAULT_PROD_API : 'http://localhost:3000'),
  useProxy,
  appName: import.meta.env.VITE_APP_NAME ?? 'Gofla',
  stripeKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
};

export const CATEGORIES = [
  { slug: 'shoes', name: 'Shoes' },
  { slug: 'bags', name: 'Bags' },
  { slug: 'wallets', name: 'Wallets' },
  { slug: 'jackets', name: 'Jackets' },
  { slug: 'belts', name: 'Belts' },
  { slug: 'keys', name: 'Keys' },
] as const;

export const CATEGORY_ORDER = CATEGORIES.map((c) => c.slug);

export function sortCategoriesByOrder<T extends { slug: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug as (typeof CATEGORY_ORDER)[number]);
    const bi = CATEGORY_ORDER.indexOf(b.slug as (typeof CATEGORY_ORDER)[number]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
