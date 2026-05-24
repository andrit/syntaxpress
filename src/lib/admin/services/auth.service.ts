import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AdminUserRepository, AdminRole } from '../repositories';

// ──────────────────────────────────────────────
// Auth Service
// ──────────────────────────────────────────────
// Handles authentication and authorization logic.
// Depends on AdminUserRepository (DIP).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<Database, any, any>;

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: AdminRole;
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

export class AuthService {
  constructor(
    private readonly supabase: AnySupabaseClient,
    private readonly adminUsers: AdminUserRepository
  ) {}

  /**
   * Gets the current authenticated admin user.
   * Returns null if not authenticated or not an admin.
   */
  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error || !user) return null;

    const adminUser = await this.adminUsers.findById(user.id);
    if (!adminUser) return null;

    return {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    };
  }

  /**
   * Requires an authenticated admin user. Throws if not.
   */
  async requireAuth(): Promise<AuthenticatedUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthServiceError('Authentication required', 401);
    }
    return user;
  }

  /**
   * Requires a minimum role level. Throws if insufficient.
   */
  async requireRole(minimumRole: AdminRole): Promise<AuthenticatedUser> {
    const user = await this.requireAuth();

    const roleHierarchy: Record<AdminRole, number> = {
      owner: 3,
      editor: 2,
      viewer: 1,
    };

    if (roleHierarchy[user.role] < roleHierarchy[minimumRole]) {
      throw new AuthServiceError(
        `Insufficient permissions: requires ${minimumRole}, have ${user.role}`,
        403
      );
    }

    return user;
  }

  /**
   * Sign in with email and password.
   */
  async signIn(email: string, password: string): Promise<AuthenticatedUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthServiceError(error.message, 401);
    }

    // Verify they're an admin
    const adminUser = await this.adminUsers.findById(data.user.id);
    if (!adminUser) {
      // Sign them out — they authenticated but aren't an admin
      await this.supabase.auth.signOut();
      throw new AuthServiceError(
        'Access denied: not an authorized admin user',
        403
      );
    }

    return {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    };
  }

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new AuthServiceError(`Sign out failed: ${error.message}`, 500);
    }
  }
}
