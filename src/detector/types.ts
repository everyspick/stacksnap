export interface Tool {
  name: string;
  version: string | null;
  path: string | null;
}

export interface DetectedStack {
  os: string;
  arch: string;
  tools: Tool[];
  detectedAt: string;
}

export interface DetectorResult {
  success: boolean;
  tool: string;
  version: string | null;
  path: string | null;
  error?: string;
}
