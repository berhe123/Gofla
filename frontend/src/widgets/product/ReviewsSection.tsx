import { useState } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { formatDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useCreateReview, useReviews, useReviewSummary } from '@/features/review/api';
import { useAuthStore } from '@/entities/user/store';

export function ReviewsSection({ productId }: { productId: string }) {
  const { data: reviews } = useReviews(productId);
  const { data: summary } = useReviewSummary(productId);
  const create = useCreateReview(productId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { rating, title: title || undefined, body },
      {
        onSuccess: () => {
          toast.success('Review submitted — pending approval. Thank you!');
          setTitle('');
          setBody('');
        },
        onError: (err: any) =>
          toast.error(err?.response?.data?.message ?? 'Could not submit review'),
      },
    );
  };

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-display text-2xl font-bold">Reviews</h2>
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">{summary?.average?.toFixed(1) ?? '0.0'}</span>
            <span className="mb-1 text-sm text-muted-foreground">/ 5</span>
          </div>
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(summary?.average ?? 0) ? 'fill-gold text-gold' : 'text-muted'}`}
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{summary?.count ?? 0} reviews</p>

          {isAuthenticated && (
            <form onSubmit={submit} className="mt-6 space-y-3 border-t border-border pt-6">
              <p className="text-sm font-medium">Write a review</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setRating(i + 1)}>
                    <Star
                      className={`h-6 w-6 ${i < rating ? 'fill-gold text-gold' : 'text-muted'}`}
                    />
                  </button>
                ))}
              </div>
              <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea
                required
                placeholder="Share your thoughts…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="sm" disabled={create.isPending} className="w-full">
                Submit review
              </Button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.authorName}</span>
                    {r.verifiedPurchase && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-gold text-gold' : 'text-muted'}`}
                    />
                  ))}
                </div>
                {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>
    </section>
  );
}
