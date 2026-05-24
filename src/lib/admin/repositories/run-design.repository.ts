import { Tables, InsertDto, UpdateDto, Json } from '@/types/database';
import { BaseRepository, unwrap } from './base';

export type RunDesign = Tables<'run_designs'>;
export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type StepStatus = 'pending' | 'in_progress' | 'complete';

export type PlatformProgress = {
  assets: 'pending' | 'complete';
  copy: 'pending' | 'ready';
  published: boolean;
  published_at?: string;
  skipped?: boolean;
};

export class RunDesignRepository extends BaseRepository {
  private readonly table = 'run_designs' as const;

  async findById(id: string): Promise<RunDesign | null> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error?.code === 'PGRST116') return null;
    return unwrap(result, 'RunDesignRepository.findById');
  }

  async findByRunId(runId: string): Promise<RunDesign[]> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('run_id', runId)
      .order('sort_order');

    return unwrap(result, 'RunDesignRepository.findByRunId');
  }

  async findByRunAndDesign(runId: string, designId: string): Promise<RunDesign | null> {
    const result = await this.db
      .from(this.table)
      .select('*')
      .eq('run_id', runId)
      .eq('design_id', designId)
      .single();

    if (result.error?.code === 'PGRST116') return null;
    return unwrap(result, 'RunDesignRepository.findByRunAndDesign');
  }

  async create(data: InsertDto<'run_designs'>): Promise<RunDesign> {
    const result = await this.db
      .from(this.table)
      .insert(data)
      .select()
      .single();

    return unwrap(result, 'RunDesignRepository.create');
  }

  async createMany(data: InsertDto<'run_designs'>[]): Promise<RunDesign[]> {
    const result = await this.db
      .from(this.table)
      .insert(data)
      .select();

    return unwrap(result, 'RunDesignRepository.createMany');
  }

  async update(id: string, data: UpdateDto<'run_designs'>): Promise<RunDesign> {
    const result = await this.db
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return unwrap(result, 'RunDesignRepository.update');
  }

  async advanceStep(id: string, step: WizardStep): Promise<RunDesign> {
    const current = await this.findById(id);
    if (!current) throw new Error(`RunDesign not found: ${id}`);

    const stepStatus = (current.step_status as Record<string, StepStatus>);
    // Mark previous step as complete
    if (step > 1) {
      stepStatus[String(step - 1)] = 'complete';
    }
    stepStatus[String(step)] = 'in_progress';

    return this.update(id, {
      current_step: step,
      step_status: stepStatus as unknown as Json,
      ...(step === 1 && !current.started_at ? { started_at: new Date().toISOString() } : {}),
    });
  }

  async updatePlatformStatus(
    id: string,
    platform: string,
    progress: Partial<PlatformProgress>
  ): Promise<RunDesign> {
    const current = await this.findById(id);
    if (!current) throw new Error(`RunDesign not found: ${id}`);

    const platformStatus = (current.platform_status as Record<string, PlatformProgress>) ?? {};
    platformStatus[platform] = {
      ...platformStatus[platform],
      ...progress,
    };

    return this.update(id, { platform_status: platformStatus as unknown as Json });
  }

  async markComplete(id: string): Promise<RunDesign> {
    const current = await this.findById(id);
    if (!current) throw new Error(`RunDesign not found: ${id}`);

    const stepStatus = current.step_status as Record<string, StepStatus>;
    for (const key of Object.keys(stepStatus)) {
      stepStatus[key] = 'complete';
    }

    return this.update(id, {
      current_step: 5 as WizardStep,
      step_status: stepStatus as unknown as Json,
      completed_at: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.from(this.table).delete().eq('id', id);
    if (result.error) unwrap(result, 'RunDesignRepository.delete');
  }

  async countByRun(runId: string): Promise<number> {
    const result = await this.db
      .from(this.table)
      .select('*', { count: 'exact', head: true })
      .eq('run_id', runId);

    return result.count ?? 0;
  }

  async getNextSortOrder(runId: string): Promise<number> {
    const result = await this.db
      .from(this.table)
      .select('sort_order')
      .eq('run_id', runId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    if (result.error) return 0;
    return (result.data?.sort_order ?? 0) + 1;
  }
}
