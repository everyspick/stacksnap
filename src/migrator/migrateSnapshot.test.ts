import { migrateSnapshot, normalizeToolNames, backfillCategories, formatMigrationResult } from './migrateSnapshot';
import { Snapshot } from '../snapshot/snapshot';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'test-snap',
    createdAt: '2024-01-01T00:00:00.000Z',
    tools: [],
    meta: { platform: 'linux', schemaVersion: '1.0.0' },
    ...overrides,
  };
}

describe('normalizeToolNames', () => {
  it('lowercases and trims tool names', () => {
    const snap = makeSnapshot({ tools: [{ name: '  Node ', version: '18.0.0' }] });
    const { snapshot, changes } = normalizeToolNames(snap);
    expect(snapshot.tools[0].name).toBe('node');
    expect(changes).toHaveLength(1);
    expect(changes[0]).toContain('Node');
  });

  it('does not change already normalized names', () => {
    const snap = makeSnapshot({ tools: [{ name: 'git', version: '2.40.0' }] });
    const { snapshot, changes } = normalizeToolNames(snap);
    expect(snapshot.tools[0].name).toBe('git');
    expect(changes).toHaveLength(0);
  });
});

describe('backfillCategories', () => {
  it('infers category for known tools', () => {
    const snap = makeSnapshot({ tools: [{ name: 'node', version: '18.0.0' }] });
    const { snapshot, changes } = backfillCategories(snap);
    expect(snapshot.tools[0].category).toBe('runtime');
    expect(changes).toHaveLength(1);
  });

  it('does not overwrite existing category', () => {
    const snap = makeSnapshot({ tools: [{ name: 'node', version: '18.0.0', category: 'custom' }] });
    const { snapshot, changes } = backfillCategories(snap);
    expect(snapshot.tools[0].category).toBe('custom');
    expect(changes).toHaveLength(0);
  });

  it('leaves unknown tools without category', () => {
    const snap = makeSnapshot({ tools: [{ name: 'mytool', version: '1.0.0' }] });
    const { snapshot, changes } = backfillCategories(snap);
    expect(snapshot.tools[0].category).toBeUndefined();
    expect(changes).toHaveLength(0);
  });
});

describe('migrateSnapshot', () => {
  it('applies all migrations and sets schemaVersion', () => {
    const snap = makeSnapshot({
      tools: [{ name: '  NPM ', version: '9.0.0' }],
    });
    const result = migrateSnapshot(snap);
    expect(result.migrated.tools[0].name).toBe('npm');
    expect(result.migrated.tools[0].category).toBe('package-manager');
    expect(result.migrated.meta.schemaVersion).toBe('2.0.0');
    expect(result.migrated.meta.migratedAt).toBeDefined();
    expect(result.changes.length).toBeGreaterThan(0);
  });

  it('returns empty changes when snapshot is already up to date', () => {
    const snap = makeSnapshot({
      tools: [{ name: 'git', version: '2.40.0', category: 'vcs' }],
      meta: { platform: 'linux', schemaVersion: '1.0.0' },
    });
    const result = migrateSnapshot(snap);
    expect(result.changes).toHaveLength(0);
  });
});

describe('formatMigrationResult', () => {
  it('shows no changes message when empty', () => {
    const snap = makeSnapshot();
    const result = migrateSnapshot(snap);
    const output = formatMigrationResult(result);
    expect(output).toContain('no changes needed');
  });

  it('lists changes when present', () => {
    const snap = makeSnapshot({ tools: [{ name: '  Node ', version: '18.0.0' }] });
    const result = migrateSnapshot(snap);
    const output = formatMigrationResult(result);
    expect(output).toContain('•');
    expect(output).toContain('Node');
  });
});
