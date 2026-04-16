import { splitSnapshot, formatSplitResult } from './splitSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(tools: Array<{ name: string; version?: string; category?: string }>): Snapshot {
  return {
    id: 'test-snap',
    createdAt: new Date().toISOString(),
    hostname: 'localhost',
    tools: tools.map(t => ({ name: t.name, version: t.version ?? null, category: t.category ?? null })),
  } as unknown as Snapshot;
}

describe('splitSnapshot', () => {
  const snap = makeSnapshot([
    { name: 'node', version: '18.0.0', category: 'runtime' },
    { name: 'python', version: '3.11.0', category: 'runtime' },
    { name: 'git', version: '2.40.0', category: 'vcs' },
    { name: 'unknown-tool', category: undefined },
  ]);

  it('splits by category', () => {
    const result = splitSnapshot(snap, { by: 'category' });
    expect(result.bucketCount).toBe(3);
    expect(Object.keys(result.buckets)).toContain('runtime');
    expect(result.buckets['runtime'].tools).toHaveLength(2);
    expect(result.buckets['vcs'].tools).toHaveLength(1);
    expect(result.buckets['uncategorized'].tools).toHaveLength(1);
  });

  it('splits by versionPresence', () => {
    const result = splitSnapshot(snap, { by: 'versionPresence' });
    expect(result.bucketCount).toBe(2);
    expect(result.buckets['versioned'].tools).toHaveLength(3);
    expect(result.buckets['unversioned'].tools).toHaveLength(1);
  });

  it('splits by namePrefix', () => {
    const result = splitSnapshot(snap, { by: 'namePrefix', prefix: 'py' });
    expect(result.buckets['prefix:py'].tools).toHaveLength(1);
    expect(result.buckets['other'].tools).toHaveLength(3);
  });

  it('preserves snapshot metadata in each bucket', () => {
    const result = splitSnapshot(snap, { by: 'category' });
    const bucket = result.buckets['runtime'];
    expect(bucket.hostname).toBe('localhost');
    expect(bucket.id).toContain('test-snap');
  });

  it('reports correct totals', () => {
    const result = splitSnapshot(snap, { by: 'category' });
    expect(result.totalTools).toBe(4);
  });
});

describe('formatSplitResult', () => {
  it('formats output with bucket headers and tool entries', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0', category: 'runtime' },
    ]);
    const result = splitSnapshot(snap, { by: 'category' });
    const output = formatSplitResult(result);
    expect(output).toContain('Split Result');
    expect(output).toContain('runtime');
    expect(output).toContain('node');
    expect(output).toContain('18.0.0');
  });
});
