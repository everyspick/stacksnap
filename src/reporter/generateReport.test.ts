import { generateReport } from './generateReport';
import { formatReport } from './formatReport';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(overrides?: Partial<Snapshot>): Snapshot {
  return {
    id: 'snap-001',
    label: 'test-snap',
    createdAt: '2024-01-01T00:00:00.000Z',
    tools: [
      { name: 'node', version: '20.0.0', path: '/usr/bin/node' },
      { name: 'git',  version: '2.42.0', path: '/usr/bin/git' },
    ],
    metadata: { os: 'linux', arch: 'x64', shell: 'bash' },
    tags: ['ci'],
    ...overrides,
  };
}

describe('generateReport', () => {
  it('always includes summary section by default', () => {
    const report = generateReport(makeSnapshot(), { format: 'text' });
    expect(report.sections.some(s => s.title === 'Summary')).toBe(true);
  });

  it('excludes summary when includeSummary is false', () => {
    const report = generateReport(makeSnapshot(), { format: 'text', includeSummary: false });
    expect(report.sections.some(s => s.title === 'Summary')).toBe(false);
  });

  it('includes score section when requested', () => {
    const report = generateReport(makeSnapshot(), { format: 'text', includeScore: true });
    expect(report.sections.some(s => s.title === 'Score')).toBe(true);
  });

  it('includes lint section when requested', () => {
    const report = generateReport(makeSnapshot(), { format: 'text', includeLint: true });
    expect(report.sections.some(s => s.title === 'Lint')).toBe(true);
  });

  it('includes recommendations section when requested', () => {
    const report = generateReport(makeSnapshot(), { format: 'text', includeRecommendations: true });
    expect(report.sections.some(s => s.title === 'Recommendations')).toBe(true);
  });

  it('includes audit section when requested', () => {
    const report = generateReport(makeSnapshot(), { format: 'text', includeAudit: true });
    expect(report.sections.some(s => s.title === 'Audit')).toBe(true);
  });

  it('sets snapshotId and snapshotLabel from snapshot', () => {
    const report = generateReport(makeSnapshot(), { format: 'text' });
    expect(report.snapshotId).toBe('snap-001');
    expect(report.snapshotLabel).toBe('test-snap');
  });

  it('uses id as label when label is missing', () => {
    const snap = makeSnapshot({ label: undefined });
    const report = generateReport(snap, { format: 'text' });
    expect(report.snapshotLabel).toBe('snap-001');
  });

  it('formatReport text includes section titles', () => {
    const report = generateReport(makeSnapshot(), { format: 'text', includeScore: true });
    const output = formatReport(report);
    expect(output).toContain('## Summary');
    expect(output).toContain('## Score');
  });

  it('formatReport markdown wraps in heading', () => {
    const report = generateReport(makeSnapshot(), { format: 'markdown' });
    const output = formatReport(report);
    expect(output).toContain('# Snapshot Report:');
  });

  it('formatReport json is valid JSON', () => {
    const report = generateReport(makeSnapshot(), { format: 'json' });
    const output = formatReport(report);
    expect(() => JSON.parse(output)).not.toThrow();
  });
});
