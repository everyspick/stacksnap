import * as fs from 'fs';
import * as path from 'path';
import { runScheduledCheck, startScheduler } from './scheduleWatch';
import * as detectTools from '../detector/detectTools';
import * as snapshot from '../snapshot/snapshot';
import * as watcher from '../watcher/watchStack';

jest.mock('../detector/detectTools');
jest.mock('../snapshot/snapshot');
jest.mock('../watcher/watchStack');
jest.mock('fs');

const mockStack = [{ name: 'node', version: '18.0.0', path: '/usr/bin/node' }];
const mockSnapshot = { id: 'abc123', createdAt: '2024-01-01T00:00:00.000Z', tools: mockStack };

beforeEach(() => {
  jest.clearAllMocks();
  (detectTools.detectStack as jest.Mock).mockResolvedValue(mockStack);
  (snapshot.createSnapshot as jest.Mock).mockReturnValue(mockSnapshot);
  (snapshot.saveSnapshot as jest.Mock).mockImplementation(() => {});
  (snapshot.loadSnapshot as jest.Mock).mockReturnValue(mockSnapshot);
  (watcher.hasStackChanged as jest.Mock).mockReturnValue(false);
  (fs.existsSync as jest.Mock).mockReturnValue(false);
  (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
});

describe('runScheduledCheck', () => {
  it('saves snapshot and returns path when no previous snapshot exists', async () => {
    const result = await runScheduledCheck('/tmp/snapshots');
    expect(result).toMatch(/snapshot-.+\.json$/);
    expect(snapshot.saveSnapshot).toHaveBeenCalledTimes(2);
    expect(fs.mkdirSync).toHaveBeenCalledWith('/tmp/snapshots', { recursive: true });
  });

  it('returns null when stack has not changed', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (watcher.hasStackChanged as jest.Mock).mockReturnValue(false);
    const result = await runScheduledCheck('/tmp/snapshots');
    expect(result).toBeNull();
    expect(snapshot.saveSnapshot).not.toHaveBeenCalled();
  });

  it('saves snapshot when stack has changed', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (watcher.hasStackChanged as jest.Mock).mockReturnValue(true);
    const result = await runScheduledCheck('/tmp/snapshots');
    expect(result).not.toBeNull();
    expect(snapshot.saveSnapshot).toHaveBeenCalledTimes(2);
  });
});

describe('startScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a handle with stop and isRunning', () => {
    const handle = startScheduler({ intervalMs: 5000, outputDir: '/tmp/snapshots' });
    expect(handle.isRunning()).toBe(true);
    handle.stop();
    expect(handle.isRunning()).toBe(false);
  });

  it('calls onChanged when snapshot is saved', async () => {
    const onChanged = jest.fn();
    startScheduler({ intervalMs: 5000, outputDir: '/tmp/snapshots', onChanged });
    await Promise.resolve();
    jest.runAllTimers();
    await Promise.resolve();
    expect(onChanged).toHaveBeenCalled();
  });

  it('calls onError when detection fails', async () => {
    (detectTools.detectStack as jest.Mock).mockRejectedValue(new Error('fail'));
    const onError = jest.fn();
    startScheduler({ intervalMs: 5000, outputDir: '/tmp/snapshots', onError });
    await Promise.resolve();
    jest.runAllTimers();
    await Promise.resolve();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
