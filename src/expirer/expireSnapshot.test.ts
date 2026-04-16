import { expireSnapshot, formatExpiryResult } from './expireSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function daysAgo(n: number): string {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'test-snap',
    createdAt: new Date().toISOString(),
    hostname: 'host',
    tools: [
      { name: 'node', version: '18.0.0', category: 'runtime', detectedAt: daysAgo(10) },
      { name: 'python', version: '3.11.0', category: 'runtime', detectedAt: daysAgo(40) },
      { name: 'git', version: '2.40.0', category: 'vcs', detectedAt: daysAgo(5) },
    ],
    ...overrides,
  } as Snapshot;
}

describe('expireSnapshot', () => {
  it('removes tools older than maxAgeDays', () => {
    const snap = makeSnapshot();
    const { result } = expireSnapshot(snap, { maxAgeDays: 30 });
    expect(result.expired).toContain('python');
    expect(result.kept).toContain('node');
    expect(result.kept).toContain('git');
  });

  it('respects applyToCategories filter', () => {
    const snap = makeSnapshot();
    const { snapshot, result } = expireSnapshot(snap, {
      maxAgeDays: 30,
      applyToCategories: ['vcs'],
    });
    expect(result.expired).toHaveLength(0);
    expect(snapshot.tools).toHaveLength(3);
  });

  it('returns correct totalChecked', () => {
    const snap = makeSnapshot();
    const { result } = expireSnapshot(snap, { maxAgeDays: 30 });
    expect(result.totalChecked).toBe(3);
  });

  it('keeps all tools if none are expired', () => {
    const snap = makeSnapshot();
    const { result } = expireSnapshot(snap, { maxAgeDays: 100 });
    expect(result.expired).toHaveLength(0);
    expect(result.kept).toHaveLength(3);
  });
});

describe('formatExpiryResult', () => {
  it('formats result as readable text', () => {
    const snap = makeSnapshot();
    const { result } = expireSnapshot(snap, { maxAgeDays: 30 });
    const text = formatExpiryResult(result);
    expect(text).toContain('Expiry Check');
    expect(text).toContain('python');
  });
});
