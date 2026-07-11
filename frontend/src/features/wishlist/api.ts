import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WishlistItemDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';
import { useAuthStore } from '@/entities/user/store';

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    enabled: isAuthenticated,
    queryKey: ['wishlist'],
    queryFn: () => unwrap<WishlistItemDto[]>(api.get('/wishlist')),
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, active }: { productId: string; active: boolean }) =>
      unwrap<WishlistItemDto[]>(
        active ? api.delete(`/wishlist/${productId}`) : api.post(`/wishlist/${productId}`),
      ),
    onSuccess: (data) => qc.setQueryData(['wishlist'], data),
  });
}
