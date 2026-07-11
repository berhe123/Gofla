import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReviewDto, ReviewSummary } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

export function useReviews(productId: string | undefined) {
  return useQuery({
    enabled: !!productId,
    queryKey: ['reviews', productId],
    queryFn: () => unwrap<ReviewDto[]>(api.get(`/products/${productId}/reviews`)),
  });
}

export function useReviewSummary(productId: string | undefined) {
  return useQuery({
    enabled: !!productId,
    queryKey: ['review-summary', productId],
    queryFn: () => unwrap<ReviewSummary>(api.get(`/products/${productId}/reviews/summary`)),
  });
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { rating: number; title?: string; body: string }) =>
      unwrap<ReviewDto>(api.post(`/products/${productId}/reviews`, payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
      qc.invalidateQueries({ queryKey: ['review-summary', productId] });
    },
  });
}
