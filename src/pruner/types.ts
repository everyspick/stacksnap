export type PruneStrategy = 'orphaned' | 'duplicates' | 'unversioned' | 'all';

export interface PruneOptions {
  strategies: PruneStrategy[];
  dryRun?: boolean;
}

export interface PruneResult {
  original: number;
  pruned: number;
  removed: string[];
  strategies: PruneStrategy[];
  dryRun: boolean;
}
