import { StackInfo } from '../detector/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Snapshot {
  version: string;
  createdAt: string;
  hostname: string;
  platform: string;
  arch: string;
  stack: StackInfo[];
}

export function createSnapshot(stack: StackInfo[]): Snapshot {
  return {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    stack,
  };
}

export function serializeSnapshot(snapshot: Snapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function saveSnapshot(
  snapshot: Snapshot,
  outputPath?: string
): string {
  const filename = outputPath ?? `stacksnap-${Date.now()}.json`;
  const resolved = path.resolve(filename);
  fs.writeFileSync(resolved, serializeSnapshot(snapshot), 'utf-8');
  return resolved;
}

export function loadSnapshot(filePath: string): Snapshot {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Snapshot file not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse snapshot file: ${resolved}`);
  }
  if (typeof parsed !== 'object' || parsed === null || !('version' in parsed) || !('stack' in parsed)) {
    throw new Error(`Invalid snapshot format in file: ${resolved}`);
  }
  return parsed as Snapshot;
}
