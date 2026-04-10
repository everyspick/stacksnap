import { mergeSnapshots, formatMergeResult } from './mergeSnapshots';
import { Snapshot } from '../detector/types';

const makeSnapshot = (label: string, tools: Record<string, { version: string; path: string }>): Snapshot => ({
  label,
  createdAt: new Date().toISOString(),
  tools: Object.fromEntries(
    Object.entries(tools).map(([name, info]) => [name, { name, ...info }])
  ),
});

describe('mergeSnapshots', () => {
  it('merges two non-overlapping snapshots with union strategy', () => {
    const base = makeSnapshot('base', { node: { version: '18.0.0', path: '/usr/bin/node' } });
    const incoming = makeSnapshot('incoming', { python: { version: '3.11.0', path: '/usr/bin/python3' } });
    const { snapshot, conflicts } = mergeSnapshots(base, incoming, { strategy: 'union' });
    expect(Object.keys(snapshot.tools)).toContain('node');
    expect(Object.keys(snapshot.tools)).toContain('python');
    expect(conflicts).toHaveLength(0);
  });

  it('detects version conflicts and resolves with prefer-newer', () => {
    const base = makeSnapshot('base', { node: { version: '16.0.0', path: '/usr/bin/node' } });
    const incoming = makeSnapshot('incoming', { node: { version: '18.0.0', path: '/usr/bin/node' } });
    const { snapshot, conflicts } = mergeSnapshots(base, incoming, { strategy: 'prefer-newer' });
    expect(snapshot.tools['node'].version).toBe('18.0.0');
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].tool).toBe('node');
    expect(conflicts[0].base.version).toBe('16.0.0');
    expect(conflicts[0].incoming.version).toBe('18.0.0');
  });

  it('resolves conflicts with prefer-older strategy', () => {
    const base = makeSnapshot('base', { node: { version: '16.0.0', path: '/usr/bin/node' } });
    const incoming = makeSnapshot('incoming', { node: { version: '18.0.0', path: '/usr/bin/node' } });
    const { snapshot } = mergeSnapshots(base, incoming, { strategy: 'prefer-older' });
    expect(snapshot.tools['node'].version).toBe('16.0.0');
  });

  it('excludes tools not in both snapshots with intersection strategy', () => {
    const base = makeSnapshot('base', {
      node: { version: '18.0.0', path: '/usr/bin/node' },
      git: { version: '2.39.0', path: '/usr/bin/git' },
    });
    const incoming = makeSnapshot('incoming', {
      node: { version: '18.0.0', path: '/usr/bin/node' },
      python: { version: '3.11.0', path: '/usr/bin/python3' },
    });
    const { snapshot } = mergeSnapshots(base, incoming, { strategy: 'intersection' });
    expect(Object.keys(snapshot.tools)).toContain('node');
    expect(Object.keys(snapshot.tools)).not.toContain('git');
    expect(Object.keys(snapshot.tools)).not.toContain('python');
  });

  it('uses custom label when provided', () => {
    const base = makeSnapshot('base', { node: { version: '18.0.0', path: '/usr/bin/node' } });
    const incoming = makeSnapshot('incoming', { node: { version: '18.0.0', path: '/usr/bin/node' } });
    const { snapshot } = mergeSnapshots(base, incoming, { strategy: 'union', label: 'my-merge' });
    expect(snapshot.label).toBe('my-merge');
  });

  it('formats merge result with no conflicts', () => {
    const base = makeSnapshot('base', { node: { version: '18.0.0', path: '/usr/bin/node' } });
    const incoming = makeSnapshot('incoming', { node: { version: '18.0.0', path: '/usr/bin/node' } });
    const result = mergeSnapshots(base, incoming, { strategy: 'union' });
    const output = formatMergeResult(result);
    expect(output).toContain('No conflicts detected.');
  });

  it('formats merge result with conflicts', () => {
    const base = makeSnapshot('base', { node: { version: '16.0.0', path: '/usr/bin/node' } });
    const incoming = makeSnapshot('incoming', { node: { version: '18.0.0', path: '/usr/bin/node' } });
    const result = mergeSnapshots(base, incoming, { strategy: 'prefer-newer' });
    const output = formatMergeResult(result);
    expect(output).toContain('Conflicts (1)');
    expect(output).toContain('node');
    expect(output).toContain('16.0.0');
    expect(output).toContain('18.0.0');
  });
});
