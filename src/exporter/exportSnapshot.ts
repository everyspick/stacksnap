import * as fs from 'fs';
import * as path from 'path';
import { Snapshot } from '../detector/types';
import { serializeSnapshot } from '../snapshot/snapshot';

export type ExportFormat = 'json' | 'markdown' | 'text';

export function exportAsJson(snapshot: Snapshot): string {
  return JSON.stringify(serializeSnapshot(snapshot), null, 2);
}

export function exportAsMarkdown(snapshot: Snapshot): string {
  const lines: string[] = [
    `# Stack Snapshot`,
    ``,
    `**Created:** ${new Date(snapshot.createdAt).toISOString()}`,
    `**Host:** ${snapshot.host ?? 'unknown'}`,
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
    `Stack Snapshot`,
    `Created: ${new Date(snapshot.createdAt).toISOString()}`,
    `Host: ${snapshot.host ?? 'unknown'}`,
    ``,
    `Tools:`,
  ];
  for (const tool of snapshot.tools) {
    const ver = tool.version ? `v${tool.version}` : 'no version';
    lines.push(`  ${tool.name} (${ver}) [${tool.category ?? 'unknown'}]`);
  }
  return lines.join('\n');
}

export function exportSnapshot(
  snapshot: Snapshot,
  format: ExportFormat,
  outputPath?: string
): string {
  let content: string;
  if (format === 'json') content = exportAsJson(snapshot);
  else if (format === 'markdown') content = exportAsMarkdown(snapshot);
  else content = exportAsText(snapshot);

  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf-8');
  }
  return content;
}
