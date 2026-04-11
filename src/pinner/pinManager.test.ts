import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  loadPinIndex,
  savePinIndex,
  pinTool,
  unpinTool,
  listPins,
  checkPinViolations,
} from './pinManager';
import { formatPinTable, formatViolations } from './formatPin';

function makeTempFile(): string {
  return path.join(os.tmpdir(), `pins-test-${Date.now()}.json`);
}

const baseSnapshot: any = {
  id: 'snap-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  tools: [
    { name: 'node', version: '20.0.0' },
    { name: 'npm', version: '10.0.0' },
  ],
};

describe('loadPinIndex', () => {
  it('returns empty index when file does not exist', () => {
    const index = loadPinIndex('/nonexistent/path.json');
    expect(index.pins).toEqual({});
  });
});

describe('pinTool / unpinTool', () => {
  it('pins a tool and persists it', () => {
    const tmp = makeTempFile();
    const result = pinTool('node', '20.0.0', baseSnapshot, tmp);
    expect(result.success).toBe(true);
    const pins = listPins(tmp);
    expect(pins).toHaveLength(1);
    expect(pins[0].name).toBe('node');
    expect(pins[0].pinnedVersion).toBe('20.0.0');
    expect(pins[0].detectedVersion).toBe('20.0.0');
    fs.unlinkSync(tmp);
  });

  it('pins a tool with a note', () => {
    const tmp = makeTempFile();
    pinTool('npm', '10.0.0', baseSnapshot, tmp, 'LTS version');
    const pins = listPins(tmp);
    expect(pins[0].note).toBe('LTS version');
    fs.unlinkSync(tmp);
  });

  it('unpins an existing tool', () => {
    const tmp = makeTempFile();
    pinTool('node', '20.0.0', baseSnapshot, tmp);
    const result = unpinTool('node', tmp);
    expect(result.success).toBe(true);
    expect(listPins(tmp)).toHaveLength(0);
    fs.unlinkSync(tmp);
  });

  it('returns failure when unpinning non-existent tool', () => {
    const tmp = makeTempFile();
    const result = unpinTool('python', tmp);
    expect(result.success).toBe(false);
  });
});

describe('checkPinViolations', () => {
  it('detects no violations when versions match', () => {
    const tmp = makeTempFile();
    pinTool('node', '20.0.0', baseSnapshot, tmp);
    const violations = checkPinViolations(baseSnapshot, tmp);
    expect(violations).toHaveLength(0);
    fs.unlinkSync(tmp);
  });

  it('detects violations when versions differ', () => {
    const tmp = makeTempFile();
    pinTool('node', '18.0.0', baseSnapshot, tmp);
    const violations = checkPinViolations(baseSnapshot, tmp);
    expect(violations).toHaveLength(1);
    expect(violations[0].expected).toBe('18.0.0');
    expect(violations[0].actual).toBe('20.0.0');
    fs.unlinkSync(tmp);
  });
});

describe('formatPinTable', () => {
  it('returns no-pins message for empty list', () => {
    expect(formatPinTable([])).toBe('No pinned tools.');
  });

  it('renders a table with pins', () => {
    const tmp = makeTempFile();
    pinTool('node', '20.0.0', baseSnapshot, tmp);
    const pins = listPins(tmp);
    const table = formatPinTable(pins);
    expect(table).toContain('node');
    expect(table).toContain('20.0.0');
    fs.unlinkSync(tmp);
  });
});

describe('formatViolations', () => {
  it('returns ok message when no violations', () => {
    expect(formatViolations([])).toContain('match');
  });

  it('formats violations correctly', () => {
    const result = formatViolations([{ tool: 'node', expected: '18.0.0', actual: '20.0.0' }]);
    expect(result).toContain('node');
    expect(result).toContain('18.0.0');
    expect(result).toContain('20.0.0');
  });
});
