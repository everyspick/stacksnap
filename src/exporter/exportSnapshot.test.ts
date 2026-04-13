import { exportAsJson, exportAsMarkdown, exportAsText, exportSnapshot } from './exportSnapshot';
import { Snapshot } from '../detector/types';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function makeSnapshot(): Snapshot {
  return {
    id: 'snap-001',
    createdAt: 1700000000000,
    host: 'test-machine',
    tools: [
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'git', version: '2.42.0', category: 'vcs' },
      { name: 'docker', version: undefined, category: 'container' },
    ],
  };
}

describe('exportAsJson', () => {
  it('returns valid JSON string', () => {
    const result = exportAsJson(makeSnapshot());
    const parsed = JSON.parse(result);
    expect(parsed.tools).toHaveLength(3);
    expect(parsed.host).toBe('test-machine');
  });
});

describe('exportAsMarkdown', () => {
  it('includes markdown table header', () => {
    const result = exportAsMarkdown(makeSnapshot());
    expect(result).toContain('| Name | Version | Category |');
    expect(result).toContain('| node | 20.0.0 | runtime |');
    expect(result).toContain('| docker | n/a | container |');
  });

  it('includes snapshot metadata', () => {
    const result = exportAsMarkdown(makeSnapshot());
    expect(result).toContain('**Host:** test-machine');
    expect(result).toContain('# Stack Snapshot');
  });
});

describe('exportAsText', () => {
  it('formats tools as indented list', () => {
    const result = exportAsText(makeSnapshot());
    expect(result).toContain('  node (v20.0.0) [runtime]');
    expect(result).toContain('  docker (no version) [container]');
  });

  it('includes host info', () => {
    const result = exportAsText(makeSnapshot());
    expect(result).toContain('Host: test-machine');
  });
});

describe('exportSnapshot', () => {
  it('writes json to file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-'));
    const outPath = path.join(tmpDir, 'out.json');
    exportSnapshot(makeSnapshot(), 'json', outPath);
    const content = fs.readFileSync(outPath, 'utf-8');
    expect(JSON.parse(content).id).toBe('snap-001');
  });

  it('writes markdown to file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-'));
    const outPath = path.join(tmpDir, 'out.md');
    exportSnapshot(makeSnapshot(), 'markdown', outPath);
    const content = fs.readFileSync(outPath, 'utf-8');
    expect(content).toContain('# Stack Snapshot');
  });

  it('returns content without writing when no path given', () => {
    const result = exportSnapshot(makeSnapshot(), 'text');
    expect(result).toContain('Stack Snapshot');
  });
});
