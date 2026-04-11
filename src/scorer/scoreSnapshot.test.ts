import { scoreSnapshot, formatScoreResult, ScoreResult } from './scoreSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'snap-001',
    createdAt: new Date().toISOString(),
    hostname: 'dev-machine',
    platform: 'linux',
    tools: [
      { name: 'node', version: '18.0.0', path: '/usr/bin/node' },
      { name: 'npm', version: '9.0.0', path: '/usr/bin/npm' },
      { name: 'git', version: '2.40.0', path: '/usr/bin/git' },
    ],
    ...overrides,
  };
}

describe('scoreSnapshot', () => {
  it('returns a score result with all categories', () => {
    const snap = makeSnapshot();
    const result = scoreSnapshot(snap);
    expect(result.breakdown).toHaveLength(3);
    expect(result.max).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('gives a high score to a complete snapshot', () => {
    const snap = makeSnapshot();
    const result = scoreSnapshot(snap);
    expect(result.percentage).toBeGreaterThanOrEqual(75);
    expect(['A', 'B']).toContain(result.grade);
  });

  it('penalizes missing versions', () => {
    const snap = makeSnapshot({
      tools: [
        { name: 'node', version: null, path: null },
        { name: 'npm', version: null, path: null },
      ],
    });
    const result = scoreSnapshot(snap);
    const vp = result.breakdown.find(b => b.category === 'Version Presence')!;
    expect(vp.score).toBe(0);
    expect(vp.notes.length).toBeGreaterThan(0);
  });

  it('penalizes missing metadata fields', () => {
    const snap = makeSnapshot({ hostname: undefined, platform: undefined });
    const result = scoreSnapshot(snap);
    const meta = result.breakdown.find(b => b.category === 'Metadata Completeness')!;
    expect(meta.score).toBeLessThan(meta.max);
  });

  it('grades F for very low percentage', () => {
    const snap = makeSnapshot({
      id: undefined,
      createdAt: undefined,
      hostname: undefined,
      platform: undefined,
      tools: [],
    });
    const result = scoreSnapshot(snap);
    expect(result.grade).toBe('F');
  });

  it('handles empty tools array without crashing', () => {
    const snap = makeSnapshot({ tools: [] });
    const result = scoreSnapshot(snap);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});

describe('formatScoreResult', () => {
  it('includes grade and percentage in output', () => {
    const snap = makeSnapshot();
    const result = scoreSnapshot(snap);
    const output = formatScoreResult(result);
    expect(output).toContain(`${result.percentage}%`);
    expect(output).toContain(`Grade: ${result.grade}`);
  });

  it('includes warning notes when present', () => {
    const snap = makeSnapshot({ hostname: undefined });
    const result = scoreSnapshot(snap);
    const output = formatScoreResult(result);
    expect(output).toContain('⚠');
  });
});
