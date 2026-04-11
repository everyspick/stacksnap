import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { Snapshot } from '../snapshot/snapshot';
import { serializeSnapshot, loadSnapshot } from '../snapshot/snapshot';

export interface ArchiveEntry {
  filename: string;
  archivedAt: string;
  snapshotId: string;
  compressedSize: number;
}

export interface ArchiveIndex {
  entries: ArchiveEntry[];
}

const ARCHIVE_DIR = '.stacksnap/archive';
const INDEX_FILE = '.stacksnap/archive/index.json';

export function ensureArchiveDir(): void {
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }
}

export function loadArchiveIndex(): ArchiveIndex {
  if (!fs.existsSync(INDEX_FILE)) {
    return { entries: [] };
  }
  const raw = fs.readFileSync(INDEX_FILE, 'utf-8');
  return JSON.parse(raw) as ArchiveIndex;
}

export function saveArchiveIndex(index: ArchiveIndex): void {
  ensureArchiveDir();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

export function archiveSnapshot(snapshot: Snapshot): ArchiveEntry {
  ensureArchiveDir();
  const serialized = serializeSnapshot(snapshot);
  const compressed = zlib.gzipSync(Buffer.from(serialized, 'utf-8'));
  const filename = `${snapshot.id}.snap.gz`;
  const filepath = path.join(ARCHIVE_DIR, filename);
  fs.writeFileSync(filepath, compressed);

  const entry: ArchiveEntry = {
    filename,
    archivedAt: new Date().toISOString(),
    snapshotId: snapshot.id,
    compressedSize: compressed.length,
  };

  const index = loadArchiveIndex();
  index.entries.push(entry);
  saveArchiveIndex(index);

  return entry;
}

export function restoreSnapshot(snapshotId: string): Snapshot {
  const filepath = path.join(ARCHIVE_DIR, `${snapshotId}.snap.gz`);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Archived snapshot not found: ${snapshotId}`);
  }
  const compressed = fs.readFileSync(filepath);
  const decompressed = zlib.gunzipSync(compressed).toString('utf-8');
  return JSON.parse(decompressed) as Snapshot;
}

export function listArchivedSnapshots(): ArchiveEntry[] {
  return loadArchiveIndex().entries;
}

export function deleteArchivedSnapshot(snapshotId: string): boolean {
  const filepath = path.join(ARCHIVE_DIR, `${snapshotId}.snap.gz`);
  if (!fs.existsSync(filepath)) {
    return false;
  }
  fs.unlinkSync(filepath);
  const index = loadArchiveIndex();
  index.entries = index.entries.filter(e => e.snapshotId !== snapshotId);
  saveArchiveIndex(index);
  return true;
}
