import { trimSnapshot, formatTrimResult, TrimOptions } from './trimSnapshot';
import { Snapshot } from '../detector/types';

function makeSnapshot(tools: { name: string; version?: string | null; category?: string }[]): Snapshot {
  return {
    id: 'test-snap',
    timestamp: '2024-01-01T00:00:00.000Z',
    tools: tools.map((t) => ({
      name: t.name,
      version: t.version ?? null,
      category: t.category ?? 'runtime',
      path: null,
    })),
  };
}

describe('trimSnapshot', () => {
  it('removes unversioned tools when removeUnversioned is true', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'bun', version: null },
      { name: 'deno', version: '' },
    ]);
    const result = trimSnapshot(snap, { removeUnversioned: true });
    expect(result.trimmed.tools).toHaveLength(1);
    expect(result.trimmed.tools[0].name).toBe('node');
    expect(result.removedCount).toBe(2);
  });

  it('removes tools by category', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0', category: 'runtime' },
      { name: 'git', version: '2.40.0', category: 'vcs' },
      { name: 'yarn', version: '1.22.0', category: 'package-manager' },
    ]);
    const result = trimSnapshot(snap, { removeCategories: ['vcs'] });
    expect(result.trimmed.tools.map((t) => t.name)).toEqual(['node', 'yarn']);
    expect(result.removedCount).toBe(1);
  });

  it('keeps only allowlisted tools', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'npm', version: '9.0.0' },
      { name: 'python', version: '3.11.0' },
    ]);
    const result = trimSnapshot(snap, { keepOnly: ['node', 'npm'] });
    expect(result.trimmed.tools).toHaveLength(2);
    expect(result.removedTools[0].name).toBe('python');
  });

  it('limits tools by maxTools', () => {
    const snap = makeSnapshot([
      { name: 'a', version: '1.0.0' },
      { name: 'b', version: '2.0.0' },
      { name: 'c', version: '3.0.0' },
      { name: 'd', version: '4.0.0' },
    ]);
    const result = trimSnapshot(snap, { maxTools: 2 });
    expect(result.trimmed.tools).toHaveLength(2);
    expect(result.removedCount).toBe(2);
  });

  it('applies multiple options in order', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0', category: 'runtime' },
      { name: 'git', version: null, category: 'vcs' },
      { name: 'npm', version: '9.0.0', category: 'package-manager' },
    ]);
    const result = trimSnapshot(snap, { removeUnversioned: true, removeCategories: ['vcs'] });
    expect(result.trimmed.tools.map((t) => t.name)).toEqual(['node', 'npm']);
  });

  it('returns unchanged snapshot when no options are set', () => {
    const snap = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const result = trimSnapshot(snap, {});
    expect(result.trimmed.tools).toHaveLength(1);
    expect(result.removedCount).toBe(0);
  });
});

describe('formatTrimResult', () => {
  it('formats the trim result summary', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'bun', version: null },
    ]);
    const result = trimSnapshot(snap, { removeUnversioned: true });
    const output = formatTrimResult(result);
    expect(output).toContain('Trim Summary');
    expect(output).toContain('Original tools : 2');
    expect(output).toContain('Remaining tools: 1');
    expect(output).toContain('Removed        : 1');
    expect(output).toContain('bun');
  });
});
