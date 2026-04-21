import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { rotateSnapshots, formatRotateResult } from './rotateSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-rotator-'));
}

function writeSnapshot(dir: string, name: string, timestamp: string): string {
  const snap: Snapshot = {
    id: name,
    timestamp,
    tools: [],
    metadata: { host: 'test', platform: 'linux', generatedBy: 'test' },
  };
  const filePath = path.join(dir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snap));
  return filePath;
}

describe('rotateSnapshots', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('keeps only the most recent N snapshots', () => {
    const files = [
      writeSnapshot(tmpDir, 'snap-a', '2024-01-01T00:00:00Z'),
      writeSnapshot(tmpDir, 'snap-b', '2024-03-01T00:00:00Z'),
      writeSnapshot(tmpDir, 'snap-c', '2024-02-01T00:00:00Z'),
    ];

    const result = rotateSnapshots(files, { maxSnapshots: 2 });

    expect(result.kept).toHaveLength(2);
    expect(result.removed).toHaveLength(1);
    expect(result.total).toBe(3);
    expect(fs.existsSync(files[0])).toBe(false); // snap-a is oldest
  });

  it('moves removed snapshots to archiveDir when provided', () => {
    const archiveDir = path.join(tmpDir, 'archive');
    const files = [
      writeSnapshot(tmpDir, 'snap-x', '2024-01-01T00:00:00Z'),
      writeSnapshot(tmpDir, 'snap-y', '2024-06-01T00:00:00Z'),
    ];

    const result = rotateSnapshots(files, { maxSnapshots: 1, archiveDir });

    expect(result.removed).toHaveLength(1);
    expect(fs.existsSync(path.join(archiveDir, 'snap-x.json'))).toBe(true);
  });

  it('keeps all snapshots when maxSnapshots >= total', () => {
    const files = [
      writeSnapshot(tmpDir, 'snap-1', '2024-01-01T00:00:00Z'),
      writeSnapshot(tmpDir, 'snap-2', '2024-02-01T00:00:00Z'),
    ];

    const result = rotateSnapshots(files, { maxSnapshots: 10 });

    expect(result.kept).toHaveLength(2);
    expect(result.removed).toHaveLength(0);
  });
});

describe('formatRotateResult', () => {
  it('formats a summary with removals', () => {
    const result = {
      kept: ['snap-b.json', 'snap-c.json'],
      removed: ['/tmp/snap-a.json'],
      total: 3,
    };
    const output = formatRotateResult(result);
    expect(output).toContain('Rotation complete: 3 snapshot(s) evaluated.');
    expect(output).toContain('Kept   : 2');
    expect(output).toContain('Removed: 1');
    expect(output).toContain('snap-a.json');
  });

  it('omits removed section when nothing was removed', () => {
    const result = { kept: ['snap-a.json'], removed: [], total: 1 };
    const output = formatRotateResult(result);
    expect(output).not.toContain('Removed snapshots:');
  });
});
