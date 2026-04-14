import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  batchExport,
  buildFilename,
  renderForFormat,
  formatBatchResult,
} from './batchExport';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(name: string): Snapshot {
  return {
    id: `id-${name}`,
    createdAt: '2024-01-01T00:00:00.000Z',
    tools: [
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'git', version: '2.40.0', category: 'vcs' },
    ],
    metadata: { hostname: 'host', platform: 'linux', shell: '/bin/bash' },
  };
}

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-batch-'));
}

describe('buildFilename', () => {
  it('builds json filename', () => {
    expect(buildFilename('snap1', 'json')).toBe('snap1.json');
  });

  it('builds markdown filename', () => {
    expect(buildFilename('snap1', 'markdown')).toBe('snap1.md');
  });

  it('builds text filename', () => {
    expect(buildFilename('snap1', 'text')).toBe('snap1.txt');
  });

  it('applies prefix', () => {
    expect(buildFilename('snap1', 'json', 'export')).toBe('export_snap1.json');
  });
});

describe('renderForFormat', () => {
  const snap = makeSnapshot('test');

  it('renders json', () => {
    const result = renderForFormat(snap, 'json');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('renders markdown', () => {
    const result = renderForFormat(snap, 'markdown');
    expect(result).toContain('#');
  });

  it('renders text', () => {
    const result = renderForFormat(snap, 'text');
    expect(result).toBeTruthy();
  });

  it('throws on unknown format', () => {
    expect(() => renderForFormat(snap, 'xml' as any)).toThrow('Unsupported format');
  });
});

describe('batchExport', () => {
  it('exports multiple snapshots to files', () => {
    const dir = makeTempDir();
    const snapshots = [
      { name: 'alpha', snapshot: makeSnapshot('alpha') },
      { name: 'beta', snapshot: makeSnapshot('beta') },
    ];
    const result = batchExport({ snapshots, outputDir: dir, format: 'json' });
    expect(result.exported).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
    for (const f of result.exported) {
      expect(fs.existsSync(f)).toBe(true);
    }
  });

  it('creates outputDir if missing', () => {
    const dir = path.join(makeTempDir(), 'nested', 'dir');
    const result = batchExport({
      snapshots: [{ name: 'snap', snapshot: makeSnapshot('snap') }],
      outputDir: dir,
      format: 'text',
    });
    expect(fs.existsSync(dir)).toBe(true);
    expect(result.exported).toHaveLength(1);
  });

  it('records failures gracefully', () => {
    const dir = makeTempDir();
    const badSnapshot = null as any;
    const result = batchExport({
      snapshots: [{ name: 'bad', snapshot: badSnapshot }],
      outputDir: dir,
      format: 'json',
    });
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].name).toBe('bad');
  });
});

describe('formatBatchResult', () => {
  it('formats a successful result', () => {
    const result = {
      exported: ['/tmp/a.json', '/tmp/b.json'],
      failed: [],
      outputDir: '/tmp',
    };
    const text = formatBatchResult(result);
    expect(text).toContain('Exported: 2');
    expect(text).toContain('a.json');
    expect(text).toContain('b.json');
  });

  it('includes failures in output', () => {
    const result = {
      exported: [],
      failed: [{ name: 'snap', error: 'oops' }],
      outputDir: '/tmp',
    };
    const text = formatBatchResult(result);
    expect(text).toContain('Failed: 1');
    expect(text).toContain('snap: oops');
  });
});
