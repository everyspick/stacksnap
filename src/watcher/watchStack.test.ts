import { hasStackChanged, startWatching, WatchOptions } from './watchStack';
import { StackSnapshot } from '../snapshot/snapshot';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function makeSnapshot(tools: Record<string, { version: string; path: string }>): StackSnapshot {
  return {
    id: 'test-id',
    timestamp: new Date().toISOString(),
    hostname: 'test-host',
    platform: 'linux',
    tools,
  };
}

describe('hasStackChanged', () => {
  it('returns false when snapshots have identical tools', () => {
    const a = makeSnapshot({ node: { version: '18.0.0', path: '/usr/bin/node' } });
    const b = makeSnapshot({ node: { version: '18.0.0', path: '/usr/bin/node' } });
    expect(hasStackChanged(a, b)).toBe(false);
  });

  it('returns true when a tool version changes', () => {
    const a = makeSnapshot({ node: { version: '18.0.0', path: '/usr/bin/node' } });
    const b = makeSnapshot({ node: { version: '20.0.0', path: '/usr/bin/node' } });
    expect(hasStackChanged(a, b)).toBe(true);
  });

  it('returns true when a tool is added', () => {
    const a = makeSnapshot({ node: { version: '18.0.0', path: '/usr/bin/node' } });
    const b = makeSnapshot({
      node: { version: '18.0.0', path: '/usr/bin/node' },
      git: { version: '2.40.0', path: '/usr/bin/git' },
    });
    expect(hasStackChanged(a, b)).toBe(true);
  });

  it('returns true when a tool is removed', () => {
    const a = makeSnapshot({
      node: { version: '18.0.0', path: '/usr/bin/node' },
      git: { version: '2.40.0', path: '/usr/bin/git' },
    });
    const b = makeSnapshot({ node: { version: '18.0.0', path: '/usr/bin/node' } });
    expect(hasStackChanged(a, b)).toBe(true);
  });

  it('returns false for empty tool sets', () => {
    const a = makeSnapshot({});
    const b = makeSnapshot({});
    expect(hasStackChanged(a, b)).toBe(false);
  });
});

describe('startWatching', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-watch-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns a handle with stop and isRunning', async () => {
    const options: WatchOptions = { interval: 60000, outputDir: tmpDir };
    const handle = await startWatching(options);
    expect(handle.isRunning()).toBe(true);
    handle.stop();
    expect(handle.isRunning()).toBe(false);
  });

  it('creates outputDir if it does not exist', async () => {
    const newDir = path.join(tmpDir, 'nested', 'watch');
    const options: WatchOptions = { interval: 60000, outputDir: newDir };
    const handle = await startWatching(options);
    expect(fs.existsSync(newDir)).toBe(true);
    handle.stop();
  });
});
