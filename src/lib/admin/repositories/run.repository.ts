import { Tables, InsertDto, UpdateDto } from '@/types/database';
import { BaseRepository, PaginatedResult, PaginationParams, unwrap } from './base';

export type Run = Tables<'runs'>;
export type RunStatus = Run['status'];

export class RunRepository extends BaseRepository {
  private readonly table = 'runs' as const;

  async findById(id: string): Promise<Run | null> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error?.code === 'PGRST116') return null;
    return unwrap(result, 'RunRepository.findById');
  }

  async findMany(
    status?: RunStatus,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Run>> {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.db
      .from(this.table)
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const result = await query
      .order('updated_at', { ascending: false })
      .range(from, to);

    const data = unwrap(result, 'RunRepository.findMany');
    const total = result.count ?? 0;

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(data: InsertDto<'runs'>): Promise<Run> {
    const result = await this.db
      .from(this.table)
      .insert(data)
      .select()
      .single();

    return unwrap(result, 'RunRepository.create');
  }

  async update(id: string, data: UpdateDto<'runs'>): Promise<Run> {
    const result = await this.db
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return unwrap(result, 'RunRepository.update');
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.from(this.table).delete().eq('id', id);
    if (result.error) unwrap(result, 'RunRepository.delete');
  }

  async updateDesignCount(id: string, count: number): Promise<Run> {
    return this.update(id, { design_count: count });
  }
}
