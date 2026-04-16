import { Snapshot } from '../snapshot/snapshot';

export interface StampResult {
  snapshot: Snapshot;
  stamped: boolean;
  previousLabel?: string;
  newLabel: string;
}

export function buildStampLabel(prefix: string, date: Date = new Date()): string {
  const iso = date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${prefix}-${iso}`;
}

export function stampSnapshot(
  snapshot: Snapshot,
  prefix: string = 'snap',
  date: Date = new Date()
): StampResult {
  const newLabel = buildStampLabel(prefix, date);
  const previousLabel = snapshot.metadata?.label as string | undefined;
  const stamped: Snapshot = {
    ...snapshot,
    metadata: {
      ...snapshot.metadata,
      label: newLabel,
      stampedAt: date.toISOString(),
    },
  };
  return { snapshot: stamped, stamped: true, previousLabel, newLabel };
}

export function formatStampResult(result: StampResult): string {
  const lines: string[] = [];
  lines.push(`Stamp applied: ${result.newLabel}`);
  if (result.previousLabel) {
    lines.push(`Previous label: ${result.previousLabel}`);
  } else {
    lines.push('No previous label.');
  }
  return lines.join('\n');
}
