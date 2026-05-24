import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'The story behind SyntaxPress — artfully typeset prints, designed and shipped with care.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="mono-label mb-4 block">About</span>
        <h1 className="font-display text-4xl md:text-5xl tracking-display text-ink-950 mb-6">
          Every Letter,<br />Placed with Intention
        </h1>
        <div className="rule-line-thick max-w-xs mx-auto" />
      </div>

      {/* Story */}
      <div className="space-y-8 font-body text-ink-700 leading-relaxed">
        <p className="text-lg">
          SyntaxPress started with a simple idea: the words we choose to wear say
          something about who we are. A well-set phrase on a well-made shirt is
          more than merch &mdash; it&rsquo;s a statement, a conversation starter,
          a quiet nod to the people who get it.
        </p>

        <p>
          We obsess over typography the way a chef obsesses over seasoning. The
          right font, the right weight, the right kerning &mdash; these aren&rsquo;t
          details, they&rsquo;re the whole point. Every design starts with the words
          and builds outward: what typeface gives this phrase its voice? What spacing
          lets it breathe? What placement makes it land?
        </p>

        <p>
          Our catalog spans the sarcastic and the sincere, the loud and the understated.
          Humor for overthinkers. Nature prints for people who&rsquo;d rather be outside.
          Gifts for the dad who already has everything except a shirt that actually
          makes him laugh.
        </p>

        <div className="rule-line my-12" />

        <h2 className="font-display text-2xl tracking-display text-ink-950" id="shipping">
          Shipping &amp; Production
        </h2>
        <p>
          Every product is printed on demand &mdash; no warehouses full of unsold
          inventory, no waste. When you place an order, it goes straight to production.
          Most items ship within 3&ndash;5 business days, and you&rsquo;ll get a
          tracking number as soon as it&rsquo;s on its way.
        </p>
        <p>
          We use premium printing partners who share our standards for quality.
          Direct-to-garment printing for apparel, dye-sublimation for mugs,
          weatherproof vinyl for stickers. The prints hold up because we
          won&rsquo;t ship anything we wouldn&rsquo;t wear ourselves.
        </p>

        <div className="rule-line my-12" />

        <h2 className="font-display text-2xl tracking-display text-ink-950" id="faq">
          Frequently Asked
        </h2>

        <div className="space-y-0">
          <FAQ q="How do I pick the right size?">
            Every product page includes a size chart specific to that item. When in
            doubt, size up &mdash; a slightly relaxed fit usually looks better than
            too tight, and our shirts are true to size.
          </FAQ>
          <FAQ q="Can I request a custom design?">
            Not currently, but we&rsquo;re working on it. Sign up for our email list
            and you&rsquo;ll be the first to know when custom orders open up.
          </FAQ>
          <FAQ q="What if my order arrives damaged?">
            We&rsquo;ll reprint and reship it at no cost, or issue a full refund &mdash;
            your choice. Just email us a photo within 14 days of delivery.
          </FAQ>
          <FAQ q="Do you sell at markets or fairs?">
            Yes! We regularly appear at local craft fairs and markets on Long Island.
            Follow us on social media for upcoming event announcements.
          </FAQ>
        </div>

        <div className="rule-line my-12" />

        <h2 className="font-display text-2xl tracking-display text-ink-950" id="contact">
          Get in Touch
        </h2>
        <p>
          Questions, wholesale inquiries, or just want to say hey?
          Drop us a line at{' '}
          <a href="mailto:hello@syntaxpress.com" className="text-press hover:underline">
            hello@syntaxpress.com
          </a>
          . We read every email and respond within 24 hours.
        </p>
      </div>

      {/* Bottom ornament */}
      <div className="mt-20 flex items-center justify-center gap-4">
        <span className="h-px w-12 bg-ink-300" />
        <span className="font-mono text-2xs uppercase tracking-widest text-ink-400">
          SyntaxPress &middot; Est. 2026
        </span>
        <span className="h-px w-12 bg-ink-300" />
      </div>
    </div>
  );
}

function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-ink-200">
      <summary className="flex cursor-pointer items-center justify-between py-4
        font-display text-lg tracking-display text-ink-900
        hover:text-press transition-colors">
        {q}
        <span className="text-ink-400 group-open:rotate-45 transition-transform duration-200 text-xl">
          +
        </span>
      </summary>
      <div className="pb-6 font-body text-sm text-ink-600 leading-relaxed">
        {children}
      </div>
    </details>
  );
}
