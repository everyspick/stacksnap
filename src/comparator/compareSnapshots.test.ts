import { compareSnapshots, formatComparison } from './compareSnapshots';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(tools: { name: string; version?: string }[]): Snapshot {
  return {
    id: 'test-id',
    createdAt: new Date().toISOString(),
    tools: tools.map((t) => ({ name: t.name, version: t.version, path: undefined })),
    metadata: {},
  };
}

describe('compareSnapshots', () => {
  it('returns identical=true for two equal snapshots', () => {
    const a = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const b = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const result = compareSnapshots(a, b);
    expect(result.identical).toBe(true);
    expect(result.similarityScore).toBe(100);
    expect(result.versionMismatches).toHaveLength(0);
  });

  it('detects tools only in A', () => {
    const a = makeSnapshot([{ name: 'node', version: '20.0.0' }, { name: 'yarn', version: '1.22.0' }]);
    const b = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const result = compareSnapshots(a, b);
    expect(result.onlyInA).toContain('yarn');
    expect(result.onlyInB).toHaveLength(0);
    expect(result.identical).toBe(false);
  });

  it('detects tools only in B', () => {
    const a = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const b = makeSnapshot([{ name: 'node', version: '20.0.0' }, { name: 'pnpm', version: '8.0.0' }]);
    const result = compareSnapshots(a, b);
    expect(result.onlyInB).toContain('pnpm');
    expect(result.onlyInA).toHaveLength(0);
  });

  it('detects version mismatches', () => {
    const a = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const b = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const result = compareSnapshots(a, b);
    expect(result.versionMismatches).toHaveLength(1);
    expect(result.versionMismatches[0]).toMatchObject({
      tool: 'node',
      versionA: '18.0.0',
      versionB: '20.0.0',
    });
    expect(result.identical).toBe(false);
  });

  it('calculates similarity score correctly', () => {
    const a = makeSnapshot([{ name: 'node', version: '20.0.0' }, { name: 'git', version: '2.40.0' }]);
    const b = makeSnapshot([{ name: 'node', version: '20.0.0' }, { name: 'python', version: '3.11.0' }]);
    const result = compareSnapshots(a, b);
    // 1 match out of 3 unique tools
    expect(result.similarityScore).toBe(33);
  });

  it('handles empty snapshots', () => {
    const a = makeSnapshot([]);
    const b = makeSnapshot([]);
    const result = compareSnapshots(a, b);
    expect(result.identical).toBe(true);
    expect(result.similarityScore).toBe(100);
  });
});

describe('formatComparison', () => {
  it('includes similarity score in output', () => {
    const a = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const b = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const result = compareSnapshots(a, b);
    const output = formatComparison(result);
    expect(output).toContain('Similarity: 100%');
    expect(output).toContain('identical');
  });

  it('lists version mismatches in output', () => {
    const a = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const b = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const result = compareSnapshots(a, b);
    const output = formatComparison(result);
    expect(output).toContain('node');
    expect(output).toContain('18.0.0');
    expect(output).toContain('20.0.0');
  });
});
