import { addTags, removeTags, filterByTag, formatTags, hasTag, TaggedSnapshot } from './tagSnapshot';
import { Snapshot } from '../snapshot/snapshot';

const baseSnapshot: Snapshot = {
  id: 'snap-001',
  createdAt: '2024-01-01T00:00:00Z',
  tools: [
    { name: 'node', version: '20.0.0', path: '/usr/bin/node' },
  ],
  metadata: { hostname: 'dev-box', platform: 'linux', arch: 'x64' },
};

describe('addTags', () => {
  it('adds tags to a snapshot', () => {
    const tagged = addTags(baseSnapshot, ['frontend', 'ci']);
    expect(tagged.tags).toEqual(['frontend', 'ci']);
  });

  it('normalizes tags to lowercase and trims whitespace', () => {
    const tagged = addTags(baseSnapshot, ['  Frontend ', 'CI']);
    expect(tagged.tags).toEqual(['frontend', 'ci']);
  });

  it('deduplicates tags', () => {
    const tagged = addTags(baseSnapshot, ['node', 'node', 'ci']);
    expect(tagged.tags).toEqual(['node', 'ci']);
  });

  it('filters out empty strings', () => {
    const tagged = addTags(baseSnapshot, ['', '  ', 'valid']);
    expect(tagged.tags).toEqual(['valid']);
  });
});

describe('removeTags', () => {
  const tagged: TaggedSnapshot = { ...baseSnapshot, tags: ['frontend', 'ci', 'node'] };

  it('removes specified tags', () => {
    const result = removeTags(tagged, ['ci']);
    expect(result.tags).toEqual(['frontend', 'node']);
  });

  it('is case-insensitive when removing', () => {
    const result = removeTags(tagged, ['CI']);
    expect(result.tags).not.toContain('ci');
  });

  it('leaves snapshot unchanged if tag not present', () => {
    const result = removeTags(tagged, ['python']);
    expect(result.tags).toEqual(['frontend', 'ci', 'node']);
  });
});

describe('filterByTag', () => {
  const snapshots: TaggedSnapshot[] = [
    { ...baseSnapshot, id: 'a', tags: ['frontend', 'ci'] },
    { ...baseSnapshot, id: 'b', tags: ['backend'] },
    { ...baseSnapshot, id: 'c', tags: ['frontend', 'backend'] },
  ];

  it('returns only snapshots with the given tag', () => {
    const result = filterByTag(snapshots, 'frontend');
    expect(result.map((s) => s.id)).toEqual(['a', 'c']);
  });

  it('returns empty array when no match', () => {
    expect(filterByTag(snapshots, 'devops')).toEqual([]);
  });
});

describe('formatTags', () => {
  it('formats tags with hash prefix', () => {
    const tagged: TaggedSnapshot = { ...baseSnapshot, tags: ['node', 'ci'] };
    expect(formatTags(tagged)).toBe('Tags: #node  #ci');
  });

  it('shows (none) when tags are empty', () => {
    const tagged: TaggedSnapshot = { ...baseSnapshot, tags: [] };
    expect(formatTags(tagged)).toBe('Tags: (none)');
  });
});

describe('hasTag', () => {
  const tagged: TaggedSnapshot = { ...baseSnapshot, tags: ['ci', 'node'] };

  it('returns true if tag exists', () => {
    expect(hasTag(tagged, 'ci')).toBe(true);
  });

  it('returns false if tag does not exist', () => {
    expect(hasTag(tagged, 'python')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(hasTag(tagged, 'CI')).toBe(true);
  });
});
