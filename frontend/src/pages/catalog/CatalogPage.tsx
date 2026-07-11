import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '@/shared/config';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { useProducts } from '@/entities/product/api';
import { ProductCard } from '@/entities/product/ui/ProductCard';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'popular', label: 'Most reviewed' },
];

export default function CatalogPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      category: slug,
      q: params.get('q') ?? undefined,
      sort: params.get('sort') ?? 'newest',
      color: params.get('color') ?? undefined,
      page: Number(params.get('page') ?? 1),
      pageSize: 12,
    }),
    [slug, params],
  );

  const { data, isLoading } = useProducts(filters);
  const category = CATEGORIES.find((c) => c.slug === slug);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {category?.name ?? (filters.q ? `Results for "${filters.q}"` : 'All products')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {data ? `${data.total} products` : 'Loading…'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" /> Categories
              </h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="/shop" className={!slug ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}>
                    All
                  </a>
                </li>
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <a
                      href={`/category/${c.slug}`}
                      className={slug === c.slug ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                    >
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Color</h3>
              <div className="flex flex-wrap gap-2">
                {['Black', 'White', 'Brown', 'Navy', 'Tan'].map((color) => (
                  <button
                    key={color}
                    onClick={() => update('color', filters.color === color ? '' : color)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      filters.color === color ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <select
              value={filters.sort}
              onChange={(e) => update('sort', e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {data.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => update('page', String(filters.page - 1))}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-sm text-muted-foreground">
                    {filters.page} / {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= data.totalPages}
                    onClick={() => update('page', String(filters.page + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="grid min-h-[40vh] place-items-center text-center">
              <div>
                <p className="text-lg font-medium">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
