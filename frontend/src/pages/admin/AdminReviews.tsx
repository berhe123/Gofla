import { toast } from 'sonner';
import { Check, Star, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { usePendingReviews, useModerateReview } from '@/features/admin/api';

export default function AdminReviews() {
  const { data } = usePendingReviews();
  const moderate = useModerateReview();

  const act = (id: string, action: 'approve' | 'reject') =>
    moderate.mutate(
      { id, action },
      { onSuccess: () => toast.success(`Review ${action}d`) },
    );

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold">Review moderation</h1>
      {!data?.length ? (
        <p className="text-muted-foreground">No pending reviews. All caught up! 🎉</p>
      ) : (
        <div className="space-y-4">
          {data.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.product?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.user?.firstName} {r.user?.lastName}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-gold text-gold' : 'text-muted'}`} />
                  ))}
                </div>
              </div>
              {r.title && <p className="mt-3 font-medium">{r.title}</p>}
              <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => act(r.id, 'approve')}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => act(r.id, 'reject')}>
                  <X className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
