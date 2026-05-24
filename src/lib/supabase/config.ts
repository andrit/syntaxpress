import { z } from 'zod';

// ──────────────────────────────────────────────
// Supabase Configuration
// ──────────────────────────────────────────────
// Validates environment variables at runtime.
// If vars are missing, isConfigured() returns false
// and the admin routes show a "not configured" page
// instead of crashing the storefront.

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const supabaseServiceSchema = supabaseEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

type SupabaseConfig = z.infer<typeof supabaseEnvSchema>;
type SupabaseServiceConfig = z.infer<typeof supabaseServiceSchema>;

let _config: SupabaseConfig | null = null;
let _serviceConfig: SupabaseServiceConfig | null = null;
let _configError: string | null = null;

function loadConfig(): SupabaseConfig | null {
  if (_config) return _config;

  const result = supabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!result.success) {
    _configError = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    return null;
  }

  _config = result.data;
  return _config;
}

function loadServiceConfig(): SupabaseServiceConfig | null {
  if (_serviceConfig) return _serviceConfig;

  const result = supabaseServiceSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!result.success) {
    return null;
  }

  _serviceConfig = result.data;
  return _serviceConfig;
}

/** True if Supabase environment variables are present and valid */
export function isSupabaseConfigured(): boolean {
  return loadConfig() !== null;
}

/** Get validated config or throw */
export function getSupabaseConfig(): SupabaseConfig {
  const config = loadConfig();
  if (!config) {
    throw new Error(`Supabase not configured: ${_configError}`);
  }
  return config;
}

/** Get validated service config (includes service role key) or throw */
export function getSupabaseServiceConfig(): SupabaseServiceConfig {
  const config = loadServiceConfig();
  if (!config) {
    throw new Error('Supabase service role key not configured');
  }
  return config;
}

/** Human-readable config error for the "not configured" page */
export function getConfigError(): string | null {
  loadConfig();
  return _configError;
}
