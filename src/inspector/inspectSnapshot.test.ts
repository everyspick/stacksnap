import { inspectSnapshot, formatInspectionReport } from './inspectSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(tools: { name: string; version?: string }[]): Snapshot {
  return {
    id: 'test-snapshot',
    createdAt: new Date().toISOString(),
    tools: tools.map((t) => ({ name: t.name, version: t.version ?? null, path: null })),
    meta: {},
  } as unknown as Snapshot;
}

describe('inspectSnapshot', () => {
  it('returns a report with results for each tool and rule', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const report = inspectSnapshot(snapshot);
    expect(report.snapshotId).toBe('test-snapshot');
    expect(report.results.length).toBeGreaterThan(0);
  });

  it('flags missing version as a warning', () => {
    const snapshot = makeSnapshot([{ name: 'git' }]);
    const report = inspectSnapshot(snapshot);
    const versionResult = report.results.find(
      (r) => r.ruleId === 'version-present' && r.tool === 'git'
    );
    expect(versionResult).toBeDefined();
    expect(versionResult!.passed).toBe(false);
    expect(versionResult!.severity).toBe('warning');
  });

  it('flags old Node.js version as error', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '12.0.0' }]);
    const report = inspectSnapshot(snapshot);
    const nodeResult = report.results.find(
      (r) => r.ruleId === 'no-ancient-node' && r.tool === 'node'
    );
    expect(nodeResult).toBeDefined();
    expect(nodeResult!.passed).toBe(false);
    expect(nodeResult!.severity).toBe('error');
  });

  it('passes Node.js v18 for no-ancient-node rule', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '18.2.0' }]);
    const report = inspectSnapshot(snapshot);
    const nodeResult = report.results.find(
      (r) => r.ruleId === 'no-ancient-node' && r.tool === 'node'
    );
    expect(nodeResult!.passed).toBe(true);
  });

  it('counts pass, warn, error, info correctly', () => {
    const snapshot = makeSnapshot([
      { name: 'node', version: '12.0.0' },
      { name: 'git' },
    ]);
    const report = inspectSnapshot(snapshot);
    expect(report.errorCount).toBeGreaterThanOrEqual(1);
    expect(report.warnCount).toBeGreaterThanOrEqual(1);
  });

  it('formats a clean report when all checks pass', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '18.0.0' }]);
    const report = inspectSnapshot(snapshot);
    // force all passed
    report.results.forEach((r) => (r.passed = true));
    report.passCount = report.results.length;
    report.errorCount = 0;
    report.warnCount = 0;
    report.infoCount = 0;
    const text = formatInspectionReport(report);
    expect(text).toContain('All checks passed');
  });

  it('formatInspectionReport includes failed rule messages', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '10.0.0' }]);
    const report = inspectSnapshot(snapshot);
    const text = formatInspectionReport(report);
    expect(text).toContain('no-ancient-node');
    expect(text).toContain('❌');
  });
});
