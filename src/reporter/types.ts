export type ReportFormat = 'text' | 'json' | 'markdown';

export interface ReportSection {
  title: string;
  content: string;
}

export interface SnapshotReport {
  generatedAt: string;
  snapshotId: string;
  snapshotLabel: string;
  sections: ReportSection[];
  format: ReportFormat;
}

export interface ReportOptions {
  format: ReportFormat;
  includeSummary?: boolean;
  includeScore?: boolean;
  includeLint?: boolean;
  includeRecommendations?: boolean;
  includeAudit?: boolean;
}
