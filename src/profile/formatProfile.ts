import { Profile } from './types';

export function formatProfileSummary(profile: Profile): string {
  const lines: string[] = [
    `Name:        ${profile.name}`,
    `Snapshot:    ${profile.snapshotPath}`,
    `Created:     ${profile.createdAt}`,
    `Updated:     ${profile.updatedAt}`,
  ];
  if (profile.description) {
    lines.splice(1, 0, `Description: ${profile.description}`);
  }
  if (profile.tags.length > 0) {
    lines.push(`Tags:        ${profile.tags.join(', ')}`);
  }
  return lines.join('\n');
}

export function formatProfileTable(profiles: Profile[]): string {
  if (profiles.length === 0) return 'No profiles found.';

  const header = ['NAME', 'DESCRIPTION', 'TAGS', 'UPDATED'];
  const rows = profiles.map((p) => [
    p.name,
    p.description ?? '-',
    p.tags.length > 0 ? p.tags.join(',') : '-',
    p.updatedAt.slice(0, 10),
  ]);

  const colWidths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i].length))
  );

  const fmt = (row: string[]) =>
    row.map((cell, i) => cell.padEnd(colWidths[i])).join('  ');

  return [fmt(header), colWidths.map((w) => '-'.repeat(w)).join('  '), ...rows.map(fmt)].join('\n');
}
