import { splitSnapshot, formatSplitResult } from './splitSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeRichSnapshot(): Snapshot {
  return {
    id: 'rich-snap',
    createdAt: '2024-01-01T00:00:00.000Z',
    hostname: 'devbox',
    tools: [
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'deno', version: '1.40.0', category: 'runtime' },
      { name: 'bun', version: '1.0.0', category: 'runtime' },
      { name: 'git', version: '2.44.0', category: 'vcs' },
      { name: 'gh', version: '2.47.0', category: 'vcs' },
      { name: 'docker', version: '25.0.0', category: 'container' },
      { name: 'mystery', version: null, category: null },
    ],
  } as unknown as Snapshot;
}

describe('splitSnapshot integration', () => {
  it('round-trips: total tools equals sum of bucket tools', () => {
    const snap = makeRichSnapshot();
    const result = splitSnapshot(snap, { by: 'category' });
    const total = Object.values(result.buckets).reduce((sum, s) => sum + s.tools.length, 0);
    expect(total).toBe(snap.tools.length);
  });

  it('each bucket snapshot has a unique id', () => {
    const snap = makeRichSnapshot();
    const result = splitSnapshot(snap, { by: 'category' });
    const ids = Object.values(result.buckets).map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('formatSplitResult produces non-empty output for rich snapshot', () => {
    const snap = makeRichSnapshot();
    const result = splitSnapshot(snap, { by: 'versionPresence' });
    const output = formatSplitResult(result);
    expect(output.length).toBeGreaterThan(50);
    expect(output).toContain('versioned');
    expect(output).toContain('unversioned');
  });
});
