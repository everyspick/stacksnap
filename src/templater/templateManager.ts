import * as fs from 'fs';
import * as path from 'path';
import { SnapshotTemplate, ApplyTemplateResult } from './types';
import { Snapshot } from '../snapshot/snapshot';

const TEMPLATES_DIR = path.join(process.cwd(), '.stacksnap', 'templates');

export function ensureTemplatesDir(): void {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }
}

export function saveTemplate(template: SnapshotTemplate): void {
  ensureTemplatesDir();
  const filePath = path.join(TEMPLATES_DIR, `${template.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
}

export function loadTemplate(id: string): SnapshotTemplate | null {
  const filePath = path.join(TEMPLATES_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SnapshotTemplate;
}

export function listTemplates(): SnapshotTemplate[] {
  ensureTemplatesDir();
  return fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, f), 'utf-8')) as SnapshotTemplate);
}

export function deleteTemplate(id: string): boolean {
  const filePath = path.join(TEMPLATES_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function applyTemplate(
  template: SnapshotTemplate,
  snapshot: Snapshot
): ApplyTemplateResult {
  const snapshotToolNames = snapshot.tools.map((t) => t.name.toLowerCase());
  const matched: string[] = [];
  const missing: string[] = [];

  for (const required of template.requiredTools) {
    if (snapshotToolNames.includes(required.toLowerCase())) {
      matched.push(required);
    } else {
      missing.push(required);
    }
  }

  return {
    matched,
    missing,
    applied: missing.length === 0,
  };
}

export function createTemplateFromSnapshot(
  snapshot: Snapshot,
  name: string,
  description: string,
  tags: string[] = []
): SnapshotTemplate {
  const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  return {
    id,
    name,
    description,
    tags,
    requiredTools: snapshot.tools.map((t) => t.name),
    variables: [],
    createdAt: new Date().toISOString(),
  };
}
