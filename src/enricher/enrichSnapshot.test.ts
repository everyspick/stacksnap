import { enrichTool, enrichSnapshot, formatEnrichmentResult } from './enrichSnapshot';
import { Snapshot } from '../detector/types';
import { EnrichedTool } from './types';

function makeSnapshot(tools: { name: string; version?: string; category?: string }[]): Snapshot {
  return {
    id: 'test-snap',
    createdAt: '2024-01-01T00:00:00.000Z',
    tools: tools.map(t => ({ name: t.name, version: t.version, category: t.category })),
    metadata: { hostname: 'localhost', platform: 'linux' },
  };
}

describe('enrichTool', () => {
  it('adds homepage and description for known tools', () => {
    const tool = { name: 'node', version: '20.0.0' };
    const result = enrichTool(tool);
    expect(result.homepage).toBe('https://nodejs.org');
    expect(result.description).toContain('JavaScript runtime');
    expect(result.enrichedAt).toBeDefined();
  });

  it('returns tool unchanged for unknown tools', () => {
    const tool = { name: 'mytool', version: '1.0.0' };
    const result = enrichTool(tool);
    expect(result.homepage).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.enrichedAt).toBeDefined();
  });

  it('is case-insensitive for tool name lookup', () => {
    const tool = { name: 'Docker', version: '24.0.0' };
    const result = enrichTool(tool);
    expect(result.homepage).toBe('https://docker.com');
  });
});

describe('enrichSnapshot', () => {
  it('enriches known tools and skips unknown ones', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '20.0.0' },
      { name: 'git', version: '2.40.0' },
      { name: 'mytool', version: '1.0.0' },
    ]);
    const result = enrichSnapshot(snap);
    expect(result.enrichedCount).toBe(2);
    expect(result.skippedCount).toBe(1);
    expect(result.skipped).toContain('mytool');
    expect(result.enriched).toHaveLength(3);
  });

  it('returns empty result for empty snapshot', () => {
    const snap = makeSnapshot([]);
    const result = enrichSnapshot(snap);
    expect(result.enrichedCount).toBe(0);
    expect(result.skippedCount).toBe(0);
    expect(result.enriched).toHaveLength(0);
  });

  it('all tools get enrichedAt timestamp', () => {
    const snap = makeSnapshot([{ name: 'unknown-tool' }]);
    const result = enrichSnapshot(snap);
    expect(result.enriched[0].enrichedAt).toBeDefined();
  });
});

describe('formatEnrichmentResult', () => {
  it('includes summary counts', () => {
    const snap = makeSnapshot([
      { name: 'node', version: '20.0.0' },
      { name: 'unknown' },
    ]);
    const result = enrichSnapshot(snap);
    const output = formatEnrichmentResult(result);
    expect(output).toContain('Enriched:');
    expect(output).toContain('Skipped:');
  });

  it('lists skipped tools when present', () => {
    const snap = makeSnapshot([{ name: 'weirdtool' }]);
    const result = enrichSnapshot(snap);
    const output = formatEnrichmentResult(result);
    expect(output).toContain('weirdtool');
  });
});
