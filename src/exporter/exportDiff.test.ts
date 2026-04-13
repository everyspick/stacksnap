import { exportDiffAsMarkdown, exportFullDiff } from './exportDiff';
import { SnapshotDiff } from '../differ/diffSnapshots';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function makeDiff(): SnapshotDiff {
  return {
    added: [{ name: 'bun', version: '1.0.0', category: 'runtime' }],
    removed: [{ name: 'deno', version: '1.38.0', category: 'runtime' }],
    changed: [
      {
        tool: 'node',
        from: '18.0.0',
        to: '20.0.0',
      },
    ],
    unchanged: [{ name: 'git', version: '2.42.0', category: 'vcs' }],
  };
}

describe('exportDiffAsMarkdown', () => {
  it('includes added tools section', () => {
    const result = exportDiffAsMarkdown(makeDiff());
    expect(result).toContain('## Added');
    expect(result).toContain('bun');
  });

  it('includes removed tools section', () => {
    const result = exportDiffAsMarkdown(makeDiff());
    expect(result).toContain('## Removed');
    expect(result).toContain('deno');
  });

  it('includes changed tools with from/to versions', () => {
    const result = exportDiffAsMarkdown(makeDiff());
    expect(result).toContain('## Changed');
    expect(result).toContain('node');
    expect(result).toContain('18.0.0');
    expect(result).toContain('20.0.0');
  });

  it('shows unchanged count', () => {
    const result = exportDiffAsMarkdown(makeDiff());
    expect(result).toContain('1 unchanged');
  });
});

describe('exportFullDiff', () => {
  it('writes markdown diff to file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-diff-'));
    const outPath = path.join(tmpDir, 'diff.md');
    exportFullDiff(makeDiff(), outPath);
    const content = fs.readFileSync(outPath, 'utf-8');
    expect(content).toContain('## Added');
  });

  it('returns content string', () => {
    const result = exportFullDiff(makeDiff());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
