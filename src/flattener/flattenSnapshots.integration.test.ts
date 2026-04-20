import { flattenSnapshots } from './flattenSnapshots';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(
  id: string,
  tools: { name: string; version?: string; category?: string }[]
): Snapshot {
  return {
    id,
    label: id,
    createdAt: new Date().toISOString(),
    tools,
  };
}

describe('flattenSnapshots integration', () => {
  it('flattens a realistic multi-environment scenario', () => {
    const dev = makeSnapshot('dev', [
      { name: 'node', version: '20.0.0', category: 'runtime' },
      { name: 'npm', version: '10.0.0', category: 'package-manager' },
      { name: 'docker', version: '24.0.0', category: 'container' },
    ]);

    const ci = makeSnapshot('ci', [
      { name: 'node', version: '18.0.0', category: 'runtime' },
      { name: 'yarn', version: '1.22.0', category: 'package-manager' },
      { name: 'kubectl', version: '1.28.0', category: 'orchestration' },
    ]);

    const prod = makeSnapshot('prod', [
      { name: 'docker', version: '23.0.0', category: 'container' },
      { name: 'kubectl', version: '1.27.0', category: 'orchestration' },
      { name: 'helm', version: '3.12.0', category: 'orchestration' },
    ]);

    const result = flattenSnapshots([dev, ci, prod]);

    // Unique tool names: node, npm, docker, yarn, kubectl, helm
    expect(result.tools).toHaveLength(6);
    expect(result.totalBefore).toBe(9);
    expect(result.duplicatesRemoved).toBe(3);

    // dev snapshot wins for node and docker
    expect(result.tools.find((t) => t.name === 'node')?.version).toBe('20.0.0');
    expect(result.tools.find((t) => t.name === 'docker')?.version).toBe('24.0.0');

    // ci snapshot wins for kubectl (first occurrence)
    expect(result.tools.find((t) => t.name === 'kubectl')?.version).toBe('1.28.0');
  });
});
