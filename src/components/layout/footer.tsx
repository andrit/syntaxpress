import Link from 'next/link';
import { Logo } from './logo';

const footerLinks = {
  shop: [
    { title: 'All Products', path: '/products' },
    { title: 'Collections', path: '/collections' },
    { title: 'Best Sellers', path: '/collections/best-sellers' },
    { title: 'New Arrivals', path: '/collections/new-arrivals' },
  ],
  info: [
    { title: 'About', path: '/about' },
    { title: 'Shipping & Returns', path: '/about#shipping' },
    { title: 'FAQ', path: '/about#faq' },
    { title: 'Contact', path: '/about#contact' },
  ],
  also: [
    { title: 'Etsy', path: 'https://etsy.com/shop/syntaxpress', external: true },
    { title: 'Redbubble', path: '#', external: true },
    { title: 'TeePublic', path: '#', external: true },
    { title: 'Society6', path: '#', external: true },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="rule-line-thick" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 font-body text-sm text-ink-500 leading-relaxed max-w-xs">
              Prints with artfully typeset sayings and words.
              Every letter placed with intention.
            </p>
          </div>

          {/* Shop links */}
          <FooterColumn title="Shop" links={footerLinks.shop} />

          {/* Info links */}
          <FooterColumn title="Info" links={footerLinks.info} />

          {/* Also find us on */}
          <FooterColumn title="Also On" links={footerLinks.also} />
        </div>

        {/* Bottom bar */}
        <div className="rule-line mt-12 mb-6" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-mono text-2xs uppercase tracking-widest text-ink-400">
            &copy; {new Date().getFullYear()} SyntaxPress. All rights reserved.
          </p>
          <p className="font-mono text-2xs uppercase tracking-widest text-ink-400">
            Designed &amp; printed with care
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { title: string; path: string; external?: boolean }[];
}) {
  return (
    <div>
      <h3 className="font-mono text-2xs uppercase tracking-widest text-ink-400 mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              href={link.path}
              {...(link.external && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
              className="font-body text-sm text-ink-600 transition-colors hover:text-ink-950"
            >
              {link.title}
              {link.external && (
                <span className="ml-1 text-ink-300">&nearr;</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
