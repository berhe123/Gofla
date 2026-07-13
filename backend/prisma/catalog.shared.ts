import * as fs from 'fs';
import * as path from 'path';

export const UPLOAD_ROOT = path.resolve(__dirname, '..', 'uploads', 'products');

export const CATEGORY_FOLDER_MAP: Record<string, string> = {
  shoes: 'shoes',
  bags: 'bags',
  wallets: 'wallets',
  jacket: 'jackets',
  jackets: 'jackets',
  belt: 'belts',
  belts: 'belts',
  keys: 'keys',
};

export const CATEGORY_META: Record<
  string,
  { name: string; description: string; brands: string[]; colors: string[]; sizes: string[]; materials: string[] }
> = {
  shoes: {
    name: 'Shoes',
    description: 'Sneakers, boots and everyday footwear engineered for comfort and style.',
    brands: ['Gofla Tread', 'Stride', 'Aero', 'Cobble & Co'],
    colors: ['Black', 'White', 'Tan', 'Navy', 'Olive'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    materials: ['Leather', 'Suede', 'Mesh', 'Canvas'],
  },
  bags: {
    name: 'Bags',
    description: 'Totes, backpacks and crossbody bags that carry your day in style.',
    brands: ['Gofla Carry', 'Hauz', 'Nomad', 'Lume'],
    colors: ['Black', 'Brown', 'Beige', 'Burgundy'],
    sizes: ['One Size', 'Small', 'Medium', 'Large'],
    materials: ['Full-grain Leather', 'Vegan Leather', 'Nylon', 'Canvas'],
  },
  wallets: {
    name: 'Wallets',
    description: 'Slim, RFID-safe wallets and cardholders crafted to last.',
    brands: ['Gofla Fold', 'Mint', 'Vault', 'Pebble'],
    colors: ['Black', 'Brown', 'Cognac', 'Charcoal'],
    sizes: ['One Size'],
    materials: ['Leather', 'Carbon Fiber', 'Saffiano'],
  },
  jackets: {
    name: 'Jackets',
    description: 'Outerwear that moves with you — from city layers to all-weather shells.',
    brands: ['Gofla Layer', 'North & Co', 'Ridge', 'Cumulus'],
    colors: ['Black', 'Khaki', 'Forest', 'Stone', 'Navy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    materials: ['Cotton', 'Wool Blend', 'Nylon Shell', 'Denim'],
  },
  belts: {
    name: 'Belts',
    description: 'Premium leather belts with timeless buckles for every outfit.',
    brands: ['Gofla Cinch', 'Bridle', 'Anchor'],
    colors: ['Black', 'Brown', 'Tan'],
    sizes: ['85cm', '90cm', '95cm', '100cm', '105cm'],
    materials: ['Full-grain Leather', 'Suede', 'Woven'],
  },
  keys: {
    name: 'Keys & Accessories',
    description: 'Keychains, organizers and small accessories that keep you sorted.',
    brands: ['Gofla Clip', 'Loop', 'Tether'],
    colors: ['Silver', 'Black', 'Gold', 'Gunmetal'],
    sizes: ['One Size'],
    materials: ['Stainless Steel', 'Brass', 'Leather'],
  },
};

export const CATEGORY_ORDER = ['shoes', 'bags', 'wallets', 'jackets', 'belts', 'keys'] as const;

export const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

export type ImageEntry = { url: string; filename: string };

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function sortImageFiles(files: string[]): string[] {
  return [...files].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Store relative URLs so the same DB works locally and on Render. */
export function imageUrlFor(categorySlug: string, filename: string): string {
  return `/uploads/products/${categorySlug}/${filename}`;
}

export function readImagesFromDir(categorySlug: string, dir: string): ImageEntry[] {
  if (!fs.existsSync(dir)) return [];
  const files = sortImageFiles(
    fs.readdirSync(dir).filter((f) => IMG_EXT.has(path.extname(f).toLowerCase())),
  );
  return files.map((file) => ({
    filename: file,
    url: imageUrlFor(categorySlug, file),
  }));
}

export function collectCatalogImages(uploadRoot = UPLOAD_ROOT): Record<string, ImageEntry[]> {
  const result: Record<string, ImageEntry[]> = {};
  for (const slug of Object.keys(CATEGORY_META)) {
    result[slug] = readImagesFromDir(slug, path.join(uploadRoot, slug));
  }
  return result;
}

export function productLabel(slug: string, filename: string): string {
  const meta = CATEGORY_META[slug];
  const base = path.basename(filename, path.extname(filename));
  const match = base.match(/-(\d+)$/);
  const index = match?.[1];
  if (index) return `${meta.name} ${index}`;
  return base.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function productSlug(slug: string, filename: string): string {
  const base = path.basename(filename, path.extname(filename));
  return slugify(`${slug}-${base}`);
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
