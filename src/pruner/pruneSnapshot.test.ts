import { pruneSnapshot, formatPruneResult } from './pruneSnapshot';
import { Snapshot } from '../detector/types';

function makeSnapshot(tools: { name: string; version?: string; category?: string }[]): Snapshot {
  return {
    id: 'test-snap',
    createdAt: new Date().toISOString(),
    tools: tools.map((t) => ({ ...t, version: t.version ?? null })),
  } as unknown as Snapshot;
}

describe('pruneSnapshot', () => {
  it('removes duplicate names with orphaned strategy', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'node', version: '20.0.0' },
      { name: 'npm', version: '9.0.0' },
    ]);
    const { result } = pruneSnapshot(snap, { strategies: ['orphaned'] });
    expect(result.pruned).toBe(2);
    expect(result.removed).toContain('node');
  });

  it('removes exact duplicates with duplicates strategy', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'node', version: '18.0.0' },
      { name: 'npm', version: '9.0.0' },
    ]);
    const { result } = pruneSnapshot(snap, { strategies: ['duplicates'] });
    expect(result.pruned).toBe(2);
  });

  it('removes tools without versions with unversioned strategy', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'unknown-tool' },
      { name: 'another-tool', version: '' },
    ]);
    const { result } = pruneSnapshot(snap, { strategies: ['unversioned'] });
    expect(result.pruned).toBe(1);
    expect(result.removed).toContain('unknown-tool');
    expect(result.removed).toContain('another-tool');
  });

  it('applies all strategies with all strategy', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'node', version: '18.0.0' },
      { name: 'ghost' },
    ]);
    const { result } = pruneSnapshot(snap, { strategies: ['all'] });
    expect(result.pruned).toBe(1);
  });

  it('does not mutate snapshot on dry run', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'ghost' },
    ]);
    const { snapshot, result } = pruneSnapshot(snap, { strategies: ['unversioned'], dryRun: true });
    expect(snapshot.tools).toHaveLength(2);
    expect(result.dryRun).toBe(true);
    expect(result.removed).toContain('ghost');
  });

  it('returns empty removed list when nothing to prune', () => {
    const snap = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const { result } = pruneSnapshot(snap, { strategies: ['duplicates'] });
    expect(result.removed).toHaveLength(0);
    expect(result.pruned).toBe(1);
  });
});

describe('formatPruneResult', () => {
  it('formats result with removed tools listed', () => {
    const result = {
      original: 4,
      pruned: 2,
      removed: ['ghost', 'phantom'],
      strategies: ['unversioned'],
      dryRun: false,
    };
    const output = formatPruneResult(result);
    expect(output).toContain('Prune Result');
    expect(output).toContain('ghost');
    expect(output).toContain('phantom');
    expect(output).toContain('4 tool(s)');
    expect(output).toContain('2 tool(s)');
  });

  it('indicates dry run in output', () => {
    const result = {
      original: 3,
      pruned: 3,
      removed: [],
      strategies: ['all'],
      dryRun: true,
    };
    const output = formatPruneResult(result);
    expect(output).toContain('dry run');
  });
});
