import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { formatPrice } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useCompleteTheLook } from '@/features/visual-search/api';
import { useAddToCart } from '@/entities/cart/api';
import { useAuthStore } from '@/entities/user/store';

export function CompleteTheLook({ productId }: { productId: string }) {
  const { data } = useCompleteTheLook(productId);
  const addToCart = useAddToCart();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!data || data.items.length < 2) return null;

  const addBundle = async () => {
    if (!isAuthenticated) return toast.error('Sign in to add the look');
    let added = 0;
    for (const product of data.items) {
      const variant = product.variants[0];
      if (variant) {
        await addToCart.mutateAsync({ variantId: variant.id, quantity: 1 }).then(() => added++);
      }
    }
    toast.success(`Added ${added} pieces — the whole look!`);
  };

  return (
    <section className="mt-16 rounded-3xl border border-border bg-card/50 p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" /> Complete the look
          </h2>
          <p className="mt-1 text-sm capitalize text-muted-foreground">{data.theme}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(data.fullPrice)}
              </span>
              <span className="text-xl font-bold">{formatPrice(data.bundlePrice)}</span>
            </div>
            <Badge className="bg-gold text-black">Save {formatPrice(data.savings)}</Badge>
          </div>
          <Button onClick={addBundle} disabled={addToCart.isPending}>
            Add the whole look
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data.items.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.slug}`}
            className="group overflow-hidden rounded-2xl border border-border bg-background"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={p.images[0]?.url}
                alt={p.name}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
              <p className="text-sm text-muted-foreground">{formatPrice(p.finalPrice)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
