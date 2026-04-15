import { redactSnapshot, redactTool, formatRedactResult } from './redactSnapshot';
import { Snapshot } from '../detector/types';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'snap-001',
    timestamp: '2024-01-01T00:00:00.000Z',
    tools: [
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'git', version: '2.42.0', category: 'vcs' },
      { name: 'docker', version: '24.0.5', category: 'container' },
    ],
    ...overrides,
  };
}

describe('redactTool', () => {
  it('redacts version when redactVersions is true', () => {
    const tool = { name: 'node', version: '20.0.0', category: 'runtime' };
    const { tool: result, redactedFields } = redactTool(tool, { redactVersions: true });
    expect(result.version).toBe('***');
    expect(redactedFields).toContain('node.version');
  });

  it('uses custom maskChar', () => {
    const tool = { name: 'node', version: '20.0.0', category: 'runtime' };
    const { tool: result } = redactTool(tool, { redactVersions: true, maskChar: '[REDACTED]' });
    expect(result.version).toBe('[REDACTED]');
  });

  it('redacts category when redactCategories is true', () => {
    const tool = { name: 'node', version: '20.0.0', category: 'runtime' };
    const { tool: result, redactedFields } = redactTool(tool, { redactCategories: true });
    expect(result.category).toBe('***');
    expect(redactedFields).toContain('node.category');
  });

  it('skips redaction for allowlisted tools', () => {
    const tool = { name: 'node', version: '20.0.0', category: 'runtime' };
    const { tool: result, redactedFields } = redactTool(tool, {
      redactVersions: true,
      allowlist: ['node'],
    });
    expect(result.version).toBe('20.0.0');
    expect(redactedFields).toHaveLength(0);
  });
});

describe('redactSnapshot', () => {
  it('redacts all tool versions', () => {
    const snapshot = makeSnapshot();
    const { redacted, redactedFields } = redactSnapshot(snapshot, { redactVersions: true });
    for (const tool of redacted.tools) {
      expect(tool.version).toBe('***');
    }
    expect(redactedFields).toHaveLength(3);
  });

  it('preserves original snapshot unchanged', () => {
    const snapshot = makeSnapshot();
    const { original } = redactSnapshot(snapshot, { redactVersions: true });
    expect(original.tools[0].version).toBe('20.0.0');
  });

  it('respects allowlist in full snapshot redaction', () => {
    const snapshot = makeSnapshot();
    const { redacted } = redactSnapshot(snapshot, {
      redactVersions: true,
      allowlist: ['node'],
    });
    expect(redacted.tools.find(t => t.name === 'node')?.version).toBe('20.0.0');
    expect(redacted.tools.find(t => t.name === 'git')?.version).toBe('***');
  });

  it('returns empty redactedFields when no options set', () => {
    const snapshot = makeSnapshot();
    const { redactedFields } = redactSnapshot(snapshot, {});
    expect(redactedFields).toHaveLength(0);
  });
});

describe('formatRedactResult', () => {
  it('formats result with redacted fields', () => {
    const snapshot = makeSnapshot();
    const result = redactSnapshot(snapshot, { redactVersions: true });
    const output = formatRedactResult(result);
    expect(output).toContain('Fields redacted: 3');
    expect(output).toContain('node.version');
  });

  it('shows none when no fields redacted', () => {
    const snapshot = makeSnapshot();
    const result = redactSnapshot(snapshot, {});
    const output = formatRedactResult(result);
    expect(output).toContain('(none)');
  });
});
