import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { createRepositories } from '../repositories';
import { AuthService } from './auth.service';
import { DesignService } from './design.service';
import { RunService } from './run.service';

export { AuthService, AuthServiceError } from './auth.service';
export type { AuthenticatedUser } from './auth.service';

export { DesignService, DesignServiceError } from './design.service';
export { RunService, RunServiceError } from './run.service';
export type { RunWithProgress, RunProgress } from './run.service';

export { applyTemplate, buildPlaceholders, extractPlaceholders, validateTemplate } from './template-engine';

export * from './import';

// ──────────────────────────────────────────────
// Service Factory
// ──────────────────────────────────────────────

export function createServices(supabase: SupabaseClient<Database>) {
  const repos = createRepositories(supabase);

  return {
    auth: new AuthService(supabase, repos.adminUsers),
    designs: new DesignService(repos.designs, repos.listings, repos.exports),
    runs: new RunService(repos.runs, repos.runDesigns, repos.designs),
    repos,
  } as const;
}

export type Services = ReturnType<typeof createServices>;
