import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceConfig } from './config';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client with the service role key.
 * BYPASSES Row Level Security — use only in trusted server contexts.
 *
 * Use cases:
 *   - Admin operations that need to read/write all data
 *   - Background jobs (cron, webhooks)
 *   - Initial data seeding
 *
 * NEVER expose this client to the browser.
 * NEVER import this file from a 'use client' module.
 */
export function createServiceRoleClient() {
  const config = getSupabaseServiceConfig();

  return createClient<Database>(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
