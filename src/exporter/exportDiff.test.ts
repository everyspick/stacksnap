import { exportDiffAsMarkdown, exportFullDiff } from './exportDiff';
import { SnapshotDiff } from '../differ/types';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function makeDiff(overrides: Partial<SnapshotDiff> = {}): SnapshotDiff {
  return {
    fromId: 'snap-001',
    toId: 'snap-002',
    generatedAt: '2024-06-01T00:00:00.000Z',
    entries: [
      { tool: 'node', type: 'changed', oldVersion: '18.0.0', newVersion: '20.0.0' },
      { tool: 'git', type: 'unchanged', oldVersion: '2.40.0', newVersion: '2.40.0' },
      { tool: 'deno', type: 'added', newVersion: '1.43.0' },
      { tool: 'yarn', type: 'removed', oldVersion: '1.22.0' },
    ],
    ...overrides,
  };
}

describe('exportDiffAsMarkdown', () => {
  it('includes from and to ids', () => {
    const diff = makeDiff();
    const result = exportDiffAsMarkdown(diff);
    expect(result).toContain('snap-001');
    expect(result).toContain('snap-002');
  });

  it('shows added, removed, and changed entries', () => {
    const diff = makeDiff();
    const result = exportDiffAsMarkdown(diff);
    expect(result).toContain('deno');
    expect(result).toContain('yarn');
    expect(result).toContain('node');
  });

  it('excludes unchanged entries from table', () => {
    const diff = makeDiff();
    const result = exportDiffAsMarkdown(diff);
    const lines = result.split('\n').filter(l => l.includes('git'));
    expect(lines).toHaveLength(0);
  });

  it('shows no-changes message when all entries unchanged', () => {
    const diff = makeDiff({
      entries: [
        { tool: 'node', type: 'unchanged', oldVersion: '20.0.0', newVersion: '20.0.0' },
      ],
    });
    const result = exportDiffAsMarkdown(diff);
    expect(result).toContain('No changes detected');
  });
});

describe('exportFullDiff', () => {
  it('returns JSON string for json format', () => {
    const diff = makeDiff();
    const result = exportFullDiff(diff, 'json');
    const parsed = JSON.parse(result);
    expect(parsed.fromId).toBe('snap-001');
  });

  it('returns markdown string for markdown format', () => {
    const diff = makeDiff();
    const result = exportFullDiff(diff, 'markdown');
    expect(result).toContain('# Snapshot Diff');
  });

  it('writes file to disk when outputPath provided', () => {
    const diff = makeDiff();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-diff-'));
    const outPath = path.join(tmpDir, 'diff.md');
    exportFullDiff(diff, 'markdown', outPath);
    expect(fs.existsSync(outPath)).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });
});
