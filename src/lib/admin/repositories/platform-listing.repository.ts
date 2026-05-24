import { Tables, InsertDto, UpdateDto } from '@/types/database';
import { BaseRepository, unwrap } from './base';

export type PlatformListing = Tables<'platform_listings'>;
export type Platform = PlatformListing['platform'];
export type ListingStatus = PlatformListing['status'];

export class PlatformListingRepository extends BaseRepository {
  private readonly table = 'platform_listings' as const;

  async findById(id: string): Promise<PlatformListing | null> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error?.code === 'PGRST116') return null;
    return unwrap(result, 'PlatformListingRepository.findById');
  }

  async findByDesignId(designId: string): Promise<PlatformListing[]> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('design_id', designId)
      .order('platform');

    return unwrap(result, 'PlatformListingRepository.findByDesignId');
  }

  async findByDesignAndPlatform(
    designId: string,
    platform: Platform
  ): Promise<PlatformListing | null> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('design_id', designId)
      .eq('platform', platform)
      .single();

    if (result.error?.code === 'PGRST116') return null;
    return unwrap(result, 'PlatformListingRepository.findByDesignAndPlatform');
  }

  async create(data: InsertDto<'platform_listings'>): Promise<PlatformListing> {
    const result = await this.db
      .from(this.table)
      .insert(data)
      .select()
      .single();

    return unwrap(result, 'PlatformListingRepository.create');
  }

  async createMany(data: InsertDto<'platform_listings'>[]): Promise<PlatformListing[]> {
    const result = await this.db
      .from(this.table)
      .insert(data)
      .select();

    return unwrap(result, 'PlatformListingRepository.createMany');
  }

  async update(id: string, data: UpdateDto<'platform_listings'>): Promise<PlatformListing> {
    const result = await this.db
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return unwrap(result, 'PlatformListingRepository.update');
  }

  async updateStatus(id: string, status: ListingStatus): Promise<PlatformListing> {
    return this.update(id, { status });
  }

  async markPublished(
    id: string,
    externalId: string,
    externalUrl: string
  ): Promise<PlatformListing> {
    return this.update(id, {
      status: 'published',
      external_id: externalId,
      external_url: externalUrl,
      published_at: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .from(this.table)
      .delete()
      .eq('id', id);

    if (result.error) {
      unwrap(result, 'PlatformListingRepository.delete');
    }
  }

  async deleteByDesignId(designId: string): Promise<void> {
    const result = await this.db
      .from(this.table)
      .delete()
      .eq('design_id', designId);

    if (result.error) {
      unwrap(result, 'PlatformListingRepository.deleteByDesignId');
    }
  }
}
