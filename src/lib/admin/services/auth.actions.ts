'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServices } from '@/lib/admin/services';
import { loginSchema } from '@/lib/admin/validators/schemas';

export type AuthActionState = {
  error: string | null;
};

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validate input
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((i) => i.message).join('. '),
    };
  }

  const supabase = createServerSupabaseClient();
  const { auth } = createServices(supabase);

  try {
    await auth.signIn(parsed.data.email, parsed.data.password);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Login failed',
    };
  }

  // Redirect to dashboard on success
  const redirectTo = formData.get('redirectTo')?.toString() || '/admin/dashboard';
  redirect(redirectTo);
}

export async function logoutAction(): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { auth } = createServices(supabase);

  await auth.signOut();
  redirect('/admin/login');
}
