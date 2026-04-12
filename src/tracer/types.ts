export interface TraceEntry {
  tool: string;
  version: string | null;
  detectedAt: string;
  source: 'path' | 'env' | 'config' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
}

export interface TraceReport {
  snapshotId: string;
  createdAt: string;
  entries: TraceEntry[];
  summary: {
    total: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
  };
}
