import { Star } from 'lucide-react';
import { Reveal } from '@/shared/ui/reveal';

const VOICES = [
  { text: 'Snapped a jacket I saw on the street and Gofla found it in seconds.', name: 'Maya R.' },
  { text: 'Complete the Look saved me an hour and a bit of money. Genius.', name: 'Daniel K.' },
  { text: 'Cleanest shopping experience I have used in years.', name: 'Sofia L.' },
  { text: 'Quality is unreal for the price. Belt and wallet combo is perfect.', name: 'Marcus T.' },
  { text: 'The live drops are addictive — in a good way.', name: 'Priya N.' },
  { text: 'Returns were effortless. Became my default store.', name: 'Liam O.' },
];

export function ShopperVoices() {
  return (
    <section className="overflow-hidden py-20">
      <div className="container">
        <Reveal>
          <p className="mb-2 text-center text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Shopper voices
          </p>
          <h2 className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl">
            Loved by people who hate shopping
          </h2>
        </Reveal>
      </div>
      <div className="relative flex gap-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex shrink-0 animate-marquee gap-4">
          {[...VOICES, ...VOICES].map((v, i) => (
            <figure
              key={i}
              className="w-80 shrink-0 rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed">"{v.text}"</blockquote>
              <figcaption className="mt-4 text-sm font-medium text-muted-foreground">
                — {v.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
