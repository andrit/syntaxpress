import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex flex-col items-center ${className}`}>
      <span className="font-display text-2xl tracking-display text-ink-950 transition-colors group-hover:text-press">
        SyntaxPress
      </span>
      <span className="font-mono text-2xs uppercase tracking-widest text-ink-400 mt-0.5">
        Artfully Typeset
      </span>
    </Link>
  );
}
