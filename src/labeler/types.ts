export type LabelColor = 'red' | 'green' | 'blue' | 'yellow' | 'cyan' | 'magenta' | 'white';

export interface Label {
  name: string;
  color: LabelColor;
  description?: string;
  createdAt: string;
}

export interface LabelIndex {
  [snapshotId: string]: Label[];
}

export interface LabelResult {
  snapshotId: string;
  added?: Label[];
  removed?: string[];
  current: Label[];
}
