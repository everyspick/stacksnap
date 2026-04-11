export interface Annotation {
  key: string;
  value: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnnotatedSnapshot {
  snapshotId: string;
  annotations: Record<string, Annotation>;
}

export interface AnnotationIndex {
  [snapshotId: string]: AnnotatedSnapshot;
}

export interface AnnotateOptions {
  snapshotId: string;
  key: string;
  value: string;
}

export interface RemoveAnnotationOptions {
  snapshotId: string;
  key: string;
}
