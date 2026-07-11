import { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/api/query-client';
import { useAuthStore } from '@/entities/user/store';
import { useThemeStore } from '@/features/theme/store';

export function Providers({ children }: { children: ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const applyTheme = useThemeStore((s) => s.apply);

  useEffect(() => {
    applyTheme();
    fetchMe();
  }, [applyTheme, fetchMe]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{ style: { background: 'hsl(240 14% 8%)', border: '1px solid hsl(240 10% 18%)', color: '#F4F1EA' } }}
      />
    </QueryClientProvider>
  );
}
