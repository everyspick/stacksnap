import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadPins, savePins, addPin, removePin, checkPins } from './pincerManager';
import { Snapshot } from '../snapshot/snapshot';

function makeTempFile(): string {
  return path.join(os.tmpdir(), `pincer-test-${Date.now()}.json`);
}

function makeSnapshot(tools: { name: string; version?: string }[]): Snapshot {
  return {
    id: 'test-snap',
    createdAt: new Date().toISOString(),
    tools: tools.map(t => ({ name: t.name, version: t.version, path: '/usr/bin/' + t.name })),
    meta: {},
  } as unknown as Snapshot;
}

describe('loadPins / savePins', () => {
  it('returns empty array when file does not exist', () => {
    expect(loadPins('/nonexistent/path.json')).toEqual([]);
  });

  it('round-trips pins to disk', () => {
    const file = makeTempFile();
    const pins = [{ tool: 'node', version: '20.0.0', pinnedAt: '2024-01-01T00:00:00.000Z' }];
    savePins(file, pins);
    expect(loadPins(file)).toEqual(pins);
    fs.unlinkSync(file);
  });
});

describe('addPin', () => {
  it('adds a new pin', () => {
    const result = addPin([], 'node', '20.0.0');
    expect(result).toHaveLength(1);
    expect(result[0].tool).toBe('node');
    expect(result[0].version).toBe('20.0.0');
  });

  it('updates an existing pin', () => {
    const initial = addPin([], 'node', '18.0.0');
    const updated = addPin(initial, 'node', '20.0.0', 'upgraded');
    expect(updated).toHaveLength(1);
    expect(updated[0].version).toBe('20.0.0');
    expect(updated[0].note).toBe('upgraded');
  });
});

describe('removePin', () => {
  it('removes a pin by tool name', () => {
    const pins = addPin([], 'node', '20.0.0');
    expect(removePin(pins, 'node')).toHaveLength(0);
  });

  it('is a no-op when tool not pinned', () => {
    const pins = addPin([], 'node', '20.0.0');
    expect(removePin(pins, 'python')).toHaveLength(1);
  });
});

describe('checkPins', () => {
  it('reports ok when version matches', () => {
    const pins = [{ tool: 'node', version: '20.0.0', pinnedAt: '' }];
    const snap = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const report = checkPins(pins, snap);
    expect(report.ok).toBe(1);
    expect(report.drifted).toBe(0);
    expect(report.missing).toBe(0);
  });

  it('reports drift when version differs', () => {
    const pins = [{ tool: 'node', version: '18.0.0', pinnedAt: '' }];
    const snap = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const report = checkPins(pins, snap);
    expect(report.drifted).toBe(1);
  });

  it('reports missing when tool absent from snapshot', () => {
    const pins = [{ tool: 'ruby', version: '3.2.0', pinnedAt: '' }];
    const snap = makeSnapshot([{ name: 'node', version: '20.0.0' }]);
    const report = checkPins(pins, snap);
    expect(report.missing).toBe(1);
  });
});
