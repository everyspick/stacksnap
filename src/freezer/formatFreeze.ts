import { FreezeEntry } from './freezeSnapshot';

export function formatFreezeSummary(entry: FreezeEntry): string {
  const reason = entry.reason ? ` — ${entry.reason}` : '';
  return `❄️  Frozen: ${entry.snapshotId} (at ${entry.frozenAt}${reason})`;
}

export function formatFreezeTable(entries: FreezeEntry[]): string {
  if (entries.length === 0) {
    return 'No frozen snapshots.';
  }

  const header = ['Snapshot ID', 'Frozen At', 'Reason'];
  const rows = entries.map((e) => [
    e.snapshotId,
    e.frozenAt,
    e.reason ?? '—',
  ]);

  const colWidths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i].length))
  );

  const pad = (s: string, len: number) => s.padEnd(len);

  const headerRow = header.map((h, i) => pad(h, colWidths[i])).join('  ');
  const separator = colWidths.map((w) => '-'.repeat(w)).join('  ');
  const dataRows = rows.map((r) =>
    r.map((cell, i) => pad(cell, colWidths[i])).join('  ')
  );

  return [headerRow, separator, ...dataRows].join('\n');
}

export function formatUnfreezeResult(snapshotId: string, success: boolean): string {
  if (success) {
    return `✅ Snapshot "${snapshotId}" has been unfrozen.`;
  }
  return `⚠️  Snapshot "${snapshotId}" was not frozen.`;
}
