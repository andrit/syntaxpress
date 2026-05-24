import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to re-import the module fresh for each test
// because config is cached at module level.
// Using dynamic imports + vi.resetModules().

describe('Supabase Config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('reports not configured when env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { isSupabaseConfigured } = await import('@/lib/supabase/config');
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('reports configured when env vars are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const { isSupabaseConfigured } = await import('@/lib/supabase/config');
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('rejects invalid URL', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const { isSupabaseConfigured } = await import('@/lib/supabase/config');
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('throws descriptive error from getSupabaseConfig when not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getSupabaseConfig } = await import('@/lib/supabase/config');
    expect(() => getSupabaseConfig()).toThrow('Supabase not configured');
  });

  it('returns config object when configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const { getSupabaseConfig } = await import('@/lib/supabase/config');
    const config = getSupabaseConfig();

    expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(config.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
  });

  it('returns error string from getConfigError', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const { getConfigError } = await import('@/lib/supabase/config');
    const error = getConfigError();

    expect(error).toBeTruthy();
    expect(typeof error).toBe('string');
  });
});
