import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  addAlias,
  removeAlias,
  resolveAlias,
  listAliases,
  updateAlias,
  loadAliasIndex,
} from './aliasSnapshot';

function makeTempFile(): string {
  return path.join(os.tmpdir(), `alias-index-${Date.now()}-${Math.random()}.json`);
}

describe('aliasSnapshot', () => {
  let indexPath: string;

  beforeEach(() => {
    indexPath = makeTempFile();
  });

  afterEach(() => {
    if (fs.existsSync(indexPath)) fs.unlinkSync(indexPath);
  });

  it('loads an empty index when file does not exist', () => {
    const index = loadAliasIndex(indexPath);
    expect(index.aliases).toEqual({});
  });

  it('adds a new alias', () => {
    const entry = addAlias(indexPath, 'prod', '/snapshots/prod.json', 'Production env');
    expect(entry.alias).toBe('prod');
    expect(entry.snapshotPath).toBe('/snapshots/prod.json');
    expect(entry.description).toBe('Production env');
    expect(entry.createdAt).toBeTruthy();
  });

  it('throws when adding a duplicate alias', () => {
    addAlias(indexPath, 'prod', '/snapshots/prod.json');
    expect(() => addAlias(indexPath, 'prod', '/snapshots/other.json')).toThrow(
      /already exists/
    );
  });

  it('resolves an existing alias', () => {
    addAlias(indexPath, 'staging', '/snapshots/staging.json');
    const resolved = resolveAlias(indexPath, 'staging');
    expect(resolved).toBe('/snapshots/staging.json');
  });

  it('returns null for a missing alias', () => {
    const resolved = resolveAlias(indexPath, 'nonexistent');
    expect(resolved).toBeNull();
  });

  it('removes an alias', () => {
    addAlias(indexPath, 'dev', '/snapshots/dev.json');
    const removed = removeAlias(indexPath, 'dev');
    expect(removed).toBe(true);
    expect(resolveAlias(indexPath, 'dev')).toBeNull();
  });

  it('returns false when removing a non-existent alias', () => {
    const removed = removeAlias(indexPath, 'ghost');
    expect(removed).toBe(false);
  });

  it('lists all aliases sorted by name', () => {
    addAlias(indexPath, 'staging', '/s.json');
    addAlias(indexPath, 'dev', '/d.json');
    addAlias(indexPath, 'prod', '/p.json');
    const aliases = listAliases(indexPath);
    expect(aliases.map((a) => a.alias)).toEqual(['dev', 'prod', 'staging']);
  });

  it('updates an existing alias', () => {
    addAlias(indexPath, 'prod', '/old.json', 'Old');
    const updated = updateAlias(indexPath, 'prod', '/new.json', 'New desc');
    expect(updated.snapshotPath).toBe('/new.json');
    expect(updated.description).toBe('New desc');
  });

  it('creates alias via updateAlias if it does not exist', () => {
    const entry = updateAlias(indexPath, 'fresh', '/fresh.json');
    expect(entry.alias).toBe('fresh');
    expect(resolveAlias(indexPath, 'fresh')).toBe('/fresh.json');
  });
});
