import { Label, LabelResult } from './types';

const COLOR_CODES: Record<string, string> = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\n}const RESET =';

ize(text: string, color: string'}${text}${RESET}`adge(label: Label): string  = `[${label.name}]`;
  return colorize(badge, label.color);
}

export function formatLabelSummary(result: LabelResult): string {
  const lines: string[] = [`Snapshot: ${result.snapshotId}`];
  if (result.added?.length) {
    lines.push(`  Added: ${result.added.map(formatLabelBadge).join(', ')}`);
  }
  if (result.removed?.length) {
    lines.push(`  Removed: ${result.removed.join(', ')}`);
  }
  lines.push(`  Labels: ${result.current.map(formatLabelBadge).join(', ') || '(none)'}`);
  return lines.join('\n');
}

export function formatLabelTable(snapshotId: string, labels: Label[]): string {
  if (labels.length === 0) return `No labels for snapshot: ${snapshotId}`;
  const header = `Labels for ${snapshotId}:\n`;
  const rows = labels.map(
    (l) =>
      `  ${colorize(l.name.padEnd(20), l.color)} ${l.color.padEnd(10)} ${l.description ?? ''}`
  );
  return header + rows.join('\n');
}
