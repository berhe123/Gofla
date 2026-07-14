import { useMutation, useQuery } from '@tanstack/react-query';
import type { ProductDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';
import { runVisualSearch } from './runVisualSearch';

export interface VisualSearchResult {
  query: { color: string | null; category: string | null; image: string | null };
  results: { product: ProductDto; score: number }[];
  engine: string;
}

export interface LiveDrop {
  title: string;
  subtitle: string;
  endsAt: string;
  items: ProductDto[];
}

export interface CompleteTheLook {
  anchor: ProductDto;
  items: ProductDto[];
  fullPrice: number;
  bundlePrice: number;
  savings: number;
  discountRate: number;
  theme: string;
}

export function useVisualSearch() {
  return useMutation({
    mutationFn: (payload: { file?: File; color?: string; category?: string }) => runVisualSearch(payload),
  });
}

export function useLiveDrops() {
  return useQuery({
    queryKey: ['live-drops'],
    queryFn: () => unwrap<LiveDrop>(api.get('/studio/live-drops')),
  });
}

export function useCompleteTheLook(productId: string | undefined) {
  return useQuery({
    enabled: !!productId,
    queryKey: ['complete-the-look', productId],
    queryFn: () => unwrap<CompleteTheLook>(api.get(`/products/${productId}/complete-the-look`)),
  });
}
