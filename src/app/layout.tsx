import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartProvider } from '@/components/cart/cart-context';
import { getCartFromCookies } from '@/lib/shopify/actions';
import '@/styles/globals.css';

// ──────────────────────────────────────────────
// Typography System
// ──────────────────────────────────────────────
// Display: Cormorant Garamond — elegant serif for headings, brand name
// Body: DM Sans — clean geometric sans for readability
// Mono: JetBrains Mono — technical monospace for labels, prices, CTAs

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'SyntaxPress — Artfully Typeset Prints',
    template: '%s | SyntaxPress',
  },
  description:
    'Prints with artfully typeset sayings and words, pressed onto things you actually wear. Original typography on t-shirts, mugs, stickers, and wall art.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://syntaxpress.com'
  ),
  openGraph: {
    type: 'website',
    siteName: 'SyntaxPress',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ──────────────────────────────────────────────
// Layout
// ──────────────────────────────────────────────

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cart = await getCartFromCookies();

  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="grain min-h-screen flex flex-col font-body">
        <CartProvider initialCart={cart}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
