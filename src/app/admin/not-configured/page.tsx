export default function NotConfiguredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <span className="font-mono text-6xl text-ink-200 block mb-4">⚙</span>
        <h1 className="font-display text-2xl tracking-display text-ink-950 mb-3">
          Admin Not Configured
        </h1>
        <p className="font-body text-sm text-ink-500 leading-relaxed mb-6">
          The admin dashboard requires Supabase. Add these environment variables
          to your <code className="font-mono text-xs bg-ink-100 px-1.5 py-0.5">.env.local</code>:
        </p>
        <div className="bg-ink-950 text-paper/80 font-mono text-xs text-left p-4 space-y-1">
          <p>NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</p>
          <p>SUPABASE_SERVICE_ROLE_KEY=eyJ...</p>
        </div>
        <p className="font-body text-sm text-ink-400 mt-6">
          The storefront works fine without these &mdash; only
          the admin dashboard needs them.
        </p>
        <a
          href="/"
          className="inline-block mt-6 font-mono text-xs uppercase tracking-widest
            text-ink-500 hover:text-press transition-colors"
        >
          &larr; Back to Storefront
        </a>
      </div>
    </div>
  );
}
