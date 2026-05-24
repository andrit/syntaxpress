import { LoginForm } from '@/components/admin/auth/login-form';

export const metadata = { title: 'Sign In' };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl tracking-display text-ink-950">
            Syntax<span className="text-press">Press</span>
          </h1>
          <p className="font-mono text-2xs uppercase tracking-widest text-ink-400 mt-1">
            Admin Dashboard
          </p>
        </div>

        <div className="rule-line-thick mb-8" />

        <LoginForm redirectTo={searchParams.redirectTo} />

        <div className="rule-line mt-8 mb-6" />

        <p className="text-center font-body text-xs text-ink-400">
          First time? Sign up in your{' '}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-press hover:underline"
          >
            Supabase dashboard
          </a>
          , then sign in here. The first user automatically becomes the owner.
        </p>
      </div>
    </div>
  );
}
