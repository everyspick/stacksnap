import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  renameSnapshot,
  listRenames,
  loadRenameIndex,
  saveRenameIndex,
  formatRenameResult,
} from './renameSnapshot';

function makeTempFile(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-renamer-'));
  return path.join(dir, 'rename-index.json');
}

describe('renameSnapshot', () => {
  it('renames an existing snapshot entry', () => {
    const indexPath = makeTempFile();
    saveRenameIndex(indexPath, { mySnap: 'snap-001' });
    const result = renameSnapshot(indexPath, 'mySnap', 'renamedSnap');
    expect(result.success).toBe(true);
    const index = loadRenameIndex(indexPath);
    expect(index['renamedSnap']).toBe('snap-001');
    expect(index['mySnap']).toBeUndefined();
  });

  it('fails when oldName does not exist', () => {
    const indexPath = makeTempFile();
    const result = renameSnapshot(indexPath, 'ghost', 'newName');
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });

  it('fails when newName already exists', () => {
    const indexPath = makeTempFile();
    saveRenameIndex(indexPath, { snapA: 'id-1', snapB: 'id-2' });
    const result = renameSnapshot(indexPath, 'snapA', 'snapB');
    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
  });

  it('fails when old and new names are the same', () => {
    const indexPath = makeTempFile();
    saveRenameIndex(indexPath, { same: 'id-x' });
    const result = renameSnapshot(indexPath, 'same', 'same');
    expect(result.success).toBe(false);
    expect(result.message).toContain('must differ');
  });

  it('fails when names are empty', () => {
    const indexPath = makeTempFile();
    const result = renameSnapshot(indexPath, '', 'newName');
    expect(result.success).toBe(false);
  });
});

describe('listRenames', () => {
  it('returns empty object when index does not exist', () => {
    const result = listRenames('/nonexistent/path/index.json');
    expect(result).toEqual({});
  });

  it('returns stored index', () => {
    const indexPath = makeTempFile();
    saveRenameIndex(indexPath, { a: '1', b: '2' });
    expect(listRenames(indexPath)).toEqual({ a: '1', b: '2' });
  });
});

describe('formatRenameResult', () => {
  it('formats success result with checkmark', () => {
    const result = formatRenameResult({ success: true, oldName: 'a', newName: 'b', message: 'Renamed "a" to "b".' });
    expect(result).toMatch(/^✔/);
  });

  it('formats failure result with cross', () => {
    const result = formatRenameResult({ success: false, oldName: 'a', newName: 'b', message: 'Not found.' });
    expect(result).toMatch(/^✘/);
  });
});
