import * as fs from 'fs';
import * as path from 'path';
import { SnapshotDiff, formatDiff } from './diffSnapshots';

export type DiffExportFormat = 'json' | 'text';

export function exportDiffAsJson(diff: SnapshotDiff): string {
  return JSON.stringify(diff, null, 2);
}

export function exportDiffAsText(diff: SnapshotDiff): string {
  return formatDiff(diff);
}

export function exportDiff(
  diff: SnapshotDiff,
  format: DiffExportFormat = 'text',
  outputPath?: string
): string {
  let content: string;

  switch (format) {
    case 'json':
      content = exportDiffAsJson(diff);
      break;
    case 'text':
    default:
      content = exportDiffAsText(diff);
      break;
  }

  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, content, 'utf-8');
  }

  return content;
}
