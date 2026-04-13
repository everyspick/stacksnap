import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  buildDiffFilename,
  renderDiff,
  exportDiffToFile,
  formatExportResult,
} from './diffExportManager';
import { SnapshotDiff } from '../differ/types';

function makeDiff(): SnapshotDiff {
  const base = {
    id: 'aaaabbbbccccdddd',
    label: 'snap',
    timestamp: new Date().toISOString(),
    tools: [],
    metadata: {},
  };
  return {
    fromSnapshot: { ...base, id: 'aaaabbbbccccdddd' },
    toSnapshot: { ...base, id: 'eeeeffff11112222' },
    added: [{ name: 'node', version: '20.0.0', category: 'runtime' }],
    removed: [],
    changed: [],
    unchanged: [],
  };
}

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-diffexport-'));
}

describe('buildDiffFilename', () => {
  it('generates correct filename for json format', () => {
    const diff = makeDiff();
    const name = buildDiffFilename(diff, 'json');
    expect(name).toBe('diff-aaaabbbb-eeeeffff.json');
  });

  it('generates correct filename for markdown format', () => {
    const diff = makeDiff();
    const name = buildDiffFilename(diff, 'markdown');
    expect(name).toBe('diff-aaaabbbb-eeeeffff.md');
  });

  it('generates correct filename for text format', () => {
    const diff = makeDiff();
    const name = buildDiffFilename(diff, 'text');
    expect(name).toBe('diff-aaaabbbb-eeeeffff.txt');
  });
});

describe('renderDiff', () => {
  it('returns a non-empty string for json format', () => {
    const result = renderDiff(makeDiff(), 'json');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('returns a non-empty string for text format', () => {
    const result = renderDiff(makeDiff(), 'text');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns a non-empty string for markdown format', () => {
    const result = renderDiff(makeDiff(), 'markdown');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('exportDiffToFile', () => {
  it('writes the diff file and returns correct metadata', () => {
    const dir = makeTempDir();
    const diff = makeDiff();
    const result = exportDiffToFile(diff, { format: 'json', outputDir: dir });
    expect(fs.existsSync(result.outputPath)).toBe(true);
    expect(result.format).toBe('json');
    expect(result.size).toBeGreaterThan(0);
  });

  it('creates outputDir if it does not exist', () => {
    const dir = path.join(makeTempDir(), 'nested', 'subdir');
    const diff = makeDiff();
    exportDiffToFile(diff, { format: 'text', outputDir: dir });
    expect(fs.existsSync(dir)).toBe(true);
  });

  it('respects custom filename option', () => {
    const dir = makeTempDir();
    const diff = makeDiff();
    const result = exportDiffToFile(diff, {
      format: 'markdown',
      outputDir: dir,
      filename: 'custom-diff.md',
    });
    expect(result.outputPath).toContain('custom-diff.md');
  });
});

describe('formatExportResult', () => {
  it('includes format, path and size in output', () => {
    const result = { format: 'json' as const, outputPath: '/tmp/diff.json', size: 2048 };
    const text = formatExportResult(result);
    expect(text).toContain('JSON');
    expect(text).toContain('/tmp/diff.json');
    expect(text).toContain('KB');
  });
});
