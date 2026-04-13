export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface ToolDiff {
  name: string;
  status: DiffStatus;
  fromVersion?: string;
  toVersion?: string;
  fromCategory?: string;
  toCategory?: string;
}

export interface SnapshotDiff {
  fromLabel: string;
  toLabel: string;
  added: ToolDiff[];
  removed: ToolDiff[];
  changed: ToolDiff[];
  unchanged: ToolDiff[];
  createdAt: string;
}

export interface DiffSummary {
  totalFrom: number;
  totalTo: number;
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}
