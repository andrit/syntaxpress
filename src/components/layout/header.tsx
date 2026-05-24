import Link from 'next/link';
import { Suspense } from 'react';
import { Logo } from './logo';
import { CartButton } from '@/components/cart/cart-button';

const navItems = [
  { title: 'Shop', path: '/products' },
  { title: 'Collections', path: '/collections' },
  { title: 'About', path: '/about' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md">
      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-press to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-5">
          {/* Navigation — left */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="font-mono text-xs uppercase tracking-widest text-ink-500
                  transition-colors hover:text-ink-950 relative
                  after:absolute after:bottom-0 after:left-0 after:h-px after:w-0
                  after:bg-press after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Logo — center */}
          <Logo />

          {/* Cart + Mobile menu — right */}
          <div className="flex items-center gap-4">
            <Suspense fallback={<CartButtonSkeleton />}>
              <CartButton />
            </Suspense>

            {/* Mobile menu trigger */}
            <MobileMenuButton />
          </div>
        </div>
      </div>

      <div className="rule-line" />
    </header>
  );
}

function CartButtonSkeleton() {
  return (
    <div className="font-mono text-xs uppercase tracking-widest text-ink-400">
      Cart (0)
    </div>
  );
}

function MobileMenuButton() {
  return (
    <button
      className="md:hidden flex flex-col gap-1.5 p-2"
      aria-label="Open menu"
    >
      <span className="block h-px w-5 bg-ink-800" />
      <span className="block h-px w-5 bg-ink-800" />
    </button>
  );
}
