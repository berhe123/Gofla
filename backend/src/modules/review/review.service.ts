import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listForProduct(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      userId: r.userId,
      authorName: `${r.user.firstName} ${r.user.lastName.charAt(0)}.`,
      rating: r.rating,
      title: r.title,
      body: r.body,
      status: r.status,
      verifiedPurchase: r.verifiedPurchase,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async summary(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      select: { rating: true },
    });
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    reviews.forEach((r) => (distribution[r.rating] = (distribution[r.rating] || 0) + 1));
    const count = reviews.length;
    const average = count ? Number((reviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(2)) : 0;
    return { average, count, distribution };
  }

  async create(userId: string, productId: string, dto: CreateReviewDto) {
    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });
    if (existing) throw new BadRequestException('You already reviewed this product');

    // Verified purchase check
    const purchased = await this.prisma.orderItem.findFirst({
      where: {
        order: { userId, status: { in: ['PAID', 'FULFILLED', 'SHIPPED', 'DELIVERED'] } },
        variant: { productId },
      },
    });

    const moderation = this.config.get<boolean>('commerce.reviewModeration');
    const status: ReviewStatus = moderation ? 'PENDING' : 'APPROVED';

    const review = await this.prisma.review.create({
      data: {
        productId,
        userId,
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
        status,
        verifiedPurchase: !!purchased,
      },
    });

    if (status === 'APPROVED') await this.recomputeRating(productId);
    return review;
  }

  // --- Admin moderation ---
  async listPending() {
    return this.prisma.review.findMany({
      where: { status: 'PENDING' },
      include: { user: true, product: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async moderate(id: string, status: 'APPROVED' | 'REJECTED') {
    const review = await this.prisma.review.update({ where: { id }, data: { status } });
    await this.recomputeRating(review.productId);
    return review;
  }

  private async recomputeRating(productId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: Number((agg._avg.rating ?? 0).toFixed(2)),
        reviewCount: agg._count,
      },
    });
  }
}
