import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, Moon, Search, ShoppingBag, Sparkles, Sun, User, X } from 'lucide-react';
import { CATEGORIES } from '@/shared/config';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { useCart } from '@/entities/cart/api';
import { useAuthStore } from '@/entities/user/store';
import { useThemeStore } from '@/features/theme/store';

export function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { data: cart } = useCart();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <div className="container flex h-16 items-center gap-4">
        <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-ember font-display text-lg font-bold text-white">
            G
          </span>
          <span className="font-display text-xl font-bold tracking-tight">Gofla</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/studio"
            className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-primary"
          >
            <Sparkles className="h-4 w-4" /> Studio
          </Link>
        </nav>

        <form onSubmit={submit} className="ml-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            {!!cart?.itemCount && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cart.itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="group relative">
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
              <div className="invisible absolute right-0 top-full w-48 rounded-xl border border-border bg-card p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                <p className="px-3 py-2 text-xs text-muted-foreground">Hi, {user?.firstName}</p>
                <MenuLink to="/orders">Orders</MenuLink>
                <MenuLink to="/profile">Profile</MenuLink>
                {user?.role === 'ADMIN' && <MenuLink to="/admin">Admin</MenuLink>}
                <button
                  onClick={() => logout()}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="ml-1">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-card p-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/studio" onClick={() => setOpen(false)} className="col-span-2 flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Gofla Studio
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className={cn('block rounded-lg px-3 py-2 text-sm hover:bg-muted')}>
      {children}
    </Link>
  );
}
