import { describe, it, expect } from 'vitest';
import { summarizeDiff, formatDiffSummary } from './diffSummary';
import type { SnapshotDiff } from '../differ/types';

function makeDiff(overrides: Partial<SnapshotDiff> = {}): SnapshotDiff {
  return {
    fromLabel: 'snap-a',
    toLabel: 'snap-b',
    added: [],
    removed: [],
    changed: [],
    unchanged: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('summarizeDiff', () => {
  it('returns zero counts for empty diff', () => {
    const summary = summarizeDiff(makeDiff());
    expect(summary.added).toBe(0);
    expect(summary.removed).toBe(0);
    expect(summary.changed).toBe(0);
    expect(summary.unchanged).toBe(0);
  });

  it('counts added tools correctly', () => {
    const diff = makeDiff({
      added: [{ name: 'node', status: 'added', toVersion: '20.0.0' }],
    });
    const summary = summarizeDiff(diff);
    expect(summary.added).toBe(1);
    expect(summary.totalTo).toBe(1);
    expect(summary.totalFrom).toBe(0);
  });

  it('counts removed tools correctly', () => {
    const diff = makeDiff({
      removed: [{ name: 'yarn', status: 'removed', fromVersion: '1.22.0' }],
    });
    const summary = summarizeDiff(diff);
    expect(summary.removed).toBe(1);
    expect(summary.totalFrom).toBe(1);
    expect(summary.totalTo).toBe(0);
  });

  it('counts changed tools correctly', () => {
    const diff = makeDiff({
      changed: [{ name: 'node', status: 'changed', fromVersion: '18.0.0', toVersion: '20.0.0' }],
    });
    const summary = summarizeDiff(diff);
    expect(summary.changed).toBe(1);
    expect(summary.totalFrom).toBe(1);
    expect(summary.totalTo).toBe(1);
  });
});

describe('formatDiffSummary', () => {
  it('includes label names', () => {
    const result = formatDiffSummary(makeDiff());
    expect(result).toContain('snap-a');
    expect(result).toContain('snap-b');
  });

  it('lists added tool names', () => {
    const diff = makeDiff({
      added: [{ name: 'bun', status: 'added', toVersion: '1.0.0' }],
    });
    const result = formatDiffSummary(diff);
    expect(result).toContain('+ bun @ 1.0.0');
  });

  it('lists changed tool versions', () => {
    const diff = makeDiff({
      changed: [{ name: 'node', status: 'changed', fromVersion: '18.0.0', toVersion: '20.0.0' }],
    });
    const result = formatDiffSummary(diff);
    expect(result).toContain('~ node: 18.0.0 → 20.0.0');
  });

  it('does not include sections with no entries', () => {
    const result = formatDiffSummary(makeDiff());
    expect(result).not.toContain('Added tools:');
    expect(result).not.toContain('Removed tools:');
  });
});
