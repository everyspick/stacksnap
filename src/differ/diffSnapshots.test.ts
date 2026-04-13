import { diffSnapshots, formatDiff, SnapshotDiff } from './diffSnapshots';
import { Snapshot } from '../detector/types';

function makeSnapshot(tools: { name: string; version?: string; category?: string }[]): Snapshot {
  return {
    id: 'test-id',
    createdAt: new Date().toISOString(),
    tools: tools.map(t => ({ name: t.name, version: t.version, category: t.category })),
    metadata: { hostname: 'localhost', platform: 'test', shell: '/bin/sh' },
  };
}

describe('diffSnapshots', () => {
  it('detects added tools', () => {
    const base = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const target = makeSnapshot([{ name: 'node', version: '18.0.0' }, { name: 'bun', version: '1.0.0' }]);
    const diff = diffSnapshots(base, target);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].tool).toBe('bun');
    expect(diff.summary.added).toBe(1);
  });

  it('detects removed tools', () => {
    const base = makeSnapshot([{ name: 'node', version: '18.0.0' }, { name: 'yarn', version: '1.22.0' }]);
    const target = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const diff = diffSnapshots(base, target);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].tool).toBe('yarn');
    expect(diff.summary.removed).toBe(1);
  });

  it('detects changed versions', () => {
    const base = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const target = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const diff = diffSnapshots(base, target);
    expect(diff.changed).toHaveLength(1);
    expect(diff.changed[0].oldVersion).toBe('18.0.0');
    expect(diff.changed[0].newVersion).toBe('20.0.0');
  });

  it('marks unchanged tools', () => {
    const base = makeSnapshot([{ name: 'git', version: '2.40.0' }]);
    const target = makeSnapshot([{ name: 'git', version: '2.40.0' }]);
    const diff = diffSnapshots(base, target);
    expect(diff.unchanged).toHaveLength(1);
    expect(diff.summary.unchanged).toBe(1);
  });

  it('handles empty snapshots', () => {
    const diff = diffSnapshots(makeSnapshot([]), makeSnapshot([]));
    expect(diff.summary.total).toBe(0);
  });

  it('computes correct summary totals', () => {
    const base = makeSnapshot([{ name: 'node', version: '18.0.0' }, { name: 'yarn', version: '1.22.0' }]);
    const target = makeSnapshot([{ name: 'node', version: '20.0.0' }, { name: 'bun', version: '1.0.0' }]);
    const diff = diffSnapshots(base, target);
    expect(diff.summary.changed).toBe(1);
    expect(diff.summary.removed).toBe(1);
    expect(diff.summary.added).toBe(1);
    expect(diff.summary.total).toBe(3);
  });
});

describe('formatDiff', () => {
  it('includes section headers for non-empty sections', () => {
    const base = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const target = makeSnapshot([{ name: 'node', version: '20.0.0' }, { name: 'bun', version: '1.0.0' }]);
    const diff = diffSnapshots(base, target);
    const output = formatDiff(diff);
    expect(output).toContain('+ Added:');
    expect(output).toContain('~ Changed:');
    expect(output).toContain('bun');
    expect(output).toContain('18.0.0');
    expect(output).toContain('20.0.0');
  });

  it('includes summary line', () => {
    const diff = diffSnapshots(makeSnapshot([]), makeSnapshot([]));
    const output = formatDiff(diff);
    expect(output).toContain('Added: 0');
    expect(output).toContain('Removed: 0');
  });
});
