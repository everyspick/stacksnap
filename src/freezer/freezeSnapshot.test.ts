import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  freezeSnapshot,
  unfreezeSnapshot,
  isFrozen,
  listFrozen,
  loadFreezeIndex,
} from './freezeSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeTempFile(): string {
  return path.join(os.tmpdir(), `freeze-index-${Date.now()}.json`);
}

function makeSnapshot(id: string): Snapshot {
  return {
    id,
    createdAt: new Date().toISOString(),
    tools: [],
    metadata: { hostname: 'test', platform: 'linux', shell: '/bin/sh' },
  };
}

describe('freezeSnapshot', () => {
  it('creates a freeze entry and persists it', () => {
    const indexPath = makeTempFile();
    const snap = makeSnapshot('snap-001');
    const entry = freezeSnapshot(snap, indexPath, 'stable release');

    expect(entry.snapshotId).toBe('snap-001');
    expect(entry.reason).toBe('stable release');
    expect(entry.frozenAt).toBeTruthy();

    const index = loadFreezeIndex(indexPath);
    expect(index.frozen['snap-001']).toBeDefined();
    fs.unlinkSync(indexPath);
  });

  it('isFrozen returns true for a frozen snapshot', () => {
    const indexPath = makeTempFile();
    const snap = makeSnapshot('snap-002');
    freezeSnapshot(snap, indexPath);
    expect(isFrozen('snap-002', indexPath)).toBe(true);
    fs.unlinkSync(indexPath);
  });

  it('isFrozen returns false for an unknown snapshot', () => {
    const indexPath = makeTempFile();
    expect(isFrozen('snap-999', indexPath)).toBe(false);
  });

  it('unfreezeSnapshot removes the entry', () => {
    const indexPath = makeTempFile();
    const snap = makeSnapshot('snap-003');
    freezeSnapshot(snap, indexPath);
    const result = unfreezeSnapshot('snap-003', indexPath);
    expect(result).toBe(true);
    expect(isFrozen('snap-003', indexPath)).toBe(false);
    fs.unlinkSync(indexPath);
  });

  it('unfreezeSnapshot returns false when not frozen', () => {
    const indexPath = makeTempFile();
    const result = unfreezeSnapshot('snap-404', indexPath);
    expect(result).toBe(false);
  });

  it('listFrozen returns all frozen entries', () => {
    const indexPath = makeTempFile();
    freezeSnapshot(makeSnapshot('snap-a'), indexPath, 'reason A');
    freezeSnapshot(makeSnapshot('snap-b'), indexPath);
    const entries = listFrozen(indexPath);
    expect(entries).toHaveLength(2);
    const ids = entries.map((e) => e.snapshotId);
    expect(ids).toContain('snap-a');
    expect(ids).toContain('snap-b');
    fs.unlinkSync(indexPath);
  });
});
