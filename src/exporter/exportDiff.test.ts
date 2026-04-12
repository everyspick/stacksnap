import { exportDiffAsMarkdown, exportFullDiff } from './exportDiff';
import { DiffResult } from '../differ/diffSnapshots';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function makeDiff(overrides: Partial<DiffResult> = {}): DiffResult {
  return {
    snapshotA: 'snap-a',
    snapshotB: 'snap-b',
    added: [],
    removed: [],
    changed: [],
    unchanged: [],
    ...overrides,
  };
}

describe('exportDiffAsMarkdown', () => {
  it('renders header with snapshot names', () => {
    const result = exportDiffAsMarkdown(makeDiff());
    expect(result).toContain('**From:** snap-a');
    expect(result).toContain('**To:** snap-b');
  });

  it('shows no differences message when empty', () => {
    const result = exportDiffAsMarkdown(makeDiff());
    expect(result).toContain('_No differences found._');
  });

  it('lists added tools', () => {
    const diff = makeDiff({ added: [{ name: 'node', version: '20.0.0' }] });
    const result = exportDiffAsMarkdown(diff);
    expect(result).toContain('## Added Tools');
    expect(result).toContain('`node` 20.0.0');
  });

  it('lists removed tools', () => {
    const diff = makeDiff({ removed: [{ name: 'yarn', version: '1.22.0' }] });
    const result = exportDiffAsMarkdown(diff);
    expect(result).toContain('## Removed Tools');
    expect(result).toContain('`yarn`');
  });

  it('lists changed tools with version arrows', () => {
    const diff = makeDiff({
      changed: [{ tool: 'npm', fromVersion: '8.0.0', toVersion: '10.0.0' }],
    });
    const result = exportDiffAsMarkdown(diff);
    expect(result).toContain('## Changed Tools');
    expect(result).toContain('`npm`: 8.0.0 → 10.0.0');
  });
});

describe('exportFullDiff', () => {
  it('returns json format', () => {
    const diff = makeDiff({ added: [{ name: 'go', version: '1.21' }] });
    const result = exportFullDiff(diff, { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed.added).toHaveLength(1);
  });

  it('returns markdown format', () => {
    const diff = makeDiff();
    const result = exportFullDiff(diff, { format: 'markdown' });
    expect(result).toContain('# Stack Diff Report');
  });

  it('writes to file when outputPath provided', () => {
    const tmpFile = path.join(os.tmpdir(), `stacksnap-diff-test-${Date.now()}.md`);
    const diff = makeDiff();
    exportFullDiff(diff, { format: 'markdown', outputPath: tmpFile });
    expect(fs.existsSync(tmpFile)).toBe(true);
    fs.unlinkSync(tmpFile);
  });
});
