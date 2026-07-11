import { useQuery } from '@tanstack/react-query';
import type { CategoryDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => unwrap<CategoryDto[]>(api.get('/categories')),
    staleTime: 5 * 60_000,
  });
}
