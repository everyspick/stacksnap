import { Snapshot } from '../snapshot/snapshot';

export interface MigrationResult {
  original: Snapshot;
  migrated: Snapshot;
  changes: string[];
  version: string;
}

const CURRENT_SCHEMA_VERSION = '2.0.0';

export function normalizeToolNames(snapshot: Snapshot): { snapshot: Snapshot; changes: string[] } {
  const changes: string[] = [];
  const tools = snapshot.tools.map((tool) => {
    const normalized = tool.name.toLowerCase().trim();
    if (normalized !== tool.name) {
      changes.push(`Normalized tool name: "${tool.name}" → "${normalized}"`);
      return { ...tool, name: normalized };
    }
    return tool;
  });
  return { snapshot: { ...snapshot, tools }, changes };
}

export function backfillCategories(snapshot: Snapshot): { snapshot: Snapshot; changes: string[] } {
  const changes: string[] = [];
  const categoryMap: Record<string, string> = {
    node: 'runtime',
    python: 'runtime',
    ruby: 'runtime',
    go: 'runtime',
    git: 'vcs',
    docker: 'container',
    kubectl: 'container',
    npm: 'package-manager',
    yarn: 'package-manager',
    pnpm: 'package-manager',
    pip: 'package-manager',
  };
  const tools = snapshot.tools.map((tool) => {
    if (!tool.category) {
      const inferred = categoryMap[tool.name.toLowerCase()];
      if (inferred) {
        changes.push(`Backfilled category for "${tool.name}": "${inferred}"`);
        return { ...tool, category: inferred };
      }
    }
    return tool;
  });
  return { snapshot: { ...snapshot, tools }, changes };
}

export function migrateSnapshot(snapshot: Snapshot): MigrationResult {
  const allChanges: string[] = [];
  let current = snapshot;

  const nameResult = normalizeToolNames(current);
  current = nameResult.snapshot;
  allChanges.push(...nameResult.changes);

  const categoryResult = backfillCategories(current);
  current = categoryResult.snapshot;
  allChanges.push(...categoryResult.changes);

  const migrated: Snapshot = {
    ...current,
    meta: {
      ...current.meta,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      migratedAt: new Date().toISOString(),
    },
  };

  return {
    original: snapshot,
    migrated,
    changes: allChanges,
    version: CURRENT_SCHEMA_VERSION,
  };
}

export function formatMigrationResult(result: MigrationResult): string {
  const lines: string[] = [
    `Migration to schema v${result.version}`,
    `Changes applied: ${result.changes.length}`,
  ];
  if (result.changes.length === 0) {
    lines.push('  (no changes needed)');
  } else {
    result.changes.forEach((c) => lines.push(`  • ${c}`));
  }
  return lines.join('\n');
}
