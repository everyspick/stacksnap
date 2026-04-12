import { traceSnapshot, formatTraceReport } from './traceSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(tools: { name: string; version?: string }[]): Snapshot {
  return {
    id: 'snap-test-001',
    createdAt: '2024-01-01T00:00:00.000Z',
    hostname: 'test-host',
    platform: 'linux',
    tools: tools.map((t) => ({ name: t.name, version: t.version ?? null, path: null })),
  };
}

describe('traceSnapshot', () => {
  it('returns a trace report with one entry per tool', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'git', version: '2.39.1' },
    ]);
    const report = traceSnapshot(snap);
    expect(report.snapshotId).toBe('snap-test-001');
    expect(report.entries).toHaveLength(2);
    expect(report.summary.total).toBe(2);
  });

  it('assigns high confidence to full semver versions', () => {
    const snap = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const report = traceSnapshot(snap);
    expect(report.entries[0].confidence).toBe('high');
  });

  it('assigns low confidence when version is missing', () => {
    const snap = makeSnapshot([{ name: 'unknowntool' }]);
    const report = traceSnapshot(snap);
    expect(report.entries[0].confidence).toBe('low');
  });

  it('assigns medium confidence to partial versions', () => {
    const snap = makeSnapshot([{ name: 'go', version: '1.21' }]);
    const report = traceSnapshot(snap);
    expect(report.entries[0].confidence).toBe('medium');
  });

  it('detects config source for known config tools', () => {
    const snap = makeSnapshot([{ name: 'eslint', version: '8.0.0' }]);
    const report = traceSnapshot(snap);
    expect(report.entries[0].source).toBe('config');
  });

  it('computes summary counts correctly', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'go', version: '1.21' },
      { name: 'mystery' },
    ]);
    const report = traceSnapshot(snap);
    expect(report.summary.highConfidence).toBe(1);
    expect(report.summary.mediumConfidence).toBe(1);
    expect(report.summary.lowConfidence).toBe(1);
  });
});

describe('formatTraceReport', () => {
  it('returns a non-empty string containing the snapshot id', () => {
    const snap = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const report = traceSnapshot(snap);
    const output = formatTraceReport(report);
    expect(output).toContain('snap-test-001');
    expect(output).toContain('node');
    expect(output).toContain('18.0.0');
  });

  it('includes all tools in the formatted output', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '18.0.0' },
      { name: 'python', version: '3.11.0' },
    ]);
    const report = traceSnapshot(snap);
    const output = formatTraceReport(report);
    expect(output).toContain('node');
    expect(output).toContain('python');
  });
});
