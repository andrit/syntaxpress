import { Tables, InsertDto, UpdateDto } from '@/types/database';
import {
  BaseRepository,
  PaginationParams,
  PaginatedResult,
  unwrap,
} from './base';

export type Design = Tables<'designs'>;
export type DesignStatus = Design['status'];

export interface DesignFilters {
  status?: DesignStatus;
  collection?: string;
  search?: string;
}

export class DesignRepository extends BaseRepository {
  private readonly table = 'designs' as const;

  async findById(id: string): Promise<Design | null> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error?.code === 'PGRST116') return null;
    return unwrap(result, 'DesignRepository.findById');
  }

  async findBySlug(slug: string): Promise<Design | null> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('slug', slug)
      .single();

    if (result.error?.code === 'PGRST116') return null;
    return unwrap(result, 'DesignRepository.findBySlug');
  }

  async findMany(
    filters?: DesignFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Design>> {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.db
      .from(this.table)
      .select('*', { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.collection) {
      query = query.eq('collection', filters.collection);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const result = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    const data = unwrap(result, 'DesignRepository.findMany');
    const total = result.count ?? 0;

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(data: InsertDto<'designs'>): Promise<Design> {
    const result = await this.db
      .from(this.table)
      .insert(data)
      .select()
      .single();

    return unwrap(result, 'DesignRepository.create');
  }

  async update(id: string, data: UpdateDto<'designs'>): Promise<Design> {
    const result = await this.db
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return unwrap(result, 'DesignRepository.update');
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .from(this.table)
      .delete()
      .eq('id', id);

    if (result.error) {
      unwrap(result, 'DesignRepository.delete');
    }
  }

  async updateStatus(id: string, status: DesignStatus): Promise<Design> {
    return this.update(id, { status });
  }

  async countByStatus(): Promise<Record<DesignStatus, number>> {
    const statuses: DesignStatus[] = ['draft', 'staged', 'published', 'archived'];
    const counts: Record<string, number> = {};

    for (const status of statuses) {
      const result = await this.db
        .from(this.table)
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      counts[status] = result.count ?? 0;
    }

    return counts as Record<DesignStatus, number>;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    let query = this.db
      .from(this.table)
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const result = await query;
    return (result.count ?? 0) > 0;
  }
}
