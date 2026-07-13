/**
 * Production catalog bootstrap — upserts categories + products from bundled uploads.
 * One image file = one product, grouped by category folder.
 */
import { Prisma, PrismaClient } from '@prisma/client';
import {
  CATEGORY_META,
  collectCatalogImages,
  productLabel,
  productSlug,
  randInt,
  UPLOAD_ROOT,
} from './catalog.shared';

const prisma = new PrismaClient();

function pickMany<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return out;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function ensureTag(name: string): Promise<string> {
  const tag = await prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  return tag.id;
}

async function removeStaleProducts(categorySlug: string, expectedSlugs: Set<string>): Promise<number> {
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category || expectedSlugs.size === 0) return 0;

  const stale = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      slug: { notIn: [...expectedSlugs] },
    },
    select: { id: true },
  });

  if (stale.length === 0) return 0;

  await prisma.product.deleteMany({ where: { id: { in: stale.map((p) => p.id) } } });
  return stale.length;
}

async function main() {
  const images = collectCatalogImages();
  const totalImages = Object.values(images).reduce((sum, imgs) => sum + imgs.length, 0);

  if (totalImages === 0) {
    console.log(`Catalog bootstrap skipped — no images in ${UPLOAD_ROOT}`);
    return;
  }

  console.log(`Catalog bootstrap: ${totalImages} images across ${Object.keys(CATEGORY_META).length} categories`);

  const tagIds: Record<string, string> = {};
  for (const t of ['new', 'bestseller', 'premium', 'trending']) {
    tagIds[t] = await ensureTag(t);
  }

  let productCount = 0;

  for (const [slug, meta] of Object.entries(CATEGORY_META)) {
    const imgs = images[slug];
    const expectedSlugs = new Set(imgs.map((img) => productSlug(slug, img.filename)));
    const removed = await removeStaleProducts(slug, expectedSlugs);
    if (removed > 0) {
      console.log(`  ↳ removed ${removed} stale ${meta.name} products`);
    }

    if (imgs.length === 0) {
      console.log(`  ↳ ${meta.name}: no images`);
      continue;
    }

    const category = await prisma.category.upsert({
      where: { slug },
      update: { name: meta.name, description: meta.description, imageUrl: imgs[0].url },
      create: { name: meta.name, slug, description: meta.description, imageUrl: imgs[0].url },
    });

    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      const name = productLabel(slug, img.filename);
      const slugified = productSlug(slug, img.filename);
      const basePrice = new Prisma.Decimal(randInt(29, 249) + 0.99);
      const colors = pickMany(meta.colors, Math.min(3, meta.colors.length));
      const sizes = pickMany(meta.sizes, Math.min(4, meta.sizes.length));
      const material = rand(meta.materials);
      const skuBase = `${slug.toUpperCase().slice(0, 3)}-${i + 1}`;

      const existing = await prisma.product.findUnique({
        where: { slug: slugified },
        include: { images: true, variants: true },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name,
            description: `${meta.description} ${name} is crafted from ${material.toLowerCase()} for lasting quality.`,
            brand: rand(meta.brands),
            isFeatured: i < 3,
            categoryId: category.id,
          },
        });

        const primary = existing.images.find((image) => image.isPrimary) ?? existing.images[0];
        if (primary) {
          await prisma.productImage.update({
            where: { id: primary.id },
            data: { url: img.url, alt: name },
          });
        } else {
          await prisma.productImage.create({
            data: { productId: existing.id, url: img.url, alt: name, position: 0, isPrimary: true },
          });
        }
      } else {
        const variants: Prisma.ProductVariantCreateWithoutProductInput[] = [];
        for (const color of colors) {
          for (const size of sizes) {
            variants.push({
              sku: `${skuBase}-${color.slice(0, 3).toUpperCase()}-${size.slice(0, 4)}`,
              color,
              size,
              material,
              stock: randInt(5, 40),
            });
          }
        }

        await prisma.product.create({
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
            tags: {
              create: [{ tagId: tagIds.new }, ...(i < 2 ? [{ tagId: tagIds.bestseller }] : [])],
            },
          },
        });
      }

      productCount++;
    }

    console.log(`  ✓ ${meta.name}: ${imgs.length} products`);
  }

  console.log(`Catalog bootstrap OK — ${productCount} products`);
}

main()
  .catch((e) => {
    console.error('Catalog bootstrap failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
