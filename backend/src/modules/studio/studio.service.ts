import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { mapProduct, PRODUCT_INCLUDE } from '../product/product.mapper';

/**
 * Gofla Studio — the signature discovery experience.
 *
 * v1 uses a transparent heuristic ranking (category + color + tag affinity +
 * rating). The API contract is designed so Phase 2 can swap in real image
 * embeddings (pgvector) without changing the frontend.
 */
@Injectable()
export class StudioService {
  // Which categories complete which (style affinity graph).
  private readonly affinity: Record<string, string[]> = {
    shoes: ['bags', 'belts', 'wallets'],
    jackets: ['belts', 'bags', 'shoes'],
    bags: ['wallets', 'keys', 'belts'],
    belts: ['wallets', 'shoes', 'jackets'],
    wallets: ['keys', 'bags', 'belts'],
    keys: ['wallets', 'bags', 'belts'],
  };

  constructor(private readonly prisma: PrismaService) {}

  /** Snap-to-find: rank in-stock products by heuristic visual similarity. */
  async visualSearch(params: { category?: string; color?: string; storedImageUrl?: string }) {
    const color = params.color?.toLowerCase();

    const loadCandidates = async (category?: string) => {
      const where: Prisma.ProductWhereInput = { isActive: true };
      if (category) where.category = { slug: category };
      return this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        take: 60,
        orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      });
    };

    let candidates = await loadCandidates(params.category);
    if (candidates.length === 0 && params.category) {
      candidates = await loadCandidates();
    }

    const ranked = candidates
      .map((p) => {
        let score = p.rating / 5; // base 0..1
        if (p.isFeatured) score += 0.15;
        if (params.category && p.category.slug === params.category) score += 0.2;
        if (color && p.variants.some((v) => v.color?.toLowerCase() === color)) score += 0.4;
        if (color && p.variants.some((v) => v.color?.toLowerCase().includes(color))) score += 0.15;
        return { product: mapProduct(p), score: Number(Math.min(score, 1).toFixed(3)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return {
      query: { color: params.color ?? null, category: params.category ?? null, image: params.storedImageUrl ?? null },
      results: ranked,
      engine: 'heuristic-v1',
    };
  }

  /** Complete the look: a curated bundle of complementary products. */
  async completeTheLook(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException('Product not found');

    const baseSlug = product.category.slug;
    const baseColor = product.variants.find((v) => v.color)?.color?.toLowerCase();
    const complementarySlugs = this.affinity[baseSlug] ?? ['bags', 'wallets', 'belts'];

    const bundle = [mapProduct(product)];
    for (const slug of complementarySlugs) {
      const match = await this.prisma.product.findFirst({
        where: {
          isActive: true,
          category: { slug },
          ...(baseColor
            ? { variants: { some: { color: { equals: baseColor, mode: 'insensitive' } } } }
            : {}),
        },
        include: PRODUCT_INCLUDE,
        orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      });
      const fallback =
        match ??
        (await this.prisma.product.findFirst({
          where: { isActive: true, category: { slug }, id: { not: productId } },
          include: PRODUCT_INCLUDE,
          orderBy: { rating: 'desc' },
        }));
      if (fallback) bundle.push(mapProduct(fallback));
    }

    const fullPrice = Number(bundle.reduce((s, p) => s + p.finalPrice, 0).toFixed(2));
    const bundleDiscountRate = 0.1;
    const bundlePrice = Number((fullPrice * (1 - bundleDiscountRate)).toFixed(2));

    return {
      anchor: mapProduct(product),
      items: bundle,
      fullPrice,
      bundlePrice,
      savings: Number((fullPrice - bundlePrice).toFixed(2)),
      discountRate: bundleDiscountRate,
      theme: baseColor ? `${baseColor} edit` : 'curated look',
    };
  }

  /** Live drops: time-boxed discounted collection with a synthetic countdown. */
  async liveDrops() {
    const discounted = await this.prisma.product.findMany({
      where: { isActive: true, discount: { isNot: null } },
      include: PRODUCT_INCLUDE,
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    const items = (discounted.length
      ? discounted
      : await this.prisma.product.findMany({
          where: { isActive: true, isFeatured: true },
          include: PRODUCT_INCLUDE,
          take: 8,
        })
    ).map(mapProduct);

    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + 8);

    return {
      title: 'Gofla Live Drop',
      subtitle: 'Limited-time picks, refreshed throughout the day.',
      endsAt: endsAt.toISOString(),
      items,
    };
  }
}
