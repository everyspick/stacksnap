import * as fs from 'fs';
import * as path from 'path';
import { Snapshot } from '../snapshot/snapshot';

export interface FreezeIndex {
  frozen: Record<string, FreezeEntry>;
}

export interface FreezeEntry {
  snapshotId: string;
  frozenAt: string;
  reason?: string;
}

export function loadFreezeIndex(indexPath: string): FreezeIndex {
  if (!fs.existsSync(indexPath)) {
    return { frozen: {} };
  }
  const raw = fs.readFileSync(indexPath, 'utf-8');
  return JSON.parse(raw) as FreezeIndex;
}

export function saveFreezeIndex(indexPath: string, index: FreezeIndex): void {
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}

export function freezeSnapshot(
  snapshot: Snapshot,
  indexPath: string,
  reason?: string
): FreezeEntry {
  const index = loadFreezeIndex(indexPath);
  const entry: FreezeEntry = {
    snapshotId: snapshot.id,
    frozenAt: new Date().toISOString(),
    reason,
  };
  index.frozen[snapshot.id] = entry;
  saveFreezeIndex(indexPath, index);
  return entry;
}

export function unfreezeSnapshot(snapshotId: string, indexPath: string): boolean {
  const index = loadFreezeIndex(indexPath);
  if (!index.frozen[snapshotId]) {
    return false;
  }
  delete index.frozen[snapshotId];
  saveFreezeIndex(indexPath, index);
  return true;
}

export function isFrozen(snapshotId: string, indexPath: string): boolean {
  const index = loadFreezeIndex(indexPath);
  return snapshotId in index.frozen;
}

export function listFrozen(indexPath: string): FreezeEntry[] {
  const index = loadFreezeIndex(indexPath);
  return Object.values(index.frozen);
}
