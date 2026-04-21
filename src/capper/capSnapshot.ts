import { Snapshot, ToolEntry } from '../detector/types';

export interface CapOptions {
  maxTools?: number;
  maxPerCategory?: number;
}

export interface CapResult {
  original: number;
  capped: number;
  removed: number;
  snapshot: Snapshot;
}

export function capByTotal(tools: ToolEntry[], max: number): ToolEntry[] {
  return tools.slice(0, max);
}

export function capByCategory(tools: ToolEntry[], maxPerCategory: number): ToolEntry[] {
  const seen: Record<string, number> = {};
  const result: ToolEntry[] = [];

  for (const tool of tools) {
    const cat = tool.category ?? 'unknown';
    const count = seen[cat] ?? 0;
    if (count < maxPerCategory) {
      result.push(tool);
      seen[cat] = count + 1;
    }
  }

  return result;
}

export function capSnapshot(snapshot: Snapshot, options: CapOptions): CapResult {
  const original = snapshot.tools.length;
  let tools = [...snapshot.tools];

  if (options.maxPerCategory !== undefined) {
    tools = capByCategory(tools, options.maxPerCategory);
  }

  if (options.maxTools !== undefined) {
    tools = capByTotal(tools, options.maxTools);
  }

  const capped = tools.length;

  return {
    original,
    capped,
    removed: original - capped,
    snapshot: { ...snapshot, tools },
  };
}

export function formatCapResult(result: CapResult): string {
  const lines: string[] = [
    `Cap Result:`,
    `  Original tools : ${result.original}`,
    `  After cap      : ${result.capped}`,
    `  Removed        : ${result.removed}`,
  ];
  return lines.join('\n');
}
