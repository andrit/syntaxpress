import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService, AuthServiceError } from '@/lib/admin/services/auth.service';
import type { AdminUserRepository } from '@/lib/admin/repositories/admin-user.repository';

function createMockSupabase() {
  return {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  } as any;
}

function createMockAdminRepo(): jest.Mocked<AdminUserRepository> {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    isAdmin: vi.fn(),
    hasRole: vi.fn(),
    create: vi.fn(),
    updateRole: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  } as any;
}

const mockAdminUser = {
  id: 'user-123',
  email: 'admin@syntaxpress.com',
  role: 'owner' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('AuthService', () => {
  let service: AuthService;
  let supabase: ReturnType<typeof createMockSupabase>;
  let adminRepo: ReturnType<typeof createMockAdminRepo>;

  beforeEach(() => {
    supabase = createMockSupabase();
    adminRepo = createMockAdminRepo();
    service = new AuthService(supabase, adminRepo);
  });

  // ── getCurrentUser ──

  describe('getCurrentUser', () => {
    it('returns authenticated admin user', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      adminRepo.findById.mockResolvedValue(mockAdminUser);

      const result = await service.getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        email: 'admin@syntaxpress.com',
        role: 'owner',
      });
    });

    it('returns null when not authenticated', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await service.getCurrentUser();
      expect(result).toBeNull();
    });

    it('returns null when authenticated but not an admin', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-456' } },
        error: null,
      });
      adminRepo.findById.mockResolvedValue(null);

      const result = await service.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  // ── requireAuth ──

  describe('requireAuth', () => {
    it('returns user when authenticated', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      adminRepo.findById.mockResolvedValue(mockAdminUser);

      const result = await service.requireAuth();
      expect(result.id).toBe('user-123');
    });

    it('throws 401 when not authenticated', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(service.requireAuth()).rejects.toThrow(AuthServiceError);
      await expect(service.requireAuth()).rejects.toMatchObject({ status: 401 });
    });
  });

  // ── requireRole ──

  describe('requireRole', () => {
    it('allows owner to access owner-level resources', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      adminRepo.findById.mockResolvedValue(mockAdminUser);

      const result = await service.requireRole('owner');
      expect(result.role).toBe('owner');
    });

    it('allows owner to access editor-level resources', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      adminRepo.findById.mockResolvedValue(mockAdminUser);

      const result = await service.requireRole('editor');
      expect(result.role).toBe('owner');
    });

    it('denies viewer from accessing editor-level resources', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-456' } },
        error: null,
      });
      adminRepo.findById.mockResolvedValue({
        ...mockAdminUser,
        id: 'user-456',
        role: 'viewer',
      });

      await expect(service.requireRole('editor')).rejects.toMatchObject({
        status: 403,
      });
    });
  });

  // ── signIn ──

  describe('signIn', () => {
    it('signs in and returns admin user', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      adminRepo.findById.mockResolvedValue(mockAdminUser);

      const result = await service.signIn('admin@syntaxpress.com', 'password');

      expect(result.email).toBe('admin@syntaxpress.com');
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'admin@syntaxpress.com',
        password: 'password',
      });
    });

    it('rejects non-admin users and signs them out', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-999' } },
        error: null,
      });
      adminRepo.findById.mockResolvedValue(null);

      await expect(
        service.signIn('nobody@example.com', 'password')
      ).rejects.toMatchObject({ status: 403 });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('throws on invalid credentials', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        service.signIn('wrong@email.com', 'wrong')
      ).rejects.toMatchObject({ status: 401 });
    });
  });

  // ── signOut ──

  describe('signOut', () => {
    it('signs out successfully', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });
      await expect(service.signOut()).resolves.not.toThrow();
    });

    it('throws on signout failure', async () => {
      supabase.auth.signOut.mockResolvedValue({
        error: { message: 'Network error' },
      });
      await expect(service.signOut()).rejects.toThrow(AuthServiceError);
    });
  });
});
