import { Prisma } from '@prisma/client';

export type ProductWithRelations = Prisma.ProductGetPayload<{  include: {
    category: true;
    images: true;
    variants: true;
    discount: true;
    tags: { include: { tag: true } };
  };
}>;

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

export function computeFinalPrice(
  basePrice: Prisma.Decimal | number,
  discount?: { type: string; value: Prisma.Decimal | number } | null,
): number {
  const base = toNumber(basePrice);
  if (!discount) return Number(base.toFixed(2));
  const value = toNumber(discount.value);
  const final = discount.type === 'PERCENT' ? base * (1 - value / 100) : base - value;
  return Number(Math.max(final, 0).toFixed(2));
}

export function mapProduct(p: ProductWithRelations) {
  const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    brand: p.brand,
    basePrice: toNumber(p.basePrice),
    currency: p.currency,
    isFeatured: p.isFeatured,
    rating: p.rating,
    reviewCount: p.reviewCount,
    categoryId: p.categoryId,
    category: p.category
      ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
      : null,
    images: p.images
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        position: img.position,
        isPrimary: img.isPrimary,
      })),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      material: v.material,
      price: v.price ? toNumber(v.price) : null,
      stock: v.stock,
    })),
    tags: p.tags.map((t) => t.tag.name),
    discount: p.discount
      ? {
          id: p.discount.id,
          type: p.discount.type,
          value: toNumber(p.discount.value),
        }
      : null,
    finalPrice: computeFinalPrice(p.basePrice, p.discount),
    inStock: totalStock > 0,
    createdAt: p.createdAt.toISOString(),
  };
}

export const PRODUCT_INCLUDE = {
  category: true,
  images: true,
  variants: true,
  discount: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ProductInclude;
