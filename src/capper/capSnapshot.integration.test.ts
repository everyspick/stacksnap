import { describe, it, expect } from 'vitest';
import { capSnapshot, formatCapResult } from './capSnapshot';
import type { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(tools: Array<{ name: string; version?: string; category?: string }>): Snapshot {
  return {
    id: 'integration-test',
    timestamp: new Date().toISOString(),
    tools: tools.map((t) => ({
      name: t.name,
      version: t.version ?? null,
      category: t.category ?? 'misc',
    })),
    metadata: { host: 'test', platform: 'linux', shell: 'bash' },
  };
}

describe('capSnapshot integration', () => {
  it('caps a realistic dev stack to a total limit', () => {
    const snapshot = makeSnapshot([
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'npm', version: '10.0.0', category: 'package-manager' },
      { name: 'git', version: '2.44.0', category: 'vcs' },
      { name: 'docker', version: '25.0.0', category: 'container' },
      { name: 'python', version: '3.12.0', category: 'runtime' },
      { name: 'pip', version: '24.0', category: 'package-manager' },
      { name: 'rustc', version: '1.78.0', category: 'runtime' },
    ]);

    const result = capSnapshot(snapshot, { totalLimit: 4 });
    expect(result.capped.tools.length).toBe(4);
    expect(result.removed.length).toBe(3);
  });

  it('caps per category and produces a readable report', () => {
    const snapshot = makeSnapshot([
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'python', version: '3.12.0', category: 'runtime' },
      { name: 'rustc', version: '1.78.0', category: 'runtime' },
      { name: 'npm', version: '10.0.0', category: 'package-manager' },
      { name: 'pip', version: '24.0', category: 'package-manager' },
    ]);

    const result = capSnapshot(snapshot, { categoryLimits: { runtime: 2, 'package-manager': 1 } });
    const report = formatCapResult(result);

    expect(result.capped.tools.length).toBe(3);
    expect(report).toContain('Capped');
    expect(report).toContain('runtime');
    expect(report).toContain('package-manager');
  });

  it('returns unchanged snapshot when limits are not exceeded', () => {
    const snapshot = makeSnapshot([
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'git', version: '2.44.0', category: 'vcs' },
    ]);

    const result = capSnapshot(snapshot, { totalLimit: 10 });
    expect(result.capped.tools.length).toBe(2);
    expect(result.removed.length).toBe(0);
  });
});
