import { Snapshot, ToolEntry } from '../detector/types';

export interface DedupeResult {
  snapshot: Snapshot;
  removed: ToolEntry[];
  kept: ToolEntry[];
  totalBefore: number;
  totalAfter: number;
}

/**
 * Selects the best entry when duplicates exist by preferring entries with a version.
 */
export function resolveDuplicate(entries: ToolEntry[]): ToolEntry {
  const withVersion = entries.filter((e) => e.version && e.version.trim() !== '');
  if (withVersion.length > 0) {
    return withVersion[0];
  }
  return entries[0];
}

/**
 * Deduplicates tools in a snapshot by name (case-insensitive).
 * When multiple tools share the same name, the best one is kept.
 */
export function dedupeSnapshot(snapshot: Snapshot): DedupeResult {
  const groups = new Map<string, ToolEntry[]>();

  for (const tool of snapshot.tools) {
    const key = tool.name.toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tool);
  }

  const kept: ToolEntry[] = [];
  const removed: ToolEntry[] = [];

  for (const [, entries] of groups) {
    const winner = resolveDuplicate(entries);
    kept.push(winner);
    for (const entry of entries) {
      if (entry !== winner) {
        removed.push(entry);
      }
    }
  }

  const dedupedSnapshot: Snapshot = {
    ...snapshot,
    tools: kept,
  };

  return {
    snapshot: dedupedSnapshot,
    removed,
    kept,
    totalBefore: snapshot.tools.length,
    totalAfter: kept.length,
  };
}

export function formatDedupeResult(result: DedupeResult): string {
  const lines: string[] = [
    `Dedupe complete: ${result.totalBefore} → ${result.totalAfter} tools`,
  ];

  if (result.removed.length === 0) {
    lines.push('  No duplicates found.');
  } else {
    lines.push(`  Removed ${result.removed.length} duplicate(s):`);
    for (const tool of result.removed) {
      const ver = tool.version ? `@${tool.version}` : '(no version)';
      lines.push(`    - ${tool.name}${ver}`);
    }
  }

  return lines.join('\n');
}
