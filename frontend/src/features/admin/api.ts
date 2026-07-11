import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap } from '@/shared/api/client';

export interface Analytics {
  kpis: {
    revenue: number;
    orders: number;
    customers: number;
    products: number;
    pendingReviews: number;
    lowStockVariants: number;
  };
  salesByDay: { date: string; total: number }[];
  topProducts: { name: string; units: number }[];
  recentOrders: { id: string; number: string; status: string; total: number; customer: string; createdAt: string }[];
}

export function useAnalytics() {
  return useQuery({ queryKey: ['admin-analytics'], queryFn: () => unwrap<Analytics>(api.get('/admin/analytics')) });
}

export function useAdminOrders() {
  return useQuery({ queryKey: ['admin-orders'], queryFn: () => unwrap<any[]>(api.get('/admin/orders')) });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; status: string; trackingNumber?: string }) =>
      unwrap(api.patch(`/admin/orders/${payload.id}/status`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
}

export function useAdminUsers() {
  return useQuery({ queryKey: ['admin-users'], queryFn: () => unwrap<any[]>(api.get('/admin/users')) });
}

export function usePendingReviews() {
  return useQuery({ queryKey: ['admin-reviews'], queryFn: () => unwrap<any[]>(api.get('/admin/reviews/pending')) });
}

export function useModerateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; action: 'approve' | 'reject' }) =>
      unwrap(api.patch(`/admin/reviews/${payload.id}/${payload.action}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(api.delete(`/admin/products/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => unwrap(api.post('/admin/products', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
