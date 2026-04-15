import { normalizeSnapshot, normalizeTool, formatNormalizeResult } from './normalizeSnapshot';
import { Snapshot } from '../detector/types';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'test-id',
    createdAt: '2024-01-01T00:00:00.000Z',
    tools: [
      { name: 'Node', version: 'v18.0.0', category: 'runtime' },
      { name: '  Git  ', version: ' 2.40.0 ', category: 'vcs' },
      { name: 'Python', version: undefined, category: 'runtime' },
    ],
    metadata: { host: 'test', platform: 'linux', tags: [] },
    ...overrides,
  };
}

describe('normalizeTool', () => {
  it('lowercases tool name when option is set', () => {
    const tool = { name: 'Node', version: '18.0.0', category: 'runtime' };
    const { tool: result, changes } = normalizeTool(tool, { lowercaseNames: true });
    expect(result.name).toBe('node');
    expect(changes).toHaveLength(1);
    expect(changes[0]).toContain('Lowercased name');
  });

  it('trims whitespace from name and version', () => {
    const tool = { name: '  git  ', version: ' 2.40.0 ', category: 'vcs' };
    const { tool: result, changes } = normalizeTool(tool, { trimWhitespace: true });
    expect(result.name).toBe('git');
    expect(result.version).toBe('2.40.0');
    expect(changes).toHaveLength(2);
  });

  it('strips leading v from version when normalizeVersionPrefix is set', () => {
    const tool = { name: 'node', version: 'v18.0.0', category: 'runtime' };
    const { tool: result, changes } = normalizeTool(tool, { normalizeVersionPrefix: true });
    expect(result.version).toBe('18.0.0');
    expect(changes).toHaveLength(1);
  });

  it('does not modify tool when no options are set', () => {
    const tool = { name: 'Node', version: 'v18.0.0', category: 'runtime' };
    const { tool: result, changes } = normalizeTool(tool, {});
    expect(result).toEqual(tool);
    expect(changes).toHaveLength(0);
  });

  it('handles undefined version gracefully', () => {
    const tool = { name: 'python', version: undefined, category: 'runtime' };
    const { tool: result, changes } = normalizeTool(tool, { normalizeVersionPrefix: true, trimWhitespace: true });
    expect(result.version).toBeUndefined();
    expect(changes).toHaveLength(0);
  });
});

describe('normalizeSnapshot', () => {
  it('applies all options to all tools', () => {
    const snapshot = makeSnapshot();
    const { snapshot: result, changes } = normalizeSnapshot(snapshot, {
      lowercaseNames: true,
      trimWhitespace: true,
      normalizeVersionPrefix: true,
    });
    expect(result.tools[0].name).toBe('node');
    expect(result.tools[0].version).toBe('18.0.0');
    expect(result.tools[1].name).toBe('git');
    expect(result.tools[1].version).toBe('2.40.0');
    expect(changes.length).toBeGreaterThan(0);
  });

  it('sorts tools alphabetically when sortTools is set', () => {
    const snapshot = makeSnapshot();
    const { snapshot: result, changes } = normalizeSnapshot(snapshot, { sortTools: true });
    const names = result.tools.map((t) => t.name);
    expect(names).toEqual([...names].sort());
    expect(changes.some((c) => c.includes('Sorted'))).toBe(true);
  });

  it('returns empty changes when snapshot is already normalized', () => {
    const snapshot = makeSnapshot({
      tools: [{ name: 'git', version: '2.40.0', category: 'vcs' }],
    });
    const { changes } = normalizeSnapshot(snapshot, { lowercaseNames: true, trimWhitespace: true });
    expect(changes).toHaveLength(0);
  });
});

describe('formatNormalizeResult', () => {
  it('returns no-change message when changes is empty', () => {
    const result = { snapshot: makeSnapshot(), changes: [] };
    expect(formatNormalizeResult(result)).toBe('No changes made during normalization.');
  });

  it('lists all changes with numbering', () => {
    const result = { snapshot: makeSnapshot(), changes: ['Change A', 'Change B'] };
    const output = formatNormalizeResult(result);
    expect(output).toContain('2 change(s)');
    expect(output).toContain('1. Change A');
    expect(output).toContain('2. Change B');
  });
});
