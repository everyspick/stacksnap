import * as fs from 'fs';
import * as path from 'path';
import { detectStack } from '../detector/detectTools';
import { createSnapshot, saveSnapshot } from '../snapshot/snapshot';
import { StackSnapshot } from '../snapshot/snapshot';

export interface WatchOptions {
  interval: number; // milliseconds
  outputDir: string;
  onChange?: (prev: StackSnapshot, next: StackSnapshot) => void;
  onError?: (err: Error) => void;
}

export interface WatchHandle {
  stop: () => void;
  isRunning: () => boolean;
}

export async function startWatching(options: WatchOptions): Promise<WatchHandle> {
  const { interval, outputDir, onChange, onError } = options;
  let running = true;
  let lastSnapshot: StackSnapshot | null = null;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  async function poll(): Promise<void> {
    if (!running) return;

    try {
      const stack = await detectStack();
      const snapshot = createSnapshot(stack);

      if (lastSnapshot !== null) {
        const changed = hasStackChanged(lastSnapshot, snapshot);
        if (changed) {
          await saveSnapshotToDir(snapshot, outputDir);
          onChange?.(lastSnapshot, snapshot);
        }
      } else {
        await saveSnapshotToDir(snapshot, outputDir);
      }

      lastSnapshot = snapshot;
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }

    if (running) {
      setTimeout(poll, interval);
    }
  }

  setTimeout(poll, 0);

  return {
    stop: () => { running = false; },
    isRunning: () => running,
  };
}

/**
 * Saves a snapshot to the given directory using a timestamp-based filename.
 */
async function saveSnapshotToDir(snapshot: StackSnapshot, outputDir: string): Promise<void> {
  const filename = `snapshot-${snapshot.timestamp}.json`;
  const filepath = path.join(outputDir, filename);
  await saveSnapshot(snapshot, filepath);
}

export function hasStackChanged(prev: StackSnapshot, next: StackSnapshot): boolean {
  const prevTools = Object.entries(prev.tools).sort(([a], [b]) => a.localeCompare(b));
  const nextTools = Object.entries(next.tools).sort(([a], [b]) => a.localeCompare(b));

  if (prevTools.length !== nextTools.length) return true;

  for (let i = 0; i < prevTools.length; i++) {
    const [prevName, prevInfo] = prevTools[i];
    const [nextName, nextInfo] = nextTools[i];
    if (prevName !== nextName || prevInfo.version !== nextInfo.version) return true;
  }

  return false;
}
