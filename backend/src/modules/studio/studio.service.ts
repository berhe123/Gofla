import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { mapProduct, PRODUCT_INCLUDE, ProductWithRelations } from '../product/product.mapper';
import { ImageSimilarityService } from './image-similarity.service';

@Injectable()
export class StudioService {
  private readonly affinity: Record<string, string[]> = {
    shoes: ['bags', 'belts', 'wallets'],
    jackets: ['belts', 'bags', 'shoes'],
    bags: ['wallets', 'keys', 'belts'],
    belts: ['wallets', 'shoes', 'jackets'],
    wallets: ['keys', 'bags', 'belts'],
    keys: ['wallets', 'bags', 'belts'],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly imageSimilarity: ImageSimilarityService,
  ) {}

  async visualSearch(params: {
    category?: string;
    color?: string;
    storedImageUrl?: string;
    imageBuffer?: Buffer;
  }) {
    const color = params.color?.toLowerCase();

    const candidates = await this.loadCandidates(params.category);

    if (params.imageBuffer) {
      return this.visualSearchByImage(params, candidates, color);
    }

    return this.heuristicRank(candidates, params.category, color, params.storedImageUrl, 'heuristic-v1');
  }

  private async visualSearchByImage(
    params: { category?: string; color?: string; storedImageUrl?: string; imageBuffer?: Buffer },
    candidates: ProductWithRelations[],
    color?: string,
  ) {
    const buffer = params.imageBuffer!;
    const pool = candidates.length > 0 ? candidates : await this.loadCandidates();

    const scored = await Promise.all(
      pool.map(async (p) => {
        const primary = p.images.find((img) => img.isPrimary) ?? p.images[0];
        let visualScore = 0;

        if (primary?.url) {
          const similarity = await this.imageSimilarity.scoreCatalogImage(buffer, primary.url);
          visualScore = similarity ?? 0;
        }

        let score = visualScore * 0.9;
        if (params.category && p.category.slug === params.category) score += 0.05;
        if (color && p.variants.some((v) => v.color?.toLowerCase() === color)) score += 0.05;

        return { product: mapProduct(p), score: Number(Math.min(score, 1).toFixed(3)), visualScore };
      }),
    );

    const ranked = scored
      .filter((r) => r.visualScore >= 0.45)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    if (ranked.length > 0) {
      return {
        query: {
          color: params.color ?? null,
          category: params.category ?? null,
          image: params.storedImageUrl ?? null,
        },
        results: ranked.map(({ product, score }) => ({ product, score })),
        engine: 'dhash-v1',
      };
    }

    // No close visual hits — widen pool and return best available matches.
    const fallback = scored
      .sort((a, b) => b.visualScore - a.visualScore || b.score - a.score)
      .slice(0, 12)
      .map(({ product, score }) => ({ product, score }));

    return {
      query: {
        color: params.color ?? null,
        category: params.category ?? null,
        image: params.storedImageUrl ?? null,
      },
      results: fallback,
      engine: 'dhash-v1-fallback',
    };
  }

  private async loadCandidates(category?: string) {
    const where: Prisma.ProductWhereInput = { isActive: true };
    if (category) where.category = { slug: category };

    let products = await this.prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
    });

    if (products.length === 0 && category) {
      products = await this.prisma.product.findMany({
        where: { isActive: true },
        include: PRODUCT_INCLUDE,
        orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      });
    }

    return products;
  }

  private heuristicRank(
    candidates: ProductWithRelations[],
    category?: string,
    color?: string,
    storedImageUrl?: string,
    engine = 'heuristic-v1',
  ) {
    const ranked = candidates
      .map((p) => {
        let score = p.rating / 5;
        if (p.isFeatured) score += 0.15;
        if (category && p.category.slug === category) score += 0.2;
        if (color && p.variants.some((v) => v.color?.toLowerCase() === color)) score += 0.4;
        if (color && p.variants.some((v) => v.color?.toLowerCase().includes(color))) score += 0.15;
        return { product: mapProduct(p), score: Number(Math.min(score, 1).toFixed(3)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return {
      query: { color: color ?? null, category: category ?? null, image: storedImageUrl ?? null },
      results: ranked,
      engine,
    };
  }

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
