import { Snapshot } from '../snapshot/snapshot';
import { ToolEntry } from '../detector/types';
import { ExpiryRule, ExpiryResult } from './types';

function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return (now - then) / (1000 * 60 * 60 * 24);
}

export function expireSnapshot(
  snapshot: Snapshot,
  rule: ExpiryRule
): { snapshot: Snapshot; result: ExpiryResult } {
  const expired: string[] = [];
  const kept: string[] = [];

  const filteredTools = snapshot.tools.filter((tool: ToolEntry) => {
    const inScope =
      !rule.applyToCategories ||
      (tool.category !== undefined && rule.applyToCategories.includes(tool.category));

    if (inScope && tool.detectedAt && daysSince(tool.detectedAt) > rule.maxAgeDays) {
      expired.push(tool.name);
      return false;
    }
    kept.push(tool.name);
    return true;
  });

  return {
    snapshot: { ...snapshot, tools: filteredTools },
    result: {
      expired,
      kept,
      totalChecked: snapshot.tools.length,
    },
  };
}

export function formatExpiryResult(result: ExpiryResult): string {
  const lines: string[] = [
    `Expiry Check: ${result.totalChecked} tools checked`,
    `  Expired (removed): ${result.expired.length}`,
    ...result.expired.map((n) => `    - ${n}`),
    `  Kept: ${result.kept.length}`,
  ];
  return lines.join('\n');
}
