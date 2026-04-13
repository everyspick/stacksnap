import { ToolInfo } from '../detector/types';

export interface EnrichmentSource {
  name: string;
  url?: string;
  description?: string;
}

export interface EnrichedTool extends ToolInfo {
  latestVersion?: string;
  homepage?: string;
  description?: string;
  isOutdated?: boolean;
  enrichedAt?: string;
}

export interface EnrichmentResult {
  enriched: EnrichedTool[];
  skipped: string[];
  enrichedCount: number;
  skippedCount: number;
}
