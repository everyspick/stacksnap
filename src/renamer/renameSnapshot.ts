import * as fs from 'fs';
import * as path from 'path';

export interface RenameIndex {
  [alias: string]: string; // alias -> snapshot id
}

export interface RenameResult {
  success: boolean;
  oldName: string;
  newName: string;
  message: string;
}

export function loadRenameIndex(indexPath: string): RenameIndex {
  if (!fs.existsSync(indexPath)) return {};
  const raw = fs.readFileSync(indexPath, 'utf-8');
  return JSON.parse(raw) as RenameIndex;
}

export function saveRenameIndex(indexPath: string, index: RenameIndex): void {
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}

export function renameSnapshot(
  indexPath: string,
  oldName: string,
  newName: string
): RenameResult {
  if (!oldName || !newName) {
    return { success: false, oldName, newName, message: 'Both oldName and newName are required.' };
  }
  if (oldName === newName) {
    return { success: false, oldName, newName, message: 'Old and new names must differ.' };
  }

  const index = loadRenameIndex(indexPath);

  if (!index[oldName]) {
    return { success: false, oldName, newName, message: `Snapshot "${oldName}" not found.` };
  }
  if (index[newName]) {
    return { success: false, oldName, newName, message: `Snapshot "${newName}" already exists.` };
  }

  index[newName] = index[oldName];
  delete index[oldName];
  saveRenameIndex(indexPath, index);

  return { success: true, oldName, newName, message: `Renamed "${oldName}" to "${newName}".` };
}

export function listRenames(indexPath: string): RenameIndex {
  return loadRenameIndex(indexPath);
}

export function formatRenameResult(result: RenameResult): string {
  return result.success
    ? `✔ ${result.message}`
    : `✘ ${result.message}`;
}
