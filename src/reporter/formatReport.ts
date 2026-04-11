import { SnapshotReport, ReportFormat } from './types';

export function formatReportAsText(report: SnapshotReport): string {
  const lines: string[] = [];
  lines.push(`Report: ${report.snapshotLabel}`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('='.repeat(48));
  for (const section of report.sections) {
    lines.push(`\n## ${section.title}`);
    lines.push(section.content);
  }
  return lines.join('\n');
}

export function formatReportAsMarkdown(report: SnapshotReport): string {
  const lines: string[] = [];
  lines.push(`# Snapshot Report: ${report.snapshotLabel}`);
  lines.push(`> Generated at: ${report.generatedAt}`);
  lines.push('');
  for (const section of report.sections) {
    lines.push(`## ${section.title}`);
    lines.push('');
    lines.push(section.content);
    lines.push('');
  }
  return lines.join('\n');
}

export function formatReportAsJson(report: SnapshotReport): string {
  return JSON.stringify(report, null, 2);
}

export function formatReport(report: SnapshotReport, format?: ReportFormat): string {
  const fmt = format ?? report.format;
  switch (fmt) {
    case 'markdown': return formatReportAsMarkdown(report);
    case 'json':     return formatReportAsJson(report);
    default:         return formatReportAsText(report);
  }
}
