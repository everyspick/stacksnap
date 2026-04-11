import { lintSnapshot, formatLintResult, LintRule } from './lintSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'snap-test',
    timestamp: new Date().toISOString(),
    os: 'linux',
    tools: [
      { name: 'node', version: '20.0.0', path: '/usr/bin/node' },
      { name: 'git', version: '2.40.0', path: '/usr/bin/git' },
      { name: 'npm', version: '10.0.0', path: '/usr/bin/npm' },
    ],
    tags: [],
    ...overrides,
  };
}

describe('lintSnapshot', () => {
  it('passes a complete valid snapshot', () => {
    const result = lintSnapshot(makeSnapshot());
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.errorCount).toBe(0);
  });

  it('fails when tools array is empty', () => {
    const result = lintSnapshot(makeSnapshot({ tools: [] }));
    expect(result.passed).toBe(false);
    const issue = result.issues.find((i) => i.ruleId === 'no-empty-stack');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
  });

  it('warns when node is missing', () => {
    const result = lintSnapshot(
      makeSnapshot({ tools: [{ name: 'git', version: '2.40.0', path: '/usr/bin/git' }] })
    );
    const issue = result.issues.find((i) => i.ruleId === 'has-node');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
  });

  it('warns when a tool has no version', () => {
    const result = lintSnapshot(
      makeSnapshot({
        tools: [
          { name: 'node', version: '20.0.0', path: '/usr/bin/node' },
          { name: 'git', version: undefined, path: '/usr/bin/git' },
        ],
      })
    );
    const issue = result.issues.find((i) => i.ruleId === 'all-versions-present');
    expect(issue).toBeDefined();
  });

  it('fails when timestamp is invalid', () => {
    const result = lintSnapshot(makeSnapshot({ timestamp: 'not-a-date' }));
    const issue = result.issues.find((i) => i.ruleId === 'has-timestamp');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
  });

  it('reports info when os is missing', () => {
    const result = lintSnapshot(makeSnapshot({ os: undefined }));
    const issue = result.issues.find((i) => i.ruleId === 'has-os');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('info');
  });

  it('counts severities correctly', () => {
    const result = lintSnapshot(makeSnapshot({ tools: [], timestamp: 'bad', os: undefined }));
    expect(result.errorCount).toBeGreaterThanOrEqual(2);
    expect(result.infoCount).toBeGreaterThanOrEqual(1);
  });

  it('supports custom rules', () => {
    const customRule: LintRule = {
      id: 'custom-rule',
      description: 'Must have exactly 3 tools',
      severity: 'warning',
      check: (s) => s.tools.length === 3,
      message: 'Tool count must be exactly 3.',
    };
    const result = lintSnapshot(makeSnapshot({ tools: [{ name: 'node', version: '20.0.0', path: '' }] }), [customRule]);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].ruleId).toBe('custom-rule');
  });
});

describe('formatLintResult', () => {
  it('shows PASSED for a clean result', () => {
    const result = lintSnapshot(makeSnapshot());
    const output = formatLintResult(result);
    expect(output).toContain('PASSED');
    expect(output).toContain('No issues found.');
  });

  it('shows FAILED and lists issues', () => {
    const result = lintSnapshot(makeSnapshot({ tools: [] }));
    const output = formatLintResult(result);
    expect(output).toContain('FAILED');
    expect(output).toContain('no-empty-stack');
  });
});
