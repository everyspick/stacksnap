import { Snapshot, ToolInfo } from '../detector/types';

export interface TrimOptions {
  removeUnversioned?: boolean;
  removeCategories?: string[];
  keepOnly?: string[];
  maxTools?: number;
}

export interface TrimResult {
  original: Snapshot;
  trimmed: Snapshot;
  removedTools: ToolInfo[];
  removedCount: number;
}

export function trimByUnversioned(tools: ToolInfo[]): ToolInfo[] {
  return tools.filter((t) => t.version !== null && t.version !== undefined && t.version !== '');
}

export function trimByCategories(tools: ToolInfo[], categories: string[]): ToolInfo[] {
  return tools.filter((t) => !categories.includes(t.category ?? ''));
}

export function trimByAllowlist(tools: ToolInfo[], keepOnly: string[]): ToolInfo[] {
  const lower = keepOnly.map((k) => k.toLowerCase());
  return tools.filter((t) => lower.includes(t.name.toLowerCase()));
}

export function trimByMaxTools(tools: ToolInfo[], max: number): ToolInfo[] {
  return tools.slice(0, max);
}

export function trimSnapshot(snapshot: Snapshot, options: TrimOptions): TrimResult {
  let tools = [...snapshot.tools];

  if (options.removeUnversioned) {
    tools = trimByUnversioned(tools);
  }

  if (options.removeCategories && options.removeCategories.length > 0) {
    tools = trimByCategories(tools, options.removeCategories);
  }

  if (options.keepOnly && options.keepOnly.length > 0) {
    tools = trimByAllowlist(tools, options.keepOnly);
  }

  if (options.maxTools !== undefined && options.maxTools > 0) {
    tools = trimByMaxTools(tools, options.maxTools);
  }

  const keptNames = new Set(tools.map((t) => t.name));
  const removedTools = snapshot.tools.filter((t) => !keptNames.has(t.name));

  const trimmed: Snapshot = {
    ...snapshot,
    tools,
    timestamp: new Date().toISOString(),
  };

  return {
    original: snapshot,
    trimmed,
    removedTools,
    removedCount: removedTools.length,
  };
}

export function formatTrimResult(result: TrimResult): string {
  const lines: string[] = [];
  lines.push(`Trim Summary`);
  lines.push(`  Original tools : ${result.original.tools.length}`);
  lines.push(`  Remaining tools: ${result.trimmed.tools.length}`);
  lines.push(`  Removed        : ${result.removedCount}`);
  if (result.removedTools.length > 0) {
    lines.push(`  Removed tools  : ${result.removedTools.map((t) => t.name).join(', ')}`);
  }
  return lines.join('\n');
}
