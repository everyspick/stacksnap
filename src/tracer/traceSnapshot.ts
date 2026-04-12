import { Snapshot } from '../snapshot/snapshot';
import { TraceEntry, TraceReport } from './types';

function detectSource(tool: string): TraceEntry['source'] {
  const envTools = ['NODE_ENV', 'JAVA_HOME', 'GOPATH', 'PYTHON', 'RUBY'];
  const configTools = ['eslint', 'prettier', 'tsc', 'babel'];

  if (envTools.some((e) => tool.toUpperCase().includes(e.replace('_', ''))))
    return 'env';
  if (configTools.includes(tool.toLowerCase())) return 'config';
  if (tool.length > 0) return 'path';
  return 'unknown';
}

function detectConfidence(version: string | null): TraceEntry['confidence'] {
  if (!version) return 'low';
  if (/^\d+\.\d+\.\d+/.test(version)) return 'high';
  if (/^\d+\.\d+/.test(version)) return 'medium';
  return 'low';
}

export function traceSnapshot(snapshot: Snapshot): TraceReport {
  const entries: TraceEntry[] = snapshot.tools.map((tool) => ({
    tool: tool.name,
    version: tool.version ?? null,
    detectedAt: snapshot.createdAt,
    source: detectSource(tool.name),
    confidence: detectConfidence(tool.version ?? null),
  }));

  const summary = {
    total: entries.length,
    highConfidence: entries.filter((e) => e.confidence === 'high').length,
    mediumConfidence: entries.filter((e) => e.confidence === 'medium').length,
    lowConfidence: entries.filter((e) => e.confidence === 'low').length,
  };

  return {
    snapshotId: snapshot.id,
    createdAt: new Date().toISOString(),
    entries,
    summary,
  };
}

export function formatTraceReport(report: TraceReport): string {
  const lines: string[] = [
    `Trace Report — Snapshot: ${report.snapshotId}`,
    `Generated: ${report.createdAt}`,
    `Total tools: ${report.summary.total} | High: ${report.summary.highConfidence} | Medium: ${report.summary.mediumConfidence} | Low: ${report.summary.lowConfidence}`,
    '',
    `${'Tool'.padEnd(20)} ${'Version'.padEnd(15)} ${'Source'.padEnd(10)} Confidence`,
    '-'.repeat(62),
  ];

  for (const entry of report.entries) {
    lines.push(
      `${entry.tool.padEnd(20)} ${(entry.version ?? 'unknown').padEnd(15)} ${entry.source.padEnd(10)} ${entry.confidence}`
    );
  }

  return lines.join('\n');
}
