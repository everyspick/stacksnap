import { Snapshot, ToolEntry } from '../snapshot/snapshot';
import { SplitOptions, SplitResult } from './types';

function bucketKey(tool: ToolEntry, options: SplitOptions): string {
  if (options.by === 'category') {
    return tool.category ?? 'uncategorized';
  }
  if (options.by === 'versionPresence') {
    return tool.version ? 'versioned' : 'unversioned';
  }
  if (options.by === 'namePrefix') {
    const prefix = options.prefix ?? '';
    return tool.name.startsWith(prefix) ? `prefix:${prefix}` : 'other';
  }
  return 'default';
}

export function splitSnapshot(snapshot: Snapshot, options: SplitOptions): SplitResult {
  const buckets: Record<string, ToolEntry[]> = {};

  for (const tool of snapshot.tools) {
    const key = bucketKey(tool, options);
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(tool);
  }

  const snapshotBuckets: Record<string, Snapshot> = {};
  for (const [key, tools] of Object.entries(buckets)) {
    snapshotBuckets[key] = {
      ...snapshot,
      id: `${snapshot.id}-${key}`,
      tools,
    };
  }

  return {
    buckets: snapshotBuckets,
    options,
    totalTools: snapshot.tools.length,
    bucketCount: Object.keys(snapshotBuckets).length,
  };
}

export function formatSplitResult(result: SplitResult): string {
  const lines: string[] = [
    `Split Result (by: ${result.options.by})`,
    `Total tools: ${result.totalTools} → ${result.bucketCount} bucket(s)`,
    '',
  ];
  for (const [key, snap] of Object.entries(result.buckets)) {
    lines.push(`  [${key}] — ${snap.tools.length} tool(s)`);
    for (const tool of snap.tools) {
      lines.push(`    • ${tool.name}${tool.version ? ` @ ${tool.version}` : ''}`);
    }
  }
  return lines.join('\n');
}
