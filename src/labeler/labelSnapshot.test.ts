import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  loadLabelIndex,
  saveLabelIndex,
  addLabel,
  removeLabel,
  getLabels,
  listLabeled,
  filterByLabel,
} from './labelSnapshot';

function makeTempFile(): string {
  return path.join(os.tmpdir(), `label-index-${Date.now()}.json`);
}

describe('labelSnapshot', () => {
  let indexPath: string;

  beforeEach(() => {
    indexPath = makeTempFile();
  });

  afterEach(() => {
    if (fs.existsSync(indexPath)) fs.unlinkSync(indexPath);
  });

  test('loadLabelIndex returns empty object when file missing', () => {
    expect(loadLabelIndex(indexPath)).toEqual({});
  });

  test('saveLabelIndex and loadLabelIndex round-trip', () => {
    const index = { snap1: [{ name: 'stable', color: 'green' as const, createdAt: '2024-01-01' }] };
    saveLabelIndex(indexPath, index);
    expect(loadLabelIndex(indexPath)).toEqual(index);
  });

  test('addLabel creates a new label', () => {
    const result = addLabel(indexPath, 'snap1', 'stable', 'green', 'Production ready');
    expect(result.added).toHaveLength(1);
    expect(result.added![0].name).toBe('stable');
    expect(result.current).toHaveLength(1);
  });

  test('addLabel updates existing label color', () => {
    addLabel(indexPath, 'snap1', 'stable', 'green');
    const result = addLabel(indexPath, 'snap1', 'stable', 'blue');
    expect(result.added).toBeUndefined();
    expect(result.current[0].color).toBe('blue');
  });

  test('removeLabel removes the label', () => {
    addLabel(indexPath, 'snap1', 'stable', 'green');
    const result = removeLabel(indexPath, 'snap1', 'stable');
    expect(result.removed).toContain('stable');
    expect(result.current).toHaveLength(0);
  });

  test('getLabels returns labels for snapshot', () => {
    addLabel(indexPath, 'snap1', 'beta', 'yellow');
    const labels = getLabels(indexPath, 'snap1');
    expect(labels).toHaveLength(1);
    expect(labels[0].name).toBe('beta');
  });

  test('listLabeled returns snapshot ids with labels', () => {
    addLabel(indexPath, 'snap1', 'stable', 'green');
    addLabel(indexPath, 'snap2', 'draft', 'red');
    const ids = listLabeled(indexPath);
    expect(ids).toContain('snap1');
    expect(ids).toContain('snap2');
  });

  test('filterByLabel returns snapshots with matching label', () => {
    addLabel(indexPath, 'snap1', 'stable', 'green');
    addLabel(indexPath, 'snap2', 'draft', 'red');
    addLabel(indexPath, 'snap3', 'stable', 'green');
    const ids = filterByLabel(indexPath, 'stable');
    expect(ids).toContain('snap1');
    expect(ids).toContain('snap3');
    expect(ids).not.toContain('snap2');
  });
});
