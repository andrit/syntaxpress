'use client';

import { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/components/cart/cart-context';
import { formatPrice } from '@/lib/utils';

export function ProductActions({ product }: { product: Product }) {
  const { addToCart, isPending } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Default to first available variant's options
    const firstAvailable = product.variants.find((v) => v.availableForSale);
    if (!firstAvailable) return {};
    return Object.fromEntries(firstAvailable.selectedOptions.map((o) => [o.name, o.value]));
  });

  // Find the matching variant
  const selectedVariant = product.variants.find((variant) =>
    variant.selectedOptions.every(
      (opt) => selectedOptions[opt.name] === opt.value
    )
  );

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(selectedVariant.id);
  };

  const isAvailable = selectedVariant?.availableForSale ?? false;

  return (
    <div className="space-y-6">
      {/* Variant options */}
      {product.options.map((option) => (
        <div key={option.id}>
          <label className="mono-label mb-3 block">{option.name}</label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value;
              // Check if this option value is available with current selections
              const isOptionAvailable = product.variants.some(
                (v) =>
                  v.availableForSale &&
                  v.selectedOptions.some(
                    (o) => o.name === option.name && o.value === value
                  )
              );

              return (
                <button
                  key={value}
                  onClick={() => handleOptionChange(option.name, value)}
                  disabled={!isOptionAvailable}
                  className={`px-4 py-2 font-mono text-xs uppercase tracking-widest
                    border transition-all duration-200
                    ${isSelected
                      ? 'border-ink-950 bg-ink-950 text-paper'
                      : isOptionAvailable
                        ? 'border-ink-300 text-ink-700 hover:border-ink-800'
                        : 'border-ink-200 text-ink-300 cursor-not-allowed line-through'
                    }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Price */}
      {selectedVariant && (
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-display">
            {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
          </span>
          {selectedVariant.compareAtPrice && (
            <span className="font-mono text-sm text-ink-400 line-through">
              {formatPrice(
                selectedVariant.compareAtPrice.amount,
                selectedVariant.compareAtPrice.currencyCode
              )}
            </span>
          )}
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={!isAvailable || isPending}
        className={`w-full py-4 font-mono text-xs uppercase tracking-widest transition-all duration-200
          ${isAvailable
            ? 'btn-press'
            : 'bg-ink-200 text-ink-400 cursor-not-allowed'
          } ${isPending ? 'opacity-70' : ''}`}
      >
        {!isAvailable
          ? 'Sold Out'
          : isPending
            ? 'Adding...'
            : 'Add to Cart'}
      </button>
    </div>
  );
}
