import { Snapshot } from '../snapshot/snapshot';

export interface ComparisonResult {
  identical: boolean;
  toolsInCommon: string[];
  onlyInA: string[];
  onlyInB: string[];
  versionMismatches: VersionMismatch[];
  similarityScore: number;
}

export interface VersionMismatch {
  tool: string;
  versionA: string | undefined;
  versionB: string | undefined;
}

export function compareSnapshots(
  a: Snapshot,
  b: Snapshot
): ComparisonResult {
  const toolsA = new Map(a.tools.map((t) => [t.name, t.version]));
  const toolsB = new Map(b.tools.map((t) => [t.name, t.version]));

  const namesA = new Set(toolsA.keys());
  const namesB = new Set(toolsB.keys());

  const toolsInCommon = [...namesA].filter((n) => namesB.has(n));
  const onlyInA = [...namesA].filter((n) => !namesB.has(n));
  const onlyInB = [...namesB].filter((n) => !namesA.has(n));

  const versionMismatches: VersionMismatch[] = toolsInCommon
    .filter((name) => toolsA.get(name) !== toolsB.get(name))
    .map((name) => ({
      tool: name,
      versionA: toolsA.get(name),
      versionB: toolsB.get(name),
    }));

  const totalTools = new Set([...namesA, ...namesB]).size;
  const matchingTools = toolsInCommon.length - versionMismatches.length;
  const similarityScore =
    totalTools === 0 ? 100 : Math.round((matchingTools / totalTools) * 100);

  const identical =
    onlyInA.length === 0 &&
    onlyInB.length === 0 &&
    versionMismatches.length === 0;

  return {
    identical,
    toolsInCommon,
    onlyInA,
    onlyInB,
    versionMismatches,
    similarityScore,
  };
}

export function formatComparison(result: ComparisonResult): string {
  const lines: string[] = [];

  lines.push(`Similarity: ${result.similarityScore}%`);
  lines.push(result.identical ? 'Snapshots are identical.' : 'Snapshots differ.');

  if (result.toolsInCommon.length > 0) {
    lines.push(`\nTools in common (${result.toolsInCommon.length}): ${result.toolsInCommon.join(', ')}`);
  }

  if (result.onlyInA.length > 0) {
    lines.push(`\nOnly in A (${result.onlyInA.length}): ${result.onlyInA.join(', ')}`);
  }

  if (result.onlyInB.length > 0) {
    lines.push(`\nOnly in B (${result.onlyInB.length}): ${result.onlyInB.join(', ')}`);
  }

  if (result.versionMismatches.length > 0) {
    lines.push(`\nVersion mismatches (${result.versionMismatches.length}):`);
    for (const m of result.versionMismatches) {
      lines.push(`  ${m.tool}: ${m.versionA ?? 'n/a'} → ${m.versionB ?? 'n/a'}`);
    }
  }

  return lines.join('\n');
}
