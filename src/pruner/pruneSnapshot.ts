import { Snapshot, ToolEntry } from '../detector/types';
import { PruneOptions, PruneResult, PruneStrategy } from './types';

function pruneOrphaned(tools: ToolEntry[]): ToolEntry[] {
  const seen = new Set<string>();
  return tools.filter((t) => {
    if (seen.has(t.name)) return false;
    seen.add(t.name);
    return true;
  });
}

function pruneDuplicates(tools: ToolEntry[]): ToolEntry[] {
  const seen = new Map<string, string>();
  return tools.filter((t) => {
    const key = `${t.name}@${t.version ?? ''}`;
    if (seen.has(key)) return false;
    seen.set(key, t.name);
    return true;
  });
}

function pruneUnversioned(tools: ToolEntry[]): ToolEntry[] {
  return tools.filter((t) => t.version !== undefined && t.version !== null && t.version.trim() !== '');
}

function applyStrategy(tools: ToolEntry[], strategy: PruneStrategy): ToolEntry[] {
  switch (strategy) {
    case 'orphaned':
      return pruneOrphaned(tools);
    case 'duplicates':
      return pruneDuplicates(tools);
    case 'unversioned':
      return pruneUnversioned(tools);
    case 'all':
      return pruneUnversioned(pruneDuplicates(pruneOrphaned(tools)));
    default:
      return tools;
  }
}

export function pruneSnapshot(
  snapshot: Snapshot,
  options: PruneOptions
): { snapshot: Snapshot; result: PruneResult } {
  const original = snapshot.tools;
  let pruned = [...original];

  const strategies = options.strategies.includes('all') ? ['all'] as PruneStrategy[] : options.strategies;

  for (const strategy of strategies) {
    pruned = applyStrategy(pruned, strategy);
  }

  const removedNames = original
    .filter((t) => !pruned.some((p) => p.name === t.name && p.version === t.version))
    .map((t) => t.name);

  const result: PruneResult = {
    original: original.length,
    pruned: pruned.length,
    removed: removedNames,
    strategies: options.strategies,
    dryRun: options.dryRun ?? false,
  };

  const outSnapshot: Snapshot = options.dryRun
    ? snapshot
    : { ...snapshot, tools: pruned };

  return { snapshot: outSnapshot, result };
}

export function formatPruneResult(result: PruneResult): string {
  const lines: string[] = [
    `Prune Result${result.dryRun ? ' (dry run)' : ''}`,
    `  Strategies : ${result.strategies.join(', ')}`,
    `  Before     : ${result.original} tool(s)`,
    `  After      : ${result.pruned} tool(s)`,
    `  Removed    : ${result.removed.length} tool(s)`,
  ];
  if (result.removed.length > 0) {
    lines.push('  Removed tools:');
    for (const name of result.removed) {
      lines.push(`    - ${name}`);
    }
  }
  return lines.join('\n');
}
