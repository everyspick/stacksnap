import * as fs from 'fs';
import * as path from 'path';
import { SnapshotDiff, formatDiff } from './diffSnapshots';

export function exportDiffAsJson(diff: SnapshotDiff, outputPath: string): void {
  const json = JSON.stringify(diff, null, 2);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, json, 'utf-8');
}

export function exportDiffAsText(diff: SnapshotDiff, outputPath: string): void {
  const text = formatDiff(diff);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, text, 'utf-8');
}

export function exportDiff(
  diff: SnapshotDiff,
  outputPath: string,
  format: 'json' | 'text' = 'text'
): void {
  switch (format) {
    case 'json':
      exportDiffAsJson(diff, outputPath);
      break;
    case 'text':
    default:
      exportDiffAsText(diff, outputPath);
      break;
  }
}
