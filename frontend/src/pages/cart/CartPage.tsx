import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/entities/cart/api';
import { useAuthStore } from '@/entities/user/store';

export default function CartPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Your cart is waiting"
        text="Sign in to view your cart and check out."
        cta={<Link to="/login"><Button size="lg">Sign in</Button></Link>}
      />
    );
  }

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        text="Find something you love — or let Gofla Studio find it for you."
        cta={<Link to="/shop"><Button size="lg">Start shopping</Button></Link>}
      />
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-3xl font-bold">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
              <Link to={`/product/${item.product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                <img src={item.product.images[0]?.url} alt={item.product.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <Link to={`/product/${item.product.slug}`} className="font-medium hover:text-primary">
                    {item.product.name}
                  </Link>
                  <button onClick={() => removeItem.mutate(item.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {[item.variant.color, item.variant.size].filter(Boolean).join(' / ')}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-border px-3 py-1.5">
                    <button
                      onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold">{formatPrice(item.lineTotal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
          <Row label="Subtotal" value={formatPrice(cart.subtotal)} />
          <Row label="Shipping" value={cart.shipping === 0 ? 'Free' : formatPrice(cart.shipping)} />
          <Row label="Tax" value={formatPrice(cart.tax)} />
          <div className="my-4 border-t border-border" />
          <Row label="Total" value={formatPrice(cart.total)} bold />
          <Button size="lg" className="mt-6 w-full" onClick={() => navigate('/checkout')}>
            <ShoppingBag className="h-5 w-5" /> Checkout
          </Button>
          {cart.subtotal < 60 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Add {formatPrice(60 - cart.subtotal)} more for free shipping
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? 'text-lg font-bold' : 'text-sm text-muted-foreground'}`}>
      <span>{label}</span>
      <span className={bold ? 'text-foreground' : ''}>{value}</span>
    </div>
  );
}

function EmptyState({ title, text, cta }: { title: string; text: string; cta: React.ReactNode }) {
  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div>
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">{text}</p>
        <div className="mt-6">{cta}</div>
      </div>
    </div>
  );
}
