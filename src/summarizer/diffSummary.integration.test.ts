import { describe, it, expect } from 'vitest';
import { diffSnapshots } from '../differ/diffSnapshots';
import { summarizeDiff, formatDiffSummary } from './diffSummary';
import type { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(label: string, tools: Snapshot['tools']): Snapshot {
  return {
    label,
    tools,
    createdAt: new Date().toISOString(),
    metadata: {},
  };
}

describe('diffSummary integration', () => {
  it('produces correct summary from real diff output', () => {
    const snapA = makeSnapshot('a', [
      { name: 'node', version: '18.0.0', category: 'runtime' },
      { name: 'yarn', version: '1.22.0', category: 'package-manager' },
    ]);
    const snapB = makeSnapshot('b', [
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'bun', version: '1.0.0', category: 'runtime' },
    ]);

    const diff = diffSnapshots(snapA, snapB);
    const summary = summarizeDiff(diff);

    expect(summary.changed).toBe(1);
    expect(summary.removed).toBe(1);
    expect(summary.added).toBe(1);
    expect(summary.totalFrom).toBe(2);
    expect(summary.totalTo).toBe(2);
  });

  it('formatDiffSummary output is non-empty string', () => {
    const snapA = makeSnapshot('v1', [
      { name: 'python', version: '3.10.0', category: 'runtime' },
    ]);
    const snapB = makeSnapshot('v2', [
      { name: 'python', version: '3.12.0', category: 'runtime' },
    ]);

    const diff = diffSnapshots(snapA, snapB);
    const output = formatDiffSummary(diff);

    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
    expect(output).toContain('python');
  });
});
