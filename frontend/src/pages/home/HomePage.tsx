import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Shield, Sparkles, Star, Truck, Undo2 } from 'lucide-react';
import { CATEGORIES, sortCategoriesByOrder } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/reveal';
import { useProducts } from '@/entities/product/api';
import { useCategories } from '@/entities/category/api';
import { flattenCategories } from '@/entities/category/lib';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { LiveDropsSection } from '@/widgets/home/LiveDropsSection';
import { ShopperVoices } from '@/widgets/home/ShopperVoices';
import { resolveMediaUrl } from '@/shared/lib/media';

export default function HomePage() {
  const { data: featured } = useProducts({ featured: true, pageSize: 8 });
  const { data: categories } = useCategories();
  const { data: catalog } = useProducts({ pageSize: 120 });

  const categoryTiles = useMemo(() => {
    const fromApi = categories ? sortCategoriesByOrder(flattenCategories(categories)) : [];
    if (fromApi.length > 0) return fromApi;
    return CATEGORIES.map((c) => ({ ...c, imageUrl: null, productCount: 0, id: c.slug }));
  }, [categories]);

  const productsByCategory = useMemo(
    () =>
      categoryTiles
        .map((category) => ({
          ...category,
          items: (catalog?.items ?? [])
            .filter((p) => p.category?.slug === category.slug)
            .slice(0, 4),
        }))
        .filter((group) => group.items.length > 0),
    [catalog?.items, categoryTiles],
  );

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative grain">
        <div className="container relative grid gap-8 pt-10 pb-16 lg:grid-cols-2 lg:items-start lg:gap-10 lg:pt-14 lg:pb-20">
          <div className="flex flex-col justify-start lg:pt-2">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Introducing Gofla Studio — snap to find
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-balance font-display text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl"
            >
              Snap. Match.
              <br />
              <span className="text-primary">
                Shop smarter.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-6 max-w-md text-lg text-muted-foreground"
            >
              The premium marketplace for shoes, bags, wallets, jackets and more. Photograph
              anything you love and Gofla finds it — then completes the whole look.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/shop">
                <Button size="lg">
                  Start shopping <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/studio">
                <Button size="lg" variant="outline">
                  <Camera className="h-4 w-4" /> Try Gofla Studio
                </Button>
              </Link>
            </motion.div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-gold text-gold" /> 4.9 from 12k shoppers
              </div>
              <div>Free shipping over $60</div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative lg:pt-2"
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {(featured?.items ?? []).slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="block aspect-square overflow-hidden rounded-2xl border border-border bg-muted transition hover:ember-glow"
                >
                  <img
                    src={resolveMediaUrl(p.images[0]?.url)}
                    alt={p.images[0]?.alt ?? p.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* THE SHIFT (denker-style triad) */}
      <section className="border-y border-border bg-card/50">
        <div className="container py-20">
          <Reveal>
            <p className="mb-12 text-center text-sm uppercase tracking-[0.2em] text-muted-foreground">
              The shift
            </p>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { tag: 'Yesterday', text: 'You searched with words and hoped for the best.' },
              { tag: 'Today', text: 'You scroll endless grids and still miss the match.' },
              { tag: 'Tomorrow', text: 'You snap a photo. Gofla finds it and completes the look.' },
            ].map((item, i) => (
              <Reveal key={item.tag} delay={i * 0.1}>
                <div className="rounded-2xl border border-border bg-background p-8">
                  <span className="text-sm font-semibold text-primary">{item.tag}</span>
                  <p className="mt-3 text-xl font-medium leading-snug text-balance">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY WORLD */}
      <section className="container py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Shop by world</h2>
              <p className="mt-2 text-muted-foreground">Six curated worlds. One seamless checkout.</p>
            </div>
            <Link to="/shop" className="hidden items-center gap-1 text-sm text-primary sm:flex">
              All products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categoryTiles.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.05}>
              <Link
                to={`/category/${c.slug}`}
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted to-card p-4 transition hover:ember-glow"
              >
                {c.imageUrl && (
                  <>
                    <img
                      src={resolveMediaUrl(c.imageUrl)}
                      alt={c.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
                  </>
                )}
                <div className="relative z-10">
                  <span className="font-display text-lg font-semibold text-white drop-shadow">{c.name}</span>
                  {typeof c.productCount === 'number' && c.productCount > 0 && (
                    <p className="text-xs text-white/75">{c.productCount} products</p>
                  )}
                  <span className="mt-1 flex items-center gap-1 text-xs text-white/80 transition group-hover:text-primary-foreground">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COLLECTIONS BY CATEGORY */}
      {productsByCategory.map((group) => (
        <section key={group.slug} className="border-y border-border bg-card/30">
          <div className="container py-16">
            <Reveal>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-bold sm:text-4xl">{group.name}</h2>
                  <p className="mt-2 text-muted-foreground">
                    {group.items.length} styles from your {group.name.toLowerCase()} catalog — each photo is its own product.
                  </p>
                </div>
                <Link
                  to={`/category/${group.slug}`}
                  className="hidden items-center gap-1 text-sm text-primary sm:flex"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {group.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* STUDIO SHOWCASE */}
      <section className="border-y border-border bg-card/50">
        <div className="container grid items-center gap-12 py-20 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Gofla Studio
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl text-balance">
                See it. Snap it. Own the whole look.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Upload a photo — a street style shot, a screenshot, anything — and our visual engine
                surfaces the closest matches in stock. Then "Complete the Look" bundles the rest at a
                better price.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {['Visual search from any image', 'Auto-curated matching bundles', 'Save up to 10% per look'].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-primary">
                        ✓
                      </span>
                      {t}
                    </li>
                  ),
                )}
              </ul>
              <Link to="/studio" className="mt-8 inline-block">
                <Button size="lg">
                  <Camera className="h-4 w-4" /> Open Gofla Studio
                </Button>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border bg-background p-8 ember-glow">
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-center">
                <Camera className="mx-auto h-10 w-10 text-primary" />
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Drop an image to find your match
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {(featured?.items ?? []).slice(0, 3).map((p) => (
                  <img
                    key={p.id}
                    src={resolveMediaUrl(p.images[0]?.url)}
                    alt={p.name}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* LIVE DROPS */}
      <LiveDropsSection />

      {/* FEATURED */}
      <section className="container py-20">
        <Reveal>
          <h2 className="mb-10 font-display text-3xl font-bold sm:text-4xl">Featured picks</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {(featured?.items ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* WHY GOFLA */}
      <section className="border-y border-border bg-card/50">
        <div className="container grid gap-6 py-16 md:grid-cols-3">
          {[
            { icon: Truck, title: 'Fast, free shipping', text: 'Free over $60. Tracked to your door.' },
            { icon: Undo2, title: '30-day returns', text: 'Changed your mind? Send it back, no fuss.' },
            { icon: Shield, title: 'Secure checkout', text: 'Encrypted payments powered by Stripe.' },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SHOPPER VOICES */}
      <ShopperVoices />

      {/* NEWSLETTER / CTA */}
      <section className="container py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border gradient-ember p-12 text-center text-white md:p-20">
            <h2 className="font-display text-4xl font-bold text-balance md:text-5xl">
              Shop more. Search less.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/90">
              Join Gofla and let your camera do the shopping. Your next favorite thing is one snap
              away.
            </p>
            <form className="mx-auto mt-8 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="h-12 flex-1 rounded-full border-0 bg-white/15 px-5 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button type="submit" variant="gold" size="lg" className="rounded-full">
                Get started
              </Button>
            </form>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
