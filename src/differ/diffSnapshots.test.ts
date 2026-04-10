import { diffSnapshots, formatDiff } from './diffSnapshots';
import { Snapshot } from '../detector/types';

const makeSnapshot = (id: string, tools: { name: string; version: string }[]): Snapshot => ({
  id,
  createdAt: new Date().toISOString(),
  tools: tools.map((t) => ({ name: t.name, version: t.version, path: '/usr/bin/' + t.name })),
  meta: { platform: 'linux', arch: 'x64', hostname: 'test' },
});

describe('diffSnapshots', () => {
  it('detects added tools', () => {
    const from = makeSnapshot('snap-1', [{ name: 'node', version: '18.0.0' }]);
    const to = makeSnapshot('snap-2', [
      { name: 'node', version: '18.0.0' },
      { name: 'bun', version: '1.0.0' },
    ]);
    const diff = diffSnapshots(from, to);
    expect(diff.hasChanges).toBe(true);
    const added = diff.diffs.find((d) => d.tool === 'bun');
    expect(added?.status).toBe('added');
    expect(added?.to).toBe('1.0.0');
  });

  it('detects removed tools', () => {
    const from = makeSnapshot('snap-1', [
      { name: 'node', version: '18.0.0' },
      { name: 'yarn', version: '1.22.0' },
    ]);
    const to = makeSnapshot('snap-2', [{ name: 'node', version: '18.0.0' }]);
    const diff = diffSnapshots(from, to);
    expect(diff.hasChanges).toBe(true);
    const removed = diff.diffs.find((d) => d.tool === 'yarn');
    expect(removed?.status).toBe('removed');
    expect(removed?.from).toBe('1.22.0');
  });

  it('detects changed versions', () => {
    const from = makeSnapshot('snap-1', [{ name: 'node', version: '18.0.0' }]);
    const to = makeSnapshot('snap-2', [{ name: 'node', version: '20.0.0' }]);
    const diff = diffSnapshots(from, to);
    expect(diff.hasChanges).toBe(true);
    const changed = diff.diffs.find((d) => d.tool === 'node');
    expect(changed?.status).toBe('changed');
    expect(changed?.from).toBe('18.0.0');
    expect(changed?.to).toBe('20.0.0');
  });

  it('reports no changes for identical snapshots', () => {
    const from = makeSnapshot('snap-1', [{ name: 'node', version: '18.0.0' }]);
    const to = makeSnapshot('snap-2', [{ name: 'node', version: '18.0.0' }]);
    const diff = diffSnapshots(from, to);
    expect(diff.hasChanges).toBe(false);
    expect(diff.diffs).toHaveLength(0);
  });

  it('formatDiff returns no-change message when nothing changed', () => {
    const from = makeSnapshot('snap-1', [{ name: 'node', version: '18.0.0' }]);
    const to = makeSnapshot('snap-2', [{ name: 'node', version: '18.0.0' }]);
    const diff = diffSnapshots(from, to);
    expect(formatDiff(diff)).toContain('No changes detected');
  });

  it('formatDiff includes symbols for changes', () => {
    const from = makeSnapshot('snap-1', [{ name: 'node', version: '18.0.0' }]);
    const to = makeSnapshot('snap-2', [{ name: 'node', version: '20.0.0' }]);
    const diff = diffSnapshots(from, to);
    const output = formatDiff(diff);
    expect(output).toContain('~');
    expect(output).toContain('18.0.0');
    expect(output).toContain('20.0.0');
  });

  it('formatDiff includes + and - symbols for added and removed tools', () => {
    const from = makeSnapshot('snap-1', [
      { name: 'node', version: '18.0.0' },
      { name: 'yarn', version: '1.22.0' },
    ]);
    const to = makeSnapshot('snap-2', [
      { name: 'node', version: '18.0.0' },
      { name: 'bun', version: '1.0.0' },
    ]);
    const diff = diffSnapshots(from, to);
    const output = formatDiff(diff);
    expect(output).toContain('+');
    expect(output).toContain('-');
  });
});
