import * as fs from 'fs';
import * as path from 'path';
import { detectStack } from '../detector/detectTools';
import { createSnapshot, saveSnapshot } from '../snapshot/snapshot';
import { hasStackChanged } from '../watcher/watchStack';
import { loadSnapshot } from '../snapshot/snapshot';

export interface ScheduleOptions {
  intervalMs: number;
  outputDir: string;
  onChanged?: (snapshotPath: string) => void;
  onUnchanged?: () => void;
  onError?: (err: Error) => void;
}

export interface ScheduleHandle {
  stop: () => void;
  isRunning: () => boolean;
}

export async function runScheduledCheck(outputDir: string): Promise<string | null> {
  const stack = await detectStack();
  const snapshot = createSnapshot(stack);

  const indexPath = path.join(outputDir, 'latest.json');
  let changed = true;

  if (fs.existsSync(indexPath)) {
    const previous = loadSnapshot(indexPath);
    changed = hasStackChanged(previous, snapshot);
  }

  if (!changed) {
    return null;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = snapshot.createdAt.replace(/[:.]/g, '-');
  const snapshotPath = path.join(outputDir, `snapshot-${timestamp}.json`);

  saveSnapshot(snapshot, snapshotPath);
  saveSnapshot(snapshot, indexPath);

  return snapshotPath;
}

export function startScheduler(options: ScheduleOptions): ScheduleHandle {
  let running = true;

  const tick = async () => {
    if (!running) return;
    try {
      const result = await runScheduledCheck(options.outputDir);
      if (result) {
        options.onChanged?.(result);
      } else {
        options.onUnchanged?.();
      }
    } catch (err) {
      options.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
    if (running) {
      setTimeout(tick, options.intervalMs);
    }
  };

  setTimeout(tick, 0);

  return {
    stop: () => { running = false; },
    isRunning: () => running,
  };
}
