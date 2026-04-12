import { groupSnapshot, groupByVersionPresence, groupByNamePrefix, formatGroupResult } from './groupSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(tools: Array<{ name: string; version?: string; category?: string }>): Snapshot {
  return {
    id: 'test-snap',
    createdAt: new Date().toISOString(),
    tools: tools.map((t) => ({ name: t.name, version: t.version ?? null, ...(t.category ? { category: t.category } : {}) })) as any,
    metadata: {},
  };
}

describe('groupByVersionPresence', () => {
  it('splits tools into versioned and unversioned', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'bun' },
      { name: 'deno', version: '1.40.0' },
    ]);
    const result = groupByVersionPresence(snap);
    expect(result.groups['versioned'].map((t) => t.name)).toEqual(['node', 'deno']);
    expect(result.groups['unversioned'].map((t) => t.name)).toEqual(['bun']);
    expect(result.ungrouped).toHaveLength(0);
  });

  it('handles all versioned tools', () => {
    const snap = makeSnapshot([{ name: 'git', version: '2.40.0' }]);
    const result = groupByVersionPresence(snap);
    expect(result.groups['versioned']).toHaveLength(1);
    expect(result.groups['unversioned']).toHaveLength(0);
  });
});

describe('groupByNamePrefix', () => {
  it('groups tools by prefix', () => {
    const snap = makeSnapshot([
      { name: 'python3', version: '3.11.0' },
      { name: 'python2', version: '2.7.0' },
      { name: 'node', version: '18.0.0' },
    ]);
    const result = groupByNamePrefix(snap, ['python', 'node']);
    expect(result.groups['python'].map((t) => t.name)).toEqual(['python3', 'python2']);
    expect(result.groups['node'].map((t) => t.name)).toEqual(['node']);
    expect(result.ungrouped).toHaveLength(0);
  });

  it('puts unmatched tools in ungrouped', () => {
    const snap = makeSnapshot([{ name: 'rust', version: '1.70.0' }]);
    const result = groupByNamePrefix(snap, ['python']);
    expect(result.ungrouped.map((t) => t.name)).toEqual(['rust']);
  });
});

describe('groupSnapshot', () => {
  it('delegates to versionPresence grouper', () => {
    const snap = makeSnapshot([{ name: 'go', version: '1.21.0' }, { name: 'unknown' }]);
    const result = groupSnapshot(snap, 'versionPresence');
    expect(result.groups['versioned']).toHaveLength(1);
    expect(result.groups['unversioned']).toHaveLength(1);
  });

  it('returns ungrouped for unknown field', () => {
    const snap = makeSnapshot([{ name: 'tool' }]);
    const result = groupSnapshot(snap, 'category');
    expect(result.ungrouped).toHaveLength(1);
  });
});

describe('formatGroupResult', () => {
  it('formats groups and ungrouped tools', () => {
    const snap = makeSnapshot([{ name: 'node', version: '18.0.0' }, { name: 'bun' }]);
    const result = groupByVersionPresence(snap);
    const output = formatGroupResult(result);
    expect(output).toContain('[versioned]');
    expect(output).toContain('node @ 18.0.0');
    expect(output).toContain('[unversioned]');
    expect(output).toContain('bun (no version)');
  });
});
