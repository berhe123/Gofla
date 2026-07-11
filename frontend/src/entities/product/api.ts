import { useQuery } from '@tanstack/react-query';
import type { Paginated, ProductDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

export interface ProductFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  sort?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () =>
      unwrap<Paginated<ProductDto>>(api.get('/products', { params: cleanParams(filters) })),
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    enabled: !!slug,
    queryKey: ['product', slug],
    queryFn: () => unwrap<ProductDto>(api.get(`/products/slug/${slug}`)),
  });
}

export function useRelatedProducts(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['product-related', id],
    queryFn: () => unwrap<ProductDto[]>(api.get(`/products/${id}/related`)),
  });
}

function cleanParams(filters: ProductFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  );
}
