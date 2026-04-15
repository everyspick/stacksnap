import { Snapshot, ToolEntry } from '../detector/types';

export interface NormalizeOptions {
  lowercaseNames?: boolean;
  trimWhitespace?: boolean;
  sortTools?: boolean;
  normalizeVersionPrefix?: boolean;
}

export interface NormalizeResult {
  snapshot: Snapshot;
  changes: string[];
}

export function normalizeTool(tool: ToolEntry, options: NormalizeOptions): { tool: ToolEntry; changes: string[] } {
  const changes: string[] = [];
  let { name, version, category } = tool;

  if (options.trimWhitespace) {
    const trimmedName = name.trim();
    if (trimmedName !== name) {
      changes.push(`Trimmed whitespace from name: "${name}" -> "${trimmedName}"`);
      name = trimmedName;
    }
    if (version) {
      const trimmedVersion = version.trim();
      if (trimmedVersion !== version) {
        changes.push(`Trimmed whitespace from version of "${name}"`);
        version = trimmedVersion;
      }
    }
  }

  if (options.lowercaseNames) {
    const lowered = name.toLowerCase();
    if (lowered !== name) {
      changes.push(`Lowercased name: "${name}" -> "${lowered}"`);
      name = lowered;
    }
  }

  if (options.normalizeVersionPrefix && version) {
    const stripped = version.replace(/^v/i, '');
    if (stripped !== version) {
      changes.push(`Removed version prefix from "${name}": "${version}" -> "${stripped}"`);
      version = stripped;
    }
  }

  return { tool: { ...tool, name, version, category }, changes };
}

export function normalizeSnapshot(snapshot: Snapshot, options: NormalizeOptions = {}): NormalizeResult {
  const allChanges: string[] = [];
  let tools = snapshot.tools.map((tool) => {
    const { tool: normalized, changes } = normalizeTool(tool, options);
    allChanges.push(...changes);
    return normalized;
  });

  if (options.sortTools) {
    const before = tools.map((t) => t.name).join(',');
    tools = [...tools].sort((a, b) => a.name.localeCompare(b.name));
    const after = tools.map((t) => t.name).join(',');
    if (before !== after) {
      allChanges.push('Sorted tools alphabetically by name');
    }
  }

  return {
    snapshot: { ...snapshot, tools },
    changes: allChanges,
  };
}

export function formatNormalizeResult(result: NormalizeResult): string {
  if (result.changes.length === 0) {
    return 'No changes made during normalization.';
  }
  const lines = [`Normalization applied ${result.changes.length} change(s):`, ''];
  result.changes.forEach((c, i) => lines.push(`  ${i + 1}. ${c}`));
  return lines.join('\n');
}
