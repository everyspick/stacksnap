import { detectStack } from '../detector/detectTools';
import { createSnapshot } from '../snapshot/snapshot';
import { rankSnapshot, formatRankResult } from './rankSnapshot';

describe('rankSnapshot integration', () => {
  it('ranks a live-detected stack without throwing', async () => {
    const tools = await detectStack();
    const snapshot = createSnapshot(tools, 'integration-rank-test');
    const result = rankSnapshot(snapshot, 'score');

    expect(result.total).toBe(tools.length);
    expect(result.ranked.length).toBe(tools.length);

    // Ranks should be sequential starting from 1
    result.ranked.forEach((entry, idx) => {
      expect(entry.rank).toBe(idx + 1);
    });
  });

  it('produces readable formatted output from live stack', async () => {
    const tools = await detectStack();
    const snapshot = createSnapshot(tools, 'integration-format-test');
    const result = rankSnapshot(snapshot, 'alpha');
    const output = formatRankResult(result);

    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
    expect(output).toContain('alpha');
  });
});
