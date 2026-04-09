import { Snapshot, ToolInfo } from '../detector/types';

export interface ToolDiff {
  tool: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
  from?: string;
  to?: string;
}

export interface SnapshotDiff {
  timestamp: string;
  fromSnapshot: string;
  toSnapshot: string;
  diffs: ToolDiff[];
  hasChanges: boolean;
}

export function diffSnapshots(from: Snapshot, to: Snapshot): SnapshotDiff {
  const diffs: ToolDiff[] = [];
  const fromMap = new Map<string, ToolInfo>(from.tools.map((t) => [t.name, t]));
  const toMap = new Map<string, ToolInfo>(to.tools.map((t) => [t.name, t]));

  for (const [name, tool] of fromMap) {
    if (!toMap.has(name)) {
      diffs.push({ tool: name, status: 'removed', from: tool.version });
    } else {
      const toTool = toMap.get(name)!;
      if (tool.version !== toTool.version) {
        diffs.push({ tool: name, status: 'changed', from: tool.version, to: toTool.version });
      } else {
        diffs.push({ tool: name, status: 'unchanged', from: tool.version, to: toTool.version });
      }
    }
  }

  for (const [name, tool] of toMap) {
    if (!fromMap.has(name)) {
      diffs.push({ tool: name, status: 'added', to: tool.version });
    }
  }

  diffs.sort((a, b) => a.tool.localeCompare(b.tool));

  return {
    timestamp: new Date().toISOString(),
    fromSnapshot: from.id,
    toSnapshot: to.id,
    diffs,
    hasChanges: diffs.some((d) => d.status !== 'unchanged'),
  };
}

export function formatDiff(diff: SnapshotDiff): string {
  if (!diff.hasChanges) {
    return 'No changes detected between snapshots.\n';
  }

  const lines: string[] = [
    `Diff: ${diff.fromSnapshot} → ${diff.toSnapshot}`,
    `Generated: ${diff.timestamp}`,
    '',
  ];

  for (const d of diff.diffs) {
    if (d.status === 'added') lines.push(`  + ${d.tool}: ${d.to}`);
    else if (d.status === 'removed') lines.push(`  - ${d.tool}: ${d.from}`);
    else if (d.status === 'changed') lines.push(`  ~ ${d.tool}: ${d.from} → ${d.to}`);
  }

  return lines.join('\n') + '\n';
}
