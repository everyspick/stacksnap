import { Snapshot } from '../detector/types';

export interface SnapshotSummary {
  totalTools: number;
  detectedTools: number;
  missingTools: number;
  detectionRate: number;
  toolNames: string[];
  missingToolNames: string[];
  createdAt: string;
  hostname: string;
  platform: string;
}

export function summarizeSnapshot(snapshot: Snapshot): SnapshotSummary {
  const tools = snapshot.tools ?? [];
  const totalTools = tools.length;
  const detectedTools = tools.filter((t) => t.version !== null && t.version !== undefined).length;
  const missingTools = totalTools - detectedTools;
  const detectionRate = totalTools > 0 ? Math.round((detectedTools / totalTools) * 100) : 0;

  const toolNames = tools
    .filter((t) => t.version !== null && t.version !== undefined)
    .map((t) => t.name);

  const missingToolNames = tools
    .filter((t) => t.version === null || t.version === undefined)
    .map((t) => t.name);

  return {
    totalTools,
    detectedTools,
    missingTools,
    detectionRate,
    toolNames,
    missingToolNames,
    createdAt: snapshot.createdAt,
    hostname: snapshot.hostname ?? 'unknown',
    platform: snapshot.platform ?? 'unknown',
  };
}

export function formatSummary(summary: SnapshotSummary): string {
  const lines: string[] = [];

  lines.push('=== Snapshot Summary ===');
  lines.push(`Host:         ${summary.hostname}`);
  lines.push(`Platform:     ${summary.platform}`);
  lines.push(`Created:      ${summary.createdAt}`);
  lines.push('');
  lines.push(`Total Tools:  ${summary.totalTools}`);
  lines.push(`Detected:     ${summary.detectedTools}`);
  lines.push(`Missing:      ${summary.missingTools}`);
  lines.push(`Detection:    ${summary.detectionRate}%`);

  if (summary.toolNames.length > 0) {
    lines.push('');
    lines.push('Detected Tools:');
    summary.toolNames.forEach((name) => lines.push(`  - ${name}`));
  }

  if (summary.missingToolNames.length > 0) {
    lines.push('');
    lines.push('Missing Tools:');
    summary.missingToolNames.forEach((name) => lines.push(`  - ${name}`));
  }

  return lines.join('\n');
}
