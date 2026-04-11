import * as fs from 'fs';
import * as path from 'path';
import { PinIndex, PinnedTool, PinResult, UnpinResult } from './types';
import { StackSnapshot } from '../snapshot/snapshot';

const DEFAULT_PIN_FILE = '.stacksnap-pins.json';

export function loadPinIndex(pinFile: string = DEFAULT_PIN_FILE): PinIndex {
  if (!fs.existsSync(pinFile)) {
    return { pins: {}, updatedAt: new Date().toISOString() };
  }
  const raw = fs.readFileSync(pinFile, 'utf-8');
  return JSON.parse(raw) as PinIndex;
}

export function savePinIndex(index: PinIndex, pinFile: string = DEFAULT_PIN_FILE): void {
  index.updatedAt = new Date().toISOString();
  fs.writeFileSync(pinFile, JSON.stringify(index, null, 2), 'utf-8');
}

export function pinTool(
  toolName: string,
  version: string,
  snapshot: StackSnapshot,
  pinFile: string = DEFAULT_PIN_FILE,
  note?: string
): PinResult {
  const index = loadPinIndex(pinFile);
  const detected = snapshot.tools.find(t => t.name === toolName);
  const detectedVersion = detected?.version ?? null;

  const pin: PinnedTool = {
    name: toolName,
    pinnedVersion: version,
    detectedVersion,
    pinnedAt: new Date().toISOString(),
    ...(note ? { note } : {}),
  };

  index.pins[toolName] = pin;
  savePinIndex(index, pinFile);

  return { tool: toolName, success: true, message: `Pinned ${toolName} to version ${version}` };
}

export function unpinTool(toolName: string, pinFile: string = DEFAULT_PIN_FILE): UnpinResult {
  const index = loadPinIndex(pinFile);
  if (!index.pins[toolName]) {
    return { tool: toolName, success: false, message: `Tool "${toolName}" is not pinned` };
  }
  delete index.pins[toolName];
  savePinIndex(index, pinFile);
  return { tool: toolName, success: true, message: `Unpinned ${toolName}` };
}

export function listPins(pinFile: string = DEFAULT_PIN_FILE): PinnedTool[] {
  const index = loadPinIndex(pinFile);
  return Object.values(index.pins);
}

export function checkPinViolations(
  snapshot: StackSnapshot,
  pinFile: string = DEFAULT_PIN_FILE
): { tool: string; expected: string; actual: string | null }[] {
  const pins = listPins(pinFile);
  const violations: { tool: string; expected: string; actual: string | null }[] = [];
  for (const pin of pins) {
    const detected = snapshot.tools.find(t => t.name === pin.name);
    const actual = detected?.version ?? null;
    if (actual !== pin.pinnedVersion) {
      violations.push({ tool: pin.name, expected: pin.pinnedVersion, actual });
    }
  }
  return violations;
}
