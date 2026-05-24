import { Tables, InsertDto } from '@/types/database';
import { BaseRepository, unwrap } from './base';

export type DesignExport = Tables<'design_exports'>;

export class DesignExportRepository extends BaseRepository {
  private readonly table = 'design_exports' as const;

  async findByDesignId(designId: string): Promise<DesignExport[]> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('design_id', designId)
      .order('platform');

    return unwrap(result, 'DesignExportRepository.findByDesignId');
  }

  async findByDesignAndPlatform(
    designId: string,
    platform: DesignExport['platform']
  ): Promise<DesignExport[]> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('design_id', designId)
      .eq('platform', platform);

    return unwrap(result, 'DesignExportRepository.findByDesignAndPlatform');
  }

  async create(data: InsertDto<'design_exports'>): Promise<DesignExport> {
    const result = await this.db
      .from(this.table)
      .insert(data)
      .select()
      .single();

    return unwrap(result, 'DesignExportRepository.create');
  }

  async createMany(data: InsertDto<'design_exports'>[]): Promise<DesignExport[]> {
    const result = await this.db
      .from(this.table)
      .insert(data)
      .select();

    return unwrap(result, 'DesignExportRepository.createMany');
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .from(this.table)
      .delete()
      .eq('id', id);

    if (result.error) {
      unwrap(result, 'DesignExportRepository.delete');
    }
  }

  async deleteByDesignId(designId: string): Promise<void> {
    const result = await this.db
      .from(this.table)
      .delete()
      .eq('design_id', designId);

    if (result.error) {
      unwrap(result, 'DesignExportRepository.deleteByDesignId');
    }
  }
}
