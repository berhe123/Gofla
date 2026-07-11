import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/store';
import { PageLoader } from '@/shared/ui/page-loader';

export function RequireAuth() {
  const { isAuthenticated, hydrated } = useAuthStore();
  const location = useLocation();
  if (!hydrated) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, hydrated } = useAuthStore();
  if (!hydrated) return <PageLoader />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
