export interface InspectionRule {
  id: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  check: (tool: string, version: string | null) => boolean;
  message: (tool: string, version: string | null) => string;
}

export interface InspectionResult {
  ruleId: string;
  tool: string;
  version: string | null;
  severity: 'info' | 'warning' | 'error';
  passed: boolean;
  message: string;
}

export interface InspectionReport {
  snapshotId: string;
  timestamp: string;
  results: InspectionResult[];
  passCount: number;
  warnCount: number;
  errorCount: number;
  infoCount: number;
}
