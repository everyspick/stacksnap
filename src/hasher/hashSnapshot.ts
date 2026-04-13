import * as crypto from 'crypto';
import { Snapshot } from '../snapshot/snapshot';

export interface SnapshotHash {
  snapshotId: string;
  hash: string;
  algorithm: string;
  timestamp: string;
  toolCount: number;
}

export interface HashComparison {
  snapshotIdA: string;
  snapshotIdB: string;
  hashA: string;
  hashB:
 string;
  match: boolean;
}

export function hashSnapshot(
  snapshot: Snapshot,
  algorithm: 'sha256' | 'md5' | 'sha1' = 'sha256'
): SnapshotHash {
  const tools = [...snapshot.tools].sort((a, b) => a.name.localeCompare(b.name));
  const normalized = tools.map(t => `${t.name}:${t.version ?? ''}:${t.category ?? ''}`).join('|');
  const payload = `${snapshot.id}::${normalized}`;
  const hash = crypto.createHash(algorithm).update(payload).digest('hex');

  return {
    snapshotId: snapshot.id,
    hash,
    algorithm,
    timestamp: new Date().toISOString(),
    toolCount: snapshot.tools.length,
  };
}

export function compareHashes(
  hashA: SnapshotHash,
  hashB: SnapshotHash
): HashComparison {
  return {
    snapshotIdA: hashA.snapshotId,
    snapshotIdB: hashB.snapshotId,
    hashA: hashA.hash,
    hashB: hashB.hash,
    match: hashA.hash === hashB.hash,
  };
}

export function formatHashResult(result: SnapshotHash): string {
  const lines: string[] = [
    `Snapshot Hash`,
    `  ID:        ${result.snapshotId}`,
    `  Algorithm: ${result.algorithm}`,
    `  Hash:      ${result.hash}`,
    `  Tools:     ${result.toolCount}`,
    `  Generated: ${result.timestamp}`,
  ];
  return lines.join('\n');
}

export function formatHashComparison(comparison: HashComparison): string {
  const status = comparison.match ? '✔ MATCH' : '✘ MISMATCH';
  const lines: string[] = [
    `Hash Comparison: ${status}`,
    `  Snapshot A: ${comparison.snapshotIdA}  →  ${comparison.hashA}`,
    `  Snapshot B: ${comparison.snapshotIdB}  →  ${comparison.hashB}`,
  ];
  return lines.join('\n');
}
