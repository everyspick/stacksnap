import { Snapshot, ToolEntry } from '../detector/types';

export interface RedactOptions {
  redactVersions?: boolean;
  redactCategories?: boolean;
  maskChar?: string;
  allowlist?: string[];
}

export interface RedactResult {
  original: Snapshot;
  redacted: Snapshot;
  redactedFields: string[];
}

export function redactTool(
  tool: ToolEntry,
  options: RedactOptions
): { tool: ToolEntry; redactedFields: string[] } {
  const mask = options.maskChar ?? '***';
  const allowlist = options.allowlist ?? [];
  const redactedFields: string[] = [];

  if (allowlist.includes(tool.name)) {
    return { tool: { ...tool }, redactedFields: [] };
  }

  let version = tool.version;
  let category = tool.category;

  if (options.redactVersions && tool.version) {
    version = mask;
    redactedFields.push(`${tool.name}.version`);
  }

  if (options.redactCategories && tool.category) {
    category = mask;
    redactedFields.push(`${tool.name}.category`);
  }

  return { tool: { ...tool, version, category }, redactedFields };
}

export function redactSnapshot(
  snapshot: Snapshot,
  options: RedactOptions = {}
): RedactResult {
  const allRedactedFields: string[] = [];
  const redactedTools: ToolEntry[] = [];

  for (const tool of snapshot.tools) {
    const { tool: redacted, redactedFields } = redactTool(tool, options);
    redactedTools.push(redacted);
    allRedactedFields.push(...redactedFields);
  }

  const redacted: Snapshot = {
    ...snapshot,
    tools: redactedTools,
  };

  return {
    original: snapshot,
    redacted,
    redactedFields: allRedactedFields,
  };
}

export function formatRedactResult(result: RedactResult): string {
  const lines: string[] = [];
  lines.push(`Redaction complete.`);
  lines.push(`Fields redacted: ${result.redactedFields.length}`);
  if (result.redactedFields.length > 0) {
    for (const field of result.redactedFields) {
      lines.push(`  - ${field}`);
    }
  } else {
    lines.push('  (none)');
  }
  return lines.join('\n');
}
