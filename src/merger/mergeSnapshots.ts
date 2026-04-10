import { Snapshot, ToolInfo } from '../detector/types';

export type MergeStrategy = 'prefer-newer' | 'prefer-older' | 'union' | 'intersection';

export interface MergeOptions {
  strategy: MergeStrategy;
  label?: string;
}

export interface MergeResult {
  snapshot: Snapshot;
  conflicts: ConflictEntry[];
}

export interface ConflictEntry {
  tool: string;
  base: ToolInfo;
  incoming: ToolInfo;
  resolved: ToolInfo;
}

export function mergeSnapshots(
  base: Snapshot,
  incoming: Snapshot,
  options: MergeOptions = { strategy: 'prefer-newer' }
): MergeResult {
  const conflicts: ConflictEntry[] = [];
  const mergedTools: Record<string, ToolInfo> = {};

  const allKeys = new Set([
    ...Object.keys(base.tools),
    ...Object.keys(incoming.tools),
  ]);

  for (const key of allKeys) {
    const baseTool = base.tools[key];
    const incomingTool = incoming.tools[key];

    if (!baseTool) {
      if (options.strategy !== 'intersection') {
        mergedTools[key] = incomingTool;
      }
      continue;
    }

    if (!incomingTool) {
      if (options.strategy !== 'intersection') {
        mergedTools[key] = baseTool;
      }
      continue;
    }

    const resolved = resolveConflict(baseTool, incomingTool, options.strategy);

    if (baseTool.version !== incomingTool.version) {
      conflicts.push({ tool: key, base: baseTool, incoming: incomingTool, resolved });
    }

    mergedTools[key] = resolved;
  }

  const mergedSnapshot: Snapshot = {
    label: options.label ?? `merged:${base.label}+${incoming.label}`,
    createdAt: new Date().toISOString(),
    tools: mergedTools,
  };

  return { snapshot: mergedSnapshot, conflicts };
}

function resolveConflict(
  base: ToolInfo,
  incoming: ToolInfo,
  strategy: MergeStrategy
): ToolInfo {
  switch (strategy) {
    case 'prefer-newer':
      return incoming;
    case 'prefer-older':
      return base;
    case 'union':
    case 'intersection':
    default:
      return incoming;
  }
}

export function formatMergeResult(result: MergeResult): string {
  const lines: string[] = [];
  lines.push(`Merged snapshot: ${result.snapshot.label}`);
  lines.push(`Tools: ${Object.keys(result.snapshot.tools).length}`);
  if (result.conflicts.length === 0) {
    lines.push('No conflicts detected.');
  } else {
    lines.push(`Conflicts (${result.conflicts.length}):`);
    for (const c of result.conflicts) {
      lines.push(`  ${c.tool}: ${c.base.version} -> ${c.incoming.version} (resolved: ${c.resolved.version})`);
    }
  }
  return lines.join('\n');
}
