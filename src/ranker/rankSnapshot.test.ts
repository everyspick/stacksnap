import { rankSnapshot, formatRankResult, RankResult } from './rankSnapshot';
import { Snapshot } from '../detector/types';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'test-snap',
    label: 'test',
    createdAt: new Date().toISOString(),
    tools: [
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'git', version: '2.41.0', category: 'vcs' },
      { name: 'unknown-tool', version: undefined, category: undefined },
    ],
    ...overrides,
  };
}

describe('rankSnapshot', () => {
  it('ranks by score by default, highest first', () => {
    const snap = makeSnapshot();
    const result = rankSnapshot(snap);
    expect(result.strategy).toBe('score');
    expect(result.total).toBe(3);
    expect(result.ranked[0].rank).toBe(1);
    expect(result.ranked[0].score).toBeGreaterThanOrEqual(result.ranked[1].score);
  });

  it('assigns rank 1 to best-scoring tool', () => {
    const snap = makeSnapshot();
    const result = rankSnapshot(snap);
    const top = result.ranked[0];
    expect(top.rank).toBe(1);
    expect(top.tool.version).toBeDefined();
  });

  it('ranks alphabetically when strategy is alpha', () => {
    const snap = makeSnapshot();
    const result = rankSnapshot(snap, 'alpha');
    const names = result.ranked.map((e) => e.tool.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('ranks by category when strategy is category', () => {
    const snap = makeSnapshot();
    const result = rankSnapshot(snap, 'category');
    const cats = result.ranked.map((e) => e.tool.category ?? '');
    const sorted = [...cats].sort((a, b) => a.localeCompare(b));
    expect(cats).toEqual(sorted);
  });

  it('tool with no version scores lower than tool with version', () => {
    const snap = makeSnapshot();
    const result = rankSnapshot(snap, 'score');
    const unversioned = result.ranked.find((e) => !e.tool.version);
    const versioned = result.ranked.find((e) => !!e.tool.version);
    expect(versioned!.score).toBeGreaterThan(unversioned!.score);
  });

  it('returns reasons for each entry', () => {
    const snap = makeSnapshot();
    const result = rankSnapshot(snap);
    for (const entry of result.ranked) {
      expect(entry.reasons.length).toBeGreaterThan(0);
    }
  });

  it('handles empty tools array', () => {
    const snap = makeSnapshot({ tools: [] });
    const result = rankSnapshot(snap);
    expect(result.ranked).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe('formatRankResult', () => {
  it('includes strategy and total in output', () => {
    const snap = makeSnapshot();
    const result = rankSnapshot(snap);
    const output = formatRankResult(result);
    expect(output).toContain('score');
    expect(output).toContain('3');
  });

  it('includes tool names in output', () => {
    const snap = makeSnapshot();
    const result = rankSnapshot(snap);
    const output = formatRankResult(result);
    expect(output).toContain('node');
    expect(output).toContain('git');
  });

  it('includes rank numbers in output', () => {
    const snap = makeSnapshot();
    const result = rankSnapshot(snap);
    const output = formatRankResult(result);
    expect(output).toContain('#1');
    expect(output).toContain('#2');
  });
});
