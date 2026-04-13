import * as fs from 'fs';
import * as path from 'path';
import { SnapshotDiff } from '../differ/types';
import { exportDiffAsJson, exportDiffAsText } from '../differ/exportDiff';
import { exportDiffAsMarkdown } from '../exporter/exportDiff';

export type DiffExportFormat = 'json' | 'text' | 'markdown';

export interface DiffExportOptions {
  format: DiffExportFormat;
  outputDir: string;
  filename?: string;
}

export interface DiffExportResult {
  format: DiffExportFormat;
  outputPath: string;
  size: number;
}

export function buildDiffFilename(
  diff: SnapshotDiff,
  format: DiffExportFormat
): string {
  const ext = format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt';
  const fromId = diff.fromSnapshot.id.slice(0, 8);
  const toId = diff.toSnapshot.id.slice(0, 8);
  return `diff-${fromId}-${toId}.${ext}`;
}

export function renderDiff(diff: SnapshotDiff, format: DiffExportFormat): string {
  switch (format) {
    case 'json':
      return exportDiffAsJson(diff);
    case 'markdown':
      return exportDiffAsMarkdown(diff);
    case 'text':
    default:
      return exportDiffAsText(diff);
  }
}

export function exportDiffToFile(
  diff: SnapshotDiff,
  options: DiffExportOptions
): DiffExportResult {
  const filename = options.filename ?? buildDiffFilename(diff, options.format);
  const outputPath = path.join(options.outputDir, filename);

  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }

  const content = renderDiff(diff, options.format);
  fs.writeFileSync(outputPath, content, 'utf-8');

  const size = Buffer.byteLength(content, 'utf-8');
  return { format: options.format, outputPath, size };
}

export function formatExportResult(result: DiffExportResult): string {
  const kb = (result.size / 1024).toFixed(2);
  return `Diff exported as ${result.format.toUpperCase()} → ${result.outputPath} (${kb} KB)`;
}
