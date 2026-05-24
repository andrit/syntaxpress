import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <span className="font-mono text-8xl text-ink-200 mb-4">404</span>
      <h1 className="font-display text-3xl tracking-display text-ink-950 mb-3">
        Page Not Found
      </h1>
      <p className="font-body text-ink-500 mb-8 max-w-md">
        This page seems to have wandered off. Maybe it&rsquo;s out buying a shirt.
      </p>
      <Link href="/" className="btn-press">
        Back to Home
      </Link>
    </div>
  );
}
