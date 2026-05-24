import { Suspense } from 'react';
import { Hero } from '@/components/home/hero';
import { FeaturedCollections } from '@/components/home/featured-collections';
import { ProductGrid } from '@/components/product/product-grid';
import { getProducts, getCollections } from '@/lib/shopify';

export const revalidate = 60;

export default async function HomePage() {
  const [products, collections] = await Promise.all([
    getProducts({ first: 8, sortKey: 'BEST_SELLING' }),
    getCollections(),
  ]);

  return (
    <>
      <Hero />

      <div className="rule-line" />

      {/* Featured products */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="font-display text-3xl tracking-display text-ink-950">
              Featured Prints
            </h2>
            <span className="h-px flex-1 bg-ink-200" />
            <a
              href="/products"
              className="font-mono text-2xs uppercase tracking-widest text-ink-400
                hover:text-press transition-colors"
            >
              Shop All &rarr;
            </a>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>

      <div className="rule-line" />

      {/* Collections */}
      <FeaturedCollections collections={collections} />

      <div className="rule-line" />

      {/* Brand statement */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <p className="font-display text-2xl md:text-3xl text-ink-700 italic leading-relaxed">
            &ldquo;Every letter placed with intention. Every word chosen to
            resonate. Wear what you mean.&rdquo;
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-ink-300" />
            <span className="font-mono text-2xs uppercase tracking-widest text-ink-400">
              SyntaxPress
            </span>
            <span className="h-px w-12 bg-ink-300" />
          </div>
        </div>
      </section>
    </>
  );
}
