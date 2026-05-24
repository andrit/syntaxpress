import Link from 'next/link';
import Image from 'next/image';
import { Collection } from '@/types';

export function FeaturedCollections({
  collections,
}: {
  collections: Omit<Collection, 'products'>[];
}) {
  if (!collections.length) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-12">
          <h2 className="font-display text-3xl tracking-display text-ink-950">
            Collections
          </h2>
          <span className="h-px flex-1 bg-ink-200" />
          <Link
            href="/collections"
            className="font-mono text-2xs uppercase tracking-widest text-ink-400
              hover:text-press transition-colors"
          >
            View All &rarr;
          </Link>
        </div>

        {/* Collection cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.slice(0, 3).map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group relative aspect-[4/3] overflow-hidden bg-paper-cream"
            >
              {collection.image && (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/20 to-transparent" />

              {/* Label */}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="font-mono text-2xs uppercase tracking-widest text-paper/60 block mb-1">
                  Collection
                </span>
                <h3 className="font-display text-xl tracking-display text-paper
                  group-hover:text-press-muted transition-colors">
                  {collection.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
