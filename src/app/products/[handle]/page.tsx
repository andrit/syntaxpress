import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductByHandle, getProductRecommendations } from '@/lib/shopify';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductActions } from '@/components/product/product-actions';
import { ProductGrid } from '@/components/product/product-grid';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const product = await getProductByHandle(params.handle);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    openGraph: {
      images: product.featuredImage ? [{ url: product.featuredImage.url }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const product = await getProductByHandle(params.handle);

  if (!product) {
    notFound();
  }

  // Fetch recommendations in parallel
  const recommendations = await getProductRecommendations(product.id).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-ink-400">
          <li><a href="/" className="hover:text-ink-800 transition-colors">Home</a></li>
          <li>&mdash;</li>
          <li><a href="/products" className="hover:text-ink-800 transition-colors">Shop</a></li>
          <li>&mdash;</li>
          <li className="text-ink-700">{product.title}</li>
        </ol>
      </nav>

      {/* Product layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images} />

        {/* Product info */}
        <div className="lg:py-4">
          {/* Product type */}
          {product.productType && (
            <span className="mono-label mb-3 block">{product.productType}</span>
          )}

          <h1 className="font-display text-3xl md:text-4xl tracking-display text-ink-950 mb-4">
            {product.title}
          </h1>

          <div className="rule-line mb-6" />

          {/* Description */}
          {product.descriptionHtml && (
            <div
              className="font-body text-sm text-ink-600 leading-relaxed mb-8 prose prose-sm"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}

          {/* Variant selector + Add to cart */}
          <ProductActions product={product} />

          {/* Product details accordion */}
          <div className="mt-10 space-y-0">
            <DetailSection title="Shipping">
              <p>
                All products are printed on demand and shipped within 3-5 business days.
                Tracking provided via email once your order ships.
              </p>
            </DetailSection>
            <DetailSection title="Returns">
              <p>
                We stand behind every print. If there&apos;s a quality issue,
                we&apos;ll reprint or refund — no questions asked.
              </p>
            </DetailSection>
            <DetailSection title="Care Instructions">
              <p>
                Machine wash cold, inside out. Tumble dry low.
                Do not iron directly on the print.
              </p>
            </DetailSection>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mt-8">
              <span className="mono-label mb-2 block">Tags</span>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-2xs text-ink-400 border border-ink-200 px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-24">
          <div className="rule-line mb-12" />
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-display text-2xl tracking-display text-ink-950">
              You Might Also Like
            </h2>
            <span className="h-px flex-1 bg-ink-200" />
          </div>
          <ProductGrid products={recommendations.slice(0, 4)} />
        </section>
      )}
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-t border-ink-200">
      <summary className="flex cursor-pointer items-center justify-between py-4
        font-mono text-xs uppercase tracking-widest text-ink-700
        hover:text-ink-950 transition-colors">
        {title}
        <span className="text-ink-400 group-open:rotate-45 transition-transform duration-200">
          +
        </span>
      </summary>
      <div className="pb-4 font-body text-sm text-ink-500 leading-relaxed">
        {children}
      </div>
    </details>
  );
}
