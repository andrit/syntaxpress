import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Server Components and Route Handlers.
 * Reads/writes auth cookies via Next.js cookies() API.
 *
 * Usage:
 *   const supabase = createServerSupabaseClient();
 *   const { data } = await supabase.from('designs').select('*');
 */
export function createServerSupabaseClient() {
  const config = getSupabaseConfig();
  const cookieStore = cookies();

  return createServerClient<Database>(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // set() fails in Server Components (read-only context).
            // This is expected — auth state changes happen in
            // Route Handlers, Server Actions, and Middleware.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same as above — read-only context in Server Components.
          }
        },
      },
    }
  );
}
