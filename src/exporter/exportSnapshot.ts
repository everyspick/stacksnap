import { Snapshot } from '../detector/types';
import { ExportFormat } from '../cli/types';
import * as fs from 'fs';

export function exportAsJson(snapshot: Snapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function exportAsMarkdown(snapshot: Snapshot): string {
  const lines: string[] = [
    `# Stack Snapshot`,
    ``,
    `**ID:** ${snapshot.id}`,
    `**Created:** ${snapshot.createdAt}`,
    `**Host:** ${snapshot.metadata?.hostname ?? 'unknown'}`,
    `**Platform:** ${snapshot.metadata?.platform ?? 'unknown'}`,
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
    `ID: ${snapshot.id}`,
    `Created: ${snapshot.createdAt}`,
    ``,
    `Tools:`,
  ];
  for (const tool of snapshot.tools) {
    const ver = tool.version ?? 'n/a';
    const cat = tool.category ?? 'unknown';
    lines.push(`  - ${tool.name} @ ${ver} [${cat}]`);
  }
  return lines.join('\n');
}

export function exportSnapshot(
  snapshot: Snapshot,
  format: ExportFormat,
  outputPath?: string
): string {
  let content: string;
  switch (format) {
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
  if (outputPath) {
    fs.writeFileSync(outputPath, content, 'utf-8');
  }
  return content;
}
