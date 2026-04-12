import { Snapshot } from '../snapshot/snapshot';
import { ToolDetectionResult } from '../detector/types';

export interface SnapshotGroup {
  key: string;
  tools: ToolDetectionResult[];
}

export interface GroupResult {
  groups: Record<string, ToolDetectionResult[]>;
  ungrouped: ToolDetectionResult[];
}

export type GroupByField = 'category' | 'versionPresence' | 'namePrefix';

export function groupByCategory(snapshot: Snapshot): GroupResult {
  const groups: Record<string, ToolDetectionResult[]> = {};
  const ungrouped: ToolDetectionResult[] = [];

  for (const tool of snapshot.tools) {
    const category = (tool as any).category as string | undefined;
    if (category) {
      if (!groups[category]) groups[category] = [];
      groups[category].push(tool);
    } else {
      ungrouped.push(tool);
    }
  }

  return { groups, ungrouped };
}

export function groupByVersionPresence(snapshot: Snapshot): GroupResult {
  const groups: Record<string, ToolDetectionResult[]> = {
    versioned: [],
    unversioned: [],
  };

  for (const tool of snapshot.tools) {
    if (tool.version) {
      groups['versioned'].push(tool);
    } else {
      groups['unversioned'].push(tool);
    }
  }

  return { groups, ungrouped: [] };
}

export function groupByNamePrefix(snapshot: Snapshot, prefixes: string[]): GroupResult {
  const groups: Record<string, ToolDetectionResult[]> = {};
  const ungrouped: ToolDetectionResult[] = [];

  for (const prefix of prefixes) {
    groups[prefix] = [];
  }

  for (const tool of snapshot.tools) {
    const matched = prefixes.find((p) => tool.name.startsWith(p));
    if (matched) {
      groups[matched].push(tool);
    } else {
      ungrouped.push(tool);
    }
  }

  return { groups, ungrouped };
}

export function groupSnapshot(snapshot: Snapshot, by: GroupByField, prefixes?: string[]): GroupResult {
  switch (by) {
    case 'category':
      return groupByCategory(snapshot);
    case 'versionPresence':
      return groupByVersionPresence(snapshot);
    case 'namePrefix':
      return groupByNamePrefix(snapshot, prefixes ?? []);
    default:
      return { groups: {}, ungrouped: snapshot.tools };
  }
}

export function formatGroupResult(result: GroupResult): string {
  const lines: string[] = [];
  for (const [key, tools] of Object.entries(result.groups)) {
    lines.push(`[${key}] (${tools.length} tool${tools.length !== 1 ? 's' : ''})`);
    for (const tool of tools) {
      lines.push(`  - ${tool.name}${tool.version ? ` @ ${tool.version}` : ' (no version)'}`);
    }
  }
  if (result.ungrouped.length > 0) {
    lines.push(`[ungrouped] (${result.ungrouped.length} tool${result.ungrouped.length !== 1 ? 's' : ''})`);
    for (const tool of result.ungrouped) {
      lines.push(`  - ${tool.name}${tool.version ? ` @ ${tool.version}` : ' (no version)'}`);
    }
  }
  return lines.join('\n');
}
