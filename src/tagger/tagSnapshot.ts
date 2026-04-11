import { Snapshot } from '../snapshot/snapshot';

export interface TaggedSnapshot extends Snapshot {
  tags: string[];
}

export function addTags(snapshot: Snapshot, tags: string[]): TaggedSnapshot {
  const normalized = tags
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  const unique = Array.from(new Set(normalized));

  return {
    ...snapshot,
    tags: unique,
  };
}

export function removeTags(snapshot: TaggedSnapshot, tags: string[]): TaggedSnapshot {
  const toRemove = new Set(tags.map((t) => t.trim().toLowerCase()));
  return {
    ...snapshot,
    tags: snapshot.tags.filter((t) => !toRemove.has(t)),
  };
}

export function filterByTag(snapshots: TaggedSnapshot[], tag: string): TaggedSnapshot[] {
  const normalized = tag.trim().toLowerCase();
  return snapshots.filter((s) => s.tags.includes(normalized));
}

export function formatTags(snapshot: TaggedSnapshot): string {
  if (!snapshot.tags || snapshot.tags.length === 0) {
    return 'Tags: (none)';
  }
  return `Tags: ${snapshot.tags.map((t) => `#${t}`).join('  ')}`;
}

export function hasTag(snapshot: TaggedSnapshot, tag: string): boolean {
  return snapshot.tags.includes(tag.trim().toLowerCase());
}
