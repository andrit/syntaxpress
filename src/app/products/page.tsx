import { Metadata } from 'next';
import { ProductGrid } from '@/components/product/product-grid';
import { getProducts } from '@/lib/shopify';

export const metadata: Metadata = {
  title: 'Shop All Prints',
  description: 'Browse the full SyntaxPress collection — artfully typeset sayings on t-shirts, mugs, stickers, and wall art.',
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sortMap: Record<string, { sortKey: string; reverse: boolean }> = {
    newest: { sortKey: 'CREATED_AT', reverse: true },
    'price-asc': { sortKey: 'PRICE', reverse: false },
    'price-desc': { sortKey: 'PRICE', reverse: true },
    'best-selling': { sortKey: 'BEST_SELLING', reverse: false },
    title: { sortKey: 'TITLE', reverse: false },
  };

  const sortOption = sortMap[searchParams.sort ?? 'best-selling'] ?? sortMap['best-selling'];

  const products = await getProducts({
    first: 50,
    sortKey: sortOption.sortKey,
    reverse: sortOption.reverse,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Page header */}
      <div className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl tracking-display text-ink-950 mb-3">
          All Prints
        </h1>
        <p className="font-body text-ink-500 max-w-lg">
          Every design in the SyntaxPress catalog. Artfully typeset, printed with care.
        </p>
      </div>

      {/* Sort controls */}
      <div className="flex items-center justify-between mb-8">
        <p className="font-mono text-2xs uppercase tracking-widest text-ink-400">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
        <SortSelector current={searchParams.sort ?? 'best-selling'} />
      </div>

      <div className="rule-line mb-10" />

      <ProductGrid products={products} />
    </div>
  );
}

function SortSelector({ current }: { current: string }) {
  const options = [
    { value: 'best-selling', label: 'Best Selling' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'title', label: 'A — Z' },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-2xs uppercase tracking-widest text-ink-400">
        Sort
      </span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <a
            key={opt.value}
            href={`/products?sort=${opt.value}`}
            className={`px-3 py-1.5 font-mono text-2xs uppercase tracking-widest transition-colors
              ${current === opt.value
                ? 'bg-ink-950 text-paper'
                : 'text-ink-400 hover:text-ink-800'
              }`}
          >
            {opt.label}
          </a>
        ))}
      </div>
    </div>
  );
}
