import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  createSnapshot,
  serializeSnapshot,
  saveSnapshot,
  loadSnapshot,
  Snapshot,
} from './snapshot';
import { StackInfo } from '../detector/types';

const mockStack: StackInfo[] = [
  { name: 'node', version: '20.11.0', found: true },
  { name: 'git', version: '2.44.0', found: true },
  { name: 'docker', version: undefined, found: false },
];

describe('createSnapshot', () => {
  it('should create a snapshot with correct fields', () => {
    const snapshot = createSnapshot(mockStack);
    expect(snapshot.version).toBe('1.0.0');
    expect(snapshot.stack).toEqual(mockStack);
    expect(snapshot.platform).toBe(os.platform());
    expect(snapshot.arch).toBe(os.arch());
    expect(snapshot.hostname).toBe(os.hostname());
    expect(new Date(snapshot.createdAt).toISOString()).toBe(snapshot.createdAt);
  });
});

describe('serializeSnapshot', () => {
  it('should return a valid JSON string', () => {
    const snapshot = createSnapshot(mockStack);
    const json = serializeSnapshot(snapshot);
    const parsed = JSON.parse(json) as Snapshot;
    expect(parsed.stack).toHaveLength(3);
    expect(parsed.version).toBe('1.0.0');
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  let tmpFile: string;

  afterEach(() => {
    if (tmpFile && fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  });

  it('should save and reload a snapshot correctly', () => {
    const snapshot = createSnapshot(mockStack);
    tmpFile = path.join(os.tmpdir(), `stacksnap-test-${Date.now()}.json`);
    const savedPath = saveSnapshot(snapshot, tmpFile);
    expect(fs.existsSync(savedPath)).toBe(true);
    const loaded = loadSnapshot(savedPath);
    expect(loaded.stack).toEqual(mockStack);
    expect(loaded.version).toBe('1.0.0');
  });

  it('should throw when loading a non-existent file', () => {
    expect(() => loadSnapshot('/tmp/does-not-exist.json')).toThrow(
      'Snapshot file not found'
    );
  });
});
