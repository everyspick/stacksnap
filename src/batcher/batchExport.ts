import * as fs from 'fs';
import * as path from 'path';
import { Snapshot } from '../snapshot/snapshot';
import { exportAsJson, exportAsMarkdown, exportAsText } from '../exporter/exportSnapshot';

export type BatchFormat = 'json' | 'markdown' | 'text';

export interface BatchExportOptions {
  snapshots: { name: string; snapshot: Snapshot }[];
  outputDir: string;
  format: BatchFormat;
  prefix?: string;
}

export interface BatchExportResult {
  exported: string[];
  failed: { name: string; error: string }[];
  outputDir: string;
}

export function renderForFormat(snapshot: Snapshot, format: BatchFormat): string {
  switch (format) {
    case 'json':
      return exportAsJson(snapshot);
    case 'markdown':
      return exportAsMarkdown(snapshot);
    case 'text':
      return exportAsText(snapshot);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

export function buildFilename(name: string, format: BatchFormat, prefix?: string): string {
  const ext = format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt';
  const base = prefix ? `${prefix}_${name}` : name;
  return `${base}.${ext}`;
}

export function batchExport(options: BatchExportOptions): BatchExportResult {
  const { snapshots, outputDir, format, prefix } = options;
  const exported: string[] = [];
  const failed: { name: string; error: string }[] = [];

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const { name, snapshot } of snapshots) {
    try {
      const content = renderForFormat(snapshot, format);
      const filename = buildFilename(name, format, prefix);
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, content, 'utf-8');
      exported.push(filePath);
    } catch (err) {
      failed.push({ name, error: (err as Error).message });
    }
  }

  return { exported, failed, outputDir };
}

export function formatBatchResult(result: BatchExportResult): string {
  const lines: string[] = [];
  lines.push(`Batch Export — Output: ${result.outputDir}`);
  lines.push(`  Exported: ${result.exported.length} file(s)`);
  for (const f of result.exported) {
    lines.push(`    ✓ ${path.basename(f)}`);
  }
  if (result.failed.length > 0) {
    lines.push(`  Failed: ${result.failed.length} file(s)`);
    for (const f of result.failed) {
      lines.push(`    ✗ ${f.name}: ${f.error}`);
    }
  }
  return lines.join('\n');
}
