import { summarizeSnapshot, formatSummary } from './summarizeSnapshot';
import { Snapshot } from '../detector/types';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'test-id',
    createdAt: '2024-01-01T00:00:00.000Z',
    hostname: 'test-host',
    platform: 'linux',
    tools: [
      { name: 'node', version: '20.0.0', path: '/usr/bin/node' },
      { name: 'git', version: '2.40.0', path: '/usr/bin/git' },
      { name: 'docker', version: null, path: null },
    ],
    ...overrides,
  };
}

describe('summarizeSnapshot', () => {
  it('returns correct totals', () => {
    const summary = summarizeSnapshot(makeSnapshot());
    expect(summary.totalTools).toBe(3);
    expect(summary.detectedTools).toBe(2);
    expect(summary.missingTools).toBe(1);
  });

  it('calculates detection rate correctly', () => {
    const summary = summarizeSnapshot(makeSnapshot());
    expect(summary.detectionRate).toBe(67);
  });

  it('returns 0 detection rate when no tools', () => {
    const summary = summarizeSnapshot(makeSnapshot({ tools: [] }));
    expect(summary.detectionRate).toBe(0);
    expect(summary.totalTools).toBe(0);
  });

  it('lists detected and missing tool names correctly', () => {
    const summary = summarizeSnapshot(makeSnapshot());
    expect(summary.toolNames).toEqual(['node', 'git']);
    expect(summary.missingToolNames).toEqual(['docker']);
  });

  it('includes metadata from snapshot', () => {
    const summary = summarizeSnapshot(makeSnapshot());
    expect(summary.hostname).toBe('test-host');
    expect(summary.platform).toBe('linux');
    expect(summary.createdAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('handles missing hostname and platform gracefully', () => {
    const snapshot = makeSnapshot();
    delete (snapshot as any).hostname;
    delete (snapshot as any).platform;
    const summary = summarizeSnapshot(snapshot);
    expect(summary.hostname).toBe('unknown');
    expect(summary.platform).toBe('unknown');
  });
});

describe('formatSummary', () => {
  it('includes all key sections', () => {
    const summary = summarizeSnapshot(makeSnapshot());
    const output = formatSummary(summary);
    expect(output).toContain('=== Snapshot Summary ===');
    expect(output).toContain('test-host');
    expect(output).toContain('linux');
    expect(output).toContain('Detected Tools:');
    expect(output).toContain('Missing Tools:');
    expect(output).toContain('- node');
    expect(output).toContain('- docker');
  });

  it('does not include missing section when all tools detected', () => {
    const snapshot = makeSnapshot({
      tools: [
        { name: 'node', version: '20.0.0', path: '/usr/bin/node' },
      ],
    });
    const output = formatSummary(summarizeSnapshot(snapshot));
    expect(output).not.toContain('Missing Tools:');
  });
});
