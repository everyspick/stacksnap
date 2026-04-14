import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { batchExport, formatBatchResult } from './batchExport';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(name: string): Snapshot {
  return {
    id: `id-${name}`,
    createdAt: new Date().toISOString(),
    tools: [
      { name: 'node', version: '20.1.0', category: 'runtime' },
      { name: 'npm', version: '10.2.0', category: 'package-manager' },
      { name: 'git', version: '2.44.0', category: 'vcs' },
    ],
    metadata: { hostname: 'devbox', platform: 'darwin', shell: '/bin/zsh' },
  };
}

describe('batchExport integration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-batch-int-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('exports all formats for multiple snapshots', () => {
    const snapshots = ['dev', 'staging', 'prod'].map((n) => ({
      name: n,
      snapshot: makeSnapshot(n),
    }));

    for (const format of ['json', 'markdown', 'text'] as const) {
      const outDir = path.join(tmpDir, format);
      const result = batchExport({ snapshots, outputDir: outDir, format });
      expect(result.exported).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
      const summary = formatBatchResult(result);
      expect(summary).toContain('Exported: 3');
    }
  });

  it('written json files are valid and contain tool data', () => {
    const outDir = path.join(tmpDir, 'json-check');
    const snap = makeSnapshot('ci');
    batchExport({ snapshots: [{ name: 'ci', snapshot: snap }], outputDir: outDir, format: 'json' });
    const file = path.join(outDir, 'ci.json');
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
    expect(parsed.tools).toBeDefined();
    expect(parsed.tools.length).toBeGreaterThan(0);
  });
});
