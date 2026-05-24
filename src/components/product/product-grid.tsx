import { Product } from '@/types';
import { ProductCard } from './product-card';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="font-display text-xl text-ink-400 italic">
          No products found
        </p>
        <p className="font-mono text-xs text-ink-300 mt-2 uppercase tracking-widest">
          Check back soon
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
