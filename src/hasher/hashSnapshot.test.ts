import { hashSnapshot, compareHashes, formatHashResult, formatHashComparison } from './hashSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(id: string, tools: { name: string; version?: string; category?: string }[]): Snapshot {
  return {
    id,
    createdAt: '2024-01-01T00:00:00.000Z',
    tools: tools.map(t => ({ name: t.name, version: t.version ?? null, category: t.category ?? null })),
  } as unknown as Snapshot;
}

describe('hashSnapshot', () => {
  it('produces a hex string hash', () => {
    const snap = makeSnapshot('snap-1', [{ name: 'node', version: '20.0.0' }]);
    const result = hashSnapshot(snap);
    expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.algorithm).toBe('sha256');
    expect(result.snapshotId).toBe('snap-1');
    expect(result.toolCount).toBe(1);
  });

  it('produces the same hash for identical snapshots', () => {
    const snap1 = makeSnapshot('snap-1', [{ name: 'node', version: '20.0.0' }, { name: 'git', version: '2.40.0' }]);
    const snap2 = makeSnapshot('snap-1', [{ name: 'git', version: '2.40.0' }, { name: 'node', version: '20.0.0' }]);
    const h1 = hashSnapshot(snap1);
    const h2 = hashSnapshot(snap2);
    expect(h1.hash).toBe(h2.hash);
  });

  it('produces different hashes for different tool versions', () => {
    const snap1 = makeSnapshot('snap-1', [{ name: 'node', version: '18.0.0' }]);
    const snap2 = makeSnapshot('snap-1', [{ name: 'node', version: '20.0.0' }]);
    expect(hashSnapshot(snap1).hash).not.toBe(hashSnapshot(snap2).hash);
  });

  it('supports md5 algorithm', () => {
    const snap = makeSnapshot('snap-1', [{ name: 'node', version: '20.0.0' }]);
    const result = hashSnapshot(snap, 'md5');
    expect(result.hash).toMatch(/^[a-f0-9]{32}$/);
    expect(result.algorithm).toBe('md5');
  });
});

describe('compareHashes', () => {
  it('returns match true for identical hashes', () => {
    const snap = makeSnapshot('snap-1', [{ name: 'node', version: '20.0.0' }]);
    const h1 = hashSnapshot(snap);
    const h2 = hashSnapshot(snap);
    const result = compareHashes(h1, h2);
    expect(result.match).toBe(true);
  });

  it('returns match false for different hashes', () => {
    const s1 = makeSnapshot('snap-1', [{ name: 'node', version: '18.0.0' }]);
    const s2 = makeSnapshot('snap-2', [{ name: 'node', version: '20.0.0' }]);
    const result = compareHashes(hashSnapshot(s1), hashSnapshot(s2));
    expect(result.match).toBe(false);
  });
});

describe('formatHashResult', () => {
  it('includes hash and snapshot id in output', () => {
    const snap = makeSnapshot('snap-abc', [{ name: 'python', version: '3.11.0' }]);
    const result = hashSnapshot(snap);
    const output = formatHashResult(result);
    expect(output).toContain('snap-abc');
    expect(output).toContain(result.hash);
    expect(output).toContain('sha256');
  });
});

describe('formatHashComparison', () => {
  it('shows MATCH when hashes are equal', () => {
    const snap = makeSnapshot('snap-1', [{ name: 'node', version: '20.0.0' }]);
    const h = hashSnapshot(snap);
    const output = formatHashComparison(compareHashes(h, h));
    expect(output).toContain('MATCH');
  });

  it('shows MISMATCH when hashes differ', () => {
    const s1 = makeSnapshot('snap-1', [{ name: 'node', version: '18.0.0' }]);
    const s2 = makeSnapshot('snap-2', [{ name: 'node', version: '20.0.0' }]);
    const output = formatHashComparison(compareHashes(hashSnapshot(s1), hashSnapshot(s2)));
    expect(output).toContain('MISMATCH');
  });
});
