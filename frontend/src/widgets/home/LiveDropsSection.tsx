import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { Reveal } from '@/shared/ui/reveal';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { useLiveDrops } from '@/features/visual-search/api';

function useCountdown(endsAt?: string) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return setRemaining('00:00:00');
      const h = Math.floor(diff / 3.6e6);
      const m = Math.floor((diff % 3.6e6) / 6e4);
      const s = Math.floor((diff % 6e4) / 1000);
      setRemaining(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return remaining;
}

export function LiveDropsSection() {
  const { data } = useLiveDrops();
  const countdown = useCountdown(data?.endsAt);

  if (!data?.items.length) return null;

  return (
    <section className="container py-20">
      <Reveal>
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{data.title}</h2>
            <p className="mt-2 text-muted-foreground">{data.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Timer className="h-4 w-4" /> Ends in {countdown}
          </div>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
