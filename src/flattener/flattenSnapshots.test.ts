import { flattenSnapshots, formatFlattenResult } from './flattenSnapshots';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(
  id: string,
  tools: { name: string; version?: string; category?: string }[]
): Snapshot {
  return {
    id,
    label: id,
    createdAt: new Date().toISOString(),
    tools: tools.map((t) => ({
      name: t.name,
      version: t.version,
      category: t.category,
    })),
  };
}

describe('flattenSnapshots', () => {
  it('returns all tools from a single snapshot', () => {
    const snap = makeSnapshot('a', [
      { name: 'node', version: '18.0.0' },
      { name: 'npm', version: '9.0.0' },
    ]);
    const result = flattenSnapshots([snap]);
    expect(result.tools).toHaveLength(2);
    expect(result.duplicatesRemoved).toBe(0);
    expect(result.sourceCount).toBe(1);
  });

  it('deduplicates tools across snapshots (first wins by default)', () => {
    const snap1 = makeSnapshot('snap1', [{ name: 'node', version: '16.0.0' }]);
    const snap2 = makeSnapshot('snap2', [{ name: 'node', version: '18.0.0' }, { name: 'yarn', version: '1.22.0' }]);
    const result = flattenSnapshots([snap1, snap2]);
    expect(result.tools).toHaveLength(2);
    expect(result.tools.find((t) => t.name === 'node')?.version).toBe('16.0.0');
    expect(result.duplicatesRemoved).toBe(1);
    expect(result.totalBefore).toBe(3);
  });

  it('deduplicates with preferLatest option (last wins)', () => {
    const snap1 = makeSnapshot('snap1', [{ name: 'node', version: '16.0.0' }]);
    const snap2 = makeSnapshot('snap2', [{ name: 'node', version: '18.0.0' }]);
    const result = flattenSnapshots([snap1, snap2], { preferLatest: true });
    expect(result.tools.find((t) => t.name === 'node')?.version).toBe('18.0.0');
  });

  it('is case-insensitive for deduplication', () => {
    const snap1 = makeSnapshot('s1', [{ name: 'Node', version: '18.0.0' }]);
    const snap2 = makeSnapshot('s2', [{ name: 'node', version: '20.0.0' }]);
    const result = flattenSnapshots([snap1, snap2]);
    expect(result.tools).toHaveLength(1);
    expect(result.duplicatesRemoved).toBe(1);
  });

  it('records the source snapshot for each tool', () => {
    const snap1 = makeSnapshot('alpha', [{ name: 'git', version: '2.40.0' }]);
    const snap2 = makeSnapshot('beta', [{ name: 'docker', version: '24.0.0' }]);
    const result = flattenSnapshots([snap1, snap2]);
    expect(result.tools.find((t) => t.name === 'git')?.source).toBe('alpha');
    expect(result.tools.find((t) => t.name === 'docker')?.source).toBe('beta');
  });

  it('handles empty snapshot list', () => {
    const result = flattenSnapshots([]);
    expect(result.tools).toHaveLength(0);
    expect(result.duplicatesRemoved).toBe(0);
    expect(result.sourceCount).toBe(0);
  });
});

describe('formatFlattenResult', () => {
  it('formats result with tool details', () => {
    const snap = makeSnapshot('env1', [
      { name: 'node', version: '18.0.0', category: 'runtime' },
    ]);
    const result = flattenSnapshots([snap]);
    const output = formatFlattenResult(result);
    expect(output).toContain('1 unique tool');
    expect(output).toContain('node@18.0.0');
    expect(output).toContain('[runtime]');
    expect(output).toContain('from: env1');
  }) duplicates removed count', () => {
    const s1 = makeSnapshot('s1', [{ name: 'node', version: '16.0.0' }]);
    const s2 = makeSnapshot('s2', [{ name: '.0' }]);
    const result = flattenSnapshots([s1, s2]);
    const output = formatFlattenResult(result);
    expect(output).toContain('Duplicates removed: 1');
  });
});
