'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, AuthActionState } from '@/lib/admin/services/auth.actions';

const initialState: AuthActionState = { error: null };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      {state.error && (
        <div
          role="alert"
          className="bg-press/10 border border-press/30 text-press-dark px-4 py-3 text-sm font-body"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block font-mono text-2xs uppercase tracking-widest text-ink-500 mb-2"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-ink-300 bg-paper px-4 py-3
            font-body text-sm text-ink-900 placeholder:text-ink-300
            focus:outline-none focus:border-ink-800 focus:ring-1 focus:ring-ink-800
            transition-colors"
          placeholder="you@syntaxpress.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block font-mono text-2xs uppercase tracking-widest text-ink-500 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          minLength={8}
          className="w-full border border-ink-300 bg-paper px-4 py-3
            font-body text-sm text-ink-900 placeholder:text-ink-300
            focus:outline-none focus:border-ink-800 focus:ring-1 focus:ring-ink-800
            transition-colors"
          placeholder="••••••••"
        />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full btn-press py-4 ${pending ? 'opacity-70 cursor-wait' : ''}`}
    >
      {pending ? 'Signing in...' : 'Sign In'}
    </button>
  );
}
