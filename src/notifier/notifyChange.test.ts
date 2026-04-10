import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildPayload, notifyChange } from './notifyChange';
import type { DiffResult } from '../differ/diffSnapshots';
import * as fs from 'fs';

const baseDiff: DiffResult = {
  added: [],
  removed: [],
  changed: [],
};

describe('buildPayload', () => {
  it('returns no-change message when diff is empty', () => {
    const payload = buildPayload(baseDiff);
    expect(payload.message).toBe('No changes detected in stack.');
    expect(payload.diff).toBe(baseDiff);
    expect(payload.timestamp).toBeTruthy();
  });

  it('includes added count in message', () => {
    const diff: DiffResult = { ...baseDiff, added: [{ name: 'node', version: '20.0.0' }] };
    const payload = buildPayload(diff);
    expect(payload.message).toContain('1 tool(s) added');
  });

  it('includes removed and changed counts', () => {
    const diff: DiffResult = {
      added: [],
      removed: [{ name: 'yarn', version: '1.22.0' }],
      changed: [{ name: 'npm', from: '9.0.0', to: '10.0.0' }],
    };
    const payload = buildPayload(diff);
    expect(payload.message).toContain('1 tool(s) removed');
    expect(payload.message).toContain('1 tool(s) changed');
  });
});

describe('notifyChange', () => {
  it('logs to console on console channel', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await notifyChange(baseDiff, { channel: 'console' });
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it('writes JSON file on file channel', async () => {
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    await notifyChange(baseDiff, { channel: 'file', outputPath: '/tmp/notify.json' });
    expect(writeSpy).toHaveBeenCalledWith(
      '/tmp/notify.json',
      expect.stringContaining('timestamp'),
      'utf-8'
    );
    writeSpy.mockRestore();
  });

  it('throws if file channel missing outputPath', async () => {
    await expect(notifyChange(baseDiff, { channel: 'file' })).rejects.toThrow('outputPath required');
  });

  it('throws if webhook channel missing webhookUrl', async () => {
    await expect(notifyChange(baseDiff, { channel: 'webhook' })).rejects.toThrow('webhookUrl required');
  });

  it('throws on unknown channel', async () => {
    await expect(
      notifyChange(baseDiff, { channel: 'unknown' as any })
    ).rejects.toThrow('Unknown notification channel');
  });
});
