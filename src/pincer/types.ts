export interface ToolPin {
  tool: string;
  version: string;
  pinnedAt: string;
  note?: string;
}

export interface PinCheckResult {
  tool: string;
  currentVersion: string | undefined;
  pinnedVersion: string;
  status: 'ok' | 'drift' | 'missing';
}

export interface PinReport {
  checked: number;
  ok: number;
  drifted: number;
  missing: number;
  results: PinCheckResult[];
}
