import { expireSnapshot } from './expireSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

describe('expireSnapshot integration', () => {
  it('handles a snapshot with no detectedAt fields gracefully', () => {
    const snap: Snapshot = {
      id: 'snap-no-dates',
      createdAt: new Date().toISOString(),
      hostname: 'host',
      tools: [
        { name: 'node', version: '18.0.0', category: 'runtime' },
        { name: 'yarn', version: '1.22.0', category: 'package-manager' },
      ],
    } as unknown as Snapshot;

    const { result } = expireSnapshot(snap, { maxAgeDays: 1 });
    expect(result.expired).toHaveLength(0);
    expect(result.kept).toHaveLength(2);
  });

  it('removes all tools when all are stale', () => {
    const snap: Snapshot = {
      id: 'snap-all-stale',
      createdAt: new Date().toISOString(),
      hostname: 'host',
      tools: [
        { name: 'node', version: '16.0.0', category: 'runtime', detectedAt: daysAgo(90) },
        { name: 'npm', version: '8.0.0', category: 'package-manager', detectedAt: daysAgo(60) },
      ],
    } as unknown as Snapshot;

    const { snapshot, result } = expireSnapshot(snap, { maxAgeDays: 30 });
    expect(result.expired).toHaveLength(2);
    expect(snapshot.tools).toHaveLength(0);
  });
});
