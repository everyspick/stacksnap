import * as fs from 'fs';
import * as path from 'path';
import { Snapshot } from '../snapshot/snapshot';

export interface RotateOptions {
  maxSnapshots?: number;
  archiveDir?: string;
}

export interface RotateResult {
  kept: string[];
  removed: string[];
  total: number;
}

function loadSnapshotTimestamp(filePath: string): number {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const snap: Snapshot = JSON.parse(raw);
    return new Date(snap.timestamp).getTime();
  } catch {
    return 0;
  }
}

export function rotateSnapshots(
  snapshotPaths: string[],
  options: RotateOptions = {}
): RotateResult {
  const maxSnapshots = options.maxSnapshots ?? 5;

  const sorted = [...snapshotPaths].sort((a, b) => {
    return loadSnapshotTimestamp(b) - loadSnapshotTimestamp(a);
  });

  const kept = sorted.slice(0, maxSnapshots);
  const removed = sorted.slice(maxSnapshots);

  for (const filePath of removed) {
    if (options.archiveDir) {
      const dest = path.join(options.archiveDir, path.basename(filePath));
      fs.mkdirSync(options.archiveDir, { recursive: true });
      fs.renameSync(filePath, dest);
    } else {
      fs.unlinkSync(filePath);
    }
  }

  return {
    kept,
    removed,
    total: snapshotPaths.length,
  };
}

export function formatRotateResult(result: RotateResult): string {
  const lines: string[] = [
    `Rotation complete: ${result.total} snapshot(s) evaluated.`,
    `  Kept   : ${result.kept.length}`,
    `  Removed: ${result.removed.length}`,
  ];

  if (result.removed.length > 0) {
    lines.push('\nRemoved snapshots:');
    for (const f of result.removed) {
      lines.push(`  - ${path.basename(f)}`);
    }
  }

  return lines.join('\n');
}
