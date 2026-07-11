import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { useWishlist } from '@/features/wishlist/api';

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="container grid min-h-[60vh] place-items-center text-center">
        <div>
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">Your wishlist is empty</h1>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
            Tap the heart on any product to save it here.
          </p>
          <Link to="/shop"><Button className="mt-6">Explore products</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-3xl font-bold">Your wishlist</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {wishlist.map((item) => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </div>
  );
}
