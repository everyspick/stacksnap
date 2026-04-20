import { Snapshot, ToolEntry } from '../snapshot/snapshot';
import { FlattenedTool, FlattenResult } from './types';

/**
 * Merges multiple snapshots into a single flat list of unique tools.
 * Deduplication is based on tool name (case-insensitive).
 * When duplicates exist, the entry from the earliest snapshot wins.
 */
export function flattenSnapshots(
  snapshots: Snapshot[],
  options: { preferLatest?: boolean } = {}
): FlattenResult {
  const seen = new Map<string, FlattenedTool>();
  let totalBefore = 0;

  const ordered = options.preferLatest ? [...snapshots].reverse() : snapshots;

  for (const snapshot of ordered) {
    const sourceLabel = snapshot.id ?? snapshot.label ?? 'unknown';
    for (const tool of snapshot.tools) {
      totalBefore++;
      const key = tool.name.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, {
          name: tool.name,
          version: tool.version,
          category: tool.category,
          source: sourceLabel,
        });
      }
    }
  }

  const tools = Array.from(seen.values());
  const duplicatesRemoved = totalBefore - tools.length;

  return {
    tools,
    sourceCount: snapshots.length,
    duplicatesRemoved,
    totalBefore,
  };
}

export function formatFlattenResult(result: FlattenResult): string {
  const lines: string[] = [
    `Flattened ${result.sourceCount} snapshot(s) into ${result.tools.length} unique tool(s).`,
    `Total tools before dedup: ${result.totalBefore}`,
    `Duplicates removed: ${result.duplicatesRemoved}`,
    '',
    'Tools:',
  ];

  for (const tool of result.tools) {
    const version = tool.version ?? 'unknown';
    const category = tool.category ? ` [${tool.category}]` : '';
    lines.push(`  ${tool.name}@${version}${category}  (from: ${tool.source})`);
  }

  return lines.join('\n');
}
