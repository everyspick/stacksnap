import { Annotation } from './types';

export function formatAnnotationSummary(snapshotId: string, annotations: Record<string, Annotation>): string {
  const entries = Object.values(annotations);
  if (entries.length === 0) {
    return `No annotations found for snapshot "${snapshotId}".`;
  }
  const lines = [`Annotations for snapshot "${snapshotId}":`, ''];
  for (const ann of entries) {
    const updated = ann.updatedAt ? ` (updated: ${ann.updatedAt})` : '';
    lines.push(`  ${ann.key}: ${ann.value}`);
    lines.push(`    created: ${ann.createdAt}${updated}`);
  }
  return lines.join('\n');
}

export function formatAnnotationTable(annotations: Record<string, Annotation>): string {
  const entries = Object.values(annotations);
  if (entries.length === 0) return '(none)';
  const header = 'KEY                  VALUE                CREATED';
  const separator = '-'.repeat(60);
  const rows = entries.map((ann) => {
    const key = ann.key.padEnd(20);
    const value = ann.value.padEnd(20);
    return `${key} ${value} ${ann.createdAt}`;
  });
  return [header, separator, ...rows].join('\n');
}
