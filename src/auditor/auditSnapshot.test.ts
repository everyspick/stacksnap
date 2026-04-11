import { auditSnapshot, formatAuditResult } from './auditSnapshot';
import { Snapshot } from '../detector/types';

function makeSnapshot(tools: { name: string; version?: string }[]): Snapshot {
  return {
    id: 'test-snapshot',
    createdAt: new Date().toISOString(),
    tools: tools.map((t) => ({ name: t.name, version: t.version ?? null, path: '/usr/bin/' + t.name })),
    metadata: { hostname: 'localhost', platform: 'linux', arch: 'x64' },
  };
}

describe('auditSnapshot', () => {
  it('returns no findings for a clean snapshot', () => {
    const snapshot = makeSnapshot([
      { name: 'node', version: '20.0.0' },
      { name: 'git', version: '2.40.0' },
      { name: 'docker', version: '24.0.0' },
    ]);
    const result = auditSnapshot(snapshot);
    const nonInfo = result.findings.filter((f) => f.severity !== 'info');
    expect(nonInfo).toHaveLength(0);
  });

  it('flags EOL node version as critical', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '12.0.0' }]);
    const result = auditSnapshot(snapshot);
    const critical = result.findings.filter((f) => f.severity === 'critical');
    expect(critical).toHaveLength(1);
    expect(critical[0].tool).toBe('node');
  });

  it('flags missing version as warning', () => {
    const snapshot = makeSnapshot([{ name: 'node' }]);
    const result = auditSnapshot(snapshot);
    const warnings = result.findings.filter((f) => f.severity === 'warning');
    expect(warnings.some((f) => f.tool === 'node')).toBe(true);
  });

  it('flags missing recommended tools as info', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const result = auditSnapshot(snapshot);
    const infos = result.findings.filter((f) => f.severity === 'info');
    expect(infos.some((f) => f.tool === 'git')).toBe(true);
    expect(infos.some((f) => f.tool === 'docker')).toBe(true);
  });

  it('counts passed, warned, and critical correctly', () => {
    const snapshot = makeSnapshot([
      { name: 'node', version: '12.0.0' },
      { name: 'git' },
      { name: 'docker', version: '24.0.0' },
    ]);
    const result = auditSnapshot(snapshot);
    expect(result.critical).toBeGreaterThanOrEqual(1);
    expect(result.warned).toBeGreaterThanOrEqual(1);
  });

  it('formatAuditResult returns a string with findings', () => {
    const snapshot = makeSnapshot([{ name: 'node', version: '12.0.0' }]);
    const result = auditSnapshot(snapshot);
    const output = formatAuditResult(result);
    expect(typeof output).toBe('string');
    expect(output).toContain('CRITICAL');
    expect(output).toContain('node');
  });

  it('formatAuditResult shows no issues message when clean', () => {
    const snapshot = makeSnapshot([
      { name: 'node', version: '20.0.0' },
      { name: 'git', version: '2.40.0' },
      { name: 'docker', version: '24.0.0' },
    ]);
    const result = auditSnapshot(snapshot);
    const output = formatAuditResult(result);
    expect(output).toContain('No issues found');
  });
});
