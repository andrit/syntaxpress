import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// ──────────────────────────────────────────────
// Base Repository
// ──────────────────────────────────────────────
// All repositories extend this. Accepts a Supabase client
// via constructor injection (Dependency Inversion Principle)
// so tests can pass a mock, and production passes the real client.

export type DbClient = SupabaseClient<Database>;

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export abstract class BaseRepository {
  constructor(protected readonly db: DbClient) {}
}

/**
 * Unwraps a Supabase query result.
 * Throws a descriptive error if the query failed.
 */
export function unwrap<T>(
  result: { data: T | null; error: { message: string; code?: string } | null },
  context: string
): T {
  if (result.error) {
    throw new RepositoryError(
      `${context}: ${result.error.message}`,
      result.error.code
    );
  }
  if (result.data === null) {
    throw new RepositoryError(`${context}: no data returned`);
  }
  return result.data;
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
