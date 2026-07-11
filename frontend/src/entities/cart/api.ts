import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CartDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';
import { useAuthStore } from '@/entities/user/store';

export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    enabled: isAuthenticated,
    queryKey: ['cart'],
    queryFn: () => unwrap<CartDto>(api.get('/cart')),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { variantId: string; quantity?: number }) =>
      unwrap<CartDto>(api.post('/cart/items', payload)),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; quantity: number }) =>
      unwrap<CartDto>(api.patch(`/cart/items/${payload.id}`, { quantity: payload.quantity })),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap<CartDto>(api.delete(`/cart/items/${id}`)),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  });
}
