// ──────────────────────────────────────────────
// Supabase Client Exports
// ──────────────────────────────────────────────
// Import the right client for your context:
//
//   Server Component / Route Handler:
//     import { createServerSupabaseClient } from '@/lib/supabase/server';
//
//   Client Component:
//     import { createBrowserSupabaseClient } from '@/lib/supabase/client';
//
//   Middleware:
//     import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware';
//
//   Admin / Background Jobs (bypasses RLS):
//     import { createServiceRoleClient } from '@/lib/supabase/service-role';

export { isSupabaseConfigured, getConfigError } from './config';
