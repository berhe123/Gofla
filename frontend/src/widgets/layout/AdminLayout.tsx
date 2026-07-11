import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Box, LogOut, MessageSquare, Package, Users } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/entities/user/store';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'Products', icon: Box },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
];

export function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-card p-4 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-ember font-display text-lg font-bold text-white">
            G
          </span>
          <span className="font-display text-lg font-bold">Gofla Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
