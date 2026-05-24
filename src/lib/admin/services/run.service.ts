import {
  RunRepository,
  Run,
  RunDesignRepository,
  RunDesign,
  DesignRepository,
  PlatformProgress,
  WizardStep,
} from '../repositories';
import { createRunSchema, CreateRunInput, updateRunSchema, UpdateRunInput } from '../validators/schemas';
import type { Platform, PaginationParams, PaginatedResult } from '../repositories';

// ──────────────────────────────────────────────
// Run Service
// ──────────────────────────────────────────────

export class RunServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'INVALID_STATE' | 'INTERNAL' = 'INTERNAL'
  ) {
    super(message);
    this.name = 'RunServiceError';
  }
}

export type RunWithProgress = Run & { progress: RunProgress };

export type RunProgress = {
  total_designs: number;
  completed_designs: number;
  completion_percentage: number;
  by_platform: Record<string, { total: number; published: number; percentage: number }>;
  by_step: Record<string, number>;
};

export class RunService {
  constructor(
    private readonly runs: RunRepository,
    private readonly runDesigns: RunDesignRepository,
    private readonly designs: DesignRepository
  ) {}

  async getById(id: string): Promise<Run> {
    const run = await this.runs.findById(id);
    if (!run) throw new RunServiceError(`Run not found: ${id}`, 'NOT_FOUND');
    return run;
  }

  async getWithProgress(id: string): Promise<RunWithProgress> {
    const run = await this.getById(id);
    const designs = await this.runDesigns.findByRunId(id);
    const progress = this.computeProgress(designs, run.target_platforms as Platform[]);

    return { ...run, progress };
  }

  async list(
    status?: Run['status'],
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Run>> {
    return this.runs.findMany(status, pagination);
  }

  async create(input: CreateRunInput, createdBy: string): Promise<Run> {
    const parsed = createRunSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new RunServiceError(message, 'VALIDATION');
    }

    return this.runs.create({
      ...parsed.data,
      created_by: createdBy,
    });
  }

  async update(id: string, input: UpdateRunInput): Promise<Run> {
    const parsed = updateRunSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new RunServiceError(message, 'VALIDATION');
    }

