import { recommendSnapshot, formatRecommendations } from './recommendSnapshot';
import { StackSnapshot } from '../snapshot/snapshot';

function makeSnapshot(toolNames: string[], withVersions = true): StackSnapshot {
  return {
    id: 'test-snap',
    created_at: new Date().toISOString(),
    hostname: 'testhost',
    platform: 'linux',
    tools: toolNames.map((name) => ({
      name,
      version: withVersions ? '1.0.0' : null,
      path: `/usr/bin/${name}`,
    })),
    metadata: {},
  };
}

describe('recommendSnapshot', () => {
  it('recommends git and node for an empty stack', () => {
    const snap = makeSnapshot([]);
    const result = recommendSnapshot(snap);
    const toolNames = result.recommendations.map((r) => r.tool);
    expect(toolNames).toContain('git');
    expect(toolNames).toContain('node');
  });

  it('does not recommend node if already present', () => {
    const snap = makeSnapshot(['node', 'git', 'docker', 'pnpm', 'eslint']);
    const result = recommendSnapshot(snap);
    const toolNames = result.recommendations.map((r) => r.tool);
    expect(toolNames).not.toContain('node');
    expect(toolNames).not.toContain('git');
  });

  it('returns empty recommendations for a well-equipped stack', () => {
    const snap = makeSnapshot(['node', 'git', 'docker', 'pnpm', 'eslint']);
    const result = recommendSnapshot(snap);
    expect(result.recommendations).toHaveLength(0);
  });

  it('sorts recommendations by priority (high first)', () => {
    const snap = makeSnapshot([]);
    const result = recommendSnapshot(snap);
    const priorities = result.recommendations.map((r) => r.priority);
    const order = { high: 0, medium: 1, low: 2 };
    for (let i = 1; i < priorities.length; i++) {
      expect(order[priorities[i]]).toBeGreaterThanOrEqual(order[priorities[i - 1]]);
    }
  });

  it('estimated_score_after is >= score_before', () => {
    const snap = makeSnapshot([]);
    const result = recommendSnapshot(snap);
    expect(result.estimated_score_after).toBeGreaterThanOrEqual(result.score_before);
  });

  it('includes snapshot_id and generated_at', () => {
    const snap = makeSnapshot(['node']);
    const result = recommendSnapshot(snap);
    expect(result.snapshot_id).toBe('test-snap');
    expect(result.generated_at).toBeTruthy();
  });
});

describe('formatRecommendations', () => {
  it('shows no-recommendation message for clean stack', () => {
    const snap = makeSnapshot(['node', 'git', 'docker', 'pnpm', 'eslint']);
    const result = recommendSnapshot(snap);
    const output = formatRecommendations(result);
    expect(output).toContain('No recommendations');
  });

  it('lists tool names in output', () => {
    const snap = makeSnapshot([]);
    const result = recommendSnapshot(snap);
    const output = formatRecommendations(result);
    expect(output).toContain('git');
    expect(output).toContain('node');
  });

  it('includes score line', () => {
    const snap = makeSnapshot(['node']);
    const result = recommendSnapshot(snap);
    const output = formatRecommendations(result);
    expect(output).toMatch(/Score:/);
  });
});
