import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const price = product.priceRange.minVariantPrice;

  return (
    <Link href={`/products/${product.handle}`} className="group product-card block">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-paper-cream mb-4">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-lg text-ink-300 italic">
              No image
            </span>
          </div>
        )}

        {/* Quick info overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0
          transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-ink-950/90 backdrop-blur-sm px-4 py-3">
            <span className="font-mono text-2xs uppercase tracking-widest text-paper/80">
              View Details
            </span>
          </div>
        </div>

        {/* Product type badge */}
        {product.productType && (
          <div className="absolute top-3 left-3">
            <span className="mono-label bg-paper/90 backdrop-blur-sm px-2 py-1">
              {product.productType}
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-1.5">
        <h3 className="font-display text-base tracking-display text-ink-900
          group-hover:text-press transition-colors">
          {product.title}
        </h3>
        <p className="font-mono text-sm text-ink-500">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>
    </Link>
  );
}
