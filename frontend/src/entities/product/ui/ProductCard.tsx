import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import type { ProductDto } from '@/shared';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { useToggleWishlist, useWishlist } from '@/features/wishlist/api';
import { useAuthStore } from '@/entities/user/store';

export function ProductCard({ product }: { product: ProductDto }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: wishlist } = useWishlist();
  const toggle = useToggleWishlist();
  const isWished = wishlist?.some((w) => w.product.id === product.id) ?? false;
  const hasDiscount = product.discount && product.finalPrice < product.basePrice;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:ember-glow">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        <img
          src={product.images[0]?.url}
          alt={product.images[0]?.alt ?? product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isFeatured && (
            <Badge className="gradient-ember text-white">Featured</Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-gold text-black">
              -{Math.round((1 - product.finalPrice / product.basePrice) * 100)}%
            </Badge>
          )}
          {!product.inStock && <Badge className="bg-destructive text-white">Sold out</Badge>}
        </div>
      </Link>

      {isAuthenticated && (
        <button
          aria-label="Toggle wishlist"
          onClick={() => toggle.mutate({ productId: product.id, active: isWished })}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition hover:scale-110"
        >
          <Heart className={cn('h-4 w-4', isWished && 'fill-primary text-primary')} />
        </button>
      )}

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <Link to={`/product/${product.slug}`} className="line-clamp-1 font-medium hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          {product.rating.toFixed(1)}
          <span>·</span>
          <span>{product.reviewCount} reviews</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold">{formatPrice(product.finalPrice, product.currency)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.basePrice, product.currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
