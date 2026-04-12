import { DiffResult } from '../differ/diffSnapshots';
import { exportDiffAsJson, exportDiffAsText } from '../differ/exportDiff';
import * as fs from 'fs';
import * as path from 'path';

export type DiffExportFormat = 'json' | 'text' | 'markdown';

export interface DiffExportOptions {
  format: DiffExportFormat;
  outputPath?: string;
}

export function exportDiffAsMarkdown(diff: DiffResult): string {
  const lines: string[] = [];
  lines.push('# Stack Diff Report');
  lines.push('');
  lines.push(`**From:** ${diff.snapshotA}  `);
  lines.push(`**To:** ${diff.snapshotB}`);
  lines.push('');

  if (diff.added.length > 0) {
    lines.push('## Added Tools');
    diff.added.forEach(t => lines.push(`- \`${t.name}\` ${t.version ?? '(no version)'}` ));
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push('## Removed Tools');
    diff.removed.forEach(t => lines.push(`- \`${t.name}\``));
    lines.push('');
  }

  if (diff.changed.length > 0) {
    lines.push('## Changed Tools');
    diff.changed.forEach(c =>
      lines.push(`- \`${c.tool}\`: ${c.fromVersion ?? 'n/a'} → ${c.toVersion ?? 'n/a'}`)
    );
    lines.push('');
  }

  if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
    lines.push('_No differences found._');
  }

  return lines.join('\n');
}

export function exportFullDiff(
  diff: DiffResult,
  options: DiffExportOptions
): string {
  let content: string;

  switch (options.format) {
    case 'json':
      content = exportDiffAsJson(diff);
      break;
    case 'markdown':
      content = exportDiffAsMarkdown(diff);
      break;
    case 'text':
    default:
      content = exportDiffAsText(diff);
      break;
  }

  if (options.outputPath) {
    const dir = path.dirname(options.outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(options.outputPath, content, 'utf-8');
  }

  return content;
}
