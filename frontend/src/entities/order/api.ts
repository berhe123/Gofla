import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrderDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

export interface CheckoutPayload {
  address: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => unwrap<OrderDto[]>(api.get('/orders')),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['order', id],
    queryFn: () => unwrap<OrderDto>(api.get(`/orders/${id}`)),
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckoutPayload) =>
      unwrap<{ order: OrderDto; payment: { clientSecret: string | null; mocked: boolean } }>(
        api.post('/checkout', payload),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
