import * as fs from 'fs';
import * as path from 'path';
import { SnapshotDiff, DiffEntry } from '../differ/types';

function renderDiffEntryMarkdown(entry: DiffEntry): string {
  switch (entry.type) {
    case 'added':
      return `| ➕ ${entry.tool} | — | ${entry.newVersion ?? 'n/a'} |`;
    case 'removed':
      return `| ➖ ${entry.tool} | ${entry.oldVersion ?? 'n/a'} | — |`;
    case 'changed':
      return `| 🔄 ${entry.tool} | ${entry.oldVersion ?? 'n/a'} | ${entry.newVersion ?? 'n/a'} |`;
    case 'unchanged':
      return `| ✅ ${entry.tool} | ${entry.oldVersion ?? 'n/a'} | ${entry.newVersion ?? 'n/a'} |`;
    default:
      return '';
  }
}

export function exportDiffAsMarkdown(diff: SnapshotDiff): string {
  const lines: string[] = [
    `# Snapshot Diff`,
    ``,
    `**From:** ${diff.fromId}`,
    `**To:** ${diff.toId}`,
    `**Generated:** ${diff.generatedAt}`,
    ``,
    `## Changes`,
    ``,
    `| Tool | Old Version | New Version |`,
    `|------|-------------|-------------|`,
  ];

  const relevant = diff.entries.filter(e => e.type !== 'unchanged');
  for (const entry of relevant) {
    lines.push(renderDiffEntryMarkdown(entry));
  }

  if (relevant.length === 0) {
    lines.push(`_No changes detected._`);
  }

  return lines.join('\n');
}

export function exportFullDiff(
  diff: SnapshotDiff,
  format: 'markdown' | 'json',
  outputPath?: string
): string {
  let content: string;

  if (format === 'json') {
    content = JSON.stringify(diff, null, 2);
  } else {
    content = exportDiffAsMarkdown(diff);
  }

  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf-8');
  }

  return content;
}
