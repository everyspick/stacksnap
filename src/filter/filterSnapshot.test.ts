import { filterSnapshot, filterByTools, filterByVersionPresence, filterByNamePattern } from './filterSnapshot';
import { Snapshot } from '../snapshot/snapshot';

const makeSnapshot = (tools: { name: string; version?: string }[]): Snapshot => ({
  id: 'test-id',
  createdAt: new Date().toISOString(),
  tools: tools.map((t) => ({ name: t.name, version: t.version ?? null, path: null })),
});

describe('filterByTools', () => {
  it('returns only tools matching the given names (case-insensitive)', () => {
    const snapshot = makeSnapshot([{ name: 'node' }, { name: 'git' }, { name: 'docker' }]);
    const result = filterByTools(snapshot, ['NODE', 'docker']);
    expect(result.tools.map((t) => t.name)).toEqual(['node', 'docker']);
  });

  it('returns empty tools array when no names match', () => {
    const snapshot = makeSnapshot([{ name: 'node' }]);
    const result = filterByTools(snapshot, ['python']);
    expect(result.tools).toHaveLength(0);
  });
});

describe('filterByVersionPresence', () => {
  it('returns only tools with a version when hasVersion is true', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '18.0.0' }, { name: 'git' }]);
    const result = filterByVersionPresence(snapshot, true);
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe('node');
  });

  it('returns only tools without a version when hasVersion is false', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '18.0.0' }, { name: 'git' }]);
    const result = filterByVersionPresence(snapshot, false);
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe('git');
  });
});

describe('filterByNamePattern', () => {
  it('filters tools by regex pattern', () => {
    const snapshot = makeSnapshot([{ name: 'node' }, { name: 'nodemon' }, { name: 'git' }]);
    const result = filterByNamePattern(snapshot, /^node/);
    expect(result.tools.map((t) => t.name)).toEqual(['node', 'nodemon']);
  });

  it('filters tools by string pattern (case-insensitive)', () => {
    const snapshot = makeSnapshot([{ name: 'Docker' }, { name: 'docker-compose' }, { name: 'git' }]);
    const result = filterByNamePattern(snapshot, 'docker');
    expect(result.tools).toHaveLength(2);
  });
});

describe('filterSnapshot', () => {
  it('applies multiple filters in combination', () => {
    const snapshot = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'nodemon' },
      { name: 'git', version: '2.39.0' },
    ]);
    const result = filterSnapshot(snapshot, { namePattern: 'node', hasVersion: true });
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe('node');
  });

  it('returns a snapshot with unchanged metadata', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const result = filterSnapshot(snapshot, { tools: ['node'] });
    expect(result.id).toBe(snapshot.id);
    expect(result.createdAt).toBe(snapshot.createdAt);
  });

  it('does not mutate the original snapshot', () => {
    const snapshot = makeSnapshot([{ name: 'node' }, { name: 'git' }]);
    filterSnapshot(snapshot, { tools: ['node'] });
    expect(snapshot.tools).toHaveLength(2);
  });
});
