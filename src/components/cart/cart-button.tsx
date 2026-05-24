'use client';

import Link from 'next/link';
import { useCart } from '@/components/cart/cart-context';

export function CartButton() {
  const { cart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <Link
      href="/cart"
      className="font-mono text-xs uppercase tracking-widest text-ink-500
        transition-colors hover:text-ink-950 relative"
    >
      Cart
      {count > 0 && (
        <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center
          rounded-full bg-press text-paper text-[10px] font-mono leading-none">
          {count}
        </span>
      )}
    </Link>
  );
}
