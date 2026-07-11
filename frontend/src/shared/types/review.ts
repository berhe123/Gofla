import type { ReviewStatus } from '../constants';

export interface ReviewDto {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title?: string | null;
  body: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