    await this.getById(id);
    return this.runs.update(id, parsed.data);
  }

  async delete(id: string): Promise<void> {
    const run = await this.getById(id);
    if (run.status === 'in_progress') {
      throw new RunServiceError('Cannot delete an in-progress run', 'INVALID_STATE');
    }
    await this.runs.delete(id);
  }

  /**
   * Start a run — transitions from planning to in_progress.
   */
  async start(id: string): Promise<Run> {
    const run = await this.getById(id);
    if (run.status !== 'planning') {
      throw new RunServiceError(`Cannot start a run in ${run.status} status`, 'INVALID_STATE');
    }

    const designCount = await this.runDesigns.countByRun(id);
    if (designCount === 0) {
      throw new RunServiceError('Cannot start a run with no designs', 'INVALID_STATE');
    }

    return this.runs.update(id, {
      status: 'in_progress',
      started_at: new Date().toISOString(),
      design_count: designCount,
    });
  }

  /**
   * Complete a run — transitions from in_progress to completed.
   */
  async complete(id: string): Promise<Run> {
    const run = await this.getById(id);
    if (run.status !== 'in_progress') {
      throw new RunServiceError(`Cannot complete a run in ${run.status} status`, 'INVALID_STATE');
    }

    return this.runs.update(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  // ── Design management within a run ──

  /**
   * Add a design to a run. Creates a run_designs record.
   */
  async addDesign(
    runId: string,
    designId: string,
    options?: { startStep?: WizardStep; platformStatus?: Record<string, PlatformProgress> }
  ): Promise<RunDesign> {
    await this.getById(runId);

    const existing = await this.runDesigns.findByRunAndDesign(runId, designId);
    if (existing) {
      throw new RunServiceError('Design is already in this run', 'CONFLICT');
    }

    const sortOrder = await this.runDesigns.getNextSortOrder(runId);

    const runDesign = await this.runDesigns.create({
      run_id: runId,
      design_id: designId,
      sort_order: sortOrder,
      current_step: options?.startStep ?? 1,
      platform_status: (options?.platformStatus ?? {}) as any,
    });

    // Update design count
    const count = await this.runDesigns.countByRun(runId);
    await this.runs.updateDesignCount(runId, count);

    return runDesign;
  }

  /**
   * Add multiple designs to a run in bulk.
   */
  async addDesigns(
    runId: string,
    designEntries: {
      designId: string;
      startStep?: WizardStep;
      platformStatus?: Record<string, PlatformProgress>;
    }[]
  ): Promise<RunDesign[]> {
    await this.getById(runId);
    const currentOrder = await this.runDesigns.getNextSortOrder(runId);

    const records = designEntries.map((entry, i) => ({
      run_id: runId,
      design_id: entry.designId,
      sort_order: currentOrder + i,
      current_step: (entry.startStep ?? 1) as WizardStep,
      platform_status: (entry.platformStatus ?? {}) as any,
    }));

    const runDesigns = await this.runDesigns.createMany(records);

    const count = await this.runDesigns.countByRun(runId);
    await this.runs.updateDesignCount(runId, count);

    return runDesigns;
  }

  /**
   * Remove a design from a run.
   */
  async removeDesign(runDesignId: string): Promise<void> {
    const rd = await this.runDesigns.findById(runDesignId);
    if (!rd) throw new RunServiceError('Run design not found', 'NOT_FOUND');

    await this.runDesigns.delete(runDesignId);

    const count = await this.runDesigns.countByRun(rd.run_id);
    await this.runs.updateDesignCount(rd.run_id, count);
  }

  /**
   * Get all designs in a run with their wizard progress.
   */
  async getRunDesigns(runId: string): Promise<RunDesign[]> {
    return this.runDesigns.findByRunId(runId);
  }

  /**
   * Advance a design to the next wizard step.
   */
  async advanceDesignStep(runDesignId: string, step: WizardStep): Promise<RunDesign> {
    return this.runDesigns.advanceStep(runDesignId, step);
  }

  /**
   * Update a design's platform status within a run.
   */
  async updateDesignPlatformStatus(
    runDesignId: string,
    platform: string,
    progress: Partial<PlatformProgress>
  ): Promise<RunDesign> {
    return this.runDesigns.updatePlatformStatus(runDesignId, platform, progress);
  }

  /**
   * Mark a design as complete within a run.
   */
  async completeDesign(runDesignId: string): Promise<RunDesign> {
    return this.runDesigns.markComplete(runDesignId);
  }

  // ── Progress computation ──

  private computeProgress(
    runDesigns: RunDesign[],
    targetPlatforms: Platform[]
  ): RunProgress {
    const total = runDesigns.length;
    const completed = runDesigns.filter((rd) => rd.completed_at !== null).length;

    const byStep: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, complete: completed };
    for (const rd of runDesigns) {
      if (rd.completed_at) continue;
      byStep[String(rd.current_step)] = (byStep[String(rd.current_step)] ?? 0) + 1;
    }

    const byPlatform: Record<string, { total: number; published: number; percentage: number }> = {};
    for (const platform of targetPlatforms) {
      let published = 0;
      for (const rd of runDesigns) {
        const ps = rd.platform_status as Record<string, PlatformProgress> | null;
        if (ps?.[platform]?.published) published++;
      }
      byPlatform[platform] = {
        total,
        published,
        percentage: total > 0 ? Math.round((published / total) * 100) : 0,
      };
    }

    return {
      total_designs: total,
      completed_designs: completed,
      completion_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      by_platform: byPlatform,
      by_step: byStep,
    };
  }
}
