import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, Minus, Plus, ShoppingBag, Star, Truck } from 'lucide-react';
import type { ProductVariantDto } from '@/shared';
import { formatPrice } from '@/shared/lib/format';
import { resolveMediaUrl } from '@/shared/lib/media';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { PageLoader } from '@/shared/ui/page-loader';
import { useProduct, useRelatedProducts } from '@/entities/product/api';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { useAddToCart } from '@/entities/cart/api';
import { useAuthStore } from '@/entities/user/store';
import { useToggleWishlist, useWishlist } from '@/features/wishlist/api';
import { CompleteTheLook } from '@/widgets/product/CompleteTheLook';
import { ReviewsSection } from '@/widgets/product/ReviewsSection';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: related } = useRelatedProducts(product?.id);
  const addToCart = useAddToCart();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: wishlist } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState<string | undefined>();
  const [size, setSize] = useState<string | undefined>();
  const [qty, setQty] = useState(1);

  const colors = useMemo(
    () => [...new Set(product?.variants.map((v) => v.color).filter(Boolean) as string[])],
    [product],
  );
  const sizes = useMemo(
    () => [...new Set(product?.variants.map((v) => v.size).filter(Boolean) as string[])],
    [product],
  );
  const availableSizes = useMemo(() => {
    if (!product) return [];
    return [
      ...new Set(
        product.variants
          .filter((v) => !color || v.color === color)
          .map((v) => v.size)
          .filter(Boolean) as string[],
      ),
    ];
  }, [product, color]);

  useEffect(() => {
    if (!product) return;
    const fallback = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    if (!fallback) return;
    setColor((prev) => prev ?? (fallback.color ?? undefined));
    setSize((prev) => prev ?? (fallback.size ?? undefined));
  }, [product?.id]);

  useEffect(() => {
    if (!availableSizes.length) return;
    if (!size || !availableSizes.includes(size)) {
      setSize(availableSizes[0]);
    }
  }, [availableSizes, size]);

  if (isLoading) return <PageLoader />;

  if (isError || !product) {
    return (
      <div className="container grid min-h-[50vh] place-items-center text-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <p className="mt-2 text-muted-foreground">This item may have been removed or the link is incorrect.</p>
          <Button asChild className="mt-4">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const selectedVariant: ProductVariantDto | undefined =
    product.variants.find(
      (v) => (!colors.length || !color || v.color === color) && (!sizes.length || !size || v.size === size),
    ) ?? product.variants.find((v) => v.stock > 0) ?? product.variants[0];

  const isWished = wishlist?.some((w) => w.product.id === product.id) ?? false;
  const hasDiscount = product.discount && product.finalPrice < product.basePrice;

  const handleAdd = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your cart.');
      navigate('/login', { state: { from: `/product/${slug}` } });
      return;
    }
    if (!selectedVariant) {
      toast.error('Please select the available options.');
      return;
    }
    addToCart.mutate(
      { variantId: selectedVariant.id, quantity: qty },
      {
        onSuccess: () => toast.success(`${product.name} added to cart`),
        onError: () => toast.error('Could not add to cart'),
      },
    );
  };

  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        {product.category && (
          <>
            {' / '}
            <Link to={`/category/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        {' / '}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl border border-border bg-muted">
            <img
              src={resolveMediaUrl(product.images[activeImage]?.url)}
              alt={product.images[activeImage]?.alt ?? product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                    i === activeImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={resolveMediaUrl(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-gold text-gold" /> {product.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.finalPrice, product.currency)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.basePrice, product.currency)}
                </span>
                <Badge className="bg-gold text-black">
                  Save {formatPrice(product.basePrice - product.finalPrice, product.currency)}
                </Badge>
              </>
            )}
          </div>

          <p className="mt-5 text-muted-foreground">{product.description}</p>

          {colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Color: {color ?? 'Select'}</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      color === c ? 'border-primary text-primary' : 'border-border'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">Size: {size ?? 'Select'}</p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-12 rounded-xl border px-3 py-2 text-sm transition ${
                      size === s ? 'border-primary text-primary' : 'border-border'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-border px-3 py-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              {selectedVariant ? `${selectedVariant.stock} in stock` : 'Select options'}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            <Button size="lg" className="flex-1" onClick={handleAdd} disabled={addToCart.isPending}>
              <ShoppingBag className="h-5 w-5" /> Add to cart
            </Button>
            {isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => toggleWishlist.mutate({ productId: product.id, active: isWished })}
              >
                <Heart className={isWished ? 'h-5 w-5 fill-primary text-primary' : 'h-5 w-5'} />
              </Button>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" /> Free shipping over $60 · 30-day returns
          </div>
        </div>
      </div>

      <CompleteTheLook productId={product.id} />

      <ReviewsSection productId={product.id} />

      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
