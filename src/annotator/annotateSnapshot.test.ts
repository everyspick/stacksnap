import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  loadAnnotationIndex,
  saveAnnotationIndex,
  addAnnotation,
  removeAnnotation,
  getAnnotations,
} from './annotateSnapshot';

function makeTempFile(): string {
  return path.join(os.tmpdir(), `annotations-${Date.now()}-${Math.random()}.json`);
}

describe('annotateSnapshot', () => {
  it('returns empty index when file does not exist', () => {
    const index = loadAnnotationIndex('/nonexistent/path.json');
    expect(index).toEqual({});
  });

  it('saves and loads annotation index', () => {
    const file = makeTempFile();
    const index = { 'snap-1': { snapshotId: 'snap-1', annotations: {} } };
    saveAnnotationIndex(index, file);
    const loaded = loadAnnotationIndex(file);
    expect(loaded).toEqual(index);
    fs.unlinkSync(file);
  });

  it('adds a new annotation', () => {
    const file = makeTempFile();
    addAnnotation({ snapshotId: 'snap-1', key: 'env', value: 'production' }, file);
    const annotations = getAnnotations('snap-1', file);
    expect(annotations['env'].value).toBe('production');
    expect(annotations['env'].createdAt).toBeDefined();
    expect(annotations['env'].updatedAt).toBeUndefined();
    fs.unlinkSync(file);
  });

  it('updates an existing annotation and sets updatedAt', () => {
    const file = makeTempFile();
    addAnnotation({ snapshotId: 'snap-1', key: 'env', value: 'staging' }, file);
    addAnnotation({ snapshotId: 'snap-1', key: 'env', value: 'production' }, file);
    const annotations = getAnnotations('snap-1', file);
    expect(annotations['env'].value).toBe('production');
    expect(annotations['env'].updatedAt).toBeDefined();
    fs.unlinkSync(file);
  });

  it('removes an annotation', () => {
    const file = makeTempFile();
    addAnnotation({ snapshotId: 'snap-1', key: 'env', value: 'production' }, file);
    removeAnnotation({ snapshotId: 'snap-1', key: 'env' }, file);
    const annotations = getAnnotations('snap-1', file);
    expect(annotations['env']).toBeUndefined();
    fs.unlinkSync(file);
  });

  it('removes snapshot entry when last annotation is deleted', () => {
    const file = makeTempFile();
    addAnnotation({ snapshotId: 'snap-1', key: 'env', value: 'production' }, file);
    removeAnnotation({ snapshotId: 'snap-1', key: 'env' }, file);
    const index = loadAnnotationIndex(file);
    expect(index['snap-1']).toBeUndefined();
    fs.unlinkSync(file);
  });

  it('returns empty annotations for unknown snapshotId', () => {
    const file = makeTempFile();
    const annotations = getAnnotations('unknown', file);
    expect(annotations).toEqual({});
  });
});
