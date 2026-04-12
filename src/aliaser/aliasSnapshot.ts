import * as fs from 'fs';
import * as path from 'path';

export interface AliasEntry {
  alias: string;
  snapshotPath: string;
  createdAt: string;
  description?: string;
}

export interface AliasIndex {
  aliases: Record<string, AliasEntry>;
}

const DEFAULT_INDEX: AliasIndex = { aliases: {} };

export function loadAliasIndex(indexPath: string): AliasIndex {
  if (!fs.existsSync(indexPath)) return { ...DEFAULT_INDEX, aliases: {} };
  const raw = fs.readFileSync(indexPath, 'utf-8');
  return JSON.parse(raw) as AliasIndex;
}

export function saveAliasIndex(indexPath: string, index: AliasIndex): void {
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}

export function addAlias(
  indexPath: string,
  alias: string,
  snapshotPath: string,
  description?: string
): AliasEntry {
  const index = loadAliasIndex(indexPath);
  if (index.aliases[alias]) {
    throw new Error(`Alias "${alias}" already exists. Use updateAlias to overwrite.`);
  }
  const entry: AliasEntry = {
    alias,
    snapshotPath,
    createdAt: new Date().toISOString(),
    description,
  };
  index.aliases[alias] = entry;
  saveAliasIndex(indexPath, index);
  return entry;
}

export function removeAlias(indexPath: string, alias: string): boolean {
  const index = loadAliasIndex(indexPath);
  if (!index.aliases[alias]) return false;
  delete index.aliases[alias];
  saveAliasIndex(indexPath, index);
  return true;
}

export function resolveAlias(indexPath: string, alias: string): string | null {
  const index = loadAliasIndex(indexPath);
  return index.aliases[alias]?.snapshotPath ?? null;
}

export function listAliases(indexPath: string): AliasEntry[] {
  const index = loadAliasIndex(indexPath);
  return Object.values(index.aliases).sort((a, b) =>
    a.alias.localeCompare(b.alias)
  );
}

export function updateAlias(
  indexPath: string,
  alias: string,
  snapshotPath: string,
  description?: string
): AliasEntry {
  const index = loadAliasIndex(indexPath);
  const existing = index.aliases[alias];
  const entry: AliasEntry = {
    alias,
    snapshotPath,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    description: description ?? existing?.description,
  };
  index.aliases[alias] = entry;
  saveAliasIndex(indexPath, index);
  return entry;
}
