import fs from 'fs';
import path from 'path';
import { Annotation, AnnotationIndex, AnnotateOptions, RemoveAnnotationOptions } from './types';

const DEFAULT_ANNOTATIONS_FILE = '.stacksnap/annotations.json';

export function loadAnnotationIndex(filePath = DEFAULT_ANNOTATIONS_FILE): AnnotationIndex {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveAnnotationIndex(index: AnnotationIndex, filePath = DEFAULT_ANNOTATIONS_FILE): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(index, null, 2), 'utf-8');
}

export function addAnnotation(
  opts: AnnotateOptions,
  filePath = DEFAULT_ANNOTATIONS_FILE
): AnnotationIndex {
  const index = loadAnnotationIndex(filePath);
  const now = new Date().toISOString();
  if (!index[opts.snapshotId]) {
    index[opts.snapshotId] = { snapshotId: opts.snapshotId, annotations: {} };
  }
  const existing = index[opts.snapshotId].annotations[opts.key];
  const annotation: Annotation = {
    key: opts.key,
    value: opts.value,
    createdAt: existing?.createdAt ?? now,
    updatedAt: existing ? now : undefined,
  };
  index[opts.snapshotId].annotations[opts.key] = annotation;
  saveAnnotationIndex(index, filePath);
  return index;
}

export function removeAnnotation(
  opts: RemoveAnnotationOptions,
  filePath = DEFAULT_ANNOTATIONS_FILE
): AnnotationIndex {
  const index = loadAnnotationIndex(filePath);
  if (index[opts.snapshotId]) {
    delete index[opts.snapshotId].annotations[opts.key];
    if (Object.keys(index[opts.snapshotId].annotations).length === 0) {
      delete index[opts.snapshotId];
    }
  }
  saveAnnotationIndex(index, filePath);
  return index;
}

export function getAnnotations(
  snapshotId: string,
  filePath = DEFAULT_ANNOTATIONS_FILE
): Record<string, Annotation> {
  const index = loadAnnotationIndex(filePath);
  return index[snapshotId]?.annotations ?? {};
}
