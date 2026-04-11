import { scoreSnapshot, formatScoreResult } from './scoreSnapshot';
import { createSnapshot } from '../snapshot/snapshot';

describe('scoreSnapshot integration', () => {
  it('scores a snapshot created via createSnapshot', async () => {
    const tools = [
      { name: 'node', version: '18.0.0', path: '/usr/bin/node' },
      { name: 'git', version: '2.40.0', path: '/usr/bin/git' },
      { name: 'docker', version: '24.0.0', path: '/usr/bin/docker' },
    ];
    const snap = createSnapshot(tools);
    const result = scoreSnapshot(snap);

    expect(result).toMatchObject({
      total: expect.any(Number),
      max: expect.any(Number),
      percentage: expect.any(Number),
      grade: expect.stringMatching(/^[ABCDF]$/),
      breakdown: expect.arrayContaining([
        expect.objectContaining({ category: 'Version Presence' }),
        expect.objectContaining({ category: 'Tool Diversity' }),
        expect.objectContaining({ category: 'Metadata Completeness' }),
      ]),
    });
  });

  it('formatted output is a non-empty string', async () => {
    const tools = [{ name: 'node', version: '20.0.0', path: '/usr/bin/node' }];
    const snap = createSnapshot(tools);
    const result = scoreSnapshot(snap);
    const output = formatScoreResult(result);
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
    expect(output).toContain('Stack Score');
  });

  it('percentage is between 0 and 100', async () => {
    const tools = [{ name: 'yarn', version: '1.22.0', path: '/usr/bin/yarn' }];
    const snap = createSnapshot(tools);
    const result = scoreSnapshot(snap);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
  });
});
