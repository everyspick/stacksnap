import { sortSnapshot, sortByName, sortByVersion, sortByCategory, formatSortResult } from './sortSnapshot';
import { Snapshot } from '../detector/types';

function makeSnapshot(tools: Array<{ name: string; version?: string; category?: string }>): Snapshot {
  return {
    id: 'test-id',
    createdAt: new Date().toISOString(),
    tools: tools.map(t => ({ name: t.name, version: t.version, category: t.category })),
  } as Snapshot;
}

const tools = [
  { name: 'node', version: '18.0.0', category: 'runtime' },
  { name: 'git', version: '2.40.0', category: 'vcs' },
  { name: 'bun', version: '1.0.0', category: 'runtime' },
  { name: 'docker', category: 'container' },
];

describe('sortByName', () => {
  it('sorts ascending by default', () => {
    const snap = makeSnapshot(tools);
    const result = sortByName(snap.tools);
    expect(result.map(t => t.name)).toEqual(['bun', 'docker', 'git', 'node']);
  });

  it('sorts descending when specified', () => {
    const snap = makeSnapshot(tools);
    const result = sortByName(snap.tools, 'desc');
    expect(result.map(t => t.name)).toEqual(['node', 'git', 'docker', 'bun']);
  });
});

describe('sortByVersion', () => {
  it('places tools without version last when ascending', () => {
    const snap = makeSnapshot(tools);
    const result = sortByVersion(snap.tools, 'asc');
    const last = result[result.length - 1];
    expect(last.version).toBeUndefined();
  });

  it('places tools without version first when descending', () => {
    const snap = makeSnapshot(tools);
    const result = sortByVersion(snap.tools, 'desc');
    expect(result[0].version).toBeUndefined();
  });
});

describe('sortByCategory', () => {
  it('groups by category ascending', () => {
    const snap = makeSnapshot(tools);
    const result = sortByCategory(snap.tools, 'asc');
    expect(result[0].category).toBe('container');
  });
});

describe('sortSnapshot', () => {
  it('returns original and sorted arrays', () => {
    const snap = makeSnapshot(tools);
    const result = sortSnapshot(snap, { field: 'name' });
    expect(result.original).toHaveLength(tools.length);
    expect(result.sorted).toHaveLength(tools.length);
    expect(result.field).toBe('name');
    expect(result.order).toBe('asc');
  });

  it('does not mutate the original snapshot tools', () => {
    const snap = makeSnapshot(tools);
    const originalOrder = snap.tools.map(t => t.name);
    sortSnapshot(snap, { field: 'name' });
    expect(snap.tools.map(t => t.name)).toEqual(originalOrder);
  });
});

describe('formatSortResult', () => {
  it('includes sort field and order in output', () => {
    const snap = makeSnapshot(tools);
    const result = sortSnapshot(snap, { field: 'name', order: 'asc' });
    const output = formatSortResult(result);
    expect(output).toContain('name');
    expect(output).toContain('asc');
    expect(output).toContain('node');
  });

  it('shows no version label for tools without version', () => {
    const snap = makeSnapshot(tools);
    const result = sortSnapshot(snap, { field: 'name' });
    const output = formatSortResult(result);
    expect(output).toContain('no version');
  });
});
