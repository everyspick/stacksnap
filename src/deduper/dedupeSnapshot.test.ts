import { dedupeSnapshot, resolveDuplicate, formatDedupeResult } from './dedupeSnapshot';
import { Snapshot, ToolEntry } from '../detector/types';

function makeSnapshot(tools: ToolEntry[]): Snapshot {
  return {
    id: 'test-snap',
    createdAt: new Date().toISOString(),
    tools,
    meta: { hostname: 'localhost', platform: 'linux' },
  };
}

function makeTool(name: string, version?: string): ToolEntry {
  return { name, version: version ?? null, category: 'runtime' };
}

describe('resolveDuplicate', () => {
  it('returns the first entry with a version', () => {
    const entries = [makeTool('node'), makeTool('node', '18.0.0'), makeTool('node', '20.0.0')];
    const result = resolveDuplicate(entries);
    expect(result.version).toBe('18.0.0');
  });

  it('falls back to first entry when none have a version', () => {
    const entries = [makeTool('node'), makeTool('node')];
    const result = resolveDuplicate(entries);
    expect(result).toBe(entries[0]);
  });

  it('returns the single entry as-is', () => {
    const entries = [makeTool('node', '18.0.0')];
    expect(resolveDuplicate(entries)).toBe(entries[0]);
  });
});

describe('dedupeSnapshot', () => {
  it('removes exact duplicate tool names', () => {
    const snap = makeSnapshot([makeTool('node', '18.0.0'), makeTool('node', '18.0.0')]);
    const result = dedupeSnapshot(snap);
    expect(result.totalAfter).toBe(1);
    expect(result.removed).toHaveLength(1);
  });

  it('deduplicates case-insensitively', () => {
    const snap = makeSnapshot([makeTool('Node', '18.0.0'), makeTool('node', '20.0.0')]);
    const result = dedupeSnapshot(snap);
    expect(result.totalAfter).toBe(1);
    expect(result.kept[0].version).toBe('18.0.0');
  });

  it('keeps all tools when there are no duplicates', () => {
    const snap = makeSnapshot([makeTool('node', '18.0.0'), makeTool('python', '3.11')]);
    const result = dedupeSnapshot(snap);
    expect(result.totalAfter).toBe(2);
    expect(result.removed).toHaveLength(0);
  });

  it('prefers versioned entry over unversioned when deduplicating', () => {
    const snap = makeSnapshot([makeTool('git'), makeTool('git', '2.40.0')]);
    const result = dedupeSnapshot(snap);
    expect(result.kept[0].version).toBe('2.40.0');
  });

  it('returns a new snapshot object without mutating the original', () => {
    const snap = makeSnapshot([makeTool('node', '18.0.0'), makeTool('node', '20.0.0')]);
    const result = dedupeSnapshot(snap);
    expect(result.snapshot).not.toBe(snap);
    expect(snap.tools).toHaveLength(2);
  });
});

describe('formatDedupeResult', () => {
  it('reports no duplicates when none removed', () => {
    const snap = makeSnapshot([makeTool('node', '18.0.0')]);
    const result = dedupeSnapshot(snap);
    const output = formatDedupeResult(result);
    expect(output).toContain('No duplicates found');
  });

  it('lists removed duplicates', () => {
    const snap = makeSnapshot([makeTool('node', '18.0.0'), makeTool('node')]);
    const result = dedupeSnapshot(snap);
    const output = formatDedupeResult(result);
    expect(output).toContain('Removed 1 duplicate');
    expect(output).toContain('node');
  });

  it('shows before and after counts', () => {
    const snap = makeSnapshot([makeTool('node', '18.0.0'), makeTool('node', '20.0.0'), makeTool('git', '2.40.0')]);
    const result = dedupeSnapshot(snap);
    const output = formatDedupeResult(result);
    expect(output).toContain('3 → 2');
  });
});
