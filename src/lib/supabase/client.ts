import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Client Components.
 * Singleton — safe to call multiple times, returns the same instance.
 *
 * Usage:
 *   const supabase = createBrowserSupabaseClient();
 *   const { data } = await supabase.auth.getUser();
 */
let _browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  if (_browserClient) return _browserClient;

  const config = getSupabaseConfig();

  _browserClient = createBrowserClient<Database>(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return _browserClient;
}
