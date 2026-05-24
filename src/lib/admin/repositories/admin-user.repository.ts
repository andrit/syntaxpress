import { Tables, InsertDto, UpdateDto } from '@/types/database';
import { BaseRepository, unwrap } from './base';

export type AdminUser = Tables<'admin_users'>;
export type AdminRole = AdminUser['role'];

export class AdminUserRepository extends BaseRepository {
  private readonly table = 'admin_users' as const;

  async findById(id: string): Promise<AdminUser | null> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error?.code === 'PGRST116') return null; // Not found
    return unwrap(result, 'AdminUserRepository.findById');
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('email', email)
      .single();

    if (result.error?.code === 'PGRST116') return null;
    return unwrap(result, 'AdminUserRepository.findByEmail');
  }

  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user !== null;
  }

  async hasRole(userId: string, requiredRole: AdminRole): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    const roleHierarchy: Record<AdminRole, number> = {
      owner: 3,
      editor: 2,
      viewer: 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  async create(data: InsertDto<'admin_users'>): Promise<AdminUser> {
    const result = await this.db
      .from(this.table)
      .insert(data)
      .select()
      .single();

    return unwrap(result, 'AdminUserRepository.create');
  }

  async updateRole(id: string, role: AdminRole): Promise<AdminUser> {
    const result = await this.db
      .from(this.table)
      .update({ role } satisfies UpdateDto<'admin_users'>)
      .eq('id', id)
      .select()
      .single();

    return unwrap(result, 'AdminUserRepository.updateRole');
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .from(this.table)
      .delete()
      .eq('id', id);

    if (result.error) {
      unwrap(result, 'AdminUserRepository.delete');
    }
  }

  async count(): Promise<number> {
    const result = await this.db
      .from(this.table)
      .select('*', { count: 'exact', head: true });

    if (result.error) {
      unwrap(result, 'AdminUserRepository.count');
    }

    return result.count ?? 0;
  }
}
