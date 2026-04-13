import { Snapshot, ToolEntry } from '../detector/types';

export interface ToolDiff {
  tool: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
  oldVersion?: string;
  newVersion?: string;
  category?: string;
}

export interface SnapshotDiff {
  added: ToolDiff[];
  removed: ToolDiff[];
  changed: ToolDiff[];
  unchanged: ToolDiff[];
  summary: {
    total: number;
    added: number;
    removed: number;
    changed: number;
    unchanged: number;
  };
}

export function diffSnapshots(base: Snapshot, target: Snapshot): SnapshotDiff {
  const baseMap = new Map<string, ToolEntry>(base.tools.map(t => [t.name, t]));
  const targetMap = new Map<string, ToolEntry>(target.tools.map(t => [t.name, t]));

  const added: ToolDiff[] = [];
  const removed: ToolDiff[] = [];
  const changed: ToolDiff[] = [];
  const unchanged: ToolDiff[] = [];

  for (const [name, tool] of targetMap) {
    if (!baseMap.has(name)) {
      added.push({ tool: name, status: 'added', newVersion: tool.version, category: tool.category });
    } else {
      const baseTool = baseMap.get(name)!;
      if (baseTool.version !== tool.version) {
        changed.push({
          tool: name,
          status: 'changed',
          oldVersion: baseTool.version,
          newVersion: tool.version,
          category: tool.category,
        });
      } else {
        unchanged.push({ tool: name, status: 'unchanged', newVersion: tool.version, category: tool.category });
      }
    }
  }

  for (const [name, tool] of baseMap) {
    if (!targetMap.has(name)) {
      removed.push({ tool: name, status: 'removed', oldVersion: tool.version, category: tool.category });
    }
  }

  return {
    added,
    removed,
    changed,
    unchanged,
    summary: {
      total: added.length + removed.length + changed.length + unchanged.length,
      added: added.length,
      removed: removed.length,
      changed: changed.length,
      unchanged: unchanged.length,
    },
  };
}

export function formatDiff(diff: SnapshotDiff): string {
  const lines: string[] = [];
  lines.push('=== Snapshot Diff ===');
  lines.push(`Added: ${diff.summary.added}  Removed: ${diff.summary.removed}  Changed: ${diff.summary.changed}  Unchanged: ${diff.summary.unchanged}`);
  lines.push('');

  if (diff.added.length > 0) {
    lines.push('+ Added:');
    diff.added.forEach(d => lines.push(`  + ${d.tool} ${d.newVersion ?? '(unknown)'}${d.category ? ` [${d.category}]` : ''}`));
  }

  if (diff.removed.length > 0) {
    lines.push('- Removed:');
    diff.removed.forEach(d => lines.push(`  - ${d.tool} ${d.oldVersion ?? '(unknown)'}${d.category ? ` [${d.category}]` : ''}`));
  }

  if (diff.changed.length > 0) {
    lines.push('~ Changed:');
    diff.changed.forEach(d =>
      lines.push(`  ~ ${d.tool}: ${d.oldVersion ?? '?'} → ${d.newVersion ?? '?'}${d.category ? ` [${d.category}]` : ''}`)
    );
  }

  return lines.join('\n');
}
