export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
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
