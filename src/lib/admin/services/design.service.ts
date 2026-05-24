import {
  DesignRepository,
  Design,
  DesignFilters,
  PlatformListingRepository,
  DesignExportRepository,
  PaginationParams,
  PaginatedResult,
} from '../repositories';
import {
  CreateDesignInput,
  UpdateDesignInput,
  createDesignSchema,
  updateDesignSchema,
} from '../validators/schemas';

// ──────────────────────────────────────────────
// Design Service
// ──────────────────────────────────────────────
// Orchestrates design operations across repositories.
// Validates input, enforces business rules, coordinates
// side effects (e.g., cascading listing updates).

export class DesignServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL' = 'INTERNAL'
  ) {
    super(message);
    this.name = 'DesignServiceError';
  }
}

export class DesignService {
  constructor(
    private readonly designs: DesignRepository,
    private readonly listings: PlatformListingRepository,
    private readonly exports: DesignExportRepository
  ) {}

  async getById(id: string): Promise<Design> {
    const design = await this.designs.findById(id);
    if (!design) {
      throw new DesignServiceError(`Design not found: ${id}`, 'NOT_FOUND');
    }
    return design;
  }

  async getBySlug(slug: string): Promise<Design> {
    const design = await this.designs.findBySlug(slug);
    if (!design) {
      throw new DesignServiceError(`Design not found: ${slug}`, 'NOT_FOUND');
    }
    return design;
  }

  async list(
    filters?: DesignFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Design>> {
    return this.designs.findMany(filters, pagination);
  }

  async create(input: CreateDesignInput, createdBy: string): Promise<Design> {
    // Validate input
    const parsed = createDesignSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new DesignServiceError(message, 'VALIDATION');
    }

    // Check slug uniqueness
    const slugTaken = await this.designs.slugExists(parsed.data.slug);
    if (slugTaken) {
      throw new DesignServiceError(
        `Slug "${parsed.data.slug}" is already in use`,
        'CONFLICT'
      );
    }

    return this.designs.create({
      ...parsed.data,
      created_by: createdBy,
    });
  }

  async update(id: string, input: UpdateDesignInput): Promise<Design> {
    // Validate input
    const parsed = updateDesignSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new DesignServiceError(message, 'VALIDATION');
    }

    // Verify design exists
    await this.getById(id);

    // Check slug uniqueness if slug is being changed
    if (parsed.data.slug) {
      const slugTaken = await this.designs.slugExists(parsed.data.slug, id);
      if (slugTaken) {
        throw new DesignServiceError(
          `Slug "${parsed.data.slug}" is already in use`,
          'CONFLICT'
        );
      }
    }

    return this.designs.update(id, parsed.data);
  }

  async delete(id: string): Promise<void> {
    // Verify exists before cascading
    await this.getById(id);

    // Cascading deletes are handled by the DB foreign keys,
    // but we explicitly clean up storage files here.
    // (Storage cleanup will be added when the asset engine is built.)
    await this.designs.delete(id);
  }

  async updateStatus(id: string, status: Design['status']): Promise<Design> {
    await this.getById(id);
    return this.designs.updateStatus(id, status);
  }

  async getStatusCounts(): Promise<Record<Design['status'], number>> {
    return this.designs.countByStatus();
  }

  /**
   * Get a full design with all associated listings and exports.
   * Used on the design detail/edit page.
   */
  async getFullDesign(id: string) {
    const design = await this.getById(id);
    const [designListings, designExports] = await Promise.all([
      this.listings.findByDesignId(id),
      this.exports.findByDesignId(id),
    ]);

    return {
      ...design,
      listings: designListings,
      exports: designExports,
    };
  }

  /**
   * Generate a URL-safe slug from a title.
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
