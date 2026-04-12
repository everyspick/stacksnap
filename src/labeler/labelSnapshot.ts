import fs from 'fs';
import { Label, LabelIndex, LabelResult, LabelColor } from './types';

export function loadLabelIndex(indexPath: string): LabelIndex {
  if (!fs.existsSync(indexPath)) return {};
  return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
}

export function saveLabelIndex(indexPath: string, index: LabelIndex): void {
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}

export function addLabel(
  indexPath: string,
  snapshotId: string,
  name: string,
  color: LabelColor = 'white',
  description?: string
): LabelResult {
  const index = loadLabelIndex(indexPath);
  if (!index[snapshotId]) index[snapshotId] = [];

  const existing = index[snapshotId].find((l) => l.name === name);
  if (existing) {
    existing.color = color;
    if (description !== undefined) existing.description = description;
    saveLabelIndex(indexPath, index);
    return { snapshotId, current: index[snapshotId] };
  }

  const label: Label = { name, color, description, createdAt: new Date().toISOString() };
  index[snapshotId].push(label);
  saveLabelIndex(indexPath, index);
  return { snapshotId, added: [label], current: index[snapshotId] };
}

export function removeLabel(indexPath: string, snapshotId: string, name: string): LabelResult {
  const index = loadLabelIndex(indexPath);
  const labels = index[snapshotId] ?? [];
  index[snapshotId] = labels.filter((l) => l.name !== name);
  saveLabelIndex(indexPath, index);
  return { snapshotId, removed: [name], current: index[snapshotId] };
}

export function getLabels(indexPath: string, snapshotId: string): Label[] {
  const index = loadLabelIndex(indexPath);
  return index[snapshotId] ?? [];
}

export function listLabeled(indexPath: string): string[] {
  const index = loadLabelIndex(indexPath);
  return Object.keys(index).filter((id) => index[id].length > 0);
}

export function filterByLabel(indexPath: string, labelName: string): string[] {
  const index = loadLabelIndex(indexPath);
  return Object.entries(index)
    .filter(([, labels]) => labels.some((l) => l.name === labelName))
    .map(([id]) => id);
}
