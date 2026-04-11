export interface PinnedTool {
  name: string;
  pinnedVersion: string;
  detectedVersion: string | null;
  pinnedAt: string;
  note?: string;
}

export interface PinIndex {
  pins: Record<string, PinnedTool>;
  updatedAt: string;
}

export interface PinResult {
  tool: string;
  success: boolean;
  message: string;
}

export interface UnpinResult {
  tool: string;
  success: boolean;
  message: string;
}
