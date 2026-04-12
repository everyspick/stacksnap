import fs from 'fs';
import { ToolPin, PinCheckResult, PinReport } from './types';
import { Snapshot } from '../snapshot/snapshot';

export function loadPins(filePath: string): ToolPin[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as ToolPin[];
}

export function savePins(filePath: string, pins: ToolPin[]): void {
  fs.writeFileSync(filePath, JSON.stringify(pins, null, 2), 'utf-8');
}

export function addPin(pins: ToolPin[], tool: string, version: string, note?: string): ToolPin[] {
  const existing = pins.findIndex(p => p.tool === tool);
  const pin: ToolPin = { tool, version, pinnedAt: new Date().toISOString(), note };
  if (existing >= 0) {
    const updated = [...pins];
    updated[existing] = pin;
    return updated;
  }
  return [...pins, pin];
}

export function removePin(pins: ToolPin[], tool: string): ToolPin[] {
  return pins.filter(p => p.tool !== tool);
}

export function checkPins(pins: ToolPin[], snapshot: Snapshot): PinReport {
  const results: PinCheckResult[] = pins.map(pin => {
    const entry = snapshot.tools.find(t => t.name === pin.tool);
    if (!entry) {
      return { tool: pin.tool, currentVersion: undefined, pinnedVersion: pin.version, status: 'missing' };
    }
    const status = entry.version === pin.version ? 'ok' : 'drift';
    return { tool: pin.tool, currentVersion: entry.version, pinnedVersion: pin.version, status };
  });

  return {
    checked: results.length,
    ok: results.filter(r => r.status === 'ok').length,
    drifted: results.filter(r => r.status === 'drift').length,
    missing: results.filter(r => r.status === 'missing').length,
    results,
  };
}
