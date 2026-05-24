import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCollections } from '@/lib/shopify';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Browse SyntaxPress collections — curated groups of artfully typeset prints.',
};

export const revalidate = 60;

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl tracking-display text-ink-950 mb-3">
          Collections
        </h1>
        <p className="font-body text-ink-500 max-w-lg">
          Curated groups of designs, organized by theme and mood.
        </p>
      </div>

      <div className="rule-line mb-10" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {collections.map((collection, i) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group relative aspect-[3/2] overflow-hidden bg-paper-cream
              animate-fade-in"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'backwards' }}
          >
            {collection.image && (
              <Image
                src={collection.image.url}
                alt={collection.image.altText || collection.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <span className="mono-label text-paper/60 mb-2 block">Collection</span>
              <h2 className="font-display text-2xl md:text-3xl tracking-display text-paper
                group-hover:text-press-muted transition-colors">
                {collection.title}
              </h2>
              {collection.description && (
                <p className="font-body text-sm text-paper/70 mt-2 max-w-md">
                  {collection.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
