// ──────────────────────────────────────────────
// Re-exports
// ──────────────────────────────────────────────

export { BaseRepository, RepositoryError, unwrap } from './base';
export type { DbClient, PaginationParams, PaginatedResult } from './base';

export { AdminUserRepository } from './admin-user.repository';
export type { AdminUser, AdminRole } from './admin-user.repository';

export { DesignRepository } from './design.repository';
export type { Design, DesignStatus, DesignFilters } from './design.repository';

export { PlatformListingRepository } from './platform-listing.repository';
export type { PlatformListing, Platform, ListingStatus } from './platform-listing.repository';

export { DesignExportRepository } from './design-export.repository';
export type { DesignExport } from './design-export.repository';

export { RunRepository } from './run.repository';
export type { Run, RunStatus } from './run.repository';

export { RunDesignRepository } from './run-design.repository';
export type { RunDesign, WizardStep, StepStatus, PlatformProgress } from './run-design.repository';

// ──────────────────────────────────────────────
// Repository Factory
// ──────────────────────────────────────────────
// Local imports needed — re-exports above don't create
// in-scope bindings for use within this file.

import type { DbClient } from './base';
import { AdminUserRepository } from './admin-user.repository';
import { DesignRepository } from './design.repository';
import { PlatformListingRepository } from './platform-listing.repository';
import { DesignExportRepository } from './design-export.repository';
import { RunRepository } from './run.repository';
import { RunDesignRepository } from './run-design.repository';

export function createRepositories(db: DbClient) {
  return {
    adminUsers: new AdminUserRepository(db),
    designs: new DesignRepository(db),
    listings: new PlatformListingRepository(db),
    exports: new DesignExportRepository(db),
    runs: new RunRepository(db),
    runDesigns: new RunDesignRepository(db),
  } as const;
}

export type Repositories = ReturnType<typeof createRepositories>;
