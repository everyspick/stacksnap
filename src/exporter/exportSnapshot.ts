import * as fs from 'fs';
import * as path from 'path';
import { Snapshot } from '../snapshot/snapshot';
import { serializeSnapshot } from '../snapshot/snapshot';

export type ExportFormat = 'json' | 'markdown' | 'text';

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
}

export interface ExportResult {
  format: ExportFormat;
  outputPath?: string;
  content: string;
}

export function exportAsJson(snapshot: Snapshot): string {
  return JSON.stringify(serializeSnapshot(snapshot), null, 2);
}

export function exportAsMarkdown(snapshot: Snapshot): string {
  const lines: string[] = [
    `# Stack Snapshot`,
    ``,
    `**ID:** ${snapshot.id}`,
    `**Created:** ${snapshot.createdAt}`,
    `**Host:** ${snapshot.metadata.hostname} (${snapshot.metadata.platform})`,
    ``,
    `## Tools`,
    ``,
    `| Name | Version | Category |`,
    `|------|---------|----------|`,
  ];
  for (const tool of snapshot.tools) {
    lines.push(`| ${tool.name} | ${tool.version ?? 'n/a'} | ${tool.category ?? 'unknown'} |`);
  }
  return lines.join('\n');
}

export function exportAsText(snapshot: Snapshot): string {
  const lines: string[] = [
    `Stack Snapshot [${snapshot.id}]`,
    `Created: ${snapshot.createdAt}`,
    `Host: ${snapshot.metadata.hostname} (${snapshot.metadata.platform})`,
    ``,
    `Tools:`,
  ];
  for (const tool of snapshot.tools) {
    const ver = tool.version ? `v${tool.version}` : 'no version';
    lines.push(`  - ${tool.name} (${ver})`);
  }
  return lines.join('\n');
}

export function exportSnapshot(snapshot: Snapshot, options: ExportOptions): ExportResult {
  let content: string;
  switch (options.format) {
    case 'json':
      content = exportAsJson(snapshot);
      break;
    case 'markdown':
      content = exportAsMarkdown(snapshot);
      break;
    case 'text':
    default:
      content = exportAsText(snapshot);
      break;
  }

  if (options.outputPath) {
    fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
    fs.writeFileSync(options.outputPath, content, 'utf-8');
  }

  return { format: options.format, outputPath: options.outputPath, content };
}
