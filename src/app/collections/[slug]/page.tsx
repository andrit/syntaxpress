import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollectionByHandle } from '@/lib/shopify';
import { ProductGrid } from '@/components/product/product-grid';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const collection = await getCollectionByHandle(params.slug);
  if (!collection) return { title: 'Collection Not Found' };

  return {
    title: collection.seo.title || collection.title,
    description: collection.seo.description || collection.description,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sort?: string };
}) {
  const sortMap: Record<string, { sortKey: string; reverse: boolean }> = {
    newest: { sortKey: 'CREATED', reverse: true },
    'price-asc': { sortKey: 'PRICE', reverse: false },
    'price-desc': { sortKey: 'PRICE', reverse: true },
    'best-selling': { sortKey: 'BEST_SELLING', reverse: false },
  };

  const sortOption = sortMap[searchParams.sort ?? 'best-selling'] ?? sortMap['best-selling'];

  const collection = await getCollectionByHandle(params.slug, {
    sortKey: sortOption.sortKey,
    reverse: sortOption.reverse,
  });

  if (!collection) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-ink-400">
          <li><a href="/" className="hover:text-ink-800 transition-colors">Home</a></li>
          <li>&mdash;</li>
          <li><a href="/collections" className="hover:text-ink-800 transition-colors">Collections</a></li>
          <li>&mdash;</li>
          <li className="text-ink-700">{collection.title}</li>
        </ol>
      </nav>

      {/* Collection header */}
      <div className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl tracking-display text-ink-950 mb-3">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="font-body text-ink-500 max-w-lg">{collection.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-8">
        <p className="font-mono text-2xs uppercase tracking-widest text-ink-400">
          {collection.products.length}{' '}
          {collection.products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="rule-line mb-10" />

      <ProductGrid products={collection.products} />
    </div>
  );
}
