import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesignService, DesignServiceError } from '@/lib/admin/services/design.service';
import type { DesignRepository } from '@/lib/admin/repositories/design.repository';
import type { PlatformListingRepository } from '@/lib/admin/repositories/platform-listing.repository';
import type { DesignExportRepository } from '@/lib/admin/repositories/design-export.repository';

// ──────────────────────────────────────────────
// Mock repositories
// ──────────────────────────────────────────────

function createMockDesignRepo(): jest.Mocked<DesignRepository> {
  return {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateStatus: vi.fn(),
    countByStatus: vi.fn(),
    slugExists: vi.fn(),
  } as any;
}

function createMockListingRepo(): jest.Mocked<PlatformListingRepository> {
  return {
    findByDesignId: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
  } as any;
}

function createMockExportRepo(): jest.Mocked<DesignExportRepository> {
  return {
    findByDesignId: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
  } as any;
}

const mockDesign = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Sarcasm Loading',
  slug: 'sarcasm-loading',
  description: null,
  collection: 'Sarcastic Humor',
  tags: ['sarcasm', 'funny'],
  target_who: [],
  target_what: [],
  target_when: [],
  status: 'draft' as const,
  source_file_path: null,
  created_by: 'user-123',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('DesignService', () => {
  let service: DesignService;
  let designRepo: ReturnType<typeof createMockDesignRepo>;
  let listingRepo: ReturnType<typeof createMockListingRepo>;
  let exportRepo: ReturnType<typeof createMockExportRepo>;

  beforeEach(() => {
    designRepo = createMockDesignRepo();
    listingRepo = createMockListingRepo();
    exportRepo = createMockExportRepo();
    service = new DesignService(designRepo, listingRepo, exportRepo);
  });

  // ── getById ──

  describe('getById', () => {
    it('returns design when found', async () => {
      designRepo.findById.mockResolvedValue(mockDesign);
      const result = await service.getById(mockDesign.id);
      expect(result).toEqual(mockDesign);
      expect(designRepo.findById).toHaveBeenCalledWith(mockDesign.id);
    });

    it('throws NOT_FOUND when design does not exist', async () => {
      designRepo.findById.mockResolvedValue(null);
      await expect(service.getById('nonexistent')).rejects.toThrow(DesignServiceError);
      await expect(service.getById('nonexistent')).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });
  });

  // ── create ──

  describe('create', () => {
    const validInput = {
      title: 'New Design',
      slug: 'new-design',
      tags: ['test'],
    };

    it('creates design with valid input', async () => {
      designRepo.slugExists.mockResolvedValue(false);
      designRepo.create.mockResolvedValue({ ...mockDesign, ...validInput });

      const result = await service.create(validInput, 'user-123');

      expect(designRepo.slugExists).toHaveBeenCalledWith('new-design');
      expect(designRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Design',
          slug: 'new-design',
          created_by: 'user-123',
        })
      );
      expect(result.title).toBe('New Design');
    });

    it('throws CONFLICT when slug is taken', async () => {
      designRepo.slugExists.mockResolvedValue(true);

      await expect(service.create(validInput, 'user-123')).rejects.toMatchObject({
        code: 'CONFLICT',
      });
      expect(designRepo.create).not.toHaveBeenCalled();
    });

    it('throws VALIDATION for invalid input', async () => {
      await expect(
        service.create({ title: '', slug: 'INVALID SLUG' }, 'user-123')
      ).rejects.toMatchObject({
        code: 'VALIDATION',
      });
      expect(designRepo.slugExists).not.toHaveBeenCalled();
    });
  });

  // ── update ──

  describe('update', () => {
    it('updates design with valid partial input', async () => {
      designRepo.findById.mockResolvedValue(mockDesign);
      designRepo.update.mockResolvedValue({ ...mockDesign, title: 'Updated' });

      const result = await service.update(mockDesign.id, { title: 'Updated' });

      expect(result.title).toBe('Updated');
      expect(designRepo.update).toHaveBeenCalledWith(
        mockDesign.id,
        expect.objectContaining({ title: 'Updated' })
      );
    });

    it('checks slug uniqueness when slug changes', async () => {
      designRepo.findById.mockResolvedValue(mockDesign);
      designRepo.slugExists.mockResolvedValue(false);
      designRepo.update.mockResolvedValue({ ...mockDesign, slug: 'new-slug' });

      await service.update(mockDesign.id, { slug: 'new-slug' });

      expect(designRepo.slugExists).toHaveBeenCalledWith('new-slug', mockDesign.id);
    });

    it('throws NOT_FOUND for nonexistent design', async () => {
      designRepo.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'x' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  // ── getFullDesign ──

  describe('getFullDesign', () => {
    it('returns design with listings and exports', async () => {
      designRepo.findById.mockResolvedValue(mockDesign);
      listingRepo.findByDesignId.mockResolvedValue([
        { id: 'l1', platform: 'etsy', status: 'draft' },
      ]);
      exportRepo.findByDesignId.mockResolvedValue([
        { id: 'e1', platform: 'etsy', width: 4500 },
      ]);

      const result = await service.getFullDesign(mockDesign.id);

      expect(result.title).toBe(mockDesign.title);
      expect(result.listings).toHaveLength(1);
      expect(result.exports).toHaveLength(1);
    });
  });

  // ── generateSlug ──

  describe('generateSlug', () => {
    it('converts title to url-safe slug', () => {
      expect(DesignService.generateSlug('Hello World')).toBe('hello-world');
      expect(DesignService.generateSlug("I'm Not Sarcastic")).toBe('i-m-not-sarcastic');
      expect(DesignService.generateSlug('  Extra   Spaces  ')).toBe('extra-spaces');
      expect(DesignService.generateSlug('Special @#$ Characters!')).toBe('special-characters');
    });
  });
});
