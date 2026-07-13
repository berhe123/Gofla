/* eslint-disable no-console */
import { PrismaClient, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';
import {
  CATEGORY_FOLDER_MAP,
  CATEGORY_META,
  collectCatalogImages,
  IMG_EXT,
  productLabel,
  productSlug,
  readImagesFromDir,
  sortImageFiles,
  UPLOAD_ROOT,
} from './catalog.shared';

const prisma = new PrismaClient();
const SEED_IMAGES_PATH = process.env.SEED_IMAGES_PATH || '';

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickMany<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  return out;
}

function importExternalImagesToUploads(): void {
  if (!SEED_IMAGES_PATH || !fs.existsSync(SEED_IMAGES_PATH)) return;

  const folders = fs.readdirSync(SEED_IMAGES_PATH, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const folder of folders) {
    const slug = CATEGORY_FOLDER_MAP[folder.name.toLowerCase()];
    if (!slug) continue;

    const sourceDir = path.join(SEED_IMAGES_PATH, folder.name);
    const destDir = path.join(UPLOAD_ROOT, slug);
    fs.mkdirSync(destDir, { recursive: true });

    const files = sortImageFiles(
      fs.readdirSync(sourceDir).filter((f) => IMG_EXT.has(path.extname(f).toLowerCase())),
    );

    files.forEach((file, idx) => {
      const ext = path.extname(file).toLowerCase();
      const destName = `${slug}-${idx + 1}${ext}`;
      try {
        fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, destName));
      } catch (e) {
        console.warn(`  ! could not copy ${file}:`, (e as Error).message);
      }
    });
  }
}

function collectImages() {
  const result = collectCatalogImages();

  const missing = Object.entries(result).filter(([, imgs]) => imgs.length === 0).map(([slug]) => slug);
  if (missing.length > 0 && SEED_IMAGES_PATH) {
    console.log(`  ↳ importing external images for: ${missing.join(', ')}`);
    importExternalImagesToUploads();
    for (const slug of missing) {
      result[slug] = readImagesFromDir(slug, path.join(UPLOAD_ROOT, slug));
    }
  }

  return result;
}

async function ensureTag(name: string): Promise<string> {
  const tag = await prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  return tag.id;
}

async function resetCatalog(): Promise<void> {
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
}

async function main() {
  console.log('🌱 Seeding Gofla...');
  console.log(`  ↳ product images root: ${UPLOAD_ROOT}`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@gofla.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  const adminHash = await argon2.hash(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      firstName: 'Gofla',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log(`  ✓ admin: ${adminEmail}`);

  const customerHash = await argon2.hash('Customer123!');
  const customer = await prisma.user.upsert({
    where: { email: 'customer@gofla.com' },
    update: {},
    create: {
      email: 'customer@gofla.com',
      passwordHash: customerHash,
      firstName: 'Demo',
      lastName: 'Customer',
      role: 'CUSTOMER',
      emailVerified: true,
      cart: { create: {} },
    },
  });
  console.log('  ✓ demo customer: customer@gofla.com / Customer123!');

  const TAGS_POOL = ['new', 'bestseller', 'eco', 'limited', 'premium', 'trending', 'gift', 'minimal'];
  const tagIds: Record<string, string> = {};
  for (const t of TAGS_POOL) tagIds[t] = await ensureTag(t);

  if (process.env.NODE_ENV === 'production') {
    console.log('  ↳ skipping catalog reset in production (use catalog-bootstrap on Render)');
  } else {
    await resetCatalog();
  }

  const images = collectImages();
  let productCount = 0;
  const createdProductIds: string[] = [];

  if (process.env.NODE_ENV === 'production' && Object.values(images).every((imgs) => imgs.length === 0)) {
    console.log('  ↳ no local product images in production — skipping catalog seed');
    console.log('\n✅ Seed complete (users only)');
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    for (const [slug, meta] of Object.entries(CATEGORY_META)) {
      const imgs = images[slug];
      if (imgs.length === 0) {
        console.warn(`  ! no images found for ${meta.name} in ${path.join(UPLOAD_ROOT, slug)}`);
        continue;
      }

      const category = await prisma.category.upsert({
        where: { slug },
        update: { name: meta.name, description: meta.description, imageUrl: imgs[0]?.url },
        create: { name: meta.name, slug, description: meta.description, imageUrl: imgs[0]?.url },
      });

      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        const name = productLabel(slug, img.filename);
        const slugified = productSlug(slug, img.filename);
        const basePrice = new Prisma.Decimal(randInt(29, 249) + 0.99);
        const colors = pickMany(meta.colors, Math.min(3, meta.colors.length));
        const sizes = pickMany(meta.sizes, Math.min(4, meta.sizes.length));
        const material = rand(meta.materials);
        const productTags = pickMany(TAGS_POOL, randInt(1, 3));

        const variants: Prisma.ProductVariantCreateWithoutProductInput[] = [];
        for (const color of colors) {
          for (const size of sizes) {
            variants.push({
              sku: `${slug.toUpperCase().slice(0, 3)}-${i + 1}-${color.slice(0, 3).toUpperCase()}-${size.slice(0, 4)}`,
              color,
              size,
              material,
              stock: randInt(5, 40),
            });
          }
        }

        const product = await prisma.product.create({
          data: {
            name,
            slug: slugified,
            description: `${meta.description} ${name} is crafted from ${material.toLowerCase()} for lasting quality.`,
            brand: rand(meta.brands),
            basePrice,
            currency: 'USD',
            isFeatured: i < 3,
            rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
            reviewCount: randInt(0, 240),
            categoryId: category.id,
            images: {
              create: [{ url: img.url, alt: name, position: 0, isPrimary: true }],
            },
            variants: { create: variants },
            tags: { create: productTags.map((t) => ({ tagId: tagIds[t] })) },
            discount:
              Math.random() > 0.7
                ? { create: { type: 'PERCENT', value: new Prisma.Decimal(randInt(5, 25)) } }
                : undefined,
          },
        });
        createdProductIds.push(product.id);
        productCount++;
      }
      console.log(`  ✓ category ${meta.name}: ${imgs.length} products (local images)`);
    }

    for (const pid of createdProductIds.slice(0, 6)) {
      try {
        await prisma.review.create({
          data: {
            productId: pid,
            userId: customer.id,
            rating: randInt(4, 5),
            title: 'Love it!',
            body: 'Exactly as described — great quality and fast shipping. Highly recommend.',
            status: 'APPROVED',
            verifiedPurchase: true,
          },
        });
      } catch {
        /* unique constraint — skip */
      }
    }

    console.log(`\n✅ Seed complete: ${productCount} products from ${UPLOAD_ROOT}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
