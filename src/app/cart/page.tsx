'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/cart/cart-context';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, isPending } = useCart();

  const lines = cart?.lines ?? [];
  const isEmpty = lines.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl tracking-display text-ink-950 mb-3">
        Your Cart
      </h1>
      <div className="rule-line mb-10" />

      {isEmpty ? (
        <div className="text-center py-20">
          <p className="font-display text-xl text-ink-400 italic mb-4">
            Your cart is empty
          </p>
          <Link href="/products" className="btn-press">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-0">
          {/* Cart header */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-ink-200">
            <div className="col-span-6 mono-label">Product</div>
            <div className="col-span-2 mono-label text-center">Quantity</div>
            <div className="col-span-2 mono-label text-right">Price</div>
            <div className="col-span-2 mono-label text-right">Total</div>
          </div>

          {/* Cart items */}
          {lines.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 py-6 border-b border-ink-200 items-center"
            >
              {/* Product info */}
              <div className="col-span-12 md:col-span-6 flex gap-4">
                <div className="relative h-20 w-20 shrink-0 bg-paper-cream overflow-hidden">
                  {item.merchandise.product.featuredImage && (
                    <Image
                      src={item.merchandise.product.featuredImage.url}
                      alt={item.merchandise.product.featuredImage.altText || ''}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <Link
                    href={`/products/${item.merchandise.product.handle}`}
                    className="font-display text-base tracking-display text-ink-900
                      hover:text-press transition-colors"
                  >
                    {item.merchandise.product.title}
                  </Link>
                  {item.merchandise.title !== 'Default Title' && (
                    <p className="font-mono text-2xs text-ink-400 mt-1 uppercase tracking-widest">
                      {item.merchandise.selectedOptions
                        .map((o) => o.value)
                        .join(' / ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="col-span-4 md:col-span-2 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.merchandise.id,
                      item.quantity - 1
                    )
                  }
                  className="h-8 w-8 flex items-center justify-center border border-ink-300
                    font-mono text-sm hover:bg-ink-950 hover:text-paper hover:border-ink-950
                    transition-colors"
                >
                  &minus;
                </button>
                <span className="font-mono text-sm w-8 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.merchandise.id,
                      item.quantity + 1
                    )
                  }
                  className="h-8 w-8 flex items-center justify-center border border-ink-300
                    font-mono text-sm hover:bg-ink-950 hover:text-paper hover:border-ink-950
                    transition-colors"
                >
                  +
                </button>
              </div>

              {/* Unit price */}
              <div className="col-span-4 md:col-span-2 text-right">
                <span className="font-mono text-sm text-ink-500">
                  {formatPrice(
                    item.merchandise.price.amount,
                    item.merchandise.price.currencyCode
                  )}
                </span>
              </div>

              {/* Line total + remove */}
              <div className="col-span-4 md:col-span-2 text-right space-y-1">
                <span className="font-mono text-sm text-ink-900">
                  {formatPrice(
                    item.cost.totalAmount.amount,
                    item.cost.totalAmount.currencyCode
                  )}
                </span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="block ml-auto font-mono text-2xs text-ink-400 uppercase tracking-widest
                    hover:text-press transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Cart footer */}
          <div className="pt-8 flex flex-col items-end gap-4">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
                Subtotal
              </span>
              <span className="font-display text-2xl tracking-display text-ink-950">
                {cart?.cost.subtotalAmount
                  ? formatPrice(
                      cart.cost.subtotalAmount.amount,
                      cart.cost.subtotalAmount.currencyCode
                    )
                  : '$0.00'}
              </span>
            </div>
            <p className="font-body text-sm text-ink-400">
              Shipping and taxes calculated at checkout.
            </p>
            <a
              href={cart?.checkoutUrl ?? '#'}
              className={`btn-press ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
            >
              Proceed to Checkout
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
