export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      {/* Background pattern — subtle letterpress texture */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              #1a1715 39px,
              #1a1715 40px
            )`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        {/* Top ornament */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-ink-300" />
          <span className="font-mono text-2xs uppercase tracking-widest text-ink-400">
            Est. 2026
          </span>
          <span className="h-px w-12 bg-ink-300" />
        </div>

        {/* Main headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-display text-ink-950 mb-6 animate-fade-in">
          Syntax<span className="text-press">Press</span>
        </h1>

        {/* Subheadline */}
        <p className="font-display text-xl md:text-2xl text-ink-600 italic mb-4 animate-slide-up"
          style={{ animationDelay: '100ms' }}>
          Artfully typeset sayings &amp; words,
        </p>
        <p className="font-display text-xl md:text-2xl text-ink-600 italic mb-10 animate-slide-up"
          style={{ animationDelay: '200ms' }}>
          pressed onto things you actually wear.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up"
          style={{ animationDelay: '350ms' }}>
          <a href="/products" className="btn-press">
            Browse the Collection
          </a>
          <a href="/about" className="btn-outline">
            Our Story
          </a>
        </div>

        {/* Bottom ornament */}
        <div className="mt-16 flex items-center justify-center gap-6">
          <span className="h-px flex-1 max-w-[100px] bg-ink-200" />
          <div className="flex items-center gap-3">
            {['T-Shirts', 'Mugs', 'Stickers', 'Wall Art'].map((item, i) => (
              <span key={item}>
                <span className="font-mono text-2xs uppercase tracking-widest text-ink-400">
                  {item}
                </span>
                {i < 3 && <span className="ml-3 text-ink-300">&middot;</span>}
              </span>
            ))}
          </div>
          <span className="h-px flex-1 max-w-[100px] bg-ink-200" />
        </div>
      </div>
    </section>
  );
}
