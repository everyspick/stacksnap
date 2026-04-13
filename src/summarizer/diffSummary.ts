import type { SnapshotDiff, DiffSummary } from '../differ/types';

export function summarizeDiff(diff: SnapshotDiff): DiffSummary {
  const totalFrom =
    diff.removed.length + diff.changed.length + diff.unchanged.length;
  const totalTo =
    diff.added.length + diff.changed.length + diff.unchanged.length;

  return {
    totalFrom,
    totalTo,
    added: diff.added.length,
    removed: diff.removed.length,
    changed: diff.changed.length,
    unchanged: diff.unchanged.length,
  };
}

export function formatDiffSummary(diff: SnapshotDiff): string {
  const summary = summarizeDiff(diff);
  const lines: string[] = [];

  lines.push(`Diff: ${diff.fromLabel} → ${diff.toLabel}`);
  lines.push(`Generated: ${diff.createdAt}`);
  lines.push('');
  lines.push(`Tools in source : ${summary.totalFrom}`);
  lines.push(`Tools in target : ${summary.totalTo}`);
  lines.push('');
  lines.push(`  + Added    : ${summary.added}`);
  lines.push(`  - Removed  : ${summary.removed}`);
  lines.push(`  ~ Changed  : ${summary.changed}`);
  lines.push(`  = Unchanged: ${summary.unchanged}`);

  if (diff.added.length > 0) {
    lines.push('');
    lines.push('Added tools:');
    for (const t of diff.added) {
      lines.push(`  + ${t.name}${t.toVersion ? ` @ ${t.toVersion}` : ''}`);
    }
  }

  if (diff.removed.length > 0) {
    lines.push('');
    lines.push('Removed tools:');
    for (const t of diff.removed) {
      lines.push(`  - ${t.name}${t.fromVersion ? ` @ ${t.fromVersion}` : ''}`);
    }
  }

  if (diff.changed.length > 0) {
    lines.push('');
    lines.push('Changed tools:');
    for (const t of diff.changed) {
      const from = t.fromVersion ?? 'unknown';
      const to = t.toVersion ?? 'unknown';
      lines.push(`  ~ ${t.name}: ${from} → ${to}`);
    }
  }

  return lines.join('\n');
}
