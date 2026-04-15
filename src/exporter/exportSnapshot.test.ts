import { exportSnapshot, exportAsJson, exportAsMarkdown, exportAsText } from './exportSnapshot';
import { Snapshot } from '../snapshot/snapshot';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'snap-test-001',
    createdAt: '2024-01-01T00:00:00.000Z',
    tools: [
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'git', version: '2.40.0', category: 'vcs' },
      { name: 'make', version: undefined, category: 'build' },
    ],
    metadata: {
      hostname: 'dev-machine',
      platform: 'linux',
      shell: '/bin/bash',
    },
    ...overrides,
  };
}

describe('exportAsJson', () => {
  it('returns valid JSON string', () => {
    const snap = makeSnapshot();
    const result = exportAsJson(snap);
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('snap-test-001');
  });

  it('includes all tools', () => {
    const snap = makeSnapshot();
    const result = JSON.parse(exportAsJson(snap));
    expect(result.tools).toHaveLength(3);
  });
});

describe('exportAsMarkdown', () => {
  it('includes snapshot id in output', () => {
    const snap = makeSnapshot();
    const result = exportAsMarkdown(snap);
    expect(result).toContain('snap-test-001');
  });

  it('renders a markdown table with tool rows', () => {
    const snap = makeSnapshot();
    const result = exportAsMarkdown(snap);
    expect(result).toContain('| node | 20.0.0 | runtime |');
    expect(result).toContain('| make | n/a | build |');
  });
});

describe('exportAsText', () => {
  it('lists tools with versions', () => {
    const snap = makeSnapshot();
    const result = exportAsText(snap);
    expect(result).toContain('node (v20.0.0)');
    expect(result).toContain('make (no version)');
  });
});

describe('exportSnapshot', () => {
  it('returns content for json format', () => {
    const snap = makeSnapshot();
    const result = exportSnapshot(snap, { format: 'json' });
    expect(result.format).toBe('json');
    expect(result.content).toContain('snap-test-001');
    expect(result.outputPath).toBeUndefined();
  });

  it('writes file to disk when outputPath is provided', () => {
    const snap = makeSnapshot();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-'));
    const outPath = path.join(tmpDir, 'output', 'snap.json');
    const result = exportSnapshot(snap, { format: 'json', outputPath: outPath });
    expect(fs.existsSync(outPath)).toBe(true);
    expect(result.outputPath).toBe(outPath);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('supports markdown format', () => {
    const snap = makeSnapshot();
    const result = exportSnapshot(snap, { format: 'markdown' });
    expect(result.content).toContain('## Tools');
  });

  it('supports text format', () => {
    const snap = makeSnapshot();
    const result = exportSnapshot(snap, { format: 'text' });
    expect(result.content).toContain('Stack Snapshot');
  });
});
