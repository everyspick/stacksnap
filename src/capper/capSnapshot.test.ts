import { capSnapshot, capByTotal, capByCategory, formatCapResult } from './capSnapshot';
import { Snapshot, ToolEntry } from '../detector/types';

function makeTool(name: string, category: string, version = '1.0.0'): ToolEntry {
  return { name, version, category };
}

function makeSnapshot(tools: ToolEntry[]): Snapshot {
  return {
    id: 'test-snap',
    timestamp: new Date().toISOString(),
    tools,
    metadata: { hostname: 'host', platform: 'linux', shell: 'bash' },
  };
}

const tools: ToolEntry[] = [
  makeTool('node', 'runtime'),
  makeTool('python', 'runtime'),
  makeTool('ruby', 'runtime'),
  makeTool('git', 'vcs'),
  makeTool('docker', 'container'),
  makeTool('kubectl', 'container'),
];

describe('capByTotal', () => {
  it('limits tools to max count', () => {
    expect(capByTotal(tools, 3)).toHaveLength(3);
  });

  it('returns all tools when max exceeds length', () => {
    expect(capByTotal(tools, 100)).toHaveLength(tools.length);
  });
});

describe('capByCategory', () => {
  it('limits tools per category', () => {
    const result = capByCategory(tools, 1);
    const cats = result.map(t => t.category);
    const unique = new Set(cats);
    expect(result).toHaveLength(unique.size);
  });

  it('allows up to maxPerCategory per category', () => {
    const result = capByCategory(tools, 2);
    const catCount: Record<string, number> = {};
    for (const t of result) {
      const c = t.category ?? 'unknown';
      catCount[c] = (catCount[c] ?? 0) + 1;
    }
    for (const count of Object.values(catCount)) {
      expect(count).toBeLessThanOrEqual(2);
    }
  });
});

describe('capSnapshot', () => {
  it('caps by maxTools', () => {
    const snap = makeSnapshot(tools);
    const result = capSnapshot(snap, { maxTools: 2 });
    expect(result.capped).toBe(2);
    expect(result.removed).toBe(tools.length - 2);
  });

  it('caps by maxPerCategory then maxTools', () => {
    const snap = makeSnapshot(tools);
    const result = capSnapshot(snap, { maxPerCategory: 1, maxTools: 2 });
    expect(result.capped).toBeLessThanOrEqual(2);
  });

  it('preserves original snapshot tools', () => {
    const snap = makeSnapshot(tools);
    capSnapshot(snap, { maxTools: 1 });
    expect(snap.tools).toHaveLength(tools.length);
  });
});

describe('formatCapResult', () => {
  it('includes original, capped, and removed counts', () => {
    const snap = makeSnapshot(tools);
    const result = capSnapshot(snap, { maxTools: 3 });
    const text = formatCapResult(result);
    expect(text).toContain('6');
    expect(text).toContain('3');
    expect(text).toContain('Removed');
  });
});
