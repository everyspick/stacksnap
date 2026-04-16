import { stampSnapshot, buildStampLabel, formatStampResult } from './stampSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'test-id',
    createdAt: '2024-01-01T00:00:00.000Z',
    tools: [],
    metadata: {},
    ...overrides,
  };
}

const fixedDate = new Date('2024-06-15T12:00:00.000Z');

describe('buildStampLabel', () => {
  it('builds a label with prefix and date', () => {
    const label = buildStampLabel('snap', fixedDate);
    expect(label).toBe('snap-2024-06-15T12-00-00');
  });

  it('uses default prefix', () => {
    const label = buildStampLabel('release', fixedDate);
    expect(label).toContain('release-');
  });
});

describe('stampSnapshot', () => {
  it('adds a label and stampedAt to metadata', () => {
    const snap = makeSnapshot();
    const result = stampSnapshot(snap, 'snap', fixedDate);
    expect(result.stamped).toBe(true);
    expect(result.newLabel).toBe('snap-2024-06-15T12-00-00');
    expect(result.snapshot.metadata.label).toBe('snap-2024-06-15T12-00-00');
    expect(result.snapshot.metadata.stampedAt).toBe(fixedDate.toISOString());
  });

  it('preserves previous label', () => {
    const snap = makeSnapshot({ metadata: { label: 'old-label' } });
    const result = stampSnapshot(snap, 'snap', fixedDate);
    expect(result.previousLabel).toBe('old-label');
  });

  it('reports no previous label when none exists', () => {
    const snap = makeSnapshot();
    const result = stampSnapshot(snap, 'snap', fixedDate);
    expect(result.previousLabel).toBeUndefined();
  });

  it('does not mutate original snapshot', () => {
    const snap = makeSnapshot();
    stampSnapshot(snap, 'snap', fixedDate);
    expect(snap.metadata.label).toBeUndefined();
  });
});

describe('formatStampResult', () => {
  it('includes new label in output', () => {
    const snap = makeSnapshot();
    const result = stampSnapshot(snap, 'snap', fixedDate);
    const text = formatStampResult(result);
    expect(text).toContain('snap-2024-06-15T12-00-00');
  });

  it('shows previous label when present', () => {
    const snap = makeSnapshot({ metadata: { label: 'old' } });
    const result = stampSnapshot(snap, 'snap', fixedDate);
    const text = formatStampResult(result);
    expect(text).toContain('Previous label: old');
  });

  it('shows no previous label message', () => {
    const snap = makeSnapshot();
    const result = stampSnapshot(snap, 'snap', fixedDate);
    const text = formatStampResult(result);
    expect(text).toContain('No previous label.');
  });
});
