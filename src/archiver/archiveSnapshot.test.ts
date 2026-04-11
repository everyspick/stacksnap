import * as fs from 'fs';
import * as path from 'path';
import {
  archiveSnapshot,
  restoreSnapshot,
  listArchivedSnapshots,
  deleteArchivedSnapshot,
  loadArchiveIndex,
} from './archiveSnapshot';
import { Snapshot } from '../snapshot/snapshot';

const ARCHIVE_DIR = '.stacksnap/archive';

function makeSnapshot(id: string): Snapshot {
  return {
    id,
    createdAt: '2024-01-01T00:00:00.000Z',
    tools: [
      { name: 'node', version: '20.0.0', path: '/usr/bin/node' },
      { name: 'git', version: '2.40.0', path: '/usr/bin/git' },
    ],
    metadata: { hostname: 'test-host', platform: 'linux', arch: 'x64' },
    tags: ['test'],
  };
}

beforeEach(() => {
  if (fs.existsSync(ARCHIVE_DIR)) {
    fs.rmSync(ARCHIVE_DIR, { recursive: true, force: true });
  }
});

afterAll(() => {
  if (fs.existsSync('.stacksnap')) {
    fs.rmSync('.stacksnap', { recursive: true, force: true });
  }
});

describe('archiveSnapshot', () => {
  it('should create a compressed archive file', () => {
    const snap = makeSnapshot('snap-001');
    const entry = archiveSnapshot(snap);
    expect(entry.snapshotId).toBe('snap-001');
    expect(entry.filename).toBe('snap-001.snap.gz');
    expect(entry.compressedSize).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(ARCHIVE_DIR, 'snap-001.snap.gz'))).toBe(true);
  });

  it('should add entry to archive index', () => {
    const snap = makeSnapshot('snap-002');
    archiveSnapshot(snap);
    const index = loadArchiveIndex();
    expect(index.entries).toHaveLength(1);
    expect(index.entries[0].snapshotId).toBe('snap-002');
  });
});

describe('restoreSnapshot', () => {
  it('should restore a previously archived snapshot', () => {
    const snap = makeSnapshot('snap-003');
    archiveSnapshot(snap);
    const restored = restoreSnapshot('snap-003');
    expect(restored.id).toBe('snap-003');
    expect(restored.tools).toHaveLength(2);
    expect(restored.tools[0].name).toBe('node');
  });

  it('should throw if snapshot not found', () => {
    expect(() => restoreSnapshot('nonexistent')).toThrow('Archived snapshot not found: nonexistent');
  });
});

describe('listArchivedSnapshots', () => {
  it('should return all archived entries', () => {
    archiveSnapshot(makeSnapshot('snap-004'));
    archiveSnapshot(makeSnapshot('snap-005'));
    const entries = listArchivedSnapshots();
    expect(entries).toHaveLength(2);
    expect(entries.map(e => e.snapshotId)).toContain('snap-004');
    expect(entries.map(e => e.snapshotId)).toContain('snap-005');
  });
});

describe('deleteArchivedSnapshot', () => {
  it('should delete an existing archived snapshot', () => {
    archiveSnapshot(makeSnapshot('snap-006'));
    const result = deleteArchivedSnapshot('snap-006');
    expect(result).toBe(true);
    expect(listArchivedSnapshots()).toHaveLength(0);
  });

  it('should return false for non-existent snapshot', () => {
    const result = deleteArchivedSnapshot('no-such-snap');
    expect(result).toBe(false);
  });
});
