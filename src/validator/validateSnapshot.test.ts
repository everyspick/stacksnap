import { validateSnapshot, formatValidationResult } from './validateSnapshot';
import { Snapshot } from '../snapshot/snapshot';

const validSnapshot: Snapshot = {
  timestamp: '2024-01-15T10:00:00.000Z',
  hostname: 'dev-machine',
  platform: 'linux',
  tools: [
    { name: 'node', present: true, version: '20.11.0', path: '/usr/bin/node' },
    { name: 'git', present: true, version: '2.43.0', path: '/usr/bin/git' },
  ],
};

describe('validateSnapshot', () => {
  it('returns valid for a well-formed snapshot', () => {
    const result = validateSnapshot(validSnapshot);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('returns error when timestamp is missing', () => {
    const snap = { ...validSnapshot, timestamp: '' };
    const result = validateSnapshot(snap);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('has-timestamp'))).toBe(true);
  });

  it('returns error when hostname is missing', () => {
    const snap = { ...validSnapshot, hostname: '' };
    const result = validateSnapshot(snap);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('has-hostname'))).toBe(true);
  });

  it('returns warning when tools array is empty', () => {
    const snap = { ...validSnapshot, tools: [] };
    const result = validateSnapshot(snap);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('has-tools'))).toBe(true);
  });

  it('returns warning when a tool has unknown version', () => {
    const snap = {
      ...validSnapshot,
      tools: [{ name: 'node', present: true, version: 'unknown', path: '/usr/bin/node' }],
    };
    const result = validateSnapshot(snap);
    expect(result.warnings.some((w) => w.includes('tools-have-versions'))).toBe(true);
  });

  it('returns warning when a tool is not present', () => {
    const snap = {
      ...validSnapshot,
      tools: [{ name: 'deno', present: false, version: undefined, path: undefined }],
    };
    const result = validateSnapshot(snap);
    expect(result.warnings.some((w) => w.includes('tools-are-present'))).toBe(true);
  });
});

describe('formatValidationResult', () => {
  it('shows success message for valid snapshot', () => {
    const result = validateSnapshot(validSnapshot);
    const output = formatValidationResult(result);
    expect(output).toContain('✅ Snapshot is valid');
  });

  it('shows failure message and errors for invalid snapshot', () => {
    const snap = { ...validSnapshot, timestamp: '', hostname: '' };
    const result = validateSnapshot(snap);
    const output = formatValidationResult(result);
    expect(output).toContain('❌ Snapshot validation failed');
    expect(output).toContain('Errors:');
  });

  it('shows warnings section when warnings exist', () => {
    const snap = { ...validSnapshot, tools: [] };
    const result = validateSnapshot(snap);
    const output = formatValidationResult(result);
    expect(output).toContain('Warnings:');
  });
});
