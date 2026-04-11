import * as fs from 'fs';
import * as path from 'path';
import {
  saveTemplate,
  loadTemplate,
  listTemplates,
  deleteTemplate,
  applyTemplate,
  createTemplateFromSnapshot,
} from './templateManager';
import { SnapshotTemplate } from './types';
import { Snapshot } from '../snapshot/snapshot';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

const baseTemplate: SnapshotTemplate = {
  id: 'node-stack-123',
  name: 'Node Stack',
  description: 'A standard Node.js stack',
  tags: ['node', 'backend'],
  requiredTools: ['node', 'npm', 'git'],
  variables: [],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const makeSnapshot = (toolNames: string[]): Snapshot => ({
  id: 'snap-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  hostname: 'test-host',
  tools: toolNames.map((name) => ({ name, version: '1.0.0', path: '/usr/bin/' + name })),
  tags: [],
  metadata: {},
});

beforeEach(() => {
  jest.resetAllMocks();
  mockFs.existsSync.mockReturnValue(true);
});

test('saveTemplate writes JSON to correct path', () => {
  mockFs.writeFileSync.mockImplementation(() => {});
  saveTemplate(baseTemplate);
  expect(mockFs.writeFileSync).toHaveBeenCalledWith(
    expect.stringContaining('node-stack-123.json'),
    expect.stringContaining('Node Stack')
  );
});

test('loadTemplate returns null when file missing', () => {
  mockFs.existsSync.mockReturnValue(false);
  const result = loadTemplate('nonexistent');
  expect(result).toBeNull();
});

test('loadTemplate parses template from file', () => {
  mockFs.readFileSync.mockReturnValue(JSON.stringify(baseTemplate) as any);
  const result = loadTemplate('node-stack-123');
  expect(result).toEqual(baseTemplate);
});

test('listTemplates returns all templates in directory', () => {
  mockFs.readdirSync.mockReturnValue(['node-stack-123.json'] as any);
  mockFs.readFileSync.mockReturnValue(JSON.stringify(baseTemplate) as any);
  const templates = listTemplates();
  expect(templates).toHaveLength(1);
  expect(templates[0].id).toBe('node-stack-123');
});

test('deleteTemplate returns false when file does not exist', () => {
  mockFs.existsSync.mockReturnValue(false);
  expect(deleteTemplate('missing')).toBe(false);
});

test('deleteTemplate removes file and returns true', () => {
  mockFs.unlinkSync.mockImplementation(() => {});
  expect(deleteTemplate('node-stack-123')).toBe(true);
  expect(mockFs.unlinkSync).toHaveBeenCalled();
});

test('applyTemplate matches all required tools', () => {
  const snap = makeSnapshot(['node', 'npm', 'git']);
  const result = applyTemplate(baseTemplate, snap);
  expect(result.applied).toBe(true);
  expect(result.missing).toHaveLength(0);
  expect(result.matched).toEqual(['node', 'npm', 'git']);
});

test('applyTemplate reports missing tools', () => {
  const snap = makeSnapshot(['node']);
  const result = applyTemplate(baseTemplate, snap);
  expect(result.applied).toBe(false);
  expect(result.missing).toContain('npm');
  expect(result.missing).toContain('git');
});

test('createTemplateFromSnapshot builds template from snapshot', () => {
  const snap = makeSnapshot(['node', 'yarn']);
  const template = createTemplateFromSnapshot(snap, 'My Template', 'Test desc', ['test']);
  expect(template.requiredTools).toEqual(['node', 'yarn']);
  expect(template.name).toBe('My Template');
  expect(template.tags).toContain('test');
});
