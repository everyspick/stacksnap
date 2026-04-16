export interface SplitOptions {
  by: 'category' | 'versionPresence' | 'namePrefix';
  prefix?: string;
}

export interface SplitResult {
  buckets: Record<string, import('../snapshot/snapshot').Snapshot>;
  options: SplitOptions;
  totalTools: number;
  bucketCount: number;
}
