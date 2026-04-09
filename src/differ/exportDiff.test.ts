import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exportDiff, exportDiffAsJson, exportDiffAsText } from './exportDiff';
import { diffSnapshots } from './diffSnapshots';
import { Snapshot } from '../detector/types';

const makeSnapshot = (id: string, tools: { name: string; version: string }[]): Snapshot => ({
  id,
  createdAt: new Date().toISOString(),
  tools: tools.map((t) => ({ name: t.name, version: t.version, path: '/usr/bin/' + t.name })),
  meta: { platform: 'linux', arch: 'x64', hostname: 'test' },
});

describe('exportDiff', () => {
  const from = makeSnapshot('snap-a', [{ name: 'node', version: '18.0.0' }]);
  const to = makeSnapshot('snap-b', [{ name: 'node', version: '20.0.0' }, { name: 'deno', version: '1.40.0' }]);

  it('exportDiffAsJson returns valid JSON', () => {
    const diff = diffSnapshots(from, to);
    const json = exportDiffAsJson(diff);
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed.fromSnapshot).toBe('snap-a');
    expect(parsed.toSnapshot).toBe('snap-b');
    expect(Array.isArray(parsed.diffs)).toBe(true);
  });

  it('exportDiffAsText returns human-readable output', () => {
    const diff = diffSnapshots(from, to);
    const text = exportDiffAsText(diff);
    expect(typeof text).toBe('string');
    expect(text).toContain('snap-a');
    expect(text).toContain('snap-b');
  });

  it('exportDiff defaults to text format', () => {
    const diff = diffSnapshots(from, to);
    const output = exportDiff(diff);
    expect(output).toContain('→');
  });

  it('exportDiff writes to file when outputPath is provided', () => {
    const diff = diffSnapshots(from, to);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-diff-'));
    const outFile = path.join(tmpDir, 'diff.json');
    exportDiff(diff, 'json', outFile);
    expect(fs.existsSync(outFile)).toBe(true);
    const content = fs.readFileSync(outFile, 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('exportDiff creates nested directories if needed', () => {
    const diff = diffSnapshots(from, to);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-diff-'));
    const outFile = path.join(tmpDir, 'nested', 'deep', 'diff.txt');
    exportDiff(diff, 'text', outFile);
    expect(fs.existsSync(outFile)).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });
});
