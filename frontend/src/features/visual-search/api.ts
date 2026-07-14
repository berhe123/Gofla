import { useMutation, useQuery } from '@tanstack/react-query';
import type { ProductDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

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
    mutationFn: async (payload: { file?: File; color?: string; category?: string }) => {
      const form = new FormData();
      if (payload.file) form.append('image', payload.file);
      if (payload.color) form.append('color', payload.color);
      if (payload.category) form.append('category', payload.category);
      return unwrap<VisualSearchResult>(api.post('/search/visual', form));
    },
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
